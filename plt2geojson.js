import fs from 'fs/promises'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import { parse } from './parser/parser.js'

const argv = yargs(hideBin(process.argv))
    .command('$0 <input>', 'Convert PLT to GeoJSON', (yargs) => {
        yargs.positional('input', {
            describe: 'Input Compass PLT file',
            type: 'string',
        })
    })
    .demandCommand(1)
    .parse()

if (!argv.input.endsWith('.plt')) {
    console.error('Input file must be a PLT file')
    process.exit(1)
}

const plt = await fs.readFile(argv.input, 'utf8')
const plot = parse(plt)

// todo: actually convert this to geojson
console.log(JSON.stringify(plot, null, 2))
