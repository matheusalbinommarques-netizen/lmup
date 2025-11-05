import { t as n, v as o, u as c } from './dJOEbL3k.js';
function u(e) {
  throw new Error('https://svelte.dev/e/lifecycle_outside_component');
}
function r(e) {
  (o === null && u(),
    n(() => {
      const t = c(e);
      if (typeof t == 'function') return t;
    }));
}
export { r as o };
