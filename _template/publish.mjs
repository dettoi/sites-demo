// Сборка всех клиентов в docs/ для GitHub Pages: node _template/publish.mjs
import { readdirSync, existsSync, rmSync, mkdirSync, cpSync, writeFileSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const docs = join(root, 'docs');
const slugs = readdirSync(join(root, 'clients')).filter(s => !s.startsWith('_') && existsSync(join(root, 'clients', s, 'client.json')));

rmSync(docs, { recursive: true, force: true });
mkdirSync(docs);
for (const s of slugs) {
  execFileSync('node', [join(root, '_template', 'build.mjs'), s], { stdio: 'inherit' });
  cpSync(join(root, 'clients', s, 'site'), join(docs, s), { recursive: true });
}

const names = slugs.map(s => [s, JSON.parse(readFileSync(join(root, 'clients', s, 'client.json'), 'utf8')).brand.name]);
writeFileSync(join(docs, 'index.html'), `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Демо-сайты</title>
<body style="font:16px system-ui;background:#0f1214;color:#e7ecef;padding:24px;max-width:640px;margin:auto"><h1>Демо-сайты автосервисов</h1>
${names.map(([s, n]) => `<p><a style="color:#d9773a" href="${s}/">${n}</a></p>`).join('\n')}</body>`);
writeFileSync(join(docs, '.nojekyll'), '');
console.log(`docs/ готова: ${slugs.length} сайтов`);
