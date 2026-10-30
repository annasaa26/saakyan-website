/* saakyan.ai, gemeinsames Skript aller Seiten (Stand 28.10.2026)
   Menü, Aufgabenzettel → Anfrageblatt, Formular (Formspark mit Botpoison), Einblendungen, Fotobewegung.
   Ohne JS bleibt alles sichtbar und das Formular sendet normal an Formspark. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Menü ---------- */
  var menuBtn = document.querySelector('.kopf__menu');
  var nav = document.getElementById('hauptnav');
  if (menuBtn && nav) {
    var label = menuBtn.querySelector('.kopf__menu-text');
    function setMenu(open) {
      menuBtn.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
      label.textContent = open ? label.dataset.close : label.dataset.open;
    }
    menuBtn.addEventListener('click', function () {
      setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        menuBtn.focus();
      }
    });
  }

  /* ---------- Aufgabenzettel: markierte Bereiche wandern ins Anfrageblatt ---------- */
  var boxes = Array.prototype.slice.call(document.querySelectorAll('.aufgabe__box'));
  var fahnen = document.querySelector('.coupon__fahnen');
  var hidden = document.querySelector('input[name="bereiche"]');
  function syncFahnen() {
    if (!fahnen) return;
    var chosen = boxes.filter(function (b) { return b.checked; }).map(function (b) { return b.value; });
    var existing = {};
    Array.prototype.forEach.call(fahnen.children, function (li) { existing[li.textContent] = li; });
    fahnen.textContent = '';
    chosen.forEach(function (name) {
      var li = existing[name] || document.createElement('li');
      li.textContent = name;
      fahnen.appendChild(li);
    });
    fahnen.hidden = chosen.length === 0;
    if (hidden) { hidden.value = chosen.join('; '); hidden.disabled = chosen.length === 0; }
  }
  boxes.forEach(function (b) { b.addEventListener('change', syncFahnen); });
  syncFahnen();

  /* ---------- Formular: Formspark mit Botpoison (wie bisher in app.js) ---------- */
  var form = document.getElementById('anfrage');
  if (form) {
    var ENDPOINT = 'https://submit-form.com/pztxt6yRU';
    var BOTPOISON_KEY = 'pk_8c98483c-97ed-4f1f-841e-8a2f4dc26afe';
    var botpoison = null;
    var msgs = {
      leer: 'Bitte fülle dieses Feld aus.',
      mail: 'Bitte gib eine gültige E-Mail-Adresse ein.',
      senden: 'Wird gesendet …',
      ok: 'Danke für deine Nachricht. Ich melde mich innerhalb von zwei Werktagen persönlich bei dir.',
      fehler: 'Die Nachricht konnte nicht gesendet werden. Bitte versuch es noch einmal oder schreib mir direkt an hello@saakyan.ai.'
    };
    /* Mit JS übernimmt das Skript die Prüfung; ohne JS prüft der Browser selbst (required, type=email). */
    form.noValidate = true;
    var fields = Array.prototype.slice.call(form.querySelectorAll('input[required], textarea[required]'));
    var status = form.querySelector('.coupon__status');
    var btn = form.querySelector('button[type="submit"]');
    var mailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    var sending = false;

    function errEl(f) { return document.getElementById(f.id + '-fehler'); }
    function check(f) {
      var v = f.value.trim();
      if (!v) return msgs.leer;
      if (f.type === 'email' && !mailRe.test(v)) return msgs.mail;
      return '';
    }
    function show(f, m) {
      var el = errEl(f);
      if (m) { el.textContent = m; el.hidden = false; f.setAttribute('aria-invalid', 'true'); }
      else { el.textContent = ''; el.hidden = true; f.removeAttribute('aria-invalid'); }
    }
    function setStatus(text, art) {
      status.textContent = text;
      status.classList.toggle('is-fehler', art === 'fehler');
      status.classList.toggle('is-ok', art === 'ok');
    }
    /* Prüfung erst beim Verlassen eines Felds; eine Fehlermeldung verschwindet beim ersten Tippen. */
    fields.forEach(function (f) {
      f.addEventListener('blur', function () { show(f, check(f)); });
      f.addEventListener('input', function () {
        if (f.getAttribute('aria-invalid') === 'true') show(f, '');
      });
    });

    function challenge() {
      var B = window.Botpoison;
      if (!B) return null;
      if (typeof B.challenge === 'function') return B.challenge({ publicKey: BOTPOISON_KEY });
      if (typeof B === 'function') {
        if (!botpoison) botpoison = new B({ publicKey: BOTPOISON_KEY });
        return botpoison.challenge();
      }
      return null;
    }

    function fertig() {
      sending = false;
      btn.removeAttribute('aria-busy');
    }
    function fehlgeschlagen() {
      fertig();
      setStatus(msgs.fehler, 'fehler');
    }
    function geschafft() {
      fertig();
      form.reset();
      boxes.forEach(function (b) { b.checked = false; });
      syncFahnen();
      setStatus(msgs.ok, 'ok');
    }
    function senden(data) {
      fetch(ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
        .then(function (res) { if (res.ok) geschafft(); else fehlgeschlagen(); })
        .catch(fehlgeschlagen);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (sending) return;
      var first = null;
      fields.forEach(function (f) {
        var m = check(f);
        show(f, m);
        if (m && !first) first = f;
      });
      if (first) { setStatus('', ''); first.focus(); return; }
      sending = true;
      btn.setAttribute('aria-busy', 'true');
      setStatus(msgs.senden, '');
      var data = new FormData(form);
      var p = null;
      try { p = challenge(); } catch (err) { p = null; }
      if (p && typeof p.then === 'function') {
        p.then(function (solution) {
          if (solution && solution.solution) data.append('_botpoison', solution.solution);
          senden(data);
        }).catch(function () { senden(data); });
      } else {
        senden(data);
      }
    });
  }

  /* ---------- Eingänge: Blätter, Reiter, Zeilen ---------- */
  if (!reduce && 'IntersectionObserver' in window) {
    document.querySelectorAll('[data-reveal]').forEach(function (block) {
      block.querySelectorAll('[data-reveal-item]').forEach(function (it, n) { it.style.setProperty('--n', n); });
    });
    document.querySelectorAll('.fragen').forEach(function (g) {
      g.querySelectorAll('[data-reveal-item]').forEach(function (it, n) { it.style.setProperty('--n', n % 4); });
    });
    /* Zuverlässig in jeder Breite: Schwelle 0 (auch sehr hohe Blöcke lösen aus),
       plus Sicherheitsnetz beim Scrollen und Größenwechsel für alles, was schon
       im oder oberhalb des Fensters liegt (z. B. nach Sprung über das Menü). */
    var pending = Array.prototype.slice.call(document.querySelectorAll('[data-reveal], .fragen [data-reveal-item], .blatt'));
    var isBlatt = function (el) { return el.classList.contains('blatt'); };
    /* Der Reiter ragt über die Oberkante seines Blatts: Blätter lösen aus, sobald der Reiter
       ins Fenster kommt, nicht erst die Blattkante (sonst bleibt er im ersten Bildschirm zu tief). */
    var reiterHoehe = function (el) { var r = el.querySelector('.reiter'); return r ? r.offsetHeight : 0; };
    function reveal(el) {
      el.classList.add(isBlatt(el) ? 'is-da' : 'is-in');
      io.unobserve(el); ioBlatt.unobserve(el);
      pending.splice(pending.indexOf(el), 1);
    }
    var onEntries = function (entries) { entries.forEach(function (e) { if (e.isIntersecting) reveal(e.target); }); };
    var io = new IntersectionObserver(onEntries, { rootMargin: '0px 0px -40px 0px', threshold: 0 });
    var ioBlatt = new IntersectionObserver(onEntries, { rootMargin: '0px 0px 80px 0px', threshold: 0 });
    pending.forEach(function (el) { (isBlatt(el) ? ioBlatt : io).observe(el); });
    var sweepQueued = false;
    function sweep() {
      sweepQueued = false;
      var vh = window.innerHeight;
      pending.slice().forEach(function (el) {
        if (el.getBoundingClientRect().top - (isBlatt(el) ? reiterHoehe(el) : 0) < vh) reveal(el);
      });
      if (!pending.length) {
        window.removeEventListener('scroll', queueSweep);
        window.removeEventListener('resize', queueSweep);
      }
    }
    function queueSweep() { if (!sweepQueued) { sweepQueued = true; window.requestAnimationFrame(sweep); } }
    window.addEventListener('scroll', queueSweep, { passive: true });
    window.addEventListener('resize', queueSweep);
    window.addEventListener('load', queueSweep);
    window.addEventListener('beforeprint', function () { pending.slice().forEach(reveal); });
    queueSweep();
  } else {
    document.querySelectorAll('[data-reveal], [data-reveal-item]').forEach(function (el) { el.classList.add('is-in'); });
    document.querySelectorAll('.blatt').forEach(function (el) { el.classList.add('is-da'); });
  }

})();
