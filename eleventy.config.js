// Eleventy 3 configuration — HRJ site v2.
// Conventions and the public API (shortcodes, filters, collections) are
// documented in docs/DESIGN.md §6 and §10. Keep the two in sync.

import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import Image, { eleventyImageTransformPlugin } from "@11ty/eleventy-img";

import { renderIcon } from "./config/icons.js";
import { renderPlaceholder } from "./config/placeholders.js";
import {
  fileExistsIn,
  readableDate,
  isoDate,
  year,
  absoluteUrlWith,
  where,
  limit,
  jsonify,
  excerpt,
  arrayify,
} from "./config/filters.js";

const INPUT = "src";
const OUTPUT = "_site";

const site = yaml.load(fs.readFileSync(path.join(INPUT, "_data/site.yml"), "utf8"));
const fileExists = fileExistsIn(INPUT);

/* ------------------------------------------------------------------------ *
 * Aspect ratios supported by `.media[data-ratio]` in main.css. Anything else
 * passed to {% media %} snaps to the closest of these (no inline styles —
 * see the CSP note in docs/DESIGN.md §10).
 * ------------------------------------------------------------------------ */
const RATIOS = {
  "1/1": 1,
  "5/4": 5 / 4,
  "4/3": 4 / 3,
  "3/2": 3 / 2,
  "16/10": 16 / 10,
  "16/9": 16 / 9,
  "2/1": 2,
  "21/9": 21 / 9,
  "4/5": 4 / 5,
  "3/4": 3 / 4,
  "2/3": 2 / 3,
  "9/16": 9 / 16,
};

function normaliseRatio(ratio) {
  if (!ratio || ratio === "auto") return null;
  const key = String(ratio).replace(/\s+/g, "").replace(":", "/");
  if (RATIOS[key]) return key;
  const [w, h] = key.split("/").map(Number);
  if (!w || !h) return null;
  const target = w / h;
  return Object.entries(RATIOS).reduce((best, [k, v]) =>
    Math.abs(v - target) < Math.abs(RATIOS[best] - target) ? k : best
  , "4/3");
}

const escapeAttr = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const FOCUS = new Set(["top", "bottom", "left", "right", "center"]);

/**
 * {% media src, alt, opts %}
 * opts: { ratio, kind, caption, eager, sizes, widths, class, focus }
 */
function mediaShortcode(src, alt, opts = {}) {
  const o = opts || {};
  const classes = ["media", o.class].filter(Boolean);
  const kind = o.kind || "photo";

  // Missing file → decorative placeholder (never breaks the build).
  if (!src || !fileExists(src)) {
    const ratio = normaliseRatio(o.ratio) || (kind === "portrait" ? "4/5" : "4/3");
    classes.push("media--placeholder");
    return (
      `<figure class="${classes.join(" ")}" data-ratio="${ratio}" data-kind="${escapeAttr(kind)}" aria-hidden="true">` +
      renderPlaceholder(kind) +
      `</figure>`
    );
  }

  const ratio = normaliseRatio(o.ratio);
  const attrs = [`src="${escapeAttr(src)}"`, `alt="${escapeAttr(alt ?? "")}"`];
  if (o.sizes) attrs.push(`sizes="${escapeAttr(o.sizes)}"`);
  if (o.widths) attrs.push(`eleventy:widths="${escapeAttr([].concat(o.widths).join(","))}"`);
  if (o.eager) attrs.push(`loading="eager"`, `fetchpriority="high"`);

  const figAttrs = [`class="${classes.join(" ")}"`];
  if (ratio) figAttrs.push(`data-ratio="${ratio}"`);
  if (o.focus && FOCUS.has(o.focus)) figAttrs.push(`data-focus="${o.focus}"`);

  const caption = o.caption ? `<figcaption>${o.caption}</figcaption>` : "";
  return `<figure ${figAttrs.join(" ")}><img ${attrs.join(" ")}>${caption}</figure>`;
}

/* ------------------------------------------------------------------------ *
 * Build-time raster assets: OG image + apple-touch-icon (from SVG sources).
 * ------------------------------------------------------------------------ */
async function buildRasterAssets(outDir = OUTPUT) {
  const ogSrc = path.join(INPUT, "assets/og/og-default.svg");
  await Image(ogSrc, {
    formats: ["png"],
    widths: [1200],
    outputDir: path.join(outDir, "assets/og"),
    urlPath: "/assets/og/",
    filenameFormat: () => "og-default.png",
  });

  // Apple touch icon: the favicon artwork on a full-bleed paper square
  // (iOS masks corners itself; transparent corners would render black).
  const fav = fs.readFileSync(path.join(INPUT, "assets/favicon.svg"), "utf8");
  const inner = fav
    .replace(/^[\s\S]*?<svg[^>]*>/, "")
    .replace(/<\/svg>\s*$/, "")
    .replace(/<rect id="bg"[^>]*\/>/, "");
  const appleSvg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="180" height="180">` +
    `<rect width="64" height="64" fill="#f3ede1"/><g transform="translate(4 4) scale(0.875)">${inner}</g></svg>`;
  await Image(Buffer.from(appleSvg), {
    formats: ["png"],
    widths: [180],
    outputDir: path.join(outDir, "assets"),
    urlPath: "/assets/",
    filenameFormat: () => "apple-touch-icon.png",
  });
}

const byOrder = (a, b) =>
  (a.data.order ?? 999) - (b.data.order ?? 999) ||
  String(a.data.title || "").localeCompare(String(b.data.title || ""));

export default async function (eleventyConfig) {
  /* Data ----------------------------------------------------------------- */
  eleventyConfig.addDataExtension("yml,yaml", (contents) => yaml.load(contents));

  /* Ignore READMEs and other docs inside assets (they are not pages). */
  eleventyConfig.ignores.add(`${INPUT}/assets/**/*.md`);

  /* Passthrough ---------------------------------------------------------- */
  eleventyConfig.addPassthroughCopy({
    [`${INPUT}/assets/css`]: "assets/css",
    [`${INPUT}/assets/js`]: "assets/js",
    [`${INPUT}/assets/favicon.svg`]: "assets/favicon.svg",
    [`${INPUT}/CNAME`]: "CNAME",
    "node_modules/leaflet/dist": "assets/vendor/leaflet",
  });
  // Folder copies filtered by type (keeps sub-folders; skips the README.md files).
  const copyTyped = (dir, globs) =>
    eleventyConfig.addPassthroughCopy({ [`${INPUT}/assets/${dir}`]: `assets/${dir}` }, { filter: globs });
  copyTyped("fonts", ["**/*.woff2", "**/*.woff"]);
  copyTyped("maps", ["**/*.geojson", "**/*.json", "**/*.kml", "**/*.gpx"]);
  copyTyped("cv", ["**/*.pdf"]);
  copyTyped("og", ["**/*.svg", "**/*.png", "**/*.jpg", "**/*.jpeg"]);
  // Non-raster files that live next to photos. Raster images are NOT copied:
  // they go through the image transform and are written to /assets/img/.
  copyTyped("images", ["**/*.svg", "**/*.pdf", "**/*.mp4", "**/*.webm", "**/*.vtt"]);

  /* Images: every <img> in HTML output becomes responsive <picture>. --------- */
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    // "svg" first + svgShortCircuit: SVG sources are passed through as SVG,
    // raster sources become AVIF/WebP/JPEG.
    formats: ["svg", "avif", "webp", "jpeg"],
    svgShortCircuit: true,
    widths: [480, 960, 1600, "auto"],
    // No outputDir: eleventy-img writes to <active output dir> + urlPath, so
    // `--output=<dir>` builds get their images in <dir>/assets/img/.
    urlPath: "/assets/img/",
    htmlOptions: {
      imgAttributes: {
        loading: "lazy",
        decoding: "async",
        sizes: "(min-width: 72rem) 72rem, 100vw",
      },
    },
  });

  // Written into the active output folder (honours `--output=<dir>`).
  eleventyConfig.on("eleventy.before", ({ directories }) =>
    buildRasterAssets((directories && directories.output) || OUTPUT)
  );

  /* Shortcodes ----------------------------------------------------------- */
  eleventyConfig.addShortcode("media", mediaShortcode);
  eleventyConfig.addShortcode("icon", (name, extraClass) => renderIcon(name, extraClass));

  /* Filters -------------------------------------------------------------- */
  eleventyConfig.addFilter("imageExists", fileExists);
  eleventyConfig.addFilter("fileExists", fileExists);
  eleventyConfig.addFilter("readableDate", readableDate);
  eleventyConfig.addFilter("isoDate", isoDate);
  eleventyConfig.addFilter("year", year);
  eleventyConfig.addFilter("absoluteUrl", absoluteUrlWith(site.url));
  eleventyConfig.addFilter("where", where);
  eleventyConfig.addFilter("limit", limit);
  eleventyConfig.addFilter("jsonify", jsonify);
  eleventyConfig.addFilter("excerpt", excerpt);
  eleventyConfig.addFilter("arrayify", arrayify);

  /* Collections ---------------------------------------------------------- */
  // eleventyExcludeFromCollections: true (or draft: true) drops an item from
  // every collection; an array or comma list of names drops it from those only
  // (e.g. `eleventyExcludeFromCollections: [writing]`).
  const notExcluded = (name) => (item) => {
    const ex = item.data.eleventyExcludeFromCollections;
    if (ex === true || item.data.draft) return false;
    if (Array.isArray(ex) && ex.includes(name)) return false;
    if (typeof ex === "string" && ex.split(",").map((x) => x.trim()).includes(name)) return false;
    return true;
  };

  eleventyConfig.addCollection("work", (api) =>
    api.getFilteredByGlob(`./${INPUT}/work/*.md`).filter(notExcluded("work")).sort(byOrder)
  );
  eleventyConfig.addCollection("featuredWork", (api) =>
    api
      .getFilteredByGlob(`./${INPUT}/work/*.md`)
      .filter(notExcluded("work"))
      .filter((item) => item.data.featured === true)
      .sort(byOrder)
  );
  eleventyConfig.addCollection("walks", (api) =>
    api.getFilteredByGlob(`./${INPUT}/walks/*.md`).filter(notExcluded("walks")).sort(byOrder)
  );
  eleventyConfig.addCollection("writing", (api) =>
    api
      .getFilteredByGlob(`./${INPUT}/writing/*.md`)
      .filter(notExcluded("writing"))
      .sort((a, b) => b.date - a.date)
  );

  /* Dev server ----------------------------------------------------------- */
  eleventyConfig.setServerOptions({ showAllHosts: false });
}

export const config = {
  dir: {
    input: INPUT,
    output: OUTPUT,
    includes: "_includes",
    data: "_data",
  },
  templateFormats: ["njk", "md", "html", "11ty.js"],
  markdownTemplateEngine: "njk",
  htmlTemplateEngine: "njk",
};
