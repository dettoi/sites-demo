(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // nav turns solid once the page scrolls
  const nav = $('[data-nav]');
  if (nav) {
    let ticking = false;
    const set = () => { nav.classList.toggle('is-solid', scrollY > 8); ticking = false; };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(set); } }, { passive: true });
    set();
    const toggle = $('.nav-toggle', nav);
    const links = $('#nav-links');
    toggle?.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      links.classList.toggle('is-open', open);
    });
  }

  // one reveal
  const items = $$('[data-reveal]');
  if (!('IntersectionObserver' in window) || reduce) {
    items.forEach((el) => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    items.forEach((el) => io.observe(el));
    // safety net: if the observer never reports, show what is on screen anyway
    setTimeout(() => items.forEach((el) => {
      if (!el.classList.contains('is-in') && el.getBoundingClientRect().top < innerHeight) el.classList.add('is-in');
    }), 2500);
  }

  // deal tabs
  $$('[role="tablist"]').forEach((list) => {
    const tabs = $$('[role="tab"]', list);
    const form = list.closest('form');
    const typeInput = form && $('[data-type]', form);
    const select = (tab, focus) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
        if (on && panel && typeInput) typeInput.value = panel.dataset.typeValue;
      });
      if (focus) tab.focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', (e) => {
        const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (d) { e.preventDefault(); select(tabs[(i + d + tabs.length) % tabs.length], true); }
      });
    });
  });

  // forms: checked here, sent nowhere until an endpoint is set
  const phoneOk = (v) => v.replace(/\D/g, '').length >= 10;
  $$('[data-form]').forEach((form) => {
    const status = $('.form-status', form);
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const phone = $('input[name="phone"]', form);
      const hint = document.getElementById(phone.getAttribute('aria-describedby'));
      if (!phoneOk(phone.value)) {
        phone.setAttribute('aria-invalid', 'true');
        hint.textContent = 'Укажите телефон, чтобы менеджер мог перезвонить.';
        phone.focus();
        return;
      }
      phone.removeAttribute('aria-invalid');
      hint.textContent = '';
      const endpoint = form.dataset.endpoint;
      if (!endpoint) {
        status.textContent = 'Это демо-версия: заявка пока никуда не отправляется. Позвоните или напишите в Telegram.';
        return;
      }
      const btn = $('button[type="submit"]', form);
      btn.disabled = true;
      try {
        const res = await fetch(endpoint, { method: 'POST', body: new FormData(form) });
        if (!res.ok) throw new Error(String(res.status));
        location.href = form.dataset.thanks || 'thanks.html';
      } catch {
        status.textContent = 'Заявка не ушла. Позвоните нам или напишите в Telegram.';
        btn.disabled = false;
      }
    });
    $$('input[name="phone"]', form).forEach((i) => i.addEventListener('blur', () => {
      if (i.value && !phoneOk(i.value)) i.setAttribute('aria-invalid', 'true');
      else i.removeAttribute('aria-invalid');
    }));
  });

  // map loads only on request
  $$('[data-map-load]').forEach((btn) => btn.addEventListener('click', () => {
    const box = btn.closest('[data-map]');
    const f = document.createElement('iframe');
    f.src = box.dataset.map;
    f.title = 'Карта: площадка БАЙКАРС';
    f.loading = 'lazy';
    f.allowFullscreen = true;
    box.append(f);
    $('.map-load', box)?.remove();
  }));

  // car gallery
  $$('[data-gallery]').forEach((g) => {
    const main = $('[data-main]', g);
    const thumbs = $$('.thumb', g);
    thumbs.forEach((t) => t.addEventListener('click', () => {
      if (t.getAttribute('aria-current') === 'true') return;
      thumbs.forEach((x) => x.removeAttribute('aria-current'));
      t.setAttribute('aria-current', 'true');
      const next = new Image();
      next.src = t.dataset.src;
      const swap = () => {
        main.classList.add('is-off');
        setTimeout(() => { main.src = t.dataset.src; main.classList.remove('is-off'); }, reduce ? 0 : 320);
      };
      next.decode ? next.decode().then(swap, swap) : swap();
    }));
  });

  // catalogue filter
  const grid = $('[data-catalog]');
  if (grid) {
    const cards = $$('.car', grid);
    const empty = $('[data-empty]');
    $$('[data-filter]').forEach((b, _, all) => b.addEventListener('click', () => {
      all.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      const f = b.dataset.filter;
      let shown = 0;
      cards.forEach((c) => { const on = f === 'all' || c.dataset.band === f; c.hidden = !on; if (on) { shown++; c.classList.add('is-in'); } });
      empty.hidden = shown > 0;
    }));
  }

  // showroom carousel
  const show = $('[data-showroom]');
  const slides = show ? $$('[data-slide]', show) : [];
  if (slides.length) {
    const n = slides.length;
    const stage = $('[data-stage]', show);
    const row = $('.thumbs-row', show);
    const thumbs = $$('[data-thumb]', show);
    const toggle = $('[data-toggle]', show);
    const secs = (v) => { const x = parseFloat(v); return /ms\s*$/.test(v) ? x : /s\s*$/.test(v) ? x * 1000 : x; };
    const delay = secs(getComputedStyle(show).getPropertyValue('--autoplay')) || 6000;
    const leave = new Map();
    let cur = Math.max(0, slides.findIndex((s) => s.classList.contains('is-active')));
    let userPaused = reduce;
    let hover = false;
    let focused = false;
    let away = document.hidden;
    let offscreen = false;
    let timer = 0;
    let startedAt = 0;
    let remaining = delay;

    // autoplay: the countdown keeps its remainder while paused, so it stays in step with the progress bar
    const running = () => n > 1 && !userPaused && !hover && !focused && !away && !offscreen;
    const disarm = () => {
      if (!timer) return;
      clearTimeout(timer);
      timer = 0;
      remaining = Math.max(0, remaining - (performance.now() - startedAt));
    };
    const sync = () => {
      const on = running();
      show.classList.toggle('is-playing', on);
      show.classList.toggle('is-paused', !on);
      stage?.setAttribute('aria-live', on ? 'off' : 'polite');
      if (!on) { disarm(); return; }
      if (timer) return;
      startedAt = performance.now();
      timer = setTimeout(() => { timer = 0; remaining = delay; go(cur + 1, 1); }, remaining);
    };

    // keep the active thumb inside its row without moving the page
    const reveal = (t) => {
      if (!row || row.scrollWidth <= row.clientWidth) return;
      const r = row.getBoundingClientRect();
      const b = t.getBoundingClientRect();
      const pad = 8;
      const d = b.left < r.left + pad ? b.left - r.left - pad : b.right > r.right - pad ? b.right - r.right + pad : 0;
      if (d) row.scrollTo({ left: row.scrollLeft + d, behavior: reduce ? 'auto' : 'smooth' });
    };

    // dir: 1 forward (new slide comes in from the right), -1 back
    const go = (to, dir = 1) => {
      to = ((to % n) + n) % n;
      if (to !== cur) {
        const out = slides[cur];
        const inc = slides[to];
        const photo = $('.slide-photo', inc);
        clearTimeout(leave.get(inc));
        leave.delete(inc);
        inc.classList.remove('is-leaving');
        if (photo) photo.style.transition = 'none';
        inc.style.setProperty('--from', String(dir));
        void inc.offsetWidth;
        if (photo) photo.style.transition = '';
        inc.removeAttribute('inert');
        inc.classList.add('is-active');

        clearTimeout(leave.get(out));
        out.style.setProperty('--to', String(-dir));
        out.classList.add('is-leaving');
        out.classList.remove('is-active');
        out.setAttribute('inert', '');
        leave.set(out, setTimeout(() => { leave.delete(out); out.classList.remove('is-leaving'); }, reduce ? 0 : 1500));

        slides.forEach((s) => {
          if (s === inc || s === out) return;
          s.classList.remove('is-active');
          s.setAttribute('inert', '');
          if (!leave.has(s)) s.classList.remove('is-leaving');
        });
        cur = to;
      }
      thumbs.forEach((t) => {
        const on = Number(t.dataset.thumb) === cur;
        // same slide again: drop and restore the attribute so the progress bar restarts
        if (on && t.getAttribute('aria-current') === 'true') { t.removeAttribute('aria-current'); void t.offsetWidth; }
        if (on) { t.setAttribute('aria-current', 'true'); reveal(t); } else t.removeAttribute('aria-current');
      });
      disarm();
      remaining = delay;
      sync();
    };
    const step = (d) => go(cur + d, d);

    // initial state
    slides.forEach((s, k) => {
      s.classList.toggle('is-active', k === cur);
      if (k === cur) s.removeAttribute('inert'); else s.setAttribute('inert', '');
    });
    thumbs.forEach((t) => {
      if (Number(t.dataset.thumb) === cur) t.setAttribute('aria-current', 'true'); else t.removeAttribute('aria-current');
    });

    // controls
    $('[data-prev]', show)?.addEventListener('click', () => step(-1));
    $('[data-next]', show)?.addEventListener('click', () => step(1));
    thumbs.forEach((t) => t.addEventListener('click', () => {
      const i = Number(t.dataset.thumb);
      go(i, i > cur ? 1 : -1);
    }));
    const paint = () => {
      if (!toggle) return;
      toggle.setAttribute('aria-pressed', String(userPaused));
      toggle.setAttribute('aria-label', userPaused ? 'Продолжить' : 'Пауза');
      const pause = $('[data-icon="pause"]', toggle);
      const play = $('[data-icon="play"]', toggle);
      if (pause) pause.hidden = userPaused;
      if (play) play.hidden = !userPaused;
    };
    toggle?.addEventListener('click', () => { userPaused = !userPaused; paint(); sync(); });

    // arrow keys, unless the visitor is typing and only while the carousel is on screen
    document.addEventListener('keydown', (e) => {
      if ((e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') || e.defaultPrevented) return;
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (e.target.closest?.('input, textarea, select, [contenteditable]:not([contenteditable="false"])')) return;
      const r = show.getBoundingClientRect();
      if (r.bottom <= 0 || r.top >= innerHeight) return;
      step(e.key === 'ArrowRight' ? 1 : -1);
    });

    // swipe: left = next; a swipe must not open the car under the finger
    if (stage) {
      let sx = 0;
      let sy = 0;
      let sid = -1;
      let swallow = false;
      stage.addEventListener('pointerdown', (e) => {
        if (!e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0)) return;
        sx = e.clientX;
        sy = e.clientY;
        sid = e.pointerId;
      });
      stage.addEventListener('pointerup', (e) => {
        if (e.pointerId !== sid) return;
        sid = -1;
        const dx = e.clientX - sx;
        const dy = e.clientY - sy;
        if (Math.abs(dx) <= 50 || Math.abs(dx) <= Math.abs(dy)) return;
        swallow = true;
        setTimeout(() => { swallow = false; }, 400);
        step(dx < 0 ? 1 : -1);
      });
      stage.addEventListener('pointercancel', () => { sid = -1; });
      stage.addEventListener('click', (e) => {
        if (!swallow) return;
        swallow = false;
        e.preventDefault();
        e.stopPropagation();
      }, true);
      stage.addEventListener('dragstart', (e) => e.preventDefault());
    }

    // pauses: mouse over, keyboard focus inside, hidden tab, carousel off screen
    show.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { hover = true; sync(); } });
    show.addEventListener('pointerleave', () => { hover = false; sync(); });
    const kbd = (el) => { try { return el.matches(':focus-visible'); } catch { return true; } };
    show.addEventListener('focusin', (e) => { focused = kbd(e.target); sync(); });
    show.addEventListener('focusout', (e) => { if (!show.contains(e.relatedTarget)) { focused = false; sync(); } });
    document.addEventListener('visibilitychange', () => { away = document.hidden; sync(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        offscreen = !entries[entries.length - 1].isIntersecting;
        sync();
      }).observe(show);
    }

    paint();
    sync();
  }

  // car photo travels from the clicked card to the car page (View Transitions, named on click)
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    const a = e.target.closest?.('a[href*="cars/"]');
    if (!a || (a.target && a.target !== '_self')) return;
    const photo = $('[data-vt]', a);
    if (!photo) return;
    $$('[data-vt]').forEach((el) => { el.style.viewTransitionName = ''; });
    photo.style.viewTransitionName = 'car-photo';
  });
})();
