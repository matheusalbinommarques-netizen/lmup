export const index = 5;
let component_cache;
export const component = async () =>
  (component_cache ??= (await import('../entries/pages/config/_page.svelte.js'))
    .default);
export const imports = [
  '_app/immutable/nodes/5.DCC6_dOJ.js',
  '_app/immutable/chunks/CAyjdqEO.js',
  '_app/immutable/chunks/C4tos-D-.js',
  '_app/immutable/chunks/DsnmJJEf.js',
  '_app/immutable/chunks/B28y5Mvi.js',
];
export const stylesheets = [];
export const fonts = [];
