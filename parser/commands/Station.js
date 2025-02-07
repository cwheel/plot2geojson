import { stationFromArgs } from '../util/station.js';

class Station {
    static command = 'D';

    parse(args, ctx, plot) {
        const activeStation = ctx.stations[ctx.currentStation]
        activeStation.stations = activeStation.stations || [];

        activeStation.stations.push(stationFromArgs(args, ctx, plot));

        return {};
    };
};

export default Station;