# Images

Raster images here are **not** copied as-is. Every `<img src="/assets/images/…">` in a page
(including Markdown images and the `{% media %}` shortcode) is processed at build time by
`@11ty/eleventy-img` into responsive AVIF / WebP / JPEG at 480, 960, 1600 px and the original
width, written to `/assets/img/`. SVG files are passed through unchanged.

## Folders

```
portrait/                 headshots, about-page photos
work/<project-slug>/      cover.jpg + gallery images for /work/<slug>/
walks/<walk-slug>/        cover.jpg + stop photos for /walks/<slug>/
photos/<category>/        the /photos/ gallery (water, heritage, walks, robotics, portfolio)
drawings/                 CAD sections, measured drawings, sketches (PNG/JPEG export, or SVG)
```

Use lowercase, hyphenated file names (`hiti-section-01.jpg`). The slug folders must match the
Markdown file names in `src/work/` and `src/walks/`.

## Sizes and formats

- Long edge **≥ 2000 px** (the build makes the smaller sizes). 2400–3000 px is ideal for hero images.
- **JPEG** for photos (quality 85–90 from your editor is fine), **PNG** for drawings with flat
  colour or fine lines. Do not upload pre-shrunk images — the build cannot add detail back.
- Strip location metadata if a photo shows a private home.

## Referencing images

In Nunjucks templates prefer the shortcode — it falls back to a decorative line drawing if the
file is missing, so the build never breaks:

```njk
{% media "/assets/images/work/hiti-research/cover.jpg", "Hiti spout at Mangalbazar at dawn", { ratio: "3/2", kind: "heritage" } %}
```

In Markdown a plain image works too (the file must exist, or the build fails):

```md
![Measured section of the Alko Hiti](/assets/images/drawings/alko-hiti-section.png)
```

Always write meaningful `alt` text; use `""` only for purely decorative images.

**Cover and stop photos:** every `src/work/*.md` and `src/walks/*.md` file already has a
`coverAlt` (and water-heritage stops have `imageAlt`) written before any photo was chosen. When
you add the file, rewrite that text to describe the photo you actually added. The same goes for
`alt`, `caption` and `place` in `src/_data/photos.yml`, and for the portrait alt text on the
About page (`src/about/index.njk`).
