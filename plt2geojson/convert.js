import { parse } from './parser/parser.js';
import geojsonFromPlot from './geojson/geojson.js';

const plt2geojson = (plot) => {
    const plot = parse(plt);
    const geoJson = geojsonFromPlot(plot);

    return JSON.stringify(geoJson);
};

export default plt2geojson;
