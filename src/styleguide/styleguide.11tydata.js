// /styleguide/ is a developer reference (docs/DESIGN.md §10). It is built
// while developing (`npm start`, run mode "serve"/"watch") and left out of
// production builds (`npx @11ty/eleventy`, run mode "build"), so it is never
// published.
export default {
  permalink: () => (process.env.ELEVENTY_RUN_MODE === "build" ? false : "/styleguide/"),
};
