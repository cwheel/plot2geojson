import { type Position } from '../../parser/util/station.js';

const calculateCentroid = (points: Position[]): Position => {
    const sum = points.reduce(
        (acc, { northing, easting }) => {
            acc.northing += northing;
            acc.easting += easting;

            return acc;
        },
        { northing: 0, easting: 0 }
    );

    return {
        northing: sum.northing / points.length,
        easting: sum.easting / points.length,
    };
};

function sortPolygonPoints(points: Position[]): Position[] {
    const centroid = calculateCentroid(points);

    return points.sort((a, b) => {
        const angleA = Math.atan2(
            a.northing - centroid.northing,
            a.easting - centroid.easting
        );
        const angleB = Math.atan2(
            b.northing - centroid.northing,
            b.easting - centroid.easting
        );

        return angleA - angleB;
    });
}

export { sortPolygonPoints };
