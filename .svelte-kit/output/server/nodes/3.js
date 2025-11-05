export const index = 3;
let component_cache;
export const component = async () =>
  (component_cache ??= (await import('../entries/pages/config/_page.svelte.js'))
    .default);
export const imports = [
  '_app/immutable/nodes/3.Cdz5sLsJ.js',
  '_app/immutable/chunks/BuOzf4wU.js',
  '_app/immutable/chunks/nNZc3isi.js',
  '_app/immutable/chunks/_anJIlvJ.js',
  '_app/immutable/chunks/BwBkY9_K.js',
  '_app/immutable/chunks/B68RJgVf.js',
  '_app/immutable/chunks/Av5441iL.js',
  '_app/immutable/chunks/CV21HSfW.js',
  '_app/immutable/chunks/DMVQG7PD.js',
];
export const stylesheets = [];
export const fonts = [];
