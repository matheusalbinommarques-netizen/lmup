export const index = 1;
let component_cache;
export const component = async () =>
  (component_cache ??= (await import('../entries/fallbacks/error.svelte.js'))
    .default);
export const imports = [
  '_app/immutable/nodes/1.BnHWND9x.js',
  '_app/immutable/chunks/CTOClj_W.js',
  '_app/immutable/chunks/B9t7ERLA.js',
  '_app/immutable/chunks/v1vEHNqM.js',
  '_app/immutable/chunks/CKhwVIJ_.js',
  '_app/immutable/chunks/B0vhlS2c.js',
  '_app/immutable/chunks/CFHu8sXB.js',
];
export const stylesheets = [];
export const fonts = [];
