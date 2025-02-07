class UTMZone {
    static command = 'G';

    parse(args) {
        return {
            utmZone: parseInt(args[0], 10),
        };
    }
}

export default UTMZone;
