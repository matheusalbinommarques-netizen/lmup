export const index = 1;
let component_cache;
export const component = async () =>
  (component_cache ??= (await import('../entries/fallbacks/error.svelte.js'))
    .default);
export const imports = [
  '_app/immutable/nodes/1.D8QpRbdO.js',
  '_app/immutable/chunks/C1kyYzkI.js',
  '_app/immutable/chunks/BOOFhtRP.js',
  '_app/immutable/chunks/DG4W8TUH.js',
  '_app/immutable/chunks/CUIkxFFA.js',
  '_app/immutable/chunks/DXa1qAe1.js',
];
export const stylesheets = [];
export const fonts = [];
