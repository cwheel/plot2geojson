import DatumCommand, { type Datum } from './commands/Datum.js';
import HeaderCommand from './commands/Header.js';
import NameCommand from './commands/Name.js';
import RootStationCommand from './commands/RootStation.js';
import SurveyCommand, { type Survey } from './commands/Survey.js';
import UTMZoneCommand from './commands/UTMZone.js';
import StationCommand from './commands/Station.js';
import BoundingBoxCommand from './commands/BoundingBox.js';

import { type Station } from './util/station.js';
import { type BoundingBox } from './commands/BoundingBox.js';
import { splitStringWithQuotes } from './util/split.js';

type Units = 'feet' | 'meters';
type Plot = {
    name?: string;
    maxElevation?: number;
    maxPenetration?: number;
    stations?: Station[];
    utmZone?: number;
    datum?: Datum;
    surveys?: Survey[];
    bounds?: { [survey: string]: BoundingBox };
    units?: Units;
};
type Context = {
    // The root station we're appending survey data to
    currentRootName?: string;
    // The root station (of the survey) that we're actually parsing
    currentParsingRootName?: string;
    roots?: { [name: string]: Station };
};

type ParserCommand = {
    command: string;

    new (): {
        parse(args: string[], ctx: Context, plot: Plot): Plot;
    };
};

class Parser {
    static commands = [
        HeaderCommand,
        UTMZoneCommand,
        DatumCommand,
        NameCommand,
        SurveyCommand,
        RootStationCommand,
        StationCommand,
        BoundingBoxCommand,
    ];

    static ignoredCommands = [
        'E', // Seems to just duplicate 'N' for reasons unknown
        'P', // Starting point, not of interest (I think?)
        'C', // No idea what this is, but it seems to usually just be 0
        'R', // Some caves have these, seems to be a list of surveys? Unsure what this is used for.
    ];

    commandMap: { [command: string]: ParserCommand };
    ctx: Context;
    plot: Plot;

    constructor(units: Units = 'feet') {
        this.commandMap = {};
        Parser.commands.forEach((command) => {
            this.commandMap[command.command] = command;
        });

        // Context to share between commands since some of them depend on each other
        this.ctx = {};

        // The reconstructed plot, built as each line is parsed
        this.plot = { units };
    }

    parseLine(line: string) {
        if (line.length === 0) {
            return;
        }

        // Capitalize the command, sometimes Compass forgets (lol)
        const command = line[0].toUpperCase();
        if (Parser.ignoredCommands.includes(command) || command === '') {
            return;
        }

        const Command = this.commandMap[command];

        if (Command) {
            const instance = new Command();

            // Remove the line command itself
            const rawArgs = line.substring(1);
            const args = splitStringWithQuotes(rawArgs);

            // The last argument is a CR, remove it
            if (args[args.length - 1] === '\r') {
                args.pop();
            } else {
                args[args.length - 1] = args[args.length - 1].replace('\r', '');
            }

            const plotAdditions = instance.parse(args, this.ctx, this.plot);
            this.plot = { ...this.plot, ...plotAdditions };
        } else {
            console.warn(`Unknown command: ${command}`);
        }
    }

    getPlot() {
        return this.plot;
    }
}

const parse = (pltFile: string) => {
    const lines = pltFile.split('\n');
    const parser = new Parser();

    lines.forEach((line: string) => {
        parser.parseLine(line);
    });

    return parser.getPlot();
};

export { parse, type ParserCommand, type Plot, type Context };
