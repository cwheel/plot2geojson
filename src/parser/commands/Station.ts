import { stationFromArgs } from '../util/station.js';
import { type Context, type Plot } from '../parser.js';

class Station {
    static command = 'D';

    parse(args: string[], ctx: Context, plot: Plot) {
        const activeStation = ctx.stations[ctx.currentStation];
        activeStation.stations = activeStation.stations || [];

        activeStation.stations.push(stationFromArgs(args));

        return {};
    }
}

export default Station;
