export const index = 2;
let component_cache;
export const component = async () =>
  (component_cache ??= (await import('../entries/pages/_page.svelte.js'))
    .default);
export const imports = [
  '_app/immutable/nodes/2.CfNBenpB.js',
  '_app/immutable/chunks/DzhFJs4K.js',
  '_app/immutable/chunks/dJOEbL3k.js',
  '_app/immutable/chunks/hCnymrOV.js',
  '_app/immutable/chunks/2eUCvS7o.js',
  '_app/immutable/chunks/DVr_F4gB.js',
  '_app/immutable/chunks/CJ3v3E5z.js',
  '_app/immutable/chunks/Ca0y2NF9.js',
  '_app/immutable/chunks/BXJXcbsa.js',
  '_app/immutable/chunks/CyGDRoYz.js',
  '_app/immutable/chunks/Hfb5b_gR.js',
];
export const stylesheets = [];
export const fonts = [];
