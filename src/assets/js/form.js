/*
 * form.js — the enquiry on /work-with-me/ (#enquire). Progressive enhancement
 * only. Without it the form posts straight to Formspree (which redirects to
 * /thanks/), every follow-up fieldset is shown with its legend, and the
 * direct-contact links are plain mailto: / wa.me / tel: links.
 *
 * With it:
 *   - ?topic=<value|service slug|alias> (and ?walk=<walk slug>) preselect the
 *     topic; "Enquire about this" links do the same in place (pushState).
 *   - Form branch: only the follow-up fieldset for the chosen topic shows (the
 *     others get `hidden` + `disabled`, so they are not sent); inline errors
 *     (aria-invalid + aria-describedby, focus on the first error); sending in
 *     place with fetch (Accept: application/json), a polite status region by
 *     the button, focus on the success heading, and a mailto fallback that
 *     carries the message if sending fails.
 *   - Direct branch (no Formspree ID): highlights the matching "what to
 *     include" group and pre-fills the email with its prompts.
 *
 * All visible copy lives in the template (data attributes and <template>s).
 * Markup contract: src/work-with-me/index.njk
 *   section[data-enquiry][data-topics JSON][data-aliases JSON][data-email]
 *   [data-enquiry-heading]  [data-topic-note] > [data-topic-note-text]
 *   a[data-topic-link="<topic>"]
 *   form[data-enquiry-form]: select[data-enquiry-topic], select[data-enquiry-walk],
 *     input[data-enquiry-subject][data-subject-pattern], fieldset[data-group][data-topics],
 *     [data-enquiry-submit][data-sending-label] > [data-submit-label],
 *     [data-enquiry-status], [required][data-label][data-error-required][data-error-format?]
 *     with a #<id>-error.field__error > [data-error-text] each
 *   [data-enquiry-head], [data-enquiry-success] > [data-enquiry-success-heading]
 *   template[data-enquiry-template="sending|invalid|error"] ([data-slot], [data-enquiry-mailto])
 *   [data-enquiry-direct][data-mail-subject][data-mail-greeting][data-mail-prompts]
 *     > [data-group][data-topics] li[data-prompt];  a[data-channel="email"]
 */
(function () {
  "use strict";

  var section = document.querySelector("[data-enquiry]");
  if (!section) return;

  var topics = parseJSON(section.getAttribute("data-topics"), []);
  var aliases = parseJSON(section.getAttribute("data-aliases"), {});
  var address = section.getAttribute("data-email") || "";
  var heading = section.querySelector("[data-enquiry-heading]");
  var note = section.querySelector("[data-topic-note]");
  var noteText = note && note.querySelector("[data-topic-note-text]");
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var formApi = initForm(section.querySelector("[data-enquiry-form]"));
  var directApi = initDirect(section.querySelector("[data-enquiry-direct]"));

  /* ---------------------------------------------------------------------
   * Helpers
   * ------------------------------------------------------------------- */
  function parseJSON(text, fallback) {
    try {
      return JSON.parse(text) || fallback;
    } catch (e) {
      return fallback;
    }
  }

  function toArray(list) {
    return Array.prototype.slice.call(list || []);
  }

  function getParam(name) {
    var match = new RegExp("[?&]" + name + "=([^&#]*)").exec(window.location.search);
    if (!match) return "";
    try {
      return decodeURIComponent(match[1].replace(/\+/g, " "));
    } catch (e) {
      return "";
    }
  }

  // A topic value from a value, a service slug or an alias (case-insensitive).
  function resolveTopic(raw) {
    var key = String(raw || "").trim().toLowerCase();
    if (!key) return "";
    if (Object.prototype.hasOwnProperty.call(aliases, key)) key = String(aliases[key]);
    for (var i = 0; i < topics.length; i++) {
      if (topics[i].value === key || topics[i].slug === key) return topics[i].value;
    }
    return "";
  }

  function titleFor(value) {
    for (var i = 0; i < topics.length; i++) {
      if (topics[i].value === value) return topics[i].title;
    }
    return "";
  }

  function inGroup(el, value) {
    return !!value && (" " + (el.getAttribute("data-topics") || "") + " ").indexOf(" " + value + " ") !== -1;
  }

  function cleanSlug(raw) {
    return String(raw || "").toLowerCase().replace(/[^a-z0-9-]/g, "");
  }

  function showNote(value) {
    if (!note || !noteText) return;
    var title = titleFor(value);
    noteText.textContent = title;
    note.hidden = !title;
  }

  /* ---------------------------------------------------------------------
   * Topic state — shared by both branches
   * ------------------------------------------------------------------- */
  function setTopic(value, options) {
    var opts = options || {};
    if (formApi) value = formApi.setTopic(value, opts);
    if (directApi) directApi.setTopic(value);
    showNote(value);
  }

  function goToEnquiry() {
    section.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    if (heading) {
      heading.setAttribute("tabindex", "-1");
      try {
        heading.focus({ preventScroll: true });
      } catch (e) {
        heading.focus();
      }
    }
  }

  var walkSlug = cleanSlug(getParam("walk"));
  var initial = resolveTopic(getParam("topic")) || (walkSlug ? resolveTopic("walk") : "");
  setTopic(initial, { initial: true });
  if (walkSlug) {
    if (formApi) formApi.selectWalk(walkSlug);
    if (directApi) directApi.selectWalk(walkSlug);
  }

  // "Enquire about this": set the topic in place instead of reloading.
  toArray(document.querySelectorAll("a[data-topic-link]")).forEach(function (link) {
    link.addEventListener("click", function (event) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      var value = resolveTopic(link.getAttribute("data-topic-link"));
      if (!value) return;
      event.preventDefault();
      setTopic(value, { force: true });
      if (window.history && history.pushState) {
        try {
          history.pushState({ enquiryTopic: value }, "", link.href);
        } catch (e) { /* file:// or sandboxed: ignore */ }
      }
      goToEnquiry();
    });
  });

  window.addEventListener("popstate", function () {
    var value = resolveTopic(getParam("topic"));
    if (value) setTopic(value, { force: true });
  });

  /* ---------------------------------------------------------------------
   * Form branch
   * ------------------------------------------------------------------- */
  function initForm(form) {
    if (!form) return null;

    var topicSelect = form.querySelector("[data-enquiry-topic]");
    var walkSelect = form.querySelector("[data-enquiry-walk]");
    var subject = form.querySelector("[data-enquiry-subject]");
    var groups = toArray(form.querySelectorAll("fieldset[data-group]"));
    var submit = form.querySelector("[data-enquiry-submit]");
    var submitLabel = submit && submit.querySelector("[data-submit-label]");
    var idleLabel = submitLabel ? submitLabel.textContent : "";
    var sendingLabel = (submit && submit.getAttribute("data-sending-label")) || idleLabel;
    var status = form.querySelector("[data-enquiry-status]");
    var head = section.querySelector("[data-enquiry-head]");
    var success = section.querySelector("[data-enquiry-success]");
    var successHeading = section.querySelector("[data-enquiry-success-heading]");
    var required = toArray(form.querySelectorAll("[required]"));
    var baseSubject = subject ? subject.value : "";
    var subjectPattern = (subject && subject.getAttribute("data-subject-pattern")) || "";
    var canSend = typeof window.fetch === "function" && typeof window.FormData === "function";
    var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    var attempted = false;
    var sending = false;
    var statusTimer = 0;

    // JS validates from here on (inline messages instead of browser bubbles).
    form.noValidate = true;

    function hasOption(select, value) {
      return toArray(select.options).some(function (o) { return o.value === value; });
    }

    function refreshGroups() {
      var value = topicSelect ? topicSelect.value : "";
      groups.forEach(function (group) {
        var on = inGroup(group, value);
        group.hidden = !on;
        group.disabled = !on;
      });
      if (subject) {
        var title = titleFor(value);
        subject.value = title && subjectPattern ? subjectPattern.replace("{topic}", title) : baseSubject;
      }
    }

    function setFormTopic(value, opts) {
      if (topicSelect) {
        // A value the browser restored (back/forward) wins over "no topic".
        if (value && hasOption(topicSelect, value)) topicSelect.value = value;
        else if (opts && opts.force) topicSelect.value = "";
        value = topicSelect.value;
        if (attempted) validate(topicSelect);
      }
      refreshGroups();
      return value;
    }

    function selectWalk(slug) {
      if (!walkSelect) return;
      toArray(walkSelect.options).forEach(function (option) {
        if (option.getAttribute("data-slug") === slug) walkSelect.value = option.value;
      });
    }

    /* --- Validation --- */
    function errorFor(field) {
      var value = String(field.value || "").trim();
      if (!value) return field.getAttribute("data-error-required") || "";
      if (field.type === "email" && !EMAIL.test(value)) return field.getAttribute("data-error-format") || "";
      return null; // valid
    }

    function setError(field, message) {
      var errId = field.id + "-error";
      var box = document.getElementById(errId);
      var wrap = field.closest ? field.closest(".field") : null;
      var ids = (field.getAttribute("aria-describedby") || "").split(/\s+/).filter(function (id) {
        return id && id !== errId;
      });
      if (message !== null && message !== undefined) {
        ids.unshift(errId); // error first, then the hint
        field.setAttribute("aria-invalid", "true");
        if (box) {
          var text = box.querySelector("[data-error-text]");
          if (text) text.textContent = message;
          box.hidden = false;
        }
        if (wrap) wrap.classList.add("field--error");
      } else {
        field.removeAttribute("aria-invalid");
        if (box) box.hidden = true;
        if (wrap) wrap.classList.remove("field--error");
      }
      if (ids.length) field.setAttribute("aria-describedby", ids.join(" "));
      else field.removeAttribute("aria-describedby");
    }

    function validate(field) {
      var message = errorFor(field);
      setError(field, message);
      return message === null;
    }

    function isActive(field) {
      try {
        return !field.matches(":disabled");
      } catch (e) {
        return !field.disabled;
      }
    }

    required.forEach(function (field) {
      field.addEventListener(field.tagName === "SELECT" ? "change" : "input", function () {
        if (field.getAttribute("aria-invalid") === "true") validate(field);
      });
      field.addEventListener("blur", function () {
        if (attempted && !sending) validate(field);
      });
    });

    if (topicSelect) {
      topicSelect.addEventListener("change", function () {
        setTopic(topicSelect.value, { force: true });
      });
    }

    /* --- Status region --- */
    function showStatus(name, slots) {
      if (!status) return;
      window.clearTimeout(statusTimer);
      status.textContent = "";
      var tpl = section.querySelector('template[data-enquiry-template="' + name + '"]');
      if (!tpl || !tpl.content) return;
      var node = tpl.content.cloneNode(true);
      Object.keys(slots || {}).forEach(function (key) {
        var slot = node.querySelector('[data-slot="' + key + '"]');
        if (slot) slot.textContent = slots[key];
      });
      // Insert after a beat so a repeated message is announced again.
      statusTimer = window.setTimeout(function () {
        status.appendChild(node);
      }, 60);
      return node;
    }

    function clearStatus() {
      if (!status) return;
      window.clearTimeout(statusTimer);
      status.textContent = "";
    }

    function setBusy(on) {
      sending = on;
      form.setAttribute("aria-busy", on ? "true" : "false");
      if (submit) {
        // aria-disabled (not `disabled`) keeps keyboard focus on the button.
        if (on) submit.setAttribute("aria-disabled", "true");
        else submit.removeAttribute("aria-disabled");
      }
      if (submitLabel) submitLabel.textContent = on ? sendingLabel : idleLabel;
    }

    /* --- Mail fallback carrying what was typed --- */
    function labelFor(el) {
      if (el.getAttribute("data-label")) return el.getAttribute("data-label");
      var label = el.id && form.querySelector('label[for="' + el.id + '"]');
      if (!label) return el.name;
      var copy = label.cloneNode(true);
      toArray(copy.querySelectorAll(".field__req, .visually-hidden, .field__optional")).forEach(function (n) {
        n.parentNode.removeChild(n);
      });
      return copy.textContent.replace(/\s+/g, " ").trim();
    }

    function mailtoFromForm() {
      var lines = [];
      var message = "";
      toArray(form.elements).forEach(function (el) {
        if (!el.name || el.name.charAt(0) === "_" || el.type === "hidden" || !isActive(el)) return;
        var value = el.tagName === "SELECT" ? (el.value ? el.options[el.selectedIndex].text : "") : String(el.value || "").trim();
        if (!value) return;
        if (el.name === "message") message = value;
        else lines.push(labelFor(el) + ": " + value);
      });
      var body = lines.join("\n") + (message ? "\n\n" + message : "");
      if (body.length > 1800) body = body.slice(0, 1800) + "…";
      return "mailto:" + address + "?subject=" + encodeURIComponent(subject ? subject.value : "") + "&body=" + encodeURIComponent(body);
    }

    /* --- Outcomes --- */
    function done() {
      setBusy(false);
      clearStatus();
      form.reset();
      form.hidden = true;
      if (head) head.hidden = true;
      if (success) success.hidden = false;
      if (successHeading) successHeading.focus();
    }

    function fail(data) {
      setBusy(false);
      // Formspree reports field problems as { errors: [{ field, message }] }.
      var flagged = [];
      if (data && data.errors && data.errors.length) {
        data.errors.forEach(function (problem) {
          var field = problem && problem.field && form.elements.namedItem(problem.field);
          if (field && field.id && required.indexOf(field) !== -1) {
            setError(field, field.getAttribute("data-error-format") || field.getAttribute("data-error-required") || "");
            flagged.push(field);
          }
        });
      }
      if (flagged.length) {
        showStatus("invalid", { fields: flagged.map(labelFor).join(", ") });
        flagged[0].focus();
        return;
      }
      var node = showStatus("error");
      var link = node && node.querySelector("[data-enquiry-mailto]");
      if (link) link.setAttribute("href", mailtoFromForm());
    }

    function send() {
      setBusy(true);
      showStatus("sending");
      var controller = typeof window.AbortController === "function" ? new AbortController() : null;
      var timer = controller ? window.setTimeout(function () { controller.abort(); }, 15000) : 0;
      var options = { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } };
      if (controller) options.signal = controller.signal;

      window.fetch(form.action, options)
        .then(function (response) {
          return response.json().then(
            function (data) { return { ok: response.ok, data: data }; },
            function () { return { ok: response.ok, data: null }; }
          );
        })
        .then(function (result) {
          window.clearTimeout(timer);
          if (result.ok) done();
          else fail(result.data);
        })
        .catch(function () {
          window.clearTimeout(timer);
          fail(null);
        });
    }

    form.addEventListener("submit", function (event) {
      if (sending) {
        event.preventDefault();
        return;
      }
      attempted = true;
      var invalid = required.filter(function (field) {
        return isActive(field) && !validate(field);
      });
      if (invalid.length) {
        event.preventDefault();
        showStatus("invalid", { fields: invalid.map(labelFor).join(", ") });
        invalid[0].focus();
        return;
      }

      // Name the sender in the email subject.
      var name = form.elements.namedItem("name");
      if (subject && name && name.value.trim()) {
        refreshGroups();
        subject.value = subject.value + " — " + name.value.trim();
      }

      if (!canSend) {
        clearStatus(); // old browser: a normal POST, Formspree redirects to /thanks/
        return;
      }
      event.preventDefault();
      send();
    });

    return { setTopic: setFormTopic, selectWalk: selectWalk };
  }

  /* ---------------------------------------------------------------------
   * Direct branch (no form ID yet)
   * ------------------------------------------------------------------- */
  function initDirect(direct) {
    if (!direct) return null;

    var groups = toArray(direct.querySelectorAll("[data-group]"));
    var links = toArray(section.querySelectorAll('a[data-channel="email"]'));
    var baseHrefs = links.map(function (a) { return a.getAttribute("href"); });
    var subjectPattern = direct.getAttribute("data-mail-subject") || "{topic}";
    var greeting = direct.getAttribute("data-mail-greeting") || "";
    var basePrompts = (direct.getAttribute("data-mail-prompts") || "").split("|").filter(Boolean);
    var walkTitle = "";

    function promptsFor(group) {
      return group
        ? toArray(group.querySelectorAll("[data-prompt]")).map(function (li) { return li.getAttribute("data-prompt"); })
        : [];
    }

    function setDirectTopic(value) {
      var current = null;
      groups.forEach(function (group) {
        var on = inGroup(group, value);
        group.classList.toggle("is-current", on);
        if (on && !current) current = group;
      });

      var title = titleFor(value);
      if (!title) {
        links.forEach(function (a, i) { a.setAttribute("href", baseHrefs[i]); });
        return;
      }
      var lines = basePrompts.concat(promptsFor(current)).map(function (prompt) {
        // "Which walk" is answered already when we arrived from a walk page.
        return prompt + ":" + (walkTitle && /walk/i.test(prompt) && current && current.getAttribute("data-group") === "walk" ? " " + walkTitle : " ");
      });
      var body = (greeting ? greeting + "\n\n" : "") + lines.join("\n") + "\n\n";
      var href = "mailto:" + address +
        "?subject=" + encodeURIComponent(subjectPattern.replace("{topic}", title)) +
        "&body=" + encodeURIComponent(body);
      links.forEach(function (a) { a.setAttribute("href", href); });
    }

    // ?walk=<slug>: name the walk in the pre-filled email.
    function selectWalk(slug) {
      var link = slug && direct.querySelector('a[href$="/walks/' + slug + '/"]');
      walkTitle = link ? link.textContent.trim() : "";
      var active = groups.filter(function (g) { return g.classList.contains("is-current"); })[0];
      if (active) setDirectTopic(active.getAttribute("data-topics").split(" ")[0]);
    }

    return { setTopic: setDirectTopic, selectWalk: selectWalk };
  }
})();
