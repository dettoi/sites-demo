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
        setTimeout(() => { main.src = t.dataset.src; main.classList.remove('is-off'); }, reduce ? 0 : 180);
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
})();
