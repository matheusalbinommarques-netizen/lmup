export const index = 7;
let component_cache;
export const component = async () =>
  (component_cache ??= (await import('../entries/pages/loja/_page.svelte.js'))
    .default);
export const imports = [
  '_app/immutable/nodes/7.ab6o557I.js',
  '_app/immutable/chunks/DsnmJJEf.js',
  '_app/immutable/chunks/C4tos-D-.js',
  '_app/immutable/chunks/D7NEdK74.js',
  '_app/immutable/chunks/BYKdWbGi.js',
  '_app/immutable/chunks/B28y5Mvi.js',
  '_app/immutable/chunks/Cxxjmckw.js',
  '_app/immutable/chunks/CUrLQr9X.js',
  '_app/immutable/chunks/CpUvk0iO.js',
];
export const stylesheets = [];
export const fonts = [];
