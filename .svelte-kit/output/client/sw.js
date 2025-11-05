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
  self.define = (s, r) => {
    const c =
      e ||
      ('document' in self ? document.currentScript.src : '') ||
      location.href;
    if (a[c]) return;
    let f = {};
    const n = (e) => i(e, c),
      b = { module: { uri: c }, exports: f, require: n };
    a[c] = Promise.all(s.map((e) => b[e] || n(e))).then((e) => (r(...e), f));
  };
}
define(['./workbox-5ffe50d4'], function (e) {
  'use strict';
  (self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        {
          url: '_app/immutable/assets/0.DOmFC8J6.css',
          revision: '7a640c0dae33f0211553fa264695bfaf',
        },
        {
          url: '_app/immutable/chunks/Bnrm6cmT.js',
          revision: 'af3842bd1aae28f650a36ef470fa6c99',
        },
        {
          url: '_app/immutable/chunks/BO9mVFXQ.js',
          revision: '83601cb1dc6cd91784a471200f286790',
        },
        {
          url: '_app/immutable/chunks/BSRLHI0b.js',
          revision: '7d0852273e7d741d650558cf3fa78b7c',
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
          url: '_app/immutable/chunks/CoYf8t8d.js',
          revision: 'e581d5e0542eef0d4f27a1866f4b3d7d',
        },
        {
          url: '_app/immutable/chunks/CqgaXDz6.js',
          revision: 'b7fdb696949c0d6deebe8b17aa54bb29',
        },
        {
          url: '_app/immutable/chunks/CSEja_gF.js',
          revision: 'ea54731e88576751016d6c77fb5fb227',
        },
        {
          url: '_app/immutable/chunks/Csv_Bl-6.js',
          revision: '43c52ca2573617546ec2eccc6d950189',
        },
        {
          url: '_app/immutable/chunks/CwhHgKCB.js',
          revision: '41f94a2f2eb8f938162607fd20aab61c',
        },
        {
          url: '_app/immutable/chunks/DcfkiRxm.js',
          revision: 'a657eff81579c5bc2f38b0754e47675f',
        },
        {
          url: '_app/immutable/chunks/DQS66_so.js',
          revision: '88a5635cb549143ba44f85cd389cf245',
        },
        {
          url: '_app/immutable/chunks/Ejg9LFgT.js',
          revision: '99508109ac1aa4580c8f45a2150b55a2',
        },
        {
          url: '_app/immutable/chunks/nF9ceomb.js',
          revision: '927f29ed44a71c613dfa479e171964b5',
        },
        {
          url: '_app/immutable/entry/app.32VKywzt.js',
          revision: '0a44b60cd291f78ad279c68939c7963f',
        },
        {
          url: '_app/immutable/entry/start.CEKZ8Q5V.js',
          revision: 'bf47d6751dd708f23a601a1fb90eaf52',
        },
        {
          url: '_app/immutable/nodes/0.BmT17Oih.js',
          revision: '98e10ec0dba14eec643f0d7edb42395b',
        },
        {
          url: '_app/immutable/nodes/1.VIYq_tZy.js',
          revision: '40e0de639e24b46f3aa504b886877f51',
        },
        {
          url: '_app/immutable/nodes/2.DD7g9ghc.js',
          revision: '52eb2f84c30de720f1d90e4a2ad74f6d',
        },
        {
          url: '_app/immutable/nodes/3.CSpNr_ws.js',
          revision: 'bf49cd9b7390715cafb1d03a666ae030',
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
