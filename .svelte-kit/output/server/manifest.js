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
        start: '_app/immutable/entry/start.DAVHA_Vg.js',
        app: '_app/immutable/entry/app.CEqB0Lfx.js',
        imports: [
          '_app/immutable/entry/start.DAVHA_Vg.js',
          '_app/immutable/chunks/CUIkxFFA.js',
          '_app/immutable/chunks/BOOFhtRP.js',
          '_app/immutable/chunks/DXa1qAe1.js',
          '_app/immutable/entry/app.CEqB0Lfx.js',
          '_app/immutable/chunks/BO-jLNdh.js',
          '_app/immutable/chunks/BOOFhtRP.js',
          '_app/immutable/chunks/C1kyYzkI.js',
          '_app/immutable/chunks/DXa1qAe1.js',
          '_app/immutable/chunks/Dt4_cxAB.js',
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
