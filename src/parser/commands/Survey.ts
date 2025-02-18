import { type Context, type Plot } from '../parser.js';

type Survey = {
    name: string;
    date: Date;
};

class SurveyCommand {
    static command = 'N';

    parse(args: string[], ctx: Context, plot: Plot) {
        const surveys: Survey[] = plot?.surveys ?? [];
        surveys.push({
            name: args[0],
            // YYYY/MM/DD
            date: new Date(`${args[4]}/${args[2]}/${args[3]}`),
        });

        return {
            surveys,
        };
    }
}

export default SurveyCommand;
export { type Survey };
