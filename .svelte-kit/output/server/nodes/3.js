export const index = 3;
let component_cache;
export const component = async () =>
  (component_cache ??= (await import('../entries/pages/config/_page.svelte.js'))
    .default);
export const imports = [
  '_app/immutable/nodes/3.Diz163We.js',
  '_app/immutable/chunks/1pLQ6qVO.js',
  '_app/immutable/chunks/CTOClj_W.js',
  '_app/immutable/chunks/B9t7ERLA.js',
  '_app/immutable/chunks/CFHu8sXB.js',
  '_app/immutable/chunks/v1vEHNqM.js',
  '_app/immutable/chunks/CmYDCv5e.js',
  '_app/immutable/chunks/E1N5lFGC.js',
  '_app/immutable/chunks/DYDdMpkw.js',
  '_app/immutable/chunks/CrojtzO5.js',
];
export const stylesheets = [];
export const fonts = [];
