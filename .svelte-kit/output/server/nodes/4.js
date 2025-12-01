export const index = 4;
let component_cache;
export const component = async () =>
  (component_cache ??= (await import('../entries/pages/cla/_page.svelte.js'))
    .default);
export const imports = [
  '_app/immutable/nodes/4.r0vXU7Cx.js',
  '_app/immutable/chunks/DsnmJJEf.js',
  '_app/immutable/chunks/C4tos-D-.js',
  '_app/immutable/chunks/D7NEdK74.js',
  '_app/immutable/chunks/BYKdWbGi.js',
  '_app/immutable/chunks/B28y5Mvi.js',
  '_app/immutable/chunks/CUrLQr9X.js',
  '_app/immutable/chunks/CpUvk0iO.js',
];
export const stylesheets = [];
export const fonts = [];
