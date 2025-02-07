const meterToFeet = 3.28084

const stationFromArgs = (args, ctx, plot) => {
    return {
        position: plot.datum.converter.convertUtmToLatLng(
            parseFloat(ctx.units === 'feet' ? args[1] / meterToFeet : args[1]),
            parseFloat(ctx.units === 'feet' ? args[0] / meterToFeet : args[0]),
            plot.utmZone,
            'R' // UTM zone letter, this maybe needs to be dynamic?
        ),
        depth: parseFloat(args[2]),

        name: args[3].substring(1),
        tunnel: {
            left: parseFloat(args[5]),
            right: parseFloat(args[6]),
            up: parseFloat(args[7]),
            down: parseFloat(args[8]),
        },
        penetration: parseFloat(args[10]),
        comment: args.length >= 11 ? args[12] : null,
    }
}

export { stationFromArgs }
