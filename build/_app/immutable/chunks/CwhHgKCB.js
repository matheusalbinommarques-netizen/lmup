import { b as p, J as f, h as l } from './Csv_Bl-6.js';
import { B as o } from './BSRLHI0b.js';
import { t as h } from './DQS66_so.js';
function N(s, i, ...a) {
  var n = new o(s);
  p(() => {
    const r = i() ?? null;
    n.ensure(r, r && ((t) => r(t, ...a)));
  }, f);
}
function _(s, i, a, n, r, t) {
  var c = s.__className;
  if (l || c !== a || c === void 0) {
    var e = h(a);
    ((!l || e !== s.getAttribute('class')) &&
      (e == null ? s.removeAttribute('class') : (s.className = e)),
      (s.__className = a));
  }
  return t;
}
export { N as a, _ as s };
