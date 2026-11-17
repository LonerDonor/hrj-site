/*
 * site.js — shared behaviour for every page. Dependency-free, loaded with
 * `defer` from the <head>. Content must work without it:
 *   - the mobile nav is shown open when JS is off (CSS keys off html.js);
 *   - .reveal elements are only hidden once this script has armed them.
 */
(function () {
  "use strict";

  // html.js is normally set already by js-flag.js (loaded before paint);
  // this is a fallback if that file failed to load.
  var root = document.documentElement;
  if (!root.classList.contains("js")) {
    root.classList.remove("no-js");
    root.classList.add("js");
  }

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------------------------------------------------------------------
   * Header navigation disclosure (mobile)
   * ------------------------------------------------------------------- */
  var header = document.querySelector(".site-header");
  var toggle = header && header.querySelector(".nav-toggle");
  var panel = toggle && document.getElementById(toggle.getAttribute("aria-controls"));
  // Must match the desktop breakpoint in main.css (48rem).
  var desktop = window.matchMedia("(min-width: 48rem)");

  function setOpen(open, returnFocus) {
    if (!toggle) return;
    toggle.setAttribute("aria-expanded", String(open));
    header.classList.toggle("is-open", open);
    if (!open && returnFocus) toggle.focus();
  }

  if (toggle && panel) {
    setOpen(false);

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    // Escape closes the panel and returns focus to the toggle.
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && header.classList.contains("is-open")) {
        setOpen(false, true);
      }
    });

    // Switching to the desktop layout resets the disclosure.
    var onBreakpoint = function (event) {
      if (event.matches) setOpen(false);
    };
    if (desktop.addEventListener) desktop.addEventListener("change", onBreakpoint);
    else if (desktop.addListener) desktop.addListener(onBreakpoint);
  }

  /* ---------------------------------------------------------------------
   * Reveal on scroll (.reveal) — one observer, each element revealed once.
   * Only elements that start below the fold are hidden ("armed"), so nothing
   * already on screen flickers. Skipped entirely under reduced motion.
   * ------------------------------------------------------------------- */
  var revealables = document.querySelectorAll(".reveal");
  if (revealables.length && "IntersectionObserver" in window && !reduceMotion.matches) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );

    var fold = window.innerHeight || document.documentElement.clientHeight;
    revealables.forEach(function (el) {
      if (el.getBoundingClientRect().top > fold) {
        el.classList.add("is-armed");
        observer.observe(el);
      }
    });
  }
})();
