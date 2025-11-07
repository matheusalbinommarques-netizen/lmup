import { x as o, y as t, u as c } from './B9t7ERLA.js';
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
