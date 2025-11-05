import * as universal from '../entries/pages/_layout.ts.js';

export const index = 0;
let component_cache;
export const component = async () =>
  (component_cache ??= (await import('../entries/pages/_layout.svelte.js'))
    .default);
export { universal };
export const universal_id = 'src/routes/+layout.ts';
export const imports = [
  '_app/immutable/nodes/0.zmJcXg7n.js',
  '_app/immutable/chunks/C1kyYzkI.js',
  '_app/immutable/chunks/BOOFhtRP.js',
  '_app/immutable/chunks/B0kYkVBN.js',
  '_app/immutable/chunks/Dt4_cxAB.js',
  '_app/immutable/chunks/B0aBMHRA.js',
  '_app/immutable/chunks/5aiaHk4R.js',
  '_app/immutable/chunks/DG4W8TUH.js',
  '_app/immutable/chunks/CUIkxFFA.js',
  '_app/immutable/chunks/DXa1qAe1.js',
];
export const stylesheets = [
  '_app/immutable/assets/BottomNav.tn0RQdqM.css',
  '_app/immutable/assets/0.Ca4sUYCK.css',
];
export const fonts = [];
