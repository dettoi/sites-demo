// Локальный просмотр: node _template/serve.mjs [slug] [порт]
// Со slug — один сайт в корне. Без slug — все клиенты: http://localhost:4321/<slug>/
import { createServer } from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { join, extname, dirname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const slug = process.argv[2] && process.argv[2] !== 'all' ? process.argv[2] : null;
const port = Number(process.argv[3] || 4321);
const clients = join(root, 'clients');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp' };

// /<slug>/путь → clients/<slug>/site/путь
function resolve(urlPath) {
  const rel = normalize(decodeURIComponent(urlPath)).replace(/^([/\\])+/, '');
  if (slug) return join(clients, slug, 'site', rel || 'index.html');
  const [name, ...rest] = rel.split(/[/\\]/);
  if (!name) return null;
  return join(clients, name, 'site', rest.join('/') || 'index.html');
}

createServer(async (req, res) => {
  const path = req.url.split('?')[0];
  try {
    if (!slug && path === '/') {
      const list = (await readdir(clients)).filter(n => !n.startsWith('_'));
      res.writeHead(200, { 'Content-Type': types['.html'] });
      return res.end(`<meta charset="utf-8"><body style="font:16px system-ui;background:#0f1214;color:#e7ecef;padding:24px"><h1>Сайты</h1>${list.map(n => `<p><a style="color:#d9773a" href="/${n}/">${n}</a></p>`).join('')}`);
    }
    if (!slug && !/^\/[^/]+\//.test(path)) { res.writeHead(301, { Location: path + '/' }); return res.end(); }
    const file = resolve(path);
    if (!file || !file.startsWith(clients)) throw new Error('outside');
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404); res.end('Not found');
  }
}).listen(port, () => console.log(slug ? `http://localhost:${port} → clients/${slug}/site` : `http://localhost:${port} → все клиенты`));
