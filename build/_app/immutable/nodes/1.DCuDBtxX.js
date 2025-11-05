import { f as i, a as h } from '../chunks/BYSpO852.js';
import {
  Q as g,
  R as v,
  T as d,
  U as l,
  V as s,
  W as a,
  X as _,
} from '../chunks/Cowx68EC.js';
import { s as o } from '../chunks/ViNRIw49.js';
import { s as x, p } from '../chunks/qHFclJgu.js';
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
function T(c, f) {
  g(f, !0);
  var t = k(),
    r = v(t),
    n = s(r, !0);
  a(r);
  var e = _(r, 2),
    u = s(e, !0);
  (a(e),
    d(() => {
      (o(n, m.status), o(u, m.error?.message));
    }),
    h(c, t),
    l());
}
export { T as component };
