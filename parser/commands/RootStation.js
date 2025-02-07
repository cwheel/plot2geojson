import { stationFromArgs } from '../util/station.js';

class RootStation {
    static command = 'M';

    parse(args, ctx, plot) {
        const stations = plot.stations || [];

        // Prefixed with a name command, remove it
        const stationName = args[3].substring(1);

        stations.push(stationFromArgs(args, ctx, plot));

        ctx.stations = ctx.stations || {};
        ctx.stations[stationName] = stations[stations.length - 1];
        ctx.currentStation = stationName;

        return { stations };
    };
};

export default RootStation;