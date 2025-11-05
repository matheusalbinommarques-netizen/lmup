import * as universal from '../entries/pages/_layout.ts.js';

export const index = 0;
let component_cache;
export const component = async () =>
  (component_cache ??= (await import('../entries/pages/_layout.svelte.js'))
    .default);
export { universal };
export const universal_id = 'src/routes/+layout.ts';
export const imports = [
  '_app/immutable/nodes/0.LNoU-XZ0.js',
  '_app/immutable/chunks/BYSpO852.js',
  '_app/immutable/chunks/Cowx68EC.js',
  '_app/immutable/chunks/DJoSvvfp.js',
  '_app/immutable/chunks/f0HoYL7i.js',
  '_app/immutable/chunks/qHFclJgu.js',
  '_app/immutable/chunks/vGAHndma.js',
];
export const stylesheets = ['_app/immutable/assets/0.AIJQZlMW.css'];
export const fonts = [];
