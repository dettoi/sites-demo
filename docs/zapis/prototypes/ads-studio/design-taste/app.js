/* ===== Ads studio: тёмная студия, свет ламп в боксе. Главная ===== */
window.PROTO = {
  car: 'required',
  carLabel: 'Марка и модель',
  carPlaceholder: 'Например, Chery Omoda',
  multi: false,
  home: function (H) {
    var B = H.B, ph = H.photos(), rev = B.reviews, lead = rev[1] || rev[0];
    var hero = ph[0], phone = H.mainPhone(), st = H.openNow(), hl = H.hoursLines();
    var rest = rev.filter(function (r) { return r !== lead; });
    var stars = function (n) { var s = ''; for (var i = 0; i < n; i++) s += H.ic('star', 'star'); return '<span class="stars" role="img" aria-label="Оценка ' + n + ' из 5">' + s + '</span>'; };

    var html = '';
    html += '<header class="hd"><div class="wrap hd__in">' +
      '<a class="logo" href="#/" aria-label="' + H.esc(B.name) + ', на главную"><span class="logo__mark" aria-hidden="true"></span><span class="logo__t">ADS <b>STUDIO</b></span></a>' +
      '<nav class="nav" aria-label="Разделы"><a href="#/" data-goto="services">Услуги</a><a href="#/" data-goto="works">Работы</a><a href="#/" data-goto="reviews">Отзывы</a><a href="#/" data-goto="contacts">Контакты</a></nav>' +
      '<div class="hd__act">' + (phone ? '<a class="hd__tel" href="tel:' + phone + '">' + H.ic('phone') + '<span>' + H.phoneFmt(phone) + '</span></a>' : '') +
      '<a class="btn btn--primary btn--sm" href="#/book" data-act="book">Записаться</a></div></div></header>';

    html += '<main>';
    html += '<section class="hero"><div class="wrap hero__in">' +
      '<div class="hero__copy">' +
      '<p class="hero__loc">' + H.ic('map-pin') + H.esc(B.city) + ', ' + H.esc(B.address) + '</p>' +
      '<h1>Детейлинг и тонировка в&nbsp;Новочеркасске</h1>' +
      '<p class="hero__lead">Полировка, керамика, бронирование плёнкой, сигнализации и автозвук. На мойку запишем по времени, на большие работы примем заявку.</p>' +
      '<div class="hero__cta"><a class="btn btn--primary" href="#/book" data-act="book">' + H.ic('calendar-check') + 'Записаться</a>' +
      (phone ? '<a class="btn btn--ghost" href="tel:' + phone + '">' + H.ic('phone') + 'Позвонить</a>' : '') + '</div>' +
      '<div class="hero__rate"><span class="hero__score">' + H.ratingText() + '</span><span class="hero__rate-t">' + stars(5) + '<span>' + H.reviewsWord() + ' в 2ГИС</span></span></div>' +
      '</div>' +
      '<figure class="hero__photo"><img src="' + hero.src + '" alt="' + H.esc(hero.alt) + '" width="1080" height="1350" fetchpriority="high"></figure>' +
      '</div></section>';

    html += '<section class="facts" aria-label="Коротко"><div class="wrap facts__in">' +
      '<div class="fact">' + H.ic('clock') + '<div><strong>' + H.esc(hl[0].hours) + '</strong><span>' + H.esc(hl[0].days) + '</span></div></div>' +
      '<div class="fact">' + H.ic('map-pin') + '<div><strong>' + H.esc(B.address) + '</strong><span>' + H.esc(B.city) + '</span></div></div>' +
      '<div class="fact">' + H.ic(st.open ? 'door-open' : 'door-closed') + '<div><strong>' + H.esc(st.text) + '</strong><span>по графику студии</span></div></div>' +
      '</div></section>';

    html += '<section class="sec" id="services"><div class="wrap"><div class="sec__head"><span class="bar" aria-hidden="true"></span><h2>Что делаем</h2><p>Цены по запросу. На большие работы оставляйте заявку, мастер перезвонит.</p></div><div class="cats">';
    H.groups().forEach(function (g) {
      html += '<div class="cat"><h3>' + H.esc(g.name) + '</h3><ul>';
      g.items.forEach(function (s) {
        html += '<li><a class="row" href="#/book" data-act="book" data-id="' + H.esc(s.id) + '"><span class="row__name">' + H.esc(s.name) + '</span>' +
          '<span class="row__meta">' + (s.long ? 'Заявка' : (s.durationStub ? '~' : '') + H.durText(s.durationMin)) + '</span>' +
          '<span class="row__price">' + H.priceText(s) + '</span><span class="row__go" aria-hidden="true">' + H.ic('arrow-up-right') + '</span></a></li>';
      });
      html += '</ul></div>';
    });
    html += '</div></div></section>';

    html += '<section class="sec" id="works"><div class="wrap"><div class="sec__head sec__head--row"><div><span class="bar" aria-hidden="true"></span><h2>Работы</h2></div>' +
      '<div class="arrows"><button class="icon-btn icon-btn--bd" type="button" data-act="scroll" data-dir="left" data-target="#strip" aria-label="Листать назад">' + H.ic('arrow-left') + '</button>' +
      '<button class="icon-btn icon-btn--bd" type="button" data-act="scroll" data-dir="right" data-target="#strip" aria-label="Листать вперёд">' + H.ic('arrow-right') + '</button></div></div></div>' +
      '<div class="strip" id="strip" tabindex="0" role="region" aria-label="Фото работ">';
    ph.forEach(function (p, i) {
      html += '<button class="shot" type="button" data-act="photo" data-i="' + i + '" aria-label="Открыть фото ' + (i + 1) + '"><img src="' + p.src + '" alt="' + H.esc(p.alt) + '" loading="lazy" width="1080" height="1350"></button>';
    });
    html += '</div></section>';

    html += '<section class="sec" id="reviews"><div class="wrap"><div class="sec__head"><span class="bar" aria-hidden="true"></span><h2>Что пишут клиенты</h2></div>' +
      '<div class="revs"><figure class="rev rev--lead"><blockquote>' + H.esc(lead.text) + '</blockquote><figcaption>' + stars(lead.rating) + '<span>' + H.esc(lead.author) + '</span></figcaption></figure><div class="revs__rest">';
    rest.forEach(function (r) { html += '<figure class="rev"><blockquote>' + H.esc(r.text) + '</blockquote><figcaption>' + stars(r.rating) + '<span>' + H.esc(r.author) + '</span></figcaption></figure>'; });
    html += '</div></div></div></section>';

    html += '<section class="sec" id="contacts"><div class="wrap"><div class="sec__head"><span class="bar" aria-hidden="true"></span><h2>Где нас найти</h2></div><div class="where">' +
      '<div class="where__addr"><p class="where__big">' + H.esc(B.address) + '</p><p class="where__city">' + H.esc(B.city) + '</p>' +
      '<dl class="hours">' + hl.map(function (l) { return '<div><dt>' + H.esc(l.days) + '</dt><dd>' + H.esc(l.hours) + '</dd></div>'; }).join('') + '</dl>' +
      '<a class="btn btn--primary" href="' + H.routeUrl() + '" target="_blank" rel="noopener">' + H.ic('navigation') + 'Построить маршрут</a></div>' +
      '<ul class="links">' + H.contactLinks().map(function (c) { return '<li><a class="link" href="' + H.esc(c.href) + '"' + (c.ext ? ' target="_blank" rel="noopener"' : '') + '>' + H.ic(c.icon) + '<span class="link__t"><strong>' + H.esc(c.label) + '</strong><span>' + H.esc(c.note) + '</span></span>' + H.ic('arrow-up-right', 'link__go') + '</a></li>'; }).join('') + '</ul>' +
      '</div></div></section>';
    html += '</main>';

    html += '<footer class="ft"><div class="wrap ft__in"><span>' + H.esc(B.name) + ', ' + H.esc(B.city) + '</span><span class="ft__r">Демо-прототип записи · <a href="#/owner">Кабинет владельца</a></span></div></footer>';
    return html;
  }
};

/* ===== Ядро прототипа: данные, запись в 3 шага, кабинет, роутинг ===== */
(function () {
  'use strict';

  var B = window.BUSINESS;
  var P = window.PROTO;

  /* ---------- утилиты ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ESC[c]; }); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function ic(name, cls) { return '<i data-lucide="' + name + '"' + (cls ? ' class="' + cls + '"' : '') + ' aria-hidden="true"></i>'; }
  function refreshIcons() { try { if (window.lucide) window.lucide.createIcons(); } catch (e) { /* иконки необязательны */ } }
  function hash(str) { var h = 2166136261; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  var reduced = function () { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; };

  var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var DAY_SHORT = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  var DAY_FULL = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
  var MONTH_GEN = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  var MONTH_SHORT = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  var WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

  function startOfDay(d) { var x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function fromIso(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function sameDay(a, b) { return iso(a) === iso(b); }
  function parseT(s) { var p = s.split(':'); return (+p[0]) * 60 + (+p[1]); }
  function fmtT(m) { if (m >= 1440) return '24:00'; return pad(Math.floor(m / 60)) + ':' + pad(m % 60); }
  function dayLabel(d) {
    var t = startOfDay(new Date());
    if (sameDay(d, t)) return 'Сегодня';
    if (sameDay(d, addDays(t, 1))) return 'Завтра';
    return DAY_SHORT[d.getDay()];
  }
  function longDate(d) { return DAY_SHORT[d.getDay()] + ', ' + d.getDate() + ' ' + MONTH_GEN[d.getMonth()]; }

  /* ---------- хранилище ---------- */
  function LS(k) { return 'proto:' + B.slug + ':design-taste:' + k; }
  function load(k, def) { try { var v = localStorage.getItem(LS(k)); return v ? JSON.parse(v) : def; } catch (e) { return def; } }
  function save(k, v) { try { localStorage.setItem(LS(k), JSON.stringify(v)); } catch (e) { /* без хранилища работаем в памяти */ } }
  var mem = {};

  /* ---------- услуги и график ---------- */
  function services() {
    var s = load('services', null);
    if (s && s.length) return s;
    return B.services.map(function (x, i) { var c = {}; for (var k in x) c[k] = x[k]; c.id = String(i); return c; });
  }
  function serviceById(id) { return services().filter(function (s) { return String(s.id) === String(id); })[0]; }
  function groups() {
    var out = [], idx = {};
    services().forEach(function (s) {
      var c = s.category || 'Услуги';
      if (idx[c] == null) { idx[c] = out.length; out.push({ name: c, items: [] }); }
      out[idx[c]].items.push(s);
    });
    return out;
  }
  function num(n) { return (Math.round(n * 100) / 100).toLocaleString('ru-RU', { maximumFractionDigits: 2 }); }
  function priceText(s) {
    if (s.price == null) return s.priceNote ? 'по тарифу' : 'по запросу';
    var unit = s.priceUnit ? '\u00a0' + s.priceUnit : '\u00a0₽';
    return (s.priceFrom ? 'от\u00a0' : '') + num(s.price) + unit;
  }
  function durText(m) {
    if (!m) return '';
    var h = Math.floor(m / 60), r = m % 60;
    if (h && r) return h + '\u00a0ч\u00a0' + r + '\u00a0мин';
    if (h) return h + '\u00a0ч';
    return m + '\u00a0мин';
  }
  function perMinute(s) { return s.priceUnit && s.priceUnit.indexOf('/мин') > -1; }

  function defaultSchedule() {
    return DAYS.map(function (d) {
      var e = B.schedule && B.schedule[d];
      var w = e && e.working_hours && e.working_hours[0];
      return w ? { open: true, from: parseT(w.from), to: parseT(w.to) } : { open: false, from: 600, to: 1140 };
    });
  }
  function schedule() { return load('schedule', null) || defaultSchedule(); }

  function hoursLines() {
    var sc = schedule(), rows = [], last = null;
    WEEK_ORDER.forEach(function (di) {
      var d = sc[di], key = d.open ? d.from + '-' + d.to : 'x';
      if (last && last.key === key) { last.end = di; } else { last = { key: key, start: di, end: di, d: d }; rows.push(last); }
    });
    var all24 = rows.length === 1 && rows[0].d.open && rows[0].d.from === 0 && rows[0].d.to >= 1440;
    if (all24) return [{ days: 'Каждый день', hours: 'Круглосуточно' }];
    if (rows.length === 1 && rows[0].d.open) return [{ days: 'Каждый день', hours: fmtT(rows[0].d.from) + '\u2013' + fmtT(rows[0].d.to) }];
    return rows.map(function (r) {
      var days = r.start === r.end ? DAY_SHORT[r.start] : DAY_SHORT[r.start] + '\u2013' + DAY_SHORT[r.end];
      return { days: days, hours: r.d.open ? fmtT(r.d.from) + '\u2013' + fmtT(r.d.to) : 'выходной' };
    });
  }
  function hoursShort() { return hoursLines().map(function (x) { return x.days + ' ' + x.hours; }).join(', '); }
  function openNow() {
    var n = new Date(), sc = schedule(), m = n.getHours() * 60 + n.getMinutes(), d = sc[n.getDay()];
    if (d.open && m >= d.from && m < d.to) {
      return { open: true, text: (d.from === 0 && d.to >= 1440) ? 'Открыто круглосуточно' : 'Открыто до ' + fmtT(d.to) };
    }
    if (d.open && m < d.from) return { open: false, text: 'Откроется сегодня в ' + fmtT(d.from) };
    for (var i = 1; i <= 7; i++) {
      var di = (n.getDay() + i) % 7;
      if (sc[di].open) return { open: false, text: (i === 1 ? 'Откроется завтра в ' : 'Откроется в ' + DAY_FULL[di] + ' в ') + fmtT(sc[di].from) };
    }
    return { open: false, text: 'Сейчас закрыто' };
  }

  /* ---------- контакты ---------- */
  function phoneFmt(p) {
    var d = String(p).replace(/\D/g, '');
    if (d.length === 11) return '+7 (' + d.slice(1, 4) + ') ' + d.slice(4, 7) + '-' + d.slice(7, 9) + '-' + d.slice(9, 11);
    return p;
  }
  function mainPhone() { return B.contacts && B.contacts.phones && B.contacts.phones[0]; }
  function routeUrl() { return 'https://yandex.ru/maps/?rtext=~' + B.point.lat + ',' + B.point.lon + '&rtt=auto'; }
  function contactLinks() {
    var c = B.contacts || {}, out = [];
    (c.phones || []).forEach(function (p) { out.push({ id: 'phone', icon: 'phone', label: phoneFmt(p), href: 'tel:' + p, note: 'Позвонить' }); });
    if (c.whatsapp) out.push({ id: 'whatsapp', icon: 'message-circle', label: 'WhatsApp', href: c.whatsapp, note: 'Написать', ext: true });
    if (c.telegram) out.push({ id: 'telegram', icon: 'send', label: 'Telegram', href: c.telegram, note: 'Написать', ext: true });
    if (c.max) out.push({ id: 'max', icon: 'message-square', label: 'MAX', href: c.max, note: 'Написать', ext: true });
    if (c.vk) out.push({ id: 'vk', icon: 'users', label: 'ВКонтакте', href: c.vk, note: 'Страница', ext: true });
    if (c.website) out.push({ id: 'website', icon: 'globe', label: 'Сайт', href: c.website, note: c.website.replace(/^https?:\/\//, '').replace(/\/$/, ''), ext: true });
    if (c.email) out.push({ id: 'email', icon: 'mail', label: c.email, href: 'mailto:' + c.email, note: 'Почта' });
    return out;
  }

  /* ---------- фото ---------- */
  var KIND = { facade: 'Фасад', work: 'Работа', interior: 'Интерьер', team: 'Мастера', result: 'Результат', pet: 'Питомец' };
  function photos() {
    return (B.photos || []).map(function (p) {
      return { src: '../../../tenants/' + B.slug + '/' + p.file, kind: p.kind, alt: B.name + ', ' + (KIND[p.kind] || 'фото').toLowerCase() };
    });
  }
  function ratingText() { return Number(B.rating).toFixed(1).replace('.', ','); }
  function plural(n, a, b, c) { var m = n % 10, k = n % 100; if (k > 10 && k < 20) return c; if (m === 1) return a; if (m > 1 && m < 5) return b; return c; }
  function reviewsWord() { return B.reviewsCount + '\u00a0' + plural(B.reviewsCount, 'отзыв', 'отзыва', 'отзывов'); }

  var H = {
    B: B, esc: esc, ic: ic, num: num, services: services, groups: groups, priceText: priceText, durText: durText, perMinute: perMinute,
    hoursLines: hoursLines, hoursShort: hoursShort, openNow: openNow, phoneFmt: phoneFmt, mainPhone: mainPhone, routeUrl: routeUrl,
    contactLinks: contactLinks, photos: photos, ratingText: ratingText, reviewsWord: reviewsWord, plural: plural
  };

  /* ---------- слоты ---------- */
  function slotsFor(date, dur) {
    var d = schedule()[date.getDay()];
    if (!d.open) return [];
    var now = new Date(), isToday = sameDay(date, now), nowMin = now.getHours() * 60 + now.getMinutes();
    var out = [], key = iso(date);
    for (var t = d.from; t + dur <= d.to; t += 30) {
      if (isToday && t < nowMin + 30) continue;
      out.push({ t: t, busy: hash(B.slug + key + t) % 100 < 36 });
    }
    return out;
  }
  function part(t) { return t < 360 ? 'Ночь' : t < 720 ? 'Утро' : t < 1080 ? 'День' : 'Вечер'; }

  /* ---------- состояние записи ---------- */
  function freshState() { return { open: false, manual: false, step: 1, ids: [], date: null, time: null, form: { name: '', phone: '', car: '', consent: false }, errors: {}, done: null, canceled: false }; }
  var S = freshState();

  function selServices() { return services().filter(function (s) { return S.ids.indexOf(String(s.id)) > -1; }); }
  function isLong() { return selServices().some(function (s) { return s.long; }); }
  function totalDur() { return selServices().reduce(function (a, s) { return a + (s.durationMin || 30); }, 0); }
  function slotDuration() { return totalDur() || 30; }
  function stepsList() { return isLong() ? [1, 3] : [1, 2, 3]; }
  function estimate() {
    var sum = 0, any = false;
    selServices().forEach(function (s) {
      if (s.price == null) return;
      any = true;
      sum += perMinute(s) ? s.price * (s.durationMin || 5) : s.price;
    });
    return any ? sum : null;
  }
  function priceLine() {
    var sel = selServices();
    if (!sel.length) return '';
    if (sel.length === 1) return priceText(sel[0]);
    var e = estimate();
    return e == null ? 'по запросу' : '\u2248\u00a0' + num(Math.round(e)) + '\u00a0₽';
  }

  var bookEl, lastFocus = null;

  function openBook(params) {
    if (S.open) return;
    S = freshState();
    S.open = true;
    S.manual = params.get('manual') === '1';
    var pre = params.get('s');
    if (pre != null && serviceById(pre)) { S.ids = [String(pre)]; S.step = stepsList()[1]; }
    lastFocus = document.activeElement;
    bookEl.classList.add('is-open');
    document.body.classList.add('is-locked');
    setInert(true);
    renderBook();
    void bookEl.offsetWidth; bookEl.classList.add('is-in');
    setTimeout(function () { var f = $('.book__title', bookEl); if (f) f.focus(); }, 60);
  }
  function closeBook() {
    if (!S.open) return;
    S.open = false;
    bookEl.classList.remove('is-in');
    if (!OW.open) document.body.classList.remove('is-locked');
    setInert(false);
    var done = function () { if (!S.open) bookEl.classList.remove('is-open'); };
    if (reduced()) done(); else setTimeout(done, 260);
    if (lastFocus && lastFocus.focus && document.contains(lastFocus)) { try { lastFocus.focus({ preventScroll: true }); } catch (e) { /* ничего */ } }
  }
  function setInert(on) {
    ['view-home', 'view-owner', 'mobbar', 'demobar'].forEach(function (id) {
      var el = document.getElementById(id); if (!el) return;
      if (on) el.setAttribute('inert', ''); else el.removeAttribute('inert');
    });
  }
  function goBackFromBook() { location.hash = S.manual ? '#/owner' : '#/'; }

  /* ----- рендер записи ----- */
  function stepNo() { return stepsList().indexOf(S.step) + 1; }
  function stepTitle() {
    if (S.done) return S.canceled ? 'Запись отменена' : (S.manual ? 'Запись добавлена' : (S.done.long ? 'Заявка принята' : 'Вы записаны'));
    return S.step === 1 ? 'Что нужно сделать' : S.step === 2 ? 'Когда удобно' : 'Ваши данные';
  }
  function renderBook() {
    var el = $('.book__sheet', bookEl), list = stepsList(), first = S.done || S.step === list[0];
    var head = '<header class="book__head">' +
      '<button class="icon-btn" type="button" data-act="book-back" aria-label="' + (first ? 'Закрыть' : 'Назад') + '">' + ic(first ? 'x' : 'arrow-left') + '</button>' +
      '<div class="book__headtext"><h2 class="book__title" tabindex="-1">' + esc(stepTitle()) + '</h2>' +
      (S.done ? '' : '<p class="book__step">Шаг ' + stepNo() + ' из ' + list.length + (S.manual ? ' · вручную' : '') + '</p>') + '</div>' +
      (S.done ? '' : '<button class="icon-btn book__x" type="button" data-act="book-close" aria-label="Закрыть">' + ic('x') + '</button>') +
      '</header>' +
      (S.done ? '' : '<div class="progress" aria-hidden="true">' + list.map(function (n, i) { return '<span class="' + (i < stepNo() ? 'is-on' : '') + '"></span>'; }).join('') + '</div>');
    var body = S.done ? successHTML() : S.step === 1 ? step1HTML() : S.step === 2 ? step2HTML() : step3HTML();
    el.innerHTML = head + '<div class="book__scroll"><div class="book__body">' + body + '</div>' + (S.done ? '' : '<aside class="sum" aria-label="Ваш выбор">' + summaryHTML() + '</aside>') + '</div>' + (S.done ? '' : footHTML());
    refreshIcons();
    if (S.step === 3 && !S.done) bindForm();
  }

  function step1HTML() {
    var type = P.multi ? 'checkbox' : 'radio';
    var html = P.multi ? '<p class="hint">Можно выбрать несколько: время на посту сложится из выбранного.</p>' : '';
    groups().forEach(function (g) {
      html += '<fieldset class="optgroup"><legend>' + esc(g.name) + '</legend>';
      g.items.forEach(function (s) {
        var on = S.ids.indexOf(String(s.id)) > -1;
        html += '<label class="opt' + (on ? ' is-on' : '') + '"><input type="' + type + '" name="svc" value="' + esc(s.id) + '"' + (on ? ' checked' : '') + '>' +
          '<span class="opt__mark" aria-hidden="true">' + ic('check') + '</span>' +
          '<span class="opt__main"><span class="opt__name">' + esc(s.name) + '</span>' +
          '<span class="opt__meta">' + (s.long ? 'Заявка, мастер перезвонит' : (s.durationMin ? (s.durationStub ? '~' : '') + durText(s.durationMin) : '')) + '</span></span>' +
          '<span class="opt__price">' + priceText(s) + '</span></label>';
      });
      html += '</fieldset>';
    });
    return html;
  }

  function step2HTML() {
    var dur = slotDuration(), today = startOfDay(new Date()), days = [];
    for (var i = 0; i < 7; i++) days.push(addDays(today, i));
    if (!S.date || !days.some(function (d) { return iso(d) === S.date; })) {
      var first = days.filter(function (d) { return slotsFor(d, dur).some(function (s) { return !s.busy; }); })[0] || days[0];
      S.date = iso(first); S.time = null;
    }
    var html = '<div class="days" role="group" aria-label="День">';
    days.forEach(function (d) {
      var sl = slotsFor(d, dur), free = sl.filter(function (s) { return !s.busy; }).length, on = iso(d) === S.date;
      var closed = !schedule()[d.getDay()].open;
      html += '<button type="button" class="day' + (on ? ' is-on' : '') + '" data-act="pick-date" data-date="' + iso(d) + '" aria-pressed="' + on + '"' + (free === 0 ? ' disabled' : '') + '>' +
        '<span class="day__w">' + dayLabel(d) + '</span><span class="day__n">' + d.getDate() + '</span><span class="day__m">' + (closed ? 'выходной' : free ? MONTH_SHORT[d.getMonth()] : 'нет мест') + '</span></button>';
    });
    html += '</div>';
    var slots = slotsFor(fromIso(S.date), dur);
    html += '<p class="hint">' + (dur >= 60 ? 'Нужно ' + (totalDur() ? '~' : '') + durText(dur) + '. ' : '') + 'Занятые слоты зачёркнуты (демо-данные).</p>';
    if (!slots.length) {
      html += '<p class="empty">На этот день записи нет.</p>';
    } else if (slots.length > 20) {
      var by = {}, order = [];
      slots.forEach(function (s) { var p = part(s.t); if (!by[p]) { by[p] = []; order.push(p); } by[p].push(s); });
      order.forEach(function (p) { html += '<h3 class="slotpart">' + p + '</h3><div class="slots">' + by[p].map(slotBtn).join('') + '</div>'; });
    } else {
      html += '<div class="slots">' + slots.map(slotBtn).join('') + '</div>';
    }
    return html;
  }
  function slotBtn(s) {
    var on = S.time === s.t;
    return '<button type="button" class="slot' + (on ? ' is-on' : '') + (s.busy ? ' is-busy' : '') + '" data-act="pick-time" data-t="' + s.t + '"' + (s.busy ? ' disabled aria-label="' + fmtT(s.t) + ', занято"' : ' aria-pressed="' + on + '"') + '>' + fmtT(s.t) + '</button>';
  }

  function step3HTML() {
    var f = S.form, long = isLong();
    var html = '<form id="bookform" novalidate autocomplete="on">';
    html += field('name', 'Имя', '<input id="f-name" name="name" type="text" autocomplete="name" value="' + esc(f.name) + '" placeholder="Как к вам обращаться" aria-describedby="e-name" required>');
    html += field('phone', 'Телефон', '<input id="f-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" value="' + esc(f.phone) + '" placeholder="+7 (___) ___-__-__" aria-describedby="e-phone" required>');
    if (P.car) html += field('car', (P.carLabel || 'Марка и модель') + (P.car === 'optional' ? ' (по желанию)' : ''), '<input id="f-car" name="car" type="text" autocomplete="off" value="' + esc(f.car) + '" placeholder="' + esc(P.carPlaceholder || 'Например, Kia Rio') + '" aria-describedby="e-car"' + (P.car === 'required' ? ' required' : '') + '>');
    if (!S.manual) {
      html += '<div class="check' + (S.errors.consent ? ' has-error' : '') + '"><label class="check__row"><input id="f-consent" type="checkbox" name="consent"' + (f.consent ? ' checked' : '') + ' aria-describedby="e-consent"><span class="check__box" aria-hidden="true">' + ic('check') + '</span>' +
        '<span class="check__text">Согласен на обработку персональных данных и принимаю <a href="#" data-act="policy">политику конфиденциальности</a></span></label>' +
        '<p class="err" id="e-consent" role="alert">' + esc(S.errors.consent || '') + '</p></div>';
    }
    html += '<p class="hint hint--after">' + (long ? 'Мастер перезвонит по этому номеру и согласует день.' : S.manual ? 'Запись появится в списке в кабинете.' : 'Позвоним, если что-то изменится.') + '</p></form>';
    return html;
  }
  function field(id, label, input) {
    var err = S.errors[id];
    return '<div class="field' + (err ? ' has-error' : '') + '"><label for="f-' + id + '">' + esc(label) + '</label>' + input + '<p class="err" id="e-' + id + '" role="alert">' + esc(err || '') + '</p></div>';
  }

  function summaryHTML() {
    var sel = selServices(), rows = '';
    if (!sel.length) return '<p class="sum__empty">Пока ничего не выбрано</p>';
    rows += '<dl class="sum__list">';
    rows += '<div><dt>Услуга</dt><dd>' + sel.map(function (s) { return esc(s.name); }).join(', ') + '</dd></div>';
    if (isLong()) rows += '<div><dt>Время</dt><dd>мастер перезвонит</dd></div>';
    else if (S.date && S.step > 1 && S.time != null) rows += '<div><dt>Когда</dt><dd>' + longDate(fromIso(S.date)) + ', ' + fmtT(S.time) + '</dd></div>';
    else if (S.step > 1) rows += '<div><dt>Когда</dt><dd>выберите время</dd></div>';
    var pl = priceLine();
    if (pl) rows += '<div><dt>' + (sel.length > 1 && estimate() != null ? 'Примерно' : 'Цена') + '</dt><dd>' + pl + '</dd></div>';
    return rows + '</dl>';
  }

  function footHTML() {
    var list = stepsList(), last = S.step === list[list.length - 1], ok = canNext();
    var label = last ? (isLong() ? 'Оставить заявку' : S.manual ? 'Добавить запись' : 'Записаться') : 'Далее';
    var btn = last
      ? '<button class="btn btn--primary" type="submit" form="bookform">' + label + '</button>'
      : '<button class="btn btn--primary" type="button" data-act="book-next"' + (ok ? '' : ' disabled') + '>' + label + ic('arrow-right') + '</button>';
    return '<footer class="book__foot">' + (S.step === list[0] ? '' : '<button class="btn btn--ghost" type="button" data-act="book-prev">Назад</button>') + btn + '</footer>';
  }
  function canNext() {
    if (S.step === 1) return S.ids.length > 0;
    if (S.step === 2) return S.time != null;
    return true;
  }
  function updateFoot() {
    var f = $('.book__foot', bookEl); if (!f) return;
    var tmp = document.createElement('div'); tmp.innerHTML = footHTML();
    f.replaceWith(tmp.firstChild);
    refreshIcons();
    var sum = $('.sum', bookEl); if (sum) sum.innerHTML = summaryHTML();
  }

  /* ----- форма ----- */
  function maskPhone(v) {
    var d = v.replace(/\D/g, '');
    if (!d.length) return '';
    if (d[0] === '8' || d[0] === '7') d = d.slice(1);
    d = d.slice(0, 10);
    var r = '+7';
    if (d.length) r += ' (' + d.slice(0, 3);
    if (d.length >= 3) r += ')';
    if (d.length > 3) r += ' ' + d.slice(3, 6);
    if (d.length > 6) r += '-' + d.slice(6, 8);
    if (d.length > 8) r += '-' + d.slice(8, 10);
    return r;
  }
  function bindForm() {
    var form = $('#bookform'), name = $('#f-name'), phone = $('#f-phone'), car = $('#f-car'), consent = $('#f-consent');
    name.addEventListener('input', function () { S.form.name = name.value; });
    name.addEventListener('blur', function () { if (name.value) checkField('name'); });
    phone.addEventListener('input', function () { phone.value = maskPhone(phone.value); S.form.phone = phone.value; });
    phone.addEventListener('keydown', function (e) { if (e.key === 'Backspace' && phone.value === '+7') { phone.value = ''; S.form.phone = ''; e.preventDefault(); } });
    phone.addEventListener('blur', function () { if (phone.value) checkField('phone'); });
    if (car) { car.addEventListener('input', function () { S.form.car = car.value; }); car.addEventListener('blur', function () { if (car.value) checkField('car'); }); }
    if (consent) consent.addEventListener('change', function () { S.form.consent = consent.checked; if (consent.checked) setErr('consent', ''); });
    form.addEventListener('submit', function (e) { e.preventDefault(); submitBooking(); });
  }
  function errFor(id) {
    var f = S.form;
    if (id === 'name') return f.name.trim().length < 2 ? 'Напишите имя, хотя бы два символа' : '';
    if (id === 'phone') return f.phone.replace(/\D/g, '').length < 11 ? 'Введите номер полностью: +7 и ещё 10 цифр' : '';
    if (id === 'car') return (P.car === 'required' && f.car.trim().length < 2) ? 'Укажите марку и модель, чтобы мастер подготовился' : '';
    if (id === 'consent') return (!S.manual && !f.consent) ? 'Без согласия записать не получится' : '';
    return '';
  }
  function setErr(id, msg) {
    S.errors[id] = msg;
    var p = $('#e-' + id); if (p) p.textContent = msg;
    var w = id === 'consent' ? $('.check', bookEl) : (p && p.closest('.field'));
    if (w) w.classList.toggle('has-error', !!msg);
    var inp = $('#f-' + id); if (inp) { if (msg) inp.setAttribute('aria-invalid', 'true'); else inp.removeAttribute('aria-invalid'); }
  }
  function checkField(id) { var m = errFor(id); setErr(id, m); return !m; }

  function submitBooking() {
    var ids = ['name', 'phone'].concat(P.car ? ['car'] : []).concat(S.manual ? [] : ['consent']), firstBad = null;
    ids.forEach(function (id) { if (!checkField(id) && !firstBad) firstBad = id; });
    if (firstBad) { var el = $('#f-' + firstBad); if (el) el.focus(); return; }
    var sel = selServices(), long = isLong();
    var rec = {
      id: 'b' + Date.now(), svcIds: S.ids.slice(), svcNames: sel.map(function (s) { return s.name; }),
      date: long ? S.date || iso(startOfDay(new Date())) : S.date, time: long ? null : S.time, dur: long ? 0 : totalDur(), long: long,
      name: S.form.name.trim(), phone: S.form.phone, car: S.form.car.trim(),
      price: priceLine(), source: S.manual ? 'вручную' : 'с сайта', status: 'wait'
    };
    var all = load('bookings', []); all.push(rec); save('bookings', all);
    S.done = rec;
    renderBook();
    var t = $('.book__title', bookEl); if (t) t.focus();
  }

  function successHTML() {
    var r = S.done, d = (!r.long && r.date) ? fromIso(r.date) : null;
    if (S.canceled) {
      return '<div class="done"><span class="done__icon done__icon--off">' + ic('x') + '</span><p class="done__lead">Запись отмечена как отменённая.</p></div>' +
        '<div class="done__actions"><button class="btn btn--primary" type="button" data-act="book-restart">Записаться снова</button><button class="btn btn--ghost" type="button" data-act="book-close">' + (S.manual ? 'К записям' : 'На главную') + '</button></div>';
    }
    var lead = r.long ? 'Мастер перезвонит по номеру ' + esc(r.phone) + ' и согласует день.' : S.manual ? 'Запись видна в списке «Записи».' : 'Ждём вас. Если планы изменятся, отмените запись здесь или позвоните нам.';
    var html = '<div class="done"><span class="done__icon">' + ic('check') + '</span><p class="done__lead">' + lead + '</p></div>';
    html += '<dl class="ticket">' +
      '<div><dt>Услуга</dt><dd>' + r.svcNames.map(esc).join('<br>') + '</dd></div>' +
      (d ? '<div><dt>Когда</dt><dd>' + longDate(d) + ', ' + fmtT(r.time) + '</dd></div>' : '<div><dt>Когда</dt><dd>Согласуем по телефону</dd></div>') +
      '<div><dt>Где</dt><dd>' + esc(B.name) + ', ' + esc(B.address) + ', ' + esc(B.city) + '</dd></div>' +
      '<div><dt>Клиент</dt><dd>' + esc(r.name) + ', ' + esc(r.phone) + (r.car ? '<br>' + esc(r.car) : '') + '</dd></div></dl>';
    html += '<div class="done__actions">' +
      (d ? '<button class="btn btn--primary" type="button" data-act="ics">' + ic('calendar-plus') + 'Добавить в календарь</button>' : '') +
      '<a class="btn btn--ghost" href="' + routeUrl() + '" target="_blank" rel="noopener">' + ic('navigation') + 'Построить маршрут</a>' +
      '<button class="btn btn--ghost" type="button" data-act="book-close">' + (S.manual ? 'К записям' : 'На главную') + '</button>' +
      '<div class="cancel" id="cancelbox"><button class="link-btn" type="button" data-act="cancel-ask">Отменить запись</button></div></div>';
    return html;
  }

  function icsFor(r) {
    var d = fromIso(r.date), start = r.time, end = r.time + (r.dur || 60);
    function dt(mins) { var x = new Date(d); x.setHours(0, mins, 0, 0); return x.getFullYear() + pad(x.getMonth() + 1) + pad(x.getDate()) + 'T' + pad(x.getHours()) + pad(x.getMinutes()) + '00'; }
    function t(s) { return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n'); }
    return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//' + B.slug + '//prototype//RU', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
      'UID:' + r.id + '@' + B.slug, 'DTSTAMP:' + dt(0), 'DTSTART:' + dt(start), 'DTEND:' + dt(end),
      'SUMMARY:' + t(B.name + ': ' + r.svcNames.join(', ')), 'LOCATION:' + t(B.address + ', ' + B.city),
      'DESCRIPTION:' + t('Запись в ' + B.name + (mainPhone() ? '. Телефон: ' + mainPhone() : '')),
      'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Запись', 'TRIGGER:-PT1H', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  }
  function downloadIcs(r) {
    var blob = new Blob([icsFor(r)], { type: 'text/calendar;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = B.slug + '-zapis.ics';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1500);
    toast('Файл календаря скачан');
  }

  /* ---------- toast ---------- */
  var toastTimer;
  function toast(msg) {
    var t = $('#toast'); if (!t) return;
    t.textContent = msg; t.classList.add('is-on');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove('is-on'); }, 2800);
  }

  /* ---------- кабинет владельца ---------- */
  var NAMES = ['Алексей', 'Мария', 'Дмитрий', 'Ольга', 'Сергей', 'Анна', 'Игорь', 'Екатерина', 'Максим', 'Наталья', 'Роман', 'Юлия'];
  var CARS = ['Kia Rio', 'Lada Vesta', 'Toyota Camry', 'Hyundai Solaris', 'Geely Coolray', 'Haval Jolion', 'Chery Tiggo 7', 'Skoda Octavia'];
  var STATUS = { wait: 'Ожидается', came: 'Пришёл', no: 'Не пришёл', done: 'Выполнено', cancel: 'Отменено' };

  function mockBookings() {
    var out = [], svcs = services(), sc = schedule(), today = startOfDay(new Date());
    var now = new Date(), nowMin = now.getHours() * 60 + now.getMinutes();
    for (var off = 0; off < 7; off++) {
      var d = addDays(today, off), w = sc[d.getDay()];
      if (!w.open) continue;
      var key = iso(d), n = 3 + hash(B.slug + key) % 3, used = {}, from = w.from, to = w.to;
      if (to - from > 900) { from = 480; to = 1200; }
      for (var i = 0; i < n; i++) {
        var h = hash(B.slug + key + 'b' + i), s = svcs[h % svcs.length];
        if (!s) continue;
        var dur = s.durationMin || 30, t = null;
        if (!s.long) {
          var cells = Math.max(1, Math.floor((to - from - dur) / 30) + 1), c = h % cells, tries = 0;
          while (used[c] && tries < cells) { c = (c + 1) % cells; tries++; }
          if (used[c]) continue;
          for (var k = 0; k < Math.ceil(dur / 30); k++) used[c + k] = true;
          t = from + c * 30;
        }
        var status = 'wait';
        if (off === 0 && t != null) {
          if (t + dur < nowMin) status = (h % 5 === 0) ? 'no' : 'done';
          else if (t <= nowMin) status = 'came';
        }
        out.push({ id: 'm' + key + i, svcIds: [String(s.id)], svcNames: [s.name], date: key, time: t, dur: s.long ? 0 : dur, long: !!s.long,
          name: NAMES[(h >> 3) % NAMES.length], phone: '+7 (900) 000-00-' + pad(10 + h % 80), car: P.car ? CARS[(h >> 5) % CARS.length] : '', price: priceText(s), source: 'демо', status: status });
      }
    }
    return out;
  }
  function allBookings() {
    var st = load('status', {});
    return mockBookings().concat(load('bookings', [])).map(function (b) { b.status = st[b.id] || b.status; return b; });
  }
  function sortBk(a, b) {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    if (a.time == null) return 1;
    if (b.time == null) return -1;
    return a.time - b.time;
  }
  function setStatus(id, status) { var st = load('status', {}); st[id] = status; save('status', st); }

  var OW = { tab: 'list', range: 'today', open: null };
  var svcDraft = null, schDraft = null;
  function authed() { try { return sessionStorage.getItem('owner:' + B.slug) === '1'; } catch (e) { return !!mem.auth; } }
  function setAuth(v) { try { sessionStorage.setItem('owner:' + B.slug, v ? '1' : '0'); } catch (e) { mem.auth = v; } }

  function renderOwner() {
    var root = $('#view-owner');
    root.innerHTML = authed() ? ownerHTML() : loginHTML();
    refreshIcons();
    if (authed()) bindOwner(root); else bindLogin(root);
  }
  function ownerHead() {
    return '<header class="ow-head"><a class="ow-back" href="#/" aria-label="На сайт">' + ic('arrow-left') + '<span>На сайт</span></a>' +
      '<div class="ow-brand"><strong>' + esc(B.name) + '</strong><span>Кабинет владельца</span></div>' +
      (authed() ? '<button class="icon-btn" type="button" data-act="logout" aria-label="Выйти">' + ic('log-out') + '</button>' : '<span class="ow-head__sp"></span>') + '</header>';
  }
  function loginHTML() {
    return ownerHead() + '<div class="ow-login"><div class="ow-login__panel"><h1>Вход в кабинет</h1>' +
      '<p class="hint">Демо-доступ: подойдут любые почта и пароль.</p>' +
      '<form id="loginform" novalidate>' +
      '<div class="field"><label for="l-mail">Почта</label><input id="l-mail" type="email" autocomplete="username" placeholder="owner@example.ru" aria-describedby="e-l-mail"><p class="err" id="e-l-mail" role="alert"></p></div>' +
      '<div class="field"><label for="l-pass">Пароль</label><input id="l-pass" type="password" autocomplete="current-password" placeholder="Любой пароль" aria-describedby="e-l-pass"><p class="err" id="e-l-pass" role="alert"></p></div>' +
      '<button class="btn btn--primary btn--wide" type="submit">Войти</button></form></div></div>';
  }
  function bindLogin(root) {
    $('#loginform', root).addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      [['mail', $('#l-mail', root), 'Введите почту'], ['pass', $('#l-pass', root), 'Введите пароль']].forEach(function (x) {
        var msg = x[1].value.trim() ? '' : x[2];
        $('#e-l-' + x[0], root).textContent = msg;
        x[1].closest('.field').classList.toggle('has-error', !!msg);
        if (msg && ok) { x[1].focus(); ok = false; }
      });
      if (ok) { setAuth(true); OW.tab = 'list'; renderOwner(); toast('Вы вошли в демо-кабинет'); }
    });
  }

  function ownerHTML() {
    var tabs = [['list', 'Записи', 'calendar-days'], ['services', 'Услуги и цены', 'tag'], ['hours', 'График', 'clock']];
    var html = ownerHead() + '<div class="ow-wrap"><nav class="tabs" role="tablist" aria-label="Разделы кабинета">' +
      tabs.map(function (t) { return '<button class="tab' + (OW.tab === t[0] ? ' is-on' : '') + '" role="tab" type="button" aria-selected="' + (OW.tab === t[0]) + '" data-act="ow-tab" data-tab="' + t[0] + '">' + ic(t[2]) + '<span>' + t[1] + '</span></button>'; }).join('') + '</nav>';
    html += '<section class="ow-panel" role="tabpanel">' + (OW.tab === 'list' ? listHTML() : OW.tab === 'services' ? svcEditHTML() : hoursEditHTML()) + '</section></div>';
    return html + '<div class="bk-sheet" id="bksheet" hidden></div>';
  }

  function listHTML() {
    var all = allBookings().sort(sortBk), today = iso(startOfDay(new Date()));
    var rows = OW.range === 'today' ? all.filter(function (b) { return b.date === today; }) : all;
    var act = all.filter(function (b) { return b.date === today && b.status !== 'cancel'; });
    var left = act.filter(function (b) { return b.status === 'wait' || b.status === 'came'; }).length;
    var html = '<div class="ow-top"><div class="ow-stat"><span class="ow-stat__n">' + act.length + '</span><span class="ow-stat__l">' + plural(act.length, 'запись', 'записи', 'записей') + ' сегодня' + (left ? ', ещё ждём ' + left : '') + '</span></div>' +
      '<button class="btn btn--primary" type="button" data-act="ow-new">' + ic('plus') + 'Записать вручную</button></div>';
    html += '<div class="seg" role="group" aria-label="Период"><button type="button" class="seg__b' + (OW.range === 'today' ? ' is-on' : '') + '" data-act="ow-range" data-range="today" aria-pressed="' + (OW.range === 'today') + '">Сегодня</button><button type="button" class="seg__b' + (OW.range === 'week' ? ' is-on' : '') + '" data-act="ow-range" data-range="week" aria-pressed="' + (OW.range === 'week') + '">Неделя</button></div>';
    if (!rows.length) return html + '<p class="empty">На этот период записей нет.</p>';
    var cur = null, open = false;
    rows.forEach(function (b) {
      if (OW.range === 'week' && b.date !== cur) {
        cur = b.date; var d = fromIso(b.date);
        if (open) html += '</ul>';
        html += '<h3 class="bk-day">' + (dayLabel(d) === 'Сегодня' || dayLabel(d) === 'Завтра' ? dayLabel(d) + ', ' : '') + longDate(d) + '</h3><ul class="bk-list">'; open = true;
      } else if (!open) { html += '<ul class="bk-list">'; open = true; }
      html += '<li><button type="button" class="bk st-' + b.status + '" data-act="ow-open" data-id="' + esc(b.id) + '">' +
        '<span class="bk__time">' + (b.time != null ? fmtT(b.time) : 'Заявка') + '</span>' +
        '<span class="bk__main"><span class="bk__svc">' + b.svcNames.map(esc).join(', ') + '</span><span class="bk__who">' + esc(b.name) + (b.car ? ', ' + esc(b.car) : '') + (b.source === 'демо' ? '' : ' · ' + esc(b.source)) + '</span></span>' +
        '<span class="pill pill--' + b.status + '">' + STATUS[b.status] + '</span></button></li>';
    });
    return html + '</ul>';
  }

  function bkSheetHTML(b) {
    var d = (b.date && !b.long) ? fromIso(b.date) : null, digits = b.phone.replace(/\D/g, '');
    var st = [['came', 'Пришёл', 'user-check'], ['no', 'Не пришёл', 'user-x'], ['done', 'Выполнено', 'check-check'], ['cancel', 'Отменить', 'ban']];
    return '<div class="bk-sheet__scrim" data-act="ow-close"></div><div class="bk-sheet__panel" role="dialog" aria-modal="true" aria-labelledby="bk-t">' +
      '<div class="bk-sheet__head"><h3 id="bk-t" tabindex="-1">' + b.svcNames.map(esc).join(', ') + '</h3><button class="icon-btn" type="button" data-act="ow-close" aria-label="Закрыть">' + ic('x') + '</button></div>' +
      '<span class="pill pill--' + b.status + '">' + STATUS[b.status] + '</span>' +
      '<dl class="ticket">' +
      '<div><dt>Когда</dt><dd>' + (d ? longDate(d) + ', ' + fmtT(b.time) + (b.dur ? ' (' + durText(b.dur) + ')' : '') : 'Заявка: согласовать по телефону') + '</dd></div>' +
      '<div><dt>Клиент</dt><dd>' + esc(b.name) + '</dd></div>' +
      '<div><dt>Телефон</dt><dd>' + esc(b.phone) + '</dd></div>' +
      (b.car ? '<div><dt>Автомобиль</dt><dd>' + esc(b.car) + '</dd></div>' : '') +
      '<div><dt>Цена</dt><dd>' + esc(b.price || 'по запросу') + '</dd></div>' +
      '<div><dt>Источник</dt><dd>' + esc(b.source) + '</dd></div></dl>' +
      '<div class="bk-sheet__contact"><a class="btn btn--primary" href="tel:+' + digits + '">' + ic('phone') + 'Позвонить</a><a class="btn btn--ghost" href="https://wa.me/' + digits + '" target="_blank" rel="noopener">' + ic('message-circle') + 'WhatsApp</a></div>' +
      '<div class="bk-sheet__status" role="group" aria-label="Статус">' + st.map(function (x) { return '<button class="btn btn--ghost btn--sm' + (b.status === x[0] ? ' is-on' : '') + '" type="button" data-act="ow-status" data-id="' + esc(b.id) + '" data-st="' + x[0] + '">' + ic(x[2]) + x[1] + '</button>'; }).join('') + '</div></div>';
  }

  function svcEditHTML() {
    var list = svcDraft || (svcDraft = services().map(function (s) { var c = {}; for (var k in s) c[k] = s[k]; return c; }));
    var unit = list.some(function (s) { return s.priceUnit; }) ? 'Цена, ₽ или ₽/мин' : 'Цена, ₽';
    var html = '<div class="ow-top"><div><h2 class="ow-h">Услуги и цены</h2><p class="hint">Пустая цена показывается как «по запросу». После сохранения изменения видны на сайте и в записи.</p></div></div><div class="ed-list">';
    list.forEach(function (s, i) {
      html += '<div class="ed" data-i="' + i + '">' +
        '<div class="field ed__name"><label for="s-n-' + i + '">Название</label><input id="s-n-' + i + '" type="text" data-k="name" value="' + esc(s.name) + '"></div>' +
        '<div class="field"><label for="s-p-' + i + '">' + unit + '</label><input id="s-p-' + i + '" type="number" min="0" step="any" inputmode="decimal" data-k="price" value="' + (s.price == null ? '' : s.price) + '" placeholder="по запросу"></div>' +
        '<div class="field"><label for="s-d-' + i + '">Длительность, мин</label><input id="s-d-' + i + '" type="number" min="5" step="5" inputmode="numeric" data-k="durationMin" value="' + (s.durationMin || '') + '"></div>' +
        '<label class="check__row ed__long"><input type="checkbox" data-k="long"' + (s.long ? ' checked' : '') + '><span class="check__box" aria-hidden="true">' + ic('check') + '</span><span class="check__text">Заявка (на день и дольше)</span></label>' +
        '<button class="icon-btn ed__del" type="button" data-act="ed-del" data-i="' + i + '" aria-label="Удалить услугу ' + esc(s.name) + '">' + ic('trash-2') + '</button></div>';
    });
    return html + '</div><div class="ed-actions"><button class="btn btn--ghost" type="button" data-act="ed-add">' + ic('plus') + 'Добавить услугу</button>' +
      '<button class="btn btn--ghost" type="button" data-act="ed-reset">Вернуть исходные</button><button class="btn btn--primary" type="button" data-act="ed-save">' + ic('save') + 'Сохранить</button></div>';
  }

  function hoursEditHTML() {
    var sc = schDraft || (schDraft = schedule().map(function (d) { return { open: d.open, from: d.from, to: d.to }; }));
    var opts = function (sel, isEnd) {
      var o = '';
      for (var m = isEnd ? 30 : 0; m <= (isEnd ? 1440 : 1410); m += 30) o += '<option value="' + m + '"' + (m === sel ? ' selected' : '') + '>' + fmtT(m) + '</option>';
      return o;
    };
    var html = '<div class="ow-top"><div><h2 class="ow-h">График работы</h2><p class="hint">От графика зависит, какие слоты видят клиенты. Занятость слотов в демо моковая.</p></div></div><div class="sch">';
    WEEK_ORDER.forEach(function (di) {
      var d = sc[di];
      html += '<div class="sch__row" data-d="' + di + '"><span class="sch__day">' + DAY_FULL[di].charAt(0).toUpperCase() + DAY_FULL[di].slice(1) + '</span>' +
        '<label class="switch"><input type="checkbox" data-k="open"' + (d.open ? ' checked' : '') + '><span class="switch__track" aria-hidden="true"></span><span class="switch__text">' + (d.open ? 'Работаем' : 'Выходной') + '</span></label>' +
        '<div class="sch__time"' + (d.open ? '' : ' hidden') + '><label class="sr-only" for="sf-' + di + '">Открытие</label><select id="sf-' + di + '" data-k="from">' + opts(d.from, false) + '</select><span aria-hidden="true">\u2013</span><label class="sr-only" for="st-' + di + '">Закрытие</label><select id="st-' + di + '" data-k="to">' + opts(d.to, true) + '</select></div></div>';
    });
    return html + '</div><div class="ed-actions"><button class="btn btn--ghost" type="button" data-act="sch-reset">Вернуть исходные</button><button class="btn btn--primary" type="button" data-act="sch-save">' + ic('save') + 'Сохранить</button></div>';
  }

  function bindOwner(root) {
    $$('.ed', root).forEach(function (row) {
      row.addEventListener('input', function (e) {
        var k = e.target.getAttribute('data-k'); if (!k) return;
        var s = svcDraft[+row.getAttribute('data-i')];
        if (k === 'long') s.long = e.target.checked;
        else if (k === 'price') s.price = e.target.value === '' ? null : Math.max(0, parseFloat(e.target.value) || 0);
        else if (k === 'durationMin') { s.durationMin = Math.max(0, parseInt(e.target.value, 10) || 0); s.durationStub = false; }
        else s.name = e.target.value;
      });
    });
    $$('.sch__row', root).forEach(function (row) {
      row.addEventListener('change', function (e) {
        var k = e.target.getAttribute('data-k'); if (!k) return;
        var d = schDraft[+row.getAttribute('data-d')];
        if (k === 'open') {
          d.open = e.target.checked;
          $('.sch__time', row).hidden = !d.open;
          $('.switch__text', row).textContent = d.open ? 'Работаем' : 'Выходной';
        } else {
          d[k] = +e.target.value;
          if (d.to <= d.from) {
            if (k === 'from') { d.to = Math.min(1440, d.from + 30); $('[data-k="to"]', row).value = d.to; }
            else { d.from = Math.max(0, d.to - 30); $('[data-k="from"]', row).value = d.from; }
          }
        }
      });
    });
  }

  function openBk(id) {
    var b = allBookings().filter(function (x) { return x.id === id; })[0]; if (!b) return;
    var sh = $('#bksheet'); sh.innerHTML = bkSheetHTML(b); sh.hidden = false; OW.open = id;
    document.body.classList.add('is-locked');
    refreshIcons();
    var t = $('#bk-t', sh); if (t) t.focus();
  }
  function closeBk() {
    var sh = $('#bksheet'); OW.open = null;
    if (sh) sh.hidden = true;
    if (!S.open) document.body.classList.remove('is-locked');
  }

  /* ---------- лайтбокс ---------- */
  var LB = { i: 0, list: [] };
  function openLb(i) {
    LB.list = photos(); LB.i = i;
    $('#lightbox').hidden = false; lbRender();
    document.body.classList.add('is-locked');
    var c = $('.lb__close', $('#lightbox')); if (c) c.focus();
  }
  function lbRender() {
    var el = $('#lightbox'), p = LB.list[LB.i], hadFocus = el.contains(document.activeElement);
    el.innerHTML = '<div class="lb__scrim" data-act="lb-close"></div><figure class="lb__fig"><img src="' + esc(p.src) + '" alt="' + esc(p.alt) + '"><figcaption>' + (LB.i + 1) + ' из ' + LB.list.length + '</figcaption></figure>' +
      '<button class="icon-btn lb__close" type="button" data-act="lb-close" aria-label="Закрыть фото">' + ic('x') + '</button>' +
      '<button class="icon-btn lb__nav lb__prev" type="button" data-act="lb-prev" aria-label="Предыдущее фото">' + ic('chevron-left') + '</button>' +
      '<button class="icon-btn lb__nav lb__next" type="button" data-act="lb-next" aria-label="Следующее фото">' + ic('chevron-right') + '</button>';
    refreshIcons();
    var c = $('.lb__close', el); if (c) c.focus();
    return hadFocus;
  }
  function closeLb() {
    var el = $('#lightbox'); if (el.hidden) return;
    el.hidden = true; el.innerHTML = '';
    if (!S.open && !OW.open) document.body.classList.remove('is-locked');
  }

  /* ---------- нижняя панель ---------- */
  function renderMobbar() {
    var ph = mainPhone();
    $('#mobbar').innerHTML = '<a class="mb mb--primary" href="#/book" data-act="book">' + ic('calendar-check') + '<span>Записаться</span></a>' +
      (ph ? '<a class="mb" href="tel:' + ph + '">' + ic('phone') + '<span>Позвонить</span></a>' : '') +
      '<a class="mb" href="' + routeUrl() + '" target="_blank" rel="noopener">' + ic('navigation') + '<span>Маршрут</span></a>';
    refreshIcons();
  }

  /* ---------- главная ---------- */
  function renderHome() {
    $('#view-home').innerHTML = P.home(H);
    refreshIcons();
    if (P.bind) P.bind($('#view-home'), H);
  }

  /* ---------- события ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-act], [data-goto]');
    if (!a) { if (e.target.closest('a[href="#"]')) e.preventDefault(); return; }
    var act = a.getAttribute('data-act'), g = a.getAttribute('data-goto');
    if (g) {
      e.preventDefault();
      var t = document.getElementById(g);
      if (t) t.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
      return;
    }
    switch (act) {
      case 'book': e.preventDefault(); location.hash = '#/book' + (a.getAttribute('data-id') != null ? '?s=' + encodeURIComponent(a.getAttribute('data-id')) : ''); break;
      case 'policy': e.preventDefault(); toast('Это заглушка: в рабочей версии здесь откроется политика'); break;
      case 'book-close': e.preventDefault(); goBackFromBook(); break;
      case 'book-back': e.preventDefault(); if (S.done || S.step === stepsList()[0]) goBackFromBook(); else bookPrev(); break;
      case 'book-prev': bookPrev(); break;
      case 'book-next': bookNext(); break;
      case 'book-restart': S.done = null; S.canceled = false; S.step = 1; S.ids = []; S.time = null; renderBook(); break;
      case 'pick-date': S.date = a.getAttribute('data-date'); S.time = null; renderBook(); break;
      case 'pick-time':
        S.time = +a.getAttribute('data-t');
        $$('.slot', bookEl).forEach(function (b) { var on = +b.getAttribute('data-t') === S.time; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on); });
        updateFoot(); break;
      case 'ics': downloadIcs(S.done); break;
      case 'cancel-ask':
        $('#cancelbox').innerHTML = '<p>Отменить запись?</p><div class="cancel__btns"><button class="btn btn--ghost btn--sm" type="button" data-act="cancel-yes">Да, отменить</button><button class="btn btn--ghost btn--sm" type="button" data-act="cancel-no">Оставить</button></div>';
        var no = $('[data-act="cancel-no"]', bookEl); if (no) no.focus(); break;
      case 'cancel-no': $('#cancelbox').innerHTML = '<button class="link-btn" type="button" data-act="cancel-ask">Отменить запись</button>'; break;
      case 'cancel-yes': setStatus(S.done.id, 'cancel'); S.canceled = true; renderBook(); var tt = $('.book__title', bookEl); if (tt) tt.focus(); toast('Запись отменена'); break;
      case 'photo': openLb(+a.getAttribute('data-i')); break;
      case 'lb-close': closeLb(); break;
      case 'lb-prev': LB.i = (LB.i + LB.list.length - 1) % LB.list.length; lbRender(); break;
      case 'lb-next': LB.i = (LB.i + 1) % LB.list.length; lbRender(); break;
      case 'scroll':
        var c = $(a.getAttribute('data-target'));
        if (c) c.scrollBy({ left: (a.getAttribute('data-dir') === 'left' ? -1 : 1) * c.clientWidth * 0.85, behavior: reduced() ? 'auto' : 'smooth' });
        break;
      case 'logout': setAuth(false); renderOwner(); break;
      case 'ow-tab': OW.tab = a.getAttribute('data-tab'); svcDraft = null; schDraft = null; renderOwner(); break;
      case 'ow-range': OW.range = a.getAttribute('data-range'); renderOwner(); break;
      case 'ow-new': location.hash = '#/book?manual=1'; break;
      case 'ow-open': openBk(a.getAttribute('data-id')); break;
      case 'ow-close': closeBk(); break;
      case 'ow-status': setStatus(a.getAttribute('data-id'), a.getAttribute('data-st')); closeBk(); renderOwner(); toast('Статус: ' + STATUS[a.getAttribute('data-st')].toLowerCase()); break;
      case 'ed-add':
        svcDraft.push({ id: 'n' + Date.now(), name: 'Новая услуга', price: null, durationMin: 60, durationStub: false, long: false, category: svcDraft.length ? svcDraft[svcDraft.length - 1].category : 'Услуги', source: 'stub' });
        renderOwner();
        var rows = $$('.ed'), lastRow = rows[rows.length - 1];
        if (lastRow) { lastRow.scrollIntoView({ block: 'center' }); var inp = $('input', lastRow); if (inp) inp.select(); }
        break;
      case 'ed-del': var gone = svcDraft.splice(+a.getAttribute('data-i'), 1)[0]; renderOwner(); toast('Удалено: ' + gone.name + '. Не сохраняйте, чтобы вернуть'); break;
      case 'ed-save':
        if (svcDraft.some(function (s) { return !s.name.trim(); })) { toast('У каждой услуги должно быть название'); break; }
        if (!svcDraft.length) { toast('Оставьте хотя бы одну услугу'); break; }
        save('services', svcDraft); renderHome(); toast('Сохранено. Сайт и запись уже используют новые цены'); break;
      case 'ed-reset': try { localStorage.removeItem(LS('services')); } catch (er) { /* ничего */ } svcDraft = null; renderHome(); renderOwner(); toast('Возвращены исходные услуги'); break;
      case 'sch-save': save('schedule', schDraft); toast('График сохранён'); break;
      case 'sch-reset': try { localStorage.removeItem(LS('schedule')); } catch (er2) { /* ничего */ } schDraft = null; renderOwner(); toast('Возвращён исходный график'); break;
    }
  });
  document.addEventListener('change', function (e) {
    if (e.target.name === 'svc' && S.open) {
      var id = e.target.value;
      if (P.multi) { var ix = S.ids.indexOf(id); if (e.target.checked && ix < 0) S.ids.push(id); else if (!e.target.checked && ix > -1) S.ids.splice(ix, 1); }
      else S.ids = [id];
      S.time = null;
      $$('.opt', bookEl).forEach(function (l) { l.classList.toggle('is-on', $('input', l).checked); });
      updateFoot();
    }
  });
  document.addEventListener('keydown', function (e) {
    var lb = $('#lightbox');
    if (!lb.hidden) {
      if (e.key === 'Escape') closeLb();
      else if (e.key === 'ArrowLeft') { LB.i = (LB.i + LB.list.length - 1) % LB.list.length; lbRender(); }
      else if (e.key === 'ArrowRight') { LB.i = (LB.i + 1) % LB.list.length; lbRender(); }
      else if (e.key === 'Tab') trap(e, lb);
      return;
    }
    var bk = $('#bksheet');
    if (bk && !bk.hidden) { if (e.key === 'Escape') closeBk(); else if (e.key === 'Tab') trap(e, bk); return; }
    if (S.open) { if (e.key === 'Escape') goBackFromBook(); else if (e.key === 'Tab') trap(e, bookEl); }
  });
  function trap(e, box) {
    var f = $$('a[href], button:not([disabled]), input:not([disabled]), select, textarea', box).filter(function (x) { return x.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function bookNext() {
    if (!canNext()) return;
    var l = stepsList(), i = l.indexOf(S.step);
    if (i < l.length - 1) { S.step = l[i + 1]; renderBook(); var sc = $('.book__scroll', bookEl); if (sc) sc.scrollTop = 0; var t = $('.book__title', bookEl); if (t) t.focus(); }
  }
  function bookPrev() {
    var l = stepsList(), i = l.indexOf(S.step);
    if (i > 0) { S.step = l[i - 1]; renderBook(); var t = $('.book__title', bookEl); if (t) t.focus(); }
  }

  /* ---------- роутинг ---------- */
  var currentView = null;
  function route() {
    var raw = (location.hash || '#/').slice(1), parts = raw.split('?'), path = parts[0] || '/', params = new URLSearchParams(parts[1] || '');
    var isBook = path === '/book', manual = isBook && params.get('manual') === '1';
    var view = (path === '/owner' || manual) ? 'owner' : 'home';
    closeLb();
    if (OW.open) closeBk();
    var home = $('#view-home'), owner = $('#view-owner'), mob = $('#mobbar');
    if (currentView !== view) {
      home.hidden = view !== 'home'; owner.hidden = view !== 'owner'; mob.hidden = view !== 'home';
      document.body.setAttribute('data-view', view);
      if (view === 'home') renderHome(); else renderOwner();
      if (!isBook) window.scrollTo(0, 0);
      currentView = view;
    } else if (!isBook && view === 'owner') { renderOwner(); }
    if (isBook) openBook(params); else closeBook();
    document.title = isBook ? 'Запись · ' + B.name : (view === 'home' ? B.name + ': запись онлайн' : 'Кабинет · ' + B.name);
  }

  function init() {
    bookEl = $('#book');
    bookEl.innerHTML = '<div class="book__scrim" data-act="book-close"></div><div class="book__sheet" role="dialog" aria-modal="true" aria-label="Онлайн-запись"></div>';
    renderMobbar();
    window.addEventListener('hashchange', route);
    route();
  }
  init();
})();
