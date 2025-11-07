export const index = 2;
let component_cache;
export const component = async () =>
  (component_cache ??= (await import('../entries/pages/_page.svelte.js'))
    .default);
export const imports = [
  '_app/immutable/nodes/2.Bysll3dT.js',
  '_app/immutable/chunks/CTOClj_W.js',
  '_app/immutable/chunks/B9t7ERLA.js',
  '_app/immutable/chunks/v1vEHNqM.js',
  '_app/immutable/chunks/CmYDCv5e.js',
  '_app/immutable/chunks/DYDdMpkw.js',
];
export const stylesheets = ['_app/immutable/assets/2.rdC8a2QM.css'];
export const fonts = [];
