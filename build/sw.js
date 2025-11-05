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
    const r =
      e ||
      ('document' in self ? document.currentScript.src : '') ||
      location.href;
    if (a[r]) return;
    let f = {};
    const n = (e) => i(e, r),
      b = { module: { uri: r }, exports: f, require: n };
    a[r] = Promise.all(s.map((e) => b[e] || n(e))).then((e) => (c(...e), f));
  };
}
define(['./workbox-5ffe50d4'], function (e) {
  'use strict';
  (self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        {
          url: '_app/immutable/assets/0.Ca4sUYCK.css',
          revision: '25aa9caeca60d55f9ffc44e5be9b6890',
        },
        {
          url: '_app/immutable/assets/BottomNav.tn0RQdqM.css',
          revision: 'd41d8cd98f00b204e9800998ecf8427e',
        },
        {
          url: '_app/immutable/chunks/5aiaHk4R.js',
          revision: '078cf48a19ae47a2b14b894b22690835',
        },
        {
          url: '_app/immutable/chunks/B0aBMHRA.js',
          revision: 'b278935c7ad79da51f46390f4b102ea9',
        },
        {
          url: '_app/immutable/chunks/B0kYkVBN.js',
          revision: 'dfdcde91763f757d7892d2313d1480b6',
        },
        {
          url: '_app/immutable/chunks/BO-jLNdh.js',
          revision: '0953a22fc226b7048fcefa818c1bcc5f',
        },
        {
          url: '_app/immutable/chunks/BOOFhtRP.js',
          revision: 'f7687615da2389131b7e3bacd0691252',
        },
        {
          url: '_app/immutable/chunks/BwBkY9_K.js',
          revision: '8ee5d146e42dc14659fee062b45b4cb8',
        },
        {
          url: '_app/immutable/chunks/Byx6IEAp.js',
          revision: '1fee023a262b8ea65fe82084e182eafc',
        },
        {
          url: '_app/immutable/chunks/C1kyYzkI.js',
          revision: '635d7e68a3a4cd7ba4ceacb0e5ae361c',
        },
        {
          url: '_app/immutable/chunks/CUIkxFFA.js',
          revision: 'afc28ca98b3ce3b4c1cf58ebd7db72ee',
        },
        {
          url: '_app/immutable/chunks/DG4W8TUH.js',
          revision: 'cbc3141b2b9f4e31de014954d087b8a9',
        },
        {
          url: '_app/immutable/chunks/Dt4_cxAB.js',
          revision: '1d1ee39590081df3909992413b961837',
        },
        {
          url: '_app/immutable/chunks/DXa1qAe1.js',
          revision: '2332b9c6a8fc01a95c2165ffd5ffd72e',
        },
        {
          url: '_app/immutable/entry/app.CEqB0Lfx.js',
          revision: '92fc0bdf5bfa8107680bc383006904ce',
        },
        {
          url: '_app/immutable/entry/start.DAVHA_Vg.js',
          revision: 'ec6681172c8e0fd4456472a3a1bdc4a4',
        },
        {
          url: '_app/immutable/nodes/0.zmJcXg7n.js',
          revision: 'fdaae920db7af77d84cd394ff9d7e556',
        },
        {
          url: '_app/immutable/nodes/1.D8QpRbdO.js',
          revision: '8ece8d946dc4c24350ecd717e8133a9d',
        },
        {
          url: '_app/immutable/nodes/2.ChznuR9a.js',
          revision: 'de0eafea58354f29f191bc449fffe19c',
        },
        {
          url: '_app/immutable/nodes/3.CW7qXNoq.js',
          revision: '48dc5aeb679ff6ec0b58f33e5e0d15f8',
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
