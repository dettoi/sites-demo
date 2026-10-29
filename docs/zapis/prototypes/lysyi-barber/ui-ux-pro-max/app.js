(function () {
'use strict';
/* ===== Дизайн: «Прайс-доска барбера» — тёплая бумага, Swiss-сетка, Playfair + Golos Text, прайс с точечными линиями ===== */
const D = {
  renderHome: function () {
    var st = openStatus(), main = mainService(), mi = services.indexOf(main), links = contactLinks();
    var hero = PHOTOS.filter(function (p) { return p.kind === 'result'; })[0] || PHOTOS[0];
    var groups = groupServices(services);
    var chips = groups.map(function (c, i) { return '<button type="button" class="jump" data-act="goto" data-to="cat-' + i + '">' + esc(c.name) + '</button>'; }).join('');
    var board = groups.map(function (c, ci) {
      return '<section class="board-cat" id="cat-' + ci + '" aria-labelledby="cat-h-' + ci + '"><h3 class="board-h" id="cat-h-' + ci + '">' + esc(c.name) + '</h3><ul>' + c.items.map(function (it) {
        var s = it.s;
        return '<li><button type="button" class="row" data-act="book" data-i="' + it.i + '"><span class="row-name">' + esc(s.name) + '<small>' + esc(fmtDur(s)) + '</small></span><span class="row-dots" aria-hidden="true"></span><span class="row-price">' + esc(fmtPrice(s)) + '</span></button></li>';
      }).join('') + '</ul></section>';
    }).join('');
    var gal = PHOTOS.map(function (p, i) {
      return '<li class="tile"><img src="' + esc(p.url) + '" alt="' + esc(p.alt) + '" width="' + p.w + '" height="' + p.h + '" loading="lazy" decoding="async"></li>';
    }).join('');
    var rev = B.reviews.map(function (r) {
      return '<li class="note"><blockquote><p>' + esc(r.text) + '</p></blockquote><p class="note-by"><strong>' + esc(r.author) + '</strong><span>' + icon('star', 'note-star', 14) + r.rating + '</span></p></li>';
    }).join('');
    var hrs = hoursRows().map(function (r) { return '<div><dt>' + esc(r.d) + '</dt><dd>' + esc(r.t) + '</dd></div>'; }).join('');
    var contacts = links.map(function (l) { return '<a class="pill" href="' + esc(l.href) + '" target="_blank" rel="noopener">' + icon(l.ic, '', 18) + '<span>' + esc(l.label) + '</span></a>'; }).join('');
    return '<header class="top"><div class="wrap top-in"><span class="top-name">' + esc(B.name) + '</span><nav class="top-nav" aria-label="Разделы"><button type="button" data-act="goto" data-to="price">Прайс</button><button type="button" data-act="goto" data-to="works">Работы</button><button type="button" data-act="goto" data-to="reviews">Отзывы</button><button type="button" data-act="goto" data-to="contacts">Контакты</button></nav><button type="button" class="btn btn--primary btn--sm top-cta" data-act="book">Записаться</button></div></header>' +
      '<div class="stripe" aria-hidden="true"></div>' +
      '<div class="wrap">' +
      '<section class="intro"><div class="intro-text"><p class="intro-k">' + esc(B.niche) + ' · ' + esc(B.city) + '</p><h1 class="name">' + esc(B.name) + '</h1>' +
      '<p class="rate"><span class="rate-n">' + icon('star', '', 20) + ratingText() + '</span><span>' + reviewsText() + '</span></p>' +
      '<p class="open"><span class="open-dot' + (st.open ? ' on' : '') + '" aria-hidden="true"></span>' + esc(st.text) + '</p>' +
      '<div class="intro-cta"><button type="button" class="btn btn--primary" data-act="book">' + icon('cal', '', 20) + 'Записаться</button>' + (PHONE ? '<a class="btn btn--ghost" href="' + esc(telHref(PHONE)) + '">' + icon('phone', '', 20) + 'Позвонить</a>' : '') + '</div>' +
      '<button type="button" class="feature" data-act="book" data-i="' + mi + '"><span class="feature-k">Главная услуга</span><span class="feature-row"><span class="feature-n">' + esc(main.name) + '</span><span class="feature-p">' + esc(fmtPrice(main)) + '</span></span><span class="feature-go">Выбрать время ' + icon('arrow', '', 18) + '</span></button></div>' +
      '<figure class="intro-photo"><img src="' + esc(hero.url) + '" alt="' + esc(hero.alt) + '" width="' + hero.w + '" height="' + hero.h + '" fetchpriority="high"></figure></section>' +
      '<section class="sec" id="price" aria-labelledby="h-price"><div class="sec-head"><h2 class="h2" id="h-price">Прайс</h2><p class="sec-note">Нажмите на строку, чтобы записаться.</p></div><div class="jumps" role="group" aria-label="Перейти к разделу прайса">' + chips + '</div><div class="board">' + board + '</div></section>' +
      '<section class="sec" id="works" aria-labelledby="h-works"><div class="sec-head"><h2 class="h2" id="h-works">Работы и зал</h2></div><ul class="mosaic">' + gal + '</ul></section>' +
      '<section class="sec" id="reviews" aria-labelledby="h-rev"><div class="sec-head"><h2 class="h2" id="h-rev">Что говорят клиенты</h2><p class="sec-note">' + ratingText() + ' из 5 · ' + reviewsText() + '</p></div><ul class="notes">' + rev + '</ul></section>' +
      '<section class="sec sec--last" id="contacts" aria-labelledby="h-c"><div class="panel"><div class="panel-a"><h2 class="h2" id="h-c">Как нас найти</h2><p class="addr">' + icon('pin', '', 22) + '<span>' + esc(B.city) + ', ' + esc(B.address) + '</span></p><a class="btn btn--light" href="' + esc(routeUrl()) + '" target="_blank" rel="noopener">' + icon('route', '', 20) + 'Построить маршрут</a>' +
      (PHONE ? '<p class="tel"><a href="' + esc(telHref(PHONE)) + '">' + icon('phone', '', 20) + esc(fmtPhone(PHONE)) + '</a></p>' : '') + '</div><div class="panel-b"><h3 class="panel-h">Часы работы</h3><dl class="hours">' + hrs + '</dl>' + (contacts ? '<h3 class="panel-h">Написать</h3><div class="pills">' + contacts + '</div>' : '') + '</div></div></section>' +
      '</div>' + bottomBarHtml();
  },
  onAct: function (act, el) {
    if (act === 'goto') {
      var t = document.getElementById(el.getAttribute('data-to'));
      if (t) { t.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); }
    }
  }
};

/* ================= ЯДРО: данные, запись, кабинет ================= */
const B = window.BUSINESS;
const SLUG = B.slug;
const LSP = 'proto-uiux:' + SLUG + ':';
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_FULL = { Mon: 'Понедельник', Tue: 'Вторник', Wed: 'Среда', Thu: 'Четверг', Fri: 'Пятница', Sat: 'Суббота', Sun: 'Воскресенье' };
const DAY_SH = { Mon: 'пн', Tue: 'вт', Wed: 'ср', Thu: 'чт', Fri: 'пт', Sat: 'сб', Sun: 'вс' };
const DAY_LONG = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const CAR_NICHES = ['автомойка', 'детейлинг', 'автосервис', 'тонировка'];
const HAS_CAR = CAR_NICHES.indexOf(B.niche) >= 0;
const HAS_PET = B.niche === 'груминг';
const RES_GEN = { 'бокс': 'боксов', 'мастер': 'мастеров', 'пост': 'постов' };
const MOCK_P = { 'барбершоп': 0.3, 'детейлинг': 0.14, 'автомойка': 0.22 }[B.niche] || 0.2;
const NAMES = ['Андрей', 'Михаил', 'Сергей', 'Дмитрий', 'Алексей', 'Игорь', 'Павел', 'Роман', 'Евгений', 'Максим', 'Олег', 'Никита', 'Артём', 'Виктор'];
const CARS = ['Kia Rio', 'Lada Vesta', 'Toyota Camry', 'Hyundai Solaris', 'Skoda Octavia', 'Renault Duster', 'Volkswagen Polo', 'Mazda 3'];
const ST = {
  'new': { t: 'Ожидается', i: 'clock' },
  came: { t: 'Пришёл', i: 'user' },
  noshow: { t: 'Не пришёл', i: 'ban' },
  done: { t: 'Выполнено', i: 'check' },
  cancelled: { t: 'Отменено', i: 'x' }
};
const KIND_ALT = { facade: 'фасад', work: 'работа', interior: 'интерьер', team: 'мастер за работой', result: 'результат', pet: 'питомец' };

/* ---------- утилиты ---------- */
function $(s, r) { return (r || document).querySelector(s); }
function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function pad(n) { return String(n).padStart(2, '0'); }
function clone(o) { return JSON.parse(JSON.stringify(o)); }
function dkey(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
function parseKey(k) { var p = k.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); }
function addDays(d, n) { var x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() + n); return x; }
function toMin(t) { var p = t.split(':').map(Number); return p[0] * 60 + p[1]; }
function fromMin(m) { return pad(Math.floor(m / 60)) + ':' + pad(m % 60); }
function plural(n, a, b, c) { var m = Math.abs(n) % 100, k = m % 10; if (m > 10 && m < 20) return c; if (k > 1 && k < 5) return b; if (k === 1) return a; return c; }
function fmtNum(n) { return String(Math.round(n * 100) / 100).replace('.', ','); }
function fmtMoney(n) { var s = String(Math.round(n * 100) / 100).split('.'); return s[0].replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0') + (s[1] ? ',' + s[1] : ''); }
function fmtPrice(s) {
  if (s.price == null) return s.priceNote && /тариф/i.test(s.priceNote) ? 'по тарифу' : 'по запросу';
  return (s.priceFrom ? 'от ' : '') + fmtMoney(s.price) + '\u00A0₽' + (s.priceUnit ? '/мин' : '');
}
function fmtDur(s) {
  var m = s.durationMin || 0;
  var t = m >= 60 ? Math.floor(m / 60) + '\u00A0ч' + (m % 60 ? ' ' + (m % 60) + '\u00A0мин' : '') : m + '\u00A0мин';
  return (s.durationStub ? '≈\u00A0' : '') + t;
}
function fmtPhone(p) { var d = String(p).replace(/\D/g, ''); return d.length === 11 ? '+7 ' + d.slice(1, 4) + ' ' + d.slice(4, 7) + '-' + d.slice(7, 9) + '-' + d.slice(9) : p; }
function telHref(p) { return 'tel:+' + String(p).replace(/\D/g, ''); }
function maskPhone(v) {
  var raw = String(v).replace(/\D/g, ''), d = raw;
  if (d[0] === '8' || d[0] === '7') d = d.slice(1);
  d = d.slice(0, 10);
  if (!d.length) return raw.length ? '+7' : '';
  var o = '+7 (' + d.slice(0, 3);
  if (d.length >= 3) o += ')';
  if (d.length > 3) o += ' ' + d.slice(3, 6);
  if (d.length > 6) o += '-' + d.slice(6, 8);
  if (d.length > 8) o += '-' + d.slice(8, 10);
  return o;
}
function fmtDate(d, short) {
  return short ? DAY_LONG[d.getDay()].slice(0, 2) + ', ' + d.getDate() + ' ' + MONTHS[d.getMonth()] : DAY_LONG[d.getDay()] + ', ' + d.getDate() + ' ' + MONTHS[d.getMonth()];
}
function hashStr(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { var a = seed; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function load(k, fb) { try { var v = localStorage.getItem(LSP + k); return v == null ? fb : JSON.parse(v); } catch (e) { return fb; } }
function save(k, v) { try { localStorage.setItem(LSP + k, JSON.stringify(v)); } catch (e) { /* без хранилища работаем в памяти */ } }
function drop(k) { try { localStorage.removeItem(LSP + k); } catch (e) { /* ок */ } }

/* ---------- иконки (контурные, стиль Lucide) ---------- */
const ICONS = {
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  route: '<polygon points="3 11 22 2 13 21 11 13 3 11"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  star: '<polygon fill="currentColor" points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  right: '<polyline points="9 18 15 12 9 6"/>',
  left: '<polyline points="15 18 9 12 15 6"/>',
  down: '<polyline points="6 9 12 15 18 9"/>',
  x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  ban: '<circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>',
  list: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
  tag: '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>',
  chat: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
  send: '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  globe: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  mail: '<path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><polyline points="22,6 12,13 2,6"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
  trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  arrow: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
  up: '<line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>',
  drop: '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>',
  moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
  sun: '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>',
  car: '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>'
};
function icon(n, cls, size) {
  size = size || 20;
  return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + (ICONS[n] || '') + '</svg>';
}

/* ---------- данные бизнеса ---------- */
const PHOTOS = (B.photos || []).map(function (p) {
  return { url: '../../../tenants/' + SLUG + '/' + p.file, kind: p.kind, w: p.w || 1080, h: p.h || 1350, alt: B.name + ': ' + (KIND_ALT[p.kind] || 'фото') };
});
const PHONE = (B.contacts && B.contacts.phones && B.contacts.phones[0]) || '';
let services = load('services', null) || clone(B.services);
let schedule = load('schedule', null) || (function () { var s = {}; WEEK.forEach(function (k) { s[k] = clone(B.schedule[k] || { working_hours: [] }); }); return s; })();
let resCount = load('res', B.resources ? B.resources.count : 1);

function groupServices(list) {
  var order = [], map = {};
  list.forEach(function (s, i) {
    var c = s.category || 'Услуги';
    if (!map[c]) { map[c] = []; order.push(c); }
    map[c].push({ s: s, i: i });
  });
  return order.map(function (c) { return { name: c, items: map[c] }; });
}
function mainService() {
  var f = services.filter(function (s) { return !s.long; });
  return (f[0] || services[0]);
}
function daySpans(k) { var d = schedule[k]; return d && d.working_hours ? d.working_hours : []; }
function is247() { return WEEK.every(function (k) { var s = daySpans(k); return s.length === 1 && s[0].from === '00:00' && s[0].to === '24:00'; }); }
function spanText(k) { var s = daySpans(k); return s.length ? s.map(function (x) { return x.from + '–' + x.to; }).join(', ') : 'выходной'; }
function hoursRows() {
  if (is247()) return [{ d: 'Пн–Вс', t: 'Круглосуточно' }];
  var rows = [];
  WEEK.forEach(function (k) {
    var t = spanText(k), last = rows[rows.length - 1];
    if (last && last.t === t) last.to = k; else rows.push({ from: k, to: k, t: t });
  });
  if (rows.length === 1) return [{ d: 'Ежедневно', t: rows[0].t }];
  return rows.map(function (r) { return { d: r.from === r.to ? DAY_SH[r.from] : DAY_SH[r.from] + '–' + DAY_SH[r.to], t: r.t }; });
}
function openStatus() {
  var now = new Date(), k = DAYS[now.getDay()], m = now.getHours() * 60 + now.getMinutes(), spans = daySpans(k), i, j;
  for (i = 0; i < spans.length; i++) if (m >= toMin(spans[i].from) && m < toMin(spans[i].to)) return { open: true, text: is247() ? 'Открыто круглосуточно' : 'Открыто до ' + spans[i].to };
  for (i = 0; i < 8; i++) {
    var dd = addDays(now, i), sp = daySpans(DAYS[dd.getDay()]);
    for (j = 0; j < sp.length; j++) if (i > 0 || toMin(sp[j].from) > m) return { open: false, text: 'Закрыто, откроемся ' + (i === 0 ? 'сегодня' : i === 1 ? 'завтра' : DAY_SH[DAYS[dd.getDay()]]) + ' в ' + sp[j].from };
  }
  return { open: false, text: 'Закрыто' };
}
function routeUrl() { return 'https://yandex.ru/maps/?rtext=~' + B.point.lat + '%2C' + B.point.lon + '&rtt=auto'; }
function pointUrl() { return 'https://yandex.ru/maps/?pt=' + B.point.lon + ',' + B.point.lat + '&z=16&l=map'; }
function contactLinks() {
  var c = B.contacts || {}, o = [];
  if (c.whatsapp) o.push({ k: 'whatsapp', label: 'WhatsApp', href: c.whatsapp, ic: 'chat' });
  if (c.telegram) o.push({ k: 'telegram', label: 'Telegram', href: c.telegram, ic: 'send' });
  if (c.vk) o.push({ k: 'vk', label: 'ВКонтакте', href: c.vk, ic: 'link' });
  if (c.max) o.push({ k: 'max', label: 'MAX', href: c.max, ic: 'chat' });
  if (c.website) o.push({ k: 'website', label: 'Сайт', href: c.website, ic: 'globe' });
  if (c.email) o.push({ k: 'email', label: c.email, href: 'mailto:' + c.email, ic: 'mail' });
  return o;
}
function ratingText() { return (Math.round(B.rating * 10) / 10).toFixed(1).replace('.', ','); }
function reviewsText() { return B.reviewsCount + '\u00A0' + plural(B.reviewsCount, 'отзыв', 'отзыва', 'отзывов'); }
function bottomBarHtml() {
  return '<nav class="dock" aria-label="Быстрые действия">' +
    '<button type="button" class="dock-main" data-act="book">' + icon('cal') + '<span>Записаться</span></button>' +
    (PHONE ? '<a class="dock-link" href="' + esc(telHref(PHONE)) + '">' + icon('phone') + '<span>Позвонить</span></a>' : '') +
    '<a class="dock-link" href="' + esc(routeUrl()) + '" target="_blank" rel="noopener">' + icon('route') + '<span>Маршрут</span></a>' +
    '</nav>';
}

/* ---------- записи ---------- */
let appts = [];
function genAppts() {
  var out = [], today = new Date(), nowM = today.getHours() * 60 + today.getMinutes();
  var base = services.filter(function (s) { return !s.long && s.durationMin; });
  if (!base.length) base = services.filter(function (s) { return s.durationMin; });
  var n = 0;
  for (var d = 0; d < 7; d++) {
    var date = addDays(today, d), key = dkey(date), spans = daySpans(DAYS[date.getDay()]);
    if (!spans.length || !base.length) continue;
    var r = rng(hashStr(SLUG + key)), busyUntil = -1;
    spans.forEach(function (sp) {
      var from = toMin(sp.from), to = toMin(sp.to);
      for (var t = from; t < to; t += 30) {
        if (r() > MOCK_P || t < busyUntil) continue;
        var s = base[Math.floor(r() * base.length)], dur = s.durationMin;
        if (t + dur > to) continue;
        busyUntil = t + dur;
        var st = 'new';
        if (d === 0) { if (t + dur <= nowM) st = r() < 0.8 ? 'done' : 'noshow'; else if (t <= nowM) st = 'came'; }
        n++;
        out.push({ id: 'm' + key + t, date: key, time: fromMin(t), dur: dur, service: s.name, price: fmtPrice(s), name: NAMES[(n * 5 + d) % NAMES.length], phone: '+7 900 000-00-' + pad(n % 100), car: HAS_CAR ? CARS[(n * 3) % CARS.length] : '', status: st, source: 'mock', long: false });
      }
    });
  }
  var longS = services.filter(function (s) { return s.long; });
  if (longS.length) {
    [0, 1].forEach(function (i) {
      var s = longS[i % longS.length];
      out.push({ id: 'req' + i, date: dkey(today), time: '', dur: 0, service: s.name, price: fmtPrice(s), name: NAMES[(i + 8) % NAMES.length], phone: '+7 900 000-00-9' + i, car: HAS_CAR ? CARS[(i + 4) % CARS.length] : '', status: 'new', source: 'mock', long: true });
    });
  }
  return out;
}
function loadAppts() {
  var stored = load('appts', null), tk = dkey(new Date());
  if (stored && stored.day === tk) appts = stored.list; else { appts = genAppts(); persistAppts(); }
}
function regenMock() { var keep = appts.filter(function (a) { return a.source !== 'mock'; }); appts = genAppts().concat(keep); persistAppts(); }
function persistAppts() { save('appts', { day: dkey(new Date()), list: appts }); }
function apptsFor(key) { return appts.filter(function (a) { return !a.long && a.date === key && a.status !== 'cancelled'; }); }
function slotsFor(date, svc) {
  var key = dkey(date), spans = daySpans(DAYS[date.getDay()]), dur = svc.durationMin || 60;
  var step = Math.max(15, Math.ceil(dur / 15) * 15), now = new Date(), isToday = key === dkey(now), nowM = now.getHours() * 60 + now.getMinutes();
  var taken = apptsFor(key), out = [];
  spans.forEach(function (sp) {
    var from = toMin(sp.from), to = toMin(sp.to);
    for (var t = from; t + dur <= to; t += step) {
      if (isToday && t < nowM + 15) continue;
      var busy = taken.some(function (a) { var s = toMin(a.time); return t < s + a.dur && t + dur > s; });
      out.push({ t: t, time: fromMin(t), busy: busy });
    }
  });
  return out;
}
function firstFreeDay(svc) { var days = nextWeekDays(); for (var i = 0; i < days.length; i++) if (slotsFor(days[i], svc).some(function (x) { return !x.busy; })) return dkey(days[i]); return dkey(days[0]); }
function nextWeekDays() { var a = [], t = new Date(); for (var i = 0; i < 7; i++) a.push(addDays(t, i)); return a; }

/* ---------- календарь .ics ---------- */
function icsStamp(d) { return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + 'T' + pad(d.getHours()) + pad(d.getMinutes()) + '00'; }
function icsEsc(s) { return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n'); }
function downloadIcs(a) {
  var s = parseKey(a.date); s.setMinutes(toMin(a.time));
  var e = new Date(s.getTime() + a.dur * 60000);
  var lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//' + B.name + '//Запись (демо)//RU', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
    'UID:' + a.id + '@' + SLUG + '.demo', 'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
    'DTSTART:' + icsStamp(s), 'DTEND:' + icsStamp(e),
    'SUMMARY:' + icsEsc(a.service + ' — ' + B.name), 'LOCATION:' + icsEsc(B.city + ', ' + B.address),
    'DESCRIPTION:' + icsEsc('Запись: ' + a.service + (PHONE ? '. Телефон: ' + fmtPhone(PHONE) : '')), 'END:VEVENT', 'END:VCALENDAR'];
  var blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  var url = URL.createObjectURL(blob), link = document.createElement('a');
  link.href = url; link.download = 'zapis-' + SLUG + '.ics';
  document.body.appendChild(link); link.click(); link.remove();
  setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
}

/* ---------- оболочка и маршрутизация ---------- */
const appEl = $('#app'), sheetRoot = $('#sheet-root'), toastEl = $('#toast'), demoEl = $('#demo-link');
let view = '', sheet = null, bk = null, pushedBook = false, lastFocus = null;
let owner = { authed: load('authed', false), tab: 'records', range: 'today', draftSvc: null, draftSch: null };
let toastTimer = null;

function toast(msg) {
  toastEl.textContent = msg; toastEl.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 3200);
}
function showHome() {
  if (view !== 'home') { appEl.innerHTML = D.renderHome(); view = 'home'; window.scrollTo(0, 0); }
  document.title = B.name + ' — запись онлайн';
  demoEl.innerHTML = 'Кабинет владельца ' + icon('arrow', '', 14); demoEl.setAttribute('href', '#/owner');
}
function showOwner() {
  if (view !== 'owner') { view = 'owner'; window.scrollTo(0, 0); }
  document.title = 'Кабинет — ' + B.name;
  demoEl.innerHTML = 'К сайту для клиентов ' + icon('arrow', '', 14); demoEl.setAttribute('href', '#/');
  renderOwner();
}
function route() {
  var h = location.hash || '#/';
  if (h.indexOf('#/owner') === 0) {
    if (sheet && sheet.kind === 'booking') closeSheet();
    showOwner();
  } else {
    if (view === 'owner') { if (sheet) closeSheet(); view = ''; }
    showHome();
    if (h.indexOf('#/book') === 0) { if (!sheet || sheet.kind !== 'booking') openBooking(); }
    else { pushedBook = false; if (sheet && sheet.kind === 'booking') closeSheet(); }
  }
}

/* ---------- нижний лист ---------- */
function openSheet(s) {
  lastFocus = document.activeElement; sheet = s;
  document.body.classList.add('sheet-open'); renderSheet({});
}
function closeSheet() {
  if (!sheet) return;
  sheet = null; sheetRoot.innerHTML = ''; document.body.classList.remove('sheet-open');
  if (lastFocus && lastFocus.focus && document.contains(lastFocus)) lastFocus.focus();
  lastFocus = null;
}
function closeAny() {
  if (!sheet) return;
  if (sheet.kind === 'booking') {
    if (pushedBook) { pushedBook = false; history.back(); }
    else { history.replaceState(null, '', location.pathname + location.search + '#/'); closeSheet(); }
  } else closeSheet();
}
function renderSheet(o) {
  var prev = $('.sheet-body', sheetRoot), top = prev ? prev.scrollTop : 0, html = '', same = o.keep;
  if (sheet.kind === 'booking') html = bookingHtml();
  else if (sheet.kind === 'appt') html = apptHtml();
  else if (sheet.kind === 'manual') html = manualHtml();
  sheetRoot.innerHTML = '<div class="backdrop" data-act="sheet-backdrop"></div><section class="sheet sheet--' + sheet.kind + '" role="dialog" aria-modal="true" aria-labelledby="sheet-title">' + html + '</section>';
  var body = $('.sheet-body', sheetRoot);
  if (body && same) body.scrollTop = top;
  var f = o.focus ? $(o.focus, sheetRoot) : null;
  if (!f) { f = $('#sheet-title', sheetRoot); }
  if (f) f.focus({ preventScroll: !!same });
}
function sheetHead(opts) {
  return '<header class="sheet-head">' +
    (opts.back ? '<button type="button" class="icon-btn" data-act="' + opts.back + '" aria-label="Назад">' + icon('left') + '</button>' : '<span class="icon-btn-spacer"></span>') +
    '<div class="sheet-head-mid">' + (opts.mid || '') + '</div>' +
    '<button type="button" class="icon-btn" data-act="sheet-close" aria-label="Закрыть">' + icon('x') + '</button></header>';
}
function field(id, label, input, err, hint) {
  return '<div class="field' + (err ? ' has-error' : '') + '"><label for="' + id + '">' + label + '</label>' + input +
    (hint ? '<p class="hint" id="h-' + id + '">' + hint + '</p>' : '') +
    (err ? '<p class="err" id="e-' + id + '" role="alert">' + icon('x', '', 14) + '<span>' + esc(err) + '</span></p>' : '') + '</div>';
}

/* ---------- запись посетителя ---------- */
function newBk(i) {
  return { step: 'service', svc: null, svcI: null, dateKey: null, time: '', part: null, name: '', phone: '', car: '', pet: '', consent: false, errors: {}, appt: null, cancelled: false, confirmCancel: false };
}
function startBooking(i) {
  bk = newBk();
  if (i != null && services[i]) { pickService(i); }
  pushedBook = true;
  if (location.hash === '#/book') { route(); } else location.hash = '#/book';
}
function openBooking() {
  if (!bk) bk = newBk();
  openSheet({ kind: 'booking' });
}
function bkSteps() { return bk.svc && bk.svc.long ? ['service', 'contact'] : ['service', 'time', 'contact']; }
function pickService(i) {
  bk.svc = clone(services[i]); bk.svcI = i; bk.time = ''; bk.errors = {};
  bk.step = bk.svc.long ? 'contact' : 'time';
  if (!bk.dateKey || !dayHasSlots(parseKey(bk.dateKey))) {
    var days = nextWeekDays(), f = days.filter(dayHasSlots)[0];
    bk.dateKey = f ? dkey(f) : dkey(days[0]);
  }
  bk.part = null;
}
function dayHasSlots(d) { return !!bk.svc && slotsFor(d, bk.svc).some(function (s) { return !s.busy; }); }
const PARTS = [{ n: 'Ночь', a: 0, b: 360 }, { n: 'Утро', a: 360, b: 720 }, { n: 'День', a: 720, b: 1080 }, { n: 'Вечер', a: 1080, b: 1441 }];

function bookingHtml() {
  if (bk.step === 'done') return doneHtml();
  var list = bkSteps(), idx = Math.max(0, list.indexOf(bk.step)), n = list.length;
  var mid = '<span class="progress-label">Шаг ' + (idx + 1) + ' из ' + n + '</span><div class="progress-bar" role="progressbar" aria-valuemin="1" aria-valuemax="' + n + '" aria-valuenow="' + (idx + 1) + '"><i style="width:' + ((idx + 1) / n * 100) + '%"></i></div>';
  var head = sheetHead({ back: idx > 0 ? 'bk-back' : '', mid: mid });
  if (bk.step === 'service') return head + stepService();
  if (bk.step === 'time') return head + stepTime();
  return head + stepContact();
}
function svcSummaryChip() {
  var s = bk.svc;
  return '<button type="button" class="chip-sum" data-act="bk-change-svc" aria-label="Изменить услугу: ' + esc(s.name) + '"><span class="chip-sum-t">' + esc(s.name) + '</span><span class="chip-sum-p">' + esc(fmtPrice(s)) + '</span>' + icon('edit', '', 16) + '</button>';
}
function stepService() {
  var g = groupServices(services).map(function (c) {
    return '<div class="opt-group"><h3 class="opt-cat">' + esc(c.name) + '</h3>' + c.items.map(function (it) {
      var s = it.s, sel = bk.svcI === it.i;
      return '<button type="button" class="opt" data-act="pick-svc" data-i="' + it.i + '" aria-pressed="' + sel + '">' +
        '<span class="opt-main"><span class="opt-name">' + esc(s.name) + '</span><span class="opt-meta">' + (s.long ? 'заявка, мастер перезвонит' : esc(fmtDur(s))) + '</span></span>' +
        '<span class="opt-price">' + esc(fmtPrice(s)) + '</span>' + icon('right', 'opt-go', 18) + '</button>';
    }).join('') + '</div>';
  }).join('');
  return '<div class="sheet-body"><h2 class="sheet-title" id="sheet-title" tabindex="-1">Что вам нужно?</h2><p class="sheet-sub">Выберите услугу, дальше подскажем свободное время.</p>' + g + '</div>';
}
function stepTime() {
  var days = nextWeekDays(), sel = parseKey(bk.dateKey);
  var strip = days.map(function (d, i) {
    var k = dkey(d), ok = dayHasSlots(d), on = k === bk.dateKey;
    return '<button type="button" class="day' + (i === 0 ? ' is-today' : '') + '" data-act="pick-day" data-k="' + k + '" aria-pressed="' + on + '"' + (ok ? '' : ' disabled') + ' aria-label="' + esc((i === 0 ? 'сегодня, ' : '') + fmtDate(d) + (ok ? '' : ', нет мест')) + '">' +
      '<span class="day-w">' + DAY_LONG[d.getDay()].slice(0, 2) + '</span><span class="day-n">' + d.getDate() + '</span></button>';
  }).join('');
  var slots = slotsFor(sel, bk.svc), parts = '', grid = '';
  var many = slots.length > 18;
  if (many) {
    var avail = PARTS.filter(function (p) { return slots.some(function (s) { return s.t >= p.a && s.t < p.b; }); });
    if (!bk.part || !avail.some(function (p) { return p.n === bk.part; })) {
      var firstFree = avail.filter(function (p) { return slots.some(function (s) { return !s.busy && s.t >= p.a && s.t < p.b; }); })[0] || avail[0];
      bk.part = firstFree ? firstFree.n : null;
    }
    parts = '<div class="parts" role="group" aria-label="Время суток">' + avail.map(function (p) {
      return '<button type="button" class="part" data-act="pick-part" data-p="' + p.n + '" aria-pressed="' + (p.n === bk.part) + '">' + p.n + '<small>' + pad(p.a / 60) + '–' + (p.b > 1440 ? '24' : pad(p.b / 60)) + '</small></button>';
    }).join('') + '</div>';
    var cur = PARTS.filter(function (p) { return p.n === bk.part; })[0];
    if (cur) slots = slots.filter(function (s) { return s.t >= cur.a && s.t < cur.b; });
  }
  grid = slots.length ? '<div class="slots" role="group" aria-label="Свободное время">' + slots.map(function (s) {
    return '<button type="button" class="slot' + (s.busy ? ' is-busy' : '') + '" data-act="pick-slot" data-t="' + s.time + '" aria-pressed="' + (bk.time === s.time) + '"' + (s.busy ? ' disabled aria-label="' + s.time + ', занято"' : '') + '>' + s.time + '</button>';
  }).join('') + '</div>' : '<p class="empty">На этот день мест нет. Выберите другой.</p>';
  var foot = '<div class="sheet-foot"><button type="button" class="btn btn--primary btn--block" data-act="bk-next"' + (bk.time ? '' : ' disabled') + '>' + (bk.time ? 'Дальше · ' + esc(fmtDate(sel, true)) + ', ' + bk.time : 'Выберите время') + icon('arrow', '', 18) + '</button></div>';
  return '<div class="sheet-body"><h2 class="sheet-title" id="sheet-title" tabindex="-1">Когда удобно?</h2>' + svcSummaryChip() +
    '<div class="days" role="group" aria-label="Дата">' + strip + '</div><p class="date-line">' + esc(fmtDate(sel)) + (bk.svc.durationMin ? ' · ' + esc(fmtDur(bk.svc)) : '') + '</p>' + parts + grid + '</div>' + foot;
}
function stepContact() {
  var e = bk.errors, s = bk.svc, long = !!s.long, sel = bk.dateKey ? parseKey(bk.dateKey) : null;
  var sum = '<dl class="sum"><div><dt>Услуга</dt><dd>' + esc(s.name) + '</dd></div>' +
    (long ? '<div><dt>Как</dt><dd>Мастер перезвонит и согласует день</dd></div>' : '<div><dt>Когда</dt><dd>' + esc(fmtDate(sel)) + ', ' + bk.time + '</dd></div>') +
    '<div><dt>Цена</dt><dd>' + esc(fmtPrice(s)) + '</dd></div></dl>';
  var car = HAS_CAR ? field('f-car', 'Марка и модель авто <span class="opt-tag">необязательно</span>', '<input id="f-car" name="car" type="text" autocomplete="off" value="' + esc(bk.car) + '">', '', '') : '';
  var pet = HAS_PET ? field('f-pet', 'Кличка и порода', '<input id="f-pet" name="pet" type="text" autocomplete="off" value="' + esc(bk.pet) + '">', '', '') : '';
  var form = '<form id="bk-form" data-form="booking" novalidate>' +
    field('f-name', 'Имя', '<input id="f-name" name="name" type="text" autocomplete="given-name" value="' + esc(bk.name) + '"' + (e.name ? ' aria-invalid="true" aria-describedby="e-f-name"' : '') + '>', e.name) +
    field('f-phone', 'Телефон', '<input id="f-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 (900) 000-00-00" value="' + esc(bk.phone) + '"' + (e.phone ? ' aria-invalid="true" aria-describedby="e-f-phone"' : '') + '>', e.phone) +
    car + pet +
    '<div class="field consent' + (e.consent ? ' has-error' : '') + '"><label class="check"><input type="checkbox" id="f-consent" name="consent"' + (bk.consent ? ' checked' : '') + (e.consent ? ' aria-invalid="true" aria-describedby="e-f-consent"' : '') + '><span class="check-box" aria-hidden="true">' + icon('check', '', 14) + '</span><span>Согласен на обработку персональных данных, <a href="#" data-act="policy">политика конфиденциальности</a></span></label>' +
    (e.consent ? '<p class="err" id="e-f-consent" role="alert">' + icon('x', '', 14) + '<span>' + esc(e.consent) + '</span></p>' : '') + '</div>' +
    '</form>';
  var foot = '<div class="sheet-foot"><button type="submit" form="bk-form" class="btn btn--primary btn--block">' + (long ? 'Оставить заявку, мастер перезвонит' : 'Записаться') + icon('check', '', 18) + '</button></div>';
  return '<div class="sheet-body"><h2 class="sheet-title" id="sheet-title" tabindex="-1">' + (long ? 'Заявка на услугу' : 'Ваши данные') + '</h2>' + sum + form + '</div>' + foot;
}
function validateBk() {
  var e = {};
  if (bk.name.trim().length < 2) e.name = 'Напишите имя, как к вам обращаться';
  if (bk.phone.replace(/\D/g, '').length !== 11) e.phone = 'Введите номер полностью: 10 цифр после +7';
  if (!bk.consent) e.consent = 'Без согласия записать не получится';
  return e;
}
function submitBooking() {
  bk.errors = validateBk();
  if (Object.keys(bk.errors).length) {
    renderSheet({ keep: true, focus: bk.errors.name ? '#f-name' : bk.errors.phone ? '#f-phone' : '#f-consent' });
    return;
  }
  var s = bk.svc, long = !!s.long;
  var a = { id: 'u' + Date.now(), date: long ? dkey(new Date()) : bk.dateKey, time: long ? '' : bk.time, dur: long ? 0 : s.durationMin, service: s.name, price: fmtPrice(s), name: bk.name.trim(), phone: bk.phone, car: bk.car.trim() || bk.pet.trim(), status: 'new', source: 'site', long: long };
  appts.push(a); persistAppts(); bk.appt = a; bk.step = 'done';
  renderSheet({});
}
function doneHtml() {
  var a = bk.appt, long = a.long, d = long ? null : parseKey(a.date);
  if (bk.cancelled) {
    return sheetHead({ mid: '' }) + '<div class="sheet-body done"><div class="done-mark done-mark--off">' + icon('x', '', 28) + '</div><h2 class="sheet-title" id="sheet-title" tabindex="-1">' + (long ? 'Заявка отменена' : 'Запись отменена') + '</h2><p class="sheet-sub">Время освободили. Если планы изменятся, запишитесь снова.</p></div>' +
      '<div class="sheet-foot sheet-foot--col"><button type="button" class="btn btn--primary btn--block" data-act="bk-restart">Записаться снова</button><button type="button" class="btn btn--ghost btn--block" data-act="sheet-close">На главную</button></div>';
  }
  var det = '<dl class="sum"><div><dt>Услуга</dt><dd>' + esc(a.service) + '</dd></div>' +
    (long ? '<div><dt>Дальше</dt><dd>Мастер перезвонит на ' + esc(a.phone) + '</dd></div>' : '<div><dt>Когда</dt><dd>' + esc(fmtDate(d)) + ', ' + a.time + '</dd></div>') +
    '<div><dt>Где</dt><dd>' + esc(B.city + ', ' + B.address) + '</dd></div><div><dt>Цена</dt><dd>' + esc(a.price) + '</dd></div></dl>';
  var cancel = bk.confirmCancel ?
    '<div class="confirm" role="group" aria-label="Подтвердите отмену"><p>Отменить ' + (long ? 'заявку' : 'запись') + '?</p><div class="confirm-row"><button type="button" class="btn btn--danger" data-act="bk-cancel-yes">Да, отменить</button><button type="button" class="btn btn--ghost" data-act="bk-cancel-no">Оставить</button></div></div>' :
    '<button type="button" class="btn btn--ghost btn--block" data-act="bk-cancel">Отменить ' + (long ? 'заявку' : 'запись') + '</button>';
  return sheetHead({ mid: '' }) + '<div class="sheet-body done"><div class="done-mark">' + icon('check', '', 28) + '</div><h2 class="sheet-title" id="sheet-title" tabindex="-1">' + (long ? 'Заявка принята' : 'Вы записаны') + '</h2><p class="sheet-sub">' + (long ? 'Мастер перезвонит и согласует день.' : 'Ждём вас, ' + esc(a.name) + '.') + '</p>' + det + '</div>' +
    '<div class="sheet-foot sheet-foot--col">' + (long ? '' : '<button type="button" class="btn btn--primary btn--block" data-act="bk-ics">' + icon('download', '', 18) + 'Добавить в календарь</button>') +
    (PHONE ? '<a class="btn btn--ghost btn--block" href="' + esc(telHref(PHONE)) + '">' + icon('phone', '', 18) + 'Позвонить: ' + esc(fmtPhone(PHONE)) + '</a>' : '') + cancel + '</div>';
}

/* ---------- кабинет владельца ---------- */
function timeOptions(sel) {
  var o = '';
  for (var m = 0; m <= 1440; m += 30) { var t = fromMin(m); o += '<option value="' + t + '"' + (t === sel ? ' selected' : '') + '>' + t + '</option>'; }
  return o;
}
function sortAppts(list) { return list.slice().sort(function (a, b) { return (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')); }); }
function badge(st, long) {
  var t = ST[st] || ST['new'], label = t.t;
  if (long) label = { 'new': 'Ждёт звонка', done: 'Перезвонили', cancelled: 'Отказ', came: 'Перезвонили', noshow: 'Не дозвонились' }[st] || label;
  return '<span class="badge badge--' + st + '">' + icon(t.i, '', 14) + '<span>' + label + '</span></span>';
}
function renderOwner() {
  if (!owner.authed) { appEl.innerHTML = loginHtml(); return; }
  var tabs = [['records', 'Записи', 'cal'], ['services', 'Услуги и цены', 'tag'], ['schedule', 'График', 'clock']];
  var nav = '<nav class="otabs" role="tablist" aria-label="Разделы кабинета">' + tabs.map(function (t) {
    return '<button type="button" role="tab" class="otab" data-act="otab" data-t="' + t[0] + '" aria-selected="' + (owner.tab === t[0]) + '">' + icon(t[2], '', 20) + '<span>' + t[1] + '</span></button>';
  }).join('') + '</nav>';
  var panel = owner.tab === 'records' ? recordsHtml() : owner.tab === 'services' ? servicesEditHtml() : scheduleEditHtml();
  appEl.innerHTML = '<div class="owner"><header class="owner-head"><div><p class="eyebrow">Кабинет владельца</p><h1 class="owner-title">' + esc(B.name) + '</h1></div><button type="button" class="btn btn--ghost btn--sm" data-act="logout">' + icon('logout', '', 18) + '<span>Выйти</span></button></header>' + nav + '<section class="opanel" role="tabpanel" id="opanel">' + panel + '</section></div>';
}
function loginHtml() {
  return '<div class="owner owner--login"><form class="login" id="login-form" data-form="login" novalidate><p class="eyebrow">Кабинет владельца</p><h1 class="login-title">' + esc(B.name) + '</h1><p class="login-sub">Войдите, чтобы смотреть записи и менять цены.</p>' +
    field('l-mail', 'Почта', '<input id="l-mail" name="mail" type="email" autocomplete="username" placeholder="you@example.ru">', '') +
    field('l-pass', 'Пароль', '<input id="l-pass" name="pass" type="password" autocomplete="current-password">', '') +
    '<button type="submit" class="btn btn--primary btn--block">' + icon('lock', '', 18) + 'Войти</button>' +
    '<p class="demo-note">' + icon('clock', '', 16) + '<span>Демо-доступ: подойдёт любая почта и любой пароль.</span></p><a class="login-back" href="#/">' + icon('left', '', 16) + 'К сайту для клиентов</a></form></div>';
}
function recordsHtml() {
  var today = new Date(), tk = dkey(today), list = appts.filter(function (a) { return !a.long; });
  var reqs = appts.filter(function (a) { return a.long; });
  var range = owner.range;
  list = sortAppts(list.filter(function (a) { return range === 'today' ? a.date === tk : true; }));
  var groups = {}, order = [];
  list.forEach(function (a) { if (!groups[a.date]) { groups[a.date] = []; order.push(a.date); } groups[a.date].push(a); });
  var active = list.filter(function (a) { return a.status === 'new' || a.status === 'came'; }).length;
  var bar = '<div class="otoolbar"><div class="seg" role="group" aria-label="Период"><button type="button" class="seg-b" data-act="range" data-r="today" aria-pressed="' + (range === 'today') + '">Сегодня</button><button type="button" class="seg-b" data-act="range" data-r="week" aria-pressed="' + (range === 'week') + '">Неделя</button></div>' +
    '<button type="button" class="btn btn--primary" data-act="new-manual">' + icon('plus', '', 18) + '<span>Записать вручную</span></button></div>';
  var head = '<p class="osum">' + esc(fmtDate(today)) + ' · ' + (range === 'today' ? 'записей сегодня: ' + list.length + (active ? ', впереди: ' + active : '') : 'записей на неделю: ' + list.length) + '</p>';
  var body = order.length ? order.map(function (k) {
    var d = parseKey(k);
    return '<div class="dgroup">' + (range === 'week' ? '<h3 class="dgroup-h">' + esc(k === tk ? 'Сегодня, ' : '') + esc(fmtDate(d)) + '</h3>' : '') +
      '<ul class="alist">' + groups[k].map(apptRow).join('') + '</ul></div>';
  }).join('') : '<p class="empty">На этот период записей нет.</p>';
  var rq = reqs.length ? '<div class="dgroup reqs"><h3 class="dgroup-h">Заявки: нужно перезвонить</h3><ul class="alist">' + reqs.map(apptRow).join('') + '</ul></div>' : '';
  return bar + head + body + rq + '<p class="mock-note">Записи в демо вымышленные; новые записи с сайта появляются здесь сразу.</p>';
}
function apptRow(a) {
  return '<li><button type="button" class="arow arow--' + a.status + '" data-act="open-appt" data-id="' + esc(a.id) + '">' +
    '<span class="arow-time">' + (a.long ? icon('phone', '', 20) : esc(a.time)) + '</span>' +
    '<span class="arow-main"><span class="arow-svc">' + esc(a.service) + '</span><span class="arow-who">' + esc(a.name) + (a.car ? ' · ' + esc(a.car) : '') + (a.source === 'site' ? ' · с сайта' : a.source === 'manual' ? ' · вручную' : '') + '</span></span>' +
    badge(a.status, a.long) + '</button></li>';
}
function apptHtml() {
  var a = appts.filter(function (x) { return x.id === sheet.id; })[0];
  if (!a) return sheetHead({}) + '<div class="sheet-body"><h2 class="sheet-title" id="sheet-title" tabindex="-1">Запись не найдена</h2></div>';
  var wa = 'https://wa.me/' + a.phone.replace(/\D/g, '');
  var opts = a.long ? ['new', 'done', 'noshow', 'cancelled'] : ['came', 'noshow', 'done', 'cancelled'];
  var seg = opts.map(function (s) {
    var lab = a.long ? { 'new': 'Ждёт звонка', done: 'Перезвонили', noshow: 'Не дозвонились', cancelled: 'Отказ' }[s] : ST[s].t;
    return '<button type="button" class="stbtn" data-act="set-status" data-s="' + s + '" aria-pressed="' + (a.status === s) + '">' + icon(ST[s].i, '', 18) + '<span>' + lab + '</span></button>';
  }).join('');
  return sheetHead({ mid: '<span class="progress-label">' + (a.long ? 'Заявка' : 'Запись') + '</span>' }) +
    '<div class="sheet-body"><h2 class="sheet-title" id="sheet-title" tabindex="-1">' + esc(a.name) + '</h2><div class="appt-badge">' + badge(a.status, a.long) + '</div>' +
    '<dl class="sum"><div><dt>Услуга</dt><dd>' + esc(a.service) + '</dd></div>' +
    (a.long ? '' : '<div><dt>Когда</dt><dd>' + esc(fmtDate(parseKey(a.date))) + ', ' + a.time + '–' + fromMin(toMin(a.time) + a.dur) + '</dd></div>') +
    '<div><dt>Цена</dt><dd>' + esc(a.price) + '</dd></div><div><dt>Телефон</dt><dd>' + esc(a.phone) + '</dd></div>' + (a.car ? '<div><dt>' + (HAS_CAR ? 'Авто' : 'Питомец') + '</dt><dd>' + esc(a.car) + '</dd></div>' : '') + '</dl>' +
    '<div class="contact-row"><a class="btn btn--primary" href="' + esc(telHref(a.phone)) + '">' + icon('phone', '', 18) + 'Позвонить</a><a class="btn btn--ghost" href="' + esc(wa) + '" target="_blank" rel="noopener">' + icon('chat', '', 18) + 'WhatsApp</a></div>' +
    '<h3 class="sub-h">Статус</h3><div class="stseg" role="group" aria-label="Статус записи">' + seg + '</div></div>';
}
function manualHtml() {
  var m = sheet.f, days = nextWeekDays(), e = sheet.errors || {};
  var svcOpts = services.map(function (s, i) { return '<option value="' + i + '"' + (String(i) === String(m.svc) ? ' selected' : '') + '>' + esc(s.name) + ' — ' + esc(fmtPrice(s)) + '</option>'; }).join('');
  var s = services[m.svc], long = s && s.long;
  var dayOpts = days.map(function (d) { var k = dkey(d); return '<option value="' + k + '"' + (k === m.date ? ' selected' : '') + '>' + esc(fmtDate(d)) + '</option>'; }).join('');
  var free = !long && s ? slotsFor(parseKey(m.date), s).filter(function (x) { return !x.busy; }) : [];
  if (!m.time && free.length) m.time = free[0].time;
  var timeOpts = free.length ? free.map(function (x) { return '<option value="' + x.time + '"' + (x.time === m.time ? ' selected' : '') + '>' + x.time + '</option>'; }).join('') : '<option value="">нет свободного времени</option>';
  return sheetHead({ mid: '<span class="progress-label">Новая запись</span>' }) + '<div class="sheet-body"><h2 class="sheet-title" id="sheet-title" tabindex="-1">Записать вручную</h2><p class="sheet-sub">Для тех, кто позвонил или пришёл сам.</p>' +
    '<form id="manual-form" data-form="manual" novalidate>' +
    field('m-svc', 'Услуга', '<select id="m-svc" name="svc" data-mf="svc">' + svcOpts + '</select>', '') +
    (long ? '<p class="hint">Долгая услуга: запишем как заявку, мастер перезвонит.</p>' : field('m-date', 'День', '<select id="m-date" name="date" data-mf="date">' + dayOpts + '</select>', '') + field('m-time', 'Время', '<select id="m-time" name="time" data-mf="time">' + timeOpts + '</select>', e.time)) +
    field('m-name', 'Имя', '<input id="m-name" name="name" type="text" data-mf="name" value="' + esc(m.name) + '"' + (e.name ? ' aria-invalid="true"' : '') + '>', e.name) +
    field('m-phone', 'Телефон', '<input id="m-phone" name="phone" type="tel" inputmode="tel" placeholder="+7 (900) 000-00-00" data-mf="phone" value="' + esc(m.phone) + '"' + (e.phone ? ' aria-invalid="true"' : '') + '>', e.phone) + '</form></div>' +
    '<div class="sheet-foot"><button type="submit" form="manual-form" class="btn btn--primary btn--block">' + icon('check', '', 18) + 'Записать</button></div>';
}
function readDraftSvc() {
  var rows = $$('.svc-edit'), d = owner.draftSvc || clone(services), bad = false;
  rows.forEach(function (row) {
    var i = Number(row.getAttribute('data-row')), s = d[i]; if (!s) return;
    var name = $('[data-f=name]', row).value.trim(), pr = $('[data-f=price]', row).value.trim().replace(',', '.'), du = parseInt($('[data-f=dur]', row).value, 10);
    s.name = name;
    s.price = pr === '' ? null : parseFloat(pr);
    if (s.price !== null && (isNaN(s.price) || s.price < 0)) { s._err = 'Цена: число от 0 или пусто'; bad = true; } else delete s._err;
    if (isNaN(du) || du < 1 || du > 1440) { s._err = (s._err ? s._err + '. ' : '') + 'Минуты: от 1 до 1440'; bad = true; } else { if (du !== s.durationMin) s.durationStub = false; s.durationMin = du; }
    if (!name) { s._err = (s._err ? s._err + '. ' : '') + 'Нужно название'; bad = true; }
    s.long = $('[data-f=long]', row).checked;
  });
  owner.draftSvc = d; return !bad;
}
function servicesEditHtml() {
  if (!owner.draftSvc) owner.draftSvc = clone(services);
  var rows = owner.draftSvc.map(function (s, i) {
    return '<li class="svc-edit" data-row="' + i + '"><div class="svc-edit-grid">' +
      field('sv-n-' + i, 'Название', '<input id="sv-n-' + i + '" data-f="name" type="text" value="' + esc(s.name) + '">', '') +
      field('sv-p-' + i, 'Цена, ₽' + (s.priceUnit ? ' за минуту' : ''), '<input id="sv-p-' + i + '" data-f="price" type="text" inputmode="decimal" placeholder="по запросу" value="' + (s.price == null ? '' : esc(fmtNum(s.price))) + '">', '') +
      field('sv-d-' + i, 'Минут', '<input id="sv-d-' + i + '" data-f="dur" type="text" inputmode="numeric" value="' + esc(s.durationMin) + '">', '') + '</div>' +
      '<div class="svc-edit-foot"><label class="check"><input type="checkbox" data-f="long"' + (s.long ? ' checked' : '') + '><span class="check-box" aria-hidden="true">' + icon('check', '', 14) + '</span><span>Долгая услуга: заявка вместо слота</span></label>' +
      '<button type="button" class="btn btn--ghost btn--sm btn--danger-text" data-act="svc-del" data-i="' + i + '">' + icon('trash', '', 18) + '<span>Удалить</span></button></div>' +
      (s._err ? '<p class="err" role="alert">' + icon('x', '', 14) + '<span>' + esc(s._err) + '</span></p>' : '') + '</li>';
  }).join('');
  return '<div class="otoolbar"><p class="osum osum--flat">Цены и время правите здесь, на сайте они обновятся сразу.</p><button type="button" class="btn btn--ghost" data-act="svc-add">' + icon('plus', '', 18) + '<span>Добавить услугу</span></button></div>' +
    '<ul class="svc-edit-list">' + rows + '</ul><div class="savebar"><button type="button" class="btn btn--primary" data-act="svc-save">' + icon('check', '', 18) + 'Сохранить</button><button type="button" class="btn btn--ghost" data-act="svc-reset">Вернуть как было</button></div>';
}
function scheduleEditHtml() {
  if (!owner.draftSch) owner.draftSch = { days: clone(schedule), res: resCount };
  var ds = owner.draftSch;
  var rows = WEEK.map(function (k) {
    var sp = ds.days[k] && ds.days[k].working_hours && ds.days[k].working_hours[0], on = !!sp;
    return '<li class="sch-row" data-day="' + k + '"><span class="sch-day">' + DAY_FULL[k] + '</span><label class="check sch-on"><input type="checkbox" data-f="open"' + (on ? ' checked' : '') + '><span class="check-box" aria-hidden="true">' + icon('check', '', 14) + '</span><span>Работаем</span></label>' +
      '<div class="sch-times"><select data-f="from" aria-label="' + DAY_FULL[k] + ': открытие"' + (on ? '' : ' disabled') + '>' + timeOptions(sp ? sp.from : '10:00') + '</select><span aria-hidden="true">–</span><select data-f="to" aria-label="' + DAY_FULL[k] + ': закрытие"' + (on ? '' : ' disabled') + '>' + timeOptions(sp ? sp.to : '19:00') + '</select></div></li>';
  }).join('');
  var rl = B.resources ? (RES_GEN[B.resources.label] || B.resources.label) : 'мест';
  return '<p class="osum osum--flat">От графика зависит, какое время видит посетитель.</p><ul class="sch-list">' + rows + '</ul>' +
    '<div class="field sch-res"><label for="sch-res">Сколько ' + esc(rl) + ' у вас</label><input id="sch-res" type="text" inputmode="numeric" value="' + esc(ds.res) + '"><p class="hint">В демо число показано для справки; в боевой версии по нему считаются одновременные записи.</p></div>' +
    '<div class="savebar"><button type="button" class="btn btn--primary" data-act="sch-save">' + icon('check', '', 18) + 'Сохранить</button><button type="button" class="btn btn--ghost" data-act="reset-demo">Сбросить все демо-данные</button></div>';
}
function readDraftSch() {
  if (!owner.draftSch) return;
  var ds = owner.draftSch;
  $$('.sch-row').forEach(function (row) {
    var k = row.getAttribute('data-day'), on = $('[data-f=open]', row).checked, f = $('[data-f=from]', row).value, t = $('[data-f=to]', row).value;
    ds.days[k] = { working_hours: on ? [{ from: f, to: t }] : [] };
  });
  var r = $('#sch-res'); if (r) { var n = parseInt(r.value, 10); if (!isNaN(n) && n > 0) ds.res = n; }
}

/* ---------- события ---------- */
document.addEventListener('click', function (ev) {
  var el = ev.target.closest('[data-act]'); if (!el) return;
  var act = el.getAttribute('data-act');
  switch (act) {
    case 'book': ev.preventDefault(); startBooking(el.getAttribute('data-i') == null ? null : Number(el.getAttribute('data-i'))); break;
    case 'sheet-close': closeAny(); break;
    case 'sheet-backdrop': closeAny(); break;
    case 'policy': ev.preventDefault(); toast('Политика конфиденциальности в демо — заглушка. В боевой версии здесь реквизиты владельца.'); break;
    case 'bk-back': bk.step = bkSteps()[Math.max(0, bkSteps().indexOf(bk.step) - 1)]; renderSheet({}); break;
    case 'bk-change-svc': bk.step = 'service'; renderSheet({}); break;
    case 'pick-svc': pickService(Number(el.getAttribute('data-i'))); renderSheet({}); break;
    case 'pick-day': bk.dateKey = el.getAttribute('data-k'); bk.time = ''; bk.part = null; renderSheet({ keep: true, focus: '[data-k="' + bk.dateKey + '"]' }); break;
    case 'pick-part': bk.part = el.getAttribute('data-p'); renderSheet({ keep: true, focus: '[data-p="' + bk.part + '"]' }); break;
    case 'pick-slot': bk.time = el.getAttribute('data-t'); renderSheet({ keep: true, focus: '[data-t="' + bk.time + '"]' }); break;
    case 'bk-next': if (bk.time) { bk.step = 'contact'; renderSheet({}); } break;
    case 'bk-ics': downloadIcs(bk.appt); toast('Файл .ics скачан: откройте его, чтобы добавить запись в календарь.'); break;
    case 'bk-cancel': bk.confirmCancel = true; renderSheet({ keep: true, focus: '[data-act="bk-cancel-yes"]' }); break;
    case 'bk-cancel-no': bk.confirmCancel = false; renderSheet({ keep: true, focus: '[data-act="bk-cancel"]' }); break;
    case 'bk-cancel-yes': bk.appt.status = 'cancelled'; persistAppts(); bk.cancelled = true; bk.confirmCancel = false; renderSheet({}); break;
    case 'bk-restart': bk = newBk(); renderSheet({}); break;
    case 'logout': owner.authed = false; save('authed', false); renderOwner(); break;
    case 'otab': readDraftSch(); owner.tab = el.getAttribute('data-t'); if (owner.tab !== 'services') owner.draftSvc = null; if (owner.tab !== 'schedule') owner.draftSch = null; renderOwner(); var tb = $('[data-t="' + owner.tab + '"]'); if (tb) tb.focus(); break;
    case 'range': owner.range = el.getAttribute('data-r'); renderOwner(); var rb = $('[data-r="' + owner.range + '"]'); if (rb) rb.focus(); break;
    case 'open-appt': openSheet({ kind: 'appt', id: el.getAttribute('data-id') }); break;
    case 'set-status':
      var a = appts.filter(function (x) { return x.id === sheet.id; })[0];
      if (a) { a.status = el.getAttribute('data-s'); persistAppts(); renderSheet({ keep: true, focus: '[data-s="' + a.status + '"]' }); renderOwner(); toast('Статус сохранён'); }
      break;
    case 'new-manual': var si = Math.max(0, services.findIndex(function (s) { return !s.long; })); openSheet({ kind: 'manual', f: { svc: String(si), date: firstFreeDay(services[si]), time: '', name: '', phone: '' }, errors: {} }); break;
    case 'svc-add': readDraftSvc(); owner.draftSvc.push({ name: 'Новая услуга', price: null, durationMin: 60, durationStub: false, long: false, category: 'Услуги', source: 'stub' }); renderOwner(); var nn = $('#sv-n-' + (owner.draftSvc.length - 1)); if (nn) { nn.focus(); nn.select(); } break;
    case 'svc-del': readDraftSvc(); owner.draftSvc.splice(Number(el.getAttribute('data-i')), 1); renderOwner(); toast('Услуга убрана. Чтобы применить, нажмите «Сохранить».'); break;
    case 'svc-save':
      if (!readDraftSvc()) { renderOwner(); toast('Проверьте подсвеченные строки'); break; }
      services = owner.draftSvc.map(function (s) { var c = Object.assign({}, s); delete c._err; return c; });
      save('services', services); owner.draftSvc = null; renderOwner(); toast('Сохранено. На сайте цены уже новые.'); break;
    case 'svc-reset': owner.draftSvc = clone(services); renderOwner(); toast('Правки сброшены'); break;
    case 'sch-save':
      readDraftSch(); schedule = clone(owner.draftSch.days); resCount = owner.draftSch.res; save('schedule', schedule); save('res', resCount);
      regenMock(); owner.draftSch = null; renderOwner(); toast('График сохранён. Свободное время пересчитано.'); break;
    case 'reset-demo':
      ['services', 'schedule', 'res', 'appts'].forEach(drop);
      services = clone(B.services); schedule = {}; WEEK.forEach(function (k) { schedule[k] = clone(B.schedule[k] || { working_hours: [] }); }); resCount = B.resources ? B.resources.count : 1;
      owner.draftSvc = null; owner.draftSch = null; loadAppts(); renderOwner(); toast('Демо-данные сброшены'); break;
    default: if (D.onAct) D.onAct(act, el, ev);
  }
});
document.addEventListener('input', function (ev) {
  var t = ev.target;
  if (t.id === 'f-phone' || t.id === 'm-phone') {
    t.value = maskPhone(t.value);
    if (t.id === 'f-phone') bk.phone = t.value; else if (sheet && sheet.f) sheet.f.phone = t.value;
  } else if (t.id === 'f-name') bk.name = t.value;
  else if (t.id === 'f-car') bk.car = t.value;
  else if (t.id === 'f-pet') bk.pet = t.value;
  else if (t.id === 'm-name' && sheet && sheet.f) sheet.f.name = t.value;
});
document.addEventListener('change', function (ev) {
  var t = ev.target;
  if (t.id === 'f-consent') { bk.consent = t.checked; return; }
  if (t.hasAttribute && t.hasAttribute('data-mf') && sheet && sheet.kind === 'manual') {
    var k = t.getAttribute('data-mf'); sheet.f[k] = t.value;
    if (k === 'svc') sheet.f.date = firstFreeDay(services[sheet.f.svc]);
    if (k === 'svc' || k === 'date') { sheet.f.time = ''; renderSheet({ keep: true, focus: '#' + t.id }); }
    return;
  }
  if (t.getAttribute && t.getAttribute('data-f') === 'open') {
    var row = t.closest('.sch-row');
    $$('select', row).forEach(function (s) { s.disabled = !t.checked; });
  }
});
document.addEventListener('submit', function (ev) {
  var f = ev.target.getAttribute('data-form'); if (!f) return;
  ev.preventDefault();
  if (f === 'booking') submitBooking();
  else if (f === 'login') {
    var mail = $('#l-mail').value.trim(), pass = $('#l-pass').value, errs = false;
    $$('#login-form .field').forEach(function (x) { x.classList.remove('has-error'); var p = $('.err', x); if (p) p.remove(); });
    function bad(id, msg) { var inp = $(id), fd = inp.closest('.field'); fd.classList.add('has-error'); inp.setAttribute('aria-invalid', 'true'); fd.insertAdjacentHTML('beforeend', '<p class="err" role="alert">' + icon('x', '', 14) + '<span>' + msg + '</span></p>'); if (!errs) inp.focus(); errs = true; }
    if (!mail) bad('#l-mail', 'Введите почту');
    if (!pass) bad('#l-pass', 'Введите пароль');
    if (errs) return;
    owner.authed = true; save('authed', true); renderOwner(); toast('Вы вошли в демо-кабинет');
  } else if (f === 'manual') {
    var m = sheet.f, s = services[m.svc], e = {};
    if (m.name.trim().length < 2) e.name = 'Напишите имя';
    if (m.phone.replace(/\D/g, '').length !== 11) e.phone = 'Введите номер полностью';
    if (!s.long && !m.time) e.time = 'Нет свободного времени. Выберите другой день.';
    if (Object.keys(e).length) { sheet.errors = e; renderSheet({ keep: true, focus: e.time ? '#m-time' : e.name ? '#m-name' : '#m-phone' }); return; }
    appts.push({ id: 'g' + Date.now(), date: s.long ? dkey(new Date()) : m.date, time: s.long ? '' : m.time, dur: s.long ? 0 : s.durationMin, service: s.name, price: fmtPrice(s), name: m.name.trim(), phone: m.phone, car: '', status: 'new', source: 'manual', long: !!s.long });
    persistAppts(); closeSheet(); renderOwner(); toast('Запись добавлена');
  }
});
document.addEventListener('keydown', function (ev) {
  if (!sheet) return;
  if (ev.key === 'Escape') { ev.preventDefault(); closeAny(); return; }
  if (ev.key === 'Tab') {
    var box = $('.sheet', sheetRoot); if (!box) return;
    var f = $$('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea,[tabindex]:not([tabindex="-1"])', box).filter(function (x) { return x.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (ev.shiftKey && (document.activeElement === first || document.activeElement === $('#sheet-title'))) { ev.preventDefault(); last.focus(); }
    else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
  }
});
window.addEventListener('hashchange', route);

/* ---------- старт ---------- */
loadAppts();
route();

})();
