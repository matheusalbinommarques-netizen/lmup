export const index = 1;
let component_cache;
export const component = async () =>
  (component_cache ??= (await import('../entries/fallbacks/error.svelte.js'))
    .default);
export const imports = [
  '_app/immutable/nodes/1.CooD7Kcu.js',
  '_app/immutable/chunks/DzhFJs4K.js',
  '_app/immutable/chunks/dJOEbL3k.js',
  '_app/immutable/chunks/CyGDRoYz.js',
  '_app/immutable/chunks/hCnymrOV.js',
  '_app/immutable/chunks/BKBiTo-U.js',
  '_app/immutable/chunks/Hfb5b_gR.js',
];
export const stylesheets = [];
export const fonts = [];
