export const index = 2;
let component_cache;
export const component = async () =>
  (component_cache ??= (await import('../entries/pages/_page.svelte.js'))
    .default);
export const imports = [
  '_app/immutable/nodes/2.CO5McPJ1.js',
  '_app/immutable/chunks/BuOzf4wU.js',
  '_app/immutable/chunks/nNZc3isi.js',
  '_app/immutable/chunks/DMVQG7PD.js',
  '_app/immutable/chunks/Av5441iL.js',
  '_app/immutable/chunks/C4GIgfFI.js',
  '_app/immutable/chunks/CV21HSfW.js',
  '_app/immutable/chunks/BwBkY9_K.js',
  '_app/immutable/chunks/D5tPhTvi.js',
];
export const stylesheets = [];
export const fonts = [];
