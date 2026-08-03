(function () {
  "use strict";

  var SCENARIOS = [
    {
      label: "Wissen nutzbar machen",
      title: "Das Firmenwissen wird abrufbar, f\u00fcr das ganze Team.",
      steps: [
        ["01 Quellen", "Markenrichtlinien, Produktdaten, fr\u00fchere Texte und Pr\u00e4sentationen. Verstreutes Wissen wird zusammengef\u00fchrt."],
        ["02 Struktur", "Das Wissen wird so aufbereitet, dass die KI verl\u00e4sslich darauf zugreifen kann. Aktuell und vollst\u00e4ndig."],
        ["03 Assistent", "Ein interner Assistent beantwortet Fragen und liefert Formulierungen. In Ihrer Sprache, mit Ihren Fakten."],
        ["04 Alltag", "Ob Angebot, Anfrage oder Beitrag: Das Team arbeitet mit dem Assistenten statt mit der Suche in Ordnern."],
        ["05 Pflege", "Neues Wissen flie\u00dft laufend ein. Der Assistent wird mit jedem Monat n\u00fctzlicher."]
      ]
    },
    {
      label: "Aus Daten werden Inhalte",
      title: "Aus einem Anlass wird Kommunikation auf allen Kan\u00e4len.",
      steps: [
        ["01 Anlass", "Ein neues Produkt, eine Messe, eine Kundenfrage, die sich h\u00e4uft. Der Ausgangspunkt kommt aus Ihrem Alltag."],
        ["02 Wissen", "Das Wissenssystem liefert Fakten, Tonalit\u00e4t und passende fr\u00fchere Inhalte dazu."],
        ["03 Formate", "Ein Workflow erstellt Entw\u00fcrfe f\u00fcr alle relevanten Kan\u00e4le. Newsletter, Social Media, Website, Vertriebsunterlagen."],
        ["04 Pr\u00fcfung", "Ihr Team pr\u00fcft und sch\u00e4rft an einer Stelle, statt jedes Format einzeln zu erarbeiten."],
        ["05 Ver\u00f6ffentlichung", "Abgestimmt ver\u00f6ffentlicht. Was dabei gelernt wird, flie\u00dft zur\u00fcck ins System."]
      ]
    }
  ];

  function render(index) {
    var title = document.getElementById("walk-title");
    var steps = document.getElementById("walk-steps");
    var tabs = document.querySelectorAll(".tab");
    if (!title || !steps) return;
    var s = SCENARIOS[index];
    title.textContent = s.title;
    steps.textContent = "";
    s.steps.forEach(function (pair) {
      var box = document.createElement("div");
      box.className = "wstep";
      var label = document.createElement("div");
      label.className = "wstep__label";
      label.textContent = pair[0];
      var text = document.createElement("p");
      text.textContent = pair[1];
      box.appendChild(label);
      box.appendChild(text);
      steps.appendChild(box);
    });
    for (var i = 0; i < tabs.length; i++) {
      var on = i === index;
      tabs[i].setAttribute("aria-selected", on ? "true" : "false");
      tabs[i].setAttribute("tabindex", on ? "0" : "-1");
    }
  }

  function initTabs() {
    var tabs = document.querySelectorAll(".tab");
    if (!tabs.length) return;
    for (var i = 0; i < tabs.length; i++) {
      (function (n) {
        tabs[n].addEventListener("click", function () { render(n); });
        tabs[n].addEventListener("keydown", function (e) {
          if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
          e.preventDefault();
          var next = (n + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length;
          tabs[next].focus();
          render(next);
        });
      })(i);
    }
  }

  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("site-nav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  function initForm() {
    var form = document.getElementById("contact-form");
    if (!form) return;
    var status = document.getElementById("cf-status");
    var button = form.querySelector('button[type="submit"]');
    var FIELDS = ["name", "email", "message"];

    var LABELS = { name: "Namen", email: "E-Mail-Adresse", message: "Nachricht" };

    function errorNode(field) { return document.getElementById("cf-" + field + "-error"); }

    function clearErrors() {
      FIELDS.forEach(function (f) {
        var n = errorNode(f);
        if (n) { n.hidden = true; n.textContent = ""; }
        var i = form.elements[f];
        if (i) { i.removeAttribute("aria-invalid"); i.removeAttribute("aria-describedby"); }
      });
      status.hidden = true;
      status.textContent = "";
      status.className = "form__status";
    }

    function setError(field, message) {
      var n = errorNode(field);
      if (!n) return false;
      n.textContent = message;
      n.hidden = false;
      var i = form.elements[field];
      if (i) {
        i.setAttribute("aria-invalid", "true");
        i.setAttribute("aria-describedby", "cf-" + field + "-error");
      }
      return true;
    }

    function validate() {
      var problems = [];
      FIELDS.forEach(function (f) {
        var value = (form.elements[f].value || "").trim();
        if (!value) {
          problems.push([f, "Bitte geben Sie Ihre" + (f === "name" ? "n " : " ") + LABELS[f] + " an."]);
        } else if (f === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
          problems.push([f, "Diese E-Mail-Adresse sieht nicht vollständig aus."]);
        }
      });
      return problems;
    }

    function translate(err) {
      if (err.code === "TYPE_EMAIL" || /email/i.test(err.message || "")) {
        return "Diese E-Mail-Adresse sieht nicht vollständig aus.";
      }
      if (err.code === "REQUIRED_FIELD_EMPTY" || /required|empty/i.test(err.message || "")) {
        return "Bitte füllen Sie dieses Feld aus.";
      }
      return err.message || "Dieses Feld konnte nicht verarbeitet werden.";
    }

function succeed() {
  form.style.transition = 'opacity 0.4s ease';
  form.style.opacity = '0';
  setTimeout(function() {
    form.hidden = true;
    status.innerHTML = '<svg width="32" height="32" viewBox="0 0 30 30" fill="none" aria-hidden="true"><path d="M4 14.5 25.5 5 17 26 13.5 17 4 14.5Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M13.5 17 25.5 5" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg><p>Ihre Nachricht ist angekommen. Ich freue mich auf unser Gespräch.</p>';
    status.className = "form__status form__status--success";
    status.hidden = false;
    status.setAttribute("tabindex", "-1");
    status.focus();
  }, 400);
}

    function fail(message) {
      status.textContent = message;
      status.className = "form__status form__status--error";
      status.hidden = false;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearErrors();

      var problems = validate();
      if (problems.length) {
        problems.forEach(function (p) { setError(p[0], p[1]); });
        var first = form.elements[problems[0][0]];
        if (first && first.focus) first.focus();
        return;
      }

      button.disabled = true;
      var label = button.textContent;
      button.textContent = "Wird gesendet \u2026";

      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      }).then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (data) {
          return { ok: res.ok, data: data };
        });
      }).then(function (r) {
        if (r.ok) { succeed(); return; }
        var errs = (r.data && r.data.errors) || [];
        var handled = 0;
        errs.forEach(function (err) {
          var f = (err.field || "").toLowerCase();
          if (FIELDS.indexOf(f) !== -1 && setError(f, translate(err))) handled++;
        });
        if (!handled) {
          fail("Das Senden hat gerade nicht geklappt. Schreiben Sie mir gern direkt an hello@saakyan.ai.");
        }
      }).catch(function () {
        fail("Das Senden hat gerade nicht geklappt. Schreiben Sie mir gern direkt an hello@saakyan.ai.");
      }).then(function () {
        button.disabled = false;
        button.textContent = label;
      });
    });

    FIELDS.forEach(function (f) {
      var input = form.elements[f];
      if (!input) return;
      input.addEventListener("input", function () {
        var n = errorNode(f);
        if (n && !n.hidden) {
          n.hidden = true;
          n.textContent = "";
          input.removeAttribute("aria-invalid");
        }
      });
    });
  }

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () { initTabs(); initNav(); initForm(); });
})();
