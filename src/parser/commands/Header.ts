class HeaderCommand {
    static command = 'Z';

    parse(args: string[]) {
        return {
            maxElevation: parseFloat(args[4]),
            maxPenetration: parseFloat(args[7]),
        };
    }
}

export default HeaderCommand;
