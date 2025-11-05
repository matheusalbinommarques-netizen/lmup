import {
  b as o,
  h as f,
  a as c,
  J as b,
  r as d,
  H as T,
  f as p,
  s as y,
  i,
} from './Csv_Bl-6.js';
import { B as E } from './BSRLHI0b.js';
function v(t, _, h = !1) {
  f && c();
  var e = new E(t),
    u = h ? b : 0;
  function n(a, r) {
    if (f) {
      const l = d(t) === T;
      if (a === l) {
        var s = p();
        (y(s), (e.anchor = s), i(!1), e.ensure(a, r), i(!0));
        return;
      }
    }
    e.ensure(a, r);
  }
  o(() => {
    var a = !1;
    (_((r, s = !0) => {
      ((a = !0), n(s, r));
    }),
      a || n(!1, null));
  }, u);
}
export { v as i };
