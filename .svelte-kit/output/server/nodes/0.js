import * as universal from '../entries/pages/_layout.ts.js';

export const index = 0;
let component_cache;
export const component = async () =>
  (component_cache ??= (await import('../entries/pages/_layout.svelte.js'))
    .default);
export { universal };
export const universal_id = 'src/routes/+layout.ts';
export const imports = [
  '_app/immutable/nodes/0.BtFbn3m1.js',
  '_app/immutable/chunks/BuOzf4wU.js',
  '_app/immutable/chunks/nNZc3isi.js',
  '_app/immutable/chunks/B68RJgVf.js',
  '_app/immutable/chunks/Av5441iL.js',
  '_app/immutable/chunks/CV21HSfW.js',
  '_app/immutable/chunks/C4GIgfFI.js',
  '_app/immutable/chunks/A-ufohnU.js',
  '_app/immutable/chunks/0WT7qgch.js',
  '_app/immutable/chunks/D5tPhTvi.js',
];
export const stylesheets = ['_app/immutable/assets/0.BNaBjhY0.css'];
export const fonts = [];
