#!/usr/bin/env node

import fs from 'fs/promises';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { parse } from './parser/parser.js';
import geojsonFromPlot from './geojson/geojson.js';

const argv = yargs(hideBin(process.argv))
    .command('$0 <input>', 'Convert PLT to GeoJSON')
    .positional('input', {
        describe: 'Input Compass PLT file',
        type: 'string',
        demandOption: true,
    })
    .option('analyze', {
        alias: 'a',
        describe:
            'Analyze the Compass file instead of converting it to GeoJSON',
        type: 'boolean',
    })
    .option('pretty', {
        alias: 'p',
        describe: 'Render the GeoJSON with more visually appealing polygons',
        type: 'boolean',
    })
    .option('line', {
        alias: 'l',
        describe: 'Render the GeoJSON with a line connecting each station',
        type: 'boolean',
    })
    .option('debug', {
        alias: 'd',
        describe: 'Supress GeoJSON output for debugging',
        type: 'boolean',
    })
    .demandCommand(1)
    .parseSync();

if (!argv.input.endsWith('.plt')) {
    console.error('Input file must be a PLT file');
    process.exit(1);
}

const plt = await fs.readFile(argv.input, 'utf8');
const plot = parse(plt);

if (argv.analyze) {
    console.log('----------------------------------------');
    console.log('Name:', plot.name);
    console.log('Datum:', plot.datum.name);
    console.log('Root Stations:', plot.stations.length);
    console.log(
        'Child Stations:',
        plot.stations.reduce((acc, station) => acc + station.stations.length, 0)
    );
    console.log(
        'Hidden Stations:',
        plot.stations.reduce(
            (acc, station) =>
                acc +
                station.stations.filter(
                    (station) =>
                        station.flags.ExcludePlotting ||
                        station.flags.TotalExclusion
                ).length,
            0
        )
    );
    console.log('----------------------------------------');
    console.log('Surveys:', plot.surveys.length);
    console.log('');
    plot.surveys.forEach((survey) => {
        console.log(`Survey ${survey.name} on`, survey.date.toDateString());
    });
} else {
    const renderOptions = {
        pretty: argv.pretty,
        line: argv.line,
    };

    const geojson = geojsonFromPlot(plot, renderOptions);

    if (!argv.debug) {
        console.log(JSON.stringify(geojson, null, 2));
    }
}
