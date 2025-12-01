import '../chunks/DsnmJJEf.js';
import {
  p as f,
  f as i,
  m as g,
  t as d,
  d as l,
  e as v,
  h as s,
  r as a,
  j as _,
  l as o,
} from '../chunks/C4tos-D-.js';
import { s as x, p } from '../chunks/BzcctPJO.js';
const $ = {
  get error() {
    return p.error;
  },
  get status() {
    return p.status;
  },
};
x.updated.check;
const m = $;
var k = i('<h1> </h1> <p> </p>', 1);
function q(c, n) {
  f(n, !0);
  var r = k(),
    t = g(r),
    u = s(t, !0);
  a(t);
  var e = _(t, 2),
    h = s(e, !0);
  (a(e),
    d(() => {
      (o(u, m.status), o(h, m.error?.message));
    }),
    l(c, r),
    v());
}
export { q as component };
