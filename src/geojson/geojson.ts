import { type Station, type Position } from '../parser/util/station.js';
import { type Plot } from '../parser/parser.js';
import { multiplyMatrices } from './util/matrix.js';
import { metersToFeet } from './util/constants.js';

type Polygon = {
    type: string;
    coordinates: number[][][];
    properties: {
        name: string;
        elevation: number;
        penetration: number;
        comment: string;
    };
};

const geojsonFromPlot = (plot: Plot) => {
    let polygons: Polygon[] = [];

    plot.stations.filter(
        // If the station is excluded from plotting, skip it
        station => !station.flags.ExcludePlotting && !station.flags.TotalExclusion
    ).forEach((rootStation: Station) => {
        for (let i = 0; i < rootStation.stations.length; i++) {
            const station = rootStation.stations[i];

            // One station before this one
            const lastStation =
                i === 0 ? rootStation : rootStation.stations[i - 1];

            // Compass handles the last station of a survey diffirently
            const terminal = rootStation.stations.length - 1 === i;

            polygons.push({
                type: 'Polygon',
                coordinates: [
                    polygonBetweenStations(
                        lastStation,
                        station,
                        plot,
                        terminal
                    ),
                ],
                properties: {
                    name: station.name,
                    elevation: station.elevation,
                    penetration: station.penetration,
                    comment: station.comment,
                },
            });
        }
    });

    return {
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                geometry: {
                    type: 'GeometryCollection',
                    geometries: polygons,
                },
                properties: {},
            },
        ],
    };
};

const translationVector = (angle: number, distance: number): Position => {
    const rotationVector = [
        [Math.cos(angle), -Math.sin(angle)],
        [Math.sin(angle), Math.cos(angle)],
    ];

    const distanceVector = [[0], [distance]];

    const translation = multiplyMatrices(rotationVector, distanceVector);

    return {
        easting: translation[0][0],
        northing: translation[1][0],
    };
};

const translateDirection = (plot: Plot, angle: number, station: Station, distance: number) => {
    const translation = translationVector(angle, distance);

    const translatedEasting = station.position.easting + translation.easting;
    const translatedNorthing = station.position.northing + translation.northing;

    const latlng = plot.datum.converter.convertUtmToLatLng(
        translatedEasting / metersToFeet,
        translatedNorthing / metersToFeet,
        plot.utmZone,
        'R' // UTM zone letter, this maybe needs to be dynamic?
    );

    // @ts-ignore: Once again, the types for utm-latlng are seemingly wrong
    return [latlng.lng, latlng.lat];
};

// Compass very rarely puts in negative values for tunnel dimensions
// This shows up in the survey editor as "Pass.", but still renders.
// This seems to match what the Plot Viewer does, but might be wrong.
const translateBy = (amount: number) => Math.abs(amount);

const polygonBetweenStations = (lastStation: Station, station: Station, plot: Plot, terminal: boolean) => {
    // Mirror Compass's behavior of using the last station's tunnel dimensions if
    // the station we're at is the last in the survey (i.e the terminal station)
    let currentStation = station;
    if (terminal) {
        currentStation = lastStation;
    }

    const azimuth = Math.atan2(
        station.position.northing - lastStation.position.northing,
        station.position.easting - lastStation.position.easting
    );

    const firstPoint = translateDirection(
        plot,
        azimuth,
        lastStation,
        -translateBy(lastStation.walls.right)
    );

    const secondPoint = translateDirection(
        plot,
        azimuth,
        lastStation,
        translateBy(lastStation.walls.left)
    );

    const thirdPoint = translateDirection(
        plot,
        azimuth,
        station,
        translateBy(currentStation.walls.left)
    );

    const fourthPoint = translateDirection(
        plot,
        azimuth,
        station,
        -translateBy(currentStation.walls.right)
    );

    return [
        firstPoint,
        secondPoint,
        thirdPoint,
        fourthPoint,
        // Repeated to close the polygon
        firstPoint,
    ];
};

export default geojsonFromPlot;
