export const index = 2;
let component_cache;
export const component = async () =>
  (component_cache ??= (await import('../entries/pages/_page.svelte.js'))
    .default);
export const imports = [
  '_app/immutable/nodes/2.DD7g9ghc.js',
  '_app/immutable/chunks/nF9ceomb.js',
  '_app/immutable/chunks/Csv_Bl-6.js',
  '_app/immutable/chunks/CSEja_gF.js',
  '_app/immutable/chunks/BSRLHI0b.js',
  '_app/immutable/chunks/CqgaXDz6.js',
  '_app/immutable/chunks/DQS66_so.js',
  '_app/immutable/chunks/BwBkY9_K.js',
  '_app/immutable/chunks/DcfkiRxm.js',
];
export const stylesheets = [];
export const fonts = [];
