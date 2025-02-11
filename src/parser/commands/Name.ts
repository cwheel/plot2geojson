class NameCommand {
    static command = 'S';

    parse(args: string[]) {
        return {
            name: args[0],
        };
    }
}

export default NameCommand;
