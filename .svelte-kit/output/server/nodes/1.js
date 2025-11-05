export const index = 1;
let component_cache;
export const component = async () =>
  (component_cache ??= (await import('../entries/fallbacks/error.svelte.js'))
    .default);
export const imports = [
  '_app/immutable/nodes/1.VIYq_tZy.js',
  '_app/immutable/chunks/nF9ceomb.js',
  '_app/immutable/chunks/Csv_Bl-6.js',
  '_app/immutable/chunks/Ejg9LFgT.js',
  '_app/immutable/chunks/BO9mVFXQ.js',
  '_app/immutable/chunks/DcfkiRxm.js',
];
export const stylesheets = [];
export const fonts = [];
