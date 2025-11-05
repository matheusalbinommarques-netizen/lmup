export const index = 3;
let component_cache;
export const component = async () =>
  (component_cache ??= (await import('../entries/pages/config/_page.svelte.js'))
    .default);
export const imports = [
  '_app/immutable/nodes/3.CW7qXNoq.js',
  '_app/immutable/chunks/C1kyYzkI.js',
  '_app/immutable/chunks/BOOFhtRP.js',
  '_app/immutable/chunks/BO-jLNdh.js',
  '_app/immutable/chunks/BwBkY9_K.js',
  '_app/immutable/chunks/B0kYkVBN.js',
  '_app/immutable/chunks/Dt4_cxAB.js',
  '_app/immutable/chunks/5aiaHk4R.js',
];
export const stylesheets = [];
export const fonts = [];
