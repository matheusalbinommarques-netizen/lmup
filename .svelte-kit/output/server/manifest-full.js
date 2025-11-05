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
        start: '_app/immutable/entry/start.gb37Jy0a.js',
        app: '_app/immutable/entry/app.DnuFuvXn.js',
        imports: [
          '_app/immutable/entry/start.gb37Jy0a.js',
          '_app/immutable/chunks/BKBiTo-U.js',
          '_app/immutable/chunks/dJOEbL3k.js',
          '_app/immutable/chunks/Hfb5b_gR.js',
          '_app/immutable/entry/app.DnuFuvXn.js',
          '_app/immutable/chunks/PPVm8Dsz.js',
          '_app/immutable/chunks/dJOEbL3k.js',
          '_app/immutable/chunks/CyGDRoYz.js',
          '_app/immutable/chunks/hCnymrOV.js',
          '_app/immutable/chunks/DzhFJs4K.js',
          '_app/immutable/chunks/Hfb5b_gR.js',
          '_app/immutable/chunks/2eUCvS7o.js',
          '_app/immutable/chunks/DVr_F4gB.js',
          '_app/immutable/chunks/BXJXcbsa.js',
        ],
        stylesheets: [],
        fonts: [],
        uses_env_dynamic_public: false,
      },
      nodes: [
        __memo(() => import('./nodes/0.js')),
        __memo(() => import('./nodes/1.js')),
        __memo(() => import('./nodes/2.js')),
        __memo(() => import('./nodes/3.js')),
      ],
      remotes: {},
      routes: [
        {
          id: '/',
          pattern: /^\/$/,
          params: [],
          page: { layouts: [0], errors: [1], leaf: 2 },
          endpoint: null,
        },
        {
          id: '/config',
          pattern: /^\/config\/?$/,
          params: [],
          page: { layouts: [0], errors: [1], leaf: 3 },
          endpoint: null,
        },
      ],
      prerendered_routes: new Set([]),
      matchers: async () => {
        return {};
      },
      server_assets: {},
    },
  };
})();
