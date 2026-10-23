// Снимает данные фирмы из 2ГИС: node _template/fetch-2gis.mjs <ссылка на 2ГИС> <slug>
// Пишет clients/<slug>/facts-2gis.json (компактные факты) и скачивает фото в clients/<slug>/photos-2gis/.
// Всё берётся из данных самой страницы и API 2ГИС, без догадок. Это источник правды для агентов.
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const [url, slug] = process.argv.slice(2);
if (!url || !slug) { console.error('Использование: node _template/fetch-2gis.mjs <ссылка 2ГИС> <slug>'); process.exit(1); }

const id = url.match(/firm\/(\d+)/)?.[1];
const city = url.match(/2gis\.ru\/([^/]+)\//)?.[1];
if (!id || !city) { console.error('В ссылке не найден firm/<id>'); process.exit(1); }

const UA = { 'User-Agent': 'Mozilla/5.0' }; // с полным UA браузера 2ГИС отдаёт заглушку
const get = async u => { const r = await fetch(u, { headers: UA }); if (!r.ok) throw new Error(`${r.status} ${u}`); return r.text(); };

// initialState лежит в странице как JS-строка: JSON.parse('...')
function readState(html) {
  const m = html.match(/initialState = JSON\.parse\('([\s\S]*?)'\);/);
  if (!m) throw new Error('initialState не найден');
  const s = m[1].replace(/\\(u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|[\s\S])/g, (_, e) =>
    e[0] === 'u' || e[0] === 'x' ? String.fromCharCode(parseInt(e.slice(1), 16)) : ({ n: '\n', t: '\t', r: '\r' }[e] ?? e));
  return JSON.parse(s);
}

const firmUrl = `https://2gis.ru/${city}/firm/${id}`;
const firmHtml = await get(firmUrl);
const p = readState(firmHtml).data.entity.profile[id].data;

// --- Прайс (2ГИС отдаёт без JS не больше 50 позиций)
const market = readState(await get(`${firmUrl}/tab/prices`)).data.market || {};
const products = Object.values(market.products || {}).map(x => x.data?.product).filter(Boolean);
const offers = Object.values(market.offers || {}).map(x => x.data).filter(Boolean);
const prices = products.map(pr => ({
  name: pr.name,
  price: offers.find(o => o.productId === pr.id)?.price ?? null,
  category: pr.categories?.[0]?.name ?? null,
}));

// --- Отзывы: API отзывов, ключ берём со страницы
const reviewKey = firmHtml.match(/reviewApiKey":"([^"]+)"/)?.[1];
let reviews = { error: 'ключ API отзывов не найден' };
if (reviewKey) {
  const j = await fetch(`https://public-api.reviews.2gis.com/2.0/branches/${id}/reviews?limit=50&is_advertiser=false&fields=meta.branch_rating,meta.total_count,reviews.is_verified&rated=true&sort_by=date_created&key=${reviewKey}&locale=ru_RU`, { headers: UA }).then(r => r.json());
  reviews = {
    rating: j.meta?.branch_rating, total: j.meta?.total_count,
    items: (j.reviews || []).map(r => ({ author: r.user?.name, rating: r.rating, date: r.date_created?.slice(0, 10), verified: r.is_verified, text: r.text })),
  };
}

// --- Фото: публичный API галереи, которым пользуется сам сайт 2ГИС
const photoKey = firmHtml.match(/api\.photo\.2gis\.com[^"']*key=([A-Za-z0-9]+)/)?.[1] || 'gYu1s9N1wP';
const media = await fetch(`https://api.photo.2gis.com/3.0/objects/${id}/albums/all/media?key=${photoKey}&page_size=50&locale=ru_RU`, { headers: UA }).then(r => r.json()).catch(() => ({ items: [] }));
const photos = (media.items || []).filter(i => i.media_type === 'photo' && i.photo?.url);

const outDir = join(root, 'clients', slug);
const photosDir = join(outDir, 'photos-2gis');
mkdirSync(photosDir, { recursive: true });
const photoList = [];
for (const [i, ph] of photos.entries()) {
  const by = ph.copyright?.code === '2gis_owner' ? 'owner' : 'user';
  const file = `${by}-${String(i + 1).padStart(2, '0')}.jpg`;
  writeFileSync(join(photosDir, file), Buffer.from(await (await fetch(ph.photo.url, { headers: UA })).arrayBuffer()));
  photoList.push({ file, by, url: ph.photo.url });
}

const contacts = (p.contact_groups || []).flatMap(g => g.contacts).map(c => ({ type: c.type, value: c.value, text: c.text }));
const facts = {
  source: firmUrl,
  fetched: new Date().toISOString().slice(0, 10),
  name: p.name_ex?.primary ?? p.name,
  nameFull: p.name,
  rubrics: (p.rubrics || []).map(r => r.name),
  address: p.address_name,
  district: (p.adm_div || []).find(a => a.type === 'district')?.name ?? null,
  city: (p.adm_div || []).find(a => a.type === 'city')?.name ?? null,
  point: p.point,
  schedule: p.schedule,
  contacts,
  attributes: (p.attribute_groups || []).map(g => ({ group: g.name, items: g.attributes.map(a => a.name) })),
  reviews,
  prices,
  pricesNote: 'Без JS 2ГИС отдаёт не больше 50 позиций. Цены 100 ₽ обычно заглушки.',
  photos: photoList,
};
writeFileSync(join(outDir, 'facts-2gis.json'), JSON.stringify(facts, null, 2));
console.log(`Готово: clients/${slug}/facts-2gis.json`);
console.log(`${facts.name} · отзывов ${reviews.items?.length ?? 0} · цен ${prices.length} · фото ${photoList.length} (владелец ${photoList.filter(x => x.by === 'owner').length})`);
