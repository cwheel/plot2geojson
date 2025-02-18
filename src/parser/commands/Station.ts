import { stationFromArgs } from '../util/station.js';
import { type Context, type Plot } from '../parser.js';

class StationCommand {
    static command = 'D';

    parse(args: string[], ctx: Context) {
        const activeStation = ctx.roots[ctx.currentRootName];
        activeStation.stations = activeStation.stations || [];

        activeStation.stations.push(stationFromArgs(args));

        return {};
    }
}

export default StationCommand;
