// Собирает статический сайт БАЙКАРС из data/cars.json.
// Запуск: node sites/buycars/_build/build.mjs
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CSS_V = 2;

const SITE = {
  name: 'БАЙКАРС',
  phone: '+7 904 444-45-35',
  phoneHref: 'tel:+79044444535',
  tgChat: 'https://t.me/+79044444535',
  tgChannel: 'https://t.me/buycars7777',
  tgChannelName: '@buycars7777',
  address: 'Новочеркасское шоссе, 1Д',
  addressPlace: 'станица Грушевская, Аксайский район, Ростовская область',
  hours: 'Без перерывов и выходных',
  yandexOrg: 'https://yandex.ru/maps/org/buycars_group/227042726764/',
  yandexWidget: 'https://yandex.ru/map-widget/v1/org/buycars_group/227042726764/?z=16',
};

const cars = JSON.parse(readFileSync(join(ROOT, 'data/cars.json'), 'utf8'))
  .sort((a, b) => (b.price_rub ?? 0) - (a.price_rub ?? 0));

// ---------- helpers ----------
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const nbsp = ' ';
const groups = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, nbsp);
const price = (c) => (c.price_rub ? `${groups(c.price_rub)}${nbsp}₽` : null);
const km = (n) => `${groups(n)}${nbsp}км`;

function jpegSize(file) {
  const b = readFileSync(file);
  let i = 2;
  while (i < b.length) {
    if (b[i] !== 0xff) { i++; continue; }
    const m = b[i + 1];
    const len = b.readUInt16BE(i + 2);
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
      return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
    }
    i += 2 + len;
  }
  return { w: 1280, h: 960 };
}
const sizeCache = new Map();
const dims = (src) => {
  if (!sizeCache.has(src)) sizeCache.set(src, jpegSize(join(ROOT, src)));
  return sizeCache.get(src);
};
const img = (p, src, alt, extra = '') => {
  const { w, h } = dims(src);
  return `<img src="${p}${src}" width="${w}" height="${h}" alt="${esc(alt)}" ${extra}>`;
};

const icon = {
  tg: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.4 4.3 2.9 11.4c-1.3.5-1.2 1.2-.2 1.5l4.7 1.5 1.8 5.6c.2.6.4.8.8.8.4 0 .6-.2.9-.5l2.3-2.2 4.7 3.5c.9.5 1.5.2 1.7-.8l3.1-14.6c.3-1.3-.5-1.9-1.4-1.5ZM9.6 14.2l8.6-5.4c.4-.3.8-.1.5.2l-7.1 6.4-.3 3.2-1.7-4.4Z"/></svg>',
  phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" d="M5 3.5h3.2l1.6 4.2-2.1 1.4a11 11 0 0 0 5.2 5.2l1.4-2.1 4.2 1.6V17a2.5 2.5 0 0 1-2.7 2.5C9.6 19 5 14.4 4.5 6.2A2.5 2.5 0 0 1 5 3.5Z"/></svg>',
  menu: '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" d="M4 8h16M4 16h16"/></svg>',
  prev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" d="M15 5l-7 7 7 7"/></svg>',
  next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>',
  pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" d="M9 6v12M15 6v12"/></svg>',
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" d="M8 5.5v13l10.5-6.5z"/></svg>',
};

const LOGO = JSON.parse(readFileSync(join(ROOT, '_build/logo-paths.json'), 'utf8'));
const logo = (p, id) => `<a class="logo" href="${p}index.html" aria-label="БАЙКАРС, на главную">
  <svg viewBox="${LOGO.viewBox}" role="img" aria-label="Логотип БАЙКАРС">
    <defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${LOGO.markX0}" x2="${LOGO.markX1}" y1="0" y2="0"><stop class="logo-stop-a" offset="0"/><stop class="logo-stop-b" offset="1"/></linearGradient></defs>
    <path fill="url(#${id})" fill-rule="evenodd" d="${LOGO.mark}"/>
    <path class="logo-word" fill-rule="evenodd" d="${LOGO.word}"/>
  </svg>
</a>`;

const nav = (p, current) => {
  const link = (href, label, key) => `<li><a href="${p}${href}"${current === key ? ' aria-current="page"' : ''}>${label}</a></li>`;
  return `<header class="nav" data-nav>
  <div class="container nav-in">
    ${logo(p, 'lg-n')}
    <ul class="nav-links" id="nav-links">
      ${link('catalog.html', 'Каталог', 'catalog')}
      ${link('index.html#deals', 'Обмен и кредит', 'deals')}
      ${link('contacts.html', 'Контакты', 'contacts')}
    </ul>
    <div class="nav-end">
      <a class="nav-phone" href="${SITE.phoneHref}">${SITE.phone}</a>
      <a class="btn btn-primary" href="${SITE.tgChat}">${icon.tg}Написать</a>
      <button class="nav-toggle" type="button" aria-controls="nav-links" aria-expanded="false" aria-label="Меню">${icon.menu}</button>
    </div>
  </div>
</header>`;
};

const footer = (p) => `<footer class="footer">
  <div class="container footer-in">
    ${logo(p, 'lg-f')}
    <div class="footer-cols">
      <p><b>Площадка</b>${SITE.address}<br>${SITE.addressPlace}</p>
      <p><b>Связь</b><a href="${SITE.phoneHref}">${SITE.phone}</a><br><a href="${SITE.tgChat}">Написать в Telegram</a></p>
      <p><b>Машины в канале</b><a href="${SITE.tgChannel}">${SITE.tgChannelName}</a><br>${SITE.hours.toLowerCase()}</p>
    </div>
    <div class="footer-base">
      <span>БАЙКАРС, продажа автомобилей с пробегом</span>
      <a href="${p}privacy.html">Политика обработки персональных данных</a>
    </div>
  </div>
</footer>
<nav class="dock" aria-label="Быстрая связь">
  <a class="btn btn-ghost" href="${SITE.phoneHref}">${icon.phone}Позвонить</a>
  <a class="btn btn-primary" href="${SITE.tgChat}">${icon.tg}Telegram</a>
</nav>`;

const page = ({ p = '', title, description, current, body }) => `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="theme-color" content="#1f2230">
<!-- avoid-ai-design-ignore-file: K7 (focus-visible styles live in style.css and base.css) -->
<link rel="preload" href="${p}fonts/Prata-cyrillic.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${p}fonts/Jost-cyrillic.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${p}style.css?v=${CSS_V}">
<script>document.documentElement.classList.add('js')</script>
</head>
<body>
${nav(p, current)}
<main>
${body}
</main>
${footer(p)}
<script src="${p}site.js?v=${CSS_V}" defer></script>
</body>
</html>
`;

const carUrl = (c) => `cars/${c.slug}.html`;
const metaList = (c) => {
  const items = [c.year && `${c.year}${nbsp}г.`, c.mileage_km != null && km(c.mileage_km), c.engine_short].filter(Boolean);
  return `<ul class="car-meta">${items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
};
const card = (p, c, i, { reveal = true, heading = 'h3', eager = false } = {}) => `<article class="car" data-price="${c.price_rub ?? 0}" data-year="${c.year ?? 0}" data-make="${esc(c.make)}" data-band="${band(c)}"${reveal ? ` data-reveal style="--i:${i % 3}"` : ''}>
  <a class="car-link" href="${p}${carUrl(c)}">
    <figure class="car-photo" data-vt>${img(p, c.photos[0], `${c.title}, ${c.year ?? ''}`, eager ? 'fetchpriority="high" decoding="async"' : 'loading="lazy" decoding="async"')}</figure>
    <div class="car-body">
      <${heading} class="car-title">${esc(c.title)}</${heading}>
      ${price(c) ? `<p class="car-price">${price(c)}</p>` : '<p class="car-price is-ask">Цену уточните у менеджера</p>'}
      ${metaList(c)}
    </div>
  </a>
</article>`;

const band = (c) => !c.price_rub ? 'ask' : c.price_rub < 2_000_000 ? 'lt2' : c.price_rub < 5_000_000 ? '2to5' : 'gt5';

const carOptions = () => cars.map((c) => `<option value="${esc(c.title)}">${esc(c.title)}${c.year ? `, ${c.year}` : ''}</option>`).join('');

const field = (id, label, input) => `<div class="field"><label for="${id}">${label}</label>${input}<p class="field-hint" id="${id}-hint"></p></div>`;
const nameField = (pre) => field(`${pre}-name`, 'Как к вам обращаться', `<input id="${pre}-name" name="name" type="text" autocomplete="given-name" aria-describedby="${pre}-name-hint">`);
const phoneField = (pre) => field(`${pre}-phone`, 'Телефон', `<input id="${pre}-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" required aria-describedby="${pre}-phone-hint" placeholder="+7">`);
const formFoot = (p, label) => `<div class="form-foot">
  <button class="btn btn-primary" type="submit">${label}</button>
  <p class="form-note">Отправляя заявку, вы соглашаетесь на <a href="${p}privacy.html">обработку персональных данных</a>.</p>
</div>
<p class="form-status" role="status" aria-live="polite"></p>`;

const deals = (p) => `<section class="section" id="deals" aria-labelledby="deals-h">
  <div class="container deals">
    <div class="deals-intro" data-reveal>
      <h2 id="deals-h">Обмен, кредит, заказ и выкуп</h2>
      <ul class="deal-list">
        <li><b>Обмен</b><span>Ваш автомобиль в зачёт покупки.</span></li>
        <li><b>Кредит</b><span>Любую машину с площадки можно взять в кредит.</span></li>
        <li><b>Под заказ</b><span>Привезём автомобиль со всего мира.</span></li>
        <li><b>Выкуп</b><span>Выкупаем любые легковые автомобили.</span></li>
      </ul>
    </div>
    <form class="form deals-form" data-form data-endpoint="" novalidate data-reveal style="--i:1">
      <div class="tabs" role="tablist" aria-label="Тип заявки">
        <button class="tab" type="button" role="tab" id="t-trade" aria-controls="p-trade" aria-selected="true">Обмен</button>
        <button class="tab" type="button" role="tab" id="t-credit" aria-controls="p-credit" aria-selected="false" tabindex="-1">Кредит</button>
        <button class="tab" type="button" role="tab" id="t-order" aria-controls="p-order" aria-selected="false" tabindex="-1">Под заказ</button>
        <button class="tab" type="button" role="tab" id="t-buyout" aria-controls="p-buyout" aria-selected="false" tabindex="-1">Выкуп</button>
      </div>
      <input type="hidden" name="type" value="Обмен" data-type>
      <div class="panel form" role="tabpanel" id="p-trade" aria-labelledby="t-trade" data-type-value="Обмен">
        <div class="form-row">
          ${field('d-own', 'Ваш автомобиль', '<input id="d-own" name="own_car" type="text" autocomplete="off" placeholder="Марка, модель, год" aria-describedby="d-own-hint">')}
          ${field('d-want', 'Что смотрите у нас', `<select id="d-want" name="want_car" aria-describedby="d-want-hint"><option value="">Пока не выбрал</option>${carOptions()}</select>`)}
        </div>
      </div>
      <div class="panel form" role="tabpanel" id="p-credit" aria-labelledby="t-credit" data-type-value="Кредит" hidden>
        <div class="form-row">
          ${field('d-ccar', 'Какая машина', `<select id="d-ccar" name="credit_car" aria-describedby="d-ccar-hint"><option value="">Пока не выбрал</option>${carOptions()}</select>`)}
          ${field('d-first', 'Первый взнос, ₽', '<input id="d-first" name="first_payment" type="text" inputmode="numeric" autocomplete="off" aria-describedby="d-first-hint">')}
        </div>
      </div>
      <div class="panel form" role="tabpanel" id="p-order" aria-labelledby="t-order" data-type-value="Под заказ" hidden>
        <div class="form-row">
          ${field('d-look', 'Какую машину ищете', '<input id="d-look" name="looking_for" type="text" autocomplete="off" placeholder="Марка, модель, год" aria-describedby="d-look-hint">')}
          ${field('d-budget', 'Бюджет, ₽', '<input id="d-budget" name="budget" type="text" inputmode="numeric" autocomplete="off" aria-describedby="d-budget-hint">')}
        </div>
      </div>
      <div class="panel form" role="tabpanel" id="p-buyout" aria-labelledby="t-buyout" data-type-value="Выкуп" hidden>
        <div class="form-row">
          ${field('d-sell', 'Ваш автомобиль', '<input id="d-sell" name="sell_car" type="text" autocomplete="off" placeholder="Марка, модель" aria-describedby="d-sell-hint">')}
          ${field('d-sell-y', 'Год и пробег', '<input id="d-sell-y" name="sell_year" type="text" autocomplete="off" placeholder="2018, 90 000 км" aria-describedby="d-sell-y-hint">')}
        </div>
      </div>
      <div class="form-row">${nameField('d')}${phoneField('d')}</div>
      ${formFoot(p, 'Отправить заявку')}
    </form>
  </div>
</section>`;

const lot = (p, headingLevel = 'h2', withHead = true) => `<section class="section${withHead ? '' : ' section-tight'}" id="lot" aria-labelledby="lot-h">
  <div class="container lot">
    <div class="lot-facts" data-reveal>
      ${withHead ? `<${headingLevel} id="lot-h">Площадка у трассы</${headingLevel}>` : `<${headingLevel} id="lot-h" class="visually-hidden">Адрес и связь</${headingLevel}>`}
      <address class="lot-address">${SITE.address}<br>ст. Грушевская</address>
      <dl class="facts">
        <div><dt>Режим</dt><dd>${SITE.hours}</dd></div>
        <div><dt>Телефон</dt><dd><a href="${SITE.phoneHref}">${SITE.phone}</a></dd></div>
        <div><dt>Telegram</dt><dd><a href="${SITE.tgChat}">Написать менеджеру</a></dd></div>
        <div><dt>Канал</dt><dd><a href="${SITE.tgChannel}">${SITE.tgChannelName}</a></dd></div>
      </dl>
      <div class="actions"><a class="btn btn-ghost" href="${SITE.yandexOrg}">Открыть в Яндекс Картах</a></div>
    </div>
    <div class="map" data-map="${SITE.yandexWidget}" data-reveal style="--i:1">
      <div class="map-load">
        <p>Карта загружается с сервера Яндекса только по нажатию, чтобы не передавать ему ваши данные без спроса.</p>
        <button class="btn btn-ghost" type="button" data-map-load>Показать карту</button>
      </div>
    </div>
  </div>
</section>`;

// ---------- pages ----------
function indexPage() {
  const p = '';
  const body = `<section class="hero" aria-labelledby="hero-h">
  <div class="container hero-head">
    <h1 id="hero-h">Автомобили в наличии на&nbsp;Новочеркасском шоссе</h1>
    <div class="hero-side">
      <p class="lede">Смотрите вживую, меняйте свою или берите в&nbsp;кредит. Без выходных.</p>
      <div class="actions">
        <a class="btn btn-primary" href="${SITE.tgChat}">${icon.tg}Написать в Telegram</a>
        <a class="btn btn-ghost" href="${SITE.phoneHref}">${icon.phone}Позвонить</a>
      </div>
    </div>
  </div>
  <div class="showroom" data-showroom aria-roledescription="carousel" aria-label="Машины на площадке" style="--autoplay: 6000ms">
    <div class="container">
      <div class="show-stage" data-stage>
        ${cars.map((c, i) => `<article class="slide${i === 0 ? ' is-active' : ''}" data-slide aria-roledescription="slide" aria-label="${i + 1} из ${cars.length}">
          <a class="slide-link" href="${carUrl(c)}">
            <span class="slide-name"><strong>${esc(c.title)}</strong><span>${[c.year && `${c.year}${nbsp}г.`, c.mileage_km != null && km(c.mileage_km), c.engine_short].filter(Boolean).join('<br>')}</span></span>
            <figure class="slide-photo" data-vt>${img(p, c.hero || c.photos[0], `${c.title} на площадке БАЙКАРС`, i === 0 ? 'fetchpriority="high" decoding="async"' : 'loading="lazy" decoding="async"')}</figure>
            <span class="slide-price">${price(c) ? `<strong>${price(c)}</strong>` : '<strong class="is-ask">Цену уточните у менеджера</strong>'}<span class="slide-more">Смотреть машину</span></span>
          </a>
        </article>`).join(String.fromCharCode(10))}
      </div>
      <div class="show-bar">
        <div class="show-ctrl">
          <button class="round" type="button" data-prev aria-label="Предыдущая машина">${icon.prev}</button>
          <button class="round" type="button" data-toggle aria-pressed="false" aria-label="Пауза"><span data-icon="pause">${icon.pause}</span><span data-icon="play" hidden>${icon.play}</span></button>
          <button class="round" type="button" data-next aria-label="Следующая машина">${icon.next}</button>
        </div>
        <ol class="thumbs-row">
          ${cars.map((c, i) => `<li><button class="show-thumb" type="button" data-thumb="${i}" aria-label="${esc(c.title)}"${i === 0 ? ' aria-current="true"' : ''}>${img(p, c.photos[0], '', 'loading="lazy" decoding="async"')}</button></li>`).join('')}
        </ol>
        <a class="link show-all" href="catalog.html">Весь каталог</a>
      </div>
    </div>
  </div>
</section>


<div class="band">${deals(p)}</div>

${lot(p)}`;
  return page({ p, title: 'БАЙКАРС: автомобили с пробегом на Новочеркасском шоссе', description: `Автомобили с пробегом в наличии и под заказ, обмен, кредит и выкуп. ${SITE.address}, ст. Грушевская.`, current: 'home', body });
}

function catalogPage() {
  const p = '';
  const bands = [['all', 'Все'], ['gt5', 'От 5 млн'], ['2to5', 'От 2 до 5 млн'], ['lt2', 'До 2 млн']]
    .filter(([k]) => k === 'all' || cars.some((c) => band(c) === k));
  const body = `<div class="container">
  <div class="page-head">
    <h1>Каталог автомобилей</h1>
    <p class="lede">${cars.length} машин на площадке. Наличие и цену уточняйте у менеджера: машины уходят быстро.</p>
  </div>
  <div class="filters" role="group" aria-label="Цена">
    ${bands.map(([k, l], i) => `<button class="tab" type="button" data-filter="${k}" aria-pressed="${i === 0}">${l}</button>`).join('')}
  </div>
  <div class="catalog-grid" data-catalog>
    ${cars.map((c, i) => card(p, c, i, { heading: 'h2', eager: i < 3 })).join('\n')}
  </div>
  <p class="catalog-empty" data-empty hidden>В этом диапазоне сейчас машин нет. Напишите нам, подберём под заказ.</p>
</div>
${lot(p)}`;
  return page({ p, title: 'Каталог автомобилей БАЙКАРС', description: 'Все автомобили на площадке БАЙКАРС: цены, год, пробег и фото.', current: 'catalog', body });
}

function carPage(c, idx) {
  const p = '../';
  const others = cars.filter((x) => x !== c).slice(0, 3);
  const specs = [
    ['Год', c.year && `${c.year}`],
    ['Пробег', c.mileage_km != null && km(c.mileage_km)],
    ['Двигатель', c.engine],
    ...(c.specs_extra || []),
  ].filter(([, v]) => v);
  const body = `<div class="container">
  <p class="crumbs"><a href="${p}catalog.html">Каталог</a> / ${esc(c.title)}</p>
  <div class="car-page">
    <div class="gallery" data-gallery>
      <figure class="gallery-main" style="view-transition-name: car-photo">
        ${img(p, c.photos[0], `${c.title}, фото 1`, 'fetchpriority="high" decoding="async" data-main')}
      </figure>
      ${c.photos.length > 1 ? `<ul class="thumbs">${c.photos.map((src, i) => `<li><button class="thumb" type="button" data-src="${p}${src}" aria-label="Фото ${i + 1}"${i === 0 ? ' aria-current="true"' : ''}>${img(p, src, '', 'loading="lazy" decoding="async"')}</button></li>`).join('')}</ul>` : ''}
    </div>
    <div class="car-aside">
      <h1>${esc(c.title)}</h1>
      ${price(c) ? `<p class="price-big">${price(c)}</p>` : '<p class="price-ask">Цену уточните у менеджера</p>'}
      <div class="actions">
        <a class="btn btn-primary" href="${SITE.tgChat}">${icon.tg}Написать</a>
        <a class="btn btn-ghost" href="${SITE.phoneHref}">${icon.phone}Позвонить</a>
      </div>
      <dl class="specs">${specs.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
      <ul class="perks"><li>Возможен обмен на ваш автомобиль</li><li>Доступна продажа в кредит</li></ul>
    </div>
  </div>
</div>

<section class="section" aria-labelledby="req-h">
  <div class="container request">
    <div data-reveal>
      <h2 id="req-h">Посмотреть вживую</h2>
      <p class="lede">Оставьте телефон, менеджер перезвонит и договорится о времени.</p>
    </div>
    <form class="form" data-form data-endpoint="" novalidate data-reveal style="--i:1">
      <input type="hidden" name="car" value="${esc(c.title)}${c.year ? `, ${c.year}` : ''}">
      <div class="form-row">${nameField('r')}${phoneField('r')}</div>
      ${field('r-msg', 'Вопрос или удобное время', '<textarea id="r-msg" name="message" aria-describedby="r-msg-hint"></textarea>')}
      ${formFoot(p, 'Записаться на осмотр')}
    </form>
  </div>
</section>

<section class="section" aria-labelledby="more-h">
  <div class="container">
    <div class="section-head"><h2 id="more-h">Ещё на площадке</h2><a class="link" href="${p}catalog.html">Весь каталог</a></div>
    <div class="more-grid">${others.map((o, i) => card(p, o, i)).join('\n')}</div>
  </div>
</section>`;
  const desc = [c.year && `${c.year} год`, c.mileage_km != null && `пробег ${groups(c.mileage_km)} км`, price(c)].filter(Boolean).join(', ');
  return page({ p, title: `${c.title}${c.year ? `, ${c.year}` : ''}, БАЙКАРС`, description: `${c.title}: ${desc}. Обмен и кредит.`, current: 'catalog', body });
}

function contactsPage() {
  const p = '';
  const body = `<div class="container contact-hero">
  <h1>Приезжайте на площадку в Грушевской</h1>
  <div class="actions">
    <a class="btn btn-primary" href="${SITE.tgChat}">${icon.tg}Написать в Telegram</a>
    <a class="btn btn-ghost" href="${SITE.phoneHref}">${icon.phone}${SITE.phone}</a>
  </div>
</div>
${lot(p, 'h2', false)}`;
  return page({ p, title: 'Контакты БАЙКАРС: адрес, телефон, Telegram', description: `${SITE.address}, ${SITE.addressPlace}. ${SITE.phone}.`, current: 'contacts', body });
}

function privacyPage() {
  const p = '';
  const body = `<div class="container prose">
  <h1>Политика обработки персональных данных</h1>
  <p>Оператор персональных данных: <span class="fill" data-fill="operator">наименование и ИНН оператора будут указаны владельцем</span>.</p>
  <h2>Какие данные мы получаем</h2>
  <p>Имя и номер телефона, а также сведения об автомобиле, которые вы сами указываете в заявке.</p>
  <h2>Зачем</h2>
  <p>Чтобы перезвонить вам и ответить на заявку: показ автомобиля, обмен, кредит, подбор под заказ или выкуп.</p>
  <h2>Сколько храним</h2>
  <p>До окончания работы с заявкой или до отзыва согласия. Отозвать согласие можно по телефону <a href="${SITE.phoneHref}">${SITE.phone}</a>.</p>
  <h2>Кому передаём</h2>
  <p>Никому, кроме случаев, предусмотренных законом. Сайт не использует счётчики и рекламные куки. Карта Яндекса загружается только по вашему нажатию.</p>
</div>`;
  return page({ p, title: 'Политика обработки персональных данных, БАЙКАРС', description: 'Как БАЙКАРС обрабатывает данные из заявок на сайте.', current: '', body });
}

// ---------- write ----------
const out = (rel, html) => { const f = join(ROOT, rel); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, html); };
if (existsSync(join(ROOT, 'cars'))) for (const f of readdirSync(join(ROOT, 'cars'))) rmSync(join(ROOT, 'cars', f));
out('index.html', indexPage());
out('catalog.html', catalogPage());
out('contacts.html', contactsPage());
out('privacy.html', privacyPage());
cars.forEach((c, i) => out(carUrl(c), carPage(c, i)));
console.log(`built: ${cars.length} cars, ${cars.length + 4} pages`);
