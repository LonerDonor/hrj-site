// true once at least one photograph listed in photos.yml exists under src/.
// Until then /photos/ is not built, the Photos nav item is hidden and the home
// page leaves out its photo strip — no gallery of placeholders goes live.
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

const INPUT = "src";

export default function () {
  let data;
  try {
    data = yaml.load(fs.readFileSync(path.join(INPUT, "_data/photos.yml"), "utf8"));
  } catch {
    return false;
  }
  const list = Array.isArray(data) ? data : (data && (data.items || data.photos)) || [];
  return list.some((p) => {
    if (!p || typeof p.src !== "string" || /^(https?:)?\/\//i.test(p.src)) return false;
    try {
      return fs.statSync(path.join(INPUT, decodeURI(p.src.split(/[?#]/)[0]).replace(/^\/+/, ""))).isFile();
    } catch {
      return false;
    }
  });
}
