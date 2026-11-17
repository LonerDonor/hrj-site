// Directory data for /walks/ — applies to every file in src/walks/.
// Walk pages are src/walks/<slug>.md (output /walks/<slug>/, layout walk.njk).
// src/walks/index.njk overrides `layout` in its own front matter.
//
// Walk front matter (docs/DESIGN.md §7, plus optional extras read by
// layouts/walk.njk). Omit anything unknown — the templates hide empty fields:
//   title, heroTitle (title with <em> markup), summary, kicker (hero eyebrow),
//   programme (card label), domain (water|heritage), featured, order,
//   cover, coverAlt, coverKind ({% media %} placeholder kind),
//   area, format, duration, distance, groupSize, languages, meetingPoint, price,
//   stopsHeading, stopsIntro,
//   stops: [{ name, gloss, deva, note, image, imageAlt, diagram: "hiti",
//             parts: [{ deva, roman, note }] }],
//   aboutHeading, themes: [], suitableFor: [], pastGroups: [], ctaTitle
//
// Stop images (`image`) are optional and only appear once the file exists.
// Once `cover` exists it also becomes the page's og:image (a 1200px JPEG
// rendition) and the TouristTrip `image` in the JSON-LD.
import { fileExists, outputDirOf, renditionUrl } from "../../config/renditions.js";

function absolute(base, url) {
  try {
    return new URL(url, base).href;
  } catch {
    return url;
  }
}

const isWalk = (data) => String((data.page && data.page.inputPath) || "").endsWith(".md");

const isEmpty = (v) => v === undefined || v === null || v === "" || (Array.isArray(v) && !v.length);
const clean = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => !isEmpty(v)));

/* Practical details shown in the walk hero ledger, in this order. Only
   fields present in a walk's front matter are rendered. */
const PRACTICAL_FIELDS = [
  { key: "area", label: "Where" },
  { key: "format", label: "Format" },
  { key: "duration", label: "Duration" },
  { key: "distance", label: "Distance" },
  { key: "groupSize", label: "Group size" },
  { key: "languages", label: "Languages" },
  { key: "meetingPoint", label: "Meeting point" },
  { key: "price", label: "Price" },
];

function practicalRows(data) {
  return PRACTICAL_FIELDS.filter(({ key }) => !isEmpty(data[key])).map(({ key, label }) => ({
    key,
    label,
    value: Array.isArray(data[key]) ? data[key].join(", ") : String(data[key]),
  }));
}

const provider = (site, base) =>
  clean({
    "@type": "Person",
    "@id": `${base}/#person`,
    name: site.name,
    url: `${base}/`,
  });

/** schema.org TouristTrip for one walk page, plus its breadcrumb trail. */
function walkStructuredData(data) {
  const site = data.site || {};
  const base = site.url || "https://hrishavjoshi.com";
  const url = absolute(base, data.page.url);
  const stops = Array.isArray(data.stops) ? data.stops : [];

  const trip = clean({
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    "@id": `${url}#walk`,
    name: data.title,
    description: data.summary,
    url,
    // Raster originals are not copied to the site: use the og:image rendition.
    image: data.ogImage ? absolute(base, data.ogImage) : undefined,
    touristType: data.suitableFor,
    provider: provider(site, base),
    itinerary: stops.length
      ? {
          "@type": "ItemList",
          numberOfItems: stops.length,
          itemListElement: stops.map((s, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: clean({
              "@type": "TouristAttraction",
              name: s.gloss ? `${s.name} (${s.gloss})` : s.name,
              description: s.note,
            }),
          })),
        }
      : undefined,
  });

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${base}/` },
      { "@type": "ListItem", position: 2, name: "Walks", item: `${base}/walks/` },
      { "@type": "ListItem", position: 3, name: data.title, item: url },
    ],
  };

  return [trip, breadcrumbs];
}

/** schema.org Service for the /walks/ index (the walk programme as a whole). */
function indexStructuredData(data) {
  const site = data.site || {};
  const base = site.url || "https://hrishavjoshi.com";
  const items = (data.services && data.services.items) || [];
  const service = items.find((s) => s.slug === "heritage-walks") || {};
  return [
    clean({
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": `${base}/walks/#service`,
      name: service.title || "Heritage walks for groups",
      serviceType: "Guided heritage walks",
      description: data.description,
      url: `${base}/walks/`,
      areaServed: { "@type": "Place", name: "Kathmandu Valley, Nepal" },
      audience: service.idealFor ? { "@type": "Audience", audienceType: service.idealFor } : undefined,
      provider: provider(site, base),
    }),
  ];
}

export default {
  layout: "layouts/walk.njk",
  pageCss: "walks",


  // "How a walk comes together" — shared by /walks/ and every walk page.
  // Drawn from services.yml (heritage-walks deliverables + process).
  bookingSteps: [
    { title: "Tell me about your group", text: "Who is coming, roughly when, and what they want to understand." },
    { title: "I plan the route", text: "A route designed around your group’s interests — water, food or urban heritage, or a mix." },
    { title: "We agree the details", text: "Timing and logistics agreed with you, the organiser, before the day." },
    { title: "We walk", text: "A guided walk on foot, with each system explained where you can see it." },
  ],

  eleventyComputed: {
    /* Booking path: the enquiry on /work-with-me/ with the walk topic
       preselected — and, from a walk page, that walk (?walk=<slug>). */
    enquiryUrl: (data) =>
      isWalk(data)
        ? `/work-with-me/?topic=heritage-walk&walk=${data.page.fileSlug}#enquire`
        : "/work-with-me/?topic=heritage-walk#enquire",

    /* og:image = a 1200px JPEG of the cover, once the cover file exists. */
    ogImage: async (data) => {
      if (!isWalk(data)) return undefined;
      return renditionUrl(data.cover, { width: 1200, outputDir: outputDirOf(data), rasterise: true });
    },
    ogImageAlt: (data) => (isWalk(data) && fileExists(data.cover) && data.coverAlt ? data.coverAlt : undefined),

    practical: (data) => practicalRows(data),
    structuredData: (data) => {
      const inputPath = (data.page && data.page.inputPath) || "";
      if (inputPath.endsWith(".md")) return walkStructuredData(data);
      if (/[\\/]index\.njk$/.test(inputPath)) return indexStructuredData(data);
      return undefined;
    },
  },
};
