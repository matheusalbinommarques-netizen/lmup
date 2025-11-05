export const index = 2;
let component_cache;
export const component = async () =>
  (component_cache ??= (await import('../entries/pages/_page.svelte.js'))
    .default);
export const imports = [
  '_app/immutable/nodes/2.iN65js4Z.js',
  '_app/immutable/chunks/BYSpO852.js',
  '_app/immutable/chunks/Cowx68EC.js',
  '_app/immutable/chunks/DQqdkiKC.js',
  '_app/immutable/chunks/f0HoYL7i.js',
  '_app/immutable/chunks/DJoSvvfp.js',
  '_app/immutable/chunks/-JVijWqR.js',
  '_app/immutable/chunks/DgxGOAFj.js',
  '_app/immutable/chunks/ViNRIw49.js',
  '_app/immutable/chunks/vGAHndma.js',
];
export const stylesheets = [];
export const fonts = [];
