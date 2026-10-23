// Сборка сайта клиента: node _template/build.mjs <slug>
// Читает clients/<slug>/client.json, пишет готовый сайт в clients/<slug>/site/.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { render } from './render.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const slug = process.argv[2];
if (!slug) { console.error('Укажи клиента: node _template/build.mjs <slug>'); process.exit(1); }

const clientDir = join(root, 'clients', slug);
const client = JSON.parse(readFileSync(join(clientDir, 'client.json'), 'utf8'));
const out = join(clientDir, 'site');
const photosDir = join(clientDir, client.photosDir || 'photos-2gis');

rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, 'img'), { recursive: true });

const used = new Set();
const photo = file => {
  if (!existsSync(join(photosDir, file))) throw new Error(`Нет фото: ${file}`);
  used.add(file);
  return `img/${file}`;
};

writeFileSync(join(out, 'index.html'), render(client, { photo }));
copyFileSync(join(root, '_template', 'styles.css'), join(out, 'styles.css'));
for (const f of used) copyFileSync(join(photosDir, f), join(out, 'img', f));

console.log(`Готово: clients/${slug}/site/ (фото: ${used.size})`);
