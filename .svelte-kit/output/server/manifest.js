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
        start: '_app/immutable/entry/start.CYr-AuWh.js',
        app: '_app/immutable/entry/app.dzTZqTAn.js',
        imports: [
          '_app/immutable/entry/start.CYr-AuWh.js',
          '_app/immutable/chunks/qHFclJgu.js',
          '_app/immutable/chunks/Cowx68EC.js',
          '_app/immutable/chunks/vGAHndma.js',
          '_app/immutable/entry/app.dzTZqTAn.js',
          '_app/immutable/chunks/PPVm8Dsz.js',
          '_app/immutable/chunks/Cowx68EC.js',
          '_app/immutable/chunks/ViNRIw49.js',
          '_app/immutable/chunks/BYSpO852.js',
          '_app/immutable/chunks/vGAHndma.js',
          '_app/immutable/chunks/DQqdkiKC.js',
          '_app/immutable/chunks/f0HoYL7i.js',
          '_app/immutable/chunks/DgxGOAFj.js',
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
