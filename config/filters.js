// Template filters. Registered in eleventy.config.js — see docs/DESIGN.md §6.
import fs from "node:fs";
import path from "node:path";

// UK-style short months ("Sept"), matching the site's British spelling.
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];

/**
 * Normalise a Date, "2025", "2025-09" or "2025-09-20" into parts.
 * YAML turns full dates into Date objects (UTC midnight); partial dates stay strings.
 */
function toParts(value) {
  if (value === undefined || value === null || value === "") return null;
  if (value === "now") value = new Date();
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return { y: value.getUTCFullYear(), m: value.getUTCMonth() + 1, d: value.getUTCDate() };
  }
  const m = String(value).trim().match(/^(\d{4})(?:-(\d{1,2}))?(?:-(\d{1,2}))?/);
  if (!m) return null;
  return { y: Number(m[1]), m: m[2] ? Number(m[2]) : null, d: m[3] ? Number(m[3]) : null };
}

const pad = (n) => String(n).padStart(2, "0");

/** Resolve a site path (e.g. "/assets/cv/HRJ_CV.pdf") to a file under the input dir. */
export function fileExistsIn(inputDir) {
  return function fileExists(src) {
    if (!src || typeof src !== "string") return false;
    if (/^(https?:)?\/\//i.test(src) || src.startsWith("data:")) return false;
    const clean = decodeURI(src.split(/[?#]/)[0]).replace(/^\/+/, "");
    if (!clean) return false;
    try {
      return fs.statSync(path.join(inputDir, clean)).isFile();
    } catch {
      return false;
    }
  };
}

/** "Sept 2025" (default) · "20 Sept 2025" with style "day" · "2025" when only a year is known. */
export function readableDate(value, style = "month") {
  const p = toParts(value);
  if (!p) return "";
  if (!p.m) return String(p.y);
  const month = MONTHS[p.m - 1];
  if (style === "day" && p.d) return `${p.d} ${month} ${p.y}`;
  return `${month} ${p.y}`;
}

/** "2025-09-20" (or "2025-09" / "2025" for partial dates) — for <time datetime> and sitemaps. */
export function isoDate(value) {
  const p = toParts(value);
  if (!p) return "";
  if (!p.m) return String(p.y);
  if (!p.d) return `${p.y}-${pad(p.m)}`;
  return `${p.y}-${pad(p.m)}-${pad(p.d)}`;
}

export function year(value) {
  const p = toParts(value);
  return p ? String(p.y) : "";
}

/** Make a root-relative URL absolute against the site URL. */
export function absoluteUrlWith(defaultBase) {
  return function absoluteUrl(url, base) {
    if (!url) return "";
    try {
      return new URL(url, base || defaultBase).href;
    } catch {
      return url;
    }
  };
}

/** Read "a.b.c" from an object. */
function getPath(obj, key) {
  return String(key)
    .split(".")
    .reduce((acc, k) => (acc === undefined || acc === null ? undefined : acc[k]), obj);
}

/**
 * Keep items whose `key` equals `value` (or is truthy when value is omitted).
 * Dotted keys work: `collections.work | where("data.domain", "water")`.
 * For Eleventy collection items, a bare key falls back to item.data[key].
 */
export function where(arr, key, value) {
  if (!Array.isArray(arr)) return [];
  return arr.filter((item) => {
    let v = getPath(item, key);
    if (v === undefined && item && item.data) v = getPath(item.data, key);
    if (value === undefined) return Boolean(v);
    if (Array.isArray(v)) return v.includes(value);
    return v === value;
  });
}

export function limit(arr, n) {
  if (!Array.isArray(arr)) return [];
  return arr.slice(0, Number(n));
}

/** JSON for <script type="application/ld+json"> — escapes "<" so content can't close the tag. */
export function jsonify(value) {
  return JSON.stringify(value ?? null)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

/**
 * Plain-text excerpt of at most `n` characters, cut at a word boundary with "…".
 * Strips HTML tags first.
 */
export function excerpt(text, n = 160) {
  if (!text) return "";
  const plain = String(text)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const max = Number(n);
  if (plain.length <= max) return plain;
  const cut = plain.slice(0, max + 1);
  const lastSpace = cut.lastIndexOf(" ");
  const base = (lastSpace > max * 0.5 ? cut.slice(0, lastSpace) : plain.slice(0, max)).replace(/[\s,;:.–—-]+$/, "");
  return `${base}…`;
}

/** Wrap a string in an array; pass arrays through; drop empty values. */
export function arrayify(value) {
  if (value === undefined || value === null || value === "") return [];
  return (Array.isArray(value) ? value : [value]).filter(Boolean);
}
