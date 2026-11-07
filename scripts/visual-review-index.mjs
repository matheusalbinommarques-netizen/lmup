// Build an offline, self-contained image gallery from screenshot artifacts.
// Paths are fixed by the visual tests; no personal profile or browser storage is read.
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = 'visual-review';
await mkdir(root, { recursive: true });

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

const photos = [];
for (const dir of await readdir(root, { withFileTypes: true })) {
  if (!dir.isDirectory()) continue;
  for (const filename of (await readdir(join(root, dir.name))).sort()) {
    if (!filename.endsWith('.png')) continue;
    const imagePath = dir.name + '/' + filename;
    const jsonPath = join(root, dir.name, filename.replace(/\.png$/, '.json'));
    const metadata = await readFile(jsonPath, 'utf8')
      .then((content) => JSON.parse(content))
      .catch(() => ({ warning: 'Metadados indisponíveis' }));
    photos.push({ imagePath, viewport: dir.name, metadata });
  }
}
const manifest = {
  repositorySha: process.env.GITHUB_SHA ?? null,
  branch: process.env.GITHUB_REF_NAME ?? null,
  scope: process.env.LMU_VISUAL_SCOPE ?? 'world',
  images: photos,
};
await writeFile(join(root, 'manifest.json'), JSON.stringify(manifest, null, 2));

const cards = photos
  .map(({ imagePath, viewport, metadata }) => {
    const issues = [];
    if (metadata.horizontalOverflowPx > 1)
      issues.push('Transbordo horizontal: ' + metadata.horizontalOverflowPx + ' px');
    if (metadata.brokenImages?.length)
      issues.push('Imagens com erro: ' + metadata.brokenImages.length);
    const src = imagePath.split('/').map(encodeURIComponent).join('/');
    return `<article><h2>${escapeHtml(viewport)} · ${escapeHtml(metadata.scene ?? imagePath)}</h2>
      <p>${escapeHtml(metadata.path ?? '')}</p>
      <a href="${src}"><img src="${src}" loading="lazy" alt="${escapeHtml(imagePath)}"></a>
      <p>${escapeHtml(issues.length ? issues.join(' · ') : 'Sem alertas automáticos de imagem ou largura')}</p>
    </article>`;
  })
  .join('\n');
const html = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>LMUP · Revisão visual</title>
<style>body{background:#101a1c;color:#e8e7d7;font:15px/1.5 system-ui;margin:0;padding:24px}
h1{font-size:28px}p{color:#bdc7be}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,390px),1fr));gap:20px}
article{padding:16px;border:1px solid #5b685f;border-radius:12px;min-width:0;background:#162327}
article h2{font-size:17px;margin:0}img{width:100%;height:auto;border:1px solid #52645d;border-radius:6px}
a{display:block}small{color:#bbcbbf}</style></head>
<body><h1>LMUP · Revisão visual</h1><p>${photos.length} capturas · escopo ${escapeHtml(manifest.scope)}
· revisão ${escapeHtml(manifest.repositorySha ?? 'local')}</p>
<p>As imagens são capturas isoladas, não aprovações visuais automáticas. Clique para ampliar.
Metadados completos em <code>manifest.json</code>.</p>
<main>${cards || '<p>Nenhuma captura foi gerada. Verifique o log do job.</p>'}</main></body></html>`;
await writeFile(join(root, 'index.html'), html);
console.log('Galeria gerada:', photos.length, 'capturas em', root);
