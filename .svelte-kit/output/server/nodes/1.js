export const index = 1;
let component_cache;
export const component = async () =>
  (component_cache ??= (await import('../entries/fallbacks/error.svelte.js'))
    .default);
export const imports = [
  '_app/immutable/nodes/1.9VMlEJ-7.js',
  '_app/immutable/chunks/DsnmJJEf.js',
  '_app/immutable/chunks/C4tos-D-.js',
  '_app/immutable/chunks/BzcctPJO.js',
];
export const stylesheets = [];
export const fonts = [];
