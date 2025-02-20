const splitStringWithQuotes = (input: string): string[] => {
    const regex = /(?:[^\s"]+|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')+/g;
    return input.match(regex) || [];
};

export { splitStringWithQuotes };
