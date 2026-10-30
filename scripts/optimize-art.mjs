import { chromium } from 'playwright-core';
import { readdir, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
const origin = process.env.LMU_CAPTURE_ORIGIN || 'http://127.0.0.1:4175',
  browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage();
const manifest = {};
let before = 0,
  after = 0;
await mkdir('static/art/optimized', { recursive: true });
try {
  await page.goto(origin);
  for (const category of ['items', 'badge-icons', 'icones', 'companions-v2'])
    for (const file of await readdir('static/art/' + category)) {
      if (
        !file.endsWith('.png') &&
        !(category === 'companions-v2' && /-[1-3]\.webp$/.test(file))
      )
        continue;
      const src = '/art/' + category + '/' + file,
        key = category + '-' + file.replace(/\.[^.]+$/, '');
      const variants = {};
      for (const width of [160, 320]) {
        const encoded = await page.evaluate(
          async ({ src, width }) => {
            const response = await fetch(src);
            if (!response.ok) throw new Error(src);
            const blob = await response.blob();
            const image = await createImageBitmap(blob);
            const canvas = document.createElement('canvas');
            canvas.width = Math.min(width, image.width);
            canvas.height = Math.round(
              (image.height * canvas.width) / image.width,
            );
            canvas
              .getContext('2d')
              .drawImage(image, 0, 0, canvas.width, canvas.height);
            return {
              base64: canvas.toDataURL('image/webp', 0.84).split(',')[1],
              originalBytes: blob.size,
            };
          },
          { src, width },
        );
        const buffer = Buffer.from(encoded.base64, 'base64'),
          target =
            category === 'companions-v2'
              ? '/art/companions-v2/' +
                file.replace(/\.[^.]+$/, '') +
                '-' +
                width +
                '.webp'
              : '/art/optimized/' + key + '-' + width + '.webp';
        await writeFile(resolve('static' + target), buffer);
        variants[width] = target;
        after += buffer.length;
        if (width === 160) before += encoded.originalBytes;
      }
      manifest[src] = variants;
    }
} finally {
  await browser.close();
}
await writeFile(
  'src/lib/content/artVariants.json',
  JSON.stringify(manifest, null, 2),
);
console.log(
  JSON.stringify({
    images: Object.keys(manifest).length,
    originalBytes: before,
    variantBytes: after,
  }),
);
