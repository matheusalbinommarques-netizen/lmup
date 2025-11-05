import * as universal from '../entries/pages/_layout.ts.js';

export const index = 0;
let component_cache;
export const component = async () =>
  (component_cache ??= (await import('../entries/pages/_layout.svelte.js'))
    .default);
export { universal };
export const universal_id = 'src/routes/+layout.ts';
export const imports = [
  '_app/immutable/nodes/0.BmT17Oih.js',
  '_app/immutable/chunks/nF9ceomb.js',
  '_app/immutable/chunks/Csv_Bl-6.js',
  '_app/immutable/chunks/CwhHgKCB.js',
  '_app/immutable/chunks/BSRLHI0b.js',
  '_app/immutable/chunks/DQS66_so.js',
  '_app/immutable/chunks/CqgaXDz6.js',
  '_app/immutable/chunks/Bnrm6cmT.js',
  '_app/immutable/chunks/BO9mVFXQ.js',
];
export const stylesheets = ['_app/immutable/assets/0.DOmFC8J6.css'];
export const fonts = [];
