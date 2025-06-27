import { stationFromArgs } from '../util/station.js';
import { type Context, type Plot } from '../parser.js';

class RootStationCommand {
    static command = 'M';

    parse(args: string[], ctx: Context, plot: Plot) {
        const stations = plot.stations || [];

        // Prefixed with a name command, remove it
        const stationName = args[3].substring(1);

        ctx.currentParsingRootName = stationName;

        const newStation = stationFromArgs(args);

        for (let rootStation of stations) {
            const terminalStation =
                rootStation.stations[rootStation.stations.length - 1];

            if (!terminalStation) {
                continue;
            }

            // If the last station in the root station is the same as the new station, this survey
            // is a continuation of the last survey, don't make a new root station for it.
            if (
                terminalStation.name === stationName &&
                terminalStation.position.northing ===
                    newStation.position.northing &&
                terminalStation.position.easting ===
                    newStation.position.easting &&
                terminalStation.elevation === newStation.elevation
            ) {
                ctx.currentRootName = rootStation.name;
                ctx.roots[rootStation.name] = rootStation;

                return { stations };
            }
        }

        if (ctx.currentRootName) {
            const lastRoot = ctx.roots[ctx.currentRootName];

            for (let i = 0; i < lastRoot.stations.length; i++) {
                const station = lastRoot.stations[i];

                // A hack to copy the walls from this root back into the existing survey if needed. It
                // _appears_ that this is what Compass does for some reason
                if (station.name === stationName) {
                    lastRoot.stations[i].walls.left = Math.max(
                        station.walls.left,
                        newStation.walls.left
                    );
                    lastRoot.stations[i].walls.right = Math.max(
                        station.walls.right,
                        newStation.walls.right
                    );
                    lastRoot.stations[i].walls.up = Math.max(
                        station.walls.up,
                        newStation.walls.up
                    );
                    lastRoot.stations[i].walls.down = Math.max(
                        station.walls.down,
                        newStation.walls.down
                    );
                }
            }
        }

        stations.push(newStation);

        ctx.roots = ctx.roots || {};
        ctx.roots[stationName] = stations[stations.length - 1];
        ctx.currentRootName = stationName;

        return { stations };
    }
}

export default RootStationCommand;
