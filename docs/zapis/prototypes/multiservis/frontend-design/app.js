/* ===== Мультисервис: главная («фасад с боксами») ===== */
window.VARIANT = {
  skipPhotos: [],
  // подписи над воротами взяты с фасада (фото owner-10)
  doors: [
    { t: 'Шиномонтаж', s: 'балансировка', re: /шиномонтаж/i },
    { t: 'Диагностика', s: 'ремонт подвески', re: /диагностик/i },
    { t: 'Развал-схождение', s: '', re: /развал/i },
    { t: 'Техническое обслуживание', s: '', re: /\(ТО\)|масл/i }
  ],
  home: function (c) {
    var B = c.B, i = c.icon, e = c.esc, self = window.VARIANT;
    function find(re) { return c.sv.filter(function (s) { return re.test(s.name); })[0]; }

    var h = '<header class="m-hero"><div class="wrap m-nav"><span class="m-state' + (c.open.is ? ' is-open' : '') + '">' + e(c.open.text) + '</span>' +
      '<nav aria-label="Разделы"><a href="#/" data-scroll="prices">Услуги</a><a href="#/" data-scroll="photos">Фото</a><a href="#/" data-scroll="reviews">Отзывы</a><a href="#/" data-scroll="contacts">Контакты</a></nav>' +
      '<a class="btn btn--primary m-nav__cta" href="#/book">Записаться</a></div>' +
      '<div class="wrap m-banner"><p class="m-banner__top">Автотехцентр</p><h1 class="m-banner__name">' + e(B.name) + '</h1>' +
      '<p class="m-banner__addr">' + i('pin') + e(B.city) + ', ' + e(B.address) + '</p></div>';

    h += '<div class="wrap"><div class="m-doors">';
    var n = 0;
    self.doors.forEach(function (d) {
      var s = find(d.re);
      if (!s) return;
      h += '<a class="m-door" style="--n:' + (n++) + '" href="#/book?s=' + e(s.id) + '">' +
        '<span class="m-door__sign">' + e(d.t) + (d.s ? '<small>' + e(d.s) + '</small>' : '') + '</span>' +
        '<span class="m-door__frame"><span class="m-door__in"><b>' + e(s.name) + '</b>' +
        '<span class="m-door__p' + (s.price == null ? ' is-ask' : '') + '">' + e(c.price(s)) + '</span>' +
        '<span class="m-door__d">' + i('clock') + (s.durationStub ? 'около ' : '') + e(c.dur(s.durationMin)) + '</span>' +
        '<span class="m-door__go">Записаться</span></span><span class="m-door__leaf" aria-hidden="true"></span></span></a>';
    });
    h += '</div>';

    h += '<div class="m-hero__row"><p class="m-rate">' + i('star') + '<b>' + c.rating + '</b><span>' + c.reviewsLabel + '</span></p>' +
      '<div class="m-cta"><a class="btn btn--primary btn--lg" href="#/book">' + i('cal') + 'Записаться</a>' +
      '<a class="btn btn--light btn--lg" href="tel:' + e(c.phone) + '">' + i('phone') + e(c.viewPhone(c.phone)) + '</a></div></div></div></header>';

    h += '<section class="m-sec wrap" id="prices"><header class="m-sec__h"><h2>Услуги и цены</h2>' +
      '<p>Нажмите на услугу, чтобы записаться на неё. Где цены нет, назовём по телефону.</p></header><div class="m-list">';
    c.cats.forEach(function (cat) {
      h += '<section class="m-cat"><h3>' + e(cat.name) + '</h3><ul>';
      cat.items.forEach(function (s) {
        h += '<li><a class="m-row" href="#/book?s=' + e(s.id) + '"><span class="m-row__n">' + e(s.name) + '<small>' + e(c.meta(s)) + '</small></span>' +
          '<span class="m-row__p' + (s.price == null ? ' is-ask' : '') + '">' + e(c.price(s)) + '</span>' + i('right', 'm-row__c') + '</a></li>';
      });
      h += '</ul></section>';
    });
    h += '</div></section>';

    h += '<section class="m-sec wrap" id="photos"><header class="m-sec__h"><h2>Как у нас выглядит</h2></header><div class="m-mosaic">';
    c.photos.forEach(function (p, k) {
      h += '<button type="button" class="m-ph m-ph--' + p.kind + '" data-act="lightbox" data-i="' + k + '" aria-label="Открыть фото ' + (k + 1) + '"><img loading="lazy" src="' + e(p.src) + '" alt="' + e(c.alt(p)) + '"></button>';
    });
    h += '</div></section>';

    h += '<section class="m-rev" id="reviews"><div class="wrap"><header class="m-sec__h m-sec__h--w"><h2>Что говорят клиенты</h2><p class="m-score"><b>' + c.rating + '</b> ' + c.reviewsLabel + '</p></header><div class="m-revs">';
    c.reviews.forEach(function (r) {
      h += '<figure class="m-q"><blockquote>' + e(r.text).replace(/\n/g, '<br>') + '</blockquote><figcaption>' + c.stars(r.rating) + '<span>' + e(r.author) + '</span></figcaption></figure>';
    });
    h += '</div></div></section>';

    h += '<section class="m-sec wrap" id="contacts"><div class="m-ct"><div><h2>Адрес и время работы</h2>' +
      '<p class="m-ct__a">' + e(B.city) + ', ' + e(B.address) + '</p>' +
      '<dl class="m-hours">' + c.hours.map(function (g) { return '<div><dt>' + e(g.label) + '</dt><dd>' + e(g.t) + '</dd></div>'; }).join('') + '</dl>' +
      '<p class="m-state2' + (c.open.is ? ' is-open' : '') + '">' + e(c.open.text) + '</p></div>' +
      '<div class="m-ct__b"><a class="btn btn--primary btn--lg" href="' + e(c.routeUrl) + '" target="_blank" rel="noopener">' + i('route') + 'Построить маршрут</a>' +
      c.phones.map(function (p) { return '<a class="btn btn--ghost btn--lg" href="tel:' + e(p) + '">' + i('phone') + e(c.viewPhone(p)) + '</a>'; }).join('') +
      c.links.map(function (l) { return '<a class="btn btn--ghost btn--lg" href="' + e(l.href) + '" target="_blank" rel="noopener">' + i(l.icon) + e(l.label) + '</a>'; }).join('') + '</div></div></section>';

    h += '<footer class="m-foot"><div class="wrap"><span>' + e(B.name) + ', ' + e(B.city) + '</span><a href="#/owner">Кабинет владельца</a></div></footer>';
    return h;
  }
};

/* ===== ядро прототипа: данные, слоты, запись, кабинет ===== */
(function () {
  'use strict';
  var B = window.BUSINESS, V = window.VARIANT;
  var SLUG = B.slug;
  var PHOTO_BASE = '../../../tenants/' + SLUG + '/';

  /* ---------- утилиты ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function pad(n) { return String(n).padStart(2, '0'); }
  function plural(n, f) {
    var a = Math.abs(n) % 100, b = a % 10;
    if (a > 10 && a < 20) return f[2];
    if (b > 1 && b < 5) return f[1];
    if (b === 1) return f[0];
    return f[2];
  }
  var reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  var DAY_SHORT = { Mon: 'Пн', Tue: 'Вт', Wed: 'Ср', Thu: 'Чт', Fri: 'Пт', Sat: 'Сб', Sun: 'Вс' };
  var DAY_FULL = { Mon: 'Понедельник', Tue: 'Вторник', Wed: 'Среда', Thu: 'Четверг', Fri: 'Пятница', Sat: 'Суббота', Sun: 'Воскресенье' };
  var DAY_ACC = { Mon: 'в понедельник', Tue: 'во вторник', Wed: 'в среду', Thu: 'в четверг', Fri: 'в пятницу', Sat: 'в субботу', Sun: 'в воскресенье' };
  var DOW = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
  var DOW_FULL = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
  var MON_SHORT = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  var MON_GEN = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

  function ds(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parseDs(s) { var p = s.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); }
  function tm(s) { var p = s.split(':').map(Number); return p[0] * 60 + p[1]; }
  function mt(n) { return pad(Math.floor(n / 60)) + ':' + pad(n % 60); }
  function addDays(d, n) { var r = new Date(d); r.setDate(r.getDate() + n); return r; }
  function today() { var n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); }
  function dayLabel(d) { return DOW_FULL[d.getDay()] + ', ' + d.getDate() + ' ' + MON_GEN[d.getMonth()]; }
  function whenPhrase(b) {
    var diff = Math.round((parseDs(b.date) - today()) / 864e5);
    var w = diff === 0 ? 'сегодня' : diff === 1 ? 'завтра' : DAY_ACC[DAYS[parseDs(b.date).getDay()]] + ', ' + parseDs(b.date).getDate() + ' ' + MON_GEN[parseDs(b.date).getMonth()];
    return w + ' в ' + b.time;
  }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function relDay(d) {
    var diff = Math.round((d - today()) / 864e5);
    if (diff === 0) return 'Сегодня';
    if (diff === 1) return 'Завтра';
    return cap(DOW_FULL[d.getDay()]);
  }

  /* ---------- иконки ---------- */
  var ICONS = {
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    route: '<polygon points="3 11 22 2 13 21 11 13 3 11"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    left: '<path d="m15 18-6-6 6-6"/>',
    right: '<path d="m9 18 6-6-6-6"/>',
    star: '<polygon fill="currentColor" points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    plus: '<path d="M5 12h14M12 5v14"/>',
    minus: '<path d="M5 12h14"/>',
    trash: '<path d="M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
    out: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    tag: '<path d="M12 2H2v10l9.29 9.29a1 1 0 0 0 1.42 0l8.58-8.58a1 1 0 0 0 0-1.42Z"/><path d="M7 7h.01"/>',
    dl: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    car: '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>',
    vk: '<rect x="2.5" y="2.5" width="19" height="19" rx="5"/><text x="12" y="16" text-anchor="middle" font-size="9.5" font-weight="700" fill="currentColor" stroke="none" font-family="Arial,sans-serif">VK</text>',
    max: '<rect x="2.5" y="2.5" width="19" height="19" rx="9"/><text x="12" y="16" text-anchor="middle" font-size="10" font-weight="700" fill="currentColor" stroke="none" font-family="Arial,sans-serif">M</text>',
    wait: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4l2 2"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"/>',
    cfg: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>'
  };
  function icon(n, cls) {
    return '<svg class="ic' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (ICONS[n] || '') + '</svg>';
  }

  /* ---------- хранилище ---------- */
  function K(k) { return 'proto-' + SLUG + ':' + k; }
  function load(k, d) { try { var v = localStorage.getItem(K(k)); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(K(k), JSON.stringify(v)); } catch (e) { /* без хранилища */ } }
  function drop(k) { try { localStorage.removeItem(K(k)); } catch (e) { /* */ } }

  /* ---------- данные бизнеса ---------- */
  function services() {
    var s = load('services');
    if (s && s.length) return s;
    return B.services.map(function (x, i) { return Object.assign({ id: 's' + i }, x); });
  }
  function svcById(id) { return services().filter(function (s) { return s.id === id; })[0] || null; }
  function schedule() {
    var o = load('schedule');
    if (o) return o;
    o = {};
    ORDER.forEach(function (k) { var d = B.schedule[k]; o[k] = d && d.working_hours ? d.working_hours.map(function (r) { return { from: r.from, to: r.to }; }) : []; });
    return o;
  }
  function origSchedule() {
    var o = {};
    ORDER.forEach(function (k) { var d = B.schedule[k]; o[k] = d && d.working_hours ? d.working_hours : []; });
    return o;
  }
  function resCount() { return load('res', B.resources.count); }
  function hoursFor(date, sc) { return (sc || schedule())[DAYS[date.getDay()]] || []; }
  function photos() {
    var skip = V.skipPhotos || [];
    return B.photos.filter(function (p) { return skip.indexOf(p.file) < 0; }).map(function (p) {
      return { src: PHOTO_BASE + p.file, kind: p.kind, file: p.file };
    });
  }
  var KIND_ALT = { facade: 'Фасад', work: 'Работа мастеров', interior: 'Помещение', result: 'Готовая работа' };
  function photoAlt(p) { return (KIND_ALT[p.kind] || 'Фото') + ', ' + B.name; }

  function fmtPrice(s) {
    if (s.price == null || s.price === '') return 'по запросу';
    return (s.priceFrom ? 'от ' : '') + Number(s.price).toLocaleString('ru-RU') + ' ' + (s.priceUnit || '₽');
  }
  function fmtDur(m) {
    m = Number(m) || 0;
    if (m < 60) return m + ' мин';
    if (m % 60 === 0) return (m / 60) + ' ч';
    if (m % 30 === 0) return String(m / 60).replace('.', ',') + ' ч';
    return Math.floor(m / 60) + ' ч ' + (m % 60) + ' мин';
  }
  function svcNote(s) {
    var n = s.priceNote || '';
    return n && n.length <= 32 && n.indexOf('уточн') < 0 ? n : '';
  }
  function svcMeta(s) {
    if (s.long) return 'Долгая работа, время согласует мастер';
    var t = (s.durationStub ? 'около ' : '') + fmtDur(s.durationMin);
    var n = svcNote(s);
    return n ? t + ', ' + n : t;
  }
  function fmtRating(r) { return Number(r).toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 }); }
  function reviewsLabel(n) { return n + ' ' + plural(n, ['отзыв', 'отзыва', 'отзывов']); }
  function viewPhone(p) {
    var d = String(p).replace(/\D/g, '');
    if (d.length === 11) return '+7 (' + d.slice(1, 4) + ') ' + d.slice(4, 7) + '-' + d.slice(7, 9) + '-' + d.slice(9, 11);
    return p;
  }
  function stars(n) {
    var s = '<span class="stars" role="img" aria-label="' + n + ' из 5">';
    for (var i = 0; i < n; i++) s += icon('star');
    return s + '</span>';
  }
  function routeUrl() {
    return 'https://yandex.ru/maps/?rtext=~' + B.point.lat + ',' + B.point.lon + '&rtt=auto';
  }
  function contactLinks() {
    var c = B.contacts, out = [];
    if (c.whatsapp) out.push({ key: 'wa', label: 'WhatsApp', href: c.whatsapp, icon: 'chat' });
    if (c.telegram) out.push({ key: 'tg', label: 'Telegram', href: c.telegram, icon: 'send' });
    if (c.vk) out.push({ key: 'vk', label: 'ВКонтакте', href: c.vk, icon: 'vk' });
    if (c.max) out.push({ key: 'max', label: 'Max', href: c.max, icon: 'max' });
    if (c.email) out.push({ key: 'mail', label: c.email, href: 'mailto:' + c.email, icon: 'mail' });
    return out;
  }
  function hoursGroups() {
    var sc = schedule(), groups = [];
    ORDER.forEach(function (k) {
      var t = (sc[k] || []).map(function (r) { return r.from + '–' + r.to; }).join(', ') || 'выходной';
      var g = groups[groups.length - 1];
      if (g && g.t === t) g.days.push(k); else groups.push({ t: t, days: [k] });
    });
    return groups.map(function (g) {
      var d = g.days, n = d.length, label;
      if (n === 7) label = 'Ежедневно';
      else if (n === 1) label = DAY_SHORT[d[0]];
      else if (n === 2) label = DAY_SHORT[d[0]] + ', ' + DAY_SHORT[d[1]];
      else label = DAY_SHORT[d[0]] + '–' + DAY_SHORT[d[n - 1]];
      return { label: label, t: g.t };
    });
  }
  function openNow() {
    var n = new Date(), sc = schedule(), k = DAYS[n.getDay()], m = n.getHours() * 60 + n.getMinutes();
    var rs = sc[k] || [];
    for (var i = 0; i < rs.length; i++) {
      if (m >= tm(rs[i].from) && m < tm(rs[i].to)) return { is: true, text: 'Открыто до ' + rs[i].to };
      if (m < tm(rs[i].from)) return { is: false, text: 'Закрыто, откроемся в ' + rs[i].from };
    }
    for (var j = 1; j <= 7; j++) {
      var kk = DAYS[(n.getDay() + j) % 7], r = (sc[kk] || [])[0];
      if (r) return { is: false, text: 'Закрыто, откроемся ' + (j === 1 ? 'завтра' : DAY_ACC[kk]) + ' в ' + r.from };
    }
    return { is: false, text: 'Закрыто' };
  }

  /* ---------- моковые записи ---------- */
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) {
    var a = seed;
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  var NAMES = ['Сергей Л.', 'Алексей', 'Марина К.', 'Дмитрий Р.', 'Анна', 'Игорь С.', 'Олег', 'Наталья В.', 'Максим', 'Виктор П.', 'Екатерина', 'Артём Д.', 'Роман', 'Юлия Т.', 'Павел'];
  var CARS = ['Lada Vesta', 'Hyundai Solaris', 'Kia Rio', 'Toyota Camry', 'Skoda Octavia', 'Volkswagen Polo', 'Renault Duster', 'BMW X5', 'Haval Jolion', 'Chery Tiggo 7', 'Mazda 6', 'Ford Focus', 'Geely Coolray', 'Lada Granta'];
  var _mock = null;
  function mockBookings() {
    if (_mock) return _mock;
    var list = [], base = today(), sc = origSchedule();
    var pool = B.services.map(function (s, i) { return { s: s, id: 's' + i }; }).filter(function (x) { return !x.s.long; });
    var now = new Date(), nowM = now.getHours() * 60 + now.getMinutes();
    for (var o = 0; o < 7; o++) {
      var d = addDays(base, o), key = ds(d), wh = hoursFor(d, sc);
      if (!wh.length) continue;
      var from = tm(wh[0].from), to = tm(wh[wh.length - 1].to);
      var rr = rng(hash(SLUG + key));
      var span = Math.max(60, to - from - 120);
      var w1 = from + Math.floor(rr() * span / 30) * 30, w2 = from + Math.floor(rr() * span / 30) * 30;
      var rush = [{ s: w1, e: w1 + 90, p: 0.97 }, { s: w2, e: w2 + 90, p: 0.45 }];
      var n = 0;
      for (var r = 0; r < B.resources.count; r++) {
        var q = rng(hash(SLUG + key + 'r' + r)), ptr = from;
        while (ptr < to) {
          var inRush = null;
          rush.forEach(function (w) { if (ptr < w.e && ptr + 30 > w.s) inRush = w; });
          var p = inRush ? inRush.p - r * 0.08 : 0.07;
          if (q() < p) {
            var pick = pool[Math.floor(q() * pool.length)];
            var dur = pick.s.durationMin;
            var st = Math.ceil(ptr / 15) * 15;
            if (st + dur <= to) {
              var phoneTail = pad(10 + Math.floor(q() * 80));
              var status = 'new';
              if (o === 0) { if (st + dur <= nowM) status = q() < 0.82 ? 'done' : 'noshow'; else if (st <= nowM) status = 'came'; }
              list.push({
                id: 'm-' + key + '-' + (n++), date: key, time: mt(st), s: st, e: st + dur,
                serviceId: pick.id, serviceName: pick.s.name, price: fmtPrice(pick.s),
                name: NAMES[Math.floor(q() * NAMES.length)], phone: '+7 (900) 000-00-' + phoneTail,
                car: CARS[Math.floor(q() * CARS.length)], status: status, source: q() < 0.6 ? 'site' : 'call'
              });
              ptr = st + dur;
              continue;
            }
          }
          ptr += 30;
        }
      }
    }
    var lg = B.services.filter(function (s) { return s.long; })[0];
    if (lg) {
      list.push({
        id: 'm-req-1', date: ds(addDays(base, -1)), time: null, long: true, s: 0, e: 0,
        serviceId: null, serviceName: lg.name, price: fmtPrice(lg), name: 'Андрей М.',
        phone: '+7 (900) 000-00-77', car: 'Toyota Land Cruiser', status: 'new', source: 'site'
      });
    }
    _mock = list;
    return list;
  }
  function allBookings() {
    var ov = load('status', {});
    var mock = mockBookings().map(function (b) { return Object.assign({}, b, { status: ov[b.id] || b.status }); });
    return mock.concat(load('bookings', []));
  }
  function setStatus(id, st) {
    if (id.indexOf('m-') === 0) { var ov = load('status', {}); ov[id] = st; save('status', ov); return; }
    var l = load('bookings', []);
    l.forEach(function (b) { if (b.id === id) b.status = st; });
    save('bookings', l);
  }
  function addBooking(b) { var l = load('bookings', []); l.push(b); save('bookings', l); }
  function getBooking(id) { return allBookings().filter(function (b) { return b.id === id; })[0] || null; }

  function freeSlots(date, dur) {
    var key = ds(date);
    var bks = allBookings().filter(function (b) { return b.date === key && b.time && b.status !== 'cancelled'; });
    var n = new Date(), nowM = key === ds(n) ? n.getHours() * 60 + n.getMinutes() + 30 : -1;
    var res = resCount(), out = [];
    hoursFor(date).forEach(function (r) {
      var a = tm(r.from), z = tm(r.to);
      for (var t = a; t + dur <= z; t += 30) {
        if (t < nowM) continue;
        var busy = false;
        for (var x = t; x < t + dur && !busy; x += 15) {
          var c = 0;
          bks.forEach(function (b) { if (b.s <= x && x < b.e) c++; });
          if (c >= res) busy = true;
        }
        if (!busy) out.push(t);
      }
    });
    return out;
  }

  /* ---------- общие окна ---------- */
  var lastFocus = {};
  var state = { book: false, sheet: false, lb: false };
  function updateLock() {
    document.documentElement.classList.toggle('lock', state.book || state.sheet || state.lb);
  }
  function focusables(root) {
    return $$('a[href],button:not([disabled]),input:not([disabled]):not([type=hidden]):not(.hp),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])', root)
      .filter(function (e) { return e.offsetParent !== null; });
  }
  function trap(root, e) {
    var f = focusables(root);
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  var toastTimer;
  function toast(msg) {
    var t = $('#toast');
    t.textContent = msg;
    t.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('on'); }, 3200);
  }

  var sheetResolve = null;
  function openSheet(opts) {
    var el = $('#sheet');
    lastFocus.sheet = document.activeElement;
    $('#sheet-title').textContent = opts.title || '';
    $('#sheet-body').innerHTML = opts.body || '';
    $('#sheet-foot').innerHTML = opts.foot || '';
    $('#sheet-foot').hidden = !opts.foot;
    el.hidden = false;
    el.classList.toggle('sheet--wide', !!opts.wide);
    state.sheet = true; updateLock();
    $('#sheet-body').scrollTop = 0;
    setTimeout(function () { var h = $('#sheet-title'); h.setAttribute('tabindex', '-1'); h.focus(); }, 30);
  }
  function closeSheet(result) {
    if (!state.sheet) return;
    $('#sheet').hidden = true;
    state.sheet = false; updateLock();
    if (sheetResolve) { var r = sheetResolve; sheetResolve = null; r(!!result); }
    var f = lastFocus.sheet;
    if (f && document.contains(f)) f.focus();
  }
  function ask(title, text, okLabel, danger) {
    return new Promise(function (resolve) {
      sheetResolve = resolve;
      openSheet({
        title: title,
        body: '<p class="sheet__text">' + esc(text) + '</p>',
        foot: '<button class="btn btn--ghost" data-act="sheet-no" type="button">Не надо</button>' +
          '<button class="btn ' + (danger ? 'btn--danger' : 'btn--primary') + '" data-act="sheet-yes" type="button">' + esc(okLabel) + '</button>'
      });
    });
  }

  /* ---------- маска телефона ---------- */
  function maskPhone(v) {
    var d = v.replace(/\D/g, '');
    if (!d || d === '7' || d === '8') return '';
    if (d[0] === '7' || d[0] === '8') d = d.slice(1);
    d = d.slice(0, 10);
    var o = '+7 (' + d.slice(0, 3);
    if (d.length >= 3) o += ')';
    if (d.length > 3) o += ' ' + d.slice(3, 6);
    if (d.length > 6) o += '-' + d.slice(6, 8);
    if (d.length > 8) o += '-' + d.slice(8, 10);
    return o;
  }
  function phoneDigits(v) { var d = v.replace(/\D/g, ''); return d.length === 11 ? d.slice(1) : d; }
  function bindPhone(inp) {
    inp.addEventListener('input', function () { inp.value = maskPhone(inp.value); });
  }
  function telHref(p) { return 'tel:+7' + phoneDigits(p); }

  /* ================= ГЛАВНАЯ ================= */
  function ctx() {
    var sv = services(), cats = [], map = {};
    sv.forEach(function (s) {
      var c = s.category || 'Другое';
      if (!map[c]) { map[c] = { name: c, items: [] }; cats.push(map[c]); }
      map[c].items.push(s);
    });
    return {
      B: B, sv: sv, cats: cats, photos: photos(), reviews: B.reviews,
      rating: fmtRating(B.rating), reviewsLabel: reviewsLabel(B.reviewsCount),
      open: openNow(), hours: hoursGroups(), phones: B.contacts.phones,
      phone: B.contacts.phones[0], routeUrl: routeUrl(), links: contactLinks(),
      price: fmtPrice, dur: fmtDur, meta: svcMeta, viewPhone: viewPhone, telHref: function (p) { return 'tel:' + p; },
      icon: icon, esc: esc, stars: stars, alt: photoAlt, plural: plural
    };
  }
  var homeDirty = true;
  function renderHome() {
    var c = ctx();
    $('#home').innerHTML = V.home(c);
    $('#dock').innerHTML =
      '<a class="btn btn--primary" href="#/book">' + icon('cal') + 'Записаться</a>' +
      '<a class="btn btn--ghost" href="tel:' + esc(c.phone) + '">' + icon('phone') + 'Позвонить</a>' +
      '<a class="btn btn--ghost" href="' + esc(c.routeUrl) + '" target="_blank" rel="noopener">' + icon('route') + 'Маршрут</a>';
    homeDirty = false;
    if (V.afterHome) V.afterHome();
  }

  /* ================= ЗАПИСЬ ================= */
  var bk = null;
  function newBk(pre) {
    var s = pre ? svcById(pre) : null;
    return { step: s ? 2 : 1, serviceId: s ? s.id : null, date: null, time: null, name: '', phone: '', car: '', consent: false, done: null, booking: null };
  }
  function openBook(pre) {
    if (state.book) return;
    bk = newBk(pre);
    state.book = true; updateLock();
    lastFocus.book = document.activeElement;
    $('#book').hidden = false;
    renderBook(true);
  }
  function closeBook() {
    if (!state.book) return;
    $('#book').hidden = true;
    state.book = false; updateLock();
    var f = lastFocus.book;
    if (f && document.contains(f)) { try { f.focus({ preventScroll: true }); } catch (e) { /* */ } }
    bk = null;
  }
  var STEP_TITLES = ['Что нужно сделать', 'Когда удобно', 'Как с вами связаться'];

  function renderBook(focusTitle) {
    var el = $('#book');
    var svc = svcById(bk.serviceId);
    var step = bk.step;
    el.classList.toggle('is-done', !!bk.done);
    $('#bk-back').style.visibility = (bk.done || step === 1) ? 'hidden' : 'visible';
    $('#bk-steps').hidden = !!bk.done;
    $$('#bk-steps i').forEach(function (i, idx) { i.classList.toggle('on', idx < step); });
    $('#bk-count').textContent = bk.done ? '' : 'Шаг ' + step + ' из 3';
    var title = bk.done ? 'Запись' : STEP_TITLES[step - 1];
    $('#bk-title').textContent = title;
    var body = $('#bk-body'), foot = $('#bk-foot');
    if (bk.done) { renderDone(body, foot); }
    else if (step === 1) { renderStep1(body, foot); }
    else if (step === 2) { renderStep2(body, foot, svc); }
    else { renderStep3(body, foot, svc); }
    body.scrollTop = 0;
    var h = $('#bk-title'); h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true });
  }

  function footSummary(svc, extra) {
    if (!svc) return '';
    return '<div class="bk-sum"><span class="bk-sum__n">' + esc(svc.name) + '</span><span class="bk-sum__p">' + esc(extra || fmtPrice(svc)) + '</span></div>';
  }

  function renderStep1(body, foot) {
    var c = ctx(), html = '<div role="radiogroup" aria-label="Услуга">';
    c.cats.forEach(function (cat) {
      html += '<fieldset class="grp"><legend class="grp__t">' + esc(cat.name) + '</legend>';
      cat.items.forEach(function (s) {
        var on = s.id === bk.serviceId;
        html += '<label class="opt' + (on ? ' is-on' : '') + '"><input type="radio" name="svc" value="' + esc(s.id) + '"' + (on ? ' checked' : '') + '>' +
          '<span class="opt__main"><span class="opt__name">' + esc(s.name) + '</span><span class="opt__meta">' + esc(svcMeta(s)) + '</span></span>' +
          '<span class="opt__price' + (s.price == null ? ' is-ask' : '') + '">' + esc(fmtPrice(s)) + '</span></label>';
      });
      html += '</fieldset>';
    });
    body.innerHTML = html + '</div>';
    foot.innerHTML = '<div id="bk-sumbox">' + footSummary(svcById(bk.serviceId)) + '</div>' +
      '<button class="btn btn--primary btn--lg btn--block" type="button" data-act="bk-next"' + (bk.serviceId ? '' : ' disabled') + '>Дальше</button>';
  }

  function dayList() {
    var out = [], base = today(), svc = svcById(bk.serviceId), dur = svc ? svc.durationMin : 60;
    for (var i = 0; i < 7; i++) {
      var d = addDays(base, i);
      out.push({ d: d, key: ds(d), i: i, slots: freeSlots(d, dur), open: hoursFor(d).length > 0 });
    }
    return out;
  }

  function renderStep2(body, foot, svc) {
    if (!svc) { bk.step = 1; return renderBook(); }
    if (svc.long) {
      body.innerHTML =
        '<div class="note">' + icon('wait', 'note__i') +
        '<div><h3 class="note__t">Время выбирает мастер</h3><p>Это долгая работа, поэтому выбрать час здесь нельзя. Оставьте заявку: мастер перезвонит, ответит на вопросы и назовёт, когда можно приехать.</p></div></div>' +
        '<div class="pick"><span class="pick__l">Вы выбрали</span><strong>' + esc(svc.name) + '</strong><span>' + esc(fmtPrice(svc)) + '</span></div>';
      foot.innerHTML = footSummary(svc) + '<button class="btn btn--primary btn--lg btn--block" type="button" data-act="bk-next">Дальше</button>';
      return;
    }
    var days = dayList();
    if (!bk.date || !days.some(function (x) { return x.key === bk.date && x.slots.length; })) {
      var f = days.filter(function (x) { return x.slots.length; })[0];
      bk.date = f ? f.key : days[0].key; bk.time = null;
    }
    var h = '<div class="days" role="radiogroup" aria-label="День">';
    days.forEach(function (x) {
      var on = x.key === bk.date, dis = !x.slots.length;
      h += '<button type="button" class="day' + (on ? ' is-on' : '') + '" role="radio" aria-checked="' + on + '" data-act="bk-day" data-d="' + x.key + '"' + (dis ? ' disabled' : '') + '>' +
        '<span class="day__w">' + (x.i === 0 ? 'Сегодня' : x.i === 1 ? 'Завтра' : DOW[x.d.getDay()]) + '</span>' +
        '<span class="day__n">' + x.d.getDate() + '</span>' +
        '<span class="day__m">' + (dis ? (x.open ? 'нет мест' : 'выходной') : MON_SHORT[x.d.getMonth()]) + '</span></button>';
    });
    h += '</div><div id="bk-slots"></div>';
    body.innerHTML = h;
    paintSlots();
    updateStep2Foot();
  }

  function paintSlots() {
    var svc = svcById(bk.serviceId), d = parseDs(bk.date), slots = freeSlots(d, svc.durationMin);
    var groups = [['Утро', 0, 12 * 60], ['День', 12 * 60, 17 * 60], ['Вечер', 17 * 60, 24 * 60]];
    var h = '<p class="slots__info">' + esc(cap(dayLabel(d))) + '. Свободных окон: ' + slots.length + '. Займёт ' + (svc.durationStub ? 'около ' : '') + esc(fmtDur(svc.durationMin)) + '</p>';
    groups.forEach(function (g) {
      var list = slots.filter(function (t) { return t >= g[1] && t < g[2]; });
      if (!list.length) return;
      h += '<h3 class="slots__t">' + g[0] + '</h3><div class="slots">';
      list.forEach(function (t) {
        h += '<button type="button" class="slot' + (bk.time === t ? ' is-on' : '') + '" aria-pressed="' + (bk.time === t) + '" data-act="bk-time" data-t="' + t + '">' + mt(t) + '</button>';
      });
      h += '</div>';
    });
    $('#bk-slots').innerHTML = h;
  }
  function updateStep2Foot() {
    var svc = svcById(bk.serviceId), foot = $('#bk-foot');
    var extra = bk.time != null ? dayLabel(parseDs(bk.date)) + ', ' + mt(bk.time) : 'Выберите время';
    foot.innerHTML = '<div class="bk-sum"><span class="bk-sum__n">' + esc(svc.name) + '</span><span class="bk-sum__p">' + esc(extra) + '</span></div>' +
      '<button class="btn btn--primary btn--lg btn--block" type="button" data-act="bk-next"' + (bk.time == null ? ' disabled' : '') + '>Дальше</button>';
  }

  function renderStep3(body, foot, svc) {
    if (!svc) { bk.step = 1; return renderBook(); }
    var when = svc.long ? 'Время согласует мастер по телефону' : cap(dayLabel(parseDs(bk.date))) + ', ' + mt(bk.time);
    body.innerHTML =
      '<div class="pick"><span class="pick__l">' + (svc.long ? 'Заявка' : 'Запись') + '</span><strong>' + esc(svc.name) + '</strong><span>' + esc(when) + '. Стоимость: ' + esc(fmtPrice(svc)) + '</span></div>' +
      '<form id="bk-form" novalidate autocomplete="on">' +
      '<div class="fld"><label for="f-name">Ваше имя</label><input id="f-name" name="name" type="text" autocomplete="name" placeholder="Как к вам обращаться" value="' + esc(bk.name) + '" aria-describedby="e-name"><p class="err" id="e-name" hidden></p></div>' +
      '<div class="fld"><label for="f-phone">Телефон</label><input id="f-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 (___) ___-__-__" value="' + esc(bk.phone) + '" aria-describedby="e-phone"><p class="err" id="e-phone" hidden></p></div>' +
      '<div class="fld"><label for="f-car">Марка и модель машины</label><input id="f-car" name="car" type="text" autocomplete="off" placeholder="Например, Kia Rio" value="' + esc(bk.car) + '" aria-describedby="e-car"><p class="err" id="e-car" hidden></p></div>' +
      '<input class="hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">' +
      '<div class="fld fld--chk"><label class="chk"><input id="f-consent" type="checkbox"' + (bk.consent ? ' checked' : '') + ' aria-describedby="e-consent"><span class="chk__box">' + icon('check') + '</span>' +
      '<span class="chk__t">Согласен на обработку персональных данных и принимаю <a href="#" data-act="policy">политику конфиденциальности</a></span></label><p class="err" id="e-consent" hidden></p></div>' +
      '</form>';
    bindPhone($('#f-phone'));
    foot.innerHTML = '<button class="btn btn--primary btn--lg btn--block" type="submit" form="bk-form">' + (svc.long ? 'Оставить заявку, мастер перезвонит' : 'Записаться') + '</button>';
    $('#bk-form').addEventListener('submit', submitBook);
  }

  function setErr(id, msg) {
    var e = $('#e-' + id), inp = $(id === 'consent' ? '#f-consent' : '#f-' + id);
    if (!e) return;
    e.hidden = !msg; e.textContent = msg || '';
    if (inp) inp.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }
  function submitBook(ev) {
    ev.preventDefault();
    var svc = svcById(bk.serviceId);
    bk.name = $('#f-name').value.trim(); bk.phone = $('#f-phone').value; bk.car = $('#f-car').value.trim(); bk.consent = $('#f-consent').checked;
    var bad = [];
    setErr('name', bk.name.length < 2 ? 'Напишите, как к вам обращаться' : ''); if (bk.name.length < 2) bad.push('#f-name');
    setErr('phone', phoneDigits(bk.phone).length !== 10 ? 'Введите номер полностью: +7 и ещё 10 цифр' : ''); if (phoneDigits(bk.phone).length !== 10) bad.push('#f-phone');
    setErr('car', bk.car.length < 2 ? 'Укажите марку и модель, например Kia Rio' : ''); if (bk.car.length < 2) bad.push('#f-car');
    setErr('consent', !bk.consent ? 'Без согласия мы не можем вас записать' : ''); if (!bk.consent) bad.push('#f-consent');
    if (bad.length) { $(bad[0]).focus(); return; }
    var hp = $('#bk-form [name=website]').value;
    var b = {
      id: 'w-' + Date.now().toString(36), source: 'site', status: 'new', created: Date.now(),
      serviceId: svc.id, serviceName: svc.name, price: fmtPrice(svc), long: !!svc.long,
      name: bk.name, phone: bk.phone, car: bk.car
    };
    if (svc.long) { b.date = ds(today()); b.time = null; b.s = 0; b.e = 0; }
    else { b.date = bk.date; b.s = bk.time; b.e = bk.time + svc.durationMin; b.time = mt(bk.time); }
    if (!hp) addBooking(b);
    bk.booking = b; bk.done = 'ok';
    renderBook();
  }

  function renderDone(body, foot) {
    var b = bk.booking;
    if (bk.done === 'cancelled') {
      body.innerHTML = '<div class="ok"><div class="ok__mark ok__mark--no">' + icon('x') + '</div><h3 class="ok__h">Запись отменена</h3><p class="ok__lead">Мы передали это в кабинет. Если планы изменятся, запишитесь снова.</p></div>';
      foot.innerHTML = '<button class="btn btn--primary btn--lg btn--block" type="button" data-act="bk-restart">Записаться снова</button><a class="btn btn--ghost btn--block" href="#/">На главную</a>';
      return;
    }
    var when = b.long ? null : cap(dayLabel(parseDs(b.date))) + ', ' + b.time;
    var h = '<div class="ok"><div class="ok__mark">' + icon('check') + '</div>' +
      '<h3 class="ok__h">' + (b.long ? 'Заявка принята' : 'Вы записаны') + '</h3>' +
      '<p class="ok__lead">' + (b.long ? 'Мастер перезвонит на ' + esc(b.phone) + ' и согласует время.' : 'Ждём вас ' + esc(whenPhrase(b)) + '. Можно добавить запись в календарь.') + '</p>' +
      '<dl class="ok__d">' +
      '<div><dt>Услуга</dt><dd>' + esc(b.serviceName) + '</dd></div>' +
      (b.long ? '' : '<div><dt>Когда</dt><dd>' + esc(when) + '</dd></div>') +
      '<div><dt>Где</dt><dd>' + esc(B.city + ', ' + B.address) + '</dd></div>' +
      '<div><dt>Стоимость</dt><dd>' + esc(b.price) + '</dd></div>' +
      '<div><dt>Вы</dt><dd>' + esc(b.name) + ', ' + esc(b.phone) + ', ' + esc(b.car) + '</dd></div></dl>' +
      '<div class="ok__act">' +
      (b.long ? '' : '<button class="btn btn--primary" type="button" data-act="bk-ics">' + icon('dl') + 'Добавить в календарь</button>') +
      '<a class="btn btn--ghost" href="' + esc(routeUrl()) + '" target="_blank" rel="noopener">' + icon('route') + 'Построить маршрут</a>' +
      '<button class="btn btn--quiet" type="button" data-act="bk-cancel">' + (b.long ? 'Отменить заявку' : 'Отменить запись') + '</button></div></div>';
    body.innerHTML = h;
    foot.innerHTML = '<a class="btn btn--primary btn--lg btn--block" href="#/">Готово</a>';
  }

  function downloadIcs() {
    var b = bk.booking, p = b.date.split('-').map(Number);
    function f(x) { return x.getUTCFullYear() + pad(x.getUTCMonth() + 1) + pad(x.getUTCDate()) + 'T' + pad(x.getUTCHours()) + pad(x.getUTCMinutes()) + '00Z'; }
    function e(t) { return String(t).replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n'); }
    var st = new Date(Date.UTC(p[0], p[1] - 1, p[2], 0, b.s - 180)), en = new Date(Date.UTC(p[0], p[1] - 1, p[2], 0, b.e - 180));
    var lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//' + B.name + '//Demo//RU', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT',
      'UID:' + b.id + '@' + SLUG + '.demo', 'DTSTAMP:' + f(new Date()), 'DTSTART:' + f(st), 'DTEND:' + f(en),
      'SUMMARY:' + e(B.name + ': ' + b.serviceName), 'LOCATION:' + e(B.city + ', ' + B.address),
      'DESCRIPTION:' + e('Запись в «' + B.name + '». Телефон: ' + B.contacts.phones[0]),
      'BEGIN:VALARM', 'TRIGGER:-PT1H', 'ACTION:DISPLAY', 'DESCRIPTION:Запись через час', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'];
    var blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'zapis-' + SLUG + '.ics';
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    toast('Файл календаря скачан');
  }

  /* ================= КАБИНЕТ ================= */
  var own = { tab: 'bookings', range: 'today', draft: null, sched: null, authed: false };
  try { own.authed = sessionStorage.getItem(K('auth')) === '1'; } catch (e) { /* */ }
  var ST = { new: 'Ожидает', came: 'Пришёл', noshow: 'Не пришёл', done: 'Выполнено', cancelled: 'Отменено' };

  function renderOwner() {
    var root = $('#owner');
    if (!own.authed) {
      root.innerHTML =
        '<div class="o-login"><div class="o-login__box">' +
        '<p class="o-login__brand">' + esc(B.name) + '</p><h1 class="o-login__h">Кабинет владельца</h1>' +
        '<p class="o-login__demo">Демо-доступ: подойдёт любая почта и любой пароль.</p>' +
        '<form id="o-form" novalidate>' +
        '<div class="fld"><label for="o-mail">Почта</label><input id="o-mail" type="email" autocomplete="username" placeholder="name@mail.ru" aria-describedby="e-omail"><p class="err" id="e-omail" hidden></p></div>' +
        '<div class="fld"><label for="o-pass">Пароль</label><input id="o-pass" type="password" autocomplete="current-password" placeholder="Любой пароль" aria-describedby="e-opass"><p class="err" id="e-opass" hidden></p></div>' +
        '<button class="btn btn--primary btn--lg btn--block" type="submit">Войти</button></form>' +
        '<a class="o-login__back" href="#/">На сайт для клиентов</a></div></div>';
      $('#o-form').addEventListener('submit', function (e) {
        e.preventDefault();
        var m = $('#o-mail').value.trim(), p = $('#o-pass').value;
        var em = $('#e-omail'), ep = $('#e-opass');
        em.hidden = !!m; em.textContent = m ? '' : 'Введите почту, любую для демо';
        ep.hidden = !!p; ep.textContent = p ? '' : 'Введите пароль, любой для демо';
        if (!m) { $('#o-mail').focus(); return; }
        if (!p) { $('#o-pass').focus(); return; }
        own.authed = true;
        try { sessionStorage.setItem(K('auth'), '1'); } catch (er) { /* */ }
        renderOwner();
      });
      return;
    }
    var tabs = [['bookings', 'Записи', 'cal'], ['services', 'Услуги и цены', 'tag'], ['schedule', 'График', 'clock']];
    root.innerHTML =
      '<div class="o-app"><header class="o-head"><div class="o-head__t"><span class="o-head__b">' + esc(B.name) + '</span><span class="o-head__s">Кабинет владельца</span></div>' +
      '<nav class="o-tabs" role="tablist" aria-label="Разделы кабинета">' +
      tabs.map(function (t) {
        return '<button class="o-tab" role="tab" type="button" data-act="o-tab" data-tab="' + t[0] + '" aria-selected="' + (own.tab === t[0]) + '">' + icon(t[2]) + '<span>' + t[1] + '</span></button>';
      }).join('') + '</nav>' +
      '<button class="btn btn--quiet o-out" type="button" data-act="o-exit">' + icon('out') + '<span>Выйти</span></button></header>' +
      '<main class="o-main" id="o-main"></main></div>';
    renderOwnerTab();
  }
  function renderOwnerTab() {
    $$('.o-tab').forEach(function (t) { t.setAttribute('aria-selected', t.dataset.tab === own.tab); });
    var m = $('#o-main');
    if (own.tab === 'bookings') renderBookings(m);
    else if (own.tab === 'services') renderServicesEd(m);
    else renderScheduleEd(m);
  }

  function rowHtml(b) {
    var who = esc(b.name) + (b.car ? ', ' + esc(b.car) : '');
    var tmx = b.time ? '<span class="row__time">' + b.time + '<small>до ' + mt(b.e) + '</small></span>' : '<span class="row__time row__time--q">' + icon('phone') + '<small>позвонить</small></span>';
    return '<li><button type="button" class="row" data-act="o-open" data-id="' + esc(b.id) + '">' + tmx +
      '<span class="row__main"><b>' + esc(b.serviceName) + '</b><span>' + who + '</span><em>' + (b.source === 'site' ? 'С сайта' : b.source === 'manual' ? 'Записали вручную' : 'По звонку') + '</em></span>' +
      '<span class="st st--' + b.status + '">' + ST[b.status] + '</span></button></li>';
  }
  function renderBookings(m) {
    var all = allBookings(), t0 = today(), key0 = ds(t0);
    var timed = all.filter(function (b) { return b.time; }).sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : a.s - b.s; });
    var reqs = all.filter(function (b) { return b.long && b.status === 'new'; });
    var list, h = '';
    h += '<div class="o-bar"><div class="seg" role="group" aria-label="Период">' +
      '<button type="button" data-act="o-range" data-r="today" aria-pressed="' + (own.range === 'today') + '">Сегодня</button>' +
      '<button type="button" data-act="o-range" data-r="week" aria-pressed="' + (own.range === 'week') + '">Неделя</button></div>' +
      '<button class="btn btn--primary o-add" type="button" data-act="o-add">' + icon('plus') + 'Записать вручную</button></div>';
    if (own.range === 'today') {
      list = timed.filter(function (b) { return b.date === key0; });
      var act = list.filter(function (b) { return b.status !== 'cancelled'; });
      var wait = act.filter(function (b) { return b.status === 'new'; }).length;
      var done = act.filter(function (b) { return b.status === 'done'; }).length;
      h += '<p class="o-sum"><b>' + cap(dayLabel(t0)) + '.</b> ' + act.length + ' ' + plural(act.length, ['запись', 'записи', 'записей']) + ', ждут ' + wait + ', выполнено ' + done + '</p>';
      if (reqs.length) h += reqBlock(reqs);
      h += list.length ? '<ul class="rows">' + list.map(rowHtml).join('') + '</ul>' :
        '<div class="empty"><p>На сегодня записей нет.</p><button class="btn btn--ghost" type="button" data-act="o-add">Записать клиента по звонку</button></div>';
    } else {
      var week = timed.filter(function (b) { return b.date >= key0 && b.date <= ds(addDays(t0, 6)); });
      var live = week.filter(function (b) { return b.status !== 'cancelled'; }).length;
      h += '<p class="o-sum"><b>Ближайшие 7 дней.</b> ' + live + ' ' + plural(live, ['запись', 'записи', 'записей']) + '</p>';
      if (reqs.length) h += reqBlock(reqs);
      for (var i = 0; i < 7; i++) {
        var d = addDays(t0, i), k = ds(d), ls = week.filter(function (b) { return b.date === k; });
        h += '<section class="o-day"><h3 class="o-day__h">' + relDay(d) + '<span>' + d.getDate() + ' ' + MON_GEN[d.getMonth()] + '</span></h3>' +
          (hoursFor(d).length ? (ls.length ? '<ul class="rows">' + ls.map(rowHtml).join('') + '</ul>' : '<p class="o-day__e">Записей нет</p>') : '<p class="o-day__e">Выходной</p>') + '</section>';
      }
    }
    m.innerHTML = h;
  }
  function reqBlock(reqs) {
    return '<section class="o-req"><h3 class="o-req__h">Заявки: ждут звонка (' + reqs.length + ')</h3><ul class="rows">' + reqs.map(rowHtml).join('') + '</ul></section>';
  }

  function openCard(id) {
    var b = getBooking(id);
    if (!b) return;
    var wa = 'https://wa.me/7' + phoneDigits(b.phone);
    var when = b.time ? cap(dayLabel(parseDs(b.date))) + ', ' + b.time + ' до ' + mt(b.e) : 'Заявка без времени: нужно перезвонить';
    var h = '<dl class="card">' +
      '<div><dt>Услуга</dt><dd>' + esc(b.serviceName) + '</dd></div>' +
      '<div><dt>Когда</dt><dd>' + esc(when) + '</dd></div>' +
      '<div><dt>Клиент</dt><dd>' + esc(b.name) + '</dd></div>' +
      '<div><dt>Телефон</dt><dd>' + esc(b.phone) + '</dd></div>' +
      '<div><dt>Машина</dt><dd>' + esc(b.car || 'не указана') + '</dd></div>' +
      '<div><dt>Стоимость</dt><dd>' + esc(b.price) + '</dd></div></dl>' +
      '<div class="card__act"><a class="btn btn--primary" href="' + telHref(b.phone) + '">' + icon('phone') + 'Позвонить</a>' +
      '<a class="btn btn--ghost" href="' + wa + '" target="_blank" rel="noopener">' + icon('chat') + 'WhatsApp</a></div>' +
      '<h4 class="card__h">Статус</h4><div class="stbtns" role="group" aria-label="Статус записи">' +
      ['came', 'noshow', 'done', 'cancelled'].map(function (s) {
        return '<button type="button" class="stbtn st--' + s + '" data-act="o-status" data-id="' + esc(b.id) + '" data-s="' + s + '" aria-pressed="' + (b.status === s) + '">' + ST[s] + '</button>';
      }).join('') + '</div>';
    openSheet({ title: b.name, body: h, wide: true });
  }

  function openManual() {
    var sv = services(), days = [];
    for (var i = 0; i < 7; i++) { var d = addDays(today(), i); days.push(d); }
    var h = '<form id="m-form" novalidate>' +
      '<div class="fld"><label for="m-svc">Услуга</label><select id="m-svc">' + sv.map(function (s) { return '<option value="' + esc(s.id) + '">' + esc(s.name) + '</option>'; }).join('') + '</select></div>' +
      '<div class="fld-row"><div class="fld"><label for="m-day">День</label><select id="m-day">' + days.map(function (d) { return '<option value="' + ds(d) + '">' + relDay(d) + ', ' + d.getDate() + ' ' + MON_GEN[d.getMonth()] + '</option>'; }).join('') + '</select></div>' +
      '<div class="fld"><label for="m-time">Время</label><select id="m-time"></select></div></div>' +
      '<div class="fld"><label for="m-name">Имя клиента</label><input id="m-name" type="text" autocomplete="off" placeholder="Как зовут"><p class="err" id="e-mname" hidden></p></div>' +
      '<div class="fld"><label for="m-phone">Телефон</label><input id="m-phone" type="tel" inputmode="tel" placeholder="+7 (___) ___-__-__"><p class="err" id="e-mphone" hidden></p></div>' +
      '<div class="fld"><label for="m-car">Марка и модель машины</label><input id="m-car" type="text" autocomplete="off" placeholder="Можно не заполнять"></div>' +
      '<p class="err" id="e-mtime" hidden></p></form>';
    openSheet({
      title: 'Записать вручную', body: h, wide: true,
      foot: '<button class="btn btn--ghost" type="button" data-act="sheet-no">Отмена</button><button class="btn btn--primary" type="button" data-act="m-save">Записать</button>'
    });
    bindPhone($('#m-phone'));
    $('#m-svc').addEventListener('change', fillManualTimes);
    $('#m-day').addEventListener('change', fillManualTimes);
    fillManualTimes();
  }
  function fillManualTimes() {
    var svc = svcById($('#m-svc').value), sel = $('#m-time');
    if (svc.long) { sel.innerHTML = '<option value="">Без времени, перезвоним</option>'; sel.disabled = true; return; }
    sel.disabled = false;
    var sl = freeSlots(parseDs($('#m-day').value), svc.durationMin);
    sel.innerHTML = sl.length ? sl.map(function (t) { return '<option value="' + t + '">' + mt(t) + '</option>'; }).join('') : '<option value="">Нет свободного времени</option>';
  }
  function saveManual() {
    var svc = svcById($('#m-svc').value), name = $('#m-name').value.trim(), ph = $('#m-phone').value, car = $('#m-car').value.trim();
    var ok = true, tv = $('#m-time').value;
    var e1 = $('#e-mname'), e2 = $('#e-mphone'), e3 = $('#e-mtime');
    e1.hidden = name.length >= 2; e1.textContent = 'Напишите имя клиента'; if (name.length < 2) ok = false;
    var pOk = phoneDigits(ph).length === 10; e2.hidden = pOk; e2.textContent = 'Введите номер полностью'; if (!pOk) ok = false;
    var tOk = svc.long || tv !== ''; e3.hidden = tOk; e3.textContent = 'На этот день нет свободного времени, выберите другой'; if (!tOk) ok = false;
    if (!ok) return;
    var b = {
      id: 'w-' + Date.now().toString(36), source: 'manual', status: 'new', created: Date.now(),
      serviceId: svc.id, serviceName: svc.name, price: fmtPrice(svc), long: !!svc.long, name: name, phone: ph, car: car
    };
    if (svc.long) { b.date = ds(today()); b.time = null; b.s = 0; b.e = 0; }
    else { b.date = $('#m-day').value; b.s = Number(tv); b.e = b.s + svc.durationMin; b.time = mt(b.s); }
    addBooking(b);
    closeSheet(true);
    toast('Запись добавлена');
    if (own.tab === 'bookings') renderOwnerTab();
  }

  /* --- услуги и цены --- */
  function renderServicesEd(m) {
    if (!own.draft) own.draft = services().map(function (s) { return Object.assign({}, s); });
    var cats = []; own.draft.forEach(function (s) { if (s.category && cats.indexOf(s.category) < 0) cats.push(s.category); });
    var h = '<div class="o-bar o-bar--s"><div><h2 class="o-h">Услуги и цены</h2><p class="o-hint">Правки видят клиенты на сайте и в записи. Пустая цена показывается как «по запросу».</p></div></div>' +
      '<datalist id="cats">' + cats.map(function (c) { return '<option value="' + esc(c) + '">'; }).join('') + '</datalist><div class="svs">';
    own.draft.forEach(function (s, i) {
      h += '<article class="sv" data-i="' + i + '">' +
        '<div class="fld"><label for="sv-n' + i + '">Название</label><input id="sv-n' + i + '" data-f="name" type="text" value="' + esc(s.name) + '"></div>' +
        '<div class="sv__g">' +
        '<div class="fld"><label for="sv-p' + i + '">Цена, ' + esc(s.priceUnit || '₽') + '</label><input id="sv-p' + i + '" data-f="price" type="number" inputmode="numeric" min="0" step="50" placeholder="по запросу" value="' + (s.price == null ? '' : s.price) + '"></div>' +
        '<div class="fld"><label for="sv-d' + i + '">Длительность, мин</label><input id="sv-d' + i + '" data-f="durationMin" type="number" inputmode="numeric" min="10" step="5" value="' + s.durationMin + '"></div>' +
        '<div class="fld"><label for="sv-c' + i + '">Раздел</label><input id="sv-c' + i + '" data-f="category" type="text" list="cats" value="' + esc(s.category || '') + '"></div></div>' +
        '<div class="sv__c"><label class="chk"><input type="checkbox" data-f="priceFrom"' + (s.priceFrom ? ' checked' : '') + '><span class="chk__box">' + icon('check') + '</span><span class="chk__t">Цена «от»</span></label>' +
        '<label class="chk"><input type="checkbox" data-f="long"' + (s.long ? ' checked' : '') + '><span class="chk__box">' + icon('check') + '</span><span class="chk__t">Долгая работа: заявка, без выбора времени</span></label>' +
        '<button type="button" class="btn btn--quiet btn--sm sv__del" data-act="sv-del" data-i="' + i + '">' + icon('trash') + 'Удалить</button></div></article>';
    });
    h += '</div><div class="o-foot"><button class="btn btn--ghost" type="button" data-act="sv-add">' + icon('plus') + 'Добавить услугу</button>' +
      '<button class="btn btn--quiet" type="button" data-act="sv-reset">Вернуть исходные</button>' +
      '<button class="btn btn--primary" type="button" data-act="sv-save">Сохранить</button></div>';
    m.innerHTML = h;
  }
  function svField(el) {
    var art = el.closest('.sv'); if (!art) return;
    var s = own.draft[Number(art.dataset.i)], f = el.dataset.f;
    if (!f) return;
    if (el.type === 'checkbox') s[f] = el.checked;
    else if (f === 'price') s.price = el.value === '' ? null : Number(el.value);
    else if (f === 'durationMin') s.durationMin = Number(el.value) || 0;
    else s[f] = el.value;
    if (f === 'durationMin') s.durationStub = false;
  }

  /* --- график --- */
  function renderScheduleEd(m) {
    if (!own.sched) own.sched = { days: JSON.parse(JSON.stringify(schedule())), res: resCount() };
    var sc = own.sched, h = '<div class="o-bar o-bar--s"><div><h2 class="o-h">График работы</h2><p class="o-hint">От него зависит, какое время видят клиенты при записи.</p></div></div><div class="sch">';
    ORDER.forEach(function (k) {
      var r = (sc.days[k] || [])[0], on = !!r;
      h += '<div class="dr' + (on ? '' : ' is-off') + '" data-d="' + k + '"><label class="chk dr__on"><input type="checkbox" data-f="on"' + (on ? ' checked' : '') + ' aria-label="' + DAY_FULL[k] + ': работаем"><span class="chk__box">' + icon('check') + '</span><span class="chk__t">' + DAY_FULL[k] + '</span></label>' +
        '<div class="dr__t"><label class="vh" for="dr-f' + k + '">С</label><input id="dr-f' + k + '" type="time" data-f="from" value="' + (r ? r.from : '09:00') + '"' + (on ? '' : ' disabled') + '><span aria-hidden="true">до</span>' +
        '<label class="vh" for="dr-t' + k + '">До</label><input id="dr-t' + k + '" type="time" data-f="to" value="' + (r ? r.to : '18:00') + '"' + (on ? '' : ' disabled') + '></div>' +
        '<span class="dr__w">' + (on ? '' : 'Выходной') + '</span></div>';
    });
    var lab = B.resources.label;
    h += '</div><div class="res"><div><h3 class="res__t">Сколько ' + esc(lab) + 'ов работает одновременно</h3><p class="o-hint">Столько клиентов можно записать на одно и то же время.</p></div>' +
      '<div class="step" role="group" aria-label="Число ' + esc(lab) + 'ов"><button type="button" class="step__b" data-act="res-m" aria-label="Меньше">' + icon('minus') + '</button><output class="step__v" id="res-v">' + sc.res + '</output><button type="button" class="step__b" data-act="res-p" aria-label="Больше">' + icon('plus') + '</button></div></div>' +
      '<p class="err" id="e-sch" hidden></p>' +
      '<div class="o-foot"><button class="btn btn--quiet" type="button" data-act="sch-reset">Вернуть исходный</button><button class="btn btn--primary" type="button" data-act="sch-save">Сохранить</button></div>';
    m.innerHTML = h;
  }
  function schField(el) {
    var row = el.closest('.dr'); if (!row) return;
    var k = row.dataset.d, f = el.dataset.f, d = own.sched.days;
    if (f === 'on') {
      if (el.checked) { d[k] = [{ from: $('[data-f=from]', row).value || '09:00', to: $('[data-f=to]', row).value || '18:00' }]; }
      else d[k] = [];
      row.classList.toggle('is-off', !el.checked);
      $$('input[type=time]', row).forEach(function (i) { i.disabled = !el.checked; });
      $('.dr__w', row).textContent = el.checked ? '' : 'Выходной';
    } else if (d[k] && d[k][0]) d[k][0][f] = el.value;
  }

  /* ---------- лайтбокс ---------- */
  var lbList = [], lbI = 0;
  function openLb(i) {
    lbList = photos(); lbI = i;
    lastFocus.lb = document.activeElement;
    state.lb = true; updateLock();
    $('#lb').hidden = false; paintLb();
    $('#lb-close').focus();
  }
  function paintLb() {
    var p = lbList[lbI];
    $('#lb-img').src = p.src; $('#lb-img').alt = photoAlt(p);
    $('#lb-n').textContent = (lbI + 1) + ' из ' + lbList.length;
  }
  function closeLb() {
    $('#lb').hidden = true; state.lb = false; updateLock();
    if (lastFocus.lb && document.contains(lastFocus.lb)) lastFocus.lb.focus();
  }

  /* ---------- события ---------- */
  document.addEventListener('click', function (e) {
    var sc = e.target.closest('[data-scroll]');
    if (sc) {
      e.preventDefault();
      var tg = document.getElementById(sc.dataset.scroll);
      if (tg) tg.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      return;
    }
    var t = e.target.closest('[data-act]');
    if (!t) return;
    var a = t.dataset.act;
    switch (a) {
      case 'policy': e.preventDefault(); toast('В демо-версии политика конфиденциальности — заглушка'); break;
      case 'close-book': location.hash = '#/'; break;
      case 'bk-back': if (bk.step > 1) { bk.step--; renderBook(); } break;
      case 'bk-next':
        if (bk.step === 1 && bk.serviceId) { bk.step = 2; renderBook(); }
        else if (bk.step === 2) { if (svcById(bk.serviceId).long || bk.time != null) { bk.step = 3; renderBook(); } }
        break;
      case 'bk-day': bk.date = t.dataset.d; bk.time = null; $$('.day').forEach(function (d) { var on = d === t; d.classList.toggle('is-on', on); d.setAttribute('aria-checked', on); }); paintSlots(); updateStep2Foot(); break;
      case 'bk-time': bk.time = Number(t.dataset.t); $$('.slot').forEach(function (s) { var on = s === t; s.classList.toggle('is-on', on); s.setAttribute('aria-pressed', on); }); updateStep2Foot(); break;
      case 'bk-ics': downloadIcs(); break;
      case 'bk-restart': bk = newBk(null); renderBook(); break;
      case 'bk-cancel':
        ask(bk.booking.long ? 'Отменить заявку?' : 'Отменить запись?', 'Время освободится, владелец увидит отмену в кабинете.', 'Да, отменить', true).then(function (yes) {
          if (!yes) return;
          setStatus(bk.booking.id, 'cancelled'); bk.done = 'cancelled'; renderBook(); toast('Запись отменена');
        });
        break;
      case 'sheet-no': closeSheet(false); break;
      case 'sheet-yes': closeSheet(true); break;
      case 'sheet-close': closeSheet(false); break;
      case 'lightbox': openLb(Number(t.dataset.i)); break;
      case 'lb-close': closeLb(); break;
      case 'lb-prev': lbI = (lbI + lbList.length - 1) % lbList.length; paintLb(); break;
      case 'lb-next': lbI = (lbI + 1) % lbList.length; paintLb(); break;
      case 'rail': (function () { var r = document.getElementById(t.dataset.rail); if (r) r.scrollBy({ left: Number(t.dataset.dir) * r.clientWidth * 0.8, behavior: reduceMotion ? 'auto' : 'smooth' }); })(); break;
      /* кабинет */
      case 'o-exit': own.authed = false; try { sessionStorage.removeItem(K('auth')); } catch (er) { /* */ } renderOwner(); break;
      case 'o-tab': own.tab = t.dataset.tab; renderOwnerTab(); break;
      case 'o-range': own.range = t.dataset.r; renderOwnerTab(); break;
      case 'o-open': openCard(t.dataset.id); break;
      case 'o-add': openManual(); break;
      case 'm-save': saveManual(); break;
      case 'o-status':
        var cur = getBooking(t.dataset.id), ns = t.dataset.s === cur.status ? 'new' : t.dataset.s;
        setStatus(t.dataset.id, ns); toast('Статус: ' + ST[ns]); closeSheet(true); renderOwnerTab(); break;
      case 'sv-add':
        own.draft.push({ id: 'c' + Date.now().toString(36), name: 'Новая услуга', price: null, durationMin: 60, long: false, category: 'Другое' });
        renderServicesEd($('#o-main')); var ins = $$('.sv input[data-f=name]'); ins[ins.length - 1].focus(); ins[ins.length - 1].select(); break;
      case 'sv-del':
        ask('Удалить услугу?', own.draft[Number(t.dataset.i)].name, 'Удалить', true).then(function (yes) {
          if (!yes) return; own.draft.splice(Number(t.dataset.i), 1); renderServicesEd($('#o-main'));
        }); break;
      case 'sv-reset':
        ask('Вернуть исходные услуги?', 'Ваши правки цен и названий пропадут.', 'Вернуть', true).then(function (yes) {
          if (!yes) return; drop('services'); own.draft = null; homeDirty = true; renderServicesEd($('#o-main')); toast('Исходные услуги возвращены');
        }); break;
      case 'sv-save':
        var bad = own.draft.filter(function (s) { return !String(s.name).trim() || !(s.durationMin >= 5); });
        if (bad.length) { toast('Проверьте названия и длительность: у каждой услуги нужны оба'); break; }
        own.draft.forEach(function (s) { s.name = String(s.name).trim(); s.category = (s.category || '').trim() || 'Другое'; });
        save('services', own.draft); homeDirty = true; toast('Сохранено. Клиенты видят новые цены'); break;
      case 'res-m': own.sched.res = Math.max(1, own.sched.res - 1); $('#res-v').textContent = own.sched.res; break;
      case 'res-p': own.sched.res = Math.min(12, own.sched.res + 1); $('#res-v').textContent = own.sched.res; break;
      case 'sch-save':
        var er = '';
        ORDER.forEach(function (k) { var r = (own.sched.days[k] || [])[0]; if (r && (!r.from || !r.to || tm(r.to) <= tm(r.from))) er = DAY_FULL[k] + ': время окончания должно быть позже начала'; });
        $('#e-sch').hidden = !er; $('#e-sch').textContent = er;
        if (er) break;
        save('schedule', own.sched.days); save('res', own.sched.res); homeDirty = true; toast('График сохранён'); break;
      case 'sch-reset':
        drop('schedule'); drop('res'); own.sched = null; homeDirty = true; renderScheduleEd($('#o-main')); toast('Исходный график возвращён'); break;
    }
  });
  function clearErr(t) {
    if (t.closest && t.closest('#bk-form') && t.id) { var id = t.id.replace('f-', ''); if ($('#e-' + id) && !$('#e-' + id).hidden) setErr(id, ''); }
  }
  document.addEventListener('change', function (e) {
    var t = e.target; clearErr(t);
    if (t.name === 'svc' && bk) {
      bk.serviceId = t.value; bk.time = null;
      $$('.opt').forEach(function (o) { o.classList.toggle('is-on', $('input', o).checked); });
      $('#bk-sumbox').innerHTML = footSummary(svcById(bk.serviceId));
      $('[data-act=bk-next]', $('#bk-foot')).disabled = false;
    } else if (t.closest && t.closest('.sv')) svField(t);
    else if (t.closest && t.closest('.dr')) schField(t);
  });
  document.addEventListener('input', function (e) {
    var t = e.target; clearErr(t);
    if (t.closest && t.closest('.sv') && t.type !== 'checkbox') svField(t);
    else if (t.closest && t.closest('.dr') && t.type === 'time') schField(t);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (state.lb) closeLb();
      else if (state.sheet) closeSheet(false);
      else if (state.book) location.hash = '#/';
      return;
    }
    if (state.lb) {
      if (e.key === 'ArrowLeft') { lbI = (lbI + lbList.length - 1) % lbList.length; paintLb(); }
      if (e.key === 'ArrowRight') { lbI = (lbI + 1) % lbList.length; paintLb(); }
    }
    if (e.key === 'Tab') {
      if (state.lb) trap($('#lb'), e);
      else if (state.sheet) trap($('#sheet'), e);
      else if (state.book) trap($('#book'), e);
    }
  });

  /* ---------- роутер ---------- */
  function route() {
    var h = location.hash || '#/';
    var parts = h.slice(1).split('?'), path = parts[0], q = new URLSearchParams(parts[1] || '');
    var isOwner = path === '/owner', isBook = path === '/book';
    var prev = document.body.dataset.route;
    document.body.dataset.route = isOwner ? 'owner' : isBook ? 'book' : 'home';
    $('#home').hidden = isOwner;
    $('#owner').hidden = !isOwner;
    $('#dock').hidden = isOwner;
    var dl = $('#demo-link');
    if (isOwner) { dl.textContent = 'Сайт для клиентов'; dl.setAttribute('href', '#/'); }
    else { dl.textContent = 'Кабинет владельца'; dl.setAttribute('href', '#/owner'); }
    document.title = (isOwner ? 'Кабинет' : 'Запись') + ' — ' + B.name + ' (демо)';
    if (isOwner) {
      if (state.book) closeBook();
      renderOwner();
      if (prev !== 'owner') window.scrollTo(0, 0);
    } else {
      if (homeDirty || !$('#home').firstChild) renderHome();
      if (isBook) openBook(q.get('s'));
      else { closeBook(); if (prev === 'owner') window.scrollTo(0, 0); }
    }
  }
  window.addEventListener('hashchange', route);
  route();
})();
