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
  self.define = (s, n) => {
    const r =
      e ||
      ('document' in self ? document.currentScript.src : '') ||
      location.href;
    if (a[r]) return;
    let c = {};
    const u = (e) => i(e, r),
      b = { module: { uri: r }, exports: c, require: u };
    a[r] = Promise.all(s.map((e) => b[e] || u(e))).then((e) => (n(...e), c));
  };
}
define(['./workbox-5ffe50d4'], function (e) {
  'use strict';
  (self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        {
          url: '_app/immutable/assets/0.BNaBjhY0.css',
          revision: '5bcd61c895699fb83ab1323047609705',
        },
        {
          url: '_app/immutable/chunks/_anJIlvJ.js',
          revision: 'd6211f7221e525213db0d8cc56775723',
        },
        {
          url: '_app/immutable/chunks/0WT7qgch.js',
          revision: '8ab3936527b6207aa6d9f5664f6d52e7',
        },
        {
          url: '_app/immutable/chunks/A-ufohnU.js',
          revision: '652cdf5f97d2f6fd82e0379fc18b5ae0',
        },
        {
          url: '_app/immutable/chunks/Av5441iL.js',
          revision: 'ddfd0c3d3009e4a32117bb4a32f536f5',
        },
        {
          url: '_app/immutable/chunks/B68RJgVf.js',
          revision: '7af91c43943fb39a8a4a0982bbb56f07',
        },
        {
          url: '_app/immutable/chunks/BuOzf4wU.js',
          revision: '836ad3787afb8570d339d91d00b03a5d',
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
          url: '_app/immutable/chunks/C4GIgfFI.js',
          revision: 'ed3fbe6566c6643737921d0d9814c317',
        },
        {
          url: '_app/immutable/chunks/CV21HSfW.js',
          revision: '1a89a1e7e19d6a8a086535f985908b42',
        },
        {
          url: '_app/immutable/chunks/D5tPhTvi.js',
          revision: 'a1f50152e0773132909655127c5ecb89',
        },
        {
          url: '_app/immutable/chunks/DMVQG7PD.js',
          revision: '82ca803a3e478ec02364e0ee2a85bf86',
        },
        {
          url: '_app/immutable/chunks/nNZc3isi.js',
          revision: 'a0617ac16bdcc5c5755368084eac14b1',
        },
        {
          url: '_app/immutable/entry/app.DEpsj6dv.js',
          revision: '7536604a31a643d2add1b53ceaa76039',
        },
        {
          url: '_app/immutable/entry/start.M1nDr6SU.js',
          revision: 'f1749981471edf15b55ab370b1cdfc26',
        },
        {
          url: '_app/immutable/nodes/0.BtFbn3m1.js',
          revision: 'b3ef8c071d1d0e9807ccd3948ec06a0b',
        },
        {
          url: '_app/immutable/nodes/1.BM1SeEqY.js',
          revision: 'f766c57f4ebf0cbce109f156fa945b88',
        },
        {
          url: '_app/immutable/nodes/2.CO5McPJ1.js',
          revision: 'f056070ada27c55b4d2045017db279b1',
        },
        {
          url: '_app/immutable/nodes/3.Cdz5sLsJ.js',
          revision: '9e857516efd4ce64a379973970590797',
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
