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
    comment: string | null;
    stations: Station[];
};

const stationFromArgs = (args: string[]): Station => {
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
        comment: args.length >= 11 ? args[12] : null,
        stations: [],
    };
};

export { stationFromArgs, type Station, type Position };
