/*
 * work-filter.js — domain filter for /work/. Progressive enhancement:
 * without this script every project is listed and the chips stay hidden
 * (.js-only). With it, the chips toggle items by `data-domain`, a polite
 * live region reports the count, and the choice is kept in ?domain= via
 * history.replaceState (so it survives reloads and can be shared).
 *
 * Markup contract (src/work/index.njk):
 *   [data-work-filter]                 wrapper (chips + status)
 *     button[data-filter="all|<domain>"][aria-pressed][data-noun]
 *     [data-filter-status]             role="status"
 *   [data-filter-item][data-domain]    each project (hidden when filtered out)
 *   [data-filter-group]                hidden when none of its items match
 *   [data-filter-layout]               gets .is-filtered while a filter is on
 */
(function () {
  "use strict";

  var bar = document.querySelector("[data-work-filter]");
  if (!bar) return;

  var buttons = Array.prototype.slice.call(bar.querySelectorAll("button[data-filter]"));
  var status = bar.querySelector("[data-filter-status]");
  var items = Array.prototype.slice.call(document.querySelectorAll("[data-filter-item]"));
  var groups = Array.prototype.slice.call(document.querySelectorAll("[data-filter-group]"));
  var layouts = Array.prototype.slice.call(document.querySelectorAll("[data-filter-layout]"));
  if (!buttons.length || !items.length) return;

  var PARAM = "domain";
  var valid = buttons
    .filter(function (b) { return !b.disabled; })
    .map(function (b) { return b.getAttribute("data-filter"); });

  function buttonFor(value) {
    for (var i = 0; i < buttons.length; i++) {
      if (buttons[i].getAttribute("data-filter") === value) return buttons[i];
    }
    return null;
  }

  function message(value, count) {
    if (value === "all") return "Showing all " + count + " projects";
    var btn = buttonFor(value);
    var noun = (btn && btn.getAttribute("data-noun")) || value;
    return "Showing " + count + " " + noun + " project" + (count === 1 ? "" : "s");
  }

  function readParam() {
    try {
      return new URLSearchParams(window.location.search).get(PARAM) || "all";
    } catch (e) {
      return "all";
    }
  }

  function writeParam(value) {
    if (!window.history || typeof window.history.replaceState !== "function") return;
    try {
      var url = new URL(window.location.href);
      if (value === "all") url.searchParams.delete(PARAM);
      else url.searchParams.set(PARAM, value);
      window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
    } catch (e) {
      /* URL API unavailable: the filter still works, the address just doesn't change. */
    }
  }

  function apply(value, updateUrl) {
    if (valid.indexOf(value) === -1) value = "all";
    var shown = 0;

    items.forEach(function (item) {
      var match = value === "all" || item.getAttribute("data-domain") === value;
      item.hidden = !match;
      if (match) shown += 1;
    });

    groups.forEach(function (group) {
      group.hidden = !group.querySelector("[data-filter-item]:not([hidden])");
    });

    layouts.forEach(function (layout) {
      layout.classList.toggle("is-filtered", value !== "all");
    });

    buttons.forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-filter") === value));
    });

    if (status) status.textContent = message(value, shown);
    if (updateUrl) writeParam(value);
  }

  buttons.forEach(function (b) {
    b.addEventListener("click", function () {
      if (b.disabled) return;
      apply(b.getAttribute("data-filter"), true);
    });
  });

  // Initial state from ?domain=… (an unknown value falls back to "all" and is
  // removed from the address).
  var initial = readParam();
  apply(initial, valid.indexOf(initial) === -1 && initial !== "all");
})();
