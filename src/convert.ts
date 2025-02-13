import { parse } from './parser/parser.js';
import geojsonFromPlot, { type RenderOptions } from './geojson/geojson.js';

const plt2geojson = (pltFile: string, options: RenderOptions) => {
    const plot = parse(pltFile);
    const geoJson = geojsonFromPlot(plot, options);

    return JSON.stringify(geoJson);
};

export default plt2geojson;
