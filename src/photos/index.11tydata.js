// Template data for /photos/ (src/photos/index.njk).
//
// Turns the global `photos` list (src/_data/photos.yml) into `gallery`:
//   gallery.items[]      one per photo, in YAML order, with a plate number,
//                        an element id, the placeholder `kind`, a `sizes`
//                        value for its tile shape, and — when the image file
//                        exists — `full` { url, width, height }: a 2000px
//                        JPEG written to /assets/img/ so the tile can link to
//                        a full-size file without JavaScript. (Raster
//                        originals are never copied to the site; see
//                        src/assets/images/README.md.)
//   gallery.categories[] the sets that have at least one photo, with counts
//   gallery.total, gallery.hasImages, gallery.lead (social-share photo)
//
// Only photos whose files exist are listed (plates are numbered after that),
// so no placeholder "photographs" go live. Until the first file exists the
// page is not built at all (`permalink` below; see also _data/photosLive.js,
// which hides the nav item and the home page strip).
import fs from "node:fs";
import path from "node:path";
import Image from "@11ty/eleventy-img";

const INPUT = "src";
const FULL_WIDTH = 2000;

// Sets, in display order. `kind` picks the placeholder drawing for {% media %}.
// `note` is the one-line description shown in the hero's key.
const CATEGORIES = [
  { id: "water", label: "Water", note: "Hiti stone spouts that still run, and the Rajkulo canal", kind: "water" },
  { id: "heritage", label: "Heritage", note: "Temples and craft, from Patan Durbar Square to repoussé metalwork", kind: "heritage" },
  { id: "walks", label: "Walks", note: "Heritage walks with visiting groups", kind: "walk" },
  { id: "robotics", label: "Robotics", note: "Robotics classes and the inter-school challenge in Lalitpur", kind: "robotics" },
  { id: "portfolio", label: "Portfolio", note: "My own photographs, outside project work", kind: "photo" },
];

const SHAPES = new Set(["large", "wide", "tall"]);
const FOCUS = new Set(["top", "bottom", "left", "right", "center"]);

// `sizes` per tile shape — matches the grid in assets/css/pages/photos.css
// (2 columns < 56rem, 3 columns to 72rem, 4 columns above; .container--wide).
const SIZES = {
  normal: "(min-width: 86rem) 20rem, (min-width: 72rem) 24vw, (min-width: 56rem) 32vw, 48vw",
  double: "(min-width: 86rem) 41rem, (min-width: 72rem) 48vw, (min-width: 56rem) 64vw, 94vw",
};

function sourcePath(src) {
  if (!src || typeof src !== "string" || /^(https?:)?\/\//i.test(src)) return null;
  return path.join(INPUT, decodeURI(src.split(/[?#]/)[0]).replace(/^\/+/, ""));
}

function statOf(src) {
  const file = sourcePath(src);
  if (!file) return null;
  try {
    const st = fs.statSync(file);
    return st.isFile() ? st : null;
  } catch {
    return null;
  }
}

function slug(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Full-size JPEG for the no-JS link target. Returns null if it can't be made. */
async function fullSize(src, outputDir) {
  if (/\.svg$/i.test(src)) return { url: src }; // SVGs are passed through as-is
  try {
    const stats = await Image(sourcePath(src), {
      widths: [FULL_WIDTH],
      formats: ["jpeg"],
      outputDir: path.join(outputDir, "assets", "img"),
      urlPath: "/assets/img/",
      // Distinct names, so these never collide with the transform's outputs.
      filenameFormat: (id, _src, width, format) => `${id}-full-${width}.${format}`,
    });
    const jpeg = stats.jpeg && stats.jpeg[stats.jpeg.length - 1];
    return jpeg ? { url: jpeg.url, width: jpeg.width, height: jpeg.height } : null;
  } catch (error) {
    console.warn(`[photos] Could not make a full-size copy of ${src}: ${error.message}`);
    return null;
  }
}

// One build can evaluate computed data more than once; memoise per input.
const cache = new Map();

function buildGallery(data) {
  const list = Array.isArray(data.photos) ? data.photos.filter((p) => p && p.src) : [];
  const outputDir = (data.eleventy && data.eleventy.directories && data.eleventy.directories.output) || "_site";
  const fingerprint = list.map((p) => {
    const st = statOf(p.src);
    return st ? `${p.src}@${st.size}:${st.mtimeMs}` : `${p.src}@-`;
  });
  const key = JSON.stringify([outputDir, list, fingerprint]);
  if (!cache.has(key)) cache.set(key, makeGallery(list, outputDir));
  return cache.get(key);
}

async function makeGallery(list, outputDir) {
  const byId = new Map(CATEGORIES.map((c) => [c.id, c]));
  const usedIds = new Set();

  // Only photographs whose files exist.
  const present = list.filter((p) => Boolean(statOf(p.src)));

  const items = await Promise.all(
    present.map(async (p, i) => {
      const categoryId = slug(p.category) || "portfolio";
      if (!byId.has(categoryId)) {
        // Unknown set name in photos.yml: still shown, under its own label.
        byId.set(categoryId, { id: categoryId, label: String(p.category), note: "", kind: "photo", extra: true });
      }
      const category = byId.get(categoryId);
      const shape = SHAPES.has(p.shape) ? p.shape : "normal";

      let id = `photo-${slug(path.basename(String(p.src)).replace(/\.[a-z0-9]+$/i, "")) || i + 1}`;
      while (usedIds.has(id)) id += "-b";
      usedIds.add(id);

      const exists = Boolean(statOf(p.src));
      return {
        n: String(i + 1).padStart(2, "0"),
        id,
        src: p.src,
        alt: p.alt || "",
        caption: p.caption || "",
        place: p.place || "",
        year: p.year ? String(p.year) : "",
        category: categoryId,
        categoryLabel: category.label,
        kind: category.kind,
        shape,
        focus: FOCUS.has(p.focus) ? p.focus : undefined,
        featured: p.featured === true,
        sizes: shape === "large" || shape === "wide" ? SIZES.double : SIZES.normal,
        exists,
        full: exists ? await fullSize(p.src, outputDir) : null,
      };
    })
  );

  const categories = [...byId.values()]
    .map((c) => {
      const count = items.filter((it) => it.category === c.id).length;
      return { ...c, count, countLabel: String(count).padStart(2, "0") };
    })
    .filter((c) => c.count > 0);

  const withImage = items.filter((it) => it.full);
  const lead = withImage.find((it) => it.featured) || withImage[0] || null;

  return {
    items,
    categories,
    total: items.length,
    hasImages: withImage.length > 0,
    lead,
  };
}

export default {
  // Not built until at least one photo file exists (see _data/photosLive.js).
  permalink: (data) => (data.photosLive ? "/photos/" : false),

  eleventyComputed: {
    gallery: (data) => buildGallery(data),

    // Social-share image: the featured photo (or the first real one) once it exists.
    // (undefined → head-meta falls back to the site default image.)
    ogImage: async (data) => {
      const g = await buildGallery(data);
      return g.lead && /\.jpe?g$/i.test(g.lead.full.url) ? g.lead.full.url : undefined;
    },
    ogImageAlt: async (data) => {
      const g = await buildGallery(data);
      return g.lead && /\.jpe?g$/i.test(g.lead.full.url) ? g.lead.alt : undefined;
    },

    // schema.org: the page as an image gallery (images listed once they exist).
    structuredData: async (data) => {
      const g = await buildGallery(data);
      const site = data.site || {};
      const base = site.url || "https://hrishavrajjoshi.com.np";
      const url = `${base}${data.page.url}`;
      const person = { "@type": "Person", "@id": `${base}/#person`, name: site.name, url: `${base}/` };
      const gallery = {
        "@context": "https://schema.org",
        "@type": "ImageGallery",
        "@id": `${url}#gallery`,
        name: data.title,
        description: data.description,
        url,
        author: person,
      };
      const images = g.items
        .filter((it) => it.full)
        .map((it) => {
          const img = {
            "@type": "ImageObject",
            contentUrl: `${base}${it.full.url}`,
            name: it.caption,
            description: it.alt,
            creator: { "@id": `${base}/#person` },
          };
          if (it.place) img.contentLocation = { "@type": "Place", name: it.place };
          if (it.year) img.dateCreated = it.year;
          if (it.full.width) {
            img.width = it.full.width;
            img.height = it.full.height;
          }
          return img;
        });
      if (images.length) gallery.image = images;
      return [gallery];
    },
  },
};
