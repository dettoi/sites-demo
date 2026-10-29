(function () {
/* Запись онлайн — прототип. Ядро: данные, помощники. */
'use strict';
const B = window.BUSINESS;
const CFG = Object.assign({ busy: 0.35, step: 30, periods: true }, window.APP_CONFIG || {});
const KEY = 'proto:fd:' + B.slug + ':';
const store = {
  get(k, d) { try { const v = localStorage.getItem(KEY + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(KEY + k, JSON.stringify(v)); } catch (e) { /* без хранилища работаем в памяти */ } },
  del(k) { try { localStorage.removeItem(KEY + k); } catch (e) { /* ничего */ } }
};
const sess = {
  get(k) { try { return sessionStorage.getItem(KEY + k); } catch (e) { return null; } },
  set(k, v) { try { sessionStorage.setItem(KEY + k, v); } catch (e) { /* ничего */ } },
  del(k) { try { sessionStorage.removeItem(KEY + k); } catch (e) { /* ничего */ } }
};

const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const NB = ' ';

/* ---------- иконки (контуры Lucide, встроены без CDN) ---------- */
const ICONS = {
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  route: '<polygon points="3 11 22 2 13 21 11 13 3 11"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  cal: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  plus: '<path d="M5 12h14M12 5v14"/>',
  minus: '<path d="M5 12h14"/>',
  trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  out: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  down: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  car: '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  tag: '<path d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4z"/><circle cx="7.5" cy="7.5" r=".5"/>',
  mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  drop: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>'
};
function icon(name, cls) {
  const filled = name === 'star';
  return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" width="20" height="20" fill="' + (filled ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="' + (filled ? 1.2 : 2) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + (ICONS[name] || '') + '</svg>';
}

/* ---------- форматы ---------- */
function num(n) {
  if (n == null) return '';
  const s = Number(n).toLocaleString('ru-RU', { maximumFractionDigits: 1 });
  return s.replace(/ | | /g, NB);
}
function rub(n) { return num(n) + NB + '₽'; }
function priceLabel(s) {
  if (s.price == null) return s.priceNote ? 'по тарифу' : 'по запросу';
  const unit = s.priceUnit ? s.priceUnit.replace('₽', '') : '';
  return (s.priceFrom ? 'от' + NB : '') + num(s.price) + NB + '₽' + unit;
}
function durLabel(min, stub) {
  const h = Math.floor(min / 60), m = min % 60;
  let t;
  t = (h ? h + NB + 'ч' : '') + (h && m ? ' ' : '') + (m ? m + NB + 'мин' : '');
  return (stub ? 'около' + NB : '') + t;
}
function plural(n, f) {
  const a = Math.abs(n) % 100, b = a % 10;
  if (a > 10 && a < 20) return f[2];
  if (b > 1 && b < 5) return f[1];
  if (b === 1) return f[0];
  return f[2];
}
function ratingText(r) { return Number(r).toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 }); }
function reviewsText() { return B.reviewsCount + NB + plural(B.reviewsCount, ['отзыв', 'отзыва', 'отзывов']); }
function stars(n, cls) {
  let s = '<span class="stars ' + (cls || '') + '" role="img" aria-label="Оценка ' + n + ' из 5">';
  for (let i = 1; i <= 5; i++) s += icon('star', i <= Math.round(n) ? 'on' : 'off');
  return s + '</span>';
}
function photo(f) { return '../../../tenants/' + B.slug + '/' + f; }
function digits(p) { return String(p || '').replace(/\D/g, ''); }
function phoneFmt(p) {
  const d = digits(p);
  if (d.length === 11) return '+7 ' + d.slice(1, 4) + ' ' + d.slice(4, 7) + '-' + d.slice(7, 9) + '-' + d.slice(9);
  return p;
}
function telHref(p) { return 'tel:+' + digits(p).replace(/^8/, '7'); }
function routeHref() { return 'https://yandex.ru/maps/?rtext=~' + B.point.lat + ',' + B.point.lon + '&rtt=auto'; }
function mapHref() { return 'https://yandex.ru/maps/?pt=' + B.point.lon + ',' + B.point.lat + '&z=17&l=map'; }
const MAIN_PHONE = (B.contacts.phones || [])[0] || null;

const isAutoNiche = ['автомойка', 'детейлинг', 'автосервис', 'тонировка'].indexOf(B.niche) >= 0;
const isPetNiche = B.niche === 'груминг';
const EXTRA = isAutoNiche
  ? { key: 'car', label: 'Марка и модель машины', ph: 'Например, Kia Rio', err: 'Укажите марку и модель машины', ic: 'car' }
  : isPetNiche ? { key: 'car', label: 'Кличка и порода', ph: 'Например, Бусинка, той-терьер', err: 'Укажите кличку и породу', ic: 'user' } : null;

/* ---------- услуги (можно править в кабинете) ---------- */
function loadServices() {
  const saved = store.get('services', null);
  const src = saved && saved.length ? saved : B.services.map((s) => Object.assign({}, s));
  src.forEach((s, i) => { if (!s.id) s.id = 's' + i; });
  return src;
}
let SERVICES = loadServices();
function svcById(id) { return SERVICES.find((s) => s.id === id) || null; }
function mainService() { return SERVICES[0]; }
function groupByCat() {
  const out = [];
  SERVICES.forEach((s) => {
    let g = out.find((x) => x.cat === s.category);
    if (!g) { g = { cat: s.category, items: [] }; out.push(g); }
    g.items.push(s);
  });
  return out;
}
function bookHref(id) { return '#/book' + (id ? '?s=' + encodeURIComponent(id) : ''); }

/* ---------- график работы ---------- */
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_SHORT = { Mon: 'Пн', Tue: 'Вт', Wed: 'Ср', Thu: 'Чт', Fri: 'Пт', Sat: 'Сб', Sun: 'Вс' };
const DAY_FULL = { Mon: 'Понедельник', Tue: 'Вторник', Wed: 'Среда', Thu: 'Четверг', Fri: 'Пятница', Sat: 'Суббота', Sun: 'Воскресенье' };
const JS_DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
function toMin(t) { const p = String(t).split(':'); return (+p[0]) * 60 + (+p[1] || 0); }
function fmtMin(m) { const h = Math.floor(m / 60), mm = m % 60; return (h < 10 ? '0' : '') + h + ':' + (mm < 10 ? '0' : '') + mm; }
function loadSchedule() {
  const saved = store.get('schedule', null);
  if (saved) return saved;
  const out = {};
  DAYS.forEach((d) => {
    const w = B.schedule[d] && B.schedule[d].working_hours && B.schedule[d].working_hours[0];
    out[d] = w ? { on: true, from: toMin(w.from), to: toMin(w.to) } : { on: false, from: 600, to: 1080 };
  });
  return out;
}
let SCHED = loadSchedule();
const is247 = () => DAYS.every((d) => SCHED[d].on && SCHED[d].from === 0 && SCHED[d].to === 1440);
function hoursLines() {
  if (is247()) return ['Круглосуточно, без выходных'];
  const lines = [];
  let i = 0;
  while (i < 7) {
    const d = SCHED[DAYS[i]];
    let j = i;
    while (j + 1 < 7 && SCHED[DAYS[j + 1]].on === d.on && (!d.on || (SCHED[DAYS[j + 1]].from === d.from && SCHED[DAYS[j + 1]].to === d.to))) j++;
    const days = i === 0 && j === 6 ? 'Ежедневно' : (i === j ? DAY_SHORT[DAYS[i]] : DAY_SHORT[DAYS[i]] + '–' + DAY_SHORT[DAYS[j]]);
    lines.push(days + ' ' + (d.on ? fmtMin(d.from) + '–' + fmtMin(d.to) : 'выходной'));
    i = j + 1;
  }
  return lines;
}
function hoursOf(date) { return SCHED[JS_DAY[date.getDay()]]; }

/* ---------- даты и слоты ---------- */
function pad(n) { return (n < 10 ? '0' : '') + n; }
function dkey(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
function fromKey(k) { const p = k.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
function addDays(d, n) { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); return x; }
const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const WD = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
const WD_FULL = ['воскресенье', 'понедельник', 'вторник', 'среду', 'четверг', 'пятницу', 'субботу'];
function dateLabel(d) { return d.getDate() + NB + MONTHS[d.getMonth()]; }
function dateLong(d) { return WD[d.getDay()] + ', ' + dateLabel(d); }
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  h ^= h >>> 16; h = Math.imul(h, 2246822507); h ^= h >>> 13; h = Math.imul(h, 3266489909); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
function nowMin() { const n = new Date(); return n.getHours() * 60 + n.getMinutes(); }
function userBookings() { return store.get('bookings', []).filter((b) => b.status !== 'cancel'); }
function slotsFor(date, svc) {
  const h = hoursOf(date);
  if (!h || !h.on) return [];
  const dur = svc.durationMin || 30;
  const key = dkey(date);
  const today = key === dkey(new Date());
  const mine = userBookings().filter((b) => b.date === key && b.time != null);
  const out = [];
  for (let t = h.from; t + dur <= h.to; t += CFG.step) {
    if (today && t < nowMin() + 30) continue;
    const taken = hash(B.slug + key + t) < CFG.busy || mine.some((b) => t < b.time + b.dur && t + dur > b.time);
    out.push({ t, busy: taken });
  }
  return out;
}
function periodOf(t) {
  if (t < 360) return 'Ночь';
  if (t < 720) return 'Утро';
  if (t < 1080) return 'День';
  return 'Вечер';
}

/* ---------- телефон: маска +7 ---------- */
function maskPhone(v) {
  let d = digits(v);
  if (d[0] === '8') d = '7' + d.slice(1);
  if (d[0] !== '7') d = '7' + d;
  d = d.slice(0, 11);
  let s = '+7';
  if (d.length > 1) s += ' (' + d.slice(1, 4);
  if (d.length >= 5) s += ') ' + d.slice(4, 7);
  if (d.length >= 8) s += '-' + d.slice(7, 9);
  if (d.length >= 10) s += '-' + d.slice(9, 11);
  return d.length <= 1 ? '' : s;
}
const phoneOk = (v) => digits(v).length === 11;

/* ---------- ссылки на контакты (только то, что есть в данных) ---------- */
function contactLinks() {
  const c = B.contacts || {};
  const out = [];
  (c.phones || []).forEach((p) => out.push({ key: 'phone', label: phoneFmt(p), href: telHref(p), icon: 'phone' }));
  if (c.whatsapp) out.push({ key: 'wa', label: 'WhatsApp', href: c.whatsapp, icon: 'chat', ext: true });
  if (c.telegram) out.push({ key: 'tg', label: 'Telegram', href: c.telegram, icon: 'send', ext: true });
  if (c.vk) out.push({ key: 'vk', label: 'ВКонтакте', href: c.vk, icon: 'globe', ext: true });
  if (c.max) out.push({ key: 'max', label: 'MAX', href: c.max, icon: 'chat', ext: true });
  if (c.website) out.push({ key: 'web', label: 'Сайт', href: c.website, icon: 'globe', ext: true });
  if (c.email) out.push({ key: 'mail', label: c.email, href: 'mailto:' + c.email, icon: 'mail' });
  return out;
}
function linkAttrs(l) { return l.ext ? ' target="_blank" rel="noopener noreferrer"' : ''; }

/* ---------- уведомление ---------- */
let toastTimer = 0;
function toast(msg) {
  const t = $('#toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
}

/* ====================== главная: Ads studio ====================== */
const HERO_FILE = 'photos-2gis/owner-16.jpg';
function homeHTML() {
  const m = mainService();
  const links = contactLinks();
  const allNull = SERVICES.every((s) => s.price == null);
  const cats = groupByCat();
  const featured = B.reviews[0];
  const rest = B.reviews.slice(1);

  const header = '<header class="top"><a class="top__mark" href="#/" aria-label="' + esc(B.name) + ', на главную">' + esc(B.name) + '</a>' +
    '<nav class="top__nav" aria-label="Разделы"><a href="#/" data-scroll="works">Работы и услуги</a><a href="#/" data-scroll="gallery">Фото</a><a href="#/" data-scroll="reviews">Отзывы</a><a href="#/" data-scroll="visit">Как найти</a></nav>' +
    (MAIN_PHONE ? '<a class="top__tel" href="' + telHref(MAIN_PHONE) + '" aria-label="Позвонить ' + esc(phoneFmt(MAIN_PHONE)) + '">' + icon('phone') + '<span>' + esc(phoneFmt(MAIN_PHONE)) + '</span></a>' : '') + '</header>';

  const hero = '<section class="hero dark"><div class="hero__lights" aria-hidden="true"><i></i><i></i><i></i></div>' +
    '<div class="hero__txt"><p class="hero__rate">' + stars(B.rating) + '<b>' + ratingText(B.rating) + '</b><span>' + reviewsText() + '</span></p>' +
    '<h1>' + esc(B.name) + '</h1>' +
    '<p class="hero__sub">Детейлинг, защитная плёнка, тонировка и установка электроники. ' + esc(B.city) + ', ' + esc(B.address) + '.</p>' +
    '<div class="hero__cta"><a class="btn btn--primary" href="#/book">' + icon('cal') + 'Записаться</a>' +
    (MAIN_PHONE ? '<a class="btn btn--glass" href="' + telHref(MAIN_PHONE) + '">' + icon('phone') + 'Позвонить</a>' : '') + '</div>' +
    '<a class="hero__main" href="' + bookHref(m.id) + '"><span>Главная услуга</span><b>' + esc(m.name) + '</b><span>' + (m.price == null ? 'цена по запросу' : priceLabel(m)) + ', ' + durLabel(m.durationMin, m.durationStub) + '</span></a></div>' +
    '<figure class="hero__photo"><img src="' + photo(HERO_FILE) + '" alt="Красный автомобиль в боксе студии после тонировки стёкол" width="1080" height="1350" fetchpriority="high"></figure></section>';

  let works = '<section class="works" id="works"><div class="wrap"><div class="sec-head"><h2>Что делаем</h2><p>' +
    (allNull ? 'Цены — по запросу. Выберите работу и время, а стоимость назовём по телефону или в чате.' : 'Выберите работу, чтобы записаться.') + '</p></div><div class="cats">';
  cats.forEach((g, gi) => {
    works += '<details class="cat"' + (gi === 0 ? ' open' : '') + '><summary><span class="cat__n">' + esc(g.cat) + '</span><span class="cat__c">' + g.items.length + ' ' + plural(g.items.length, ['работа', 'работы', 'работ']) + '</span><span class="cat__chev" aria-hidden="true">' + icon('right') + '</span></summary><ul class="cat__list">';
    g.items.forEach((s) => {
      works += '<li><a class="work" href="' + bookHref(s.id) + '"><span class="work__main"><span class="work__n">' + esc(s.name) + '</span><span class="work__m">' + durLabel(s.durationMin, s.durationStub) + (s.price != null ? ' · ' + priceLabel(s) : '') + '</span></span>' +
        '<span class="work__go' + (s.long ? ' is-req' : '') + '">' + (s.long ? 'Заявка' : 'Выбрать время') + '</span></a></li>';
    });
    works += '</ul></details>';
  });
  works += '</div></div></section>';

  let gal = '<section class="gallery" id="gallery"><div class="wrap"><div class="sec-head"><h2>Наши работы</h2><p>Фото из студии. Нажмите, чтобы открыть крупно.</p></div></div><ul class="rail" tabindex="0" aria-label="Фото работ, листайте в сторону">';
  PHOTOS.forEach((p, i) => {
    gal += '<li><button type="button" class="shot" data-open-lb="' + i + '" aria-label="Открыть фото ' + (i + 1) + ' из ' + PHOTOS.length + '"><img src="' + photo(p.file) + '" alt="' + esc(altOf(p)) + '" loading="lazy" decoding="async" width="1080" height="1350"></button></li>';
  });
  gal += '</ul></section>';

  let rev = '<section class="reviews dark" id="reviews"><div class="wrap rev__grid"><div class="rev__side"><h2>Отзывы</h2><p class="rev__score"><b>' + ratingText(B.rating) + '</b>' + stars(B.rating) + '<span>' + reviewsText() + '</span></p></div>' +
    '<div class="rev__list"><figure class="rq rq--big"><blockquote>' + esc(featured.text) + '</blockquote><figcaption>' + esc(featured.author) + '</figcaption></figure>';
  rest.forEach((r) => { rev += '<figure class="rq"><blockquote>' + esc(r.text) + '</blockquote><figcaption>' + esc(r.author) + '</figcaption></figure>'; });
  rev += '</div></div></section>';

  const visit = '<section class="visit" id="visit"><div class="wrap visit__grid"><div><h2>Как нас найти</h2>' +
    '<p class="visit__line">' + icon('pin') + '<span>' + esc(B.city) + ', ' + esc(B.address) + '</span></p>' +
    '<div class="visit__line">' + icon('clock') + '<div>' + hoursLines().map((l) => '<p>' + esc(l) + '</p>').join('') + '</div></div>' +
    '<div class="visit__btns"><a class="btn btn--primary" href="' + routeHref() + '" target="_blank" rel="noopener noreferrer">' + icon('route') + 'Построить маршрут</a><a class="btn btn--ghost" href="' + mapHref() + '" target="_blank" rel="noopener noreferrer">Показать на карте</a></div></div>' +
    '<div><h2>Связаться</h2><ul class="contacts">' + links.map((l) => '<li><a class="contact" href="' + esc(l.href) + '"' + linkAttrs(l) + '>' + icon(l.icon) + '<span>' + esc(l.label) + '</span></a></li>').join('') + '</ul></div></div></section>';

  const foot = '<footer class="foot dark"><div class="wrap"><p><b>' + esc(B.name) + '</b>, ' + esc(B.city) + '</p><p>Демо-версия приложения для онлайн-записи.</p></div></footer>';
  return header + hero + works + gal + rev + visit + foot;
}

/* ====================== запись: нижний лист на 3 шага ====================== */
const PHOTOS = B.photos || [];
const ALT = { work: 'Пример работы', result: 'Результат работы', interior: 'Интерьер', facade: 'Вид снаружи', team: 'Мастер за работой' };
function altOf(p) { return (ALT[p.kind] || 'Фото') + ' — ' + B.name; }

const sheet = $('#sheet');
let bk = null;
function freshBooking() {
  return { step: 1, svc: null, date: null, time: null, name: '', phone: '', car: '', agree: false, done: null, askCancel: false };
}
function firstFreeDay(svc) {
  const t0 = new Date();
  for (let i = 0; i < 7; i++) {
    const d = addDays(t0, i);
    if (svc.long ? (hoursOf(d) && hoursOf(d).on) : slotsFor(d, svc).some((s) => !s.busy)) return dkey(d);
  }
  return dkey(t0);
}
function openSheet(svcId, fresh) {
  if (!bk || fresh) bk = freshBooking();
  const s = svcId && svcById(svcId);
  if (s && !bk.done) {
    if (bk.svc !== s.id) { bk.svc = s.id; bk.date = s.long ? null : firstFreeDay(s); bk.time = null; }
    if (bk.step === 1) bk.step = 2;
  }
  renderSheet();
  if (!sheet.open) { sheet.showModal(); document.documentElement.classList.add('lock'); }
  const h = $('#sheet-title', sheet);
  if (h) h.focus({ preventScroll: true });
}
function closeSheetEl() {
  if (sheet.open) sheet.close();
  document.documentElement.classList.remove('lock');
}
sheet.addEventListener('close', () => {
  document.documentElement.classList.remove('lock');
  if (location.hash.indexOf('#/book') === 0) location.hash = '#/';
});
sheet.addEventListener('click', (e) => { if (e.target === sheet) closeSheetEl2(); });
function closeSheetEl2() { location.hash = '#/'; }

function whenText() {
  const s = svcById(bk.svc);
  if (!s) return '';
  if (s.long) return bk.date ? 'Удобный день: ' + dateLong(fromKey(bk.date)) : 'Мастер перезвонит и согласует время';
  return dateLong(fromKey(bk.date)) + ', ' + fmtMin(bk.time) + '–' + fmtMin(bk.time + (s.durationMin || 30));
}

function optHTML(s) {
  const sel = bk.svc === s.id;
  const meta = [priceLabel(s), durLabel(s.durationMin, s.durationStub)].join(' · ');
  return '<button type="button" class="opt" role="radio" aria-checked="' + sel + '" data-act="pick-svc" data-id="' + esc(s.id) + '">' +
    '<span class="opt__main"><span class="opt__name">' + esc(s.name) + '</span><span class="opt__meta">' + meta + '</span></span>' +
    (s.long ? '<span class="opt__tag">Заявка</span>' : '') +
    '<span class="opt__mark" aria-hidden="true">' + icon('check') + '</span></button>';
}

function step1HTML() {
  let h = '<div class="groups" role="radiogroup" aria-label="Услуга">';
  groupByCat().forEach((g) => {
    h += '<section class="group"><h3 class="group__t">' + esc(g.cat) + '</h3><div class="opts">' + g.items.map(optHTML).join('') + '</div></section>';
  });
  return h + '</div><p class="field__err" id="err-svc" role="alert"></p>';
}

function daysStrip(svc, optional) {
  const t0 = new Date();
  let h = '<div class="days" role="group" aria-label="День">';
  if (optional) h += '<button type="button" class="day day--any" aria-pressed="' + (!bk.date) + '" data-act="pick-date" data-d=""><span class="day__n">Любой</span><span class="day__wd">день</span></button>';
  for (let i = 0; i < 7; i++) {
    const d = addDays(t0, i);
    const open = hoursOf(d) && hoursOf(d).on;
    const free = svc.long ? open : slotsFor(d, svc).some((s) => !s.busy);
    const k = dkey(d);
    h += '<button type="button" class="day" aria-pressed="' + (bk.date === k) + '" data-act="pick-date" data-d="' + k + '"' + (free ? '' : ' disabled') + ' aria-label="' + esc(dateLong(d)) + (free ? '' : ', нет мест') + '">' +
      '<span class="day__wd">' + (i === 0 ? 'сегодня' : WD[d.getDay()]) + '</span><span class="day__n">' + d.getDate() + '</span><span class="day__m">' + MONTHS[d.getMonth()].slice(0, 3) + '</span></button>';
  }
  return h + '</div>';
}

function slotBtn(sl) {
  return '<button type="button" class="slot' + (sl.busy ? ' is-busy' : '') + '" aria-pressed="' + (bk.time === sl.t) + '" data-act="pick-slot" data-t="' + sl.t + '"' + (sl.busy ? ' disabled aria-label="' + fmtMin(sl.t) + ', занято"' : '') + '>' + fmtMin(sl.t) + '</button>';
}
function step2HTML() {
  const s = svcById(bk.svc);
  if (s.long) {
    return '<div class="note"><strong>Для этой услуги время выбираем после осмотра.</strong><span>Оставьте заявку — мастер перезвонит в рабочее время и договорится о дне.</span></div>' +
      '<h3 class="group__t">Удобный день <span class="soft">(необязательно)</span></h3>' + daysStrip(s, true);
  }
  const date = fromKey(bk.date);
  const slots = slotsFor(date, s);
  let h = daysStrip(s, false);
  if (!slots.length) return h + '<p class="empty">В этот день не работаем. Выберите другой.</p>';
  h += '<p class="field__err" id="err-time" role="alert"></p>';
  const periods = ['Ночь', 'Утро', 'День', 'Вечер'];
  if (slots.length > 14 && CFG.periods) {
    periods.forEach((p) => {
      const arr = slots.filter((x) => periodOf(x.t) === p);
      if (arr.length) h += '<section class="slots-g"><h3 class="group__t">' + p + '</h3><div class="slots">' + arr.map(slotBtn).join('') + '</div></section>';
    });
  } else {
    h += '<div class="slots">' + slots.map(slotBtn).join('') + '</div>';
  }
  return h + '<p class="legend"><span class="legend__sw"></span>Занятое время выделено серым</p>';
}

function summaryHTML() {
  const s = svcById(bk.svc);
  return '<dl class="sum"><div><dt>Услуга</dt><dd>' + esc(s.name) + '</dd></div><div><dt>' + (s.long ? 'Время' : 'Когда') + '</dt><dd>' + esc(whenText()) + '</dd></div><div><dt>Стоимость</dt><dd>' + priceLabel(s) + (s.priceNote ? '<small>' + esc(s.priceNote) + '</small>' : '') + '</dd></div></dl>';
}
function fieldHTML(id, label, attrs, hint) {
  return '<div class="field"><label for="f-' + id + '">' + label + '</label><input id="f-' + id + '" name="' + id + '" ' + attrs + ' aria-describedby="err-' + id + '"><p class="field__err" id="err-' + id + '" role="alert"></p>' + (hint ? '<p class="field__hint">' + hint + '</p>' : '') + '</div>';
}
function step3HTML() {
  const s = svcById(bk.svc);
  return summaryHTML() + '<form id="bk-form" novalidate autocomplete="on">' +
    fieldHTML('name', 'Как вас зовут', 'type="text" autocomplete="name" value="' + esc(bk.name) + '" placeholder="Имя"') +
    fieldHTML('phone', 'Телефон', 'type="tel" inputmode="tel" autocomplete="tel" value="' + esc(bk.phone) + '" placeholder="+7 (___) ___-__-__"', 'Позвоним или напишем, если что-то изменится') +
    (EXTRA ? fieldHTML(EXTRA.key, EXTRA.label, 'type="text" autocomplete="off" value="' + esc(bk.car) + '" placeholder="' + esc(EXTRA.ph) + '"') : '') +
    '<div class="field field--check"><input type="checkbox" id="f-agree" name="agree"' + (bk.agree ? ' checked' : '') + ' aria-describedby="err-agree"><label for="f-agree">Согласен на обработку персональных данных и ознакомлен с <a href="#" data-act="policy">политикой конфиденциальности</a></label><p class="field__err" id="err-agree" role="alert"></p></div>' +
    '<button type="submit" class="btn btn--primary btn--block" id="bk-submit">' + (s.long ? 'Оставить заявку' : 'Записаться') + '</button></form>';
}

function doneHTML() {
  const b = bk.done;
  const s = b.long;
  if (b.status === 'cancel') {
    return '<div class="done done--cancel"><span class="done__badge">' + icon('x') + '</span><p class="done__lead">Запись отменена. Время освободили.</p><button type="button" class="btn btn--primary" data-act="again">Записаться снова</button></div>';
  }
  let h = '<div class="done"><span class="done__badge">' + icon('check') + '</span>' +
    '<p class="done__lead">' + (s ? 'Мастер перезвонит вам по номеру ' + esc(b.phone) + ' и согласует время.' : 'Ждём вас. Если планы изменятся, отмените запись или позвоните.') + '</p>' +
    '<div class="ticket"><dl>' +
    '<div><dt>Услуга</dt><dd>' + esc(b.svcName) + '</dd></div>' +
    '<div><dt>' + (s ? 'Время' : 'Когда') + '</dt><dd>' + esc(s ? (b.date ? 'Удобный день: ' + dateLong(fromKey(b.date)) : 'Согласуем по телефону') : dateLong(fromKey(b.date)) + ', ' + fmtMin(b.time) + '–' + fmtMin(b.time + b.dur)) + '</dd></div>' +
    '<div><dt>Адрес</dt><dd>' + esc(B.city + ', ' + B.address) + '</dd></div>' +
    '<div><dt>Гость</dt><dd>' + esc(b.name) + (b.car ? ', ' + esc(b.car) : '') + '</dd></div>' +
    '</dl></div><div class="done__acts">';
  if (!s) h += '<button type="button" class="btn btn--ghost" data-act="ics">' + icon('down') + 'Добавить в календарь</button>';
  if (bk.askCancel) {
    h += '<div class="confirm" role="alertdialog" aria-label="Подтверждение отмены"><span>Отменить запись?</span><button type="button" class="btn btn--danger" data-act="cancel-yes">Да, отменить</button><button type="button" class="btn btn--ghost" data-act="cancel-no">Оставить</button></div>';
  } else {
    h += '<button type="button" class="btn btn--quiet" data-act="cancel">Отменить запись</button>';
  }
  return h + '</div></div>';
}

function renderSheet(focusSel) {
  const s = svcById(bk.svc);
  let title, body, foot = '';
  const prevBody = $('.sheet__body', sheet);
  const scroll = prevBody ? prevBody.scrollTop : 0;
  const lastStep = sheet.dataset.step;
  if (bk.done) {
    title = bk.done.status === 'cancel' ? 'Запись отменена' : (bk.done.long ? 'Заявка принята' : 'Вы записаны');
    body = doneHTML();
    foot = '<button type="button" class="btn btn--primary btn--block" data-act="close">Готово</button>';
  } else if (bk.step === 1) {
    title = 'Что делаем?';
    body = step1HTML();
    foot = '<button type="button" class="btn btn--primary btn--block" data-act="next">Дальше</button>';
  } else if (bk.step === 2) {
    title = s.long ? 'Когда удобно?' : 'Когда удобно?';
    body = step2HTML();
    foot = (bk.time != null || s.long ? '<p class="foot__sum">' + esc(whenText()) + '</p>' : '') + '<button type="button" class="btn btn--primary btn--block" data-act="next">Дальше</button>';
  } else {
    title = 'Ваши данные';
    body = step3HTML();
  }
  const prog = bk.done ? '' : '<ol class="progress" aria-label="Шаг ' + bk.step + ' из 3">' + [1, 2, 3].map((n) => '<li class="' + (n < bk.step ? 'is-done' : n === bk.step ? 'is-now' : '') + '"></li>').join('') + '</ol>';
  sheet.dataset.step = bk.done ? 'done' : bk.step;
  sheet.innerHTML = '<div class="sheet__panel"><header class="sheet__head">' +
    (bk.step > 1 && !bk.done ? '<button type="button" class="icon-btn" data-act="back" aria-label="Назад">' + icon('left') + '</button>' : '<span class="icon-btn icon-btn--sp"></span>') +
    '<div class="sheet__titles"><p class="sheet__step">' + (bk.done ? esc(B.name) : 'Шаг ' + bk.step + ' из 3') + '</p><h2 id="sheet-title" tabindex="-1">' + title + '</h2></div>' +
    '<button type="button" class="icon-btn" data-act="close" aria-label="Закрыть">' + icon('x') + '</button></header>' + prog +
    '<div class="sheet__body">' + body + '</div>' + (foot ? '<footer class="sheet__foot">' + foot + '</footer>' : '') + '</div>';
  const nb = $('.sheet__body', sheet);
  if (lastStep === String(sheet.dataset.step)) nb.scrollTop = scroll; else nb.scrollTop = 0;
  if (focusSel) { const f = $(focusSel, sheet); if (f) f.focus(); }
}

function setErr(id, msg) {
  const p = $('#err-' + id, sheet), inp = $('#f-' + id, sheet);
  if (p) p.textContent = msg || '';
  if (inp) { if (msg) inp.setAttribute('aria-invalid', 'true'); else inp.removeAttribute('aria-invalid'); }
}

function submitBooking() {
  const f = $('#bk-form', sheet);
  const name = f.name.value.trim(), phone = f.phone.value, car = EXTRA ? f[EXTRA.key].value.trim() : '', agree = f.agree.checked;
  bk.name = name; bk.phone = phone; bk.car = car; bk.agree = agree;
  let first = null;
  const bad = (id, msg) => { setErr(id, msg); if (!first) first = id; };
  setErr('name'); setErr('phone'); setErr('agree'); if (EXTRA) setErr(EXTRA.key);
  if (name.length < 2) bad('name', 'Введите имя, хотя бы два символа');
  if (!phoneOk(phone)) bad('phone', 'Введите номер полностью: +7 и 10 цифр');
  if (EXTRA && car.length < 2) bad(EXTRA.key, EXTRA.err);
  if (!agree) bad('agree', 'Без согласия записать не получится');
  if (first) { const el = first === 'agree' ? $('#f-agree', sheet) : $('#f-' + first, sheet); el.focus(); return; }
  const s = svcById(bk.svc);
  const rec = { id: 'u' + Date.now(), svcId: s.id, svcName: s.name, long: !!s.long, date: bk.date, time: s.long ? null : bk.time, dur: s.durationMin || 30, name, phone, car, status: 'wait', created: Date.now() };
  const all = store.get('bookings', []); all.push(rec); store.set('bookings', all);
  bk.done = rec; bk.askCancel = false;
  renderSheet('#sheet-title');
}

function icsDate(dateKey, min) {
  const d = fromKey(dateKey);
  return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + 'T' + pad(Math.floor(min / 60) % 24) + pad(min % 60) + '00';
}
function downloadIcs(b) {
  const esc2 = (t) => String(t).replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
  const endMin = b.time + b.dur;
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Prototype//RU', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
    'UID:' + b.id + '@' + B.slug, 'DTSTAMP:' + new Date().toISOString().replace(/[-:]|\.\d+/g, ''),
    'DTSTART:' + icsDate(b.date, b.time), 'DTEND:' + (endMin >= 1440 ? icsDate(dkey(addDays(fromKey(b.date), 1)), endMin - 1440) : icsDate(b.date, endMin)),
    'SUMMARY:' + esc2(b.svcName + ' — ' + B.name), 'LOCATION:' + esc2(B.city + ', ' + B.address),
    'DESCRIPTION:' + esc2('Запись: ' + b.name + (MAIN_PHONE ? '. Телефон: ' + phoneFmt(MAIN_PHONE) : '')), 'END:VEVENT', 'END:VCALENDAR'];
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = 'zapis-' + B.slug + '.ics';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  toast('Файл календаря скачан');
}

sheet.addEventListener('click', (e) => {
  const link = e.target.closest('a[data-act="policy"]');
  if (link) { e.preventDefault(); toast('Политика конфиденциальности — заглушка в прототипе'); return; }
  const b = e.target.closest('[data-act]');
  if (!b || !bk) return;
  const act = b.dataset.act;
  if (act === 'close') { closeSheetEl2(); return; }
  if (act === 'back') { bk.step = Math.max(1, bk.step - 1); renderSheet('#sheet-title'); return; }
  if (act === 'pick-svc') {
    const s = svcById(b.dataset.id);
    if (bk.svc !== s.id) { bk.svc = s.id; bk.time = null; bk.date = s.long ? null : firstFreeDay(s); }
    renderSheet(); const el = $('[data-id="' + s.id + '"]', sheet); if (el) el.focus({ preventScroll: true });
    return;
  }
  if (act === 'pick-date') { bk.date = b.dataset.d || null; bk.time = null; renderSheet(); const el = $('[data-act="pick-date"][aria-pressed="true"]', sheet); if (el) el.focus({ preventScroll: true }); return; }
  if (act === 'pick-slot') { bk.time = +b.dataset.t; renderSheet(); const el = $('[data-act="pick-slot"][aria-pressed="true"]', sheet); if (el) el.focus({ preventScroll: true }); return; }
  if (act === 'next') {
    const s = svcById(bk.svc);
    if (bk.step === 1) {
      if (!s) { const p = $('#err-svc', sheet); p.textContent = 'Выберите услугу из списка'; return; }
      if (!bk.date && !s.long) bk.date = firstFreeDay(s);
      bk.step = 2; renderSheet('#sheet-title'); return;
    }
    if (bk.step === 2) {
      if (!s.long && bk.time == null) { const p = $('#err-time', sheet); if (p) p.textContent = 'Выберите время'; toast('Выберите время'); return; }
      bk.step = 3; renderSheet('#sheet-title'); return;
    }
  }
  if (act === 'ics') { downloadIcs(bk.done); return; }
  if (act === 'cancel') { bk.askCancel = true; renderSheet('[data-act="cancel-no"]'); return; }
  if (act === 'cancel-no') { bk.askCancel = false; renderSheet('[data-act="cancel"]'); return; }
  if (act === 'cancel-yes') {
    const all = store.get('bookings', []);
    const r = all.find((x) => x.id === bk.done.id); if (r) r.status = 'cancel';
    store.set('bookings', all);
    bk.done.status = 'cancel'; bk.askCancel = false; renderSheet('#sheet-title'); toast('Запись отменена'); return;
  }
  if (act === 'again') { bk = freshBooking(); renderSheet('#sheet-title'); return; }
});
sheet.addEventListener('input', (e) => {
  if (e.target.id === 'f-phone') {
    e.target.value = maskPhone(e.target.value);
    bk.phone = e.target.value;
  }
  if (e.target.id && e.target.id.indexOf('f-') === 0) setErr(e.target.id.slice(2));
});
sheet.addEventListener('change', (e) => { if (e.target.id === 'f-agree') setErr('agree'); });
sheet.addEventListener('submit', (e) => { e.preventDefault(); submitBooking(); });

/* ====================== фото на весь экран ====================== */
const lb = $('#lightbox');
let lbI = 0;
function lbRender() {
  const p = PHOTOS[lbI];
  lb.innerHTML = '<div class="lb__inner"><button type="button" class="lb__x icon-btn" data-lb="close" aria-label="Закрыть">' + icon('x') + '</button>' +
    '<img src="' + photo(p.file) + '" alt="' + esc(altOf(p)) + '">' +
    '<div class="lb__bar"><button type="button" class="icon-btn" data-lb="prev" aria-label="Предыдущее фото">' + icon('left') + '</button><span>' + (lbI + 1) + ' / ' + PHOTOS.length + '</span><button type="button" class="icon-btn" data-lb="next" aria-label="Следующее фото">' + icon('right') + '</button></div></div>';
}
function openLightbox(i) {
  lbI = i; lbRender();
  if (!lb.open) lb.showModal();
}
lb.addEventListener('click', (e) => {
  const a = e.target.closest('[data-lb]');
  if (a) {
    if (a.dataset.lb === 'close') lb.close();
    if (a.dataset.lb === 'prev') { lbI = (lbI + PHOTOS.length - 1) % PHOTOS.length; lbRender(); $('[data-lb="prev"]', lb).focus(); }
    if (a.dataset.lb === 'next') { lbI = (lbI + 1) % PHOTOS.length; lbRender(); $('[data-lb="next"]', lb).focus(); }
  } else if (!e.target.closest('img') && !e.target.closest('.lb__bar')) lb.close();
});
lb.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') { lbI = (lbI + PHOTOS.length - 1) % PHOTOS.length; lbRender(); }
  if (e.key === 'ArrowRight') { lbI = (lbI + 1) % PHOTOS.length; lbRender(); }
});

/* ====================== кабинет владельца ====================== */
const owner = $('#view-owner');
const STATUS = { wait: 'Ожидается', came: 'Пришёл', noshow: 'Не пришёл', done: 'Выполнено', cancel: 'Отменено' };
const NAMES = ['Андрей К.', 'Михаил С.', 'Сергей Т.', 'Олег В.', 'Дмитрий Л.', 'Артём Н.', 'Игорь Р.', 'Павел Б.', 'Никита Ж.', 'Роман Ф.', 'Алексей Г.', 'Максим Д.'];
const CARS = ['Kia Rio', 'Hyundai Solaris', 'Lada Vesta', 'Toyota Camry', 'Skoda Octavia', 'Geely Coolray', 'Haval Jolion', 'Chery Tiggo 7', 'Lada Granta', 'Volkswagen Polo', 'Renault Duster', 'Nissan Qashqai'];
let ownTab = 'rec', ownRange = 'today', ownDraft = null;

function mockRecords() {
  const base = new Date(); base.setHours(0, 0, 0, 0);
  const out = [];
  const pool = CFG.mockPool ? SERVICES.slice(0, CFG.mockPool) : SERVICES.filter((s) => !s.long);
  const list = pool.length ? pool : SERVICES;
  const now = nowMin();
  for (let d = 0; d < 7; d++) {
    const date = addDays(base, d), h = hoursOf(date);
    if (!h || !h.on) continue;
    const n = d === 0 ? 6 : 2 + Math.floor(hash(B.slug + 'n' + d) * 4);
    const used = {};
    for (let i = 0; i < n; i++) {
      const svc = list[Math.floor(hash(B.slug + 's' + d + i) * list.length)];
      const dur = svc.durationMin || 30;
      let lo = Math.max(h.from, 480), hi = Math.min(h.to, 1320);
      if (hi - lo < dur) { lo = h.from; hi = h.to; }
      if (d === 0 && i % 2 === 1) { const later = Math.ceil((now + 30) / 30) * 30; if (later + dur <= hi) lo = later; }
      const cells = Math.max(1, Math.floor((hi - lo - dur) / 30) + 1);
      let t = lo + Math.floor(hash(B.slug + 't' + d + i) * cells) * 30, guard = 0;
      while (used[t] && guard++ < 50) t = lo + ((t - lo + 30) % (cells * 30));
      used[t] = 1;
      const who = Math.floor(hash(B.slug + 'w' + d + i) * NAMES.length);
      let status = 'wait';
      if (d === 0) {
        if (t + dur < now) status = ['done', 'done', 'came', 'noshow'][Math.floor(hash(B.slug + 'st' + i) * 4)];
        else if (t <= now) status = 'came';
      }
      out.push({ id: 'm' + d + '-' + i, date: dkey(date), start: t, dur, svcName: svc.name, name: NAMES[who], phone: '+7 900 000-00-' + pad(10 + who * 3 + i), car: EXTRA ? CARS[(who + i + d) % CARS.length] : '', status, mock: true });
    }
  }
  const lg = SERVICES.find((s) => s.long);
  if (lg) out.push({ id: 'm-long', date: dkey(addDays(base, 1)), start: null, dur: lg.durationMin, svcName: lg.name, name: 'Виктор П.', phone: '+7 900 000-00-77', car: EXTRA ? 'Toyota RAV4' : '', status: 'wait', mock: true, long: true });
  return out;
}
function allRecords() {
  const st = store.get('status', {});
  const mine = store.get('bookings', []).map((b) => ({ id: b.id, date: b.date || dkey(new Date()), start: b.time, dur: b.dur, svcName: b.svcName, name: b.name, phone: b.phone, car: b.car, status: b.status, long: b.long, mine: true }));
  return mockRecords().concat(mine).map((r) => Object.assign({}, r, { status: st[r.id] || r.status }))
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : (a.start == null ? -1 : b.start == null ? 1 : a.start - b.start)));
}
function setStatus(id, status) {
  const st = store.get('status', {}); st[id] = status; store.set('status', st);
  const all = store.get('bookings', []); const r = all.find((x) => x.id === id);
  if (r) { r.status = status; store.set('bookings', all); }
}

function loginHTML() {
  return '<div class="login"><div class="login__box"><p class="own__kicker">Кабинет владельца</p><h1 id="own-h" tabindex="-1">' + esc(B.name) + '</h1>' +
    '<p class="login__lead">Здесь видно все записи, цены и график.</p>' +
    '<form id="login-form" novalidate>' +
    '<div class="field"><label for="l-mail">Почта</label><input id="l-mail" type="email" autocomplete="username" placeholder="you@example.ru" aria-describedby="err-l-mail"><p class="field__err" id="err-l-mail" role="alert"></p></div>' +
    '<div class="field"><label for="l-pass">Пароль</label><input id="l-pass" type="password" autocomplete="current-password" aria-describedby="err-l-pass"><p class="field__err" id="err-l-pass" role="alert"></p></div>' +
    '<button type="submit" class="btn btn--primary btn--block">Войти</button></form>' +
    '<p class="login__demo">Демо-доступ: подойдёт любая почта и любой пароль.</p></div></div>';
}
function recRow(r) {
  const when = r.start == null ? '<span class="rec__t rec__t--req">Заявка</span>' : '<span class="rec__t"><b>' + fmtMin(r.start) + '</b><small>до ' + fmtMin(Math.min(r.start + r.dur, 1440)) + '</small></span>';
  return '<li><button type="button" class="rec" data-act="open-rec" data-id="' + esc(r.id) + '">' + when +
    '<span class="rec__main"><span class="rec__name">' + esc(r.name) + '</span><span class="rec__svc">' + esc(r.svcName) + (r.car ? ' · ' + esc(r.car) : '') + '</span></span>' +
    '<span class="pill pill--' + r.status + '">' + STATUS[r.status] + '</span></button></li>';
}
function recordsHTML() {
  const all = allRecords();
  const today = dkey(new Date());
  const list = ownRange === 'today' ? all.filter((r) => r.date === today) : all;
  let h = '<div class="toolbar"><div class="seg" role="group" aria-label="Период"><button type="button" aria-pressed="' + (ownRange === 'today') + '" data-act="range" data-v="today">Сегодня</button><button type="button" aria-pressed="' + (ownRange === 'week') + '" data-act="range" data-v="week">Неделя</button></div>' +
    '<button type="button" class="btn btn--primary" data-act="manual">' + icon('plus') + 'Записать вручную</button></div>';
  if (!list.length) return h + '<p class="empty">На сегодня записей нет. Добавьте первую вручную.</p>';
  const groups = [];
  list.forEach((r) => { let g = groups.find((x) => x.date === r.date); if (!g) { g = { date: r.date, items: [] }; groups.push(g); } g.items.push(r); });
  groups.forEach((g) => {
    const d = fromKey(g.date);
    const wait = g.items.filter((r) => r.status === 'wait').length;
    h += '<section class="day-g"><h3 class="day-g__t">' + (g.date === today ? 'Сегодня' : WD[d.getDay()][0].toUpperCase() + WD[d.getDay()].slice(1)) + ', ' + dateLabel(d) + '<span>' + g.items.length + ' ' + plural(g.items.length, ['запись', 'записи', 'записей']) + (wait ? ', ждут ' + wait : '') + '</span></h3><ul class="recs">' + g.items.map(recRow).join('') + '</ul></section>';
  });
  return h + '<p class="field__hint own__note">Часть записей — примеры для демо. Ваши записи с сайта попадают сюда же.</p>';
}
function svcRowHTML(s, i) {
  return '<div class="svc-row" data-id="' + esc(s.id) + '">' +
    '<div class="field svc-row__name"><label for="sv-n-' + i + '">Название</label><input id="sv-n-' + i + '" data-f="name" value="' + esc(s.name) + '"><p class="field__err" role="alert"></p></div>' +
    '<div class="field"><label for="sv-p-' + i + '">Цена, ₽' + (s.priceUnit ? ' ' + esc(s.priceUnit.replace('₽', '')) : '') + '</label><input id="sv-p-' + i + '" data-f="price" inputmode="decimal" placeholder="по запросу" value="' + (s.price == null ? '' : String(s.price).replace('.', ',')) + '"><p class="field__err" role="alert"></p></div>' +
    '<div class="field"><label for="sv-d-' + i + '">Минут</label><input id="sv-d-' + i + '" data-f="dur" inputmode="numeric" value="' + (s.durationMin || '') + '"><p class="field__err" role="alert"></p></div>' +
    '<div class="field svc-row__cat"><label for="sv-c-' + i + '">Раздел</label><input id="sv-c-' + i + '" data-f="cat" value="' + esc(s.category || '') + '"></div>' +
    '<div class="svc-row__end"><label class="chk"><input type="checkbox" data-f="long"' + (s.long ? ' checked' : '') + '>На день и больше, по заявке</label>' +
    '<button type="button" class="icon-btn icon-btn--danger" data-act="del-svc" data-id="' + esc(s.id) + '" aria-label="Удалить услугу «' + esc(s.name) + '»">' + icon('trash') + '</button></div></div>';
}
function servicesTabHTML() {
  const list = ownDraft || SERVICES;
  return '<p class="own__lead">Всё, что здесь изменить, сразу видно посетителям на сайте и в записи. Пустая цена — «по запросу».</p>' +
    '<div class="svc-rows" id="svc-rows">' + list.map(svcRowHTML).join('') + '</div>' +
    '<div class="toolbar toolbar--end"><button type="button" class="btn btn--ghost" data-act="add-svc">' + icon('plus') + 'Добавить услугу</button><button type="button" class="btn btn--quiet" data-act="reset-svc">Вернуть исходные</button><button type="button" class="btn btn--primary" data-act="save-svc">Сохранить</button></div>';
}
function hourOptions(sel) {
  let o = '';
  for (let m = 0; m <= 1440; m += 30) o += '<option value="' + m + '"' + (m === sel ? ' selected' : '') + '>' + fmtMin(m) + '</option>';
  return o;
}
function scheduleTabHTML() {
  return '<p class="own__lead">По этому графику считаются свободные окна в записи. Выходной день — окон нет.</p><div class="sch" id="sch">' +
    DAYS.map((d) => { const x = SCHED[d]; return '<div class="sch__row" data-d="' + d + '"><label class="chk sch__on"><input type="checkbox" data-f="on"' + (x.on ? ' checked' : '') + '><span>' + DAY_FULL[d] + '</span></label>' +
      '<div class="sch__t"><label class="sr-only" for="sf-' + d + '">Начало, ' + DAY_FULL[d] + '</label><select id="sf-' + d + '" data-f="from"' + (x.on ? '' : ' disabled') + '>' + hourOptions(x.from) + '</select><span aria-hidden="true">—</span><label class="sr-only" for="st-' + d + '">Конец, ' + DAY_FULL[d] + '</label><select id="st-' + d + '" data-f="to"' + (x.on ? '' : ' disabled') + '>' + hourOptions(x.to) + '</select></div><p class="field__err" role="alert"></p></div>'; }).join('') +
    '</div><div class="toolbar toolbar--end"><button type="button" class="btn btn--ghost" data-act="sch-all">Круглосуточно</button><button type="button" class="btn btn--quiet" data-act="reset-sch">Вернуть исходный</button><button type="button" class="btn btn--primary" data-act="save-sch">Сохранить</button></div>';
}
function renderOwner(focus) {
  if (!sess.get('auth')) {
    owner.innerHTML = loginHTML();
    if (focus !== false) { const h = $('#own-h', owner); if (h) h.focus({ preventScroll: true }); }
    return;
  }
  const all = allRecords(), today = dkey(new Date());
  const todays = all.filter((r) => r.date === today);
  const tabs = [['rec', 'Записи', 'list'], ['svc', 'Услуги и цены', 'tag'], ['sch', 'График', 'clock']];
  let panel = ownTab === 'rec' ? recordsHTML() : ownTab === 'svc' ? servicesTabHTML() : scheduleTabHTML();
  owner.innerHTML = '<div class="own"><header class="own__top"><div><p class="own__kicker">Кабинет владельца</p><h1 id="own-h" tabindex="-1">' + esc(B.name) + '</h1></div>' +
    '<div class="own__acts"><a class="btn btn--ghost" href="#/">Сайт для гостей</a><button type="button" class="btn btn--quiet" data-act="logout">' + icon('out') + 'Выйти</button></div></header>' +
    '<p class="own__stats"><b>' + todays.length + '</b> ' + plural(todays.length, ['запись', 'записи', 'записей']) + ' на сегодня, <b>' + todays.filter((r) => r.status === 'wait').length + '</b> ещё ждут</p>' +
    '<div class="tabs" role="tablist" aria-label="Разделы кабинета">' + tabs.map((t) => '<button type="button" role="tab" id="tab-' + t[0] + '" aria-selected="' + (ownTab === t[0]) + '" aria-controls="panel" data-act="tab" data-v="' + t[0] + '">' + icon(t[2]) + '<span>' + t[1] + '</span></button>').join('') + '</div>' +
    '<section class="panel" id="panel" role="tabpanel" aria-labelledby="tab-' + ownTab + '">' + panel + '</section></div>';
  if (focus) { const f = $(focus, owner); if (f) f.focus({ preventScroll: true }); else { const h = $('#own-h', owner); if (h) h.focus({ preventScroll: true }); } }
}

/* карточка записи и ручная запись */
const card = $('#card');
card.addEventListener('click', (e) => { if (e.target === card) card.close(); });
function openCard(html) { card.innerHTML = html; if (!card.open) card.showModal(); document.documentElement.classList.add('lock'); }
card.addEventListener('close', () => { if (!sheet.open) document.documentElement.classList.remove('lock'); });
function recCardHTML(id) {
  const r = allRecords().find((x) => x.id === id);
  if (!r) return '';
  const wa = 'https://wa.me/' + digits(r.phone);
  return '<div class="card__panel"><header class="card__head"><div><p class="own__kicker">' + (r.start == null ? 'Заявка' : dateLong(fromKey(r.date)) + ', ' + fmtMin(r.start)) + '</p><h2 id="card-t" tabindex="-1">' + esc(r.name) + '</h2></div>' +
    '<button type="button" class="icon-btn" data-act="card-close" aria-label="Закрыть">' + icon('x') + '</button></header>' +
    '<dl class="sum"><div><dt>Услуга</dt><dd>' + esc(r.svcName) + '</dd></div>' +
    (r.start != null ? '<div><dt>Время</dt><dd>' + fmtMin(r.start) + '–' + fmtMin(Math.min(r.start + r.dur, 1440)) + '</dd></div>' : '<div><dt>Время</dt><dd>Согласовать по телефону</dd></div>') +
    (r.car ? '<div><dt>' + esc(EXTRA.label) + '</dt><dd>' + esc(r.car) + '</dd></div>' : '') +
    '<div><dt>Телефон</dt><dd>' + esc(r.phone) + '</dd></div></dl>' +
    '<p class="card__lbl">Статус: <b class="pill pill--' + r.status + '">' + STATUS[r.status] + '</b></p>' +
    '<div class="stbtns" role="group" aria-label="Изменить статус">' + [['came', 'Пришёл'], ['noshow', 'Не пришёл'], ['done', 'Выполнено'], ['cancel', 'Отменено']].map((s) => '<button type="button" class="stbtn stbtn--' + s[0] + '" aria-pressed="' + (r.status === s[0]) + '" data-act="set-status" data-id="' + esc(r.id) + '" data-v="' + s[0] + '">' + s[1] + '</button>').join('') + '</div>' +
    '<div class="card__acts"><a class="btn btn--primary" href="' + telHref(r.phone) + '">' + icon('phone') + 'Позвонить</a><a class="btn btn--ghost" href="' + wa + '" target="_blank" rel="noopener noreferrer">' + icon('chat') + 'WhatsApp</a></div></div>';
}
function manualHTML(v) {
  v = v || {};
  const t0 = new Date();
  const dOpts = [0, 1, 2, 3, 4, 5, 6].map((i) => { const d = addDays(t0, i); return '<option value="' + dkey(d) + '"' + (v.date === dkey(d) ? ' selected' : '') + '>' + (i === 0 ? 'Сегодня, ' : '') + dateLong(d) + '</option>'; }).join('');
  const sOpts = SERVICES.map((s) => '<option value="' + esc(s.id) + '"' + (v.svc === s.id ? ' selected' : '') + '>' + esc(s.name) + '</option>').join('');
  return '<div class="card__panel"><header class="card__head"><div><p class="own__kicker">Новая запись</p><h2 id="card-t" tabindex="-1">Записать вручную</h2></div><button type="button" class="icon-btn" data-act="card-close" aria-label="Закрыть">' + icon('x') + '</button></header>' +
    '<form id="man-form" novalidate>' +
    '<div class="field"><label for="m-name">Имя</label><input id="m-name" autocomplete="off" aria-describedby="err-m-name"><p class="field__err" id="err-m-name" role="alert"></p></div>' +
    '<div class="field"><label for="m-phone">Телефон</label><input id="m-phone" type="tel" inputmode="tel" placeholder="+7 (___) ___-__-__" aria-describedby="err-m-phone"><p class="field__err" id="err-m-phone" role="alert"></p></div>' +
    (EXTRA ? '<div class="field"><label for="m-car">' + esc(EXTRA.label) + '</label><input id="m-car" autocomplete="off" aria-describedby="err-m-car"><p class="field__err" id="err-m-car" role="alert"></p></div>' : '') +
    '<div class="field"><label for="m-svc">Услуга</label><select id="m-svc">' + sOpts + '</select></div>' +
    '<div class="field"><label for="m-date">День</label><select id="m-date">' + dOpts + '</select></div>' +
    '<div class="field" id="m-time-wrap"><label for="m-time">Время</label><select id="m-time" aria-describedby="err-m-time"></select><p class="field__err" id="err-m-time" role="alert"></p></div>' +
    '<button type="submit" class="btn btn--primary btn--block">Добавить запись</button></form></div>';
}
function fillManualTimes() {
  const s = svcById($('#m-svc', card).value), d = fromKey($('#m-date', card).value);
  const wrap = $('#m-time-wrap', card), sel = $('#m-time', card);
  if (s.long) { wrap.hidden = true; return; }
  wrap.hidden = false;
  const free = slotsFor(d, s).filter((x) => !x.busy);
  sel.innerHTML = free.length ? free.map((x) => '<option value="' + x.t + '">' + fmtMin(x.t) + '</option>').join('') : '<option value="">нет свободных окон</option>';
}
function mErr(id, msg) { const p = $('#err-m-' + id, card), i = $('#m-' + id, card); if (p) p.textContent = msg || ''; if (i) { if (msg) i.setAttribute('aria-invalid', 'true'); else i.removeAttribute('aria-invalid'); } }
card.addEventListener('change', (e) => { if (e.target.id === 'm-svc' || e.target.id === 'm-date') fillManualTimes(); });
card.addEventListener('input', (e) => { if (e.target.id === 'm-phone') e.target.value = maskPhone(e.target.value); if (e.target.id && e.target.id.indexOf('m-') === 0) mErr(e.target.id.slice(2)); });
card.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = $('#m-name', card).value.trim(), phone = $('#m-phone', card).value, car = EXTRA ? $('#m-car', card).value.trim() : '';
  const s = svcById($('#m-svc', card).value), date = $('#m-date', card).value, tv = $('#m-time', card).value;
  let first = null; const bad = (id, m) => { mErr(id, m); if (!first) first = id; };
  ['name', 'phone', 'time'].forEach((i) => mErr(i)); if (EXTRA) mErr('car');
  if (name.length < 2) bad('name', 'Введите имя');
  if (!phoneOk(phone)) bad('phone', 'Введите номер полностью: +7 и 10 цифр');
  if (EXTRA && car.length < 2) bad('car', EXTRA.err);
  if (!s.long && tv === '') bad('time', 'На этот день нет свободных окон, выберите другой');
  if (first) { $('#m-' + first, card).focus(); return; }
  const all = store.get('bookings', []);
  all.push({ id: 'u' + Date.now(), svcId: s.id, svcName: s.name, long: !!s.long, date, time: s.long ? null : +tv, dur: s.durationMin || 30, name, phone, car, status: 'wait', manual: true, created: Date.now() });
  store.set('bookings', all);
  card.close(); renderOwner('#panel'); toast('Запись добавлена');
});
card.addEventListener('click', (e) => {
  const b = e.target.closest('[data-act]'); if (!b) return;
  if (b.dataset.act === 'card-close') card.close();
  if (b.dataset.act === 'set-status') {
    setStatus(b.dataset.id, b.dataset.v);
    card.innerHTML = recCardHTML(b.dataset.id);
    renderOwner(false);
    toast('Статус: ' + STATUS[b.dataset.v].toLowerCase());
    const f = $('[data-act="set-status"][aria-pressed="true"]', card); if (f) f.focus();
  }
});

function readServiceRows() {
  const rows = $$('.svc-row', owner), out = []; let ok = true;
  rows.forEach((row) => {
    const g = (f) => $('[data-f="' + f + '"]', row);
    const errs = $$('.field__err', row); const [en, ep, ed] = errs;
    en.textContent = ep.textContent = ed.textContent = '';
    const name = g('name').value.trim(), pr = g('price').value.trim().replace(',', '.'), dur = g('dur').value.trim();
    if (!name) { en.textContent = 'Назовите услугу'; ok = false; }
    let price = null;
    if (pr !== '') { price = Number(pr); if (!isFinite(price) || price < 0) { ep.textContent = 'Только число'; ok = false; } }
    const dm = dur === '' ? 30 : Number(dur);
    if (!Number.isInteger(dm) || dm < 1 || dm > 2880) { ed.textContent = 'Целое число минут'; ok = false; }
    const old = SERVICES.find((s) => s.id === row.dataset.id) || {};
    out.push(Object.assign({}, old, { id: row.dataset.id, name, price, durationMin: dm, durationStub: false, category: g('cat').value.trim() || 'Другое', long: g('long').checked }));
  });
  return ok ? out : null;
}
function collectDraft() {
  return $$('.svc-row', owner).map((row) => {
    const g = (f) => $('[data-f="' + f + '"]', row);
    const old = SERVICES.find((s) => s.id === row.dataset.id) || {};
    const pr = g('price').value.trim().replace(',', '.');
    return Object.assign({}, old, { id: row.dataset.id, name: g('name').value, price: pr === '' || isNaN(Number(pr)) ? null : Number(pr), durationMin: Number(g('dur').value) || 30, category: g('cat').value, long: g('long').checked });
  });
}

owner.addEventListener('click', (e) => {
  const b = e.target.closest('[data-act]'); if (!b) return;
  const act = b.dataset.act;
  if (act === 'logout') { sess.del('auth'); renderOwner(); toast('Вы вышли'); return; }
  if (act === 'tab') { ownTab = b.dataset.v; ownDraft = null; renderOwner('#tab-' + ownTab); return; }
  if (act === 'range') { ownRange = b.dataset.v; renderOwner('[data-act="range"][aria-pressed="true"]'); return; }
  if (act === 'open-rec') { openCard(recCardHTML(b.dataset.id)); const h = $('#card-t', card); if (h) h.focus(); return; }
  if (act === 'manual') { openCard(manualHTML({ date: dkey(new Date()) })); fillManualTimes(); $('#m-name', card).focus(); return; }
  if (act === 'add-svc') {
    const d = collectDraft(); d.push({ id: 'n' + Date.now(), name: '', price: null, durationMin: 30, category: (SERVICES[SERVICES.length - 1] || {}).category || 'Другое', long: false });
    ownDraft = d; renderOwner(); const rows = $$('.svc-row input[data-f="name"]', owner); rows[rows.length - 1].focus(); return;
  }
  if (act === 'del-svc') {
    const d = collectDraft().filter((s) => s.id !== b.dataset.id);
    ownDraft = d; renderOwner(); toast('Услуга убрана. Нажмите «Сохранить», чтобы применить'); return;
  }
  if (act === 'save-svc') {
    const rows = readServiceRows(); if (!rows) { toast('Исправьте отмеченные поля'); return; }
    if (!rows.length) { toast('Нужна хотя бы одна услуга'); return; }
    store.set('services', rows); SERVICES = loadServices(); ownDraft = null; renderHome(); renderOwner('#panel'); toast('Услуги сохранены'); return;
  }
  if (act === 'reset-svc') { store.del('services'); SERVICES = loadServices(); ownDraft = null; renderHome(); renderOwner('#panel'); toast('Список услуг вернули как был'); return; }
  if (act === 'sch-all') { $$('.sch__row', owner).forEach((row) => { $('[data-f="on"]', row).checked = true; $$('select', row).forEach((s) => { s.disabled = false; }); $('[data-f="from"]', row).value = 0; $('[data-f="to"]', row).value = 1440; }); toast('Все дни круглосуточно. Нажмите «Сохранить»'); return; }
  if (act === 'reset-sch') { store.del('schedule'); SCHED = loadSchedule(); renderHome(); renderOwner('#panel'); toast('График вернули как был'); return; }
  if (act === 'save-sch') {
    let ok = true; const next = {};
    $$('.sch__row', owner).forEach((row) => {
      const on = $('[data-f="on"]', row).checked, from = +$('[data-f="from"]', row).value, to = +$('[data-f="to"]', row).value;
      const err = $('.field__err', row); err.textContent = '';
      if (on && to <= from) { err.textContent = 'Конец должен быть позже начала'; ok = false; }
      next[row.dataset.d] = { on, from, to };
    });
    if (!ok) { toast('Исправьте время работы'); return; }
    if (!DAYS.some((d) => next[d].on)) { toast('Нужен хотя бы один рабочий день'); return; }
    SCHED = next; store.set('schedule', next); renderHome(); renderOwner('#panel'); toast('График сохранён'); return;
  }
});
owner.addEventListener('change', (e) => {
  if (e.target.matches('.sch [data-f="on"]')) {
    const row = e.target.closest('.sch__row');
    $$('select', row).forEach((s) => { s.disabled = !e.target.checked; });
  }
});
owner.addEventListener('submit', (e) => {
  if (e.target.id !== 'login-form') return;
  e.preventDefault();
  const m = $('#l-mail', owner), p = $('#l-pass', owner);
  const set = (id, msg) => { const el = $('#err-' + id, owner); el.textContent = msg || ''; const i = $('#' + id, owner); if (msg) i.setAttribute('aria-invalid', 'true'); else i.removeAttribute('aria-invalid'); };
  set('l-mail'); set('l-pass');
  let ok = true;
  if (!/^\S+@\S+\.\S+$/.test(m.value.trim())) { set('l-mail', 'Введите почту, например name@mail.ru'); ok = false; }
  if (!p.value) { set('l-pass', 'Введите пароль'); if (ok) p.focus(); ok = false; }
  if (!ok) { if (!p.value && /^\S+@\S+\.\S+$/.test(m.value.trim())) p.focus(); else m.focus(); return; }
  sess.set('auth', '1'); renderOwner(); toast('Добро пожаловать');
});
owner.addEventListener('input', (e) => { if (e.target.closest('#login-form')) { const el = $('#err-' + e.target.id, owner); if (el) el.textContent = ''; e.target.removeAttribute('aria-invalid'); } });

/* ====================== главная и маршрутизация ====================== */
let homeDone = false;
function renderHome() {
  const root = $('#view-home');
  root.innerHTML = homeHTML();
  if (typeof homeInit === 'function') homeInit(root);
  renderDock();
}
function renderDock() {
  const dock = $('#dock');
  dock.innerHTML = '<a class="dock__btn dock__btn--main" href="#/book">' + icon('cal') + '<span>Записаться</span></a>' +
    (MAIN_PHONE ? '<a class="dock__btn" href="' + telHref(MAIN_PHONE) + '">' + icon('phone') + '<span>Позвонить</span></a>' : '') +
    '<a class="dock__btn" href="' + routeHref() + '" target="_blank" rel="noopener noreferrer">' + icon('route') + '<span>Маршрут</span></a>';
}
document.addEventListener('click', (e) => {
  const lbBtn = e.target.closest('[data-open-lb]');
  if (lbBtn) { openLightbox(+lbBtn.dataset.openLb); return; }
  const sc = e.target.closest('[data-scroll]');
  if (sc) { e.preventDefault(); const t = document.getElementById(sc.dataset.scroll); if (t) t.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); }
});

let prevPath = null;
function route() {
  const raw = location.hash.slice(1) || '/';
  const qi = raw.indexOf('?');
  const path = qi < 0 ? raw : raw.slice(0, qi);
  const q = new URLSearchParams(qi < 0 ? '' : raw.slice(qi + 1));
  const isOwner = path === '/owner';
  $('#view-home').hidden = isOwner;
  $('#view-owner').hidden = !isOwner;
  document.body.dataset.route = isOwner ? 'owner' : path === '/book' ? 'book' : 'home';
  const sl = $('#strip-link');
  sl.textContent = isOwner ? 'Сайт для гостей' : 'Кабинет владельца';
  sl.setAttribute('href', isOwner ? '#/' : '#/owner');
  if (isOwner) {
    closeSheetEl();
    if (card.open) card.close();
    renderOwner();
    window.scrollTo(0, 0);
  } else {
    if (!homeDone) { renderHome(); homeDone = true; }
    if (path === '/book') openSheet(q.get('s'), prevPath !== '/book');
    else { closeSheetEl(); if (prevPath === '/owner') window.scrollTo(0, 0); }
  }
  prevPath = path;
}
window.addEventListener('hashchange', route);
route();

})();
