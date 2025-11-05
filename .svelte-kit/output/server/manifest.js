export const manifest = (() => {
  function __memo(fn) {
    let value;
    return () => (value ??= value = fn());
  }

  return {
    appDir: '_app',
    appPath: '_app',
    assets: new Set([
      '.well-known/appspecific/com.chrome.devtools.json',
      'apple-touch-icon-180-transparent.png.png',
      'favicon-shield.ico',
      'pwa-192x192.png',
      'pwa-512x512-maskable.png',
      'pwa-512x512.png',
    ]),
    mimeTypes: { '.json': 'application/json', '.png': 'image/png' },
    _: {
      client: {
        start: '_app/immutable/entry/start.CEKZ8Q5V.js',
        app: '_app/immutable/entry/app.32VKywzt.js',
        imports: [
          '_app/immutable/entry/start.CEKZ8Q5V.js',
          '_app/immutable/chunks/Ejg9LFgT.js',
          '_app/immutable/chunks/Csv_Bl-6.js',
          '_app/immutable/chunks/BO9mVFXQ.js',
          '_app/immutable/chunks/DcfkiRxm.js',
          '_app/immutable/entry/app.32VKywzt.js',
          '_app/immutable/chunks/CoYf8t8d.js',
          '_app/immutable/chunks/Csv_Bl-6.js',
          '_app/immutable/chunks/nF9ceomb.js',
          '_app/immutable/chunks/DcfkiRxm.js',
          '_app/immutable/chunks/CSEja_gF.js',
          '_app/immutable/chunks/BSRLHI0b.js',
          '_app/immutable/chunks/Bnrm6cmT.js',
        ],
        stylesheets: [],
        fonts: [],
        uses_env_dynamic_public: false,
      },
      nodes: [
        __memo(() => import('./nodes/0.js')),
        __memo(() => import('./nodes/1.js')),
      ],
      remotes: {},
      routes: [],
      prerendered_routes: new Set(['/', '/config']),
      matchers: async () => {
        return {};
      },
      server_assets: {},
    },
  };
})();
