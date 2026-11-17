# hrishavjoshi.com

The personal website of **Hrishav Raj Joshi**: civil engineer, heritage practitioner and educator
in Lalitpur, Nepal. It presents the work (hiti and groundwater studies, the Rajkulo canal,
robotics in schools), the heritage walks, writing and press, photographs, and a "Work with me"
page for enquiries.

The site is built with [Eleventy](https://www.11ty.dev/) (a static site generator): pages are
plain text files (Markdown and Nunjucks templates) plus a few data files, and every push to
GitHub publishes the site automatically. There is no database and no admin panel: to change the
site you edit a file and push.

- **Before launch:** work through [`docs/LAUNCH-CHECKLIST.md`](docs/LAUNCH-CHECKLIST.md) (photos
  to add, facts to confirm, Formspree, CV, domain).
- **How it is designed and built:** [`docs/DESIGN.md`](docs/DESIGN.md) (colours, type,
  components, rules for pages). Facts used everywhere: [`docs/FACTS.md`](docs/FACTS.md).

---

## Run it on your computer

You need [Node.js](https://nodejs.org/) 20 or newer (the LTS version is fine).

```sh
npm install     # once, and again after package.json changes
npm start       # builds the site and serves it at http://localhost:8080
```

`npm start` rebuilds and reloads the browser every time you save a file. Stop it with `Ctrl+C`.
While it runs, **http://localhost:8080/styleguide/** shows every component with copyable
markup (the styleguide is only built locally, never published).

To build once without a server (this is what GitHub does): `npx @11ty/eleventy`. The finished
site is written to `_site/` (don't edit files there; they are overwritten on every build).

---

## Where things live

```
src/                      everything that becomes the site
  _data/                  shared information (see below)
  work/                   one Markdown file per case study  → /work/<file-name>/
  walks/                  one Markdown file per walk        → /walks/<file-name>/
  writing/                one Markdown file per article, citation or talk (listed on /writing/)
  index.njk  about/  work-with-me/  photos/  …   the other pages
  assets/images/          photos and drawings (see assets/images/README.md)
  assets/cv/HRJ_CV.pdf    your CV (add it; the download buttons appear by themselves)
  assets/maps/            GeoJSON map layers (see assets/maps/README.md)
  assets/css/  assets/js/ styles and scripts
  _includes/              page layouts and shared pieces (header, footer …)
docs/                     DESIGN.md, FACTS.md, LAUNCH-CHECKLIST.md
.github/workflows/        the automatic deploy
```

### Shared information: `src/_data/*.yml`

Edit these once and every page that uses them updates.

| File | What it holds |
|---|---|
| `site.yml` | Name, roles, positioning line, email, phone/WhatsApp, location, social links, NEC number, **Formspree ID**, map key |
| `nav.yml` | Menu items and the "Work with me" button |
| `stats.yml` | The numbers strip (300+ students, 50+ walks …) |
| `clients.yml` | "Worked with and for" organisations (full name + short form) |
| `services.yml` | Services on Work with me, and the four-step process |
| `faq.yml` | Questions and answers (`tags: [walks]` also shows one on /walks/) |
| `timeline.yml` | The career logbook on About |
| `skills.yml` | Skills and tools on About |
| `recognition.yml` | Awards and press |
| `photos.yml` | The photo gallery (see "Add a photo") |

YAML tips: keep the indentation exactly as in the surrounding lines (spaces, not tabs), and put
text containing a colon (`:`) in quotes.

---

## Add or change content

Each content file starts with **front matter**: settings between two `---` lines. Below that is
the page text in Markdown (blank line between paragraphs, `**bold**`, `[link text](/url/)`).
Leave out any field you don't know: the site hides empty fields and never shows "TBC".

### Add a project (case study)

Create `src/work/<short-name>.md`; the address becomes `/work/<short-name>/`. Put its cover photo
at `src/assets/images/work/<short-name>/cover.jpg`.

```markdown
---
title: Stone spout survey, Bungamati
heroTitle: Stone spout survey, <em>Bungamati</em>
summary: One or two sentences: what the project was and what you did. Shown on cards and in search results.
domain: water                # water | heritage | education
category: Water engineering · survey
role: Lead engineer
client: Lalitpur Metropolitan City
location: Bungamati, Lalitpur
years: "2025"
featured: false              # true → large card on /work/ and on the home page
order: 8                     # position on /work/ (1 = first)
cover: /assets/images/work/stone-spout-bungamati/cover.jpg
coverAlt: The stone spout at Bungamati, with water running into the basin
highlights:
  - A measured survey of the spout and its conduit
  - Hydraulic discharge calculations
tags:
  - Hydraulics
links:
  - label: Read the article
    url: https://example.com/article
---
What the place needed, what you did, and what came of it. A few short paragraphs.
```

Optional extras (see the comment at the top of `src/work/work.11tydata.js`): `gallery:` photos,
`scope:` numbered steps, `diagram: hiti`, a `map:` with GeoJSON layers, `ctaTitle` / `ctaTopic`
for the closing button.

### Add a walk

Create `src/walks/<short-name>.md` (address `/walks/<short-name>/`), cover photo at
`src/assets/images/walks/<short-name>/cover.jpg`.

```markdown
---
title: Temple walk
heroTitle: Temple <em>walk</em>
summary: One or two sentences about the walk, shown on cards and in search results.
kicker: Walk programme · Temples
programme: Temples
domain: heritage             # water | heritage
order: 4
cover: /assets/images/walks/temple-walk/cover.jpg
coverAlt: A walking group in front of a tiered temple in Patan
duration: About 3 hours
groupSize: Up to 15 people
languages: English, Nepali
meetingPoint: Patan Durbar Square
stops:
  - name: Krishna Mandir
    gloss: stone shikhara temple
    note: What we look at here, in a sentence or two.
suitableFor:
  - Visiting delegations
themes:
  - Architecture
---
Why you lead this walk and what people take away from it.
```

The "Request a walk" buttons on the page automatically open the enquiry with this walk chosen.

### Add a writing or press item

Create `src/writing/<short-name>.md`. Most items are listed on /writing/ only (no page of their
own), so keep `permalink: false`.

```markdown
---
title: Why Patan's stone spouts still run
date: 2026-03-01
datePrecision: month          # month | year (how much of the date to show)
type: article                 # article | feature | quote | citation | video | talk
outlet: The Kathmandu Post
url: https://example.com/the-article     # only a link you have checked
role: Author
domain: water                 # water | heritage (colours the label)
summary: >-
  One or two sentences on what the piece is about.
permalink: false
---
```

### Add a photo

1. Save the photo (long edge at least 2000 px) as
   `src/assets/images/photos/<set>/<file-name>.jpg`, where `<set>` is one of `water`,
   `heritage`, `walks`, `robotics`, `portfolio`.
2. Add an entry to `src/_data/photos.yml` (the file explains every field):

```yaml
- src: /assets/images/photos/heritage/golden-temple.jpg
  alt: Gilded roof struts of the Golden Temple courtyard, Patan.   # what the photo shows
  caption: Golden Temple
  place: Patan
  year: 2024              # only if you know it
  category: heritage
  shape: tall             # leave out for landscape; tall | large | wide
  home: true              # optional: show it in the home page strip
```

The photo gallery, its menu item and the home page strip appear once the first photo exists.
For other images (portrait, covers, drawings) just put the file at the path listed in
`docs/LAUNCH-CHECKLIST.md`; the line drawing that stands in for it is replaced automatically.

---

## How publishing works

1. You push your changes to the `main` branch on GitHub.
2. GitHub Actions (`.github/workflows/deploy.yml`) installs the packages, builds the site with
   Eleventy and publishes `_site/` to GitHub Pages. It takes a minute or two; the **Actions** tab
   shows progress and any error.
3. `src/CNAME` tells GitHub Pages to serve the site at **https://hrishavjoshi.com** (the domain's
   DNS must point to GitHub; see the launch checklist).

If a build fails, the previous version stays online. The most common cause is an image written
as a plain `<img>` or Markdown image whose file doesn't exist (this fails on purpose, to catch
typos); the error message names the file.

---

## One strict rule: no inline styles or scripts

The site sends a strict Content Security Policy (in `src/_includes/partials/head-meta.njk`), so
browsers **ignore** anything inline:

- no `style="…"` attributes and no `<style>` blocks (in SVG too);
- no `<script>…</script>` with code in the page and no `onclick=` style attributes
  (`<script type="application/ld+json">` data blocks are fine).

Styles go in `src/assets/css/main.css` (shared components) or `src/assets/css/pages/<page>.css`;
scripts go in `src/assets/js/*.js`. Pages load extra files through front matter
(`pageCss: work`, `pageJs: [map]`). If you embed something from another site (a video, a form,
fonts from a new provider), its address has to be added to that policy, or the browser will block
it. `docs/DESIGN.md` §2 and §10 explain the details.
