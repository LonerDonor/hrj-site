# Maps (GeoJSON)

Map layers for project pages (e.g. the Rajkulo canal, `/work/rajkulo-canal/`). Files here are copied
to `/assets/maps/` by the build (`.geojson`, `.json`, `.kml`, `.gpx`; this README is not published).

1. Export each layer as **GeoJSON** in **WGS 84 (EPSG:4326)**, longitude/latitude order. QGIS
   "Export → Save Features As… → GeoJSON" produces this by default.
2. One layer per file, lowercase and hyphenated. The Rajkulo page already expects:
   - `rajkulo-canal.geojson`: the canal route (LineString / MultiLineString)
   - `rajkulo-nodes.geojson`: key points along it (Points)
   Keep files small: simplify geometry to about 1 m and drop attribute columns you don't use.
3. Optional feature properties, shown in the popup when a feature is clicked:
   `name` (Latin script), `deva` (Devanagari), `note` (one short sentence).
4. Layers are listed in the project's front matter. `color` is a design token name (preferred) or
   any CSS colour:

```yaml
map:
  center: [27.6588, 85.3247]   # [lat, lng]
  zoom: 14
  label: Rajkulo canal study area, Lalitpur
  layers:
    - { file: /assets/maps/rajkulo-canal.geojson, color: "--copper", label: Canal route }
    - { file: /assets/maps/rajkulo-nodes.geojson, color: "--brick", label: Key nodes }
```

How the page behaves:

- Only layer files that exist at build time are passed to the map, so a missing file never causes
  a failed request. The map zooms to fit the layers that loaded and shows a legend for them.
- With no layer files, the map shows one marker at `center` with the `label` as its popup.
- Without JavaScript the page shows the place name, the coordinates and an OpenStreetMap link.

Leaflet is self-hosted at `/assets/vendor/leaflet/` (no CDN). Tiles come from CARTO "Voyager"
(`*.basemaps.cartocdn.com`, allowed by the CSP). After adding or changing a file, rebuild the site.
