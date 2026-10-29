/* Прототип онлайн-записи. Данные: data.js (window.BUSINESS). Без зависимостей. */
(function () {
'use strict';
const B = window.BUSINESS;
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const NB = ' ';
const reduceMotion = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- иконки (контурные, свой набор) ---------- */
const ICONS = {
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  route: '<polygon points="3 11 22 2 13 21 11 13 3 11"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  calplus: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M12 14v4M10 16h4"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  star: '<polygon fill="currentColor" stroke="none" points="12 2 15.1 8.3 22 9.3 17 14.1 18.2 21 12 17.8 5.8 21 7 14.1 2 9.3 8.9 8.3 12 2"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  back: '<path d="m15 18-6-6 6-6"/>',
  next: '<path d="m9 18 6-6-6-6"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  plus: '<path d="M5 12h14M12 5v14"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
  chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
  out: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  tag: '<path d="M12 2H2v10l9.3 9.3a1 1 0 0 0 1.4 0l8.6-8.6a1 1 0 0 0 0-1.4Z"/><path d="M7 7h.01"/>'
};
const ic = (n, cls) => '<svg class="ic' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + (ICONS[n] || '') + '</svg>';

/* ---------- состояние (localStorage) ---------- */
const KEY = 'proto-' + B.slug;
const blank = () => ({ services: null, schedule: null, resources: null, appts: [], status: {} });
let S;
try { S = Object.assign(blank(), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { S = blank(); }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* приватный режим */ } };
let auth = false;
try { auth = sessionStorage.getItem(KEY + '-auth') === '1'; } catch (e) { /* нет */ }

/* ---------- форматирование ---------- */
const plural = (n, f) => { const a = Math.abs(n) % 100, b = a % 10; return a > 10 && a < 20 ? f[2] : b > 1 && b < 5 ? f[1] : b === 1 ? f[0] : f[2]; };
const rub = n => Number(n).toLocaleString('ru-RU').replace(/[  ]/g, NB) + NB + '₽';
const priceText = s => s.price == null ? 'по запросу' : (s.priceFrom ? 'от' + NB : '') + rub(s.price);
const durText = m => { const h = Math.floor(m / 60), mm = m % 60; return (h ? h + NB + 'ч' : '') + (h && mm ? ' ' : '') + (mm ? mm + NB + 'мин' : ''); };
const fmtPhone = p => { const d = String(p).replace(/\D/g, ''); return d.length === 11 ? '+7' + NB + '(' + d.slice(1, 4) + ')' + NB + d.slice(4, 7) + '-' + d.slice(7, 9) + '-' + d.slice(9) : p; };
const digits = p => String(p).replace(/\D/g, '');
const tm = m => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
const parseTm = t => { const m = /^(\d{1,2}):(\d{2})/.exec(t || ''); return m ? +m[1] * 60 + +m[2] : null; };
const ymd = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const fromYmd = s => { const p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); };
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const DOW = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const DOWKEY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DOW_ORDER = [1, 2, 3, 4, 5, 6, 0];
const longDate = d => d.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
const shortDate = d => d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
const today0 = () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); };
const stars = n => '<span class="stars" role="img" aria-label="' + n + ' из 5">' + [1, 2, 3, 4, 5].map(i => '<span class="star' + (i <= Math.round(n) ? ' on' : '') + '">' + ic('star') + '</span>').join('') + '</span>';
const ratingText = r => String(r).replace('.', ',');
const bizName = B.name.replace(/\s*\|\s*/g, ' | ');
const photo = f => '../../../tenants/' + B.slug + '/' + f;
const routeUrl = 'https://yandex.ru/maps/?rtext=~' + B.point.lat + ',' + B.point.lon + '&rtt=auto';
const AUTO = ['автомойка', 'детейлинг', 'автосервис', 'тонировка'].indexOf(B.niche) >= 0;
const EXTRA = AUTO ? { label: 'Марка и модель машины', ph: 'Например, Kia Rio', err: 'Укажите марку и модель машины' }
  : B.niche === 'груминг' ? { label: 'Кличка и порода', ph: 'Например, Бим, шпиц', err: 'Укажите кличку и породу' } : null;
const RES_GEN = { 'кресло': 'кресел', 'бокс': 'боксов', 'подъёмник': 'подъёмников', 'мастер': 'мастеров' };
const KINDS = { facade: 'Фасад', work: 'Работа', interior: 'Интерьер', team: 'Команда', result: 'Результат', pet: 'Питомец' };

/* ---------- услуги, график, мощность ---------- */
const baseServices = B.services.map((s, i) => Object.assign({}, s, { id: 's' + i }));
const services = () => S.services || baseServices;
const svcById = id => services().find(s => s.id === id);
const schedule = () => S.schedule || B.schedule;
const resCount = () => S.resources != null ? S.resources : B.resources.count;
const resLabel = B.resources.label;
function dayRanges(d) {
  const day = schedule()[DOWKEY[d.getDay()]];
  const wh = day && day.working_hours ? day.working_hours : [];
  return wh.map(r => [parseTm(r.from), parseTm(r.to)]).filter(r => r[0] != null && r[1] != null && r[1] > r[0]);
}
function groupsOf(list) {
  const out = [];
  list.forEach(s => {
    let g = out.find(x => x.name === s.category);
    if (!g) { g = { name: s.category, items: [] }; out.push(g); }
    g.items.push(s);
  });
  return out;
}
const dayText = i => { const r = dayRanges(addDays(today0(), (i - today0().getDay() + 7) % 7)); return r.length ? r.map(x => tm(x[0]) + '–' + tm(x[1])).join(', ') : 'выходной'; };
function hoursGroups() {
  const out = [];
  DOW_ORDER.forEach(i => {
    const text = dayText(i), last = out[out.length - 1];
    if (last && last.text === text) last.days.push(i); else out.push({ text: text, days: [i] });
  });
  return out.map(g => ({ text: g.text, label: g.days.length > 1 ? DOW[g.days[0]] + '–' + DOW[g.days[g.days.length - 1]] : DOW[g.days[0]] }));
}
const hoursRows = () => DOW_ORDER.map(i => ({ day: DOW[i], text: dayText(i), today: i === today0().getDay() }));
function openStatus() {
  const now = new Date(), nm = now.getHours() * 60 + now.getMinutes();
  const r = dayRanges(today0());
  for (const x of r) if (nm >= x[0] && nm < x[1]) return { open: true, text: 'Открыто до' + NB + tm(x[1]) };
  const later = r.find(x => x[0] > nm);
  if (later) return { open: false, text: 'Откроется сегодня в' + NB + tm(later[0]) };
  for (let k = 1; k < 8; k++) {
    const rr = dayRanges(addDays(today0(), k));
    if (rr.length) return { open: false, text: 'Откроется ' + (k === 1 ? 'завтра' : DOW[addDays(today0(), k).getDay()].toLowerCase()) + ' в' + NB + tm(rr[0][0]) };
  }
  return { open: false, text: 'Закрыто' };
}
function contactLinks() {
  const c = B.contacts || {}, out = [];
  (c.phones || []).forEach(p => out.push({ kind: 'phone', label: fmtPhone(p), href: 'tel:' + p, icon: 'phone' }));
  if (c.whatsapp) out.push({ kind: 'whatsapp', label: 'WhatsApp', href: c.whatsapp, icon: 'chat', ext: true });
  if (c.telegram) out.push({ kind: 'telegram', label: 'Telegram', href: c.telegram, icon: 'send', ext: true });
  if (c.vk) out.push({ kind: 'vk', label: 'ВКонтакте', href: c.vk, icon: 'link', ext: true });
  if (c.email) out.push({ kind: 'email', label: c.email, href: 'mailto:' + c.email, icon: 'mail' });
  return out;
}
const mainPhone = () => (B.contacts.phones || [])[0];
const mainService = () => services()[0];
const ratingLine = () => ratingText(B.rating);
const reviewsWord = () => B.reviewsCount + NB + plural(B.reviewsCount, ['отзыв', 'отзыва', 'отзывов']);
const photos = () => B.photos.map(p => ({ src: photo(p.file), kind: p.kind, alt: KINDS[p.kind] || 'Фото' }));
const callHref = () => mainPhone() ? 'tel:' + mainPhone() : '#/';
const dock = () => '<nav class="dock" aria-label="Быстрые действия">' +
  '<a class="dock-main" href="#/book">' + ic('calendar') + '<span>Записаться</span></a>' +
  (mainPhone() ? '<a href="' + callHref() + '">' + ic('phone') + '<span>Позвонить</span></a>' : '') +
  '<a href="' + routeUrl + '" target="_blank" rel="noopener">' + ic('route') + '<span>Маршрут</span></a></nav>';

/* ---------- мок-записи (одинаковые при каждой загрузке) ---------- */
const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const rng = seed => { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const NAMES = ['Алексей', 'Мария', 'Дмитрий', 'Ольга', 'Сергей', 'Анна', 'Иван', 'Елена', 'Артём', 'Наталья', 'Павел', 'Юлия', 'Максим', 'Татьяна'];
const CARS = ['Kia Rio', 'Hyundai Solaris', 'Lada Vesta', 'Toyota Camry', 'Skoda Octavia', 'Volkswagen Polo', 'Renault Duster', 'Haval Jolion', 'BMW 3', 'Nissan Qashqai', 'Mazda 6'];
const mockCache = {};
function mockFor(dstr) {
  const d = fromYmd(dstr), key = dstr + '|' + JSON.stringify(schedule()) + '|' + resCount();
  if (mockCache[key]) return mockCache[key];
  const r = rng(hash(B.slug + dstr)), ranges = dayRanges(d), cap = resCount(), out = [];
  const pool = baseServices.filter(s => !s.long && s.durationMin <= 180), list = pool.length ? pool : baseServices;
  if (ranges.length) {
    const a = ranges[0][0], b = ranges[ranges.length - 1][1], n = Math.round(cap * 3.2);
    for (let k = 0; k < n * 3 && out.length < n; k++) {
      const s = list[Math.floor(r() * list.length)], dur = s.durationMin, steps = Math.floor((b - a - dur) / 30);
      if (steps < 0) continue;
      const st = a + Math.floor(r() * (steps + 1)) * 30;
      if (!ranges.some(x => st >= x[0] && st + dur <= x[1])) continue;
      if (out.filter(x => x.start < st + dur && x.start + x.dur > st).length >= cap) continue;
      const nm = NAMES[Math.floor(r() * NAMES.length)], num = String(10 + Math.floor(r() * 89));
      out.push({ id: 'm-' + dstr + '-' + out.length, src: 'mock', kind: 'slot', date: dstr, start: st, dur: dur, time: tm(st), svc: s.name, price: priceText(s), name: nm, phone: '+790000000' + num, car: AUTO ? CARS[Math.floor(r() * CARS.length)] : '', status: 'new' });
    }
  }
  out.sort((x, y) => x.start - y.start);
  mockCache[key] = out;
  return out;
}
function autoStatus(a) {
  const now = new Date();
  if (a.date !== ymd(now)) return a.date < ymd(now) ? 'done' : 'new';
  const nm = now.getHours() * 60 + now.getMinutes();
  if (a.start + a.dur <= nm) return hash(a.id) % 7 === 0 ? 'noshow' : 'done';
  if (a.start <= nm) return 'came';
  return 'new';
}
const status = a => S.status[a.id] || (a.src === 'mock' ? autoStatus(a) : a.status) || 'new';
const apptsFor = dstr => mockFor(dstr).concat(S.appts.filter(a => a.date === dstr && a.kind === 'slot')).sort((x, y) => x.start - y.start);
const requests = () => S.appts.filter(a => a.kind === 'request');
function findAppt(id) {
  for (let k = 0; k < 7; k++) { const f = apptsFor(ymd(addDays(today0(), k))).find(a => a.id === id); if (f) return f; }
  return S.appts.find(a => a.id === id);
}
const STATUS = {
  new: { t: 'Ожидается', i: 'clock' }, came: { t: 'Пришёл', i: 'user' }, noshow: { t: 'Не пришёл', i: 'x' },
  done: { t: 'Выполнено', i: 'check' }, cancelled: { t: 'Отменено', i: 'x' }
};
const badge = a => { const s = status(a), m = STATUS[s]; return '<span class="badge st-' + s + '">' + ic(m.i) + m.t + '</span>'; };

function slotsFor(svc, d) {
  const ranges = dayRanges(d);
  if (!ranges.length) return null;
  const now = new Date(), isToday = ymd(d) === ymd(now), nm = now.getHours() * 60 + now.getMinutes();
  const taken = apptsFor(ymd(d)).filter(a => status(a) !== 'cancelled'), cap = resCount(), dur = svc.durationMin, out = [];
  ranges.forEach(rg => {
    for (let t = rg[0]; t + dur <= rg[1]; t += 30) {
      if (isToday && t < nm + 30) continue;
      /* долгие работы (от 4 часов): смотрим занятость на момент начала */
      const n = taken.filter(x => dur >= 240 ? (x.start <= t && x.start + x.dur > t) : (x.start < t + dur && x.start + x.dur > t)).length;
      if (n < cap) out.push(t);
    }
  });
  return out;
}

let toastTimer;
function toast(msg) {
  const el = $('#toast'); if (!el) return;
  el.textContent = msg; el.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

/* ---------- главная: НикАвто ---------- */
function renderHome() {
  const ph = photos(), c = contactLinks(), os = openStatus(), main = mainService();
  const row = s => '<button class="row" data-act="book" data-id="' + s.id + '"><span class="row-name">' + esc(s.name) + (s.long ? '<small>Мастер перезвонит</small>' : '<small>' + durText(s.durationMin) + '</small>') + '</span><span class="plate-price' + (s.price == null ? ' ask' : '') + '">' + priceText(s) + '</span></button>';
  const heroI = Math.max(0, ph.findIndex(p => /owner-10/.test(p.src)));
  const rev = B.reviews;
  return '<header class="top"><a class="logo" href="#/" aria-label="' + esc(B.name) + ', на главную"><span>' + esc(B.name) + '</span></a><nav class="top-nav" aria-label="Разделы"><button data-act="scroll" data-to="prices">Прайс</button><button data-act="scroll" data-to="photos">Фото</button><button data-act="scroll" data-to="reviews">Отзывы</button><button data-act="scroll" data-to="visit">Адрес</button></nav><a class="btn btn-primary top-cta" href="#/book">Записаться</a></header>' +
    '<section class="hero"><div class="hero-copy"><p class="hero-where">Автомойка, ' + esc(B.district) + ', ' + esc(B.city) + '</p><h1>' + esc(B.name) + '</h1>' +
    '<p class="hero-lead">' + esc(main.name) + ' ' + priceText(main) + '</p>' +
    '<div class="hero-plate" role="group" aria-label="Рейтинг"><b>' + ratingLine() + '</b><span>' + stars(B.rating) + '<small>' + reviewsWord() + '</small></span></div>' +
    '<div class="hero-actions"><a class="btn btn-primary" href="#/book">' + ic('calendar') + 'Записаться</a>' + (mainPhone() ? '<a class="btn btn-ghost" href="' + callHref() + '">' + ic('phone') + 'Позвонить</a>' : '') + '</div>' +
    '<p class="hero-open"><span class="dot' + (os.open ? ' on' : '') + '"></span>' + os.text + '</p></div>' +
    '<div class="hero-img"><img src="' + esc(ph[heroI].src) + '" alt="Синий Haval после мойки, на бампере рамка НикАвто" fetchpriority="high"></div></section>' +
    '<section class="sec board" id="prices"><div class="board-in"><h2>Прайс</h2>' + groupsOf(services()).map(g => '<div class="bgroup"><h3>' + esc(g.name) + '</h3>' + g.items.map(row).join('') + '</div>').join('') + '</div></section>' +
    '<section class="sec" id="photos"><h2>Фото</h2><div class="masonry">' + ph.map((p, i) => '<button class="shot" data-act="zoom" data-i="' + i + '" aria-label="Открыть фото: ' + esc(p.alt) + '"><img src="' + esc(p.src) + '" alt="' + esc(p.alt) + '" loading="lazy"></button>').join('') + '</div></section>' +
    '<section class="sec" id="reviews"><h2>Отзывы</h2><div class="rev-grid"><figure class="rev rev-main"><blockquote>' + esc(rev[0].text) + '</blockquote><figcaption>' + stars(5) + esc(rev[0].author) + '</figcaption></figure><div class="rev-list">' +
    rev.slice(1).map(r => '<figure class="rev"><blockquote>' + esc(r.text) + '</blockquote><figcaption>' + esc(r.author) + '</figcaption></figure>').join('') + '</div></div></section>' +
    '<section class="sec" id="visit"><div class="visit"><div><h2>Как доехать</h2><p class="addr">' + esc(B.address) + '<br>' + esc(B.district) + ', ' + esc(B.city) + '</p><a class="btn btn-primary" href="' + routeUrl + '" target="_blank" rel="noopener">' + ic('route') + 'Построить маршрут</a></div>' +
    '<dl class="hours">' + hoursGroups().map(g => '<div><dt>' + g.label + '</dt><dd>' + g.text + '</dd></div>').join('') + '</dl>' +
    '<ul class="links">' + c.map(l => '<li><a href="' + esc(l.href) + '"' + (l.ext ? ' target="_blank" rel="noopener"' : '') + '>' + ic(l.icon) + esc(l.label) + '</a></li>').join('') + '</ul></div></section>' +
    '<footer class="foot"><span>' + esc(B.name) + ', ' + esc(B.city) + '</span><a href="#/owner">Кабинет владельца</a></footer>' + dock();
}


/* ---------- запись: нижний лист / полный экран ---------- */
const sheetEl = $('#sheet'), homeEl = $('#home'), ownerEl = $('#owner'), lbEl = $('#lightbox'), modalEl = $('#modal');
let Bk = null, lastFocus = null, homeDirty = true;
const newBk = id => {
  const s = id && svcById(id);
  return { step: s ? (s.long ? 3 : 2) : 1, svcId: s ? s.id : null, date: null, time: null, name: '', phone: '', car: '', consent: false, errors: {}, done: null, cancelled: false };
};
function openSheet() {
  if (sheetEl.hidden) { lastFocus = document.activeElement; sheetEl.hidden = false; document.body.classList.add('is-sheet'); sheetEl.classList.add('enter'); setTimeout(() => sheetEl.classList.remove('enter'), 400); }
  renderSheet();
}
function closeSheet() {
  if (sheetEl.hidden) return;
  sheetEl.hidden = true; sheetEl.innerHTML = ''; document.body.classList.remove('is-sheet'); Bk = null;
  if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
}
function pickDefaultDate(svc) {
  for (let k = 0; k < 7; k++) { const d = addDays(today0(), k), s = slotsFor(svc, d); if (s && s.length) return ymd(d); }
  return ymd(today0());
}
const stepTotal = () => { const s = svcById(Bk.svcId); return s && s.long ? 2 : 3; };
const stepNum = () => Bk.step === 3 && stepTotal() === 2 ? 2 : Bk.step;
function summaryHTML(editStep) {
  const s = svcById(Bk.svcId); if (!s) return '';
  let when = '';
  if (!s.long && Bk.date) when = '<span>' + ic('calendar') + esc(longDate(fromYmd(Bk.date))) + (Bk.time != null ? ', ' + tm(Bk.time) : '') + '</span>';
  return '<div class="summary"><div class="summary-main"><b>' + esc(s.name) + '</b><span class="summary-meta">' +
    (s.long ? '<span>' + ic('phone') + 'Мастер перезвонит</span>' : '<span>' + ic('clock') + durText(s.durationMin) + '</span>') + when +
    '<span>' + ic('tag') + priceText(s) + '</span></span></div><button class="link-btn" data-act="goto" data-step="' + editStep + '">Изменить</button></div>';
}
function renderSheet() {
  if (!Bk) return;
  let title, body = '', foot = '', head = true;
  if (Bk.done) {
    const a = findAppt(Bk.done), isReq = a.kind === 'request';
    head = false;
    if (Bk.cancelled) {
      title = isReq ? 'Заявка отменена' : 'Запись отменена';
      body = '<div class="done done-off"><span class="done-ic">' + ic('x') + '</span><h2 id="sheet-title" tabindex="-1">' + title + '</h2><p>Мы убрали её из расписания. Можно выбрать другое время.</p></div>';
      foot = '<button class="btn btn-primary" data-act="restart">Записаться снова</button><button class="btn btn-ghost" data-act="close-sheet">На главную</button>';
    } else {
      title = isReq ? 'Заявка принята' : 'Вы записаны';
      const rows = [['Услуга', a.svc], isReq ? null : ['Когда', longDate(fromYmd(a.date)) + ', ' + a.time], ['Имя', a.name], ['Телефон', fmtPhone(a.phone)], a.car ? [EXTRA ? EXTRA.label : '', a.car] : null, ['Стоимость', a.price], ['Адрес', B.address + ', ' + B.city]].filter(Boolean);
      body = '<div class="done"><span class="done-ic">' + ic('check') + '</span><h2 id="sheet-title" tabindex="-1">' + title + '</h2>' +
        (isReq ? '<p>Мастер перезвонит по номеру ' + esc(fmtPhone(a.phone)) + ' и согласует время.</p>' : '<p>Ждём вас. Если планы изменятся, отмените запись здесь же.</p>') +
        '<dl class="facts">' + rows.map(r => '<div><dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd></div>').join('') + '</dl></div>';
      foot = (isReq ? '' : '<button class="btn btn-primary" data-act="ics">' + ic('calplus') + 'Добавить в календарь</button>') +
        '<button class="btn btn-ghost" data-act="ask-cancel">' + (isReq ? 'Отменить заявку' : 'Отменить запись') + '</button>' +
        '<button class="link-btn center" data-act="close-sheet">На главную</button>';
    }
  } else if (Bk.step === 1) {
    title = 'Выберите услугу';
    body = '<div class="opts">' + groupsOf(services()).map(g => '<h3 class="grp">' + esc(g.name) + '</h3>' + g.items.map(s =>
      '<button class="opt' + (s.id === Bk.svcId ? ' on' : '') + '" data-act="pick-svc" data-id="' + s.id + '"><span class="opt-name">' + esc(s.name) + '</span><span class="opt-meta">' +
      (s.long ? 'Мастер перезвонит' : durText(s.durationMin)) + '</span><span class="opt-price">' + priceText(s) + '</span></button>').join('')).join('') + '</div>';
  } else if (Bk.step === 2) {
    title = 'Дата и время';
    const s = svcById(Bk.svcId);
    if (!Bk.date) Bk.date = pickDefaultDate(s);
    const days = []; for (let k = 0; k < 7; k++) days.push(addDays(today0(), k));
    body = summaryHTML(1) + '<div class="days" role="group" aria-label="Дата">' + days.map(d => {
      const sl = slotsFor(s, d), off = !sl || !sl.length, on = ymd(d) === Bk.date;
      return '<button class="day' + (on ? ' on' : '') + (off ? ' off' : '') + '" data-act="pick-day" data-d="' + ymd(d) + '" aria-pressed="' + on + '"' + (off ? ' disabled' : '') + '><small>' + DOW[d.getDay()] + '</small><b>' + d.getDate() + '</b></button>';
    }).join('') + '</div><div id="slot-area"></div>';
    foot = '<button class="btn btn-primary" data-act="next" id="next-btn"' + (Bk.time == null ? ' disabled' : '') + '>Дальше</button>';
  } else {
    const s = svcById(Bk.svcId), long = s.long, E = Bk.errors;
    title = long ? 'Оставьте заявку' : 'Ваши данные';
    const f = (id, label, type, extra, val, err) => '<div class="field' + (err ? ' bad' : '') + '"><label for="' + id + '">' + label + '</label><input id="' + id + '" name="' + id + '" type="' + type + '" value="' + esc(val) + '" ' + extra + (err ? ' aria-invalid="true" aria-describedby="' + id + '-e"' : '') + '>' + (err ? '<p class="err" id="' + id + '-e">' + err + '</p>' : '') + '</div>';
    body = summaryHTML(long ? 1 : 2) + '<form id="book-form" novalidate>' +
      f('f-name', 'Как вас зовут', 'text', 'autocomplete="given-name" maxlength="40"', Bk.name, E.name) +
      f('f-phone', 'Телефон', 'tel', 'inputmode="tel" autocomplete="tel" placeholder="+7 (___) ___-__-__" maxlength="18"', Bk.phone, E.phone) +
      (EXTRA ? f('f-car', EXTRA.label, 'text', 'autocomplete="off" placeholder="' + EXTRA.ph + '" maxlength="60"', Bk.car, E.car) : '') +
      '<div class="check' + (E.consent ? ' bad' : '') + '"><input type="checkbox" id="f-consent"' + (Bk.consent ? ' checked' : '') + (E.consent ? ' aria-invalid="true" aria-describedby="f-consent-e"' : '') + '><label for="f-consent">Согласен на обработку персональных данных и принимаю <a href="#" data-act="policy">политику конфиденциальности</a></label>' + (E.consent ? '<p class="err" id="f-consent-e">Поставьте галочку, иначе записать не получится</p>' : '') + '</div>' +
      '<input class="hp" type="text" name="site" tabindex="-1" autocomplete="off" aria-hidden="true"></form>';
    foot = '<button class="btn btn-primary" data-act="submit">' + (long ? 'Оставить заявку, мастер перезвонит' : 'Записаться') + '</button>';
  }
  const num = stepNum(), tot = stepTotal();
  sheetEl.innerHTML = '<div class="sheet-backdrop" data-act="close-sheet"></div><section class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title">' +
    (head ? '<header class="sheet-head">' + (Bk.step > 1 ? '<button class="icon-btn" data-act="back" aria-label="Назад">' + ic('back') + '</button>' : '<span class="icon-btn ghost"></span>') +
      '<div class="sheet-title"><p class="sheet-step">Шаг ' + num + ' из ' + tot + '</p><h2 id="sheet-title" tabindex="-1">' + title + '</h2></div>' +
      '<button class="icon-btn" data-act="close-sheet" aria-label="Закрыть">' + ic('x') + '</button></header>' +
      '<div class="progress" aria-hidden="true">' + Array.from({ length: tot }, (_, i) => '<i class="' + (i < num ? 'on' : '') + '"></i>').join('') + '</div>'
      : '<header class="sheet-head sheet-head-end"><button class="icon-btn" data-act="close-sheet" aria-label="Закрыть">' + ic('x') + '</button></header>') +
    '<div class="sheet-body">' + body + '</div>' + (foot ? '<footer class="sheet-foot">' + foot + '</footer>' : '') + '</section>';
  if (Bk.step === 2 && !Bk.done) renderSlots();
  const h = $('#sheet-title'); if (h) h.focus({ preventScroll: true });
}
function renderSlots() {
  const s = svcById(Bk.svcId), area = $('#slot-area'); if (!area) return;
  const sl = slotsFor(s, fromYmd(Bk.date)) || [];
  const parts = [['Утро', t => t < 720], ['День', t => t >= 720 && t < 1020], ['Вечер', t => t >= 1020]];
  area.innerHTML = '<p class="slot-date">' + esc(longDate(fromYmd(Bk.date))) + '</p>' + (sl.length ? parts.map(p => {
    const l = sl.filter(p[1]);
    return l.length ? '<h3 class="grp">' + p[0] + '</h3><div class="slots">' + l.map(t => '<button class="slot' + (t === Bk.time ? ' on' : '') + '" data-act="pick-time" data-t="' + t + '" aria-pressed="' + (t === Bk.time) + '">' + tm(t) + '</button>').join('') + '</div>' : '';
  }).join('') : '<p class="empty-note">На этот день свободного времени нет. Выберите другой день.</p>');
}
function toStep(n) { Bk.step = n; renderSheet(); const b = $('.sheet-body'); if (b) b.scrollTop = 0; }
function validateBooking() {
  const e = {};
  if (Bk.name.trim().length < 2) e.name = 'Напишите имя, чтобы мы знали, как к вам обращаться';
  if (digits(Bk.phone).length !== 11) e.phone = 'Введите номер полностью: +7 и 10 цифр';
  if (EXTRA && Bk.car.trim().length < 2) e.car = EXTRA.err;
  if (!Bk.consent) e.consent = true;
  Bk.errors = e; return Object.keys(e).length === 0;
}
function submitBooking() {
  const hp = $('.hp'); if (hp && hp.value) return;
  if (!validateBooking()) { renderSheet(); const first = $('.sheet [aria-invalid="true"]'); if (first) first.focus(); return; }
  const s = svcById(Bk.svcId), id = 'u' + Date.now().toString(36);
  S.appts.push({ id: id, src: 'user', kind: s.long ? 'request' : 'slot', date: s.long ? ymd(today0()) : Bk.date, start: s.long ? 0 : Bk.time, dur: s.durationMin, time: s.long ? '' : tm(Bk.time), svc: s.name, price: priceText(s), name: Bk.name.trim(), phone: '+' + digits(Bk.phone), car: Bk.car.trim(), status: 'new', created: Date.now() });
  save(); Bk.done = id; Bk.cancelled = false; renderSheet();
}
function downloadIcs() {
  const a = findAppt(Bk.done); if (!a) return;
  const dt = (d, m) => d.replace(/-/g, '') + 'T' + String(Math.floor(m / 60)).padStart(2, '0') + String(m % 60).padStart(2, '0') + '00';
  const e = x => String(x).replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
  const n = new Date(), p2 = v => String(v).padStart(2, '0');
  const stamp = n.getUTCFullYear() + p2(n.getUTCMonth() + 1) + p2(n.getUTCDate()) + 'T' + p2(n.getUTCHours()) + p2(n.getUTCMinutes()) + '00Z';
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//' + bizName + '//Demo//RU', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT', 'UID:' + a.id + '@' + B.slug + '.demo', 'DTSTAMP:' + stamp,
    'DTSTART:' + dt(a.date, a.start), 'DTEND:' + dt(a.date, a.start + a.dur), 'SUMMARY:' + e(a.svc + ', ' + bizName), 'LOCATION:' + e(B.address + ', ' + B.city),
    'DESCRIPTION:' + e('Запись на ' + a.svc + '. Телефон: ' + (mainPhone() ? fmtPhone(mainPhone()) : '')), 'BEGIN:VALARM', 'TRIGGER:-PT60M', 'ACTION:DISPLAY', 'DESCRIPTION:Через час: ' + e(a.svc), 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'];
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob), l = document.createElement('a');
  l.href = url; l.download = B.slug + '-zapis.ics'; document.body.appendChild(l); l.click(); l.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000); toast('Файл календаря скачан');
}
function maskPhone(v) {
  let d = String(v).replace(/\D/g, ''); if (d[0] === '7' || d[0] === '8') d = d.slice(1); d = d.slice(0, 10);
  let r = '+7'; if (d.length) r += ' (' + d.slice(0, 3); if (d.length >= 3) r += ')'; if (d.length > 3) r += ' ' + d.slice(3, 6); if (d.length > 6) r += '-' + d.slice(6, 8); if (d.length > 8) r += '-' + d.slice(8, 10);
  return r;
}

/* ---------- фото (просмотр) ---------- */
let lbIndex = 0;
function openLb(i) {
  const list = photos(); lbIndex = (i + list.length) % list.length;
  const p = list[lbIndex];
  if (lbEl.hidden) { lastFocus = document.activeElement; lbEl.hidden = false; }
  lbEl.innerHTML = '<div class="lb-inner" role="dialog" aria-modal="true" aria-label="Просмотр фото"><button class="icon-btn lb-close" data-act="lb-close" aria-label="Закрыть">' + ic('x') + '</button>' +
    '<button class="icon-btn lb-prev" data-act="lb-prev" aria-label="Предыдущее фото">' + ic('back') + '</button><img src="' + esc(p.src) + '" alt="' + esc(p.alt) + '">' +
    '<button class="icon-btn lb-next" data-act="lb-next" aria-label="Следующее фото">' + ic('next') + '</button><p class="lb-cap">' + (lbIndex + 1) + ' из ' + list.length + ', ' + esc(p.alt.toLowerCase()) + '</p></div>';
  $('.lb-close', lbEl).focus();
}
function closeLb() { if (lbEl.hidden) return; lbEl.hidden = true; lbEl.innerHTML = ''; if (lastFocus && document.contains(lastFocus)) lastFocus.focus(); }

/* ---------- кабинет владельца ---------- */
let ownerTab = 'appts', ownerRange = 'today', draftSvc = null, draftSch = null, draftRes = null;
function renderOwner() {
  if (!auth) {
    ownerEl.innerHTML = '<div class="o-login"><a class="o-back" href="#/">' + ic('back') + 'На сайт</a><form class="o-card" id="login-form" novalidate><h1>Вход в кабинет</h1><p class="o-hint">Демо-доступ: подойдут любая почта и любой пароль.</p>' +
      '<div class="field"><label for="l-mail">Почта</label><input id="l-mail" type="email" autocomplete="username" placeholder="owner@example.ru"></div>' +
      '<div class="field"><label for="l-pass">Пароль</label><input id="l-pass" type="password" autocomplete="current-password"></div>' +
      '<p class="err" id="l-err" role="alert"></p><button class="btn btn-primary btn-wide" type="submit">' + ic('lock') + 'Войти</button></form></div>';
    return;
  }
  const tabs = [['appts', 'Записи'], ['services', 'Услуги и цены'], ['schedule', 'График']];
  ownerEl.innerHTML = '<div class="o-wrap"><header class="o-head"><div class="o-brand"><span class="o-name">' + esc(bizName) + '</span><span class="o-sub">Кабинет владельца</span></div><div class="o-head-r"><a class="btn btn-ghost btn-sm" href="#/">' + ic('back') + 'На сайт</a><button class="btn btn-ghost btn-sm" data-act="logout">' + ic('out') + 'Выйти</button></div></header>' +
    '<div class="tabs" role="tablist" aria-label="Разделы кабинета">' + tabs.map(t => '<button role="tab" id="tab-' + t[0] + '" aria-selected="' + (ownerTab === t[0]) + '" aria-controls="o-panel" data-act="tab" data-t="' + t[0] + '">' + t[1] + '</button>').join('') + '</div><div id="o-panel" role="tabpanel" aria-labelledby="tab-' + ownerTab + '"></div></div>';
  renderOwnerPanel();
}
function apptRow(a) {
  const req = a.kind === 'request';
  return '<button class="appt" data-act="open-appt" data-id="' + a.id + '"><span class="appt-time"><b>' + (req ? 'Звонок' : a.time) + '</b>' + (req ? '' : '<small>до ' + tm(a.start + a.dur) + '</small>') + '</span><span class="appt-main"><b>' + esc(a.svc) + '</b><span>' + esc(a.name) + (a.car ? ', ' + esc(a.car) : '') + '</span></span>' + badge(a) + '</button>';
}
function renderOwnerPanel() {
  const p = $('#o-panel'); if (!p) return;
  if (ownerTab === 'appts') {
    const days = []; for (let k = 0; k < (ownerRange === 'today' ? 1 : 7); k++) days.push(addDays(today0(), k));
    const reqs = requests().filter(a => status(a) !== 'cancelled' && status(a) !== 'done');
    const todayList = apptsFor(ymd(today0())).filter(a => status(a) !== 'cancelled');
    const waiting = todayList.filter(a => status(a) === 'new').length;
    let html = '<div class="o-bar"><div class="seg" role="group" aria-label="Период"><button data-act="range" data-r="today" aria-pressed="' + (ownerRange === 'today') + '">Сегодня</button><button data-act="range" data-r="week" aria-pressed="' + (ownerRange === 'week') + '">Неделя</button></div><button class="btn btn-primary" data-act="manual">' + ic('plus') + 'Записать вручную</button></div>' +
      '<p class="o-sum">Сегодня ' + todayList.length + NB + plural(todayList.length, ['запись', 'записи', 'записей']) + ', ждут ' + waiting + '. ' + (RES_GEN[resLabel] || 'мест').replace(/^./, c => c.toUpperCase()) + ' в работе: ' + resCount() + '.</p>';
    if (reqs.length) html += '<section class="o-day"><h3>Заявки, нужно перезвонить</h3>' + reqs.map(apptRow).join('') + '</section>';
    days.forEach((d, i) => {
      const list = apptsFor(ymd(d)), closed = !dayRanges(d).length;
      html += '<section class="o-day"><h3>' + (i === 0 ? 'Сегодня' : i === 1 ? 'Завтра' : DOW[d.getDay()]) + ', ' + shortDate(d) + '</h3>' +
        (list.length ? list.map(apptRow).join('') : '<p class="empty-note">' + (closed ? 'Выходной.' : 'Записей нет.') + ' Если клиент позвонил, запишите его вручную.</p>') + '</section>';
    });
    p.innerHTML = html;
  } else if (ownerTab === 'services') {
    if (!draftSvc) draftSvc = services().map(s => Object.assign({}, s));
    p.innerHTML = '<p class="o-hint">Изменения сохраняются в этом браузере и сразу видны посетителям на главной и в записи.</p><div class="svc-edit">' + draftSvc.map((s, i) =>
      '<div class="svc-row" data-i="' + i + '"><div class="field f-name"><label for="sn' + i + '">Название</label><input id="sn' + i + '" data-f="name" value="' + esc(s.name) + '"></div>' +
      '<div class="field f-price"><label for="sp' + i + '">Цена, ₽</label><input id="sp' + i + '" data-f="price" inputmode="numeric" placeholder="по запросу" value="' + (s.price == null ? '' : s.price) + '"></div>' +
      '<div class="field f-dur"><label for="sd' + i + '">Минут</label><input id="sd' + i + '" data-f="durationMin" inputmode="numeric" value="' + s.durationMin + '"></div>' +
      '<label class="tick"><input type="checkbox" data-f="priceFrom"' + (s.priceFrom ? ' checked' : '') + '><span>Цена «от»</span></label>' +
      '<label class="tick"><input type="checkbox" data-f="long"' + (s.long ? ' checked' : '') + '><span>Долгая: без выбора времени</span></label>' +
      '<button class="icon-btn danger" data-act="del-svc" data-i="' + i + '" aria-label="Удалить услугу ' + esc(s.name) + '">' + ic('trash') + '</button></div>').join('') + '</div>' +
      '<p class="err" id="svc-err" role="alert"></p><div class="o-actions"><button class="btn btn-ghost" data-act="add-svc">' + ic('plus') + 'Добавить услугу</button><button class="btn btn-primary" data-act="save-svc">Сохранить</button><button class="link-btn" data-act="reset-svc">Вернуть исходные</button></div>';
  } else {
    if (!draftSch) {
      draftSch = {};
      DOW_ORDER.forEach(i => { const r = dayRanges(addDays(today0(), (i - today0().getDay() + 7) % 7)); draftSch[i] = r.length ? { on: true, from: tm(r[0][0]), to: tm(r[0][1]) } : { on: false, from: '09:00', to: '18:00' }; });
      draftRes = resCount();
    }
    p.innerHTML = '<p class="o-hint">Записаться можно только в рабочие часы. В выходной день время посетителям не показывается.</p><div class="sch-edit">' + DOW_ORDER.map(i => '<div class="sch-row"><label class="tick"><input type="checkbox" data-d="' + i + '" data-f="on"' + (draftSch[i].on ? ' checked' : '') + '><span>' + DOW[i] + '</span></label>' +
      '<div class="field"><label for="sf' + i + '">С</label><input id="sf' + i + '" type="time" step="1800" data-d="' + i + '" data-f="from" value="' + draftSch[i].from + '"' + (draftSch[i].on ? '' : ' disabled') + '></div>' +
      '<div class="field"><label for="st' + i + '">До</label><input id="st' + i + '" type="time" step="1800" data-d="' + i + '" data-f="to" value="' + draftSch[i].to + '"' + (draftSch[i].on ? '' : ' disabled') + '></div></div>').join('') + '</div>' +
      '<div class="field f-res"><label for="res">Сколько ' + (RES_GEN[resLabel] || 'мест') + ' работает одновременно</label><input id="res" type="number" min="1" max="20" value="' + draftRes + '"></div><p class="err" id="sch-err" role="alert"></p>' +
      '<div class="o-actions"><button class="btn btn-primary" data-act="save-sch">Сохранить</button></div>';
  }
}
function openModal(html) {
  if (modalEl.hidden) { lastFocus = document.activeElement; modalEl.hidden = false; document.body.classList.add('is-modal'); }
  modalEl.innerHTML = '<div class="modal-backdrop" data-act="modal-close"></div><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">' + html + '</section>';
  const h = $('#modal-title'); if (h) h.focus({ preventScroll: true });
}
function closeModal() { if (modalEl.hidden) return; modalEl.hidden = true; modalEl.innerHTML = ''; document.body.classList.remove('is-modal'); if (lastFocus && document.contains(lastFocus)) lastFocus.focus(); }
function apptModal(id) {
  const a = findAppt(id); if (!a) return;
  const st = status(a), wa = 'https://wa.me/' + digits(a.phone);
  const rows = [['Услуга', a.svc], a.kind === 'request' ? ['Что нужно', 'Перезвонить и согласовать время'] : ['Когда', longDate(fromYmd(a.date)) + ', ' + a.time + '–' + tm(a.start + a.dur)], ['Телефон', fmtPhone(a.phone)], a.car ? [EXTRA ? EXTRA.label : '', a.car] : null, ['Стоимость', a.price]].filter(Boolean);
  openModal('<header class="modal-head"><h2 id="modal-title" tabindex="-1">' + esc(a.name) + '</h2><button class="icon-btn" data-act="modal-close" aria-label="Закрыть">' + ic('x') + '</button></header><div class="modal-body">' +
    '<p>' + badge(a) + '</p><dl class="facts">' + rows.map(r => '<div><dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd></div>').join('') + '</dl>' +
    '<div class="contact-row"><a class="btn btn-primary" href="tel:+' + digits(a.phone) + '">' + ic('phone') + 'Позвонить</a><a class="btn btn-ghost" href="' + wa + '" target="_blank" rel="noopener">' + ic('chat') + 'WhatsApp</a></div>' +
    '<h3 class="grp">Статус</h3><div class="status-set">' + ['came', 'noshow', 'done', 'cancelled'].map(k => '<button class="st-btn st-' + k + '" data-act="set-status" data-id="' + a.id + '" data-s="' + k + '" aria-pressed="' + (st === k) + '">' + ic(STATUS[k].i) + STATUS[k].t + '</button>').join('') + '</div></div>');
}
function manualModal() {
  const s = services().filter(x => !x.long), days = []; for (let k = 0; k < 7; k++) days.push(addDays(today0(), k));
  openModal('<header class="modal-head"><h2 id="modal-title" tabindex="-1">Записать вручную</h2><button class="icon-btn" data-act="modal-close" aria-label="Закрыть">' + ic('x') + '</button></header><form class="modal-body" id="manual-form" novalidate>' +
    '<div class="field"><label for="m-svc">Услуга</label><select id="m-svc">' + s.map(x => '<option value="' + x.id + '">' + esc(x.name) + ', ' + priceText(x) + '</option>').join('') + '</select></div>' +
    '<div class="two"><div class="field"><label for="m-date">День</label><select id="m-date">' + days.filter(d => dayRanges(d).length).map(d => '<option value="' + ymd(d) + '">' + DOW[d.getDay()] + ', ' + shortDate(d) + '</option>').join('') + '</select></div>' +
    '<div class="field"><label for="m-time">Время</label><select id="m-time"></select></div></div>' +
    '<div class="field"><label for="m-name">Имя клиента</label><input id="m-name" autocomplete="off"><p class="err" id="m-name-e"></p></div>' +
    '<div class="field"><label for="m-phone">Телефон</label><input id="m-phone" type="tel" inputmode="tel" placeholder="+7 (___) ___-__-__" maxlength="18"><p class="err" id="m-phone-e"></p></div>' +
    (EXTRA ? '<div class="field"><label for="m-car">' + EXTRA.label + ' (по желанию)</label><input id="m-car" autocomplete="off"></div>' : '') +
    '<button class="btn btn-primary btn-wide" type="submit">Записать</button></form>');
  fillManualTimes();
}
function fillManualTimes() {
  const d = $('#m-date'), t = $('#m-time'), sv = $('#m-svc'); if (!d || !t) return;
  const s = svcById(sv.value), date = fromYmd(d.value), free = slotsFor(s, date) || [], opts = [];
  dayRanges(date).forEach(rg => { for (let x = rg[0]; x + s.durationMin <= rg[1]; x += 30) opts.push(x); });
  t.innerHTML = opts.map(x => '<option value="' + x + '">' + tm(x) + (free.indexOf(x) < 0 ? ', занято' : '') + '</option>').join('');
  const f = opts.find(x => free.indexOf(x) >= 0); if (f != null) t.value = f;
}

/* ---------- события ---------- */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const act = el.dataset.act;
  switch (act) {
    case 'scroll': { e.preventDefault(); const t = document.getElementById(el.dataset.to); if (t) t.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' }); break; }
    case 'book': e.preventDefault(); location.hash = '#/book' + (el.dataset.id ? '?s=' + el.dataset.id : ''); break;
    case 'zoom': openLb(+el.dataset.i); break;
    case 'lb-close': closeLb(); break;
    case 'lb-prev': openLb(lbIndex - 1); break;
    case 'lb-next': openLb(lbIndex + 1); break;
    case 'close-sheet': location.hash = '#/'; break;
    case 'back': if (Bk) { const s = svcById(Bk.svcId); toStep(Bk.step === 3 && s && s.long ? 1 : Bk.step - 1); } break;
    case 'goto': toStep(+el.dataset.step); break;
    case 'pick-svc': { const s = svcById(el.dataset.id); Bk.svcId = s.id; Bk.date = null; Bk.time = null; toStep(s.long ? 3 : 2); break; }
    case 'pick-day': {
      Bk.date = el.dataset.d; Bk.time = null;
      $$('.day').forEach(b => { const on = b.dataset.d === Bk.date; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
      renderSlots(); const n = $('#next-btn'); if (n) n.disabled = true; break;
    }
    case 'pick-time': {
      Bk.time = +el.dataset.t;
      $$('.slot').forEach(b => { const on = +b.dataset.t === Bk.time; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
      const n = $('#next-btn'); if (n) n.disabled = false; break;
    }
    case 'next': if (Bk.time != null) toStep(3); break;
    case 'submit': submitBooking(); break;
    case 'policy': e.preventDefault(); toast('Политику конфиденциальности добавим перед запуском'); break;
    case 'ics': downloadIcs(); break;
    case 'ask-cancel': {
      const f = $('.sheet-foot');
      if (f) { f.innerHTML = '<p class="confirm-q">Отменить? Время освободится для других.</p><button class="btn btn-danger" data-act="do-cancel">Да, отменить</button><button class="btn btn-ghost" data-act="keep">Оставить</button>'; $('.btn-danger', f).focus(); }
      break;
    }
    case 'keep': renderSheet(); break;
    case 'do-cancel': S.status[Bk.done] = 'cancelled'; save(); Bk.cancelled = true; renderSheet(); break;
    case 'restart': Bk = newBk(); renderSheet(); break;
    case 'logout': auth = false; try { sessionStorage.removeItem(KEY + '-auth'); } catch (x) { /* нет */ } renderOwner(); break;
    case 'tab': ownerTab = el.dataset.t; renderOwner(); break;
    case 'range': ownerRange = el.dataset.r; renderOwnerPanel(); break;
    case 'open-appt': apptModal(el.dataset.id); break;
    case 'modal-close': closeModal(); break;
    case 'set-status': S.status[el.dataset.id] = el.dataset.s; save(); apptModal(el.dataset.id); renderOwnerPanel(); toast('Статус: ' + STATUS[el.dataset.s].t.toLowerCase()); break;
    case 'manual': manualModal(); break;
    case 'add-svc': {
      draftSvc.push({ id: 'n' + Date.now().toString(36), name: '', price: null, priceFrom: false, durationMin: 60, long: false, category: 'Другое', source: 'owner' });
      renderOwnerPanel(); const rows = $$('.svc-row'), last = rows[rows.length - 1];
      if (last) { last.scrollIntoView({ block: 'center' }); $('input', last).focus(); } break;
    }
    case 'del-svc': draftSvc.splice(+el.dataset.i, 1); renderOwnerPanel(); break;
    case 'reset-svc': S.services = null; save(); draftSvc = null; homeDirty = true; renderOwnerPanel(); toast('Вернули исходный список'); break;
    case 'save-svc': {
      const err = $('#svc-err'); err.textContent = '';
      for (let i = 0; i < draftSvc.length; i++) {
        const s = draftSvc[i];
        if (!String(s.name).trim()) { err.textContent = 'У услуги № ' + (i + 1) + ' нет названия. Заполните или удалите её.'; return; }
        if (!(s.durationMin >= 10)) { err.textContent = 'Длительность услуги «' + s.name + '» не меньше 10 минут.'; return; }
      }
      draftSvc.forEach(s => { s.name = String(s.name).trim(); });
      S.services = draftSvc.map(s => Object.assign({}, s)); save(); homeDirty = true; draftSvc = null; renderOwnerPanel(); toast('Сохранено'); break;
    }
    case 'save-sch': {
      const err = $('#sch-err'); err.textContent = '';
      const sc = {};
      for (const i of DOW_ORDER) {
        const r = draftSch[i];
        if (r.on) {
          if (parseTm(r.to) <= parseTm(r.from)) { err.textContent = DOW[i] + ': время «до» должно быть позже времени «с».'; return; }
          sc[DOWKEY[i]] = { working_hours: [{ from: r.from, to: r.to }] };
        } else sc[DOWKEY[i]] = { working_hours: [] };
      }
      if (!(draftRes >= 1)) { err.textContent = 'Укажите число от 1.'; return; }
      S.schedule = sc; S.resources = +draftRes; save(); homeDirty = true; draftSch = null; renderOwnerPanel(); toast('График сохранён'); break;
    }
    default: break;
  }
});
document.addEventListener('submit', e => {
  const f = e.target;
  if (f.id === 'login-form') {
    e.preventDefault();
    const m = $('#l-mail').value.trim(), p = $('#l-pass').value, err = $('#l-err');
    if (!/^\S+@\S+\.\S+$/.test(m)) { err.textContent = 'Введите почту целиком, например owner@example.ru'; $('#l-mail').focus(); return; }
    if (!p) { err.textContent = 'Введите пароль. В демо подойдёт любой.'; $('#l-pass').focus(); return; }
    auth = true; try { sessionStorage.setItem(KEY + '-auth', '1'); } catch (x) { /* нет */ }
    renderOwner(); const t = $('[role=tab][aria-selected=true]'); if (t) t.focus();
  } else if (f.id === 'manual-form') {
    e.preventDefault();
    const name = $('#m-name').value.trim(), ph = $('#m-phone').value; let bad = false;
    $('#m-name-e').textContent = name.length < 2 ? (bad = true, 'Напишите имя клиента') : '';
    $('#m-phone-e').textContent = digits(ph).length !== 11 ? (bad = true, 'Введите номер полностью: +7 и 10 цифр') : '';
    if (bad) return;
    const s = svcById($('#m-svc').value), st = +$('#m-time').value, car = $('#m-car') ? $('#m-car').value.trim() : '';
    S.appts.push({ id: 'u' + Date.now().toString(36), src: 'manual', kind: 'slot', date: $('#m-date').value, start: st, dur: s.durationMin, time: tm(st), svc: s.name, price: priceText(s), name: name, phone: '+' + digits(ph), car: car, status: 'new', created: Date.now() });
    save(); closeModal(); renderOwnerPanel(); toast('Запись добавлена');
  }
});
document.addEventListener('input', e => {
  const t = e.target;
  if (t.id === 'f-phone' || t.id === 'm-phone') t.value = maskPhone(t.value);
  if (Bk && !Bk.done) {
    if (t.id === 'f-name') Bk.name = t.value; else if (t.id === 'f-phone') Bk.phone = t.value; else if (t.id === 'f-car') Bk.car = t.value;
  }
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.id === 'f-consent' && Bk) Bk.consent = t.checked;
  if (t.id === 'm-date' || t.id === 'm-svc') fillManualTimes();
  const row = t.closest('.svc-row');
  if (row && draftSvc) {
    const s = draftSvc[+row.dataset.i], f = t.dataset.f;
    if (f === 'name') s.name = t.value;
    else if (f === 'price') { const v = t.value.replace(/\D/g, ''); s.price = v === '' ? null : +v; t.value = v; }
    else if (f === 'durationMin') s.durationMin = parseInt(t.value, 10) || 0;
    else if (f === 'priceFrom') s.priceFrom = t.checked;
    else if (f === 'long') s.long = t.checked;
  }
  if (t.closest('.sch-edit') && draftSch) {
    const i = t.dataset.d, f = t.dataset.f;
    if (f === 'on') { draftSch[i].on = t.checked; renderOwnerPanel(); } else draftSch[i][f] = t.value;
  }
  if (t.id === 'res') draftRes = parseInt(t.value, 10);
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (!lbEl.hidden) closeLb(); else if (!modalEl.hidden) closeModal(); else if (!sheetEl.hidden) location.hash = '#/';
  } else if (!lbEl.hidden && e.key === 'ArrowRight') openLb(lbIndex + 1);
  else if (!lbEl.hidden && e.key === 'ArrowLeft') openLb(lbIndex - 1);
  else if (e.key === 'Tab') {
    const box = !lbEl.hidden ? lbEl : !modalEl.hidden ? $('.modal', modalEl) : !sheetEl.hidden ? $('.sheet', sheetEl) : null;
    if (!box) return;
    const f = $$('a[href],button:not([disabled]),input:not([disabled]):not(.hp),select,textarea', box).filter(x => x.offsetParent !== null);
    if (!f.length) return;
    if (e.shiftKey && (document.activeElement === f[0] || !box.contains(document.activeElement))) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  }
});

/* ---------- маршруты ---------- */
function route() { const h = (location.hash || '#/').slice(1).split('?'); return { path: h[0] || '/', q: new URLSearchParams(h[1] || '') }; }
function onRoute() {
  const r = route(), isOwner = r.path === '/owner';
  closeLb(); closeModal();
  homeEl.hidden = isOwner; ownerEl.hidden = !isOwner;
  if (!isOwner && homeDirty) { homeEl.innerHTML = renderHome(); homeDirty = false; }
  if (r.path === '/book') {
    const sid = r.q.get('s');
    if (!Bk) Bk = newBk(sid); else if (sid && !Bk.done && svcById(sid)) Bk = newBk(sid);
    openSheet();
  } else closeSheet();
  if (isOwner) { renderOwner(); window.scrollTo(0, 0); }
  document.title = (isOwner ? 'Кабинет: ' : '') + bizName + ', ' + B.city + (isOwner ? '' : ': онлайн-запись');
}
window.addEventListener('hashchange', onRoute);
onRoute();
})();
