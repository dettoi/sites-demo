// Шаблон лендинга автосервиса. Принимает client.json, возвращает готовый index.html.
// Любой блок отключается через "enabled": false в client.json.

const esc = (s = '') => String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

// Иконки Lucide (линейные), чтобы не тянуть библиотеку
const icon = {
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  route: '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
};
const svg = name => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${icon[name]}</svg>`;

const on = block => block && block.enabled !== false;

// Типографика отзывов при выводе: пробел после знаков препинания. Сам текст в client.json остаётся дословным
const typo = s => s.replace(/([,.!?;:])(?=[А-Яа-яЁёA-Za-z])/g, '$1 ').replace(/\s+/g, ' ').trim();

// Шрифты из theme.fonts (Google Fonts). weights: "" — для шрифтов с одним начертанием (Russo One)
const defaultFonts = {
  head: { family: 'Unbounded', weights: '500;700', weight: 700, tracking: '-0.01em' },
  body: { family: 'Manrope', weights: '400;500;600;700;800' },
};
const fontsHref = f => 'https://fonts.googleapis.com/css2?' + [f.head, f.body]
  .filter((x, i, a) => a.findIndex(y => y.family === x.family) === i)
  .map(x => 'family=' + x.family.replace(/ /g, '+') + (x.weights ? ':wght@' + x.weights : ''))
  .join('&') + '&display=swap';

export function render(c, { photo }) {
  const k = c.contacts;
  const [lat, lon] = k.coords;
  // Расписание по дням: contacts.week {"Mon":[9,20],...}, иначе openFrom–openTo каждый день
  const week = k.week || Object.fromEntries(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => [d, [k.openFrom, k.openTo]]));
  const tf = c.theme.fonts || {};
  const fonts = { head: { ...defaultFonts.head, ...tf.head }, body: { ...defaultFonts.body, ...tf.body } };
  const nav = [
    on(c.services) && ['#services', 'Услуги'],
    on(c.gallery) && ['#gallery', 'Фото'],
    on(c.reviews) && ['#reviews', 'Отзывы'],
    on(c.contactsBlock) && ['#contacts', 'Контакты'],
  ].filter(Boolean);

  return `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(c.seo.title)}</title>
<meta name="description" content="${esc(c.seo.description)}">
<meta property="og:title" content="${esc(c.seo.title)}">
<meta property="og:description" content="${esc(c.seo.description)}">
<meta property="og:image" content="${photo(c.hero.photo)}">
<meta name="theme-color" content="#0f1214">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${fontsHref(fonts)}" rel="stylesheet">
<link rel="stylesheet" href="styles.css">
<style>:root { --primary: ${c.theme.primary}; --on-primary: ${c.theme.onPrimary}; --font: "${fonts.body.family}", system-ui, sans-serif; --font-head: "${fonts.head.family}", system-ui, sans-serif; --head-weight: ${fonts.head.weight}; --head-track: ${fonts.head.tracking}; }</style>
<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org', '@type': 'AutoRepair', name: c.brand.name, telephone: k.phone,
    address: { '@type': 'PostalAddress', streetAddress: k.address, addressLocality: k.district },
    geo: { '@type': 'GeoCoordinates', latitude: lat, longitude: lon },
    openingHours: Object.entries(week).map(([d, [f, t]]) => `${d.slice(0, 2)} ${String(f).padStart(2, '0')}:00-${t}:00`),
    aggregateRating: on(c.reviews) ? { '@type': 'AggregateRating', ratingValue: c.reviews.rating, ratingCount: parseInt(c.reviews.count) } : undefined,
  })}</script>
</head>
<body>

<header class="top">
  <div class="wrap">
    <a class="logo" href="#">${esc(c.brand.nameParts[0])}<span>${esc(c.brand.nameParts[1])}</span></a>
    <nav>${nav.map(([href, label]) => `<a href="${href}">${label}</a>`).join('')}</nav>
    <a class="phone" href="${k.phoneHref}">${svg('phone')}${esc(k.phone)}</a>
  </div>
</header>

<main>
<div class="hero">
  <div class="wrap">
    <div>
      <div class="status" id="status" data-week='${JSON.stringify(week)}'><i></i><span>${esc(k.hours)}</span></div>
      <h1>${esc(c.hero.title)}</h1>
      <p class="lead">${esc(c.hero.lead)}</p>
      <div class="actions">
        <a class="btn btn-primary" href="${k.phoneHref}">${svg('phone')}Позвонить</a>
        ${on(c.booking) ? `<a class="btn btn-ghost" href="#booking">Записаться онлайн</a>` : `<a class="btn btn-ghost" href="${k.route}" target="_blank" rel="noopener">${svg('route')}Маршрут</a>`}
      </div>
      <div class="facts">
        ${c.hero.facts.map(f => `<div><b>${esc(f.value)}</b><span>${esc(f.label)}</span></div>`).join('\n        ')}
      </div>
    </div>
    <div class="hero-photo"><img src="${photo(c.hero.photo)}" alt="${esc(c.hero.photoAlt || c.brand.name)}" fetchpriority="high"></div>
  </div>
</div>

${on(c.services) ? `<section id="services"><div class="wrap">
  <h2>${esc(c.services.title)}</h2>
  <div class="prices" id="prices">
    ${c.services.items.map((s, i) => `<div class="price"${i >= (c.services.visible ?? 8) ? ' hidden' : ''}><div>${esc(s.name)}${s.desc ? `<small>${esc(s.desc)}</small>` : ''}</div><b>${esc(s.price)}</b></div>`).join('\n    ')}
  </div>
  ${c.services.items.length > (c.services.visible ?? 8) ? `<button class="btn btn-ghost prices-toggle" id="prices-toggle" type="button" aria-expanded="false" aria-controls="prices" data-all="Показать все услуги (${c.services.items.length})" data-less="Свернуть">Показать все услуги (${c.services.items.length})</button>` : ''}
  ${c.services.note ? `<p class="note">${esc(c.services.note)}</p>` : ''}
</div></section>` : ''}

${on(c.advantages) ? `<section id="why"><div class="wrap">
  <h2>${esc(c.advantages.title)}</h2>
  <div class="why">
    ${c.advantages.items.map((a, i) => `<div><span class="num">${String(i + 1).padStart(2, '0')}</span><h3>${esc(a.title)}</h3><p>${esc(a.text)}</p></div>`).join('\n    ')}
  </div>
</div></section>` : ''}

${on(c.gallery) ? `<section id="gallery"><div class="wrap">
  <div class="gallery-head">
    <h2>${esc(c.gallery.title)}</h2>
    <div class="gallery-nav">
      <button class="arrow" type="button" id="gallery-prev" aria-label="Назад"><svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg></button>
      <button class="arrow" type="button" id="gallery-next" aria-label="Вперёд"><svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></button>
    </div>
  </div>
  <div class="gallery" id="gallery-track">
    ${c.gallery.photos.map(p => `<figure><img src="${photo(p.file)}" alt="${esc(p.alt)}" loading="lazy"></figure>`).join('\n    ')}
  </div>
  <div class="gallery-dots" id="gallery-dots" aria-hidden="true">${c.gallery.photos.map(() => '<i></i>').join('')}</div>
</div></section>` : ''}

${on(c.reviews) ? `<section id="reviews"><div class="wrap">
  <h2>${esc(c.reviews.title)}</h2>
  <div class="reviews">
    <div class="rating">
      <div class="big">${esc(c.reviews.rating)}</div>
      <div class="stars" aria-label="5 звёзд">★★★★★</div>
      <div class="muted">${esc(c.reviews.count)} на 2ГИС</div>
      <a href="${c.reviews.link}" target="_blank" rel="noopener">Все отзывы на 2ГИС →</a>
    </div>
    <div class="review-list">
      ${c.reviews.items.map(r => `<article class="review"><div class="stars" aria-hidden="true">★★★★★</div><p>${esc(typo(r.text))}</p><footer><b>${esc(r.author)}</b> · 2ГИС</footer></article>`).join('\n      ')}
    </div>
  </div>
</div></section>` : ''}

${on(c.booking) ? `<section id="booking"><div class="wrap">
  <div class="booking">
    <div><h2>${esc(c.booking.title)}</h2><p class="muted">${esc(c.booking.text)}</p></div>
    <form id="booking-form">
      <input type="tel" name="phone" placeholder="+7 ___ ___-__-__" autocomplete="tel" required aria-label="Ваш телефон">
      <button class="btn btn-primary" type="submit">Жду звонка</button>
      <p class="form-msg" id="form-msg" role="status"></p>
    </form>
  </div>
</div></section>` : ''}

${on(c.contactsBlock) ? `<section id="contacts"><div class="wrap">
  <h2>${esc(c.contactsBlock.title)}</h2>
  <div class="contacts">
    <dl>
      <div><dt>${svg('pin')}Адрес</dt><dd>${esc(k.address)}<small>${esc(k.district)}${k.transport ? ` · ${esc(k.transport)}` : ''}</small></dd></div>
      <div><dt>${svg('clock')}Часы работы</dt><dd>${esc(k.hours)}</dd></div>
      <div><dt>${svg('phone')}Телефон</dt><dd><a href="${k.phoneHref}">${esc(k.phone)}</a></dd></div>
      <div class="messengers">
        <a class="btn btn-primary" href="${k.route}" target="_blank" rel="noopener">${svg('route')}Построить маршрут</a>
        ${k.whatsapp ? `<a class="btn btn-ghost" href="${k.whatsapp}" target="_blank" rel="noopener">${svg('chat')}WhatsApp</a>` : ''}
        ${k.max ? `<a class="btn btn-ghost" href="${k.max}" target="_blank" rel="noopener">${svg('chat')}Max</a>` : ''}
        ${k.telegram ? `<a class="btn btn-ghost" href="${k.telegram}" target="_blank" rel="noopener">${svg('chat')}Telegram</a>` : ''}
        ${k.viber ? `<a class="btn btn-ghost" href="${k.viber}" target="_blank" rel="noopener">${svg('chat')}Viber</a>` : ''}
      </div>
    </dl>
    <div class="map"><iframe src="https://yandex.ru/map-widget/v1/?ll=${lon},${lat}&z=16&pt=${lon},${lat},pm2rdm" title="Карта: ${esc(c.brand.name)}" loading="lazy" allowfullscreen></iframe></div>
  </div>
</div></section>` : ''}
</main>

<footer class="foot"><div class="wrap">
  <span>© ${new Date().getFullYear()} ${esc(c.brand.name)} · ${esc(c.brand.category)}</span>
  <span>${esc(k.address)}, ${esc(k.district)}</span>
</div></footer>

<div class="mobilebar">
  <a class="btn btn-primary" href="${k.phoneHref}">${svg('phone')}Позвонить</a>
  <a class="btn btn-ghost" href="${k.route}" target="_blank" rel="noopener">${svg('route')}Маршрут</a>
</div>

<script>
// «Открыто сейчас» по московскому времени
(function () {
  var el = document.getElementById('status'); if (!el) return;
  // data-week: {"Mon":[9,20],...}; дня нет в списке — выходной
  var week = JSON.parse(el.dataset.week), days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var parts = new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: false, weekday: 'short', timeZone: 'Europe/Moscow' }).formatToParts(new Date());
  var h = Number(parts.find(function (p) { return p.type === 'hour'; }).value) % 24;
  var d = days.indexOf(parts.find(function (p) { return p.type === 'weekday'; }).value);
  var today = week[days[d]];
  var open = !!today && h >= today[0] && h < today[1];
  var text;
  if (open) text = 'Открыто до ' + today[1] + ':00';
  else {
    var next = null, label = '';
    for (var i = (today && h < today[0]) ? 0 : 1; i <= 7 && !next; i++) {
      next = week[days[(d + i) % 7]];
      label = i === 0 ? '' : i === 1 ? 'завтра ' : '';
    }
    text = next ? 'Закрыто · откроемся ' + label + 'в ' + next[0] + ':00' : 'Закрыто';
  }
  el.classList.toggle('open', open);
  el.querySelector('span').textContent = text + (Object.keys(week).length === 7 ? ' · без выходных' : '');
})();
// Форма записи
(function () {
  var f = document.getElementById('booking-form'); if (!f) return;
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    document.getElementById('form-msg').textContent = 'Спасибо! Перезвоним в ближайшее время.';
    f.reset();
  });
})();
// Услуги: показать все / свернуть
(function () {
  var btn = document.getElementById('prices-toggle'); if (!btn) return;
  var items = document.querySelectorAll('#prices .price');
  var extra = [].filter.call(items, function (el) { return el.hasAttribute('hidden'); });
  var opened = false;
  btn.addEventListener('click', function () {
    opened = !opened;
    extra.forEach(function (el) { el.hidden = !opened; });
    btn.textContent = opened ? btn.dataset.less : btn.dataset.all;
    btn.setAttribute('aria-expanded', String(opened));
    if (!opened) document.getElementById('services').scrollIntoView({ behavior: 'smooth' });
  });
})();
// Галерея: карусель со стрелками и точками
(function () {
  var track = document.getElementById('gallery-track'); if (!track) return;
  var prev = document.getElementById('gallery-prev'), next = document.getElementById('gallery-next');
  var dots = document.querySelectorAll('#gallery-dots i');
  function step() {
    var f = track.children[0], g = parseFloat(getComputedStyle(track).columnGap) || 0;
    return f.getBoundingClientRect().width + g;
  }
  function update() {
    var max = track.scrollWidth - track.clientWidth;
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= max - 2;
    var idx = Math.round(track.scrollLeft / step());
    dots.forEach(function (d, i) { d.classList.toggle('on', i === idx); });
  }
  prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
  next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
  track.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
</script>
</body>
</html>
`;
}
