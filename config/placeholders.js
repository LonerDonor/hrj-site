// Decorative line-art stand-ins used by the {% media %} shortcode when an image
// file does not exist yet. Hatched paper comes from CSS (.placeholder); this
// file only supplies the small ink drawing in the middle. No text, aria-hidden.
//
// Drawn on a 240×180 board, centred around (120, 90). Strokes use
// vector-effect: non-scaling-stroke (set in CSS) so lines stay ~1.5px.

const ART = {
  // photo → a framed landscape
  frame:
    '<rect x="76" y="50" width="88" height="66" rx="2"/>' +
    '<path d="M82 110l22-26 14 13 10-11 30 24"/>' +
    '<circle cx="144" cy="69" r="6"/>' +
    '<path d="M70 44h8M70 44v8M170 44h-8M170 44v8M70 122h8M70 122v-8M170 122h-8M170 122v-8"/>',

  // drawing / water → a hiti spout emerging from a masonry wall into a basin
  spout:
    '<path d="M78 42v92M92 42v92M78 58h14M78 76h14M78 94h14M78 112h14"/>' +
    '<path d="M92 70c18-3 36 1 50 10l6-6 4 10-12 4c-14-6-31-8-48-6"/>' +
    '<circle cx="132" cy="80" r="2.4"/>' +
    '<path d="M150 92c2 10 3 20 2 32" stroke-dasharray="2 5"/>' +
    '<path d="M126 126h46l-4 10h-38z"/>',

  // portrait → head and shoulders
  portrait:
    '<circle cx="120" cy="70" r="20"/>' +
    '<path d="M80 138c4-26 21-40 40-40s36 14 40 40"/>' +
    '<path d="M70 144h100"/>',

  // walk → a dotted footpath ending at a pin
  footpath:
    '<path d="M64 134c26-6 34-24 54-28s34-14 40-34" stroke-dasharray="1 7"/>' +
    '<circle cx="64" cy="134" r="3"/>' +
    '<path d="M164 70c-7-9-11-14-11-20a11 11 0 0 1 22 0c0 6-4 11-11 20z"/>' +
    '<circle cx="164" cy="50" r="3.5"/>' +
    '<path d="M96 122l4 3M128 100l4 3"/>',

  // robotics → a small robot
  robot:
    '<rect x="90" y="62" width="60" height="46" rx="7"/>' +
    '<circle cx="107" cy="82" r="5"/><circle cx="133" cy="82" r="5"/>' +
    '<path d="M108 97h24M120 62V48"/><circle cx="120" cy="45" r="3.5"/>' +
    '<path d="M90 78h-9v16h9M150 78h9v16h-9"/>' +
    '<path d="M100 108v12h40v-12M96 128h48"/>',

  // map → contour lines and a survey mark
  map:
    '<path d="M70 104c-4-30 26-52 58-46s52 34 36 58-90 22-94-12z"/>' +
    '<path d="M88 100c-2-18 16-31 36-28s32 20 22 35-56 13-58-7z"/>' +
    '<path d="M106 96c0-8 8-13 16-12s14 9 9 15-25 5-25-3z"/>' +
    '<path d="M150 50v14M143 57h14"/>',

  // heritage → a tiered temple
  temple:
    '<path d="M120 36v12M116 40h8"/>' +
    '<path d="M102 66l18-16 18 16"/>' +
    '<path d="M110 66v10h20V66"/>' +
    '<path d="M94 88l14-12h24l14 12"/>' +
    '<path d="M104 88v12h32V88"/>' +
    '<path d="M86 112l16-12h36l16 12"/>' +
    '<path d="M98 112v14h44v-14M115 126v-8h10v8"/>' +
    '<path d="M86 132h68M80 138h80"/>',
};

const KIND_TO_ART = {
  photo: "frame",
  drawing: "spout",
  water: "spout",
  portrait: "portrait",
  walk: "footpath",
  robotics: "robot",
  map: "map",
  heritage: "temple",
};

export const PLACEHOLDER_KINDS = Object.keys(KIND_TO_ART);

/** Return the decorative placeholder SVG for a media `kind`. */
export function renderPlaceholder(kind = "photo") {
  const artKey = KIND_TO_ART[kind] || "frame";
  const safeKind = KIND_TO_ART[kind] ? kind : "photo";
  return (
    `<svg class="placeholder placeholder--${safeKind}" viewBox="0 0 240 180" ` +
    `preserveAspectRatio="xMidYMid meet" fill="none" stroke="currentColor" ` +
    `stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" ` +
    `aria-hidden="true" focusable="false">${ART[artKey]}</svg>`
  );
}
