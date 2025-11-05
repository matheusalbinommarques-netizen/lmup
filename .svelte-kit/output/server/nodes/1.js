export const index = 1;
let component_cache;
export const component = async () =>
  (component_cache ??= (await import('../entries/fallbacks/error.svelte.js'))
    .default);
export const imports = [
  '_app/immutable/nodes/1.BM1SeEqY.js',
  '_app/immutable/chunks/BuOzf4wU.js',
  '_app/immutable/chunks/nNZc3isi.js',
  '_app/immutable/chunks/0WT7qgch.js',
  '_app/immutable/chunks/D5tPhTvi.js',
];
export const stylesheets = [];
export const fonts = [];
