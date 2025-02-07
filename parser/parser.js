import splitSpacesExcludeQuotes from 'quoted-string-space-split';

import Datum from './commands/Datum.js';
import Header from './commands/Header.js';
import Name from './commands/Name.js';
import RootStation from './commands/RootStation.js';
import Survey from './commands/Survey.js';
import UTMZone from './commands/UTMZone.js';
import Station from './commands/Station.js';

class Parser {
    static commands = [
        Header,
        UTMZone,
        Datum,
        Name,
        Survey,
        RootStation,
        Station,
    ];

    static ignoredCommands = [
        'E', // Seems to just duplicate 'N' for reasons unknown
        'X', // Bounding box, not of interest
        'P', // Starting point, not of interest (I think?)
        'C', // No idea what this is, but it seems to usually just be 0
    ];

    constructor(units = 'feet') {
        this.commandMap = {};
        Parser.commands.forEach((command) => {
            this.commandMap[command.command] = command;
        });

        // Context to share between commands since some of them depend on each other
        this.ctx = {
            units,
        };

        // The reconstructed plot, built as each line is parsed
        this.plot = {};
    };

    parseLine(line) {
        const command = line[0];
        if (Parser.ignoredCommands.includes(command) || command === '') {
            return;
        }

        const Command = this.commandMap[command];

        if (Command) {
            const instance = new Command();

            // Remove the line command itself
            const rawArgs = line.substring(1);
            const args = splitSpacesExcludeQuotes(rawArgs);

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
    };

    getPlot() {
        return this.plot;
    };
}

const parse = (plt) => {
    const lines = plt.split('\n');
    const parser = new Parser();

    lines.forEach((line) => {
        parser.parseLine(line);
    });

    return parser.getPlot();
};

export { parse };