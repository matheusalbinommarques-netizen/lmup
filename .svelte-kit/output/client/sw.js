if (!self.define) {
  let e,
    i = {};
  const s = (s, a) => (
    (s = new URL(s + '.js', a).href),
    i[s] ||
      new Promise((i) => {
        if ('document' in self) {
          const e = document.createElement('script');
          ((e.src = s), (e.onload = i), document.head.appendChild(e));
        } else ((e = s), importScripts(s), i());
      }).then(() => {
        let e = i[s];
        if (!e) throw new Error(`Module ${s} didn’t register its module`);
        return e;
      })
  );
  self.define = (a, b) => {
    const d =
      e ||
      ('document' in self ? document.currentScript.src : '') ||
      location.href;
    if (i[d]) return;
    let r = {};
    const c = (e) => s(e, d),
      n = { module: { uri: d }, exports: r, require: c };
    i[d] = Promise.all(a.map((e) => n[e] || c(e))).then((e) => (b(...e), r));
  };
}
define(['./workbox-5ffe50d4'], function (e) {
  'use strict';
  (self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        {
          url: '_app/immutable/assets/0.Bj5vy2FL.css',
          revision: '05593010d105c834732c85d944741e53',
        },
        {
          url: '_app/immutable/assets/2.rdC8a2QM.css',
          revision: 'b5fd05296409e6928be1e542d597b7d6',
        },
        {
          url: '_app/immutable/chunks/1pLQ6qVO.js',
          revision: '9495f6b581be906729b1bed163dd191e',
        },
        {
          url: '_app/immutable/chunks/B0vhlS2c.js',
          revision: '9d551aa83472acca462e5509f447f70e',
        },
        {
          url: '_app/immutable/chunks/B5L0ib5B.js',
          revision: 'bd389e907ffa8dc3dd9f97c007f85009',
        },
        {
          url: '_app/immutable/chunks/B9t7ERLA.js',
          revision: 'b8da2d62afe7d8fcb18b473e912544aa',
        },
        {
          url: '_app/immutable/chunks/bGr8mffb.js',
          revision: '77ddf714785ff3ed1d1013c115cb8146',
        },
        {
          url: '_app/immutable/chunks/CFHu8sXB.js',
          revision: '52aa4f864514b8beff0b7dbb748081f8',
        },
        {
          url: '_app/immutable/chunks/CKhwVIJ_.js',
          revision: 'df0f66b531134508f945b58df9035a70',
        },
        {
          url: '_app/immutable/chunks/CmYDCv5e.js',
          revision: '0e2b5d8ac05cee68b089a43cdbbb6e00',
        },
        {
          url: '_app/immutable/chunks/CrojtzO5.js',
          revision: 'bbd209ec95925203dbd82d09100c05d8',
        },
        {
          url: '_app/immutable/chunks/CTOClj_W.js',
          revision: '852b4f7bd52d26613906f3a8b7583ba5',
        },
        {
          url: '_app/immutable/chunks/DYDdMpkw.js',
          revision: 'ce1c6a3754ebe50e40f6383c9d4f28d2',
        },
        {
          url: '_app/immutable/chunks/E1N5lFGC.js',
          revision: 'fcea7638426945c5b6bd298deed330e3',
        },
        {
          url: '_app/immutable/chunks/v1vEHNqM.js',
          revision: '8fdfe6651a883aef779dfce4bf1c7cc7',
        },
        {
          url: '_app/immutable/entry/app.DSc_MQZe.js',
          revision: 'c1a848fc52ea44513d703ac9efdd217b',
        },
        {
          url: '_app/immutable/entry/start.Bws3ROcZ.js',
          revision: '57b00e9dcc01e72f1a29f1c40d158e6c',
        },
        {
          url: '_app/immutable/nodes/0.BIzLJ6Uh.js',
          revision: '54ca3914817241c5950da6d37d675224',
        },
        {
          url: '_app/immutable/nodes/1.BnHWND9x.js',
          revision: 'e617f41f35d45b84b23690c334c00e0f',
        },
        {
          url: '_app/immutable/nodes/2.Bysll3dT.js',
          revision: '198f74e1a134e6e9f6cba1b2324b6fe9',
        },
        {
          url: '_app/immutable/nodes/3.Diz163We.js',
          revision: '059a019f19bb105b033167d4bd293673',
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
