type Position = {
    northing: number;
    easting: number;
};

type Station = {
    position: Position;
    elevation: number;
    name: string;
    walls: {
        left: number;
        right: number;
        up: number;
        down: number;
    };
    penetration: number;
    flags: {
        ExcludePlotting: boolean;
        ExcludeClosure: boolean;
        ExcludeLength: boolean;
        TotalExclusion: boolean;
        Splay: boolean;
    };
    comment: string | null;
    stations: Station[];
};

const stationFromArgs = (args: string[]): Station => {
    const flags = args[11].split('');

    return {
        position: {
            northing: parseFloat(args[0]),
            easting: parseFloat(args[1]),
        },
        elevation: parseFloat(args[2]),
        name: args[3].substring(1),
        // Compass stores these in LUDR order, not LRUD
        walls: {
            left: parseFloat(args[5]),
            right: parseFloat(args[8]),
            up: parseFloat(args[6]),
            down: parseFloat(args[7]),
        },
        penetration: parseFloat(args[10]),
        flags: {
            ExcludePlotting: flags.includes('P'),
            ExcludeClosure: flags.includes('C'),
            ExcludeLength: flags.includes('L'),
            TotalExclusion: flags.includes('X'),
            Splay: flags.includes('S'),
        },
        comment: args.length >= 11 ? args[12] : null,
        stations: [],
    };
};

export { stationFromArgs, type Station, type Position };
