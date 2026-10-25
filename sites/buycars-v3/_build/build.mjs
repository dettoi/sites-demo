// Генератор статического сайта БАЙКАРС, третья версия.
// Запуск из папки сайта: node _build/build.mjs
// Источник данных: data/cars.json. Фото: img/cars/<slug>/ (готовит _build/prep-images.py).
// Дизайн-договорённости: _build/DESIGN.md.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, existsSync, copyFileSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const V = 324; // версия css/js для сброса кэша
const SHOW_INTERIOR = false; // блок «Фото салона» на главной; true вернёт его (кадры выбраны в details ниже)

const SITE = {
  name: 'БАЙКАРС',
  latin: 'BuyCars Group',
  phone: '+7 904 444-45-35',
  phoneHref: 'tel:+79044444535',
  tgChat: 'https://t.me/+79044444535',
  tgChannel: 'https://t.me/buycars7777',
  tgChannelName: '@buycars7777',
  street: 'Новочеркасское шоссе, 1Д',
  place: 'станица Грушевская, Аксайский район, Ростовская область',
  hours: 'Без перерывов и выходных',
  yandexOrg: 'https://yandex.ru/maps/org/buycars_group/227042726764/',
  yandexWidget: 'https://yandex.ru/map-widget/v1/org/buycars_group/227042726764/?z=16',
};

const cars = JSON.parse(readFileSync(join(ROOT, 'data/cars.json'), 'utf8'))
  .map((c) => ({ ...c, title: c.title.replace(/‑/g, '-') }))
  .sort((a, b) => b.price_rub - a.price_rub);

// ---------- логотип: берём файл из основного сайта ----------
let logoFile = null;
const logoDir = join(ROOT, '..', 'buycars', 'img', 'logo');
if (existsSync(logoDir)) {
  const files = readdirSync(logoDir).filter((f) => /\.(svg|png)$/i.test(f));
  const pref = files.find((f) => /light|white|dark-bg|inverse|negative/i.test(f)) || files.find((f) => /\.svg$/i.test(f)) || files[0];
  if (pref) {
    mkdirSync(join(ROOT, 'img', 'logo'), { recursive: true });
    copyFileSync(join(logoDir, pref), join(ROOT, 'img', 'logo', 'logo' + extname(pref).toLowerCase()));
    logoFile = 'img/logo/logo' + extname(pref).toLowerCase();
  }
} else if (existsSync(join(ROOT, 'img', 'logo', 'logo.svg'))) logoFile = 'img/logo/logo.svg';

// ---------- helpers ----------
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const NB = ' ';
const groups = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, NB);
const price = (c) => `${groups(c.price_rub)}${NB}₽`;
const km = (n) => `${groups(n)}${NB}км`;
const spec = (c, k) => (c.specs_extra.find(([x]) => x === k) || [])[1];
const splitTitle = (c) => {
  const i = c.title.indexOf(' ');
  return i < 0 ? ['', c.title] : [c.title.slice(0, i), c.title.slice(i + 1)];
};
const metaLine = (c) => [`${c.year}${NB}г.`, km(c.mileage_km), c.engine_short].join(', ');
const carUrl = (c) => `cars/${c.slug}.html`;
const short = (n) => (n < 1e6 ? `${Math.round(n / 1e3)}${NB}тыс.` : `${String(Math.round(n / 1e5) / 10).replace('.', ',')}${NB}млн`);

function jpegSize(file) {
  const b = readFileSync(file);
  let i = 2;
  while (i < b.length) {
    if (b[i] !== 0xff) { i++; continue; }
    const m = b[i + 1];
    const len = b.readUInt16BE(i + 2);
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
    i += 2 + len;
  }
  return { w: 800, h: 600 };
}
const sizeCache = new Map();
const dims = (src) => {
  if (!sizeCache.has(src)) sizeCache.set(src, jpegSize(join(ROOT, src)));
  return sizeCache.get(src);
};
// photo: {src, thumb}; sizes: css sizes; opts: loading etc.
const pic = (p, ph, alt, { sizes = '100vw', attrs = 'loading="lazy" decoding="async"', thumbOnly = false } = {}) => {
  const { w, h } = dims(ph.src);
  const t = dims(ph.thumb);
  if (thumbOnly) return `<img src="${p}${ph.thumb}" width="${t.w}" height="${t.h}" alt="${esc(alt)}" ${attrs}>`;
  return `<img src="${p}${ph.src}" srcset="${p}${ph.thumb} ${t.w}w, ${p}${ph.src} ${w}w" sizes="${sizes}" width="${w}" height="${h}" alt="${esc(alt)}" ${attrs}>`;
};

// odometer: digits roll when the value changes (site.js); markup already shows the right number without JS
const odo = (value, slots, unit, extra = '') => {
  const s = String(value);
  const lead = slots - s.length;
  const d = s.padStart(slots, '0');
  let html = '';
  for (let i = 0; i < slots; i++) {
    html += `<span class="odo-d${i < lead ? ' is-lead' : ''}" style="--d:${d[i]}"><span class="odo-s">${[...'0123456789'].map((x) => `<span>${x}</span>`).join('')}</span></span>`;
    const rest = slots - i - 1;
    if (rest > 0 && rest % 3 === 0) html += `<span class="odo-g${i < lead ? ' is-lead' : ''}" data-after="${i}"></span>`;
  }
  return `<span class="odo" data-odo="${value}"${extra} aria-hidden="true">${html}<span class="odo-u">${unit}</span></span>`;
};

const I = {
  tg: '<svg class="ic ic-tg" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.4 4.3 2.9 11.4c-1.3.5-1.2 1.2-.2 1.5l4.7 1.5 1.8 5.6c.2.6.4.8.8.8.4 0 .6-.2.9-.5l2.3-2.2 4.7 3.5c.9.5 1.5.2 1.7-.8l3.1-14.6c.3-1.3-.5-1.9-1.4-1.5ZM9.6 14.2l8.6-5.4c.4-.3.8-.1.5.2l-7.1 6.4-.3 3.2-1.7-4.4Z"/></svg>',
  phone: '<svg class="ic ic-phone" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" d="M5 3.5h3.2l1.6 4.2-2.1 1.4a11 11 0 0 0 5.2 5.2l1.4-2.1 4.2 1.6V17a2.5 2.5 0 0 1-2.7 2.5C9.6 19 5 14.4 4.5 6.2A2.5 2.5 0 0 1 5 3.5Z"/></svg>',
  prev: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" d="M14.5 5.5 8 12l6.5 6.5"/></svg>',
  next: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" d="M9.5 5.5 16 12l-6.5 6.5"/></svg>',
  out: '<svg class="ic ic-out" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" d="M9 6h9v9M18 6 6 18"/></svg>',
  check: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
};
// icon set into its own round socket inside a button
const ic = (svg) => `<span class="btn-ic" aria-hidden="true">${svg}</span>`;
const lines = '<span class="burger" aria-hidden="true"><span></span><span></span></span>';

// ---------- chrome ----------
const brand = (p, cls = '') => logoFile
  ? `<a class="brand ${cls}" href="${p}index.html"><img class="brand-img" src="${p}${logoFile}" alt="БАЙКАРС, на главную" width="157" height="48"></a>`
  : `<a class="brand ${cls}" href="${p}index.html" aria-label="БАЙКАРС, на главную"><span class="brand-word">БАЙКАРС</span><span class="brand-sub" aria-hidden="true">BuyCars Group</span></a>`;

const navItems = [
  ['index.html', 'Главная', 'home'],
  ['catalog.html', 'Каталог', 'catalog'],
  ['trade.html', 'Обмен, кредит, выкуп', 'trade'],
  ['order.html', 'Под заказ', 'order'],
  ['contacts.html', 'Контакты', 'contacts'],
];

const header = (p, current) => `<a class="skip" href="#main">Перейти к содержанию</a>
<header class="hdr" data-hdr>
  <div class="wrap hdr-in">
    ${brand(p)}
    <nav class="hdr-nav" aria-label="Основное меню">
      ${navItems.map(([h, l, k]) => `<a href="${p}${h}"${current === k ? ' aria-current="page"' : ''}>${l}</a>`).join('\n      ')}
    </nav>
    <div class="hdr-end">
      <a class="hdr-phone" href="${SITE.phoneHref}">${SITE.phone}</a>
      <a class="btn btn-gold btn-sm hdr-tg" href="${SITE.tgChat}">${ic(I.tg)}<span>Написать</span></a>
      <button class="menu-btn" type="button" aria-haspopup="dialog" aria-controls="menu" data-menu-open>${lines}<span class="vh">Открыть меню</span></button>
    </div>
  </div>
</header>
<dialog class="menu" id="menu" aria-label="Меню" data-menu>
  <div class="menu-top wrap">
    ${brand(p, 'brand-menu')}
    <button class="menu-btn is-x" type="button" data-menu-close>${lines}<span class="vh">Закрыть меню</span></button>
  </div>
  <nav class="menu-nav wrap" aria-label="Разделы">
    ${navItems.map(([h, l]) => `<a href="${p}${h}"><span>${l}</span></a>`).join('\n    ')}
  </nav>
  <div class="menu-foot wrap">
    <a class="menu-phone" href="${SITE.phoneHref}">${SITE.phone}</a>
    <p>${SITE.street}, ст.${NB}Грушевская. ${SITE.hours}.</p>
    <div class="actions">
      <a class="btn btn-gold" href="${SITE.tgChat}">${ic(I.tg)}<span>Telegram</span></a>
      <a class="btn btn-line" href="${SITE.phoneHref}">${ic(I.phone)}<span>Позвонить</span></a>
    </div>
  </div>
</dialog>`;

const footer = (p) => `<footer class="ftr">
  <div class="wrap">
    <div class="ftr-call">
      <p class="ftr-lead">Автомобили с&nbsp;пробегом в&nbsp;наличии и&nbsp;под заказ. Обмен, кредит и&nbsp;выкуп. ${SITE.hours}.</p>
      <a class="ftr-phone" href="${SITE.phoneHref}">${SITE.phone}</a>
      <div class="actions">
        <a class="btn btn-gold" href="${SITE.tgChat}">${ic(I.tg)}<span>Написать в&nbsp;Telegram</span></a>
        <a class="btn btn-line" href="${SITE.tgChannel}">Канал ${SITE.tgChannelName}</a>
      </div>
    </div>
    <div class="ftr-cols">
      ${brand(p, 'brand-ftr')}
      <div>
        <h2 class="ftr-h">Площадка</h2>
        <p>${SITE.street}<br>${SITE.place}</p>
      </div>
      <div>
        <h2 class="ftr-h">Разделы</h2>
        <ul class="ftr-links">
          <li><a href="${p}catalog.html">Каталог</a></li>
          <li><a href="${p}trade.html">Обмен, кредит, выкуп</a></li>
          <li><a href="${p}order.html">Под заказ</a></li>
          <li><a href="${p}contacts.html">Контакты и&nbsp;карта</a></li>
        </ul>
      </div>
    </div>
    <div class="ftr-base">
      <span>${SITE.name}, ${SITE.latin}</span>
      <a href="${p}privacy.html">Политика обработки персональных данных</a>
    </div>
  </div>
</footer>
<nav class="dock" aria-label="Быстрая связь">
  <a class="btn btn-line" href="${SITE.phoneHref}">${ic(I.phone)}<span>Позвонить</span></a>
  <a class="btn btn-gold" href="${SITE.tgChat}">${ic(I.tg)}<span>Telegram</span></a>
</nav>`;

const page = ({ p = '', title, description, current = '', body, cls = '', ld = null }) => `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="theme-color" content="#131726">
<meta name="color-scheme" content="dark">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:locale" content="ru_RU">
<link rel="icon" href="${p}favicon.svg" type="image/svg+xml">
<link rel="preload" href="${p}fonts/SofiaSansExtraCondensed-cyrillic.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${p}fonts/SofiaSans-cyrillic.woff2" as="font" type="font/woff2" crossorigin>
<style>html{background:#131726;color:#eef0f6;color-scheme:dark}:focus-visible{outline:2px solid #d6ef3a;outline-offset:3px}</style>
<link rel="stylesheet" href="${p}assets/site.css?v=${V}">
<script>document.documentElement.classList.add('js')</script>
${ld ? `<script type="application/ld+json">${JSON.stringify(ld)}</script>\n` : ''}</head>
<body class="${cls}">
${header(p, current)}
<main id="main">
${body}
</main>
${footer(p)}
<script src="${p}assets/site.js?v=${V}" defer></script>
</body>
</html>
`;

const dealerLd = {
  '@context': 'https://schema.org',
  '@type': 'AutoDealer',
  name: 'БАЙКАРС (BuyCars Group)',
  telephone: '+79044444535',
  address: { '@type': 'PostalAddress', streetAddress: SITE.street, addressLocality: 'станица Грушевская', addressRegion: 'Ростовская область', addressCountry: 'RU' },
  openingHours: 'Mo-Su 00:00-23:59',
  sameAs: [SITE.tgChannel, SITE.yandexOrg],
};

// ---------- forms ----------
const field = (id, label, input, cls = '') => `<div class="field ${cls}"><label for="${id}">${label}</label>${input}<p class="field-hint" id="${id}-hint"></p></div>`;
const nameField = (pre) => field(`${pre}-name`, 'Как к вам обращаться', `<input id="${pre}-name" name="name" type="text" autocomplete="name" aria-describedby="${pre}-name-hint">`);
const phoneField = (pre) => field(`${pre}-phone`, 'Телефон', `<input id="${pre}-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" required aria-describedby="${pre}-phone-hint" placeholder="+7">`);
const carOptions = () => cars.map((c) => `<option value="${esc(c.title)}, ${c.year}">${esc(c.title)}, ${c.year}</option>`).join('');
const formFoot = (p, pre, label) => `<div class="consent">
  <input id="${pre}-ok" name="consent" type="checkbox" required aria-describedby="${pre}-ok-hint">
  <label for="${pre}-ok">Согласен на&nbsp;обработку персональных данных по&nbsp;<a href="${p}privacy.html">политике</a></label>
  <p class="field-hint" id="${pre}-ok-hint"></p>
</div>
<div class="form-foot">
  <button class="btn btn-gold btn-lg" type="submit">${label}</button>
</div>
<div class="form-status" role="status" aria-live="polite" tabindex="-1"></div>`;

const SERVICES = [
  { key: 'trade', name: 'Обмен', desc: 'Ваш автомобиль в зачёт покупки', fields: (pre) => `<div class="form-row">
    ${field(`${pre}-own`, 'Ваш автомобиль', `<input id="${pre}-own" name="own_car" type="text" autocomplete="off" placeholder="Марка, модель, год" aria-describedby="${pre}-own-hint">`)}
    ${field(`${pre}-want`, 'Что хотите взамен', `<select id="${pre}-want" name="want_car" aria-describedby="${pre}-want-hint"><option value="">Пока не выбрал</option>${carOptions()}</select>`)}
  </div>` },
  { key: 'credit', name: 'Кредит', desc: 'Автомобили с площадки продаются и в кредит', fields: (pre) => `<div class="form-row">
    ${field(`${pre}-ccar`, 'Какой автомобиль', `<select id="${pre}-ccar" name="credit_car" aria-describedby="${pre}-ccar-hint"><option value="">Пока не выбрал</option>${carOptions()}</select>`)}
    ${field(`${pre}-first`, 'Первый взнос, ₽', `<input id="${pre}-first" name="first_payment" type="text" inputmode="numeric" autocomplete="off" aria-describedby="${pre}-first-hint">`)}
  </div>` },
  { key: 'order', name: 'Под заказ', desc: 'Автомобили со всего мира под ваш запрос', fields: (pre) => `<div class="form-row">
    ${field(`${pre}-look`, 'Какой автомобиль ищете', `<input id="${pre}-look" name="looking_for" type="text" autocomplete="off" placeholder="Марка, модель, год" aria-describedby="${pre}-look-hint">`)}
    ${field(`${pre}-budget`, 'Бюджет, ₽', `<input id="${pre}-budget" name="budget" type="text" inputmode="numeric" autocomplete="off" aria-describedby="${pre}-budget-hint">`)}
  </div>` },
  { key: 'buyout', name: 'Выкуп', desc: 'Выкупаем любые легковые автомобили', fields: (pre) => `<div class="form-row">
    ${field(`${pre}-sell`, 'Ваш автомобиль', `<input id="${pre}-sell" name="sell_car" type="text" autocomplete="off" placeholder="Марка, модель" aria-describedby="${pre}-sell-hint">`)}
    ${field(`${pre}-sy`, 'Год и пробег', `<input id="${pre}-sy" name="sell_year" type="text" autocomplete="off" placeholder="2018, 90 000 км" aria-describedby="${pre}-sy-hint">`)}
  </div>` },
];

const services = (p, { keys = null, h = 'Обмен, кредит, заказ и&nbsp;выкуп', hTag = 'h2' } = {}) => {
  const list = keys ? SERVICES.filter((s) => keys.includes(s.key)) : SERVICES;
  return `<section class="sec svc-sec" id="services" aria-labelledby="svc-h">
  <div class="wrap svc">
    <div class="svc-side">
      <${hTag} class="h-sec" id="svc-h" data-rv>${h}</${hTag}>
      <p class="sec-lead" data-rv>Выберите, что нужно, и&nbsp;оставьте телефон. Менеджер перезвонит и&nbsp;всё обсудит.</p>
      <div class="svc-tabs" role="tablist" aria-label="Тип заявки" aria-orientation="vertical" data-tabs>
        ${list.map((s, i) => `<button class="svc-tab" type="button" role="tab" id="tab-${s.key}" aria-controls="panel-${s.key}" aria-selected="${i === 0}"${i ? ' tabindex="-1"' : ''}>
          <span class="svc-name">${s.name}</span><span class="svc-desc">${s.desc}</span>
        </button>`).join('\n        ')}
        <span class="svc-ind" aria-hidden="true"></span>
      </div>
    </div>
    <div class="bezel svc-bezel" data-rv>
      <form class="form bezel-core" data-form novalidate>
        <input type="hidden" name="type" value="${list[0].name}" data-type>
        ${list.map((s, i) => `<div class="panel" role="tabpanel" id="panel-${s.key}" aria-labelledby="tab-${s.key}" data-type-value="${s.name}"${i ? ' hidden' : ''}>
          <p class="panel-title">${s.name}: ${s.desc.charAt(0).toLowerCase() + s.desc.slice(1)}</p>
          ${s.fields('s' + i)}
        </div>`).join('\n        ')}
        <div class="form-row">${nameField('s')}${phoneField('s')}</div>
        ${formFoot(p, 's', 'Отправить заявку')}
      </form>
    </div>
  </div>
</section>`;
};

// order-from-abroad form: first screen of the home page and the order page
const orderForm = (p, pre, hTag = 'h2') => `<aside class="bezel hero-order" aria-labelledby="${pre}-order-h">
      <form class="form bezel-core" data-form novalidate>
        <input type="hidden" name="type" value="Под заказ">
        <div class="order-head">
          <${hTag} class="order-h" id="${pre}-order-h">Под заказ со&nbsp;всего мира</${hTag}>
          <p class="order-lead">Нет нужной машины в&nbsp;наличии? Привезём под ваш запрос.</p>
        </div>
        ${field(`${pre}-look`, 'Какой автомобиль ищете', `<input id="${pre}-look" name="looking_for" type="text" autocomplete="off" placeholder="Марка, модель, год" aria-describedby="${pre}-look-hint">`)}
        <div class="form-row">
          ${field(`${pre}-budget`, 'Бюджет, ₽', `<input id="${pre}-budget" name="budget" type="text" inputmode="numeric" autocomplete="off" aria-describedby="${pre}-budget-hint">`)}
          ${phoneField(pre)}
        </div>
        ${formFoot(p, pre, 'Оформить заказ')}
      </form>
    </aside>`;

// ---------- blocks ----------
const card = (p, c, { h = 'h3', eager = false } = {}) => `<li class="card" data-rv data-price="${c.price_rub}" data-year="${c.year}" data-km="${c.mileage_km}" data-make="${esc(c.make)}" data-fuel="${esc(c.fuel)}" data-slug="${c.slug}">
  <a class="card-a" href="${p}${carUrl(c)}" data-car>
    <span class="card-photo">${pic(p, c.photos[0], `${c.title}, ${c.year}`, { sizes: '(min-width: 1100px) 420px, (min-width: 700px) 46vw, 92vw', attrs: eager ? 'decoding="async"' : 'loading="lazy" decoding="async"' })}<span class="card-count" aria-hidden="true">${c.photos.length} фото</span></span>
    <span class="card-body">
      <${h} class="card-name">${esc(c.title)}</${h}>
      <span class="card-price">${price(c)}</span>
      <span class="card-meta">${esc(metaLine(c))}</span>
    </span>
  </a>
</li>`;

const place = (p) => `<section class="sec place-sec" aria-labelledby="place-h">
  <div class="wrap place">
    <div class="place-main">
      <h2 class="h-sec" id="place-h" data-rv>Площадка у&nbsp;трассы</h2>
      <address class="place-addr" data-rv>${SITE.street}<span>${SITE.place}</span></address>
      <div class="actions" data-rv>
        <a class="btn btn-line" href="${p}contacts.html">Контакты и&nbsp;карта</a>
        <a class="btn btn-quiet" href="${SITE.yandexOrg}" rel="noopener">Открыть в&nbsp;Яндекс Картах${I.out}</a>
      </div>
    </div>
    <dl class="facts" data-rv>
      <div><dt>Режим</dt><dd>${SITE.hours}</dd></div>
      <div><dt>Телефон</dt><dd><a href="${SITE.phoneHref}">${SITE.phone}</a></dd></div>
      <div><dt>Telegram</dt><dd><a href="${SITE.tgChat}">Написать менеджеру</a></dd></div>
      <div><dt>Канал с&nbsp;машинами</dt><dd><a href="${SITE.tgChannel}">${SITE.tgChannelName}</a></dd></div>
    </dl>
  </div>
</section>`;

// ---------- pages ----------
function indexPage() {
  const p = '';
  const n = cars.length;
  const slides = cars.map((c, i) => {
    const [make, model] = splitTitle(c);
    return `<article class="slide${i === 0 ? ' is-active' : ''}${i <= 1 || i === n - 1 ? ' is-near' : ''}" role="group" aria-roledescription="слайд" aria-label="${i + 1} из ${n}: ${esc(c.title)}" data-price="${c.price_rub}" data-km="${c.mileage_km}" data-title="${esc(c.title)}"${i ? ' inert' : ''}>
      <a class="slide-photo" href="${carUrl(c)}" tabindex="-1" aria-hidden="true">${pic(p, c.side, '', { sizes: '(min-width: 1000px) 60vw, 100vw', attrs: i === 0 ? 'fetchpriority="high" decoding="async"' : 'loading="lazy" decoding="async"' })}</a>
      <div class="slide-text">
        <hgroup class="slide-name">
          ${make ? `<p class="slide-make"><span class="ln"><span>${esc(make)}</span></span></p>` : ''}
          <h2 class="slide-model"><a href="${carUrl(c)}"><span class="ln"><span>${esc(model)}</span></span></a></h2>
        </hgroup>
        <p class="slide-price">${odo(c.price_rub, 8, '₽')}<span class="vh">${price(c)}</span></p>
        <dl class="slide-specs">
          <div><dt>Год</dt><dd>${c.year}</dd></div>
          <div><dt>Пробег</dt><dd>${odo(c.mileage_km, 6, 'км')}<span class="vh">${km(c.mileage_km)}</span></dd></div>
          <div><dt>Двигатель</dt><dd>${esc(c.engine_short)}</dd></div>
        </dl>
        <div class="slide-act">
          <a class="btn btn-line slide-cta" href="${carUrl(c)}">Смотреть автомобиль</a>
          <span class="slide-photos">${c.photos.length} фото кузова и&nbsp;салона</span>
        </div>
      </div>
    </article>`;
  }).join('\n    ');

  // each tile flips through its own interior shots (picked by eye: no exterior, headlight or boot frames)
  const details = !SHOW_INTERIOR ? [] : [
    ['porsche-cayenne-coupe-2025', ['19', '18', '12', '11', '13'], 'Салон Porsche Cayenne Coupe'],
    ['bmw-z4-2009', ['11', '10', '17', '12'], 'Салон BMW Z4 с красной отделкой'],
    ['bmw-x5-2020', ['14', '11', '24', '15', '12'], 'Кожаные кресла BMW X5'],
    ['bmw-x6-2023', ['13', '21', '12', '15', '18'], 'Место водителя BMW X6'],
  ].map(([slug, ks, alt]) => {
    const c = cars.find((x) => x.slug === slug);
    if (!c) return null;
    const phs = ks.map((k) => c.photos.find((x) => x.tg === k)).filter(Boolean);
    return { c, phs, alt };
  }).filter(Boolean);
  const minP = Math.min(...cars.map((c) => c.price_rub));
  const maxP = Math.max(...cars.map((c) => c.price_rub));

  const body = `<section class="hero" aria-labelledby="hero-h">
  <img class="hero-logo" src="img/logo/logo.svg" alt="" width="2199" height="673" fetchpriority="high">
  <div class="wrap hero-in">
    <div class="hero-main">
    <h1 class="hero-h" id="hero-h">Наш автосалон БАЙКАРС продаёт автомобили с&nbsp;пробегом на&nbsp;своей площадке в&nbsp;Грушевской.</h1>
    <p class="hero-text">Ваш автомобиль мы примем в&nbsp;обмен, покупку поможем оформить в&nbsp;кредит, а&nbsp;машину, которой нет в&nbsp;наличии, привезём под заказ со&nbsp;всего мира. Ещё мы выкупаем легковые автомобили.</p>
    <div class="actions">
      <a class="btn btn-gold btn-lg" href="${SITE.tgChat}">${ic(I.tg)}<span>Написать в&nbsp;Telegram</span></a>
      <a class="btn btn-line btn-lg" href="${SITE.phoneHref}">${ic(I.phone)}<span>${SITE.phone}</span></a>
    </div>
    </div>
    ${orderForm(p, 'h')}
  </div>
</section>

<section class="stage" aria-roledescription="карусель" aria-label="Автомобили в наличии, от самого дорогого" data-stage>
  <div class="wrap stage-in">
    <div class="slides" aria-live="off" data-slides>
    ${slides}
    </div>
    <div class="stage-ctrl">
      <ol class="segs" aria-label="Выбор автомобиля">
        ${cars.map((c, i) => { const [mk, md] = splitTitle(c); return `<li><button class="seg${i === 0 ? ' is-active' : ''}" type="button" data-go="${i}"${i === 0 ? ' aria-current="true"' : ''}><span class="seg-bar"><span class="seg-fill"></span></span>${mk ? `<span class="vh">${esc(mk)} </span>` : ''}<span class="seg-name">${esc(md)}</span></button></li>`; }).join('\n        ')}
      </ol>
      <p class="stage-count" aria-hidden="true"><span data-count>1</span><span class="stage-of">из ${n}</span></p>
    </div>
  </div>
</section>

<section class="sec stock-sec" aria-labelledby="stock-h">
  <div class="wrap">
    <div class="sec-head">
      <h2 class="h-sec" id="stock-h" data-rv>В наличии</h2>
    </div>
    <div class="all-cta" data-rv><a class="btn btn-gold btn-lg all-btn" href="catalog.html">Смотреть весь каталог<span class="all-n">${n} автомобилей</span></a></div>
    <div class="tiers" data-rv>
    ${[['Премиум', 'от 5 млн ₽', (c) => c.price_rub >= 5e6], ['Средний класс', 'от 2 до 5 млн ₽', (c) => c.price_rub >= 2e6 && c.price_rub < 5e6], ['Бюджет', 'до 2 млн ₽', (c) => c.price_rub < 2e6]].map(([name, range, fit]) => `<div class="tier">
      <h3 class="tier-h"><span>${name}</span><small>${range}</small></h3>
      <div class="tier-win" data-ticker>
      <ul class="tier-cars">
      ${cars.filter(fit).sort((a, b) => b.price_rub - a.price_rub).map((c) => `<li>
        <a class="tc" href="${carUrl(c)}" data-car>
          <span class="tc-photo">${pic(p, c.photos[0], '', { sizes: '(min-width: 1000px) 28vw, 76vw' })}</span>
          <span class="tc-name">${esc(c.title)}</span>
          <span class="tc-meta"><b><span class="vh">Год </span>${c.year}</b> <i aria-hidden="true">·</i> <b><span class="vh">Пробег </span>${km(c.mileage_km)}</b> <i aria-hidden="true">·</i> <b><span class="vh">Двигатель </span>${esc(c.engine_short)}</b></span>
          <span class="tc-price">${price(c)}</span>
        </a>
      </li>`).join(String.fromCharCode(10))}
      </ul>
      </div>
    </div>`).join(String.fromCharCode(10))}
    </div>
  </div>
</section>

${details.length ? `<section class="sec detail-sec" aria-labelledby="detail-h">
  <div class="wrap">
    <div class="sec-head">
      <h2 class="h-sec" id="detail-h" data-rv>Фото салона</h2>
    </div>
    <ul class="details">
      ${details.map(({ c, phs, alt }, i) => `<li class="detail" data-rv style="--rv:${i}">
        <a href="${carUrl(c)}">
          <span class="detail-photo" data-flip>${phs.map((ph, k) => pic(p, ph, k ? '' : alt, { sizes: '(min-width: 1000px) 56vw, 80vw', attrs: `loading="lazy" decoding="async"${k ? ' aria-hidden="true"' : ' class="is-on"'}` })).join('')}</span>
          <span class="detail-cap"><span>${esc(c.title)}, ${c.year}</span><span class="detail-price">${price(c)}</span></span>
        </a>
      </li>`).join('\n      ')}
    </ul>
  </div>
</section>` : ''}

${services(p)}

${place(p)}`;
  return page({ p, title: 'БАЙКАРС: автомобили с пробегом у Новочеркасского шоссе', description: `Автомобили с пробегом в наличии и под заказ: Porsche, BMW, Mercedes-Benz, Lexus, Tesla и другие. Обмен, кредит, выкуп. ${SITE.street}, ст. Грушевская.`, current: 'home', body, cls: 'p-home', ld: dealerLd });
}

function catalogPage() {
  const p = '';
  const makes = [...new Set(cars.map((c) => c.make))].sort((a, b) => a.localeCompare(b));
  const fuels = [...new Set(cars.map((c) => c.fuel))];
  const chip = (name, value, label, checked) => `<label class="chip"><input type="radio" name="${name}" value="${value}"${checked ? ' checked' : ''}><span>${label}</span></label>`;
  // slider bounds: cheapest and dearest car, rounded out to 100 000
  const STEP = 50000;
  const lo = Math.floor(Math.min(...cars.map((c) => c.price_rub)) / 1e5) * 1e5;
  const hi = Math.ceil(Math.max(...cars.map((c) => c.price_rub)) / 1e5) * 1e5;
  const body = `<div class="wrap page-head">
  <h1 class="h-page">Каталог</h1>
  <p class="sec-lead">${cars.length} автомобилей на&nbsp;площадке. Наличие и&nbsp;цену лучше уточнить у&nbsp;менеджера перед приездом.</p>
</div>
<div class="wrap">
  <form class="filters" data-filters aria-label="Фильтр автомобилей">
    <fieldset class="f-group">
      <legend>Цена</legend>
      <div class="chips">
        ${chip('band', 'all', 'Любая', true)}${chip('band', 'lt2', 'До 2 млн', false)}${chip('band', '2to5', 'От 2 до 5 млн', false)}${chip('band', 'gt5', 'От 5 млн', false)}
      </div>
      <div class="p-range" data-range data-lo="${lo}" data-hi="${hi}">
        <div class="p-fields">
          <label class="p-field"><span>от</span><input type="text" inputmode="numeric" name="pmin" value="${groups(lo)}" autocomplete="off" aria-label="Цена от, рублей"><span aria-hidden="true">₽</span></label>
          <label class="p-field"><span>до</span><input type="text" inputmode="numeric" name="pmax" value="${groups(hi)}" autocomplete="off" aria-label="Цена до, рублей"><span aria-hidden="true">₽</span></label>
        </div>
        <div class="p-track">
          <span class="p-fill" data-fill></span>
          <input type="range" min="${lo}" max="${hi}" step="${STEP}" value="${lo}" data-r="min" aria-label="Минимальная цена">
          <input type="range" min="${lo}" max="${hi}" step="${STEP}" value="${hi}" data-r="max" aria-label="Максимальная цена">
        </div>
      </div>
    </fieldset>
    <fieldset class="f-group">
      <legend>Топливо</legend>
      <div class="chips">
        ${chip('fuel', 'all', 'Любое', true)}${fuels.map((f) => chip('fuel', f, f[0].toUpperCase() + f.slice(1), false)).join('')}
      </div>
    </fieldset>
    <div class="f-selects">
      <div class="f-sel">
        <label for="f-make">Марка</label>
        <select id="f-make" name="make"><option value="all">Все марки</option>${makes.map((m) => `<option value="${esc(m)}">${esc(m)}</option>`).join('')}</select>
      </div>
      <div class="f-sel">
        <label for="f-sort">Порядок</label>
        <select id="f-sort" name="sort">
          <option value="price-desc">Сначала дороже</option>
          <option value="price-asc">Сначала дешевле</option>
          <option value="year-desc">Сначала новее</option>
          <option value="km-asc">С меньшим пробегом</option>
        </select>
      </div>
    </div>
    <div class="f-foot">
      <p class="f-count" role="status" aria-live="polite" data-count>Показаны все ${cars.length} автомобилей</p>
      <button class="btn btn-quiet btn-sm" type="reset" data-reset hidden>Сбросить фильтр</button>
    </div>
  </form>
  <ul class="grid" data-grid>
    ${cars.map((c, i) => card(p, c, { h: 'h2', eager: i < 3 })).join('\n    ')}
  </ul>
  <div class="empty" data-empty hidden>
    <p class="empty-title">Под эти условия машин сейчас нет</p>
    <p>Сбросьте фильтр или оставьте заявку на&nbsp;подбор: привезём автомобиль под заказ со&nbsp;всего мира.</p>
    <div class="actions">
      <button class="btn btn-line" type="button" data-reset-2>Сбросить фильтр</button>
      <a class="btn btn-gold" href="order.html" data-order-link>Заявка на&nbsp;подбор</a>
    </div>
  </div>
</div>
${place(p)}`;
  return page({ p, title: 'Каталог автомобилей, БАЙКАРС', description: 'Все автомобили на площадке БАЙКАРС: цены, год, пробег, двигатель и фотографии. Фильтр по цене, марке и топливу.', current: 'catalog', body, cls: 'p-catalog' });
}

function carPage(c, idx) {
  const p = '../';
  const prev = cars[idx - 1];
  const next = cars[idx + 1];
  const others = cars.filter((x) => x !== c)
    .map((x) => ({ x, d: Math.abs(Math.log(x.price_rub / c.price_rub)) }))
    .sort((a, b) => a.d - b.d).slice(0, 3).map((o) => o.x)
    .sort((a, b) => b.price_rub - a.price_rub);
  const specs = [
    ['Год выпуска', String(c.year)],
    ['Пробег', km(c.mileage_km)],
    ['Объём двигателя', spec(c, 'Объём')],
    ['Топливо', spec(c, 'Топливо')],
    ['Мощность', spec(c, 'Мощность')],
  ].filter(([, v]) => v);
  const nPh = c.photos.length;
  const body = `<div class="wrap">
  <nav class="crumbs" aria-label="Навигация по сайту"><a href="${p}catalog.html">Каталог</a><span aria-hidden="true">/</span><span aria-current="page">${esc(c.title)}</span></nav>
</div>
<div class="wrap car">
  <div class="gal" data-gal aria-roledescription="галерея" aria-label="Фотографии ${esc(c.title)}">
    <div class="gal-stage">
      <ul class="gal-track" data-track tabindex="0" aria-label="Фото, листайте влево и вправо">
        ${c.photos.map((ph, i) => `<li class="gal-item" aria-label="Фото ${i + 1} из ${nPh}"${i === 0 ? ' data-first' : ''}>${pic(p, ph, `${c.title}, ${c.year}, фото ${i + 1}`, { sizes: '(min-width: 1100px) 780px, 100vw', attrs: i === 0 ? 'fetchpriority="high" decoding="async"' : 'loading="lazy" decoding="async"' })}</li>`).join('\n        ')}
      </ul>
      <button class="icon-btn gal-btn gal-prev" type="button" data-gprev>${I.prev}<span class="vh">Предыдущее фото</span></button>
      <button class="icon-btn gal-btn gal-next" type="button" data-gnext>${I.next}<span class="vh">Следующее фото</span></button>
      <p class="gal-count" aria-hidden="true"><span data-gcount>1</span><span class="gal-of">из ${nPh}</span></p>
    </div>
    <ul class="thumbs" aria-label="Все фото">
      ${c.photos.map((ph, i) => `<li><button class="thumb" type="button" data-gi="${i}"${i === 0 ? ' aria-current="true"' : ''}>${pic(p, ph, '', { thumbOnly: true })}<span class="vh">Фото ${i + 1}</span></button></li>`).join('')}
    </ul>
  </div>
  <div class="car-info">
    <div class="bezel sticker">
      <div class="bezel-core">
        <h1 class="car-name">${esc(c.title)}</h1>
        <p class="car-sub">${c.year}${NB}год, ${esc(c.engine_short)}</p>
        <p class="car-price">${odo(c.price_rub, 8, '₽', ' data-roll')}<span class="vh">${price(c)}</span></p>
        <dl class="specs">
          ${specs.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('\n          ')}
        </dl>
        <div class="actions car-actions">
          <a class="btn btn-gold btn-lg" href="${SITE.tgChat}">${ic(I.tg)}<span>Написать в&nbsp;Telegram</span></a>
          <a class="btn btn-line btn-lg" href="${SITE.phoneHref}">${ic(I.phone)}<span>Позвонить</span></a>
        </div>
        <ul class="perks">
          <li>${I.check}<span>Возможен обмен на&nbsp;ваш автомобиль</span></li>
          <li>${I.check}<span>Доступна продажа в&nbsp;кредит</span></li>
        </ul>
      </div>
    </div>
    <a class="link-view" href="#viewing">Записаться на&nbsp;осмотр</a>
  </div>
</div>

<section class="sec view-sec" id="viewing" aria-labelledby="view-h">
  <div class="wrap viewing">
    <div>
      <h2 class="h-sec" id="view-h" data-rv>Посмотреть вживую</h2>
      <p class="sec-lead" data-rv>Оставьте телефон, менеджер перезвонит и&nbsp;договорится о&nbsp;времени. Площадка: ${SITE.street}, ст.${NB}Грушевская. ${SITE.hours}.</p>
    </div>
    <div class="bezel" data-rv>
      <form class="form bezel-core" data-form novalidate>
        <input type="hidden" name="car" value="${esc(c.title)}, ${c.year}">
        <input type="hidden" name="type" value="Осмотр">
        <p class="panel-title">${esc(c.title)}, ${c.year}, ${price(c)}</p>
        <div class="form-row">${nameField('v')}${phoneField('v')}</div>
        ${field('v-time', 'Когда удобно приехать', '<input id="v-time" name="time" type="text" autocomplete="off" placeholder="Например, в субботу днём" aria-describedby="v-time-hint">')}
        ${field('v-msg', 'Вопрос менеджеру', '<textarea id="v-msg" name="message" rows="3" aria-describedby="v-msg-hint"></textarea>')}
        ${formFoot(p, 'v', 'Записаться на осмотр')}
      </form>
    </div>
  </div>
</section>

<nav class="wrap pager" aria-label="Соседние автомобили">
  ${prev ? `<a class="pager-a pager-prev" href="${p}${carUrl(prev)}">${I.prev}<span><small>Дороже</small>${esc(prev.title)}, ${prev.year}</span></a>` : '<span></span>'}
  ${next ? `<a class="pager-a pager-next" href="${p}${carUrl(next)}"><span><small>Дешевле</small>${esc(next.title)}, ${next.year}</span>${I.next}</a>` : '<span></span>'}
</nav>

<section class="sec more-sec" aria-labelledby="more-h">
  <div class="wrap">
    <div class="sec-head">
      <h2 class="h-sec" id="more-h" data-rv>Похожие по&nbsp;цене</h2>
      <a class="btn btn-quiet sec-more" href="${p}catalog.html" data-rv>Весь каталог</a>
    </div>
    <ul class="grid">
      ${others.map((o) => card(p, o)).join('\n      ')}
    </ul>
  </div>
</section>`;
  const ld = {
    '@context': 'https://schema.org', '@type': 'Car', name: `${c.title} ${c.year}`, brand: { '@type': 'Brand', name: c.make },
    modelDate: String(c.year), vehicleModelDate: String(c.year),
    mileageFromOdometer: { '@type': 'QuantitativeValue', value: c.mileage_km, unitCode: 'KMT' },
    offers: { '@type': 'Offer', price: c.price_rub, priceCurrency: 'RUB', availability: 'https://schema.org/InStock', seller: { '@type': 'AutoDealer', name: 'БАЙКАРС (BuyCars Group)', telephone: '+79044444535' } },
  };
  return page({ p, title: `${c.title}, ${c.year}: ${price(c)}, БАЙКАРС`, description: `${c.title}, ${c.year} год, пробег ${km(c.mileage_km)}, ${c.engine_short}. Цена ${price(c)}. Обмен и кредит. ${SITE.street}, ст. Грушевская.`, current: 'catalog', body, cls: 'p-car', ld });
}

function contactsPage() {
  const p = '';
  const body = `<div class="wrap page-head">
  <h1 class="h-page">Контакты</h1>
</div>
<div class="wrap contacts">
  <div class="c-main">
    <a class="c-phone" href="${SITE.phoneHref}">${SITE.phone}</a>
    <div class="actions">
      <a class="btn btn-gold btn-lg" href="${SITE.tgChat}">${ic(I.tg)}<span>Написать в&nbsp;Telegram</span></a>
      <a class="btn btn-line btn-lg" href="${SITE.phoneHref}">${ic(I.phone)}<span>Позвонить</span></a>
    </div>
    <dl class="facts c-facts">
      <div><dt>Адрес</dt><dd>${SITE.street}<br>${SITE.place}</dd></div>
      <div><dt>Режим</dt><dd>${SITE.hours}</dd></div>
      <div><dt>Канал с&nbsp;машинами</dt><dd><a href="${SITE.tgChannel}">${SITE.tgChannelName}</a></dd></div>
    </dl>
  </div>
  <div class="bezel map-bezel">
    <div class="map bezel-core">
      <iframe src="${SITE.yandexWidget}" title="Карта: площадка БАЙКАРС на Новочеркасском шоссе" loading="lazy" allowfullscreen></iframe>
    </div>
  </div>
</div>
${services(p)}`;
  return page({ p, title: 'Контакты БАЙКАРС: адрес, телефон, Telegram', description: `${SITE.street}, ${SITE.place}. Телефон ${SITE.phone}. ${SITE.hours}.`, current: 'contacts', body, cls: 'p-contacts', ld: dealerLd });
}

function tradePage() {
  const p = '';
  const body = services(p, { keys: ['trade', 'credit', 'buyout'], h: 'Обмен, кредит и&nbsp;выкуп', hTag: 'h1' }) + `
<section class="sec" aria-label="Автомобили на площадке">
  <div class="wrap page-cta">
    <p class="sec-lead">Выбрать автомобиль для обмена или кредита можно в&nbsp;каталоге: там все машины на&nbsp;площадке с&nbsp;ценами и&nbsp;фото.</p>
    <a class="btn btn-gold btn-lg" href="catalog.html">Открыть каталог</a>
  </div>
</section>`;
  return page({ p, title: 'Обмен, кредит и выкуп, БАЙКАРС', description: `Обмен вашего автомобиля в зачёт покупки, автомобили с пробегом в кредит и выкуп легковых автомобилей. ${SITE.street}, ст. Грушевская.`, current: 'trade', body, cls: 'p-trade' });
}

function orderPage() {
  const p = '';
  const body = `<section class="hero order-page" aria-labelledby="order-page-h">
  <div class="wrap hero-in">
    <div class="hero-main">
      <h1 class="hero-h" id="order-page-h">Автомобили под заказ со&nbsp;всего мира</h1>
      <p class="hero-text">Если нужной машины нет в&nbsp;наличии, БАЙКАРС привезёт её под заказ. Напишите марку, модель и&nbsp;бюджет, менеджер перезвонит и&nbsp;всё обсудит.</p>
      <div class="actions">
        <a class="btn btn-gold btn-lg" href="${SITE.tgChat}">${ic(I.tg)}<span>Написать в&nbsp;Telegram</span></a>
        <a class="btn btn-line btn-lg" href="${SITE.phoneHref}">${ic(I.phone)}<span>${SITE.phone}</span></a>
      </div>
    </div>
    ${orderForm(p, 'o')}
  </div>
</section>
<section class="sec" aria-label="Автомобили на площадке">
  <div class="wrap page-cta">
    <p class="sec-lead">Возможно, подходящая машина уже стоит на&nbsp;площадке.</p>
    <a class="btn btn-line btn-lg" href="catalog.html">Смотреть каталог</a>
  </div>
</section>`;
  return page({ p, title: 'Автомобили под заказ со всего мира, БАЙКАРС', description: `Привезём автомобиль под заказ со всего мира под ваш запрос и бюджет. ${SITE.street}, ст. Грушевская.`, current: 'order', body, cls: 'p-order' });
}

function privacyPage() {
  const p = '';
  const body = `<div class="wrap prose">
  <h1 class="h-page">Политика обработки персональных данных</h1>
  <p class="slot" data-slot="operator"><b>Оператор персональных данных.</b> Здесь будут указаны наименование или ФИО оператора, ИНН, ОГРН (ОГРНИП) и адрес. Заполняет владелец сайта.</p>
  <h2>Какие данные мы получаем</h2>
  <p>Имя и номер телефона, а&nbsp;также сведения об автомобиле, удобном времени и вопросы, которые вы сами указываете в&nbsp;заявке.</p>
  <h2>Зачем</h2>
  <p>Чтобы связаться с&nbsp;вами и&nbsp;ответить на&nbsp;заявку: показ автомобиля, обмен, кредит, подбор под заказ или выкуп.</p>
  <h2>Основание</h2>
  <p>Ваше согласие, которое вы даёте, отмечая галочку в&nbsp;форме перед отправкой заявки.</p>
  <h2>Сколько храним</h2>
  <p>До окончания работы с&nbsp;заявкой или до&nbsp;отзыва согласия. Отозвать согласие можно по&nbsp;телефону <a href="${SITE.phoneHref}">${SITE.phone}</a>.</p>
  <h2>Кому передаём</h2>
  <p>Никому, кроме случаев, предусмотренных законом.</p>
  <h2>Счётчики, куки и сторонние сервисы</h2>
  <p>Сайт не&nbsp;использует счётчики посещаемости и&nbsp;рекламные куки. Шрифты загружаются с&nbsp;этого же сайта. На&nbsp;странице контактов встроена карта Яндекса; при её загрузке Яндекс может получать технические данные о&nbsp;посещении в&nbsp;соответствии со&nbsp;своей политикой.</p>
</div>`;
  return page({ p, title: 'Политика обработки персональных данных, БАЙКАРС', description: 'Как БАЙКАРС обрабатывает данные из заявок на сайте.', body, cls: 'p-privacy' });
}

function notFoundPage() {
  const p = '';
  const body = `<div class="wrap page-head nf">
  <h1 class="h-page">Такой страницы нет</h1>
  <p class="sec-lead">Возможно, автомобиль уже продан и&nbsp;его страница удалена. Посмотрите, что есть на&nbsp;площадке сейчас.</p>
  <div class="actions">
    <a class="btn btn-gold" href="catalog.html">Открыть каталог</a>
    <a class="btn btn-line" href="index.html">На главную</a>
  </div>
</div>`;
  return page({ p, title: 'Страница не найдена, БАЙКАРС', description: 'Страница не найдена.', body, cls: 'p-404' });
}

// ---------- write ----------
const out = (rel, html) => { const f = join(ROOT, rel); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, html); };
if (existsSync(join(ROOT, 'cars'))) for (const f of readdirSync(join(ROOT, 'cars'))) rmSync(join(ROOT, 'cars', f));
out('index.html', indexPage());
out('catalog.html', catalogPage());
out('contacts.html', contactsPage());
out('trade.html', tradePage());
out('order.html', orderPage());
out('privacy.html', privacyPage());
out('404.html', notFoundPage());
cars.forEach((c, i) => out(carUrl(c), carPage(c, i)));
console.log(`built: ${cars.length} cars, ${cars.length + 7} pages, logo: ${logoFile || 'text wordmark'}`);
