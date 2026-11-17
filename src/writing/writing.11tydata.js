// Directory data for /writing/ — applies to every file in src/writing/.
// src/writing/index.njk overrides `permalink` in its own front matter.
//
// One Markdown file per item. Items are data only (no page of their own), so
// they default to `permalink: false`; an item that gains a body and its own
// page must set a permalink (and a layout) explicitly.
//
// Item front matter (docs/DESIGN.md §7, plus optional extras read by
// src/writing/index.njk). Omit anything unknown — the template hides it:
//
//   title          headline (or a plain description for quotes/citations)
//   deck           optional sub-headline
//   date           YYYY-MM-DD. Use only what the source states:
//   datePrecision  month | year  → "Sept 2025" or "2025". A year-only item
//                  uses YYYY-01-01 with datePrecision: year.
//   undated        true when no date is known. Such items are listed under
//   group          their `group` heading after the years, and are left out
//                  of collections.writing (eleventyExcludeFromCollections:
//                  [writing]) so date-sorted lists elsewhere never show them
//                  with a made-up date.
//   type           article | feature | quote | citation | video | talk
//   typeLabel      optional display label (default comes from the type)
//   outlet         publication, venue or institution
//   outletLong     optional full name of an abbreviated outlet (<abbr title>)
//   platform       optional (e.g. YouTube) → "OLE Nepal on YouTube"
//   place          optional (e.g. New York)
//   republishedBy  list of outlets that republished the item
//   url            ONLY a URL that the old site or docs/FACTS.md gives
//   role           e.g. Co-author, Quoted, Technical contributor
//   coAuthors      list of names
//   domain         water | heritage | education (colours the type label)
//   featured       true → lead block at the top of /writing/
//   summary        one or two sentences, first person
//   notes          list of { text, ref? } — ref is another item's file slug,
//                  rendered as an in-page link to that entry
//   onRequest      e.g. "synopsis" → "Ask me for the synopsis" mail link
//   appearedIn     false → left out of the hero's "Appeared in" outlet row
export default {
  permalink: false,
};
