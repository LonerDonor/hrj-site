/*
 * map.js — Leaflet maps for project pages (e.g. /work/rajkulo-canal/).
 * Loaded after the self-hosted /assets/vendor/leaflet/leaflet.js, with defer.
 *
 * Markup contract (layouts/project.njk):
 *   [data-map]                container, with
 *     data-center='[lat, lng]'  data-zoom="14"  data-label="…"
 *     data-layers='[{ "file": "/assets/maps/x.geojson", "color": "--copper", "label": "…" }]'
 *     data-tile-key="…"       optional CARTO basemaps key (see below)
 *     [data-map-canvas]       empty div the map is drawn into (.js-only)
 *     [data-map-hint]         pan/zoom hint (.js-only), hidden when the map can't be moved
 *     [data-map-legend]       <ul hidden>, filled for layers that loaded
 *   The static caption (place, coordinates, OpenStreetMap link) is the no-JS
 *   fallback and stays visible underneath the map.
 *
 * Basemap: CARTO "Voyager" raster tiles from *.basemaps.cartocdn.com. CARTO
 * now stamps "API key required" on tiles requested without `?key=`, so the
 * tile layer is only added when a key is given. Without one the map is drawn
 * as a field sketch on the page's hatched paper (layers and marker, no
 * basemap); the OpenStreetMap link in the caption gives the street context.
 *
 * Layers: each GeoJSON file is fetched (only files that exist at build time are
 * listed); any that cannot be read are skipped quietly. If none load, the map
 * shows one marker at the centre with the place label in a popup.
 * `color` may be a CSS custom property name ("--copper") or a colour value.
 */
(function () {
  "use strict";

  var containers = Array.prototype.slice.call(document.querySelectorAll("[data-map]"));
  if (!containers.length) return;

  /* Without a working map, drop the empty canvas and the pan/zoom hint; the
     static caption (place, coordinates, OpenStreetMap link) stays. */
  function fallback(el) {
    var parts = el.querySelectorAll("[data-map-canvas], [data-map-hint]");
    for (var i = 0; i < parts.length; i++) parts[i].hidden = true;
  }

  var L = window.L;
  if (!L || typeof L.map !== "function") {
    containers.forEach(fallback);
    return;
  }

  // Self-hosted default marker images (passthrough of leaflet/dist/images).
  L.Icon.Default.imagePath = "/assets/vendor/leaflet/images/";

  // {s} = a–d subdomains, which match the CSP's img-src *.basemaps.cartocdn.com.
  var TILES = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key={key}";
  var ATTRIBUTION =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors ' +
    '&copy; <a href="https://carto.com/attributions">CARTO</a>';

  var rootStyle = window.getComputedStyle(document.documentElement);

  function parse(json, defaultValue) {
    try {
      var value = JSON.parse(json);
      return value == null ? defaultValue : value;
    } catch (e) {
      return defaultValue;
    }
  }

  function resolveColor(value, fallbackToken) {
    var v = String(value || fallbackToken || "").trim();
    if (v.indexOf("--") === 0) v = rootStyle.getPropertyValue(v).trim();
    return v || rootStyle.getPropertyValue(fallbackToken).trim() || "currentColor";
  }

  /* Popup content built as DOM nodes (feature properties are data, never HTML). */
  function popupContent(title, note, deva) {
    var box = document.createElement("div");
    box.className = "project-map__popup";
    if (title) {
      var strong = document.createElement("strong");
      strong.textContent = title;
      box.appendChild(strong);
    }
    if (deva) {
      var d = document.createElement("span");
      d.className = "deva";
      d.lang = "ne";
      d.textContent = deva;
      box.appendChild(d);
    }
    if (note) {
      var p = document.createElement("span");
      p.className = "project-map__popup-note";
      p.textContent = note;
      box.appendChild(p);
    }
    return box;
  }

  function loadLayer(map, layer) {
    if (!layer || !layer.file || !window.fetch) return Promise.resolve(null);
    return window
      .fetch(layer.file, { credentials: "same-origin" })
      .then(function (response) {
        if (!response.ok) return null;
        return response.json();
      })
      .then(function (data) {
        if (!data) return null;
        var color = resolveColor(layer.color, "--copper");
        var geo = L.geoJSON(data, {
          style: function () {
            return { color: color, weight: 4, opacity: 0.9 };
          },
          pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
              radius: 6,
              color: color,
              weight: 2,
              fillColor: color,
              fillOpacity: 0.85,
            });
          },
          onEachFeature: function (feature, lyr) {
            var props = (feature && feature.properties) || {};
            var title = props.name || props.title || layer.label;
            if (title || props.note || props.deva) {
              lyr.bindPopup(popupContent(title, props.note, props.deva));
            }
          },
        }).addTo(map);
        return { layer: layer, color: color, geo: geo };
      })
      .catch(function () {
        return null;
      });
  }

  function addLegend(el, loaded) {
    var legend = el.querySelector("[data-map-legend]");
    if (!legend || !loaded.length) return;
    loaded.forEach(function (entry) {
      if (!entry.layer.label) return;
      var li = document.createElement("li");
      var swatch = document.createElement("span");
      swatch.className = "project-map__swatch";
      swatch.setAttribute("aria-hidden", "true");
      swatch.style.backgroundColor = entry.color; // CSSOM, allowed by the CSP
      li.appendChild(swatch);
      li.appendChild(document.createTextNode(entry.layer.label));
      legend.appendChild(li);
    });
    legend.hidden = !legend.children.length;
  }

  /* A lone marker on a blank sketch: nothing to pan or zoom to, so pin it. */
  function freeze(el, map, center, zoom) {
    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();
    // Nothing to operate, so it shouldn't be a tab stop either.
    map.getContainer().removeAttribute("tabindex");
    if (map.zoomControl) map.removeControl(map.zoomControl);
    var hint = el.querySelector("[data-map-hint]");
    if (hint) hint.hidden = true;
    el.classList.add("is-pin"); // shorter canvas (work.css)
    map.invalidateSize();
    map.setView(center, zoom, { animate: false });
  }

  function init(el) {
    var canvas = el.querySelector("[data-map-canvas]");
    if (!canvas) return;

    var center = parse(el.getAttribute("data-center"), null);
    if (!center || center.length !== 2) {
      fallback(el);
      return;
    }
    var zoom = parseInt(el.getAttribute("data-zoom"), 10) || 14;
    var layers = parse(el.getAttribute("data-layers"), []);
    var label = el.getAttribute("data-label") || "";
    var key = (el.getAttribute("data-tile-key") || "").trim();

    var map = L.map(canvas, {
      scrollWheelZoom: false, // don't hijack page scrolling; +/− and drag still work
      zoomControl: true,
    }).setView(center, zoom);
    // Credit the map data (CARTO / OpenStreetMap) only — no extra link to the
    // Leaflet site (its licence doesn't require one).
    if (map.attributionControl) map.attributionControl.setPrefix(false);

    if (key) {
      L.tileLayer(TILES, {
        key: encodeURIComponent(key),
        subdomains: "abcd",
        maxZoom: 19,
        attribution: ATTRIBUTION,
      }).addTo(map);
    } else {
      el.classList.add("is-sketch");
    }

    var pending = Array.isArray(layers) ? layers.map(function (l) { return loadLayer(map, l); }) : [];

    Promise.all(pending).then(function (results) {
      var loaded = results.filter(Boolean);

      if (!loaded.length) {
        // No layer data: mark the study area itself.
        if (!key) freeze(el, map, center, zoom);
        var marker = L.marker(center, { title: label, alt: label, keyboard: !!key }).addTo(map);
        if (label) marker.bindPopup(popupContent(label), { closeButton: !!key }).openPopup();
        return;
      }

      var bounds = null;
      loaded.forEach(function (entry) {
        var b = entry.geo.getBounds && entry.geo.getBounds();
        if (b && b.isValid()) bounds = bounds ? bounds.extend(b) : L.latLngBounds(b.getSouthWest(), b.getNorthEast());
      });
      if (bounds) map.fitBounds(bounds, { padding: [24, 24], maxZoom: 17 });
      addLegend(el, loaded);
    });
  }

  containers.forEach(function (el) {
    try {
      init(el);
    } catch (e) {
      fallback(el);
    }
  });
})();
