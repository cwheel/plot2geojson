import { Plot } from '../parser.js';

type BoundingBox = {
    northingMin: number;
    northingMax: number;
    eastingMin: number;
    eastingMax: number;
};

class BoundingBoxCommand {
    static command = 'X';

    parse(args: string[], plot: Plot) {
        const boundingBoxes = plot.bounds || [];

        return {
            bounds: [
                ...boundingBoxes,
                {
                    northingMin: parseFloat(args[0]),
                    northingMax: parseFloat(args[1]),
                    eastingMin: parseFloat(args[2]),
                    eastingMax: parseFloat(args[3]),
                },
            ],
        };
    }
}

export default BoundingBoxCommand;
export { type BoundingBox };
