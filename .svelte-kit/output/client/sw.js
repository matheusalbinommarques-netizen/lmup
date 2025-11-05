if (!self.define) {
  let e,
    a = {};
  const i = (i, s) => (
    (i = new URL(i + '.js', s).href),
    a[i] ||
      new Promise((a) => {
        if ('document' in self) {
          const e = document.createElement('script');
          ((e.src = i), (e.onload = a), document.head.appendChild(e));
        } else ((e = i), importScripts(i), a());
      }).then(() => {
        let e = a[i];
        if (!e) throw new Error(`Module ${i} didn’t register its module`);
        return e;
      })
  );
  self.define = (s, c) => {
    const b =
      e ||
      ('document' in self ? document.currentScript.src : '') ||
      location.href;
    if (a[b]) return;
    let r = {};
    const d = (e) => i(e, b),
      n = { module: { uri: b }, exports: r, require: d };
    a[b] = Promise.all(s.map((e) => n[e] || d(e))).then((e) => (c(...e), r));
  };
}
define(['./workbox-5ffe50d4'], function (e) {
  'use strict';
  (self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        {
          url: '_app/immutable/assets/0.AIJQZlMW.css',
          revision: 'c577ae9f24606c0a5f63674d8424737d',
        },
        {
          url: '_app/immutable/chunks/-JVijWqR.js',
          revision: '20aacfc089247ebe1620d71f8e0ad268',
        },
        {
          url: '_app/immutable/chunks/aewavrDc.js',
          revision: 'c9552414b5a5d2b2fbdd13abf92b13b8',
        },
        {
          url: '_app/immutable/chunks/BYSpO852.js',
          revision: '7cd854b45b43e40e0f733d630a751215',
        },
        {
          url: '_app/immutable/chunks/Cowx68EC.js',
          revision: 'aadde0def4661872b9a8ebb40de76c78',
        },
        {
          url: '_app/immutable/chunks/DgxGOAFj.js',
          revision: '978d4eae8b361d3dc94ec154606be2c8',
        },
        {
          url: '_app/immutable/chunks/DJoSvvfp.js',
          revision: '3d14379fbc7258f483b014851cb829bd',
        },
        {
          url: '_app/immutable/chunks/DQqdkiKC.js',
          revision: 'a58875238e051ac1db9db35a194917be',
        },
        {
          url: '_app/immutable/chunks/f0HoYL7i.js',
          revision: 'f4d72d41a8945a22fb160fd396d461f8',
        },
        {
          url: '_app/immutable/chunks/PPVm8Dsz.js',
          revision: '84c8f5ebd14029ddeab0ab100c464899',
        },
        {
          url: '_app/immutable/chunks/qHFclJgu.js',
          revision: '06d968bdbb63b9aeb368ba4329dfd0a1',
        },
        {
          url: '_app/immutable/chunks/vGAHndma.js',
          revision: 'd77802a2c79ebaa11cc431aee0c3edda',
        },
        {
          url: '_app/immutable/chunks/ViNRIw49.js',
          revision: '34fe38b063bc271ec876d5100a1c6495',
        },
        {
          url: '_app/immutable/entry/app.dzTZqTAn.js',
          revision: 'ad47f26a35e3d8c6f80ec84027511195',
        },
        {
          url: '_app/immutable/entry/start.CYr-AuWh.js',
          revision: '73571c21235f7f3abb40063bbc22c414',
        },
        {
          url: '_app/immutable/nodes/0.LNoU-XZ0.js',
          revision: '48f32de0c9ccf1ee69f0e7a839f38920',
        },
        {
          url: '_app/immutable/nodes/1.DCuDBtxX.js',
          revision: '60ef4191b53227dc6eeff0a99fa56971',
        },
        {
          url: '_app/immutable/nodes/2.iN65js4Z.js',
          revision: 'ac3c55cd2c852ad70b5a0f351c0c8cad',
        },
        {
          url: '_app/immutable/nodes/3.BRLvbiP7.js',
          revision: 'd7522f433f32880935cb5b14e93b6fd6',
        },
        { url: 'registerSW.js', revision: '402b66900e731ca748771b6fc5e7a068' },
        {
          url: 'favicon-shield.ico',
          revision: 'f4a68abddd7e3f1219393c77048a8165',
        },
        {
          url: 'pwa-192x192.png',
          revision: '30bfec9f008aeb4af77af32293f4a33e',
        },
        {
          url: 'pwa-512x512-maskable.png',
          revision: 'b10eebcd29a4efee197620de507f0cd4',
        },
        {
          url: 'pwa-512x512.png',
          revision: '9346db4c1df64590a0b237912534e9dd',
        },
        {
          url: 'manifest.webmanifest',
          revision: '8c5232c455570dbfbcb3d1ba34f63102',
        },
      ],
      {},
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      new e.NavigationRoute(e.createHandlerBoundToURL('index.html')),
    ));
});
