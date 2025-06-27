import { type Station, type Position } from '../parser/util/station.js';
import { type Plot } from '../parser/parser.js';
import { multiplyMatrices } from './util/matrix.js';
import { metersToFeet } from './util/constants.js';
import { sortPolygonPoints } from './util/geometry.js';

type PolygonProperties = {
    name: string;
    elevation: number;
    penetration: number;
    comment: string;
    likelyEntrance: boolean;
    flags: {
        ExcludeClosure: boolean;
        ExcludeLength: boolean;
        Splay: boolean;
    };
};

type RenderOptions = {
    pretty?: boolean;
    line?: boolean;
};

type PlotMetadata = {
    boundingBox: {
        min?: LatLngPoint;
        max?: LatLngPoint;
        approximateArea?: number;
    };
};

type LatLngPoint = [number, number];

const geojsonFromPlot = (
    plot: Plot,
    options: RenderOptions = {
        pretty: false,
        line: false,
    }
): GeoJSON.FeatureCollection & { metadata: PlotMetadata } => {
    let features: GeoJSON.Feature<GeoJSON.Polygon, PolygonProperties>[] = [];

    plot.stations.forEach((rootStation: Station) => {
        let lastAzimuth = null;

        const minSurveyDepth =
            plot.bounds[rootStation.name]?.minDepth ?? Number.MAX_SAFE_INTEGER;

        for (let i = 0; i < rootStation.stations.length; i++) {
            const station = rootStation.stations[i];

            // Skip stations that are excluded from plotting
            if (station.flags.ExcludePlotting || station.flags.TotalExclusion) {
                continue;
            }

            // One station before this one
            const lastStation =
                i === 0 ? rootStation : rootStation.stations[i - 1];

            // Next station after this one
            const nextStation =
                i + 1 < rootStation.stations.length - 1
                    ? rootStation.stations[i + 1]
                    : null;

            // Compass handles the last station of a survey diffirently
            const terminal = rootStation.stations.length - 1 === i;

            const { polygon, azimuth } = polygonBetweenStations(
                lastStation,
                station,
                nextStation,
                lastAzimuth,
                plot,
                terminal,
                options
            );

            lastAzimuth = azimuth;

            features.push({
                type: 'Feature',
                geometry: {
                    type: 'Polygon',
                    coordinates: [polygon],
                },
                properties: {
                    name: station.name,
                    elevation: station.elevation,
                    penetration: station.penetration,
                    comment: station.comment,
                    // This is approxiomate at best, I don't think that the survey bounding box Compass emits always properly
                    // captures when we're at the surface. This should be close enough for our needs, but isn't totally reliable.
                    // It turns out that determining what station is an entrace is actually pretty tricky.
                    likelyEntrance: i === 0 && minSurveyDepth >= 0,
                    flags: {
                        ExcludeClosure: station.flags.ExcludeClosure,
                        ExcludeLength: station.flags.ExcludeLength,
                        Splay: station.flags.Splay,
                    },
                },
            });
        }
    });

    const bounds = globalBoundingBox(plot);

    const lines: GeoJSON.Feature<GeoJSON.LineString>[] = plot.stations.map(
        (root) => ({
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: lineForSurvey(root, plot),
            },
            properties: {},
        })
    );

    return {
        type: 'FeatureCollection',
        features: [...features, ...(options.line ? lines : [])],
        metadata: {
            boundingBox: bounds,
        },
    };
};

const utmToLatLng = (
    easting: number,
    northing: number,
    plot: Plot
): LatLngPoint => {
    const unit = plot.units === 'feet' ? metersToFeet : 1;
    const hemisphere = plot.utmZone > 0 && plot.utmZone <= 60 ? 'N' : 'S';

    const latlng = plot.datum.converter.convertUtmToLatLng(
        easting / unit,
        northing / unit,
        plot.utmZone,
        hemisphere
    );

    // @ts-expect-error: Once again, the types for utm-latlng are seemingly wrong
    return [latlng.lng, latlng.lat];
};

const translationVector = (azimuth: number, distance: number): Position => {
    // Standard rotation matrix for a given angle (the segment azimuth)
    // https://en.wikipedia.org/wiki/Rotation_matrix
    const rotationVector = [
        [Math.cos(azimuth), -Math.sin(azimuth)],
        [Math.sin(azimuth), Math.cos(azimuth)],
    ];

    const distanceVector = [[0], [distance]];

    const translation = multiplyMatrices(rotationVector, distanceVector);

    return {
        easting: translation[0][0],
        northing: translation[1][0],
    };
};

const translateDirection = (
    angle: number,
    station: Station,
    distance: number
): Position => {
    const translation = translationVector(angle, distance);

    const translatedEasting = station.position.easting + translation.easting;
    const translatedNorthing = station.position.northing + translation.northing;

    return { northing: translatedNorthing, easting: translatedEasting };
};

// Compass very rarely puts in negative values for tunnel dimensions
// This shows up in the survey editor as "Pass.", but still renders.
// This seems to match what the Plot Viewer does, but might be wrong.
const translateBy = (amount: number) => Math.abs(amount);

const polygonBetweenStations = (
    lastStation: Station,
    station: Station,
    nextStation: Station,
    lastAzimuth: number | null,
    plot: Plot,
    terminal: boolean,
    options: RenderOptions
): { polygon: number[][]; azimuth: number } => {
    // Mirror Compass's behavior of using the last station's tunnel dimensions if
    // the station we're at is the last in the survey (i.e the terminal station)
    let currentStation = station;
    if (terminal) {
        currentStation = lastStation;
    }

    let azimuth = Math.atan2(
        station.position.northing - lastStation.position.northing,
        station.position.easting - lastStation.position.easting
    );

    if (options.pretty && nextStation) {
        // Calculate the azimuth to the next station
        const nextAzimuth = Math.atan2(
            nextStation.position.northing - station.position.northing,
            nextStation.position.easting - station.position.easting
        );

        // Average the azimuths between the last and next segments
        azimuth = (azimuth + nextAzimuth) / 2;
    }

    // If we're in pretty mode, plot the first two points with the last azimuth
    const startingAzimuth = options.pretty ? lastAzimuth || azimuth : azimuth;

    // If we're in pretty mode, always render the walls as at least 1 unit away from the station
    // so they don't show up as lines on the map.
    const lastLeft = options.pretty
        ? Math.max(lastStation.walls.left, 1)
        : lastStation.walls.left;
    const lastRight = options.pretty
        ? Math.max(lastStation.walls.right, 1)
        : lastStation.walls.right;
    const currentLeft = options.pretty
        ? Math.max(currentStation.walls.left, 1)
        : currentStation.walls.left;
    const currentRight = options.pretty
        ? Math.max(currentStation.walls.right, 1)
        : currentStation.walls.right;

    const firstPoint = translateDirection(
        startingAzimuth,
        lastStation,
        -translateBy(lastRight)
    );

    const secondPoint = translateDirection(
        startingAzimuth,
        lastStation,
        translateBy(lastLeft)
    );

    const thirdPoint = translateDirection(
        azimuth,
        station,
        translateBy(currentLeft)
    );

    const fourthPoint = translateDirection(
        azimuth,
        station,
        -translateBy(currentRight)
    );

    const sortedPoints = sortPolygonPoints([
        firstPoint,
        secondPoint,
        thirdPoint,
        fourthPoint,
    ]).map((point) => utmToLatLng(point.easting, point.northing, plot));

    return {
        polygon: [
            ...sortedPoints,
            // Close the polygon
            sortedPoints[0],
        ],
        azimuth,
    };
};

const lineForSurvey = (root: Station, plot: Plot) => {
    // Root itself is a station, include it so the line originates from it
    return [root, ...root.stations].map((station) =>
        utmToLatLng(station.position.easting, station.position.northing, plot)
    );
};

const globalBoundingBox = (
    plot: Plot
): { min?: LatLngPoint; max?: LatLngPoint; approximateArea?: number } => {
    if (!plot.bounds) {
        return {};
    }

    let northingMin = Number.POSITIVE_INFINITY;
    let northingMax = Number.NEGATIVE_INFINITY;
    let eastingMin = Number.POSITIVE_INFINITY;
    let eastingMax = Number.NEGATIVE_INFINITY;

    Object.values(plot.bounds).forEach((boundingBox) => {
        northingMin = Math.min(northingMin, boundingBox.northingMin);
        northingMax = Math.max(northingMax, boundingBox.northingMax);
        eastingMin = Math.min(eastingMin, boundingBox.eastingMin);
        eastingMax = Math.max(eastingMax, boundingBox.eastingMax);
    });

    // This is the "approximate" area because we're on a sphere. That being said,
    // the majority of caves are small enough that this is a good enough approximation.
    const boundsWidth = eastingMax - eastingMin;
    const boundsHeight = northingMax - northingMin;

    return {
        min: utmToLatLng(eastingMin, northingMin, plot),
        max: utmToLatLng(eastingMax, northingMax, plot),
        approximateArea: boundsWidth * boundsHeight,
    };
};

export default geojsonFromPlot;
export type { RenderOptions, PlotMetadata, PolygonProperties };
