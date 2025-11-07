import { f as i, a as h } from '../chunks/CTOClj_W.js';
import {
  z as g,
  A as v,
  B as d,
  C as l,
  D as _,
  E as s,
  F as a,
} from '../chunks/B9t7ERLA.js';
import { s as o } from '../chunks/v1vEHNqM.js';
import { s as x, p } from '../chunks/CKhwVIJ_.js';
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
function B(c, f) {
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
export { B as component };
