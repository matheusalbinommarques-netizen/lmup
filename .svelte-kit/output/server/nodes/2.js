export const index = 2;
let component_cache;
export const component = async () =>
  (component_cache ??= (await import('../entries/pages/_page.svelte.js'))
    .default);
export const imports = [
  '_app/immutable/nodes/2.ChznuR9a.js',
  '_app/immutable/chunks/C1kyYzkI.js',
  '_app/immutable/chunks/BOOFhtRP.js',
  '_app/immutable/chunks/DXa1qAe1.js',
  '_app/immutable/chunks/5aiaHk4R.js',
  '_app/immutable/chunks/Dt4_cxAB.js',
  '_app/immutable/chunks/B0aBMHRA.js',
  '_app/immutable/chunks/DG4W8TUH.js',
  '_app/immutable/chunks/CUIkxFFA.js',
  '_app/immutable/chunks/BwBkY9_K.js',
];
export const stylesheets = ['_app/immutable/assets/BottomNav.tn0RQdqM.css'];
export const fonts = [];
