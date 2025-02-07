const meterToFeet = 3.28084;

class Station {
    static command = 'D';

    parse(args, ctx, plot) {
        const stations = plot.stations || [];

        // Prefixed with a name command, remove it
        const stationName = args[3].substring(1);

        const activeStation = ctx.stations[ctx.currentStation]
        activeStation.stations = activeStation.stations || [];

        activeStation.stations.push({
            position: plot.datum.converter.convertUtmToLatLng(
                parseFloat(ctx.units === 'feet' ? args[1] / meterToFeet : args[1]),
                parseFloat(ctx.units === 'feet' ? args[0] / meterToFeet : args[0]),
                plot.utmZone,
                'R', // This probably needs to be dynamic?
            ),
            depth: parseFloat(args[2]),

            name: stationName,
            tunnel: {
                left: parseFloat(args[5]),
                right: parseFloat(args[6]),
                up: parseFloat(args[7]),
                down: parseFloat(args[8]),
            },
            penetration: parseFloat(args[10]),
            comment: args.length >= 11 ? args[12] : null,
        });

        return {};
    };
};

export default Station;