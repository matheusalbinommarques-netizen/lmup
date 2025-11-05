import { u as o, d as t, e as c } from './BOOFhtRP.js';
function u(e) {
  throw new Error('https://svelte.dev/e/lifecycle_outside_component');
}
function r(e) {
  (t === null && u(),
    o(() => {
      const n = c(e);
      if (typeof n == 'function') return n;
    }));
}
export { r as o };
