export const index = 1;
let component_cache;
export const component = async () =>
  (component_cache ??= (await import('../entries/fallbacks/error.svelte.js'))
    .default);
export const imports = [
  '_app/immutable/nodes/1.DCuDBtxX.js',
  '_app/immutable/chunks/BYSpO852.js',
  '_app/immutable/chunks/Cowx68EC.js',
  '_app/immutable/chunks/ViNRIw49.js',
  '_app/immutable/chunks/qHFclJgu.js',
  '_app/immutable/chunks/vGAHndma.js',
];
export const stylesheets = [];
export const fonts = [];
