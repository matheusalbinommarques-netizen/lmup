export const index = 3;
let component_cache;
export const component = async () =>
  (component_cache ??= (await import('../entries/pages/config/_page.svelte.js'))
    .default);
export const imports = [
  '_app/immutable/nodes/3.CSpNr_ws.js',
  '_app/immutable/chunks/nF9ceomb.js',
  '_app/immutable/chunks/Csv_Bl-6.js',
  '_app/immutable/chunks/CoYf8t8d.js',
  '_app/immutable/chunks/BwBkY9_K.js',
  '_app/immutable/chunks/CwhHgKCB.js',
  '_app/immutable/chunks/BSRLHI0b.js',
  '_app/immutable/chunks/DQS66_so.js',
  '_app/immutable/chunks/CSEja_gF.js',
];
export const stylesheets = [];
export const fonts = [];
