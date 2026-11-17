# Photos for the /photos/ gallery

Every photograph on `/photos/` is one entry in **`src/_data/photos.yml`** plus one image file in
this folder. Entries whose file doesn't exist yet are left out, so the site always builds; the
Photos page, its menu item and the home page photo strip appear once the first file exists.

## Add a photograph (or fill one of the existing slots)

1. **Export the photo** as a JPEG, long edge **at least 2000 px** (2400–3000 px is ideal), quality
   85–90. Strip GPS/location data if it shows a private home. Don't pre-shrink it — the build makes
   the smaller sizes (480, 960, 1600 px, AVIF/WebP/JPEG) and a 2000 px full-size copy.
2. **Name it** in lowercase with hyphens, e.g. `alko-hiti-morning.jpg`.
3. **Drop it in the folder for its set:**

   ```
   src/assets/images/photos/
     water/       hiti stone spouts, the Rajkulo canal, other water systems
     heritage/    Patan Durbar Square, temples, repoussé and other craft
     walks/       heritage walks and the groups on them
     robotics/    robotics classes and the inter-school challenge
     portfolio/   your own photographs, outside project work
   ```

   (Create the folder if it isn't there yet.)
4. **Add or edit its entry** in `src/_data/photos.yml` — the order in that file is the order on
   the page:

   ```yaml
   - src: /assets/images/photos/water/alko-hiti-morning.jpg
     alt: Two women filling water jars at a stone spout in the early morning.
     caption: Morning at the spout
     place: Patan
     year: 2024          # optional — leave out if you're not sure
     category: water     # water | heritage | walks | robotics | portfolio
     shape: tall         # optional — see below
   ```

   - **alt** — what the photo shows, in one plain sentence, for people who can't see it.
   - **caption** — a short title (about 28 characters fits on one line).
   - **place** — keep it short; it's printed in small capitals under the photo.
   - The entries already in the file are **slots**. When you put a photo into a slot, rewrite its
     `alt`, `caption` and `place` so they describe *your* photograph.
5. Run `npm start` (or push) and check `/photos/`. The tile now links to the full-size image and
   opens in the viewer.

## Shapes

| `shape`      | Tile                         | Use it for                     |
|--------------|------------------------------|--------------------------------|
| *(leave out)*| normal                       | landscape (horizontal) photos  |
| `tall`       | twice as tall                | portrait (vertical) photos     |
| `large`      | twice as wide and tall       | a favourite landscape photo    |
| `wide`       | twice as wide, same height   | panoramas / very wide crops    |

Tiles crop to fill their shape. If an important part is cut off, add `focus: top` (or `bottom`,
`left`, `right`). The starter order — large, tall, tall, wide, wide, tall, tall, large, then four
normal tiles — packs the grid without gaps at every screen width; if you add or reshape photos,
glance at the page on a phone and a laptop.

## Other settings

- `featured: true` on one entry makes it the page's preview image when the link is shared.
- The descriptions of the five sets (the "Key to the sets" in the page header) live in
  `src/photos/index.11tydata.js` → `CATEGORIES`.
- Remove a photo by deleting its entry in `photos.yml` (and the file, if you like).
