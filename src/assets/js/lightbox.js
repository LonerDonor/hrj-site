/*
 * lightbox.js — /photos/: filter the sets, and view photographs larger.
 * Dependency-free, loaded with `defer`. Everything here is an enhancement:
 *
 *   Without JS  every photograph is listed; the filter chips (.js-only) are
 *               hidden; a tile whose image exists links to its full-size JPEG;
 *               tiles still showing a placeholder are not links at all.
 *
 *   Filter      chips [data-filter] show one set at a time by toggling `hidden`
 *               on tiles [data-category]. The choice is kept in the address as
 *               ?category=<id> (history.replaceState) and read back on load.
 *               The [data-gallery-status] line (role="status") announces it.
 *
 *   Viewer      activating a linked tile (a[data-lightbox]) opens the native
 *               <dialog data-lightbox-dialog>: previous / next buttons, ← / →
 *               keys, swipe on touch, Escape or the close button to leave.
 *               It steps through the tiles currently shown (the filter applies)
 *               and focus returns to the tile of the photograph last viewed.
 *               Motion is CSS-only and switched off under reduced motion.
 */
(function () {
  "use strict";

  var gallery = document.querySelector("[data-gallery]");
  if (!gallery) return;

  var toArray = function (list) { return Array.prototype.slice.call(list); };
  var tiles = toArray(gallery.children).filter(function (el) {
    return el.hasAttribute("data-category");
  });
  var total = tiles.length;
  var plural = function (n) { return n === 1 ? "photograph" : "photographs"; };
  var text = function (el) { return el ? el.textContent.replace(/\s+/g, " ").trim() : ""; };

  /* ---------------------------------------------------------------------
   * Filter
   * ------------------------------------------------------------------- */
  var group = document.querySelector("[data-gallery-filter]");
  var status = document.querySelector("[data-gallery-status]");
  var chips = group ? toArray(group.querySelectorAll("[data-filter]")) : [];
  var known = chips.map(function (chip) { return chip.getAttribute("data-filter"); });

  function labelFor(id) {
    for (var i = 0; i < chips.length; i++) {
      if (chips[i].getAttribute("data-filter") === id) return chips[i].getAttribute("data-label") || id;
    }
    return id;
  }

  function setFilter(id, fromUser) {
    if (known.indexOf(id) === -1) id = "all";

    var shown = 0;
    tiles.forEach(function (tile) {
      var match = id === "all" || tile.getAttribute("data-category") === id;
      tile.hidden = !match;
      if (match) shown += 1;
    });

    chips.forEach(function (chip) {
      chip.setAttribute("aria-pressed", String(chip.getAttribute("data-filter") === id));
    });

    if (status) {
      status.textContent = id === "all"
        ? "Showing all " + total + " " + plural(total)
        : "Showing " + shown + " of " + total + " " + plural(total) + ": " + labelFor(id);
    }

    if (fromUser) {
      gallery.classList.add("is-filtered");
      writeParam(id);
    }
  }

  function writeParam(id) {
    try {
      var url = new URL(window.location.href);
      if (id === "all") url.searchParams.delete("category");
      else url.searchParams.set("category", id);
      window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
    } catch (e) {
      /* Address not updatable (e.g. file://) — the filter still works. */
    }
  }

  if (chips.length) {
    group.addEventListener("click", function (event) {
      var chip = event.target.closest("[data-filter]");
      if (!chip || !group.contains(chip)) return;
      setFilter(chip.getAttribute("data-filter"), true);
    });

    var initial = null;
    try {
      initial = new URLSearchParams(window.location.search).get("category");
    } catch (e) {
      initial = null;
    }
    if (initial) {
      // A known set is applied quietly (no fade); "all" or an unknown value
      // is simply dropped from the address.
      if (initial !== "all" && known.indexOf(initial) !== -1) setFilter(initial, false);
      else writeParam("all");
    }
  }

  /* ---------------------------------------------------------------------
   * Viewer
   * ------------------------------------------------------------------- */
  var dialog = document.querySelector("[data-lightbox-dialog]");
  if (!dialog || typeof dialog.showModal !== "function") return;

  var root = document.documentElement;
  var stage = dialog.querySelector("[data-lightbox-stage]");
  var captionEl = dialog.querySelector("[data-lightbox-caption]");
  var countEl = dialog.querySelector("[data-lightbox-count]");
  var prevBtn = dialog.querySelector("[data-lightbox-prev]");
  var nextBtn = dialog.querySelector("[data-lightbox-next]");
  var closeBtn = dialog.querySelector("[data-lightbox-close]");
  if (!stage) return;

  // The viewer is up to 80rem wide (main.css .lightbox), 96vw below that.
  var VIEW_SIZES = "(min-width: 84rem) 80rem, 96vw";

  var list = [];
  var index = -1;

  var linkOf = function (tile) { return tile ? tile.querySelector("a[data-lightbox]") : null; };

  function viewable() {
    return tiles.filter(function (tile) { return !tile.hidden && linkOf(tile); });
  }

  /** A copy of the tile's responsive image, re-sized for the viewer. */
  function imageFor(tile) {
    var link = linkOf(tile);
    var picture = link.querySelector("picture");
    var img = link.querySelector("img");
    var node;

    if (picture) {
      node = picture.cloneNode(true);
    } else if (img) {
      node = img.cloneNode(true);
    } else {
      node = document.createElement("img");
      node.src = link.href;
    }

    var imgs = node.tagName === "IMG" ? [node] : toArray(node.querySelectorAll("img"));
    toArray(node.tagName === "PICTURE" ? node.querySelectorAll("source") : []).forEach(function (source) {
      if (source.hasAttribute("srcset")) source.setAttribute("sizes", VIEW_SIZES);
    });
    imgs.forEach(function (el) {
      if (el.hasAttribute("srcset")) el.setAttribute("sizes", VIEW_SIZES);
      el.setAttribute("loading", "eager");
      el.setAttribute("decoding", "async");
      el.removeAttribute("class");
      if (!el.getAttribute("alt") && img) el.setAttribute("alt", img.getAttribute("alt") || "");
    });
    return { node: node, img: imgs[0] || null };
  }

  function captionFor(tile) {
    var title = text(tile.querySelector(".plate__title"));
    var meta = toArray(tile.querySelectorAll(".plate__meta > span")).map(text).filter(Boolean).join(" · ");
    return meta ? title + " — " + meta : title;
  }

  function plateOf(tile) {
    var no = tile.querySelector(".plate__no");
    return no ? text(no).replace(/^Plate\s*/i, "") : "";
  }

  function render() {
    var tile = list[index];
    if (!tile) return;
    var made = imageFor(tile);

    stage.classList.add("is-loading");
    var done = function () { stage.classList.remove("is-loading"); };
    if (made.img) {
      made.img.addEventListener("load", done, { once: true });
      made.img.addEventListener("error", done, { once: true });
    }
    while (stage.firstChild) stage.removeChild(stage.firstChild);
    stage.appendChild(made.node);
    if (!made.img || made.img.complete) done();

    if (captionEl) captionEl.textContent = captionFor(tile);
    if (countEl) {
      var plate = plateOf(tile);
      countEl.textContent = (plate ? "Plate " + plate + " · " : "") + (index + 1) + " of " + list.length;
    }

    var single = list.length < 2;
    if (prevBtn) prevBtn.hidden = single;
    if (nextBtn) nextBtn.hidden = single;
  }

  function step(delta) {
    if (list.length < 2) return;
    index = (index + delta + list.length) % list.length;
    render();
  }

  function open(tile) {
    list = viewable();
    index = list.indexOf(tile);
    if (index === -1) return;
    render();
    if (!dialog.open) {
      root.classList.add("has-lightbox");
      dialog.showModal();
      if (closeBtn && document.activeElement !== closeBtn) closeBtn.focus();
    }
  }

  // Tile activation (event delegation). Modified clicks keep their default
  // (e.g. open the full-size file in a new tab).
  gallery.addEventListener("click", function (event) {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    var link = event.target.closest("a[data-lightbox]");
    if (!link || !gallery.contains(link)) return;
    event.preventDefault();
    open(link.closest("[data-category]"));
  });

  if (prevBtn) prevBtn.addEventListener("click", function () { step(-1); });
  if (nextBtn) nextBtn.addEventListener("click", function () { step(1); });
  if (closeBtn) closeBtn.addEventListener("click", function () { dialog.close(); });

  dialog.addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    }
  });

  // A click on the backdrop (outside the dialog box) closes it.
  dialog.addEventListener("click", function (event) {
    if (event.target !== dialog) return;
    var r = dialog.getBoundingClientRect();
    var inside = event.clientX >= r.left && event.clientX <= r.right && event.clientY >= r.top && event.clientY <= r.bottom;
    if (!inside) dialog.close();
  });

  // Escape (native `cancel`) and close() both end here. The `close` event is
  // queued, so it can arrive after the viewer was opened again (a quick
  // close-then-open): ignore it then, or it would empty the open viewer.
  dialog.addEventListener("close", function () {
    if (dialog.open) return;
    root.classList.remove("has-lightbox");
    var link = linkOf(list[index]);
    while (stage.firstChild) stage.removeChild(stage.firstChild);
    if (link) link.focus();
  });

  // Swipe left / right on touch screens.
  var startX = null;
  var startY = 0;
  stage.addEventListener("pointerdown", function (event) {
    if (event.pointerType === "mouse") return;
    startX = event.clientX;
    startY = event.clientY;
  });
  stage.addEventListener("pointerup", function (event) {
    if (startX === null) return;
    var dx = event.clientX - startX;
    var dy = event.clientY - startY;
    startX = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1);
  });
  stage.addEventListener("pointercancel", function () { startX = null; });
})();
