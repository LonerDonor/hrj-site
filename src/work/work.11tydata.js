// Directory data for /work/ — applies to every file in src/work/.
// Case studies are src/work/<slug>.md (output /work/<slug>/, layout project.njk).
// src/work/index.njk overrides `layout` in its own front matter.
//
// Work front matter (docs/DESIGN.md §7, plus optional extras read by
// layouts/project.njk). Omit anything unknown — the templates hide empty fields:
//   title, heroTitle (title with <em> markup), summary, domain (water|heritage|education),
//   category, role, client, location, years, featured, order,
//   cover, coverAlt, coverKind (overrides the placeholder drawing),
//   tags: [], highlights: [], links: [{ label, url }],
//   gallery: [{ src, alt, caption }]  (only files that exist are shown),
//   diagram: hiti  (adds the hiti cross-section to the page),
//   scope: [{ title, text }]  (numbered "what the work covered" steps),
//   map: { center: [lat, lng], zoom, label, layers: [{ file, color, label }] },
//   ctaTitle (overrides the per-domain CTA heading; may contain <em>),
//   ctaTopic (enquiry topic for the CTA button; default: the domain's `topic`)
//
// The map section (and the Leaflet CSS/JS) only appear once at least one
// `map.layers` file exists under src/ — see mapData / pageCss / pageJs below.
import { fileExists, outputDirOf, renditionUrl } from "../../config/renditions.js";
import domains from "../_data/domains.js";

/* Labels, placeholder drawings, CTA copy and enquiry topic per domain live
   in src/_data/domains.js (global `domains`, also used on the home page);
   exposed here as `workDomains` for the index and project templates. */
const workDomains = domains;

function absolute(base, url) {
  try {
    return new URL(url, base).href;
  } catch {
    return url;
  }
}

const clean = (obj) =>
  Object.fromEntries(
    Object.entries(obj).filter(
      ([, v]) => v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && !v.length)
    )
  );

const isProject = (data) => String((data.page && data.page.inputPath) || "").endsWith(".md");
const isIndex = (data) => /[\\/]index\.njk$/.test(String((data.page && data.page.inputPath) || ""));

/** "2022–present" → "2022/..", "2020–2021" → "2020/2021", "2023" → "2023" (ISO 8601). */
function temporalCoverage(years) {
  const m = String(years || "").match(/(\d{4})(?:\s*[–-]\s*(\d{4}|present))?/i);
  if (!m) return undefined;
  if (!m[2]) return m[1];
  return `${m[1]}/${/present/i.test(m[2]) ? ".." : m[2]}`;
}

function linkInfo(link) {
  if (!link || !link.url || !link.label) return null;
  const external = /^https?:\/\//i.test(link.url);
  let host = "";
  if (external) {
    try {
      host = new URL(link.url).hostname.replace(/^www\./, "");
    } catch {
      host = "";
    }
  }
  return { label: link.label, url: link.url, external, host };
}

async function projectStructuredData(data) {
  const site = data.site || {};
  const base = site.url || "https://hrishavjoshi.com";
  const url = absolute(base, data.page.url);
  const image = data.ogImage && data.ogImage !== site.ogImage ? absolute(base, data.ogImage) : undefined;
  const domain = workDomains[data.domain];

  const work = clean({
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `${url}#work`,
    name: data.title,
    headline: data.title,
    description: data.summary,
    url,
    image,
    genre: domain ? domain.label : undefined,
    keywords: Array.isArray(data.tags) && data.tags.length ? data.tags.join(", ") : undefined,
    temporalCoverage: temporalCoverage(data.years),
    locationCreated: data.location ? { "@type": "Place", name: data.location } : undefined,
    creator: clean({ "@type": "Person", "@id": `${base}/#person`, name: site.name, url: `${base}/` }),
    sourceOrganization: data.client ? { "@type": "Organization", name: data.client } : undefined,
    isPartOf: { "@type": "CollectionPage", "@id": `${base}/work/#page`, url: `${base}/work/` },
  });

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${base}/` },
      { "@type": "ListItem", position: 2, name: "Work", item: `${base}/work/` },
      { "@type": "ListItem", position: 3, name: data.title, item: url },
    ],
  };

  return [work, breadcrumbs];
}

function indexStructuredData(data) {
  const site = data.site || {};
  const base = site.url || "https://hrishavjoshi.com";
  const items = (data.collections && data.collections.work) || [];
  return [
    clean({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${base}/work/#page`,
      name: `Work — ${site.name}`,
      description: data.description,
      url: `${base}/work/`,
      author: { "@type": "Person", "@id": `${base}/#person`, name: site.name },
      mainEntity: items.length
        ? {
            "@type": "ItemList",
            numberOfItems: items.length,
            itemListElement: items.map((item, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: absolute(base, item.url),
              name: item.data.title,
            })),
          }
        : undefined,
    }),
  ];
}

/** GeoJSON layers of a project's map whose files exist under src/. */
function liveMapLayers(data) {
  const m = data.map;
  if (!m || !Array.isArray(m.center) || m.center.length !== 2) return [];
  return (Array.isArray(m.layers) ? m.layers : []).filter((l) => l && fileExists(l.file));
}
const hasLiveMap = (data) => isProject(data) && liveMapLayers(data).length > 0;

const LEAFLET_CSS = "/assets/vendor/leaflet/leaflet.css";
const LEAFLET_JS = "/assets/vendor/leaflet/leaflet.js";

export default {
  layout: "layouts/project.njk",
  pageCss: "work",
  workDomains,
  eleventyComputed: {
    /* Leaflet is loaded only on case studies whose map has data to draw.
       Other pages (the /work/ index) keep their own front-matter values. */
    pageCss: (data) => (hasLiveMap(data) ? [LEAFLET_CSS, "work"] : data.pageCss),
    pageJs: (data) => (hasLiveMap(data) ? [LEAFLET_JS, "map"] : data.pageJs),

    /* og:image = a 1200px JPEG of the cover, once the cover file exists. */
    ogImage: async (data) => {
      if (!isProject(data)) return undefined;
      return renditionUrl(data.cover, { width: 1200, outputDir: outputDirOf(data), rasterise: true });
    },
    ogImageAlt: (data) => (isProject(data) && fileExists(data.cover) && data.coverAlt ? data.coverAlt : undefined),

    /* Links with external/host info for the "Read more" list. */
    projectLinks: (data) => (Array.isArray(data.links) ? data.links.map(linkInfo).filter(Boolean) : []),

    /* Gallery: only images that exist, each with a full-size link target. */
    galleryItems: async (data) => {
      const items = Array.isArray(data.gallery) ? data.gallery : [];
      const out = [];
      for (const item of items) {
        if (!item || !fileExists(item.src)) continue;
        const href = await renditionUrl(item.src, { width: 1600, outputDir: outputDirOf(data) });
        out.push({ src: item.src, alt: item.alt || "", caption: item.caption || "", href });
      }
      return out;
    },

    /* Map: only GeoJSON layers that exist are handed to map.js. With none,
       the whole map section is left out (a lone pin on blank paper says
       nothing, and the centre is not a documented study location). */
    mapData: (data) => {
      const m = data.map;
      const layers = liveMapLayers(data).map((l) => clean({ file: l.file, color: l.color, label: l.label }));
      if (!layers.length) return undefined;
      return {
        center: m.center.map(Number),
        zoom: Number(m.zoom) || 14,
        label: m.label || data.title,
        layers,
      };
    },

    structuredData: async (data) => {
      if (isProject(data)) return projectStructuredData(data);
      if (isIndex(data)) return indexStructuredData(data);
      return undefined;
    },
  },
};
