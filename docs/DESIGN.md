# HRJ site v2 — Design system & build conventions

Source of truth for how this site is built. Read this before adding pages or components.
Old site (reference only, never edit): `C:\Users\olenepal\OneDrive\Documents\VS code\hrj-site`

## 1. Concept

**"An engineer's field notebook on lime-wash."** Warm paper surfaces, ink-dark type, fine line-art
drawings, mono annotations like field notes, Devanagari/Newar terms as labels. Dark "soot" bands are
used sparingly (home hero foot, footer, one CTA band) for contrast. Photos and CAD drawings are the
evidence — give them room.

Colour roles (do not use gold for everything):
- **Brick** (`--brick`) — primary actions, heritage domain, key emphasis. One primary button per view.
- **Copper / patina** (`--copper`) — water & engineering domain, inline links, focus ring, maps.
- **Gilt** (`--gilt`) — DECORATIVE ONLY on light surfaces (rules, dots, diagram highlights). For gold
  *text* on light use `--gilt-text`. On dark bands use `--gilt-on-dark`.
- **Ink 1/2/3** — text hierarchy. `--ink-3` is the minimum for any text on light surfaces.

## 2. Stack

- Eleventy 3 (ESM config `eleventy.config.js`), Nunjucks templates, Markdown content, YAML data
  (`js-yaml` registered via `addDataExtension("yml,yaml")`).
- `@11ty/eleventy-img` **image transform plugin**: authors write plain `<img src="/assets/images/...">`
  (or Markdown images); the build outputs responsive AVIF/WebP/JPEG `<picture>` with width/height,
  `loading="lazy"`, `decoding="async"`. Hero/above-the-fold images set `eleventy:widths` /
  `loading="eager"` + `fetchpriority="high"` explicitly.
  *Implemented:* formats `["svg","avif","webp","jpeg"]` + `svgShortCircuit: true` (SVG sources stay
  SVG, rasters become AVIF/WebP/JPEG), widths `[480, 960, 1600, "auto"]`, default
  `sizes="(min-width: 72rem) 72rem, 100vw"`, output written to **`/assets/img/`**. Raster originals in
  `src/assets/images/` are *not* copied. A plain `<img>` pointing at a file that doesn't exist **fails
  the build** (on purpose — catches typos); use `{% media %}` for anything that may not exist yet.
  Don't put a numeric `width` attribute on an `<img>` you want responsive (it forces a single width).
- Build-time rasters (in an `eleventy.before` hook): `/assets/og/og-default.png` (1200×630, from
  `src/assets/og/og-default.svg`) and `/assets/apple-touch-icon.png` (180×180, from `favicon.svg`).
- Template helpers live in `config/` (`icons.js`, `placeholders.js`, `filters.js`), imported by
  `eleventy.config.js`; `config/renditions.js` makes plain JPEG renditions (og:image, gallery
  "full size" links) for the work and walks data files. All build outputs honour `--output=<dir>`.
- Leaflet 1.9.4 installed from npm and **self-hosted** (passthrough `node_modules/leaflet/dist` →
  `/assets/vendor/leaflet/`). No CDN scripts anywhere.
- No inline `<script>` anywhere (JSON-LD `type="application/ld+json"` data blocks are allowed). All JS
  is in `/assets/js/*.js` loaded with `defer`. No `onclick=` attributes.
- **CSP (decided): strict, no `'unsafe-inline'` anywhere — including `style-src`.** One `<meta>` CSP in
  `partials/head-meta.njk`. Consequence: **no `style=""` attributes and no `<style>` elements** (inline
  SVG included) — the browser would ignore them. Per-instance values are expressed as classes/data
  attributes instead: aspect ratios via `.media[data-ratio="4/3"]` (fixed set, see §6), image focus via
  `data-focus`, stack spacing via `.stack--s/--l/…`, grid density via `.grid--2/3/4`. Need another
  value? Add a class in your page CSS. Setting `el.style.x = …` from an external script is fine
  (CSSOM isn't blocked), `setAttribute("style", …)` / `innerHTML` with `style=` is not.
- Deployed by GitHub Actions to GitHub Pages at **https://hrishavjoshi.com** (`src/CNAME` passthrough).

## 3. Folder layout & ownership

```
eleventy.config.js        package.json        .github/workflows/deploy.yml
src/
  _data/                  site.yml nav.yml stats.yml clients.yml services.yml faq.yml
                          timeline.yml skills.yml recognition.yml photos.yml build.js
                          domains.js (work domains: labels, CTA, enquiry topic)
                          photosLive.js (true once a photo file exists: shows /photos/)
  _includes/layouts/      base.njk  (+ project.njk, walk.njk … owned by page builders)
  _includes/partials/     header.njk footer.njk head-meta.njk jsonld-person.njk hiti-diagram.njk
                          clients.njk ("Worked with and for" logo row + acronym key)
  assets/css/main.css     design system (tokens, base, layout, components)
  assets/css/pages/*.css  one file per page area (home, work, walks, photos, writing, about, wwm)
  assets/js/site.js       header/nav, reveal, small shared helpers
  assets/js/*.js          page scripts (work-filter.js, map.js, lightbox.js, form.js …)
  assets/images/          photos/drawings, sub-folders per area (see its README.md)
  assets/maps/  assets/cv/  assets/og/  assets/favicon.svg
  index.njk               home
  work/  walks/  photos/  writing/  about/  work-with-me/  thanks/  styleguide/
  404.njk  robots.txt.njk  sitemap.xml.njk  CNAME
```

Pages opt into extra CSS/JS through front matter:
```yaml
pageCss: work            # → /assets/css/pages/work.css
pageJs: [work-filter]    # → /assets/js/work-filter.js (defer)
```
Entries starting with `/` are used as-is (e.g. `/assets/vendor/leaflet/leaflet.css`). Also present:
`config/` (template helpers), `src/assets/css/pages/styleguide.css`, `src/styleguide/index.njk`
(`/styleguide/`, noindex). `photos.yml` is owned by the Photos builder; nothing in the foundation
requires it.

## 4. Tokens (defined in `main.css :root`)

Contrast checked (WCAG 2.2):

| Token | Value | Notes |
|---|---|---|
| `--paper` | `#f3ede1` | page background |
| `--paper-2` | `#ebe3d3` | alternate section band |
| `--card` | `#fbf8f2` | raised surfaces, inputs |
| `--rule` | `#cfc4ae` | decorative hairlines only (1.5:1) |
| `--field-border` | `#8f8270` | input/chip borders (3.2:1 on paper ✓ non-text) |
| `--ink` | `#1f1b16` | body/headings (14.7:1 on paper) |
| `--ink-2` | `#4a4237` | secondary text (8.5:1) |
| `--ink-3` | `#675c4b` | captions/labels — minimum for text (5.6:1 paper, 5.1:1 paper-2) |
| `--brick` | `#9c3f26` | primary button bg / heritage accent text (5.7:1) |
| `--brick-hover` | `#84341f` | |
| `--copper` | `#33604f` | links, water accent, focus ring (6.2:1) |
| `--gilt-text` | `#7d5f17` | gold-toned text on light (5.1:1) |
| `--gilt` | `#b08a2e` | decorative only on light (2.8:1 — never text) |
| `--brick-tint` | `#f2e2d9` | chip/tag backgrounds |
| `--copper-tint` | `#dfe9e3` | |
| `--gilt-tint` | `#f1e6c8` | |
| `--soot` | `#1c1915` | dark band background |
| `--soot-2` | `#26221c` | raised on dark |
| `--lime` | `#efe8d8` | text on dark (14.4:1) |
| `--lime-2` | `#c4b89e` | secondary on dark (8.9:1) |
| `--lime-3` | `#a39579` | captions on dark (6.0:1) |
| `--gilt-on-dark` | `#d4b25a` | accents/text on dark (8.6:1) |
| `--terra-on-dark` | `#e08a68` | |
| `--patina-on-dark` | `#8cc0a6` | |

**Semantic aliases (implemented)** — components use these, never the raw palette, so they re-colour
inside dark bands automatically: `--surface` (paper; paper-2 in `.section--alt`), `--surface-2`,
`--surface-raised` (card), `--text`, `--text-2`, `--text-3`, `--line` (rule), `--line-strong`
(field-border), `--link`, `--link-hover`, `--focus`, `--accent` (brick), `--accent-water` (copper),
`--accent-gold` (gilt-text), `--decor` (gilt), `--decor-tint`, `--on-accent`. `.band--dark`,
`.site-footer` and `.lightbox` remap them to lime / gilt-on-dark / terra-on-dark / patina-on-dark.
Other tokens: `--hatch` (diagonal hatching background), `--grain` (paper noise tile on `body`, ≤ 7%
alpha), `--gutter`, `--header-h` (4.25rem), `--measure` (68ch).

Type families (Google Fonts, one `<link>` in base layout, `display=swap`, preconnect):
- `--font-display`: **Fraunces** (variable opsz/wght 400–700, italic 400) — headings, wordmark.
- `--font-body`: **Public Sans** (400–600, italic 400) — body/UI.
- `--font-mono`: **JetBrains Mono** (400, 500) — field-note labels, metadata.
- `--font-deva`: **Tiro Devanagari Hindi** (400) — Devanagari/Newar terms (`lang="new"` or `lang="ne"`).

Fluid type scale (use ONLY these; no ad-hoc font sizes):
```
--step--1  small / captions      clamp(0.875rem, 0.85rem + 0.1vw, 0.9375rem)
--step-0   body                  clamp(1.0625rem, 1rem + 0.25vw, 1.1875rem)
--step-1   lead / h4             clamp(1.25rem, 1.15rem + 0.45vw, 1.5rem)
--step-2   h3                    clamp(1.5rem, 1.3rem + 0.9vw, 2rem)
--step-3   h2                    clamp(1.9rem, 1.5rem + 1.7vw, 2.75rem)
--step-4   page h1               clamp(2.4rem, 1.8rem + 2.8vw, 3.75rem)
--step-5   home hero             clamp(2.9rem, 2rem + 4.4vw, 5.25rem)
--label    mono labels           0.78rem, uppercase, letter-spacing .12em (never smaller)
```
Body line-height 1.65, measure ≤ 68ch for prose. Headings Fraunces 600, line-height 1.1, slight
negative tracking; use `font-variation-settings: "opsz" 144` for step-4/5.

Spacing scale: `--space-3xs .25rem, --space-2xs .5rem, --space-xs .75rem, --space-s 1rem,
--space-m 1.5rem, --space-l 2rem, --space-xl 3rem, --space-2xl 4.5rem, --space-3xl 6.5rem`.
Section padding: `--section-pad: clamp(3.5rem, 8vw, 7rem)`.
Radii: `--radius-s 4px; --radius 8px; --radius-l 14px`. Shadows: one soft paper shadow
`--shadow: 0 1px 0 rgba(31,27,22,.04), 0 8px 24px -12px rgba(31,27,22,.18)`.
Motion: `--ease: cubic-bezier(.2,.7,.2,1)`; durations 150/250/400ms. All motion is disabled under
`prefers-reduced-motion: reduce`.

## 5. Components (class API in `main.css`)

Layout: `.container` (max 72rem, inline padding `clamp(1rem,4vw,2rem)`), `.container--narrow` (46rem),
`.container--wide` (86rem), `.section`, `.section--alt` (paper-2), `.band--dark` (soot + lime text,
re-maps link/focus colours), `.stack` (`--stack-space` vertical rhythm), `.cluster` (flex wrap gap),
`.grid` with `.grid--2/3/4` responsive (auto-fit minmax), `.split` (text + media two-column, stacks
< 52rem).

Type: `.eyebrow` (mono label with short leading rule, `--ink-3`), `.section-head` (eyebrow + h2 +
`.lede`), `.lede` (`--step-1`, `--ink-2`), `.prose` (Markdown body styling: headings, lists, links,
blockquote, figure, table, hr as a hatched rule), `.deva` (Devanagari font).

Actions: `.btn` + `.btn--primary` (brick bg, `--card` text), `.btn--secondary` (ink 1.5px outline),
`.btn--on-dark` (for dark bands), `.btn--small`; `.link-arrow` (text link + arrow icon that nudges on
hover); all have visible `:focus-visible` (2px `--copper` outline, 3px offset; on dark `--gilt-on-dark`).
Min target 44×44px for primary controls.

Content: `.card` (card surface, border `--rule`, radius, padding), `.card--link` (whole card clickable
via the **title link’s `::after` overlay** — never wrap a whole card in `<a>` or use `role=button`),
`.card__media`, `.card__body`, `.card__meta` (mono label row), `.card__title`;
`.tag` (static chip, tint bg), `.chip` + `[aria-pressed="true"]` (filter toggle button);
`.ledger` (`<dl>` key/value rows: mono key `--ink-3`, value `--ink`, dashed separators);
`.stats` (stat strip: big Fraunces number + mono label; numbers rendered in HTML, never animated
from 0); `.timeline` (`<ol>` vertical logbook, year in mono, role/org/desc);
`.logo-row` (“Worked with” — institution names as typographic wordmarks, separated by dots);
`.quote` (testimonial/pull quote with attribution); `.notice` + `--info/--success/--error`
(role/aria-live handled by JS); `.media` (figure with `--ratio` custom property, `object-fit: cover`,
optional `<figcaption>` in mono); `.placeholder` (line-art SVG stand-in, see shortcode);
`.breadcrumbs` (`<nav aria-label="Breadcrumb">`); `.page-hero` (inner page header: eyebrow, h1, lede,
optional meta ledger, bottom hairline); `.faq` (native `<details>/<summary>`, custom marker,
visible focus); `.gallery` (CSS grid, masonry-ish via row spans) + `.lightbox` (native `<dialog>`).

Forms: `.form`, `.field`, `.field__label`, `.field__hint`, `.field__error`, inputs/select/textarea on
`--card` with `--field-border` 1.5px, focus ring copper, error state brick, required marker `*`
with visually-hidden “required”.

Chrome: `.skip-link`, `.visually-hidden`, `.site-header` (sticky, paper bg with bottom rule, **no
backdrop-filter**), `.site-nav`, `.nav-toggle` (`aria-expanded`, `aria-controls`), mobile nav is a
disclosure panel in normal flow beneath the header bar (not a fixed overlay); `.site-footer` (dark band).

Motion: `.reveal` only animates when `<html class="js">` AND no reduced motion; content is never
hidden when JS is off. (*Implemented:* site.js "arms" only `.reveal` elements that start below the
fold, so nothing on screen flickers.)

**Added during implementation** (all shown on `/styleguide/`):
- Layers: `@layer reset, tokens, base, layout, components, page, utilities;` — page CSS goes in
  `@layer page`. Base margins are **zero**; use `.stack` / `.prose` for rhythm.
- Layout: `.stack--2xs|xs|s|l|xl|2xl`, `.cluster--tight|loose|between|baseline`, `.section--tight`,
  `.section--flush-top`, `.band--edge` (hatched top edge), `.split--reverse|media-wide|text-wide|top`,
  `.with-aside` + `__main` / `__aside` (sticky aside ≥ 60rem). Grids lock to 2/3/4 columns ≥ 64rem.
- Type: `.label` (generic mono label), `.eyebrow--plain|water|heritage`, `.section-head__action`
  (link aligned right of the heading ≥ 48rem), `.section-head--center`.
- Cards: `.card__text`, `.card__footer`, `.card__cue` (decorative "Read more →" inside link cards),
  `data-domain="water|heritage|education"` (3px coloured top rule), `.card--plain` (top rule only).
- `.tags` (list wrapper), `.tag--water|heritage|education`; `.chips` (group) + `.chip__count`.
- `.ledger--compact`; `.stats__item|value|label|detail`; `.timeline__item[data-type]` with
  `__years|role|org|desc`; `.steps` (numbered process, `__title|text`); `.cta-band` (+ `__title`).
- Media: `.media[data-ratio]`, `.media[data-focus="top|bottom|left|right|center"]`,
  `.media--rounded`, `.media--framed`, `.media--placeholder`; `.gallery__item--tall|wide`,
  `.gallery__caption`; `.lightbox__figure|caption|controls|btn`.
- `.page-hero__inner|title|meta|actions|aside`, `.page-hero--split`.
- `.faq__item` (on `<details>`), `.faq__answer`.
- Forms: `.form__row` (2 columns ≥ 40rem), `.form__actions`, `.form__note`, `.field__req`,
  `.field--error`, `.field--check`.
- `.hiti` diagram component (container queries), `.icon--s|l`, `.wordmark`, `.wordmark__dot`.
- **Domain colours:** `data-domain="water|heritage|education"` on *any* element sets `--domain`
  (rings, rules, dots — decorative) and `--domain-text` (text, icons; education uses gold *text*).
  Defined once in the tokens layer; page CSS reads them and never re-maps domains.
- Shared patterns (added in the integration pass — use these instead of page copies):
  `.card--horizontal` (+ `.card--reverse`, `--card-media-min`) media beside text ≥ 48rem;
  `.card--feature` (larger title/text); `.marker` (ringed number, domain-coloured) and
  `.marker--icon`; `.checklist` (+ `--dots`) tick lists; `.filter-bar` + `.filter-bar__status`
  (chips + live count); `.label--plain` (lower-case mono meta: counts, hosts, plate numbers);
  `.pointer` (+ `--hang`) the "↳" field-note pointer, silent for screen readers; `.dot-list`
  (dot-separated inline list; a wrapped line never starts with a dot — `.logo-row` builds on it;
  no links inside either); `.logo-row__key` (visible acronym key); `.field__optional`.
  "Worked with and for" rows: `{% set clientsLabelledBy = "<heading id>" %}{% include
  "partials/clients.njk" %}`.
- Link cards draw their keyboard focus ring on the card (`:has()`), with an inset fallback.
- Utilities: `.visually-hidden`, `.fs--1 … .fs-5`, `.font-display|body|mono`, `.italic`,
  `.text-2|3|accent|water|gold`, `.measure`, `.center`, `.nowrap`, `.mt-0|s|m|l|xl`, `.mb-0`,
  `.js-only` (hidden without JS), `.no-js-only`.

## 6. Shortcodes & filters (eleventy.config.js)

- `{% media src, alt, opts %}` → `<figure class="media">`. `opts` = `{ ratio: "4/3", kind:
  "photo|drawing|portrait|walk|robotics|map|heritage", caption: "", eager: false, sizes: "" }`.
  If `src` is empty or the file does not exist under `src/`, outputs a decorative `.placeholder` line-art
  SVG (aria-hidden, no visible “TBC” text) so the build never breaks and the owner can add files later.
- `{% icon "name" %}` → inline SVG (`aria-hidden="true" focusable="false"`, `currentColor`, 1.5 stroke).
  Set: `arrow-right, arrow-up-right, download, mail, whatsapp, phone, map-pin, linkedin, medium,
  menu, close, water, heritage, robot, walk, pen, calendar, users, clock, globe, check`.
- Filters: `imageExists`, `readableDate` (e.g. "Sept 2025"), `isoDate`, `year`, `absoluteUrl`,
  `where(key, value)`, `limit(n)`, `jsonify`, `excerpt(n)` (word-boundary, no mid-word cut).
- Collections: `work` (`src/work/*.md`, sorted by `order` asc), `featuredWork` (`featured: true`),
  `walks` (`src/walks/*.md`, by `order`), `writing` (`src/writing/*.md`, by `date` desc).

**Implemented signatures:**
- `{% media src, alt, opts %}` — file existence is checked under `src/` (leading `/` stripped).
  - Real file → `<figure class="media [opts.class]" data-ratio="…" data-focus="…"><img src alt [sizes]
    [eleventy:widths] [loading="eager" fetchpriority="high"]>[<figcaption>…</figcaption>]</figure>`;
    the transform then turns the `<img>` into `<picture>`. Without `ratio` the image keeps its natural
    proportions.
  - Missing/empty `src` → `<figure class="media media--placeholder" data-ratio="…" data-kind="…"
    aria-hidden="true"><svg class="placeholder placeholder--<kind>">…</svg></figure>` — no caption, no
    text. Default ratio 4/3 (4/5 for `portrait`).
  - `ratio`: one of `1/1 5/4 4/3 3/2 16/10 16/9 2/1 21/9 4/5 3/4 2/3 9/16` (`"3:2"` also accepted);
    anything else snaps to the nearest. `"auto"`/omitted = natural.
  - `kind` → drawing: `photo` frame · `drawing`/`water` hiti spout · `portrait` head & shoulders ·
    `walk` dotted footpath + pin · `robotics` robot · `map` contours · `heritage` tiered temple.
    Unknown kinds use `photo`.
  - `caption` (HTML allowed), `eager` (bool), `sizes` (string), `widths` (array → `eleventy:widths`),
    `class`, `focus` (`top|bottom|left|right|center`).
- `{% icon "name" %}` / `{% icon "name", "icon--l extra" %}` → `<svg class="icon icon--name …"
  viewBox="0 0 24 24" width="24" height="24" … aria-hidden="true" focusable="false">`. Sized by CSS
  to 1.15em. Unknown names **throw** (build fails with the list of valid names). Extra icons beyond
  the spec: `arrow-left, chevron-down, chevron-left, chevron-right, plus, minus`.
- Filters: `imageExists(path)` / alias `fileExists(path)` → boolean (any file type, e.g. the CV);
  `readableDate(date, "day"?)` → "Sept 2025" / "20 Sept 2025" / "2025" (accepts Date, "YYYY",
  "YYYY-MM", "YYYY-MM-DD"); `isoDate` → "2025-09-20" (or partial); `year`; `absoluteUrl(url, base?)`
  (base defaults to `site.url`); `where(arr, "key.path", value?)` (dotted keys; bare keys fall back to
  `item.data.key`; arrays match by inclusion; no value = truthy); `limit(arr, n)`; `jsonify` (escapes
  `<`, `>`, `&` — safe inside `<script type="application/ld+json">`); `excerpt(text, n=160)` (n =
  max characters, strips tags, cuts at a word boundary, adds "…"); extra: `arrayify` (string → [string]).
- Collections skip items with `eleventyExcludeFromCollections: true` or `draft: true`.

## 7. Front matter schemas

**Work** (`src/work/<slug>.md`, layout `layouts/project.njk`, permalink `/work/<slug>/`):
```yaml
title, summary (1–2 sentences, used on cards & og:description), domain: water|heritage|education,
category (filter label), role, client, location, years, featured: bool, order: n,
cover: /assets/images/work/<slug>/cover.jpg, coverAlt, tags: [], highlights: [],
links: [{ label, url }], gallery: [{ src, alt, caption }],
map: { center: [lat, lng], zoom, layers: [{ file, color, label }] }   # optional
```
**Walk** (`src/walks/<slug>.md`, permalink `/walks/<slug>/`): `title, summary, order, cover, coverAlt,
duration, distance, groupSize, languages, meetingPoint, price, stops: [{ name, deva, note }],
suitableFor, pastGroups: []` — omit any unknown field; templates must hide empty fields.
**Writing** (`src/writing/<slug>.md`, `permalink: false` unless it has a body): `title, date, type:
article|feature|quote|citation|video|talk, outlet, url, summary, role (e.g. co-author, quoted,
technical contributor)`.
**Photos** (`src/_data/photos.yml`): list of `{ src, alt, caption, place, year, category:
water|heritage|walks|robotics|portfolio }`.

## 8. Content & voice rules

- Never invent facts. If a value is unknown, omit the field (templates hide empty fields) and add it to
  `docs/LAUNCH-CHECKLIST.md`. No visible “TBC”, “coming soon” or developer text on public pages.
- Client-facing voice: first person, plain, specific; lead with what the reader gets.
- Expand acronyms on first use per page (KMC, LMC, CIUD, NEC, OLE, GWR, KVWSB).
- Use reconciled facts from `docs/FACTS.md`.

## 9. Accessibility & performance rules

- One `<h1>` per page, no skipped heading levels, landmarks: header / nav / main#main / footer.
- Everything works without JS (filters show all items; form posts normally; nav links visible via
  disclosure fallback — with no JS the mobile nav panel is simply shown open).
- Devanagari text has `lang="new"` (Newar terms) or `lang="ne"` (Nepali).
- Header nav: `aria-current="page"` on an exact URL match, `aria-current="true"` on a section
  ancestor (e.g. /work/ while on /work/hiti/) — styled identically.
- External links: `rel="noopener"`, include an arrow-up-right icon + visually-hidden “(opens in new
  tab)” only when `target="_blank"` is used (prefer same tab).
- No layout shift: header/footer are server-rendered; images get width/height from the transform.
- Root font-size untouched (respect user settings). No `html { font-size: 16px }`.
- Each page: unique `<title>` (`Page — Hrishav Raj Joshi`), meta description ≤ 155 chars, canonical,
  OG + Twitter card (default `/assets/og/og-default.png`, override with `ogImage`).

## 10. How page builders use this

Open **`/styleguide/`** (run `npm start`, then http://localhost:8080/styleguide/) — every pattern below
is rendered there with its source. Copy markup from it; do not invent parallel classes.

### Front matter keys (read by `layouts/base.njk` + `partials/head-meta.njk`)

| Key | Effect |
|---|---|
| `layout` | `layouts/base.njk` (or your own layout that chains to it). |
| `title` | `<title>` becomes `{{ title }} — Hrishav Raj Joshi`; also og/twitter title. |
| `metaTitle` | Full `<title>` override (the home page uses this). |
| `description` | Meta/OG description (≤ 155 chars). Falls back to `summary`, then `site.description`. |
| `pageCss` | String or array. `"work"` → `/assets/css/pages/work.css`; values starting with `/` are used as-is. |
| `pageJs` | String or array. `"map"` → `/assets/js/map.js` (defer, in order); `/…` used as-is. |
| `jsonld` | `person` → includes `partials/jsonld-person.njk` (home, about). |
| `structuredData` | Object or array of objects → one `<script type="application/ld+json">` each (use from a layout via front matter or `eleventyComputed`). Templates that `{% extends "layouts/base.njk" %}` can instead fill `{% block jsonld %}`. |
| `ogImage` | Root-relative image for og:image/twitter:image (default `/assets/og/og-default.png`); `ogImageAlt`, `ogTitle`, `ogType` (`article` for writing) also accepted. |
| `noindex` | `true` → `<meta name="robots" content="noindex, follow">` and excluded from the sitemap. |
| `sitemap` | `false` → excluded from the sitemap. |
| `bodyClass` | Optional class on `<body>`. |
| `eleventyNavigation` | **Not used.** Navigation comes from `src/_data/nav.yml`. |

Leaflet pages: `pageCss: ["/assets/vendor/leaflet/leaflet.css", "work"]`,
`pageJs: ["/assets/vendor/leaflet/leaflet.js", "map"]`. Tiles must come from `*.basemaps.cartocdn.com`.
On case studies (`src/work/*.md`) this is automatic: `work.11tydata.js` adds the Leaflet files and the
"Where the work is" section only once at least one `map.layers` GeoJSON file exists.
Tiles: CARTO Voyager `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=<site.mapTileKey>`.
CARTO now requires `?key=`; map.js only adds the tile layer when `site.mapTileKey` is set — without a
key, maps render basemap-free (layers on hatched paper).

### Data available in every template

`site` (site.yml: `name, url, roles[], positioning, tagline, description, email, phone, phoneHref,
whatsapp, location, coordinates{lat,lng}, nec, necLine, education, cv, social{linkedin,medium},
formspree, replyTime, ogImage`), `nav` (`items[]{label,url}`, `cta{label,url}`), `stats[]`
(`id, value, label, detail`), `clients[]` (`name, short, kind`), `services` (`items[]{slug, topic,
icon, title, summary, deliverables[], idealFor}`, `process[]{step, text}`), `faq[]` (`question,
answer`), `timeline[]` (`years, role, org, type, desc`), `skills[]` (`group, icon, items[]`),
`recognition` (`awards[]{title, org, date|period, beyondWork}`, `press[]{outlet, place, date, role,
title, note, url}`), `build.year`. `photos` exists only once the Photos builder adds `photos.yml` —
guard with `{% if photos %}`. CV link: `{% if site.cv | fileExists %}…{% endif %}`.

### Shortcodes

```njk
{% media "/assets/images/work/hiti-research/cover.jpg", "Hiti spout at Mangalbazar at dawn",
   { ratio: "3/2", kind: "heritage", caption: "Mangalbazar, 2023" } %}
{% media page.data.cover, "", { ratio: "3/2", kind: "water" } %}          {# card thumbnail: alt="" #}
{% media "/assets/images/portrait/hrj.jpg", "Hrishav Raj Joshi", { ratio: "4/5", kind: "portrait", eager: true, focus: "top", sizes: "(min-width: 56rem) 28rem, 100vw" } %}
{% icon "arrow-right" %}   {% icon "whatsapp", "icon--l" %}
```
Missing image files never break the build — they render the line-art placeholder. Raw `<img>` /
Markdown images must point at files that exist.

### Page hero (every inner page starts with this, inside `<main>`)

```html
<header class="page-hero">
  <div class="container page-hero__inner">
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <ol><li><a href="/">Home</a></li><li><a href="/work/">Work</a></li><li><span aria-current="page">Rajkulo canal</span></li></ol>
    </nav>                                             <!-- optional -->
    <p class="eyebrow">Heritage engineering · 2022–present</p>
    <h1 class="page-hero__title">Rajkulo royal canal</h1>
    <p class="lede">One-sentence summary of the page.</p>
    <div class="cluster page-hero__actions">…buttons…</div>      <!-- optional; before the ledger so phones see it -->
    <dl class="ledger ledger--compact page-hero__meta">…</dl>   <!-- optional -->
  </div>
</header>
```
Add `page-hero--split` and a `<div class="page-hero__aside">…</div>` child for a drawing/photo column.

### Link card (whole card clickable via the title link's `::after`)

```html
<article class="card card--link" data-domain="heritage">
  <div class="card__media">{% media item.data.cover, "", { ratio: "3/2", kind: "heritage" } %}</div>
  <div class="card__body">
    <p class="card__meta"><span>Heritage</span><span>2022–present</span></p>
    <h3 class="card__title"><a href="{{ item.url }}">{{ item.data.title }}</a></h3>
    <p class="card__text">{{ item.data.summary }}</p>
    <div class="card__footer"><span class="card__cue" aria-hidden="true">Read the case study{% icon "arrow-right" %}</span></div>
  </div>
</article>
```
Never wrap a card in `<a>`; never use `role="button"`. Other links inside a link card stay clickable
(they're lifted above the overlay automatically). Put cards in `.grid.grid--3` (or `--2`).

### Sections

```html
<section class="section [section--alt]">
  <div class="container">
    <header class="section-head">
      <p class="eyebrow">Selected work</p>
      <h2>Projects</h2>
      <p class="lede">…</p>
      <a class="link-arrow section-head__action" href="/work/">All work{% icon "arrow-right" %}</a>
    </header>
    …
  </div>
</section>
```
Dark band: `<section class="section band--dark">` (add `band--edge` for the hatched top edge); CTA
band pattern: `band--dark band--edge` > `.container.cta-band` (see styleguide).

### Rules for page CSS (`src/assets/css/pages/<area>.css`)

1. Wrap everything in `@layer page { … }`.
2. **Page-specific layout only** — grid placement, a hero composition, spacing between this page's
   sections. Reuse components; **do not re-implement buttons, cards, tags, labels, eyebrows, form
   fields, ledgers, notices or headings**, and do not restyle them per page. If something is missing,
   it belongs in `main.css` (flag it to the foundation owner), not in page CSS.
3. Use tokens only: colours via semantic aliases (`--text`, `--accent`, …), sizes via `--step-*`,
   spacing via `--space-*`, radii/shadow/ease tokens. No hex values, no ad-hoc font sizes.
4. No `style=""` attributes and no `<style>` blocks (CSP). No inline `<script>` or `on*=` handlers.
5. Breakpoints in use: 40rem, 48rem (header nav), 52rem (`.split`), 56rem, 60rem, 64rem.
6. Everything must work without JS; wrap JS-only controls (filters, lightbox triggers) in `.js-only`.
