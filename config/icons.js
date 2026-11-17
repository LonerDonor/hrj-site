// Inline SVG icon set for the {% icon %} shortcode.
// 24×24 grid, 1.5 stroke, currentColor, round caps/joins. Line-art only (brand
// marks are drawn as simple outlines so they sit with the rest of the set).
// To add an icon: add a key with the inner SVG markup, then document it in
// docs/DESIGN.md §6.

export const ICONS = {
  "arrow-right": '<path d="M4.5 12h15M13.5 6l6 6-6 6"/>',
  "arrow-left": '<path d="M19.5 12h-15M10.5 6l-6 6 6 6"/>',
  "arrow-up-right": '<path d="M7 17 17 7M8.5 7H17v8.5"/>',
  "chevron-down": '<path d="m6 9 6 6 6-6"/>',
  "chevron-left": '<path d="m15 5-7 7 7 7"/>',
  "chevron-right": '<path d="m9 5 7 7-7 7"/>',
  download: '<path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.6 6.6 8.4 6.4 8.4-6.4"/>',
  whatsapp:
    '<path d="M3.6 20.4 5 16.3a8.5 8.5 0 1 1 3.1 3z"/>' +
    '<path d="M9 8.3c-.3 3.1 3.6 7 6.7 6.7l.9-1.5-1.9-1-1 .9c-1.2-.5-2.6-1.9-3.1-3.1l.9-1-1-1.9z"/>',
  phone:
    '<path d="M5.2 3.8h3.3l1.6 4.1-2.1 1.4a11.5 11.5 0 0 0 6.7 6.7l1.4-2.1 4.1 1.6v3.3a1.6 1.6 0 0 1-1.7 1.6A16.6 16.6 0 0 1 3.6 5.5a1.6 1.6 0 0 1 1.6-1.7z"/>',
  "map-pin": '<path d="M12 21s-6.5-5.8-6.5-11a6.5 6.5 0 0 1 13 0c0 5.2-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>',
  linkedin:
    '<rect x="3.5" y="3.5" width="17" height="17" rx="2.5"/>' +
    '<path d="M8 10.5v6M8 7.6v.01M11.6 16.5v-6M11.6 13.2c0-1.7 1-2.7 2.4-2.7s2.2 1 2.2 2.7v3.3"/>',
  medium: '<ellipse cx="7.6" cy="12" rx="4.6" ry="5"/><ellipse cx="16" cy="12" rx="2.2" ry="4.6"/><path d="M20.6 7.6v8.8"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  water: '<path d="M12 3.5s-6 6.6-6 11a6 6 0 0 0 12 0c0-4.4-6-11-6-11z"/><path d="M9.3 15a2.8 2.8 0 0 0 2.7 2.6"/>',
  heritage:
    '<path d="M12 2.8v2.4M6.8 9 12 5.2 17.2 9M8.6 9v3M15.4 9v3M4.8 15.2 12 12l7.2 3.2M7 15.2v4.6M17 15.2v4.6M3.8 20h16.4M10.6 20v-3h2.8v3"/>',
  robot:
    '<rect x="5" y="8" width="14" height="11" rx="2"/>' +
    '<path d="M12 8V5M9.5 12.8v.4M14.5 12.8v.4M9.5 16h5M3 12v3.5M21 12v3.5"/><circle cx="12" cy="4" r="1"/>',
  walk:
    '<path d="M7.6 3.6c1.5 0 2.4 1.7 2.4 3.9s-.8 3.4-2.1 3.4-2.4-.9-2.4-3.4.6-3.9 2.1-3.9zM5.9 13.4h3.4v1.4a1.7 1.7 0 0 1-3.4 0z"/>' +
    '<path d="M16.4 7.6c1.5 0 2.1 1.7 2.1 3.9s-1.1 3.4-2.4 3.4-2.1-1.2-2.1-3.4.9-3.9 2.4-3.9zM14.7 17.4h3.4v1.4a1.7 1.7 0 0 1-3.4 0z"/>',
  pen: '<path d="m4 20 1-4.2L16.4 4.4a2.1 2.1 0 0 1 3 3L8.2 19z"/><path d="m14.4 6.4 3.2 3.2"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  users:
    '<circle cx="9" cy="8.5" r="3.5"/><path d="M2.5 20c.6-3.6 3.3-5.6 6.5-5.6s5.9 2 6.5 5.6M16 5.2a3.4 3.4 0 0 1 0 6.6M18 14.8c2 .7 3.2 2.5 3.5 5.2"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  globe:
    '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.4 2.4 3.6 5.2 3.6 8.5s-1.2 6.1-3.6 8.5c-2.4-2.4-3.6-5.2-3.6-8.5S9.6 5.9 12 3.5z"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
};

/**
 * Render an icon.
 * @param {string} name   key of ICONS
 * @param {string} [extraClass] extra class names, e.g. "icon--lg"
 */
export function renderIcon(name, extraClass = "") {
  const body = ICONS[name];
  if (!body) {
    throw new Error(
      `[icon] Unknown icon "${name}". Available: ${Object.keys(ICONS).join(", ")}`
    );
  }
  const cls = ["icon", `icon--${name}`, extraClass].filter(Boolean).join(" ");
  return (
    `<svg class="${cls}" viewBox="0 0 24 24" width="24" height="24" fill="none" ` +
    `stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" ` +
    `aria-hidden="true" focusable="false">${body}</svg>`
  );
}
