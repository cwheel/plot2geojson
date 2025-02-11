import { parse } from './parser/parser.js';
import geojsonFromPlot from './geojson/geojson.js';

const plt2geojson = (pltFile: string) => {
    const plot = parse(pltFile);
    const geoJson = geojsonFromPlot(plot);

    return JSON.stringify(geoJson);
};

export default plt2geojson;
