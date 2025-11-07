import * as universal from '../entries/pages/_layout.ts.js';

export const index = 0;
let component_cache;
export const component = async () =>
  (component_cache ??= (await import('../entries/pages/_layout.svelte.js'))
    .default);
export { universal };
export const universal_id = 'src/routes/+layout.ts';
export const imports = [
  '_app/immutable/nodes/0.BIzLJ6Uh.js',
  '_app/immutable/chunks/CTOClj_W.js',
  '_app/immutable/chunks/B9t7ERLA.js',
  '_app/immutable/chunks/bGr8mffb.js',
  '_app/immutable/chunks/B0vhlS2c.js',
  '_app/immutable/chunks/E1N5lFGC.js',
  '_app/immutable/chunks/DYDdMpkw.js',
  '_app/immutable/chunks/CKhwVIJ_.js',
  '_app/immutable/chunks/CFHu8sXB.js',
];
export const stylesheets = ['_app/immutable/assets/0.Bj5vy2FL.css'];
export const fonts = [];
