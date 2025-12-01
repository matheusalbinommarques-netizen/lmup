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
    let f = {};
    const r = (e) => i(e, b),
      u = { module: { uri: b }, exports: f, require: r };
    a[b] = Promise.all(s.map((e) => u[e] || r(e))).then((e) => (c(...e), f));
  };
}
define(['./workbox-5ffe50d4'], function (e) {
  'use strict';
  (self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        {
          url: '_app/immutable/assets/0.CEYHGvux.css',
          revision: '2c1fa5d92a99c1105bf3513d963d4716',
        },
        {
          url: '_app/immutable/assets/8.LvpZ3PuW.css',
          revision: '0ffdb957a5d0ada23ea1e71526d3880e',
        },
        {
          url: '_app/immutable/chunks/B0IkYSzE.js',
          revision: 'c9ddd70ef4e06e98252bddc961e2c254',
        },
        {
          url: '_app/immutable/chunks/B28y5Mvi.js',
          revision: 'bb91da7930eb6916963ec6de4cd9b357',
        },
        {
          url: '_app/immutable/chunks/Beyb9IEN.js',
          revision: '66adb520cfbcd580c67b35ad69f064a6',
        },
        {
          url: '_app/immutable/chunks/BijEeDuW.js',
          revision: 'c801244762e87f402fc48dfbeae50aaa',
        },
        {
          url: '_app/immutable/chunks/BNQQrpbk.js',
          revision: '98615e094a23817691329a329516ffb4',
        },
        {
          url: '_app/immutable/chunks/BYKdWbGi.js',
          revision: 'b5278595d35494ca9fb74c91d66a38af',
        },
        {
          url: '_app/immutable/chunks/BYYbvhAJ.js',
          revision: '779174931ffa77dad57e5fc3b182ee8d',
        },
        {
          url: '_app/immutable/chunks/BzcctPJO.js',
          revision: 'f0aae492f01b9942e5f8e9312b2219e2',
        },
        {
          url: '_app/immutable/chunks/C4tos-D-.js',
          revision: '59f5099c89771e8ef6eaab84e49a8dda',
        },
        {
          url: '_app/immutable/chunks/CAyjdqEO.js',
          revision: '1cc60709938451876c3083dbd2671513',
        },
        {
          url: '_app/immutable/chunks/CPixY0QB.js',
          revision: 'f517323ad994e144480ebf875d21dae8',
        },
        {
          url: '_app/immutable/chunks/CpUvk0iO.js',
          revision: 'af277c80661fbc28c553ee6a2a8029ee',
        },
        {
          url: '_app/immutable/chunks/CUrLQr9X.js',
          revision: '9e4fa5b1ab1239c68f53a6614cdc3663',
        },
        {
          url: '_app/immutable/chunks/Cxxjmckw.js',
          revision: '85487238b52c6e90b78bfbdaff0abf7b',
        },
        {
          url: '_app/immutable/chunks/D7NEdK74.js',
          revision: '37b6c5f5cc97d1293b9f3bc0c4219ec4',
        },
        {
          url: '_app/immutable/chunks/DbSmc52O.js',
          revision: '3108c48d88f263a340f1f3701cc39cf8',
        },
        {
          url: '_app/immutable/chunks/DsnmJJEf.js',
          revision: 'fb20be990fc7761dabac283c80bd471e',
        },
        {
          url: '_app/immutable/chunks/Js4tUlcK.js',
          revision: '69dff58a83182b41f1f078f7db54543f',
        },
        {
          url: '_app/immutable/entry/app.COQxa0Xr.js',
          revision: 'ceb0aa8f2b9e0ff0ef0787987ff66943',
        },
        {
          url: '_app/immutable/entry/start.C_4Mdi8S.js',
          revision: 'c9ef17ce89c742d1c46cfc9461ae8e56',
        },
        {
          url: '_app/immutable/nodes/0.BDbb4ClV.js',
          revision: '8900907f4b1403d0984843964fb117ae',
        },
        {
          url: '_app/immutable/nodes/1.9VMlEJ-7.js',
          revision: '3db4de7ce30c8f0b2704821238c2826f',
        },
        {
          url: '_app/immutable/nodes/10.DgGqdxdW.js',
          revision: '7b1c374fb3db7c81377bcebec584181a',
        },
        {
          url: '_app/immutable/nodes/11.JYY59zBI.js',
          revision: '5e6cc0eea16608c3e872c7d7b601204b',
        },
        {
          url: '_app/immutable/nodes/12.DuHpcy4V.js',
          revision: '9ee21f5ee30838d912ea977ac6f6c43d',
        },
        {
          url: '_app/immutable/nodes/2.BFRHdi1P.js',
          revision: 'cbec7b7fe016df37fe3cc2a06cb4cc93',
        },
        {
          url: '_app/immutable/nodes/3.-xvFBicV.js',
          revision: '27fbfe18b060fa75b93a2fa6451c971f',
        },
        {
          url: '_app/immutable/nodes/4.r0vXU7Cx.js',
          revision: '5f53f6603fc5d8749b5567cfdf3fc5d9',
        },
        {
          url: '_app/immutable/nodes/5.DCC6_dOJ.js',
          revision: '1ddeb61f783d313f50141b61a40be8b5',
        },
        {
          url: '_app/immutable/nodes/6.Dn3yo94r.js',
          revision: 'aa4099be5fc5e720a436925b301f3784',
        },
        {
          url: '_app/immutable/nodes/7.ab6o557I.js',
          revision: '5957fff88511e6c3ff1e40dd5779989d',
        },
        {
          url: '_app/immutable/nodes/8.CKSVriuX.js',
          revision: '5130620f84fe31d392394ccda0e92ce7',
        },
        {
          url: '_app/immutable/nodes/9.C8P72N_T.js',
          revision: '8e6927697bffecd904dfe2e31d1f5d62',
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
