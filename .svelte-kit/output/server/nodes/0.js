import * as universal from '../entries/pages/_layout.ts.js';

export const index = 0;
let component_cache;
export const component = async () =>
  (component_cache ??= (await import('../entries/pages/_layout.svelte.js'))
    .default);
export { universal };
export const universal_id = 'src/routes/+layout.ts';
export const imports = [
  '_app/immutable/nodes/0.BDbb4ClV.js',
  '_app/immutable/chunks/DsnmJJEf.js',
  '_app/immutable/chunks/C4tos-D-.js',
  '_app/immutable/chunks/BYKdWbGi.js',
  '_app/immutable/chunks/B28y5Mvi.js',
  '_app/immutable/chunks/BzcctPJO.js',
];
export const stylesheets = ['_app/immutable/assets/0.CEYHGvux.css'];
export const fonts = [];
