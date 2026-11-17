// Build-time values available as `build.*` in templates.
export default {
  year: new Date().getFullYear(),
  timestamp: new Date().toISOString(),
};
