import fs from 'node:fs/promises';
import path from 'node:path';

const startUrls = [
  'https://www.dracihlidka.cz/',
  'https://www.dracihlidka.cz/pravidla',
  'https://www.dracihlidka.cz/o-projektu',
  'https://www.dracihlidka.cz/ke-stazeni'
];

const outDir = 'research/drh_assets/raw';
const metaDir = 'research/drh_assets/meta';
const allowHosts = new Set(['www.dracihlidka.cz','dracihlidka.cz']);
const assetExt = new Set(['.png','.jpg','.jpeg','.webp','.gif','.svg','.ico','.woff','.woff2','.ttf','.otf','.eot','.css']);

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
};

await fs.mkdir(outDir, { recursive: true });
await fs.mkdir(metaDir, { recursive: true });

const downloaded = new Set();
const cssQueue = [];
const manifest = [];

function toSafeName(urlStr) {
  const u = new URL(urlStr);
  let p = u.pathname.replace(/^\/+/, '') || 'index';
  p = p.replace(/[\\/:*?"<>|]/g, '_');
  const q = (u.search || '').replace(/^\?/, '').replace(/[\\/:*?"<>|&=]/g, '_');
  return q ? `${p}__${q}` : p;
}

function normalizeUrl(raw, base) {
  if (!raw) return null;
  const r = String(raw).trim().replace(/^['"]|['"]$/g, '');
  if (!r || r.startsWith('data:') || r.startsWith('mailto:') || r.startsWith('javascript:')) return null;
  try {
    const u = new URL(r, base);
    if (!allowHosts.has(u.host)) return null;
    u.hash = '';
    return u.toString();
  } catch {
    return null;
  }
}

function extractRefs(text) {
  const out = [];
  const attrRe = /(?:src|href)\s*=\s*["']([^"'#>]+)["']/gi;
  const urlRe = /url\(([^)]+)\)/gi;
  let m;
  while ((m = attrRe.exec(text))) out.push(m[1]);
  while ((m = urlRe.exec(text))) out.push(m[1]);
  return out;
}

async function fetchText(url) {
  const res = await fetch(url, { headers, redirect: 'follow' });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return await res.text();
}

async function fetchBin(url) {
  const res = await fetch(url, { headers, redirect: 'follow' });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const ab = await res.arrayBuffer();
  return Buffer.from(ab);
}

for (const start of startUrls) {
  try {
    const html = await fetchText(start);
    const file = path.join(outDir, `page_${toSafeName(start)}.html`);
    await fs.writeFile(file, html, 'utf8');
    manifest.push({ type: 'page', source: start, file });

    for (const ref of extractRefs(html)) {
      const abs = normalizeUrl(ref, start);
      if (!abs || downloaded.has(abs)) continue;
      const ext = path.extname(new URL(abs).pathname).toLowerCase();
      if (ext === '.css') {
        downloaded.add(abs);
        cssQueue.push(abs);
      } else if (assetExt.has(ext)) {
        downloaded.add(abs);
        try {
          const buf = await fetchBin(abs);
          const file2 = path.join(outDir, `asset_${toSafeName(abs)}`);
          await fs.writeFile(file2, buf);
          manifest.push({ type: 'asset', source: abs, file: file2 });
        } catch {}
      }
    }
  } catch {}
}

while (cssQueue.length) {
  const cssUrl = cssQueue.shift();
  try {
    const css = await fetchText(cssUrl);
    const file = path.join(outDir, `css_${toSafeName(cssUrl)}`);
    await fs.writeFile(file, css, 'utf8');
    manifest.push({ type: 'css', source: cssUrl, file });

    for (const ref of extractRefs(css)) {
      const abs = normalizeUrl(ref, cssUrl);
      if (!abs || downloaded.has(abs)) continue;
      const ext = path.extname(new URL(abs).pathname).toLowerCase();
      if (ext === '.css') {
        downloaded.add(abs);
        cssQueue.push(abs);
      } else if (assetExt.has(ext)) {
        downloaded.add(abs);
        try {
          const buf = await fetchBin(abs);
          const file2 = path.join(outDir, `asset_${toSafeName(abs)}`);
          await fs.writeFile(file2, buf);
          manifest.push({ type: 'asset', source: abs, file: file2 });
        } catch {}
      }
    }
  } catch {}
}

const manifestPath = path.join(metaDir, 'manifest.json');
await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

const summary = {
  pages: manifest.filter(x => x.type === 'page').length,
  css: manifest.filter(x => x.type === 'css').length,
  assets: manifest.filter(x => x.type === 'asset').length,
  manifest: manifestPath
};
console.log(JSON.stringify(summary, null, 2));
