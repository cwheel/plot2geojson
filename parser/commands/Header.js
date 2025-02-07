class Header {
    static command = 'Z'

    parse(args) {
        return {
            maxDepth: parseFloat(args[4]),
            maxPenetration: parseFloat(args[7]),
        }
    }
}

export default Header
