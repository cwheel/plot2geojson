import { type Plot, type Context } from '../parser.js';

type BoundingBox = {
    northingMin: number;
    northingMax: number;
    eastingMin: number;
    eastingMax: number;
    minDepth: number;
    maxDepth: number;
};

class BoundingBoxCommand {
    static command = 'X';

    parse(args: string[], ctx: Context, plot: Plot) {
        const boundingBoxes = plot.bounds || {};

        return {
            bounds: {
                ...boundingBoxes,
                [ctx.currentParsingRootName]: {
                    northingMin: parseFloat(args[0]),
                    northingMax: parseFloat(args[1]),
                    eastingMin: parseFloat(args[2]),
                    eastingMax: parseFloat(args[3]),
                    maxDepth: parseFloat(args[4]),
                    minDepth: parseFloat(args[5]),
                },
            },
        };
    }
}

export default BoundingBoxCommand;
export { type BoundingBox };
