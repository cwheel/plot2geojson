# plt2geojson 🌎
#### Convert [Compass](https://fountainware.com/compass/) plot files into [GeoJSON](https://geojson.org/). Particularly handy if you need to render a Compass based cave survey in [Mapbox](https://www.mapbox.com/).

## Usage (cli)
Open your Survey in Compass and click the `Process and View Cave` button to generate a `.plt` file. Compass will place this file next to the project `.mak` and the `.dat` file(s).

<img width="243" alt="Screenshot 2025-02-11 at 5 52 47 PM" src="https://github.com/user-attachments/assets/71ea0c6a-c975-400e-b3b7-0950d0ab0cbe" />

Run plot2geojson by passing the `.plt` file to reproduce the plot as GeoJSON:

`npx plt2geojson /path/to/your/plot.plt`

## Usage (lib)

```
import plt2geojson from 'plt2geojson';

plt2geojson(plotFile: string): string;
```

## GeoJSON structure

Each set of stations is used to reproduce a polygon consisting of the left and right walls. The _forward_ station (per Compass standards) in the polygon dictates the properties associated with the polygon. Station properties look like:

```
{
    name: string;
    elevation: number;
    penetration: number;
    comment: string;
}
```
