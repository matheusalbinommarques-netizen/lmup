export const index = 3;
let component_cache;
export const component = async () =>
  (component_cache ??= (await import('../entries/pages/config/_page.svelte.js'))
    .default);
export const imports = [
  '_app/immutable/nodes/3.CxcqMDea.js',
  '_app/immutable/chunks/DzhFJs4K.js',
  '_app/immutable/chunks/dJOEbL3k.js',
  '_app/immutable/chunks/PPVm8Dsz.js',
  '_app/immutable/chunks/CJ3v3E5z.js',
  '_app/immutable/chunks/Ca0y2NF9.js',
  '_app/immutable/chunks/DVr_F4gB.js',
  '_app/immutable/chunks/BXJXcbsa.js',
  '_app/immutable/chunks/hCnymrOV.js',
];
export const stylesheets = [];
export const fonts = [];
