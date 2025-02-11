import { stationFromArgs } from '../util/station.js';
import { type Context, type Plot } from '../parser.js';

class RootStation {
    static command = 'M';

    parse(args: string[], ctx: Context, plot: Plot) {
        const stations = plot.stations || [];

        // Prefixed with a name command, remove it
        const stationName = args[3].substring(1);

        stations.push(stationFromArgs(args));

        ctx.stations = ctx.stations || {};
        ctx.stations[stationName] = stations[stations.length - 1];
        ctx.currentStation = stationName;

        return { stations };
    }
}

export default RootStation;
