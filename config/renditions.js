// Build-time image renditions shared by directory data files
// (src/work/work.11tydata.js, src/walks/walks.11tydata.js).
//
// Raster originals in src/assets/images/ are never copied to the output —
// only the <img> transform's responsive renditions are. Anything that needs a
// plain file URL (og:image, a gallery "full size" link, JSON-LD `image`) gets
// its own JPEG from here.
import fs from "node:fs";
import path from "node:path";
import Image from "@11ty/eleventy-img";

export const INPUT = "src";

const stripSlash = (src) => decodeURI(String(src).split(/[?#]/)[0]).replace(/^\/+/, "");

/** True if a root-relative path (e.g. "/assets/images/x.jpg") is a file under src/. */
export function fileExists(src, inputDir = INPUT) {
  if (!src || typeof src !== "string" || /^(https?:)?\/\//i.test(src)) return false;
  try {
    return fs.statSync(path.join(inputDir, stripSlash(src))).isFile();
  } catch {
    return false;
  }
}

/** The active output folder (honours `--output=<dir>`), from template data. */
export function outputDirOf(data) {
  const dir = data && data.eleventy && data.eleventy.directories && data.eleventy.directories.output;
  return dir || "_site/";
}

/**
 * Write a JPEG rendition of a source image and return its URL (or undefined
 * when the file doesn't exist). SVG sources are copied as-is by the
 * passthrough, so they are returned unchanged unless `rasterise` is set
 * (og:image must be a raster).
 *
 * File names get a "-full-" infix so they never collide with the image
 * transform's own outputs for the same source (which use `<id>-<width>`):
 * two writers on one file in the same build can fail on Windows.
 */
export async function renditionUrl(src, { width, outputDir, inputDir = INPUT, rasterise = false }) {
  if (!fileExists(src, inputDir)) return undefined;
  if (/\.svg$/i.test(src) && !rasterise) return src;
  const stats = await Image(path.join(inputDir, stripSlash(src)), {
    widths: [width],
    formats: ["jpeg"],
    outputDir: path.join(outputDir, "assets/img/"),
    urlPath: "/assets/img/",
    filenameFormat: (id, _src, w, format) => `${id}-full-${w}.${format}`,
  });
  const list = stats.jpeg || [];
  return list.length ? list[list.length - 1].url : undefined;
}
