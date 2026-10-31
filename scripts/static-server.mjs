import { createReadStream } from 'node:fs';
import { stat, readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, isAbsolute, relative, resolve, join } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { publishedBuilds } from './local-release-store.mjs';
import { createHash } from 'node:crypto';

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.wasm': 'application/wasm',
};

// Only expose an allowlisted, bounded summary; never return local paths, credentials or logs.
async function syncSummary(publicationRoot) {
  try {
    const raw = await readFile(join(publicationRoot, 'sync-status.json'), 'utf8');
    if (raw.length > 16384) return null;
    const status = JSON.parse(raw);
    const safe = (value, max = 160) =>
      typeof value === 'string' ? value.slice(0, max) : null;
    const states = ['current', 'published', 'waiting', 'paused', 'error'];
    return {
      state: states.includes(status.state) ? status.state : 'unknown',
      commit: /^[a-f0-9]{40}$/.test(status.commit ?? '') ? status.commit : null,
      version: /^[a-f0-9]{16}$/.test(status.version ?? '') ? status.version : null,
      checkedAt: Number.isFinite(Date.parse(status.checkedAt)) ? status.checkedAt : null,
      reason: safe(status.reason),
      message: status.state === 'error' ? 'A sincronização encontrou um erro. Consulte o diagnóstico local.' : null,
    };
  } catch {
    return null;
  }
}

export function createStaticServer({ root, publicationRoot }) {
  return createServer(async (request, response) => {
    try {
      if (!['GET', 'HEAD'].includes(request.method ?? '')) {
        response.writeHead(405).end();
        return;
      }
      const pathname = decodeURIComponent(
        new URL(request.url ?? '/', 'http://localhost').pathname,
      );
      const releases = publicationRoot
        ? await publishedBuilds(publicationRoot)
        : [];
      if (publicationRoot && pathname === '/__lmup/status') {
        response.writeHead(200, {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        });
        response.end(
          request.method === 'HEAD'
            ? undefined
            : JSON.stringify({
                service: 'lmup-local-publications',
                installation: createHash('sha256')
                  .update(resolve(publicationRoot))
                  .digest('hex'),
                version: releases[0]?.version ?? null,
                commit: releases[0]?.source?.commit ?? null,
                sync: await syncSummary(publicationRoot),
              }),
        );
        return;
      }
      const selected = releases[0]?.build ?? root;
      const requested = resolve(selected, `.${pathname}`),
        within = relative(selected, requested);
      if (within.startsWith('..') || isAbsolute(within)) {
        response.writeHead(403).end();
        return;
      }
      const candidates = [
        requested,
        `${requested}.html`,
        resolve(requested, 'index.html'),
      ];
      // Keep old immutable chunks available while an already-open app finishes updating.
      if (pathname.startsWith('/_app/immutable/'))
        for (const previous of releases.slice(1))
          candidates.push(resolve(previous.build, `.${pathname}`));
      let file, metadata;
      for (const candidate of candidates) {
        const info = await stat(candidate).catch(() => null);
        if (info?.isFile()) {
          file = candidate;
          metadata = info;
          break;
        }
      }
      if (!file && request.headers.accept?.includes('text/html')) {
        file = resolve(selected, '200.html');
        metadata = await stat(file);
      }
      if (!file) {
        response.writeHead(404).end();
        return;
      }
      response.writeHead(200, {
        'Content-Type': types[extname(file)] ?? 'application/octet-stream',
        'Content-Length': metadata.size,
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        ...(releases[0] ? { 'X-LMU-Release': releases[0].version } : {}),
      });
      if (request.method === 'HEAD') response.end();
      else await pipeline(createReadStream(file), response);
    } catch {
      if (!response.headersSent) response.writeHead(503);
      response.end();
    }
  });
}
