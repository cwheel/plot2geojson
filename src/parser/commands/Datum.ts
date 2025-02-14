import UTM from 'utm-latlng';

// Compass suports a lot of these, but I'm only adding ones we actually use here for now
type SupportedDatum = 'WGS 1984' | 'North American 1927';

type Datum = {
    name: SupportedDatum;
    converter: UTM;
};

class DatumCommand {
    static command = 'O';

    parse(args: string[]) {
        // This is the only string Compass doesn't mark with quotes
        const name = args.join(' ');

        let converter = new UTM();

        // No idea if this is a Compass default or something. If we for
        // some reason have lots of variety in our datum selection,
        // a number of additional cases will probably be needed here.

        // See https://www.npmjs.com/package/utm-latlng for supported datums
        if (name === 'North American 1927') {
            // @ts-ignore: UTM's constructor does accept one argument
            converter = new UTM('Clarke 1866');
        }

        return {
            datum: {
                name,
                converter,
            },
        };
    }
}

export default DatumCommand;
export { type Datum, type SupportedDatum };
