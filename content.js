/* Loads editable content from /content/content.json (managed in /admin)
   and applies it to the homepage. If anything fails, the built-in HTML
   stays exactly as it is, so the site never breaks. */
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
    renderPricing(c.packages || []);
    renderAddons(c.addons || []);
    renderGallery(c.recentlyCharged || []);
    renderBeforeAfter(c.beforeAfter || []);
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

  function renderAbout(a) {
    var map = { aboutIntro: a.intro, aboutStandards: a.standards, aboutPhilosophy: a.philosophy, aboutPromise: a.promise };
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el && map[id] != null) el.innerHTML = paras(map[id]);
    });
  }

  function priceCell(v) {
    return '<div class="px-3 py-5 text-center display text-brand-blue text-lg">' + esc(v) + '</div>';
  }
  function renderPricing(pkgs) {
    if (!pkgs.length) return;
    var d = document.getElementById('pricingDesktop');
    if (d) {
      var h = '<div class="grid items-center bg-brand-ink text-white" style="grid-template-columns:1.9fr repeat(4,1fr)">' +
        '<div class="px-7 py-4 text-xs uppercase tracking-widest text-white/60">Package</div>' +
        '<div class="px-3 py-4 text-center text-xs uppercase tracking-widest text-white/85">Hatchback</div>' +
        '<div class="px-3 py-4 text-center text-xs uppercase tracking-widest text-white/85">Saloon</div>' +
        '<div class="px-3 py-4 text-center text-xs uppercase tracking-widest text-white/85">Estate / 4×4</div>' +
        '<div class="px-3 py-4 text-center text-xs uppercase tracking-widest text-white/85">Van</div>';
      pkgs.forEach(function (p) {
        h += '<div class="grid items-center border-t border-black/5 hover:bg-brand-mist transition-colors" style="grid-template-columns:1.9fr repeat(4,1fr)">' +
          '<div class="px-7 py-5"><h3 class="display text-xl uppercase">' + esc(p.name) + '</h3>' +
          '<p class="text-brand-ink/60 text-sm mt-1 leading-relaxed">' + esc(p.desc) + '</p></div>' +
          priceCell(p.hatchback) + priceCell(p.saloon) + priceCell(p.estate) + priceCell(p.van) + '</div>';
      });
      d.innerHTML = h;
    }
    var m = document.getElementById('pricingMobile');
    if (m) {
      var vt = ['Hatchback', 'Saloon', 'Estate / 4×4', 'Van'];
      m.innerHTML = pkgs.map(function (p) {
        var prices = [p.hatchback, p.saloon, p.estate, p.van];
        var cells = prices.map(function (pr, i) {
          return '<div class="flex items-center justify-between bg-brand-mist rounded-lg px-3 py-2">' +
            '<span class="text-[11px] uppercase tracking-wider text-brand-ink/55">' + vt[i] + '</span>' +
            '<span class="display text-brand-blue text-sm">' + esc(pr) + '</span></div>';
        }).join('');
        return '<div class="bg-white border border-black/5 rounded-2xl shadow-soft p-5">' +
          '<h3 class="display text-lg uppercase">' + esc(p.name) + '</h3>' +
          '<p class="text-brand-ink/60 text-sm mt-1 leading-relaxed">' + esc(p.desc) + '</p>' +
          '<div class="grid grid-cols-2 gap-2 mt-4">' + cells + '</div></div>';
      }).join('');
    }
  }

  function renderAddons(addons) {
    var el = document.getElementById('addonsList');
    if (!el || !addons.length) return;
    el.innerHTML = addons.map(function (a) {
      return '<div class="flex items-baseline justify-between gap-3 py-3 border-b border-black/5">' +
        '<span class="text-brand-ink/80 text-sm">' + esc(a.name) + '</span>' +
        '<span class="display text-brand-blue text-sm whitespace-nowrap">' + esc(a.price) + '</span></div>';
    }).join('');
  }

  function renderGallery(items) {
    var el = document.getElementById('galleryGrid');
    if (!el || !items.length) return;
    el.innerHTML = items.map(function (it) {
      return '<div class="gallery-img"><img src="' + esc(it.image) + '" alt="' + esc(it.alt || '') +
        '" class="w-full h-full object-cover aspect-[4/5] block" /></div>';
    }).join('');
  }

  function renderBeforeAfter(items) {
    var el = document.getElementById('baGrid');
    if (!el || !items.length) return;
    el.innerHTML = items.map(function (it) {
      return '<div><div class="rounded-2xl overflow-hidden shadow-soft relative bg-brand-ink/5">' +
        '<span class="absolute top-3 left-3 z-10 bg-brand-blue text-white display uppercase tracking-wider text-[11px] px-3 py-1.5 rounded-full">Before → After</span>' +
        '<img src="' + esc(it.image) + '" alt="' + esc(it.alt || it.caption || '') + '" class="w-full aspect-[9/8] object-cover" /></div>' +
        '<div class="mt-4 display uppercase text-lg">' + esc(it.caption || '') + '</div></div>';
    }).join('');
  }
})();
