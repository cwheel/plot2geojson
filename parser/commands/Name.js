class Name {
    static command = 'S';

    parse(args) {
        return {
            name: args[0],
        };
    }
}

export default Name;
