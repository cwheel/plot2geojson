class UTMZoneCommand {
    static command = 'G';

    parse(args: string[]) {
        return {
            utmZone: parseInt(args[0], 10),
        };
    }
}

export default UTMZoneCommand;
