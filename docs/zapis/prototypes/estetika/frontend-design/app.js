(function () {
'use strict';
/* =====================================================================
   Эстетика: салон красоты в Таганроге
   Направление: светлый салон, белый кирпич и сиреневые стены, неоновая вывеска
   «Es» как главный знак, фото в зеркальных рамах. Цену выбирают во вкладках.
   ===================================================================== */
const SK = {
  media: '../../../tenants/estetika/',
  /* имена мастеров взяты из отзывов (business.json, notes); к услугам не привязаны */
  extra: {
    label: 'Мастер',
    options: ['Любой свободный', 'Татьяна', 'Елена', 'Кристина', 'Виктория', 'Инна Владимировна', 'Наталья', 'Екатерина', 'Алёна'],
    note: 'Это пожелание: если мастер занят, администратор позвонит и предложит время.'
  },
  resTitle: 'Сколько мастеров принимает одновременно'
};

function homeView() {
  const P = i => esc(photoUrl(B.photos[i].file));
  const groups = servicesByCat();
  const cnt = B.reviewsCount + ' ' + plural(B.reviewsCount, ['отзыв', 'отзыва', 'отзывов']);
  const from = catFrom(groups[0].cat);
  const tabs = groups.map((g, i) => '<button class="tab" role="tab" id="tab-' + i + '" aria-controls="pan-' + i + '" aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '" data-i="' + i + '">' + esc(g.cat) + '<span class="tn">' + g.items.length + '</span></button>').join('');
  const panels = groups.map((g, i) => '<ul class="rows" role="tabpanel" id="pan-' + i + '" aria-labelledby="tab-' + i + '"' + (i === 0 ? '' : ' hidden') + '>' + g.items.map(s => '<li class="srow"><div class="s-main"><span class="s-name">' + esc(s.name) + '</span><span class="s-dur">' + ico('clock') + durText(s.durationMin) + '</span></div><span class="s-price' + (s.price == null ? ' ask' : '') + '">' + priceText(s) + '</span><a class="btn btn-ghost btn-sm" href="#/book?s=' + s.id + '" aria-label="Записаться: ' + esc(s.name) + '">Записаться</a></li>').join('') + '</ul>').join('');
  const gIdx = [9, 0, 8, 2, 4, 1, 3, 5, 6, 7, 10].filter(i => i < B.photos.length);
  const gal = gIdx.map(i => '<a class="frame" href="' + P(i) + '" data-photo="' + i + '" aria-label="Открыть фото ' + (i + 1) + '"><img src="' + P(i) + '" alt="" loading="lazy"></a>').join('');
  return '' +
    '<header class="hero-wrap"><div class="topbar"><a class="logo" href="#/" aria-label="Эстетика, на главную"><span class="es">Es</span><span class="lw">Эстетика</span></a><a class="top-link" href="#/owner">' + ico('user') + '<span>Кабинет владельца</span></a></div>' +
    '<div class="hero wrap"><div class="hero-text"><h1>Эстетика</h1><p class="sub">Салон красоты и парикмахерская в Таганроге</p>' +
    '<p class="lede">Стрижка, окрашивание, ногти, брови и ресницы. Несколько процедур можно сделать за один визит.</p>' +
    '<div class="facts-row"><span class="rate">' + ico('star') + '<b>' + ratingText(B.rating) + '</b></span><span>' + cnt + '</span><span class="main-svc">Стрижки ' + (from != null ? 'от ' + fmtRub(from) : '') + '</span></div>' +
    '<div class="hero-cta"><a class="btn btn-primary" href="#/book">' + ico('calendar') + 'Записаться</a><a class="btn btn-ghost" href="' + telHref(B.contacts.phones[0]) + '">' + ico('phone') + 'Позвонить</a></div>' +
    (B.schedule.comment ? '<p class="by-appt">' + ico('clock') + 'Работаем ' + esc(B.schedule.comment) + '</p>' : '') +
    '</div><div class="show" aria-hidden="true"><div class="mirror m1"><img src="' + P(9) + '" alt=""></div><div class="mirror m2"><img src="' + P(0) + '" alt=""></div><div class="mirror m3"><img src="' + P(2) + '" alt=""></div>' +
    '<div class="sign"><span class="sg-es">Es</span><span class="sg-w">ESTETIKA</span></div></div></div></header>' +
    '<main>' +
    '<section class="svc" id="prices"><div class="wrap svc-grid"><div class="sec-head"><h2>Услуги и цены</h2><p>Выберите раздел. День и время выберете при записи.</p><div class="tabs" role="tablist" aria-label="Разделы услуг">' + tabs + '</div></div><div class="panels">' + panels + '</div></div></section>' +
    '<section class="gal" aria-labelledby="g-h"><div class="wrap"><div class="sec-head"><h2 id="g-h">Работы и салон</h2></div><div class="wall">' + gal + '</div></div></section>' +
    '<section class="reviews" aria-labelledby="r-h"><div class="wrap"><div class="sec-head"><h2 id="r-h">Отзывы</h2></div><div class="rv-panel"><div class="rv-body" aria-live="polite" id="rv-body"></div><div class="rv-nav"><button class="icon-btn" id="rv-prev" aria-label="Предыдущий отзыв">' + ico('left') + '</button><span id="rv-count"></span><button class="icon-btn" id="rv-next" aria-label="Следующий отзыв">' + ico('right') + '</button></div></div></div></section>' +
    '<section class="visit" id="contacts" aria-labelledby="v-h"><div class="wrap vs-grid"><div class="v-main"><h2 id="v-h">Как нас найти</h2><p class="addr">' + ico('pin') + '<span>' + esc(B.city + ', ' + B.address) + '</span></p><a class="btn btn-primary" href="' + routeUrl() + '" target="_blank" rel="noopener">' + ico('route') + 'Построить маршрут</a></div><div><h3 class="mini-h">Часы работы</h3>' + hoursHtml() + '</div><div><h3 class="mini-h">Связаться</h3><div class="chips">' + contactsHtml() + '</div></div></div></section>' +
    '</main>' +
    '<footer class="foot"><div class="wrap"><span>' + esc(B.name) + ', ' + esc(B.city) + '</span><a href="#/owner">Вход для владельца</a></div></footer>' + dockHtml();
}

function homeWire() {
  const tabs = $$('.tab');
  const pick = i => {
    tabs.forEach((t, k) => { t.setAttribute('aria-selected', String(k === i)); t.tabIndex = k === i ? 0 : -1; });
    $$('.rows').forEach((p, k) => { p.hidden = k !== i; });
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => pick(i));
    t.addEventListener('keydown', e => {
      const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
      if (d) { e.preventDefault(); const n = (i + d + tabs.length) % tabs.length; pick(n); tabs[n].focus(); }
    });
  });
  let cur = 0; const n = B.reviews.length;
  const draw = () => {
    const r = B.reviews[cur];
    $('#rv-body').innerHTML = '<figure class="rq"><blockquote>' + esc(r.text) + '</blockquote><figcaption>' + esc(r.author) + '</figcaption></figure>';
    $('#rv-count').textContent = (cur + 1) + ' из ' + n;
  };
  $('#rv-prev').addEventListener('click', () => { cur = (cur - 1 + n) % n; draw(); });
  $('#rv-next').addEventListener('click', () => { cur = (cur + 1) % n; draw(); });
  draw();
}

/* =====================================================================
   Общее ядро: данные, расписание, слоты, запись в 3 шага, кабинет владельца.
   Внешний вид главной и всего остального задают home-шаблон и style.css.
   ===================================================================== */
const B = window.BUSINESS;
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const LS = {
  get(k, d) { try { const v = localStorage.getItem(B.slug + ':fd:' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(B.slug + ':fd:' + k, JSON.stringify(v)); } catch (e) { /* приватный режим */ } },
  del(k) { try { localStorage.removeItem(B.slug + ':fd:' + k); } catch (e) { /* ignore */ } }
};

/* ---------- иконки (в стиле Lucide, без внешних скриптов) ---------- */
const ICONS = {
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
  route: '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
  calendar: '<path d="M8 2v4M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  star: '<path fill="currentColor" stroke="none" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
  plus: '<path d="M5 12h14M12 5v14"/>',
  trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  out: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  spark: '<path fill="currentColor" stroke="none" d="M12 0C12.6 7 17 11.4 24 12 17 12.6 12.6 17 12 24 11.4 17 7 12.6 0 12 7 11.4 11.4 7 12 0Z"/>'
};
const ico = (n, cls) => '<svg class="ico ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + ICONS[n] + '</svg>';

/* ---------- форматирование ---------- */
const pad = n => String(n).padStart(2, '0');
const fmtRub = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽';
const plural = (n, f) => { const a = Math.abs(n) % 100, b = a % 10; return a > 10 && a < 20 ? f[2] : b > 1 && b < 5 ? f[1] : b === 1 ? f[0] : f[2]; };
const priceText = s => s.price == null ? 'по запросу' : (s.priceFrom ? 'от ' : '') + fmtRub(s.price);
const durText = m => { if (m < 60) return m + ' мин'; const h = Math.floor(m / 60), r = m % 60; return h + ' ч' + (r ? ' ' + r + ' мин' : ''); };
const ratingText = r => r.toFixed(1).replace('.', ',');
const phoneFmt = p => { const d = String(p).replace(/\D/g, '').slice(-10); return '+7 (' + d.slice(0, 3) + ') ' + d.slice(3, 6) + '-' + d.slice(6, 8) + '-' + d.slice(8, 10); };
const telHref = p => 'tel:+7' + String(p).replace(/\D/g, '').slice(-10);
const waHref = p => 'https://wa.me/7' + String(p).replace(/\D/g, '').slice(-10);
const routeUrl = () => 'https://yandex.ru/maps/?rtext=~' + B.point.lat + ',' + B.point.lon + '&rtt=auto';
const initials = n => String(n).trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();

function maskPhone(v) {
  let d = String(v).replace(/\D/g, '');
  if (d[0] === '7' || d[0] === '8') d = d.slice(1);
  d = d.slice(0, 10);
  let r = '+7';
  if (d.length) r += ' (' + d.slice(0, 3);
  if (d.length >= 3) r += ')';
  if (d.length > 3) r += ' ' + d.slice(3, 6);
  if (d.length > 6) r += '-' + d.slice(6, 8);
  if (d.length > 8) r += '-' + d.slice(8, 10);
  return r;
}
const phoneDigits = v => { let d = String(v).replace(/\D/g, ''); if (d[0] === '7' || d[0] === '8') d = d.slice(1); return d; };

/* ---------- даты и график ---------- */
const DK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DK_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DN_SHORT = { Mon: 'Пн', Tue: 'Вт', Wed: 'Ср', Thu: 'Чт', Fri: 'Пт', Sat: 'Сб', Sun: 'Вс' };
const DN_FULL = { Mon: 'Понедельник', Tue: 'Вторник', Wed: 'Среда', Thu: 'Четверг', Fri: 'Пятница', Sat: 'Суббота', Sun: 'Воскресенье' };
const MONTH_GEN = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const ds = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const pd = s => { const a = s.split('-').map(Number); return new Date(a[0], a[1] - 1, a[2]); };
const mm = t => pad(Math.floor(t / 60)) + ':' + pad(t % 60);
const toMin = s => { const a = s.split(':').map(Number); return a[0] * 60 + a[1]; };
const todayStr = () => ds(new Date());
const nowMin = () => { const n = new Date(); return n.getHours() * 60 + n.getMinutes(); };
const dayKey = d => DK[d.getDay()];
const dayLong = d => DN_FULL[dayKey(d)].toLowerCase() + ', ' + d.getDate() + ' ' + MONTH_GEN[d.getMonth()];
function weekDays() { const out = []; const base = new Date(); for (let i = 0; i < 7; i++) { const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i); out.push(ds(d)); } return out; }

function baseSched() {
  const s = {};
  DK_ORDER.forEach(k => {
    const w = B.schedule[k] && B.schedule[k].working_hours && B.schedule[k].working_hours[0];
    s[k] = w ? { open: true, from: w.from, to: w.to } : { open: false, from: '10:00', to: '18:00' };
  });
  return s;
}
const getSched = () => LS.get('sched', null) || baseSched();
function hoursFor(d) {
  const e = getSched()[dayKey(d)];
  if (!e || !e.open) return null;
  const f = toMin(e.from), t = toMin(e.to);
  return t > f ? { from: f, to: t } : null;
}
/* «Пн–Пт 08:00–20:00» для главной */
function hoursRows() {
  const s = getSched(); const rows = [];
  DK_ORDER.forEach(k => {
    const txt = s[k].open ? s[k].from + '–' + s[k].to : 'выходной';
    const last = rows[rows.length - 1];
    if (last && last.txt === txt) last.to = k; else rows.push({ from: k, to: k, txt: txt });
  });
  return rows.map(r => ({ days: r.from === r.to ? DN_SHORT[r.from] : DN_SHORT[r.from] + '–' + DN_SHORT[r.to], txt: r.txt, closed: r.txt === 'выходной' }));
}
function openNow() {
  const d = new Date(); const h = hoursFor(d); const m = nowMin();
  return !!h && m >= h.from && m < h.to;
}

/* ---------- услуги ---------- */
function getServices() {
  const saved = LS.get('services', null);
  if (saved) return saved;
  return B.services.map((s, i) => ({ id: i + 1, name: s.name, price: s.price, priceFrom: !!s.priceFrom, durationMin: s.durationMin, long: !!s.long, category: s.category || 'Услуги' }));
}
const svcById = id => getServices().find(s => s.id === Number(id));
function servicesByCat() {
  const g = []; const idx = {};
  getServices().forEach(s => { const c = s.category || 'Услуги'; if (!(c in idx)) { idx[c] = g.length; g.push({ cat: c, items: [] }); } g[idx[c]].items.push(s); });
  return g;
}
function catFrom(cat) {
  const p = getServices().filter(s => s.category === cat && s.price != null).map(s => s.price);
  return p.length ? Math.min.apply(null, p) : null;
}
const resCount = () => LS.get('res', null) || B.resources.count;

/* ---------- записи: примеры + свои ---------- */
const hashStr = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const F_NAMES = ['Анна', 'Мария', 'Елена', 'Ольга', 'Наталья', 'Ирина', 'Екатерина', 'Юлия', 'Алина', 'Светлана', 'Дарья', 'Виктория', 'Татьяна', 'Полина', 'Ксения', 'Людмила'];
const M_NAMES = ['Андрей', 'Сергей', 'Дмитрий', 'Максим', 'Алексей', 'Игорь', 'Артём', 'Михаил'];
const SUR = ['К.', 'М.', 'С.', 'П.', 'Л.', 'Т.', 'Б.', 'Н.', 'Р.', 'Ф.'];
let mockCache = {};

function mockDay(dateStr) {
  if (mockCache[dateStr]) return mockCache[dateStr];
  const d = pd(dateStr), h = hoursFor(d), out = [];
  if (h) {
    const r = rng(hashStr(B.slug + dateStr)), n = resCount(), cells = Math.floor((h.to - h.from) / 30);
    const occ = new Array(cells).fill(0); let filled = 0, tries = 0;
    const pool = B.services.filter(s => !s.long);
    const isToday = dateStr === todayStr(), isPast = dateStr < todayStr();
    const place = (st, s) => {
      const len = Math.ceil(s.durationMin / 30);
      if (st < 0 || st + len > cells) return false;
      for (let i = 0; i < len; i++) if (occ[st + i] >= n) return false;
      for (let i = 0; i < len; i++) occ[st + i]++;
      filled += len;
      const male = /муж|боро/i.test(s.name), pool2 = male ? M_NAMES : F_NAMES;
      const start = h.from + st * 30;
      let status = 'new';
      if (isPast || (isToday && start + s.durationMin <= nowMin())) status = r() < 0.12 ? 'noshow' : 'done';
      else if (isToday && start <= nowMin()) status = 'came';
      out.push({ id: 'm-' + dateStr + '-' + out.length, date: dateStr, start: start, dur: len * 30, svc: s.name, price: s.price, priceFrom: !!s.priceFrom, name: pool2[Math.floor(r() * pool2.length)] + ' ' + SUR[Math.floor(r() * SUR.length)], phone: '+7900555' + String(1000 + Math.floor(r() * 8999)), status: status, src: 'demo' });
      return true;
    };
    /* пиковые окна: время, когда заняты все мастера, чтобы на сайте были занятые слоты */
    const peaks = 1 + Math.floor(r() * 2);
    for (let p = 0; p < peaks && cells > 6; p++) {
      const w0 = Math.floor(r() * (cells - 4)), wl = 2 + Math.floor(r() * 3);
      for (let c = w0; c < Math.min(cells, w0 + wl); c++) {
        let guard = 0;
        while (occ[c] < n && guard++ < 30) place(c, pool[Math.floor(r() * pool.length)]);
      }
    }
    while (filled < cells * n * 0.28 && tries < 80) {
      tries++;
      const s = pool[Math.floor(r() * pool.length)];
      place(Math.floor(r() * cells), s);
    }
    out.sort((a, b) => a.start - b.start);
  }
  mockCache[dateStr] = out;
  return out;
}
const userBookings = () => LS.get('bookings', []);
function statusOf(b) { const o = LS.get('status', {}); return o[b.id] || b.status || 'new'; }
function bookingsOn(dateStr) {
  const list = mockDay(dateStr).concat(userBookings().filter(b => b.date === dateStr));
  return list.map(b => Object.assign({}, b, { status: statusOf(b) })).sort((a, b) => a.start - b.start);
}
function setStatus(id, st) { const o = LS.get('status', {}); o[id] = st; LS.set('status', o); }
function addUserBooking(b) { const l = userBookings(); l.push(b); LS.set('bookings', l); }
function occupancy(dateStr, h) {
  const cells = Math.floor((h.to - h.from) / 30), occ = new Array(cells).fill(0);
  bookingsOn(dateStr).forEach(b => {
    if (b.status === 'cancelled') return;
    const a = Math.floor((b.start - h.from) / 30), len = Math.ceil(b.dur / 30);
    for (let i = a; i < a + len; i++) if (i >= 0 && i < cells) occ[i]++;
  });
  return occ;
}
/* null — выходной; иначе [{t, free}] */
function slotsFor(svc, dateStr) {
  const d = pd(dateStr), h = hoursFor(d);
  if (!h) return null;
  const occ = occupancy(dateStr, h), n = resCount(), len = Math.ceil(svc.durationMin / 30), out = [];
  const isToday = dateStr === todayStr();
  for (let t = h.from; t + svc.durationMin <= h.to; t += 30) {
    if (isToday && t < nowMin() + 30) continue;
    const i = (t - h.from) / 30; let free = true;
    for (let k = 0; k < len; k++) if (occ[i + k] >= n) free = false;
    out.push({ t: t, free: free });
  }
  return out;
}
const ST = { new: 'Записан', came: 'Пришёл', noshow: 'Не пришёл', done: 'Выполнено', cancelled: 'Отменено' };

/* ---------- календарь (.ics) ---------- */
function icsText(b) {
  const f = t => b.date.replace(/-/g, '') + 'T' + pad(Math.floor(t / 60)) + pad(t % 60) + '00';
  const e = s => String(s).replace(/[\\;,]/g, m => '\\' + m).replace(/\n/g, '\\n');
  const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//' + B.slug + '//zapis//RU', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT', 'UID:' + b.id + '@' + B.slug, 'DTSTAMP:' + stamp, 'DTSTART:' + f(b.start), 'DTEND:' + f(b.start + b.dur), 'SUMMARY:' + e(B.name + ': ' + b.svc), 'LOCATION:' + e(B.city + ', ' + B.address), 'DESCRIPTION:' + e('Телефон: ' + phoneFmt(B.contacts.phones[0])), 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
}
function downloadIcs(b) {
  const blob = new Blob([icsText(b)], { type: 'text/calendar;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = 'zapis-' + B.slug + '.ics';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

/* ---------- мелкие интерфейсные штуки ---------- */
let toastTimer;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('on');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('on'), 2800);
}
const photoUrl = f => SK.media + f;

function reviewsHtml(cls) {
  return B.reviews.map(r => '<figure class="' + (cls || 'rev') + '"><blockquote>' + esc(r.text) + '</blockquote><figcaption><span class="av" aria-hidden="true">' + esc(initials(r.author)) + '</span>' + esc(r.author) + '</figcaption></figure>').join('');
}
function contactsHtml() {
  const c = B.contacts, out = [];
  c.phones.forEach(p => out.push('<a class="chip" href="' + telHref(p) + '">' + ico('phone') + phoneFmt(p) + '</a>'));
  if (c.whatsapp) out.push('<a class="chip" href="' + esc(c.whatsapp) + '" target="_blank" rel="noopener">' + ico('chat') + 'WhatsApp</a>');
  if (c.telegram) out.push('<a class="chip" href="' + esc(c.telegram) + '" target="_blank" rel="noopener">' + ico('send') + 'Telegram</a>');
  if (c.vk) out.push('<a class="chip" href="' + esc(c.vk) + '" target="_blank" rel="noopener"><span class="vk" aria-hidden="true">VK</span>ВКонтакте</a>');
  return out.join('');
}
function hoursHtml() {
  const rows = hoursRows().map(r => '<div class="hr' + (r.closed ? ' closed' : '') + '"><dt>' + r.days + '</dt><dd>' + r.txt + '</dd></div>').join('');
  const note = B.schedule.comment ? '<p class="hours-note">' + esc(B.schedule.comment.charAt(0).toUpperCase() + B.schedule.comment.slice(1)) + '</p>' : '';
  return '<dl class="hours">' + rows + '</dl>' + note;
}
function dockHtml() {
  return '<nav class="dock" aria-label="Быстрые действия"><a class="btn btn-primary" href="#/book">' + ico('calendar') + 'Записаться</a><a class="btn btn-ghost" href="' + telHref(B.contacts.phones[0]) + '">' + ico('phone') + 'Позвонить</a><a class="btn btn-ghost" href="' + routeUrl() + '" target="_blank" rel="noopener">' + ico('route') + 'Маршрут</a></nav>';
}

/* ---------- маршрутизация ---------- */
let view = null;
function route() {
  const h = location.hash || '#/';
  const parts = h.slice(1).split('?'), path = parts[0], q = new URLSearchParams(parts[1] || '');
  if (path === '/owner') {
    closeSheet(true); closeModal();
    showOwner();
    return;
  }
  if (view !== 'home') { view = 'home'; document.body.dataset.view = 'home'; $('#app').innerHTML = homeView(); window.scrollTo(0, 0); wireHome(); }
  if (path === '/book') {
    if (BK.done) BK = freshBook();
    const sid = q.get('s');
    if (sid && svcById(sid)) { BK.sid = Number(sid); BK.time = null; BK.date = null; BK.step = svcById(sid).long ? 3 : 2; }
    openSheet();
  } else closeSheet(true);
}

function wireHome() {
  $$('[data-photo]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); openLightbox(Number(a.dataset.photo)); }));
  if (typeof homeWire === 'function') homeWire();
}

/* ---------- запись: состояние ---------- */
const freshBook = () => ({ step: 1, sid: null, date: null, time: null, name: '', phone: '', extra: '', consent: false, done: null, cancelled: false });
let BK = freshBook();
let sheetOpen = false, lastFocus = null;

function openSheet() {
  const w = $('#sheet'); if (!sheetOpen) lastFocus = document.activeElement;
  if (BK.step === 2 && !BK.date) BK.date = firstAvailableDate();
  sheetOpen = true; w.hidden = false; document.body.classList.add('lock');
  renderSheet(); const t = $('#sheet-title'); if (t) t.focus({ preventScroll: true });
}
function closeSheet(silent) {
  if (!sheetOpen) return;
  sheetOpen = false; $('#sheet').hidden = true; $('#sheet').innerHTML = ''; document.body.classList.remove('lock');
  if (BK.done) BK = freshBook();
  if (lastFocus && lastFocus.focus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
  lastFocus = null;
  if (!silent && /^#\/book/.test(location.hash)) location.hash = '#/';
}
function firstAvailableDate() {
  const s = svcById(BK.sid); if (!s) return weekDays()[0];
  const days = weekDays();
  for (let i = 0; i < days.length; i++) { const sl = slotsFor(s, days[i]); if (sl && sl.some(x => x.free)) return days[i]; }
  return days[0];
}
const STEP_NAMES = ['Услуга', 'Время', 'Контакты'];
function stepsFor() { const s = svcById(BK.sid); return s && s.long ? [1, 3] : [1, 2, 3]; }

function renderSheet(focusSel) {
  const w = $('#sheet'); if (!sheetOpen) return;
  const old = $('.sheet-body', w), oldDates = $('.dates', w);
  const sTop = old ? old.scrollTop : 0, dLeft = oldDates ? oldDates.scrollLeft : 0;
  const s = svcById(BK.sid), steps = stepsFor();
  let title, body, foot = '';
  if (BK.done) {
    title = BK.cancelled ? 'Запись отменена' : (BK.done.long ? 'Заявка принята' : 'Вы записаны');
    body = doneHtml();
    foot = '<button class="btn btn-ghost btn-block" data-act="close">Закрыть</button>';
  } else {
    title = BK.step === 1 ? 'Что вам нужно?' : BK.step === 2 ? 'Когда удобно?' : (s && s.long ? 'Оставить заявку' : 'Как с вами связаться?');
    body = BK.step === 1 ? stepService() : BK.step === 2 ? stepTime() : stepForm();
    const sum = s ? '<div class="sum"><b>' + esc(s.name) + '</b><span>' + priceText(s) + (BK.step >= 2 && BK.date && BK.time && !s.long ? ', ' + pd(BK.date).getDate() + ' ' + MONTH_GEN[pd(BK.date).getMonth()] + ' в ' + mm(BK.time) : '') + '</span></div>' : '<div class="sum"><span>Выберите услугу</span></div>';
    const label = BK.step === 1 ? (s && s.long ? 'Продолжить' : 'Выбрать время') : BK.step === 2 ? 'Продолжить' : (s && s.long ? 'Оставить заявку' : 'Записаться');
    const dis = (BK.step === 1 && !s) || (BK.step === 2 && !BK.time);
    foot = sum + '<button class="btn btn-primary" data-act="next"' + (dis ? ' disabled' : '') + '>' + label + '</button>';
  }
  const stepsHtml = BK.done ? '' : '<ol class="steps" aria-label="Шаги записи">' + steps.map((n, i) => '<li class="' + (n < BK.step ? 'done' : n === BK.step ? 'on' : '') + '"' + (n === BK.step ? ' aria-current="step"' : '') + '><span class="sn">' + (i + 1) + '</span>' + STEP_NAMES[n - 1] + '</li>').join('') + '</ol>';
  const back = !BK.done && BK.step > 1 ? '<button class="icon-btn" data-act="back" aria-label="Назад">' + ico('left') + '</button>' : '<span class="icon-btn ghost" aria-hidden="true"></span>';
  w.innerHTML = '<div class="sheet-backdrop" data-act="close"></div><section class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title"><header class="sheet-head">' + back + '<h2 id="sheet-title" tabindex="-1">' + title + '</h2><button class="icon-btn" data-act="close" aria-label="Закрыть">' + ico('x') + '</button></header>' + stepsHtml + '<div class="sheet-body">' + body + '</div><footer class="sheet-foot">' + foot + '</footer></section>';
  const nb = $('.sheet-body', w); if (nb) nb.scrollTop = sTop;
  const nd = $('.dates', w); if (nd) nd.scrollLeft = dLeft;
  if (focusSel) { const f = $(focusSel, w); if (f) f.focus({ preventScroll: true }); }
}

function stepService() {
  return servicesByCat().map(g => '<div class="pick-group"><h3>' + esc(g.cat) + '</h3>' + g.items.map(s => '<label class="pick-item"><input type="radio" name="svc" value="' + s.id + '"' + (BK.sid === s.id ? ' checked' : '') + '><span class="pi-main"><span class="pi-name">' + esc(s.name) + '</span><span class="pi-meta">' + (s.long ? 'Заявка, мастер перезвонит' : durText(s.durationMin)) + '</span></span><span class="pi-price">' + priceText(s) + '</span></label>').join('') + '</div>').join('');
}
function stepTime() {
  const s = svcById(BK.sid), days = weekDays();
  if (!BK.date) BK.date = firstAvailableDate();
  const chips = days.map(dstr => {
    const d = pd(dstr), sl = slotsFor(s, dstr), has = !!sl && sl.some(x => x.free), sel = dstr === BK.date;
    return '<button class="date-chip' + (sel ? ' sel' : '') + '" data-date="' + dstr + '" aria-pressed="' + sel + '"' + (has ? '' : ' disabled') + '><span class="dw">' + (dstr === todayStr() ? 'сегодня' : DN_SHORT[dayKey(d)].toLowerCase()) + '</span><span class="dd">' + d.getDate() + '</span><span class="dm">' + (has ? MONTH_GEN[d.getMonth()].slice(0, 3) : (sl ? 'занято' : 'выходной')) + '</span></button>';
  }).join('');
  const sl = slotsFor(s, BK.date);
  let times;
  if (!sl) times = '<p class="empty">В этот день выходной. Выберите другой.</p>';
  else if (!sl.some(x => x.free)) times = '<p class="empty">На этот день всё занято. Выберите другой.</p>';
  else times = '<div class="times" role="group" aria-label="Время">' + sl.map(x => '<button class="time-chip' + (BK.time === x.t ? ' sel' : '') + '" data-time="' + x.t + '" aria-pressed="' + (BK.time === x.t) + '"' + (x.free ? '' : ' disabled aria-label="' + mm(x.t) + ', занято"') + '>' + mm(x.t) + '</button>').join('') + '</div>';
  return '<p class="hint">' + esc(s.name) + ', ' + durText(s.durationMin) + '</p><div class="dates" role="group" aria-label="Дата">' + chips + '</div><h3 class="sub">' + dayLong(pd(BK.date)) + '</h3>' + times;
}
function stepForm() {
  const s = svcById(BK.sid), x = SK.extra;
  const when = s.long ? 'Мастер перезвонит и согласует время' : dayLong(pd(BK.date)) + ' в ' + mm(BK.time);
  const extra = x ? '<div class="field"><label for="f-extra">' + x.label + ' <span class="opt">(необязательно)</span></label><select id="f-extra" class="input" data-f="extra">' + x.options.map(o => '<option' + (BK.extra === o ? ' selected' : '') + '>' + esc(o) + '</option>').join('') + '</select><p class="note">' + x.note + '</p></div>' : '';
  return '<div class="recap"><span class="r-svc">' + esc(s.name) + '</span><span class="r-when">' + when + '</span><span class="r-price">' + priceText(s) + '</span></div>' +
    '<form id="book-form" novalidate>' +
    '<div class="field"><label for="f-name">Ваше имя</label><input id="f-name" class="input" data-f="name" autocomplete="given-name" value="' + esc(BK.name) + '" placeholder="Как к вам обращаться"><p class="err" id="e-name" aria-live="polite"></p></div>' +
    '<div class="field"><label for="f-phone">Телефон</label><input id="f-phone" class="input" data-f="phone" type="tel" inputmode="tel" autocomplete="tel" value="' + esc(BK.phone) + '" placeholder="+7 (___) ___-__-__"><p class="err" id="e-phone" aria-live="polite"></p></div>' +
    extra +
    '<div class="field consent"><label class="check"><input type="checkbox" id="f-consent" data-f="consent"' + (BK.consent ? ' checked' : '') + '><span class="box" aria-hidden="true">' + ico('check') + '</span><span>Согласен на обработку персональных данных, ознакомлен с <a href="#" class="plink">политикой конфиденциальности</a></span></label><p class="err" id="e-consent" aria-live="polite"></p></div>' +
    '</form>';
}
function doneHtml() {
  const b = BK.done;
  if (BK.cancelled) return '<div class="done-view"><div class="mark off">' + ico('x') + '</div><p class="lead">Запись отменена. Время снова свободно.</p><button class="btn btn-primary btn-block" data-act="again">Записаться снова</button></div>';
  const rows = [['Услуга', esc(b.svc)]];
  if (b.long) rows.push(['Когда', 'Мастер перезвонит и согласует время']);
  else rows.push(['Когда', dayLong(pd(b.date)) + ' в ' + mm(b.start)], ['Длительность', durText(b.dur)]);
  rows.push(['Стоимость', priceText(b)], ['Адрес', esc(B.city + ', ' + B.address)], ['Имя', esc(b.name)], ['Телефон', esc(b.phone)]);
  if (SK.extra && b.extra && b.extra !== SK.extra.options[0]) rows.push([SK.extra.label, esc(b.extra)]);
  return '<div class="done-view"><div class="mark">' + ico('check') + '</div><p class="lead">' + (b.long ? 'Заявку получили. Позвоним на ' + esc(b.phone) + '.' : 'Ждём вас: ' + esc(B.name) + '.') + '</p><dl class="facts">' + rows.map(r => '<div><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>').join('') + '</dl>' +
    '<div class="done-actions">' + (b.long ? '' : '<button class="btn btn-primary btn-block" data-act="ics">' + ico('download') + 'Добавить в календарь</button>') + '<button class="btn btn-ghost btn-block" data-act="ask-cancel">' + (b.long ? 'Отозвать заявку' : 'Отменить запись') + '</button></div><div class="confirm" id="confirm" hidden><p>Точно отменить? Время освободится.</p><div class="row"><button class="btn btn-ghost" data-act="cancel-yes">Да, отменить</button><button class="btn btn-primary" data-act="cancel-no">Оставить</button></div></div></div>';
}

function validateBook(show) {
  const errs = {};
  if (BK.name.trim().length < 2) errs.name = 'Напишите имя, хотя бы два символа.';
  if (phoneDigits(BK.phone).length !== 10) errs.phone = 'Введите номер полностью: 10 цифр после +7.';
  if (!BK.consent) errs.consent = 'Без согласия записать не сможем.';
  if (show) ['name', 'phone', 'consent'].forEach(k => {
    const e = $('#e-' + k), inp = $('#f-' + k); if (e) e.textContent = errs[k] || '';
    if (inp) inp.setAttribute('aria-invalid', errs[k] ? 'true' : 'false');
  });
  return errs;
}
function submitBook() {
  const errs = validateBook(true), k = Object.keys(errs)[0];
  if (k) { const f = $('#f-' + k); if (f) f.focus(); return; }
  const s = svcById(BK.sid), long = !!s.long;
  if (!long) { const sl = slotsFor(s, BK.date), hit = sl && sl.find(x => x.t === BK.time); if (!hit || !hit.free) { toast('Это время только что заняли. Выберите другое.'); BK.time = null; BK.step = 2; renderSheet(); return; } }
  const b = { id: 'u-' + Date.now().toString(36), date: long ? todayStr() : BK.date, start: long ? 0 : BK.time, dur: long ? 0 : Math.ceil(s.durationMin / 30) * 30, svc: s.name, price: s.price, priceFrom: !!s.priceFrom, name: BK.name.trim(), phone: BK.phone, extra: BK.extra, status: 'new', src: 'site', long: long };
  if (!long) addUserBooking(b); else { const l = LS.get('requests', []); l.push(b); LS.set('requests', l); }
  BK.done = b; BK.cancelled = false; renderSheet();
  const t = $('#sheet-title'); if (t) t.focus();
}

function wireSheet() {
  const w = $('#sheet');
  w.addEventListener('click', e => {
    if (e.target.closest('a.plink')) { e.preventDefault(); toast('Текст политики будет добавлен на боевой версии.'); return; }
    const dc = e.target.closest('[data-date]'); if (dc && !dc.disabled) { BK.date = dc.dataset.date; BK.time = null; renderSheet('[data-date="' + BK.date + '"]'); return; }
    const tc = e.target.closest('[data-time]'); if (tc && !tc.disabled) { BK.time = Number(tc.dataset.time); renderSheet('[data-time="' + BK.time + '"]'); return; }
    const a = e.target.closest('[data-act]'); if (!a) return;
    const act = a.dataset.act, s = svcById(BK.sid);
    if (act === 'close') { closeSheet(); }
    else if (act === 'back') { BK.step = s && s.long ? 1 : BK.step - 1; renderSheet(); $('#sheet-title').focus(); }
    else if (act === 'next') {
      if (BK.step === 1) { if (!s) return; BK.step = s.long ? 3 : 2; if (!s.long && !BK.date) BK.date = firstAvailableDate(); renderSheet(); $('#sheet-title').focus(); }
      else if (BK.step === 2) { if (!BK.time) return; BK.step = 3; renderSheet(); $('#sheet-title').focus(); }
      else submitBook();
    }
    else if (act === 'ics') downloadIcs(BK.done);
    else if (act === 'ask-cancel') { $('#confirm').hidden = false; $('[data-act="cancel-no"]').focus(); }
    else if (act === 'cancel-no') { $('#confirm').hidden = true; }
    else if (act === 'cancel-yes') { if (BK.done.long) { const l = LS.get('requests', []).filter(x => x.id !== BK.done.id); LS.set('requests', l); } else setStatus(BK.done.id, 'cancelled'); BK.cancelled = true; renderSheet(); $('#sheet-title').focus(); }
    else if (act === 'again') { BK = freshBook(); renderSheet(); $('#sheet-title').focus(); }
  });
  w.addEventListener('change', e => {
    const t = e.target;
    if (t.name === 'svc') { BK.sid = Number(t.value); BK.time = null; BK.date = null; renderSheet('input[name="svc"]:checked'); }
    else if (t.dataset.f === 'consent') { BK.consent = t.checked; if (t.checked) { const er = $('#e-consent'); if (er) er.textContent = ''; } }
    else if (t.dataset.f === 'extra') BK.extra = t.value;
  });
  w.addEventListener('input', e => {
    const t = e.target, f = t.dataset.f; if (!f) return;
    if (f === 'phone') { t.value = maskPhone(t.value); BK.phone = t.value; }
    else if (f === 'name') BK.name = t.value;
    if ((f === 'phone' || f === 'name') && t.getAttribute('aria-invalid') === 'true') validateBook(true);
  });
  w.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeSheet(); return; }
    if (e.key === 'Enter' && e.target.matches('#book-form input:not([type=checkbox])')) { e.preventDefault(); submitBook(); return; }
    if (e.key === 'Tab') trapTab(e, w);
  });
  w.addEventListener('focusin', e => { if (e.target.id === 'f-phone' && !e.target.value) { e.target.value = '+7'; BK.phone = '+7'; } });
}
function trapTab(e, root) {
  const f = $$('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex="0"]', root).filter(x => x.offsetParent !== null);
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

/* ---------- окно (лайтбокс и карточки кабинета) ---------- */
let modalPrev = null;
function openModal(html, cls) {
  const m = $('#modal'); if (m.hidden) modalPrev = document.activeElement;
  m.onclick = null; m.onkeydown = null;
  m.className = 'sheet-wrap modal ' + (cls || ''); m.hidden = false; document.body.classList.add('lock');
  m.innerHTML = '<div class="sheet-backdrop" data-mclose></div><section class="sheet" role="dialog" aria-modal="true" aria-labelledby="m-title">' + html + '</section>';
  const t = $('#m-title', m); if (t) t.focus({ preventScroll: true });
}
function closeModal() {
  const m = $('#modal'); if (m.hidden) return;
  m.hidden = true; m.innerHTML = ''; m.onclick = null; m.onkeydown = null;
  if (!sheetOpen) document.body.classList.remove('lock');
  if (modalPrev && modalPrev.focus && document.contains(modalPrev)) modalPrev.focus({ preventScroll: true });
  modalPrev = null;
}
function wireModal() {
  const m = $('#modal');
  m.addEventListener('click', e => { if (e.target.closest('[data-mclose]')) closeModal(); });
  m.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); else if (e.key === 'Tab') trapTab(e, m); });
}
function openLightbox(i) {
  const list = B.photos, n = list.length; let cur = ((i % n) + n) % n;
  const inner = () => '<div class="lb"><button class="icon-btn lb-x" data-mclose aria-label="Закрыть">' + ico('x') + '</button><img src="' + esc(photoUrl(list[cur].file)) + '" alt="Фото ' + (cur + 1) + ' из ' + n + '"><div class="lb-nav"><button class="icon-btn" data-lb="-1" aria-label="Предыдущее фото">' + ico('left') + '</button><span id="m-title" tabindex="-1">' + (cur + 1) + ' из ' + n + '</span><button class="icon-btn" data-lb="1" aria-label="Следующее фото">' + ico('right') + '</button></div></div>';
  openModal(inner(), 'lightbox');
  const m = $('#modal');
  const redraw = focusSel => { $('.sheet', m).innerHTML = inner(); const f = $(focusSel, m); if (f) f.focus(); };
  m.onclick = e => { const b = e.target.closest('[data-lb]'); if (b) { cur = (cur + Number(b.dataset.lb) + n) % n; redraw('[data-lb="' + b.dataset.lb + '"]'); } };
  m.onkeydown = e => { if (e.key === 'ArrowRight') { cur = (cur + 1) % n; redraw('[data-lb="1"]'); } else if (e.key === 'ArrowLeft') { cur = (cur - 1 + n) % n; redraw('[data-lb="-1"]'); } };
}

/* =====================================================================
   Кабинет владельца
   ===================================================================== */
const OW = { tab: 'bookings', range: 'today', draft: null, sched: null, rangeSet: false };
const authed = () => { try { return sessionStorage.getItem(B.slug + ':fd:auth') === '1'; } catch (e) { return false; } };

function showOwner() {
  view = 'owner'; document.body.dataset.view = 'owner'; window.scrollTo(0, 0); OW.draft = null; OW.sched = null;
  if (!OW.rangeSet) { OW.range = hoursFor(new Date()) ? 'today' : 'week'; OW.rangeSet = true; }
  $('#app').innerHTML = authed() ? ownerShell() : loginView();
  if (authed()) renderOwnerBody(); else wireLogin();
}
function loginView() {
  return '<main class="login"><a class="back-link" href="#/">' + ico('left') + 'На сайт</a><div class="login-card"><p class="brand-s">' + esc(B.name) + '</p><h1>Кабинет владельца</h1><p class="demo-note">Демо-доступ: подойдут любые почта и пароль.</p><form id="login" novalidate><div class="field"><label for="l-mail">Почта</label><input id="l-mail" class="input" type="email" autocomplete="username" placeholder="name@example.ru"><p class="err" id="e-mail" aria-live="polite"></p></div><div class="field"><label for="l-pass">Пароль</label><input id="l-pass" class="input" type="password" autocomplete="current-password"><p class="err" id="e-pass" aria-live="polite"></p></div><button class="btn btn-primary btn-block" type="submit">Войти</button></form></div></main>';
}
function wireLogin() {
  $('#login').addEventListener('submit', e => {
    e.preventDefault();
    const m = $('#l-mail'), p = $('#l-pass'); let bad = false;
    $('#e-mail').textContent = m.value.trim() ? '' : 'Введите почту, можно любую.';
    $('#e-pass').textContent = p.value ? '' : 'Введите пароль, можно любой.';
    m.setAttribute('aria-invalid', String(!m.value.trim())); p.setAttribute('aria-invalid', String(!p.value));
    if (!m.value.trim()) { m.focus(); bad = true; } else if (!p.value) { p.focus(); bad = true; }
    if (bad) return;
    try { sessionStorage.setItem(B.slug + ':fd:auth', '1'); } catch (er) { /* ignore */ }
    showOwner();
  });
}
function ownerShell() {
  return '<main class="owner"><header class="o-top"><div><p class="brand-s">' + esc(B.name) + '</p><h1>Кабинет</h1></div><div class="o-top-actions"><span class="tag">Демо-доступ</span><button class="btn btn-primary btn-sm" data-o="manual">' + ico('plus') + 'Записать вручную</button><a class="btn btn-ghost btn-sm" href="#/">На сайт</a><button class="btn btn-ghost btn-sm" data-o="logout">' + ico('out') + 'Выйти</button></div></header>' +
    '<div class="o-tabs" role="tablist" aria-label="Разделы">' + [['bookings', 'Записи'], ['services', 'Услуги и цены'], ['sched', 'График']].map(t => '<button role="tab" id="tab-' + t[0] + '" aria-selected="' + (OW.tab === t[0]) + '" data-tab="' + t[0] + '">' + t[1] + '</button>').join('') + '</div><div id="o-body" role="tabpanel"></div></main>';
}
function renderOwnerBody(focusSel) {
  const b = $('#o-body'); if (!b) return;
  $$('.o-tabs [data-tab]').forEach(t => t.setAttribute('aria-selected', String(t.dataset.tab === OW.tab)));
  b.setAttribute('aria-labelledby', 'tab-' + OW.tab);
  b.innerHTML = OW.tab === 'bookings' ? ownerBookings() : OW.tab === 'services' ? ownerServices() : ownerSched();
  if (focusSel) { const f = $(focusSel, b); if (f) f.focus(); }
}
function bookingRow(x) {
  return '<button class="o-row st-' + x.status + '" data-bk="' + esc(x.id) + '" data-d="' + x.date + '"><span class="o-time">' + mm(x.start) + '<small>' + mm(x.start + x.dur) + '</small></span><span class="o-main"><b>' + esc(x.svc) + '</b><span>' + esc(x.name) + ', ' + esc(phoneFmt(x.phone)) + '</span></span><span class="pill st-' + x.status + '">' + ST[x.status] + '</span></button>';
}
function ownerBookings() {
  const days = OW.range === 'today' ? [todayStr()] : weekDays();
  let total = 0, html = '';
  days.forEach(dstr => {
    const d = pd(dstr), list = bookingsOn(dstr), live = list.filter(x => x.status !== 'cancelled');
    total += live.length;
    html += '<section class="o-day"><h3>' + (dstr === todayStr() ? 'Сегодня, ' : '') + dayLong(d) + '<span class="cnt">' + (hoursFor(d) ? live.length + ' ' + plural(live.length, ['запись', 'записи', 'записей']) : 'выходной') + '</span></h3>' +
      (list.length ? '<div class="o-list">' + list.map(bookingRow).join('') + '</div>' : '<p class="empty">' + (hoursFor(d) ? 'Записей пока нет.' : 'В этот день не работаем.') + '</p>') + '</section>';
  });
  const reqs = LS.get('requests', []);
  const reqHtml = reqs.length ? '<section class="o-day"><h3>Заявки без времени<span class="cnt">' + reqs.length + '</span></h3><div class="o-list">' + reqs.map(r => '<div class="o-row st-new static"><span class="o-time">заявка</span><span class="o-main"><b>' + esc(r.svc) + '</b><span>' + esc(r.name) + ', ' + esc(r.phone) + '</span></span><a class="btn btn-ghost btn-sm" href="' + telHref(r.phone) + '">' + ico('phone') + 'Позвонить</a></div>').join('') + '</div></section>' : '';
  return '<div class="o-bar"><div class="seg" role="group" aria-label="Период"><button data-range="today" aria-pressed="' + (OW.range === 'today') + '">Сегодня</button><button data-range="week" aria-pressed="' + (OW.range === 'week') + '">Неделя</button></div><p class="o-sum"><b>' + total + '</b> ' + plural(total, ['запись', 'записи', 'записей']) + (OW.range === 'today' ? ' на сегодня' : ' на 7 дней') + '</p></div>' + reqHtml + html + '<p class="demo-foot">Записи с пометкой «пример» — демо-данные. Новые записи с сайта появляются здесь сразу.</p>';
}
function openBookingCard(id, dstr) {
  const x = bookingsOn(dstr).find(b => b.id === id); if (!x) return;
  const src = x.src === 'site' ? 'Запись с сайта' : x.src === 'manual' ? 'Записали вручную' : 'Пример записи';
  const stBtns = ['came', 'noshow', 'done', 'cancelled'].map(k => '<button class="btn btn-sm st-btn st-' + k + (x.status === k ? ' on' : '') + '" data-set="' + k + '" aria-pressed="' + (x.status === k) + '">' + ST[k] + '</button>').join('');
  openModal('<header class="sheet-head"><span class="icon-btn ghost"></span><h2 id="m-title" tabindex="-1">' + esc(x.name) + '</h2><button class="icon-btn" data-mclose aria-label="Закрыть">' + ico('x') + '</button></header><div class="sheet-body"><p class="src">' + src + '</p><dl class="facts"><div><dt>Услуга</dt><dd>' + esc(x.svc) + '</dd></div><div><dt>Когда</dt><dd>' + dayLong(pd(x.date)) + ', ' + mm(x.start) + '–' + mm(x.start + x.dur) + '</dd></div><div><dt>Цена</dt><dd>' + priceText(x) + '</dd></div><div><dt>Телефон</dt><dd>' + esc(phoneFmt(x.phone)) + '</dd></div>' + (x.extra && SK.extra && x.extra !== SK.extra.options[0] ? '<div><dt>' + SK.extra.label + '</dt><dd>' + esc(x.extra) + '</dd></div>' : '') + '<div><dt>Статус</dt><dd><span class="pill st-' + x.status + '">' + ST[x.status] + '</span></dd></div></dl><div class="o-contact"><a class="btn btn-primary" href="' + telHref(x.phone) + '">' + ico('phone') + 'Позвонить</a><a class="btn btn-ghost" href="' + waHref(x.phone) + '" target="_blank" rel="noopener">' + ico('chat') + 'WhatsApp</a></div><h3 class="sub">Статус записи</h3><div class="st-group">' + stBtns + '</div></div>', 'card');
  $('#modal').onclick = e => {
    const s = e.target.closest('[data-set]'); if (!s) return;
    setStatus(x.id, s.dataset.set); toast('Статус: ' + ST[s.dataset.set].toLowerCase()); closeModal(); renderOwnerBody();
  };
}
function openManual() {
  const svcs = getServices().filter(s => !s.long), days = weekDays();
  const st = { sid: svcs[0] ? svcs[0].id : null, date: days.find(d => hoursFor(pd(d))) || days[0] };
  const timeOpts = () => { const s = svcById(st.sid), sl = s ? slotsFor(s, st.date) : null; const free = sl ? sl.filter(x => x.free) : []; return free.length ? free.map(x => '<option value="' + x.t + '">' + mm(x.t) + '</option>').join('') : '<option value="">Нет свободного времени</option>'; };
  openModal('<header class="sheet-head"><span class="icon-btn ghost"></span><h2 id="m-title" tabindex="-1">Записать вручную</h2><button class="icon-btn" data-mclose aria-label="Закрыть">' + ico('x') + '</button></header><div class="sheet-body"><form id="man" novalidate><div class="field"><label for="m-svc">Услуга</label><select id="m-svc" class="input">' + svcs.map(s => '<option value="' + s.id + '">' + esc(s.name) + ', ' + priceText(s) + '</option>').join('') + '</select></div><div class="field"><label for="m-date">День</label><select id="m-date" class="input">' + days.map(d => '<option value="' + d + '"' + (d === st.date ? ' selected' : '') + '>' + dayLong(pd(d)) + (hoursFor(pd(d)) ? '' : ' (выходной)') + '</option>').join('') + '</select></div><div class="field"><label for="m-time">Время</label><select id="m-time" class="input">' + timeOpts() + '</select></div><div class="field"><label for="m-name">Имя клиента</label><input id="m-name" class="input" autocomplete="off"><p class="err" id="me-name"></p></div><div class="field"><label for="m-phone">Телефон</label><input id="m-phone" class="input" type="tel" inputmode="tel" placeholder="+7 (___) ___-__-__"><p class="err" id="me-phone"></p></div><button class="btn btn-primary btn-block" type="submit">Записать</button></form></div>', 'card');
  const refresh = () => { st.sid = Number($('#m-svc').value); st.date = $('#m-date').value; $('#m-time').innerHTML = timeOpts(); };
  $('#m-svc').onchange = refresh; $('#m-date').onchange = refresh;
  $('#m-phone').oninput = e => { e.target.value = maskPhone(e.target.value); };
  $('#m-phone').onfocus = e => { if (!e.target.value) e.target.value = '+7'; };
  $('#man').onsubmit = e => {
    e.preventDefault();
    const name = $('#m-name').value.trim(), ph = $('#m-phone').value, tm = $('#m-time').value;
    $('#me-name').textContent = name.length < 2 ? 'Напишите имя.' : '';
    $('#me-phone').textContent = phoneDigits(ph).length !== 10 ? 'Введите номер полностью.' : '';
    if (name.length < 2) { $('#m-name').focus(); return; }
    if (phoneDigits(ph).length !== 10) { $('#m-phone').focus(); return; }
    if (tm === '') { toast('На это время нет свободных мест. Выберите другое.'); return; }
    const s = svcById(st.sid);
    addUserBooking({ id: 'h-' + Date.now().toString(36), date: st.date, start: Number(tm), dur: Math.ceil(s.durationMin / 30) * 30, svc: s.name, price: s.price, priceFrom: !!s.priceFrom, name: name, phone: ph, status: 'new', src: 'manual' });
    closeModal(); OW.tab = 'bookings'; renderOwnerBody(); toast('Запись добавлена');
  };
}

function ownerServices() {
  if (!OW.draft) OW.draft = JSON.parse(JSON.stringify(getServices()));
  const cats = Array.from(new Set(OW.draft.map(s => s.category)));
  const rows = OW.draft.map((s, i) => '<div class="se-row" data-i="' + i + '"><label class="mini se-name"><span>Название</span><input class="input" data-k="name" value="' + esc(s.name) + '"></label><label class="mini"><span>Цена, ₽</span><input class="input" data-k="price" inputmode="numeric" placeholder="по запросу" value="' + (s.price == null ? '' : s.price) + '"></label><label class="mini"><span>Минут</span><input class="input" data-k="durationMin" inputmode="numeric" value="' + s.durationMin + '"></label><label class="mini"><span>Раздел</span><input class="input" data-k="category" list="cats" value="' + esc(s.category) + '"></label><div class="se-flags"><label class="check sm"><input type="checkbox" data-k="priceFrom"' + (s.priceFrom ? ' checked' : '') + '><span class="box" aria-hidden="true">' + ico('check') + '</span><span>«от»</span></label><label class="check sm"><input type="checkbox" data-k="long"' + (s.long ? ' checked' : '') + '><span class="box" aria-hidden="true">' + ico('check') + '</span><span>Долгая</span></label></div><button class="icon-btn danger" data-del="' + i + '" aria-label="Удалить услугу ' + esc(s.name) + '">' + ico('trash') + '</button></div>').join('');
  return '<p class="o-help">Меняйте названия и цены. Пустая цена показывается как «по запросу». Долгая услуга: без выбора времени, клиент оставляет заявку.</p><datalist id="cats">' + cats.map(c => '<option value="' + esc(c) + '">').join('') + '</datalist><div class="se-list">' + rows + '</div><div class="o-actions sticky"><button class="btn btn-ghost" data-sv="add">' + ico('plus') + 'Добавить услугу</button><button class="btn btn-ghost" data-sv="reset">Вернуть исходные</button><button class="btn btn-primary" data-sv="save">Сохранить</button></div>';
}
function ownerSched() {
  if (!OW.sched) OW.sched = JSON.parse(JSON.stringify(getSched()));
  const rows = DK_ORDER.map(k => { const e = OW.sched[k]; return '<div class="sc-row" data-k="' + k + '"><span class="sc-day">' + DN_FULL[k] + '</span><label class="check sm"><input type="checkbox" data-s="open"' + (e.open ? ' checked' : '') + '><span class="box" aria-hidden="true">' + ico('check') + '</span><span>Работаем</span></label><span class="sc-time"><label class="sr" for="sf-' + k + '">Открытие, ' + DN_FULL[k] + '</label><input id="sf-' + k + '" class="input" type="time" step="1800" data-s="from" value="' + e.from + '"' + (e.open ? '' : ' disabled') + '><span aria-hidden="true">–</span><label class="sr" for="st-' + k + '">Закрытие, ' + DN_FULL[k] + '</label><input id="st-' + k + '" class="input" type="time" step="1800" data-s="to" value="' + e.to + '"' + (e.open ? '' : ' disabled') + '></span></div>'; }).join('');
  const rc = resCount();
  return '<p class="o-help">От графика зависят свободные окна на сайте. Время ставьте с шагом 30 минут.</p><div class="sc-list">' + rows + '</div><div class="field res"><label for="res-n">' + SK.resTitle + '</label><input id="res-n" class="input" type="number" min="1" max="20" value="' + rc + '"></div><div class="o-actions sticky"><button class="btn btn-ghost" data-sc="reset">Вернуть исходный</button><button class="btn btn-primary" data-sc="save">Сохранить</button></div>';
}
function wireOwner() {
  const root = $('#app');
  root.addEventListener('click', e => {
    if (view !== 'owner') return;
    const t = e.target; let el;
    if ((el = t.closest('[data-tab]'))) { OW.tab = el.dataset.tab; renderOwnerBody(); return; }
    if ((el = t.closest('[data-range]'))) { OW.range = el.dataset.range; OW.rangeSet = true; renderOwnerBody('[data-range="' + OW.range + '"]'); return; }
    if ((el = t.closest('[data-bk]'))) { openBookingCard(el.dataset.bk, el.dataset.d); return; }
    if ((el = t.closest('[data-o]'))) { if (el.dataset.o === 'logout') { try { sessionStorage.removeItem(B.slug + ':fd:auth'); } catch (er) { /* ignore */ } showOwner(); } else if (el.dataset.o === 'manual') openManual(); return; }
    if ((el = t.closest('[data-del]'))) { const i = Number(el.dataset.del); if (OW.draft.length <= 1) { toast('Должна остаться хотя бы одна услуга.'); return; } OW.draft.splice(i, 1); renderOwnerBody(); toast('Услуга убрана. Нажмите «Сохранить».'); return; }
    if ((el = t.closest('[data-sv]'))) {
      const a = el.dataset.sv;
      if (a === 'add') { const id = Math.max.apply(null, OW.draft.map(s => s.id)) + 1; OW.draft.push({ id: id, name: 'Новая услуга', price: null, priceFrom: false, durationMin: 60, long: false, category: OW.draft[0].category }); renderOwnerBody(); const rows = $$('.se-row'); const last = rows[rows.length - 1]; last.scrollIntoView({ block: 'center' }); $('input', last).select(); }
      else if (a === 'reset') { LS.del('services'); OW.draft = null; renderOwnerBody(); toast('Вернули исходные услуги'); }
      else if (a === 'save') {
        const bad = OW.draft.findIndex(s => !s.name.trim() || !(s.durationMin >= 5));
        if (bad >= 0) { toast('Проверьте строку ' + (bad + 1) + ': нужны название и длительность от 5 минут.'); const r = $$('.se-row')[bad]; r.scrollIntoView({ block: 'center' }); $('input', r).focus(); return; }
        LS.set('services', OW.draft); toast('Сохранено. На сайте уже новые цены.');
      }
      return;
    }
    if ((el = t.closest('[data-sc]'))) {
      if (el.dataset.sc === 'reset') { LS.del('sched'); LS.del('res'); OW.sched = null; mockCache = {}; renderOwnerBody(); toast('Вернули исходный график'); }
      else {
        const bad = DK_ORDER.find(k => OW.sched[k].open && toMin(OW.sched[k].to) <= toMin(OW.sched[k].from));
        if (bad) { toast(DN_FULL[bad] + ': закрытие должно быть позже открытия.'); return; }
        const n = Number($('#res-n').value); if (!(n >= 1 && n <= 20)) { toast('Число: от 1 до 20.'); $('#res-n').focus(); return; }
        LS.set('sched', OW.sched); LS.set('res', n); mockCache = {}; toast('График сохранён');
      }
    }
  });
  root.addEventListener('input', e => {
    if (view !== 'owner') return;
    const row = e.target.closest('.se-row'), t = e.target;
    if (row && t.dataset.k) {
      const s = OW.draft[Number(row.dataset.i)], k = t.dataset.k;
      if (k === 'price') { const v = t.value.replace(/\D/g, ''); t.value = v; s.price = v === '' ? null : Number(v); }
      else if (k === 'durationMin') { const v = t.value.replace(/\D/g, ''); t.value = v; s.durationMin = v === '' ? 0 : Number(v); }
      else if (k === 'priceFrom' || k === 'long') s[k] = t.checked;
      else s[k] = t.value;
    }
  });
  root.addEventListener('change', e => {
    if (view !== 'owner') return;
    const t = e.target, sc = t.closest('.sc-row');
    if (sc && t.dataset.s) {
      const e2 = OW.sched[sc.dataset.k];
      if (t.dataset.s === 'open') { e2.open = t.checked; $$('input[type=time]', sc).forEach(i => { i.disabled = !t.checked; }); }
      else e2[t.dataset.s] = t.value || e2[t.dataset.s];
    }
  });
}

/* ---------- запуск ---------- */
function boot() {
  document.title = B.name + ': онлайн-запись';
  wireSheet(); wireModal(); wireOwner();
  window.addEventListener('hashchange', route);
  route();
}

boot();
})();
