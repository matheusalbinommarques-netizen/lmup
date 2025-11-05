export const index = 3;
let component_cache;
export const component = async () =>
  (component_cache ??= (await import('../entries/pages/config/_page.svelte.js'))
    .default);
export const imports = [
  '_app/immutable/nodes/3.BRLvbiP7.js',
  '_app/immutable/chunks/BYSpO852.js',
  '_app/immutable/chunks/Cowx68EC.js',
  '_app/immutable/chunks/PPVm8Dsz.js',
  '_app/immutable/chunks/-JVijWqR.js',
  '_app/immutable/chunks/DJoSvvfp.js',
  '_app/immutable/chunks/f0HoYL7i.js',
  '_app/immutable/chunks/DgxGOAFj.js',
];
export const stylesheets = [];
export const fonts = [];
