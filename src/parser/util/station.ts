type Position = {
    northing: number;
    easting: number;
};

type Station = {
    position: Position;
    depth: number;
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
        depth: parseFloat(args[2]),

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
            ExcludePlotting: 'P' in flags,
            ExcludeClosure: 'C' in flags,
            ExcludeLength: 'L' in flags,
            TotalExclusion: 'X' in flags,
            Splay: 'S' in flags,
        },
        comment: args.length >= 11 ? args[12] : null,
        stations: [],
    };
};

export { stationFromArgs, type Station, type Position };
