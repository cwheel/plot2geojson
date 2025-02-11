import { multiplyMatrices } from './util/matrix.js';

const geojsonFromPlot = (plot) => {
    let polygons = [];

    plot.stations.forEach((rootStation) => {
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
                    depth: station.depth,
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

const translationVector = (angle, distance) => {
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

const translateDirection = (plot, angle, station, distance) => {
    const translation = translationVector(angle, distance);

    const translatedEasting = station.position.easting + translation.easting;
    const translatedNorthing = station.position.northing + translation.northing;

    const latlng = plot.datum.converter.convertUtmToLatLng(
        parseFloat(translatedEasting / 3.28084),
        parseFloat(translatedNorthing / 3.28084),
        plot.utmZone,
        'R' // UTM zone letter, this maybe needs to be dynamic?
    );

    return [latlng.lng, latlng.lat];
};

// Compass very rarely puts in negative values for tunnel dimensions
// This shows up in the survey editor as "Pass.", but still renders.
// This seems to match what the Plot Viewer does, but might be wrong.
const translateBy = (num) => Math.abs(num);

const polygonBetweenStations = (lastStation, station, plot, terminal) => {
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
        -translateBy(lastStation.tunnel.right)
    );

    const secondPoint = translateDirection(
        plot,
        azimuth,
        lastStation,
        translateBy(lastStation.tunnel.left)
    );

    const thirdPoint = translateDirection(
        plot,
        azimuth,
        station,
        translateBy(currentStation.tunnel.left)
    );

    const fourthPoint = translateDirection(
        plot,
        azimuth,
        station,
        -translateBy(currentStation.tunnel.right)
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
