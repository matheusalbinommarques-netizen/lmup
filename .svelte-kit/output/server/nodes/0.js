import * as universal from '../entries/pages/_layout.ts.js';

export const index = 0;
let component_cache;
export const component = async () =>
  (component_cache ??= (await import('../entries/pages/_layout.svelte.js'))
    .default);
export { universal };
export const universal_id = 'src/routes/+layout.ts';
export const imports = [
  '_app/immutable/nodes/0.CjLBo8Qt.js',
  '_app/immutable/chunks/DzhFJs4K.js',
  '_app/immutable/chunks/dJOEbL3k.js',
  '_app/immutable/chunks/Ca0y2NF9.js',
  '_app/immutable/chunks/DVr_F4gB.js',
  '_app/immutable/chunks/BKBiTo-U.js',
  '_app/immutable/chunks/Hfb5b_gR.js',
];
export const stylesheets = ['_app/immutable/assets/0.B9o670bi.css'];
export const fonts = [];
