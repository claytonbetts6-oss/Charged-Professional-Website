/* Loads editable content from /content/content.json (managed in /admin) and
   applies it to the homepage by UPDATING the existing, already-styled elements
   in place (text / image / links) — never rebuilding them. This keeps all the
   original styling intact. If anything fails, the built-in HTML stays as-is. */
(function () {
  fetch('/content/content.json', { cache: 'no-store' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (c) { if (c) apply(c); })
    .catch(function () {});

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>]/g, function (ch) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[ch];
    });
  }
  function setText(key, val) {
    if (val == null) return;
    document.querySelectorAll('[data-cms="' + key + '"]').forEach(function (el) { el.textContent = val; });
  }
  function paras(text) {
    return String(text || '').split(/\n\s*\n/).map(function (p) { return p.trim(); })
      .filter(Boolean)
      .map(function (p) { return '<p>' + esc(p).replace(/\n/g, '<br>') + '</p>'; }).join('');
  }

  function apply(c) {
    var s = c.site || {};
    setText('heroEyebrow', s.heroEyebrow);
    setText('heroLine1', s.heroLine1);
    setText('heroLine2', s.heroLine2);
    setText('heroParagraph', s.heroParagraph);
    setText('statVehicles', s.statVehicles);
    setText('statSatisfaction', s.statSatisfaction);
    setText('rating', s.rating);
    setText('phoneDisplay', s.phoneDisplay);
    setText('email', s.email);
    rewriteContact(s);
    renderAbout(c.about || {});
    updatePricing(c.packages || []);
    updateAddons(c.addons || []);
    updateImages('galleryGrid', c.recentlyCharged || [], false);
    updateImages('baGrid', c.beforeAfter || [], true);
  }

  function rewriteContact(s) {
    var digits = s.phoneDigits ? String(s.phoneDigits).replace(/\D/g, '') : '';
    if (digits) {
      document.querySelectorAll('a[href^="tel:"]').forEach(function (a) { a.href = 'tel:+' + digits; });
      document.querySelectorAll('a[href*="wa.me"]').forEach(function (a) {
        var text = '';
        try { text = new URL(a.href).searchParams.get('text') || ''; } catch (e) {}
        a.href = 'https://wa.me/' + digits + (text ? ('?text=' + encodeURIComponent(text)) : '');
      });
    }
    if (s.email) {
      document.querySelectorAll('a[href^="mailto:"]').forEach(function (a) { a.href = 'mailto:' + s.email; });
    }
  }

  // About paragraphs are plain <p> (no Tailwind utilities) so this is safe.
  function renderAbout(a) {
    var map = { aboutIntro: a.intro, aboutStandards: a.standards, aboutPhilosophy: a.philosophy, aboutPromise: a.promise };
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el && map[id] != null) el.innerHTML = paras(map[id]);
    });
  }

  function show(el, visible) { if (el) el.style.display = visible ? '' : 'none'; }

  function updatePricing(pkgs) {
    // Desktop table: children = [header, row0, row1, ...]
    var d = document.getElementById('pricingDesktop');
    if (d) {
      var rows = d.children;
      for (var i = 1; i < rows.length; i++) {
        var p = pkgs[i - 1];
        if (!p) { show(rows[i], false); continue; }
        show(rows[i], true);
        var cells = rows[i].children; // [name+desc block, h, s, e, v]
        var h3 = cells[0] && cells[0].querySelector('h3');
        var desc = cells[0] && cells[0].querySelector('p');
        if (h3) h3.textContent = p.name;
        if (desc) desc.textContent = p.desc;
        var prices = [p.hatchback, p.saloon, p.estate, p.van];
        for (var k = 0; k < 4; k++) { if (cells[k + 1]) cells[k + 1].textContent = prices[k]; }
      }
    }
    // Mobile cards
    var m = document.getElementById('pricingMobile');
    if (m) {
      var cards = m.children;
      for (var j = 0; j < cards.length; j++) {
        var pk = pkgs[j];
        if (!pk) { show(cards[j], false); continue; }
        show(cards[j], true);
        var ch3 = cards[j].querySelector('h3');
        var cp = cards[j].querySelector('p');
        if (ch3) ch3.textContent = pk.name;
        if (cp) cp.textContent = pk.desc;
        var spans = cards[j].querySelectorAll('span.text-brand-blue');
        var mp = [pk.hatchback, pk.saloon, pk.estate, pk.van];
        for (var q = 0; q < spans.length && q < 4; q++) { spans[q].textContent = mp[q]; }
      }
    }
  }

  function updateAddons(addons) {
    var el = document.getElementById('addonsList');
    if (!el) return;
    var rows = el.children;
    for (var i = 0; i < rows.length; i++) {
      var a = addons[i];
      if (!a) { show(rows[i], false); continue; }
      show(rows[i], true);
      var spans = rows[i].children; // [name span, price span]
      if (spans[0]) spans[0].textContent = a.name;
      if (spans[1]) spans[1].textContent = a.price;
    }
  }

  function updateImages(containerId, items, withCaption) {
    var el = document.getElementById(containerId);
    if (!el) return;
    var nodes = el.children;
    for (var i = 0; i < nodes.length; i++) {
      var it = items[i];
      if (!it) { show(nodes[i], false); continue; }
      show(nodes[i], true);
      var img = nodes[i].querySelector('img');
      if (img) {
        if (it.image) img.src = it.image;
        img.alt = it.alt || it.caption || '';
      }
      if (withCaption) {
        var cap = nodes[i].querySelector('.mt-4');
        if (cap && it.caption != null) cap.textContent = it.caption;
      }
    }
  }
})();
