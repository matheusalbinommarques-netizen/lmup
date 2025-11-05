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
    let b = {};
    const n = (e) => i(e, r),
      u = { module: { uri: r }, exports: b, require: n };
    a[r] = Promise.all(s.map((e) => u[e] || n(e))).then((e) => (c(...e), b));
  };
}
define(['./workbox-5ffe50d4'], function (e) {
  'use strict';
  (self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        {
          url: '_app/immutable/assets/0.B9o670bi.css',
          revision: '5f40d5861e6465a119d2e09abe1bec77',
        },
        {
          url: '_app/immutable/chunks/2eUCvS7o.js',
          revision: 'ecf38f67cd1964c8d284904b5373c116',
        },
        {
          url: '_app/immutable/chunks/BKBiTo-U.js',
          revision: '3f8d6f3be8d9f8a2b0df0aea69cecccc',
        },
        {
          url: '_app/immutable/chunks/BQYbGPrI.js',
          revision: 'c0f164d813a1503ea815ff877bc007f2',
        },
        {
          url: '_app/immutable/chunks/BXJXcbsa.js',
          revision: '310533272cdb0a6118d127d47dd3a0bd',
        },
        {
          url: '_app/immutable/chunks/Ca0y2NF9.js',
          revision: 'b4f5c150c56632857943f88641c34917',
        },
        {
          url: '_app/immutable/chunks/CJ3v3E5z.js',
          revision: '60ccd3afa07cd7da8fb3a5456757c9ce',
        },
        {
          url: '_app/immutable/chunks/CyGDRoYz.js',
          revision: '67d21f9ce6287c3e06f6842533fa8466',
        },
        {
          url: '_app/immutable/chunks/dJOEbL3k.js',
          revision: '11fd2471c711986bd619371949b9ccf6',
        },
        {
          url: '_app/immutable/chunks/DVr_F4gB.js',
          revision: 'c8dba8b30e4d29585f114e010c723a13',
        },
        {
          url: '_app/immutable/chunks/DzhFJs4K.js',
          revision: '601aa459c67c328f95a282135d550fc2',
        },
        {
          url: '_app/immutable/chunks/hCnymrOV.js',
          revision: '3fe8f81844522021c12b4edc53d84f82',
        },
        {
          url: '_app/immutable/chunks/Hfb5b_gR.js',
          revision: 'fcc6e012397e51b08e6e0363d1a187c8',
        },
        {
          url: '_app/immutable/chunks/PPVm8Dsz.js',
          revision: '84c8f5ebd14029ddeab0ab100c464899',
        },
        {
          url: '_app/immutable/entry/app.DnuFuvXn.js',
          revision: '810a8a18b7c3b9d560c583a1a57ebb37',
        },
        {
          url: '_app/immutable/entry/start.gb37Jy0a.js',
          revision: '19367750b306357b2169b59492916a8b',
        },
        {
          url: '_app/immutable/nodes/0.CjLBo8Qt.js',
          revision: '4de763d9bd6930736a6afdabc7ec901c',
        },
        {
          url: '_app/immutable/nodes/1.CooD7Kcu.js',
          revision: '188542c648e059469da69e7a03127d32',
        },
        {
          url: '_app/immutable/nodes/2.CfNBenpB.js',
          revision: 'ea3dc2bbd04bce498468512511b9210f',
        },
        {
          url: '_app/immutable/nodes/3.CxcqMDea.js',
          revision: '68ac73b2cb8cfded0854f327f89e8b19',
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
