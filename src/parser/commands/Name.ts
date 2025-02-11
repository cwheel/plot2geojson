class Name {
    static command = 'S';

    parse(args: string[]) {
        return {
            name: args[0],
        };
    }
}

export default Name;
