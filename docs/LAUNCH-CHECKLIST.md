# Launch checklist

Everything the site still needs from you, in one place. Nothing on this list breaks the build:
missing photos show as line drawings, missing facts are simply left out, and sections that need
a file (the photo gallery, the CV button, the Rajkulo map, the enquiry form) appear on their own
once the file or setting exists.

Paths starting with `src/` are files in this project. Image paths are written the way the site
uses them: `/assets/images/…` means the file `src/assets/images/…`.

---

## 1. Accounts and setup (before launch)

- [ ] **Formspree form.** Create a free form at formspree.io and put its ID (the part after
      `/f/`, e.g. `xyzabcd`) in `src/_data/site.yml` → `formspree: "xyzabcd"`. The Work with me
      page then switches from the "email / WhatsApp / phone" block to the full enquiry form.
  - [ ] Send one test enquiry and check the email subject reads
        `Website enquiry: <topic> — <name>`.
  - [ ] Submit once **with JavaScript turned off**. Visitors should land on
        `https://hrishavjoshi.com/thanks/`. Formspree only honours that redirect (the hidden
        `_next` field) on some plans; if it shows Formspree's own thank-you page instead, either
        set the redirect in the Formspree dashboard or remove the `_next` line from
        `src/work-with-me/index.njk`.
- [ ] **CV.** Save your current CV as `src/assets/cv/HRJ_CV.pdf` (exact name). The "Download CV"
      buttons (About hero, footer, Work with me contact details) appear automatically.
- [ ] **GitHub Pages source.** In the GitHub repository: Settings → Pages → Build and deployment →
      Source: **GitHub Actions**. Every push to `main` then builds and publishes the site
      (`.github/workflows/deploy.yml`).
- [ ] **Domain (DNS for hrishavjoshi.com → GitHub Pages).** `src/CNAME` already contains
      `hrishavjoshi.com`. At your domain registrar, add (check GitHub's "Managing a custom domain"
      page for the current values):
  - `A` records for `hrishavjoshi.com` → `185.199.108.153`, `185.199.109.153`,
    `185.199.110.153`, `185.199.111.153` (and the matching `AAAA` records if you want IPv6:
    `2606:50c0:8000::153` … `2606:50c0:8003::153`);
  - `CNAME` for `www` → `<your-github-username>.github.io`.
  - Then in Settings → Pages enter `hrishavjoshi.com` as the custom domain, wait for the
    certificate, and tick **Enforce HTTPS**.
- [ ] **Map basemap (optional).** CARTO now needs a key for street-map tiles. Request a free
      non-commercial key at https://carto.com/basemaps/apikey and put it in `src/_data/site.yml` →
      `mapTileKey: "…"`. Without it, project maps draw their lines on plain paper (still useful).
- [ ] After the first deploy, open every page once on a phone and on a computer.

---

## 2. Images to add

Long edge **at least 2000 px**, JPEG for photos (PNG for drawings); the build makes all smaller
sizes. **When you add a photo, rewrite its alt text to describe the photo you actually chose**
(`coverAlt` in the page's front matter, `alt` in `photos.yml`, `imageAlt` on walk stops); every
file below already has text written for an *expected* photo. Folder rules and tips:
`src/assets/images/README.md`.

### Portrait (About + Work with me)
- [ ] `/assets/images/portrait/hrishav-raj-joshi.jpg`: head and shoulders, portrait orientation
      (shown at 4:5, cropped from the top). Used in the About hero and beside the contact
      details. Alt: "Hrishav Raj Joshi, civil engineer, heritage practitioner and educator".
- [ ] `/assets/images/portrait/field-survey.jpg`: landscape (3:2), you measuring or surveying a
      hiti in the field. Alt in `src/about/index.njk`: "Hrishav Raj Joshi measuring a hiti stone
      spout during a field survey"; change it if the photo shows something else.

### Work case studies (cover = page hero, card image and social-share image)
- [ ] `/assets/images/work/hiti-research/cover.jpg`: a carved stone hiti spout in a sunken
      courtyard with water running, or the CAD cross-section. Also the large image in the home
      page's "Selected work" (3:2 crop).
- [ ] `/assets/images/work/groundwater-recharge/cover.jpg`: a recharge site (KMC core area,
      Balaju–Nagarjun or Lalitpur).
- [ ] `/assets/images/work/rajkulo-canal/cover.jpg`: a stretch of the Rajkulo channel in Lalitpur.
- [ ] `/assets/images/work/robotics-education/cover.jpg`: students building or testing a robot in
      a Lalitpur public school (see photo consent in section 3).
- [ ] `/assets/images/work/water-heritage-walks/cover.jpg`: a walking group at a hiti courtyard.
- [ ] `/assets/images/work/little-buddha-bhairav/cover.jpg`: the 40 ft repoussé Little Buddha in
      Lumbini, or the Bhairav face.
- [ ] `/assets/images/work/dhungedhara-thecho/cover.jpg`: the CAD section/elevation of the Thecho
      stone spout.
- [ ] Optional galleries: add `gallery: [{ src, alt, caption }]` to any `src/work/*.md` (an example
      is commented out in `hiti-research.md`, e.g. `/assets/images/work/hiti-research/section-01.png`
      for the CAD cross-sections). Missing files are skipped.

### Walks
- [ ] `/assets/images/walks/hero.jpg`: /walks/ hero (portrait 4:5 on desktop, cropped to 3:2 on
      phones), a group listening at a sunken hiti courtyard. Alt: `heroImageAlt` in
      `src/walks/index.njk`.
- [ ] `/assets/images/walks/water-heritage/cover.jpg`: a group around a sunken hiti courtyard.
- [ ] `/assets/images/walks/food-heritage/cover.jpg`: a food heritage walk in old Lalitpur.
- [ ] `/assets/images/walks/urban-heritage/cover.jpg`: a group in a historic square in Lalitpur.
- [ ] Optional stop photos on the water walk (each appears once the file exists):
      `/assets/images/walks/water-heritage/rajkulo.jpg` (the Rajkulo canal),
      `/assets/images/walks/water-heritage/pukhu.jpg` (a pukhu pond),
      `/assets/images/walks/water-heritage/hiti.jpg` (a sunken hiti with water running).

### Photographs (/photos/)
The Photos page, its menu item and the home page photo strip stay hidden until **the first** of
these files exists. Shapes are set in `src/_data/photos.yml`.
- [ ] `/assets/images/photos/water/hiti-spout.jpg`: a working spout, water running into the basin.
      Landscape, large tile; `featured: true` makes it the page's social-share image.
- [ ] `/assets/images/photos/heritage/repousse-sculpture.jpg`: detail of a repoussé sculpture
      (portrait, tall tile).
- [ ] `/assets/images/photos/walks/courtyard-lane.jpg`: a lane or courtyard on a walk route
      (portrait, tall).
- [ ] `/assets/images/photos/water/rajkulo-canal.jpg`: a stretch of the Rajkulo canal
      (panoramic, wide tile).
- [ ] `/assets/images/photos/portfolio/valley-panorama.jpg`: across the Kathmandu Valley
      (panoramic, wide).
- [ ] `/assets/images/photos/robotics/robotics-class.jpg`: students with a robot in class
      (portrait, tall).
- [ ] `/assets/images/photos/water/spout-head.jpg`: close-up of a carved spout head
      (portrait, tall).
- [ ] `/assets/images/photos/heritage/patan-durbar-square.jpg`: tiered temple roofs, Patan
      Durbar Square (landscape, large).
- [ ] `/assets/images/photos/walks/walk-group.jpg`: a walk group at a hiti (landscape).
- [ ] `/assets/images/photos/robotics/robotics-challenge.jpg`: teams at the inter-school
      challenge (landscape).
- [ ] `/assets/images/photos/portfolio/old-city-street.jpg`: an old-city street (landscape).
- [ ] `/assets/images/photos/portfolio/light-and-texture.jpg`: a personal favourite (landscape).
- [ ] For each photo you add: rewrite `alt`, `caption` and `place` in `src/_data/photos.yml` to
      match it, and add `year` only if you know it. Add `home: true` to the ones you want in the
      home page strip (otherwise the first six with files are used).

### Drawings and maps
- [ ] Optional: `/assets/images/drawings/hiti-cross-section-cad.png`, your own CAD cross-section
      of a hiti (PNG, ≥ 2000 px). It replaces the generic diagram in the "Citation trail" on
      /writing/.
- [ ] Rajkulo map data (WGS 84 GeoJSON, see `src/assets/maps/README.md`):
      `src/assets/maps/rajkulo-canal.geojson` (canal route) and
      `src/assets/maps/rajkulo-nodes.geojson` (key points; optional `name`, `deva`, `note`).
      The "Where the work is" map section appears on /work/rajkulo-canal/ once one exists.

---

## 3. Facts to confirm or supply

Unknown details are left off the site, never guessed. Confirm the wording below or send the
missing fact; the file to edit is given for each.

### Identity, wording and positioning
- [ ] Positioning line (still a draft) in `src/_data/site.yml` → `positioning`. It also sits right
      under the roles "Civil engineer · Heritage practitioner · Educator"; check the role words
      read well together ("a heritage guide and a teacher").
- [ ] Home page title in search results: "Hrishav Raj Joshi — Engineer, heritage practitioner,
      educator" (`metaTitle` in `src/index.njk`, kept ≤ 60 characters).
- [ ] Home hero routes: "For municipalities & non-profits → Commission a study", "For visiting
      groups → See the heritage walks", "For schools → Robotics for your school" (`routes:` in
      `src/index.njk`).
- [ ] Home "Three ways" question line: "How does a place keep what works — its water, its
      heritage, its know-how — and hand it on?"
- [ ] Hiti drawing caption: "Fig. 1 · A hiti, in section / Not to scale" (it is a schematic).
- [ ] About hero "Practice" line: "Heritage water systems, groundwater recharge, heritage walks and
      robotics education".
- [ ] About bio: "three groundwater-recharge projects I lead as engineer with the Centre for
      Integrated Urban Development (CIUD)" still describes the work.
- [ ] About "How I work": the four principles (front matter of `src/about/index.njk`). The old
      claim "managed water for a city of 200,000 people" was dropped; add it back only with a
      source.
- [ ] Work with me: availability line "Open to new projects and collaborations", the free
      30-minute scoping call, and the budget bands (Under NPR 50,000 / NPR 50,000–150,000 /
      NPR 150,000–500,000 / NPR 500,000+ / International, US dollars) in
      `src/work-with-me/index.njk`.

### Devanagari and Newar terms (spelling and language)
Only च्याफि, सलिचा, नाभिमण्डल, हितिदुं and ग हिति came from the old site. Please confirm, correct or
remove these (and say whether each is Nepali or Newar):
- [ ] Home "Three ways": जल (jal · water), सम्पदा (sampada · heritage), शिक्षा (shiksha ·
      education) in `src/index.njk` → `ways:`. Swap for Newar terms if you prefer.
- [ ] ढुङ्गे धारा (dhunge dhara) in `src/about/index.njk` and `src/work/dhungedhara-thecho.md`
      (one spelling used in both; the other common spelling is ढुंगे धारा).
- [ ] यल (Yala, Newar name for Lalitpur) in `src/work/robotics-education.md`.
- [ ] राजकुलो (Rajkulo) in `src/work/rajkulo-canal.md`.
- [ ] गुठी (guthi) in `src/work/water-heritage-walks.md`.
- [ ] Supply Devanagari for the water-walk stops if wanted (Rajkulo, Pukhu, Hiti, Jaru, Guthi):
      add `deva:` to each stop in `src/walks/water-heritage.md`.

### Organisations and press
- [ ] **Reconstruction Authority.** The old site and the site say "Nepal Reconstruction
      Authority"; the official post-2015 body is the *National* Reconstruction Authority (NRA). If
      that is the one, change it in `docs/FACTS.md`, `src/_data/clients.yml`,
      `src/_data/timeline.yml` and `src/walks/urban-heritage.md`.
- [ ] **CREEW.** Expanded on the site as "Center of Research for Environment, Energy and Water
      (CREEW)" (not in the old site): confirm, then record it in `docs/FACTS.md`. For the
      symposium paper (`src/writing/creew-groundwater-symposium.md`) also send: your role
      (author, co-author or presenter), co-authors, the month, and a public link to the synopsis
      if there is one (the page now offers "email me for a copy").
- [ ] Setopati: the exact headline. The site shows "Flames of September" with the deck "When
      Nepal’s political upheaval touched its heritage" (`src/writing/flames-of-september.md`).
- [ ] Nepal News 2025 year-end review: the URL, exact title and date if you have them
      (`src/writing/nepal-news-year-end-review.md`, field `url`). Only verified links are added.
- [ ] TU Berlin thesis: title, author and public link, if you want them shown
      (`src/writing/tu-berlin-thesis-citation.md`). The site names it only as "a TU Berlin
      master’s thesis (2023)".
- [ ] Rethinking the Future and Architexturez: URLs of the republished drawings, if you want them
      linked (`src/_data/recognition.yml`, `src/writing/nepali-times-water-spouts.md`).
- [ ] Hyperallergic: "quoted me as a cultural heritage advocate" matches how the article
      introduces you.
- [ ] Medium (https://medium.com/@JocHrishav) is active and has posts; /writing/ ends with "Read
      more on Medium".
- [ ] Robotics tutorial series (`src/writing/ole-nepal-robotics-tutorials.md`): the YouTube
      playlist URL, the year it started and your role. When you add a date, also remove
      `undated`, `group` and `eleventyExcludeFromCollections` from that file.

### Projects (src/work/)
- [ ] Rajkulo: who the feasibility study was for (client), whether it is still 2022–present, and
      the map centre/zoom (now `[27.6588, 85.3247]`, zoom 14 — the old site's values, which are
      also your Mangalbazar coordinates, not a documented study location).
- [ ] The map's "Open in OpenStreetMap" link (openstreetmap.org) and the CARTO / OpenStreetMap
      credits are the only external links the map adds; fine to keep? (Shown only once the map
      has data.)
- [ ] Hiti field investigation: who it was for, if anyone.
- [ ] Groundwater recharge: all three projects still active.
- [ ] Thecho stone spout: was it built, and is there a photo? The page describes the 2023
      groundwork only.
- [ ] Yala Mayor’s Cup: the edition count (the old site says both "3 editions" and "Second
      Mayor’s Cup 2025"); the site uses neutral wording.
- [ ] /work/water-heritage-walks/ and /walks/water-heritage/ cover the same programme. Keep both,
      or turn the work entry into a short case study pointing to the walk page?

### Walks (src/walks/)
- [ ] Practical details per walk, as front-matter fields in each `src/walks/*.md`: `duration`,
      `distance`, `groupSize`, `languages`, `meetingPoint`, `price`. They appear in the hero
      ledger (and duration on the cards) as soon as you add them.
- [ ] Stops for the food and urban heritage walks (name, short gloss, what we see there;
      Devanagari optional). Without stops those pages skip "Along the way".
- [ ] Food walk: what it covers (places, dishes, themes). The old site only says it exists.
- [ ] "Jaru": the old site says "Jaru rituals"; the water walk glosses it as "water rituals".
      Confirm the meaning and wording.
- [ ] Past groups, and permission to name them: Prakriti Foundation ("senior technical water
      professionals"; the old site said "high-level"), World Economic Forum Global Shapers,
      Brunel University (academic field guide for MSc research).
- [ ] "50+ walks led since 2017" (`src/_data/stats.yml` and the timeline).
- [ ] Booking FAQ answers (add to `src/_data/faq.yml` with `tags: [walks]`): how long a walk lasts,
      cost, group size limits, where walks start, languages, what to wear or bring, accessibility,
      cancellation or rain plans.

### Photographs and people
- [ ] Permission to publish photos of identifiable people, especially students (minors) in the
      robotics photos and participants in walk-group photos.
- [ ] You are happy to receive requests to use or print your photographs (the page invites
      requests only; no prices or licence terms).
- [ ] The one-line set descriptions in the Photos "Key to the sets"
      (`src/photos/index.11tydata.js` → `CATEGORIES`).

### About: timeline and awards
- [ ] Timeline order: rendered exactly as in `src/_data/timeline.yml`, which is not strictly
      newest-first (CIUD 2022–present sits after Jun–Dec 2024; Heritage Walk Guide 2017–present
      after 2018–2020). Reorder the file if you want strict order.
- [ ] Old-site items not on the site because they are not in `docs/FACTS.md`: SamYubaa heritage
      coordinator, school heritage-awareness programmes, post-earthquake monument documentation
      for KMC, Heritage Ambassador, HAP Spring School logistics. Add any you want to
      `timeline.yml` or `recognition.yml`.
- [ ] Rotaract "Outstanding Secretary" (District 3292): the year, if known.

---

## 4. Nice to have

- [ ] A short quote from a past walk group (with permission) for /walks/; the site has no
      testimonials yet.
- [ ] A list of the languages you guide in, to turn the walk "Language" field into a dropdown.
- [ ] A public URL for the OLE Nepal YouTube robotics tutorials (none in the old site, so none is
      linked).
- [ ] More `gallery:` images on case studies (CAD sections, site photos).
- [ ] Real "last updated" dates in the sitemap: the sitemap now lists pages without dates (file
      dates on GitHub Actions are always the deploy date). If you want them, add
      `date: git Last Modified` in a data file and `fetch-depth: 0` to the checkout step in
      `.github/workflows/deploy.yml`.
