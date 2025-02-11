class HeaderCommand {
    static command = 'Z';

    parse(args: string[]) {
        return {
            maxDepth: parseFloat(args[4]),
            maxPenetration: parseFloat(args[7]),
        };
    }
}

export default HeaderCommand;
