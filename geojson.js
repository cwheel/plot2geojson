const geojsonFromPlot = (plot) => {
    let polygons = [];
    plot.stations.forEach((rootStation) => {
        polygons = polygons.concat(
            rootStation.stations.map((station) => ({
                type: 'Polygon',
                coordinates: [
                    [
                        [station.position.lng, station.position.lat],
                        [station.position.lng, station.position.lat],
                        [rootStation.position.lng, rootStation.position.lat],
                        [station.position.lng, station.position.lat],
                        [station.position.lng, station.position.lat],
                    ],
                ],
            }))
        );
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

export default geojsonFromPlot;
