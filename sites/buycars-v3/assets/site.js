(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
  const reduce = () => mqReduce.matches;
  const PHONE = '+7 904 444-45-35';
  const PHONE_HREF = 'tel:+79044444535';
  const TG = 'https://t.me/+79044444535';

  // ---------- header turns solid once the page moves ----------
  const hdr = $('[data-hdr]');
  if (hdr) {
    let ticking = false;
    const set = () => { hdr.classList.toggle('is-solid', scrollY > 10); ticking = false; };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(set); } }, { passive: true });
    set();
  }

  // ---------- mobile menu ----------
  const menu = $('[data-menu]');
  if (menu && typeof menu.showModal === 'function') {
    $('[data-menu-open]')?.addEventListener('click', () => menu.showModal());
    $('[data-menu-close]', menu)?.addEventListener('click', () => menu.close());
    $$('a', menu).forEach((a) => a.addEventListener('click', () => menu.close()));
    matchMedia('(min-width: 900px)').addEventListener('change', (e) => { if (e.matches && menu.open) menu.close(); });
  }

  // ---------- one reveal ----------
  const rv = $$('[data-rv]');
  if (!('IntersectionObserver' in window) || reduce()) rv.forEach((el) => el.classList.add('is-in'));
  else {
    // section headings start fully clipped (clip-path), which Chrome treats as never intersecting,
    // so for them the observer watches the parent block and reveals the heading through this map
    const proxy = new Map();
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      if (e.target.hasAttribute('data-rv')) e.target.classList.add('is-in');
      (proxy.get(e.target) || []).forEach((el) => el.classList.add('is-in'));
      io.unobserve(e.target);
    }), { rootMargin: '0px 0px -6% 0px', threshold: 0 });
    rv.forEach((el) => {
      if (el.classList.contains('h-sec') && el.parentElement) {
        const host = el.parentElement;
        proxy.set(host, [...(proxy.get(host) || []), el]);
        io.observe(host);
      } else io.observe(el);
    });
  }

  // ---------- odometer ----------
  // str: digits to show; its length decides how many leading slots fold away
  const odoSet = (el, str, instant = false) => {
    const slots = el._s || (el._s = $$('.odo-d', el));
    const gaps = el._g || (el._g = $$('.odo-g', el));
    str = String(str);
    const n = slots.length;
    const lead = n - str.length;
    const d = str.padStart(n, '0');
    if (instant) el.classList.add('no-tr');
    slots.forEach((sl, i) => {
      sl.style.setProperty('--d', d[i]);
      sl.classList.toggle('is-lead', i < lead);
      sl.firstElementChild.style.transitionDelay = instant ? '' : `${Math.max(0, i - lead) * 55}ms`;
    });
    gaps.forEach((g) => g.classList.toggle('is-lead', Number(g.dataset.after) < lead));
    if (instant) { void el.offsetWidth; el.classList.remove('no-tr'); }
    el.dataset.odo = str;
  };
  $$('.odo').forEach((o) => { o.dataset.target = o.dataset.odo; });

  // ---------- home stage carousel ----------
  const stage = $('[data-stage]');
  if (stage) {
    const slides = $$('.slide', stage);
    const segs = $$('.seg', stage);
    const box = $('[data-slides]', stage);
    const countEl = $('[data-count]', stage);
    const nextEl = $('[data-nextname]', stage);
    const N = slides.length;
    let cur = 0;
    let stopped = reduce();
    const holds = new Set();
    let leaveTimer;

    const sync = () => {
      stage.classList.toggle('is-auto', !stopped);
      stage.classList.toggle('is-stopped', stopped);
      stage.classList.toggle('is-held', holds.size > 0);
      box.setAttribute('aria-live', stopped || holds.has('focus') ? 'polite' : 'off');
    };
    const markNear = (i) => slides.forEach((s, k) => s.classList.toggle('is-near', k === i || k === (i + 1) % N || k === (i - 1 + N) % N));
    const markSegs = (i) => segs.forEach((s, k) => {
      s.classList.toggle('is-done', k < i);
      s.classList.remove('is-active');
      s.removeAttribute('aria-current');
      if (k === i) { void s.offsetWidth; s.classList.add('is-active'); s.setAttribute('aria-current', 'true'); }
    });

    const go = (i, dir) => {
      i = (i + N) % N;
      if (i === cur) return;
      dir = dir || (i > cur ? 1 : -1);
      const from = slides[cur];
      const to = slides[i];
      stage.style.setProperty('--dir', dir);
      slides.forEach((s) => s.classList.remove('is-leaving'));
      // incoming numbers start where the outgoing ones were, then roll
      const fromOdos = $$('.odo', from);
      $$('.odo', to).forEach((o, k) => odoSet(o, fromOdos[k] ? fromOdos[k].dataset.odo : o.dataset.target, true));
      markNear(i);
      from.classList.remove('is-active', 'is-first');
      from.classList.add('is-leaving');
      from.inert = true;
      void to.offsetWidth;
      to.classList.add('is-active');
      to.inert = false;
      requestAnimationFrame(() => $$('.odo', to).forEach((o) => odoSet(o, o.dataset.target)));
      clearTimeout(leaveTimer);
      leaveTimer = setTimeout(() => from.classList.remove('is-leaving'), 1000);
      cur = i;
      markSegs(i);
      countEl.textContent = String(i + 1);
      if (nextEl) nextEl.textContent = `Далее: ${slides[(i + 1) % N].dataset.title}`;
    };

    segs.forEach((s) => {
      s.addEventListener('click', () => go(Number(s.dataset.go)));
      $('.seg-fill', s).addEventListener('animationend', (e) => {
        if (e.animationName === 'seg-fill' && !stopped && s.classList.contains('is-active')) go(cur + 1, 1);
      });
    });

    // hold only while the stage is off screen or the tab is hidden; no hold on hover or focus
    addEventListener('load', () => slides.forEach((sl) => { const im = $('img', sl); if (im) { im.loading = 'eager'; im.decode?.().catch(() => {}); } }), { once: true });
    document.addEventListener('visibilitychange', () => { document.hidden ? holds.add('hidden') : holds.delete('hidden'); sync(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => { e.isIntersecting ? holds.delete('off') : holds.add('off'); sync(); }, { threshold: 0 }).observe(stage);
    }
    stage.addEventListener('keydown', (e) => {
      if (e.target.closest('.stage-ctrl') && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
        go(cur + (e.key === 'ArrowRight' ? 1 : -1), e.key === 'ArrowRight' ? 1 : -1);
      }
    });

    // swipe on touch screens
    let sx = 0, sy = 0, tracking = false, swiped = 0;
    box.addEventListener('pointerdown', (e) => { if (e.pointerType === 'mouse') return; sx = e.clientX; sy = e.clientY; tracking = true; }, { passive: true });
    box.addEventListener('pointerup', (e) => {
      if (!tracking) return;
      tracking = false;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3) { swiped = Date.now(); go(cur + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1); }
    });
    box.addEventListener('pointercancel', () => { tracking = false; });
    box.addEventListener('click', (e) => { if (Date.now() - swiped < 400) e.preventDefault(); }, true);

    // first paint: the lights come on, numbers roll up from zero
    const first = slides[0];
    first.classList.add('is-first');
    const light = () => {
      if (stage.classList.contains('is-lit')) return;
      if (!reduce()) $$('.odo', first).forEach((o) => odoSet(o, '0'.repeat(o.dataset.target.length), true));
      requestAnimationFrame(() => requestAnimationFrame(() => {
        stage.classList.add('is-lit');
        setTimeout(() => $$('.odo', first).forEach((o) => odoSet(o, o.dataset.target)), reduce() ? 0 : 350);
      }));
    };
    const img = $('img', first);
    // the hero sits above now, so the entrance waits until the stage scrolls into view
    const ready = img && !img.complete && img.decode ? img.decode().catch(() => {}) : Promise.resolve();
    if ('IntersectionObserver' in window) {
      const lio = new IntersectionObserver(([e]) => { if (e.isIntersecting) { lio.disconnect(); ready.then(light); } }, { threshold: 0.25 });
      lio.observe(stage);
    } else ready.then(light);
    sync();
  }

  // ---------- interior tiles: each flips through its own shots, staggered; holds only off screen ----------
  $$('[data-flip]').forEach((box, t) => {
    const imgs = $$('img', box);
    if (imgs.length < 2 || reduce()) return;
    let k = 0, onScreen = false;
    imgs.forEach((im) => { im.loading = 'eager'; });
    if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; }, { threshold: 0.2 }).observe(box);
    setTimeout(() => setInterval(() => {
      if (!onScreen || document.hidden) return;
      const prev = imgs[k];
      k = (k + 1) % imgs.length;
      const next = imgs[k];
      // the old shot stays underneath while the new one wipes in over it
      prev.classList.remove('is-on', 'is-new');
      prev.classList.add('was-on');
      next.classList.remove('was-on', 'is-new');
      void next.offsetWidth;
      next.classList.add('is-on', 'is-new');
      setTimeout(() => prev.classList.remove('was-on'), 1400);
    }, 3800), t * 900);
  });

  // ---------- home: the phone dock takes over once the hero's own Telegram / phone buttons scroll away ----------
  const dock = $('.dock');
  const heroActs = $('.p-home .hero .actions');
  if (dock && heroActs) {
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => {
        // shown only when the buttons are above the viewport, not when the page is scrolled back to the top
        dock.classList.toggle('is-on', !e.isIntersecting && e.boundingClientRect.top < 0);
      }).observe(heroActs);
    } else dock.classList.add('is-on');
  }

  // ---------- stock tiers: each column climbs one car at a time, endless; holds only off screen ----------
  $$('[data-ticker]').forEach((win, t) => {
    const list = $('.tier-cars', win);
    const items = $$(':scope > li', list);
    const n = items.length;
    if (n <= 2 || reduce()) return;

    // touch screens: each class becomes a sideways strip the finger can swipe (a vertical scroller fought the page scroll).
    // No clones here; at the end it rewinds to the first car.
    // A touch holds this strip only, and it resumes a few seconds after the finger lifts.
    if (matchMedia('(pointer: coarse)').matches) {
      win.classList.add('is-scroll');
      let onScreen = false, held = false, resume;
      win.addEventListener('touchstart', () => { held = true; clearTimeout(resume); }, { passive: true });
      const release = () => { clearTimeout(resume); resume = setTimeout(() => { held = false; }, 3500); };
      win.addEventListener('touchend', release, { passive: true });
      win.addEventListener('touchcancel', release, { passive: true });
      if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; }, { threshold: 0.2 }).observe(win);
      setTimeout(() => setInterval(() => {
        if (!onScreen || held || document.hidden) return;
        const x = win.scrollLeft;
        const start = items[0].offsetLeft;
        const next = items.find((li) => li.offsetLeft - start > x + 4);
        const atEnd = x + win.clientWidth >= win.scrollWidth - 4;
        win.scrollTo({ left: atEnd || !next ? 0 : next.offsetLeft - start, behavior: 'smooth' });
      }, 3200), t * 700);
      return;
    }

    items.forEach((li) => {
      const c = li.cloneNode(true);
      // clones must stay clickable (the window shows one of them next to the last original car);
      // only hidden from screen readers and skipped by Tab
      c.setAttribute('aria-hidden', 'true');
      $$('a', c).forEach((a) => { a.tabIndex = -1; });
      $$('img', c).forEach((im) => { im.loading = 'eager'; });
      list.append(c);
    });
    win.classList.add('is-ticking');
    let k = 0, onScreen = false, held = false;
    // only the column under the pointer (or holding keyboard focus) stops; the others keep climbing
    win.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') held = true; });
    win.addEventListener('pointerleave', () => { held = false; });
    win.addEventListener('focusin', () => { held = true; });
    win.addEventListener('focusout', () => { held = false; });
    const all = () => $$(':scope > li', list);
    const move = (i, animate) => {
      list.style.transition = animate ? '' : 'none';
      list.style.transform = `translateY(${-all()[i].offsetTop}px)`;
    };
    // tallest pair of neighbours, so a two-line name never gets cut
    const fit = () => {
      const a = all();
      let h = 0;
      for (let i = 0; i < n; i++) h = Math.max(h, a[i + 2].offsetTop - a[i].offsetTop);
      win.style.height = `${h}px`;
      move(k, false);
    };
    fit();
    addEventListener('load', fit, { once: true });
    addEventListener('resize', fit);
    if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; }, { threshold: 0.2 }).observe(win);
    setTimeout(() => setInterval(() => {
      if (!onScreen || held || document.hidden) return;
      k += 1;
      move(k, true);
      // after the last original car the clones line up exactly like the start: jump back unseen
      if (k === n) setTimeout(() => { k = 0; move(0, false); }, 950);
    }, 3200), t * 700);
  });

  // ---------- price on the car page rolls up once, like the hero ----------
  $$('.odo[data-roll]').forEach((o) => {
    // only when someone is looking; timers (not frames) so the real price always comes back
    if (reduce() || document.visibilityState !== 'visible') return;
    odoSet(o, '0'.repeat(o.dataset.target.length), true);
    setTimeout(() => odoSet(o, o.dataset.target), 320);
  });

  // ---------- price list: a pool of light follows the pointer along the row ----------
  $$('[data-spot]').forEach((list) => {
    list.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const a = e.target.closest('.row-a');
      if (!a) return;
      const r = a.getBoundingClientRect();
      a.style.setProperty('--mx', `${Math.round(e.clientX - r.left)}px`);
    }, { passive: true });
  });

  // ---------- service tabs with a gliding marker ----------
  $$('[data-tabs]').forEach((list) => {
    const tabs = $$('[role="tab"]', list);
    const ind = $('.svc-ind', list);
    const form = list.closest('section').querySelector('form');
    const typeInput = form && $('[data-type]', form);
    const place = (t) => { if (!ind) return; ind.style.setProperty('--y', `${t.offsetTop}px`); ind.style.setProperty('--h', `${t.offsetHeight}px`); };
    const select = (t, focus) => {
      tabs.forEach((x) => {
        const on = x === t;
        x.setAttribute('aria-selected', String(on));
        x.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(x.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
        if (on && panel && typeInput) typeInput.value = panel.dataset.typeValue;
      });
      place(t);
      if (focus) t.focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', (e) => {
        const k = e.key;
        const d = k === 'ArrowDown' || k === 'ArrowRight' ? 1 : k === 'ArrowUp' || k === 'ArrowLeft' ? -1 : 0;
        if (d) { e.preventDefault(); select(tabs[(i + d + tabs.length) % tabs.length], true); }
        if (k === 'Home') { e.preventDefault(); select(tabs[0], true); }
        if (k === 'End') { e.preventDefault(); select(tabs[tabs.length - 1], true); }
      });
    });
    const want = new URLSearchParams(location.search).get('service');
    const pre = want && tabs.find((t) => t.id === `tab-${want}`);
    select(pre || tabs.find((t) => t.getAttribute('aria-selected') === 'true') || tabs[0]);
    if ('ResizeObserver' in window) new ResizeObserver(() => place(tabs.find((t) => t.getAttribute('aria-selected') === 'true'))).observe(list);
  });

  // ---------- forms: checked here, sent nowhere (demo) ----------
  const phoneOk = (v) => v.replace(/\D/g, '').length >= 10;
  const hintOf = (el) => document.getElementById(el.getAttribute('aria-describedby'));
  $$('[data-form]').forEach((form) => {
    const status = $('.form-status', form);
    const phone = $('input[name="phone"]', form);
    const ok = $('input[name="consent"]', form);
    const mark = (el, msg) => {
      const h = hintOf(el);
      if (msg) { el.setAttribute('aria-invalid', 'true'); if (h) h.textContent = msg; }
      else { el.removeAttribute('aria-invalid'); if (h) h.textContent = ''; }
    };
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const bad = [];
      if (!phoneOk(phone.value)) { mark(phone, 'Укажите телефон полностью, чтобы менеджер мог перезвонить.'); bad.push(phone); } else mark(phone);
      if (ok && !ok.checked) { mark(ok, 'Без согласия мы не можем принять заявку.'); bad.push(ok); } else if (ok) mark(ok);
      if (bad.length) { bad[0].focus(); return; }
      status.innerHTML = `<p><b>Это демонстрационная версия сайта.</b> Заявки отсюда пока никуда не отправляются, поэтому ваши данные никто не получил.</p>
<p>Чтобы договориться, позвоните или напишите менеджеру в Telegram.</p>
<div class="actions"><a class="btn btn-gold btn-sm" href="${TG}">Написать в Telegram</a><a class="btn btn-line btn-sm" href="${PHONE_HREF}">${PHONE}</a></div>`;
      status.focus({ preventScroll: true });
      status.scrollIntoView({ block: 'nearest', behavior: reduce() ? 'auto' : 'smooth' });
    });
    phone.addEventListener('blur', () => { if (phone.value && !phoneOk(phone.value)) mark(phone, 'Похоже, в номере не хватает цифр.'); else if (phone.value) mark(phone); });
    ok?.addEventListener('change', () => { if (ok.checked) mark(ok); });
  });

  // ---------- map loads only on request ----------
  $$('[data-map-load]').forEach((btn) => btn.addEventListener('click', () => {
    const box = btn.closest('[data-map]');
    const f = document.createElement('iframe');
    f.src = box.dataset.map;
    f.title = 'Карта: площадка БАЙКАРС на Новочеркасском шоссе';
    f.allowFullscreen = true;
    box.append(f);
    $('.map-load', box)?.remove();
    f.focus();
  }));

  // ---------- car gallery: native swipe, arrows, thumbs ----------
  $$('[data-gal]').forEach((g) => {
    const track = $('[data-track]', g);
    const items = $$('.gal-item', g);
    const thumbs = $$('.thumb', g);
    const strip = $('.thumbs', g);
    const cnt = $('[data-gcount]', g);
    const prev = $('[data-gprev]', g);
    const next = $('[data-gnext]', g);
    let cur = 0;
    const go = (i) => {
      i = Math.max(0, Math.min(items.length - 1, i));
      track.scrollTo({ left: items[i].offsetLeft - track.offsetLeft, behavior: reduce() ? 'auto' : 'smooth' });
    };
    const update = () => {
      const i = Math.round(track.scrollLeft / track.clientWidth);
      if (i === cur && cnt.textContent === String(i + 1)) return;
      cur = i;
      cnt.textContent = String(i + 1);
      prev.disabled = i === 0;
      next.disabled = i === items.length - 1;
      thumbs.forEach((t, k) => (k === i ? t.setAttribute('aria-current', 'true') : t.removeAttribute('aria-current')));
      const t = thumbs[i];
      if (t && strip) {
        const li = t.parentElement;
        const want = li.offsetLeft - strip.clientWidth / 2 + li.clientWidth / 2;
        strip.scrollTo({ left: want, behavior: reduce() ? 'auto' : 'smooth' });
      }
    };
    let raf = 0;
    track.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); }, { passive: true });
    prev.addEventListener('click', () => go(cur - 1));
    next.addEventListener('click', () => go(cur + 1));
    thumbs.forEach((t) => t.addEventListener('click', () => go(Number(t.dataset.gi))));
    update();
    prev.disabled = true;
  });

  // ---------- catalogue filter ----------
  const fForm = $('[data-filters]');
  if (fForm) {
    const grid = $('[data-grid]');
    const cards = $$('.card', grid);
    const cnt = $('[data-count]', fForm);
    const empty = $('[data-empty]');
    const resetBtn = $('[data-reset]', fForm);
    const total = cards.length;
    const defaults = { band: 'all', fuel: 'all', make: 'all', sort: 'price-desc' };
    const bandOf = (p) => (p < 2e6 ? 'lt2' : p < 5e6 ? '2to5' : 'gt5');
    const sorters = {
      'price-desc': (a, b) => b.dataset.price - a.dataset.price,
      'price-asc': (a, b) => a.dataset.price - b.dataset.price,
      'year-desc': (a, b) => b.dataset.year - a.dataset.year || b.dataset.price - a.dataset.price,
      'km-asc': (a, b) => a.dataset.km - b.dataset.km,
    };
    // price: preset chips, or a custom range from the two fields / two-thumb slider (band = 'custom', no chip checked)
    const range = $('[data-range]', fForm);
    const lo = Number(range.dataset.lo), hi = Number(range.dataset.hi);
    const [rMin, rMax] = $$('input[type=range]', range);
    const fill = $('[data-fill]', range);
    const { pmin: tMin, pmax: tMax } = fForm.elements;
    const bandBounds = { all: [lo, hi], lt2: [lo, 2e6], '2to5': [2e6, 5e6], gt5: [5e6, hi] };
    const clamp = (n) => Math.min(hi, Math.max(lo, n));
    const num = (v) => { const n = parseInt(String(v).replace(/\D/g, ''), 10); return Number.isFinite(n) ? n : null; };
    const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    const setRange = (a, b) => {
      [a, b] = [clamp(a), clamp(b)];
      if (a > b) [a, b] = [b, a];
      rMin.value = a; rMax.value = b;
      tMin.value = fmt(a); tMax.value = fmt(b);
      fill.style.left = `${((a - lo) / (hi - lo)) * 100}%`;
      fill.style.right = `${100 - ((b - lo) / (hi - lo)) * 100}%`;
    };
    const toCustom = () => { [...fForm.elements.band].forEach((r) => { r.checked = false; }); };
    const read = () => {
      const fd = new FormData(fForm);
      return { band: fd.get('band') || 'custom', pmin: Number(rMin.value), pmax: Number(rMax.value), fuel: fd.get('fuel') || 'all', make: fd.get('make') || 'all', sort: fd.get('sort') || 'price-desc' };
    };
    const write = (s) => {
      for (const [k, v] of Object.entries(s)) {
        const el = fForm.elements[k];
        if (!el || k === 'pmin' || k === 'pmax') continue;
        if (el instanceof RadioNodeList) { const r = [...el].find((x) => x.value === v); if (r) r.checked = true; }
        else if ([...el.options].some((o) => o.value === v)) el.value = v;
      }
      if (s.band === 'custom') { toCustom(); setRange(s.pmin, s.pmax); } else setRange(...(bandBounds[s.band] || bandBounds.all));
    };
    const priceOk = (s, p) => (s.band === 'custom' ? p >= s.pmin && p <= s.pmax : s.band === 'all' || bandOf(p) === s.band);
    const render = () => {
      const s = read();
      [...cards].sort(sorters[s.sort] || sorters['price-desc']).forEach((c) => grid.append(c));
      let shown = 0;
      cards.forEach((c) => {
        const on = priceOk(s, Number(c.dataset.price))
          && (s.fuel === 'all' || c.dataset.fuel === s.fuel)
          && (s.make === 'all' || c.dataset.make === s.make);
        c.hidden = !on;
        if (on) { shown++; c.classList.add('is-in'); }
      });
      cnt.textContent = shown === total ? `Показаны все ${total} автомобилей` : shown ? `Показано ${shown} из ${total}` : 'Ничего не нашлось';
      empty.hidden = shown > 0;
      const dirty = Object.keys(defaults).some((k) => s[k] !== defaults[k]);
      resetBtn.hidden = !dirty;
      const q = new URLSearchParams();
      for (const k of Object.keys(defaults)) if (s[k] !== defaults[k]) q.set(k, s[k]);
      if (s.band === 'custom') { q.set('pmin', s.pmin); q.set('pmax', s.pmax); }
      history.replaceState(null, '', q.toString() ? `?${q}` : location.pathname);
    };
    const apply = (animate = true) => {
      if (animate && document.startViewTransition && !reduce() && document.visibilityState === 'visible') {
        cards.forEach((c) => { c.style.viewTransitionName = `c-${c.dataset.slug}`; });
        let done = false;
        const once = () => { if (!done) { done = true; render(); } };
        const t = document.startViewTransition(once);
        setTimeout(once, 400); // never leave the list stale if the transition is held back
        t.finished.finally(() => cards.forEach((c) => { c.style.viewTransitionName = ''; }));
      } else render();
    };
    const params = new URLSearchParams(location.search);
    const init = { ...defaults };
    for (const k of Object.keys(defaults)) if (params.get(k)) init[k] = params.get(k);
    init.pmin = num(params.get('pmin')) ?? lo;
    init.pmax = num(params.get('pmax')) ?? hi;
    write(init);
    render();
    // dragging: move the numbers and the list live, without the view transition
    let raf = 0;
    [rMin, rMax].forEach((r) => r.addEventListener('input', () => {
      toCustom();
      setRange(Number(rMin.value), Number(rMax.value));
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(render);
    }));
    const commitFields = () => { toCustom(); setRange(num(tMin.value) ?? lo, num(tMax.value) ?? hi); };
    fForm.addEventListener('change', (e) => {
      if (e.target.type === 'range') return; // already rendered on input
      if (e.target === tMin || e.target === tMax) commitFields();
      else if (e.target.name === 'band') setRange(...bandBounds[e.target.value]);
      apply();
    });
    fForm.addEventListener('submit', (e) => { e.preventDefault(); if (document.activeElement === tMin || document.activeElement === tMax) { commitFields(); apply(); } });
    fForm.addEventListener('reset', () => setTimeout(() => { setRange(lo, hi); apply(); }, 0));
    $('[data-reset-2]')?.addEventListener('click', () => fForm.reset());
  }

  // ---------- shared photo between a list and the car page (cross-document view transition) ----------
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-car]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    $$('img').forEach((im) => { if (im.style.viewTransitionName === 'car-photo') im.style.viewTransitionName = ''; });
    const im = $('img', a);
    if (im) im.style.viewTransitionName = 'car-photo';
  });
})();
