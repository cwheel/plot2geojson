#!/usr/bin/env node

import fs from 'fs/promises';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { parse } from './plt2geojson/parser/parser.js';
import geojsonFromPlot from './plt2geojson/geojson/geojson.js';

const argv = yargs(hideBin(process.argv))
    .command('$0 <input>', 'Convert PLT to GeoJSON', (yargs) => {
        yargs.positional('input', {
            describe: 'Input Compass PLT file',
            type: 'string',
        });
    })
    .demandCommand(1)
    .parse();

if (!argv.input.endsWith('.plt')) {
    console.error('Input file must be a PLT file');
    process.exit(1);
}

const plt = await fs.readFile(argv.input, 'utf8');
const plot = parse(plt);

console.log(JSON.stringify(geojsonFromPlot(plot), null, 2));
