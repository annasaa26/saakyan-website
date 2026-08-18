(function () {
  "use strict";

  var SCENARIOS = [
    {
      label: "Wissen sichern und zug\u00e4nglich machen",
      title: "Wissen bleibt im Unternehmen und wird f\u00fcr das ganze Team zug\u00e4nglich.",
      steps: [
        ["01 Wissen sichern", "Fachwissen, Dokumente und Abl\u00e4ufe werden zusammengef\u00fchrt, wo sie heute noch an einzelnen Personen h\u00e4ngen oder nur schwer auffindbar sind."],
        ["02 Struktur schaffen", "Das Wissen wird gepr\u00fcft, eingeordnet und so aufbereitet, dass KI Ihre Informationen, Begriffe, Standards und Sprache verl\u00e4sslich ber\u00fccksichtigen kann."],
        ["03 Zugriff erm\u00f6glichen", "\u00dcber eine interne Suche oder einen KI-Assistenten findet Ihr Team die richtigen Informationen und Antworten, genau dann, wenn sie gebraucht werden."],
        ["04 Im Alltag nutzen", "Bei Fragen, \u00dcbergaben, Kundenanfragen und wiederkehrenden Aufgaben arbeitet Ihr Team mit derselben Wissensbasis."],
        ["05 Weiterentwickeln", "Neue Erfahrungen, \u00c4nderungen und R\u00fcckfragen flie\u00dfen zur\u00fcck. Dadurch wird das System mit jedem Monat n\u00fctzlicher."]
      ]
    },
    {
      label: "Aus Wissen werden KI-Anwendungen",
      title: "Die Wissensbasis wird zum Ausgangspunkt f\u00fcr weitere KI-Anwendungen.",
      steps: [
        ["01 Wissensbasis", "Informationen, Begriffe, Standards und Erfahrungen stehen bereits strukturiert und nutzbar zur Verf\u00fcgung."],
        ["02 Anwendungsfall", "Wir w\u00e4hlen eine Aufgabe, die sich h\u00e4ufig wiederholt, Zeit kostet oder bei der Wissen bisher immer wieder neu zusammengetragen wird."],
        ["03 Umsetzung", "Ein Assistent, Workflow oder eine Automatisierung \u00fcbernimmt die vorbereitenden und wiederkehrenden Teile der Aufgabe."],
        ["04 Entlastung", "Das Team startet mit fundierten Ergebnissen statt mit Suche und Vorarbeit. So bleibt Zeit f\u00fcr Pr\u00fcfung, Entscheidung und die Aufgaben, bei denen Erfahrung z\u00e4hlt."],
        ["05 Ausbau", "Auf dieser Wissensbasis k\u00f6nnen nach und nach weitere Assistenten, Workflows und Automatisierungen entstehen. Sie nutzen dasselbe Unternehmenswissen und liefern dadurch konsistente Ergebnisse."]
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

  var REVEAL_GROUPS = [
    ".situations .eyebrow, .situations__grid > p, .situations__note",
    ".benefits .eyebrow, .benefits__intro, .feature",
    ".cases__head, .case",
    ".approach .eyebrow, .approach h2, .step",
    ".sk-reveal"
  ];

  function initReveal() {
    var targets = [];
    REVEAL_GROUPS.forEach(function (sel) {
      var nodes = document.querySelectorAll(sel);
      Array.prototype.forEach.call(nodes, function (el, i) {
        if (targets.indexOf(el) !== -1) return;
        el.classList.add("sk-reveal");
        el.style.animationDelay = Math.min(i * 80, 240) + "ms";
        targets.push(el);
      });
    });
    if (!targets.length) return;

    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!("IntersectionObserver" in window) || reduce) {
      targets.forEach(function (el) { el.classList.add("sk-reveal--in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("sk-reveal--in");
        io.unobserve(entry.target);
      });
    }, { threshold: 0, rootMargin: "0px 0px -12% 0px" });
    targets.forEach(function (el) { io.observe(el); });
  }

  function initForm() {
    var form = document.getElementById("contact-form");
    if (!form) return;
    var status = document.getElementById("cf-status");
    var button = document.getElementById("cf-submit");
    var FIELDS = ["name", "email", "message"];

    var LABELS = { name: "Namen", email: "E-Mail-Adresse", message: "Nachricht" };

    var BOTPOISON_KEY = "pk_8c98483c-97ed-4f1f-841e-8a2f4dc26afe";
    var botpoison = null;

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

    button.addEventListener("click", function (ev) {
      if (ev) { ev.preventDefault(); ev.stopPropagation(); }
      clearErrors();

      var problems = validate();
      if (problems.length) {
        problems.forEach(function (p) { setError(p[0], p[1]); });
        var first = form.elements[problems[0][0]];
        if (first && first.focus) first.focus();
        return;
      }

      button.disabled = true;
      button.textContent = "Wird gesendet \u2026";

      var data = new FormData(form);

      function failed() {
        button.disabled = false;
        button.textContent = "Nachricht senden";
        status.textContent = "Das Senden hat nicht geklappt. Bitte versuchen Sie es erneut.";
        status.className = "form__status form__status--error";
        status.hidden = false;
      }

      function sendData() {
        fetch("https://submit-form.com/pztxt6yRU", {
          method: "POST",
          body: data,
          headers: { Accept: "application/json" }
        }).then(function (res) {
          if (!res.ok) { failed(); return; }
          form.hidden = true;
          status.innerHTML = '<svg width="32" height="32" viewBox="0 0 30 30" fill="none" aria-hidden="true"><path d="M4 14.5 25.5 5 17 26 13.5 17 4 14.5Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M13.5 17 25.5 5" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg><p>Ihre Nachricht ist angekommen. Ich freue mich auf unser Gespr\u00e4ch.</p>';
          status.className = "form__status form__status--success";
          status.hidden = false;
          status.setAttribute("tabindex", "-1");
        }).catch(failed);
      }

      function challenge() {
        var B = window.Botpoison;
        if (!B) return null;
        if (typeof B.challenge === "function") {
          return B.challenge({ publicKey: BOTPOISON_KEY });
        }
        if (typeof B === "function") {
          if (!botpoison) botpoison = new B({ publicKey: BOTPOISON_KEY });
          return botpoison.challenge();
        }
        return null;
      }

      var p = null;
      try { p = challenge(); } catch (err) { p = null; }

      if (p && typeof p.then === "function") {
        p.then(function (solution) {
          if (solution && solution.solution) data.append("_botpoison", solution.solution);
          sendData();
        }).catch(sendData);
      } else {
        sendData();
      }
    });

    ["name", "email"].forEach(function (f) {
      var input = form.elements[f];
      if (!input) return;
      input.addEventListener("keydown", function (e) {
        if (e.key !== "Enter") return;
        e.preventDefault();
        var allFilled = FIELDS.every(function (field) {
          return (form.elements[field].value || "").trim().length > 0;
        });
        if (allFilled) {
          button.click();
          return;
        }
        var next = null;
        FIELDS.forEach(function (field) {
          if (next) return;
          if (!(form.elements[field].value || "").trim().length) next = field;
        });
        if (next && form.elements[next].focus) form.elements[next].focus();
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

  ready(function () { initTabs(); initNav(); initForm(); initReveal(); });
})();
