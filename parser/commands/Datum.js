import UTM from 'utm-latlng'

class Datum {
    static command = 'O'

    parse(args) {
        // This is the only string Compass doesn't mark with quotes
        const name = args.join(' ')

        let converter = new UTM()

        // No idea if this is a Compass default or something. If we for
        // some reason have lots of variety in our datum selection,
        // a number of additional cases will probably be needed here.

        // See https://www.npmjs.com/package/utm-latlng for supported datums
        if (name === 'North American 1927') {
            converter = new UTM('Clarke 1866')
        }

        return {
            datum: {
                name,
                converter,
            },
        }
    }
}

export default Datum
