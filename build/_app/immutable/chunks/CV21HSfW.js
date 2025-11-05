import {
  h as _,
  a2 as f,
  a3 as l,
  a1 as d,
  a4 as u,
  a5 as h,
  a6 as v,
} from './nNZc3isi.js';
function S(r, s, e) {
  var t = r == null ? '' : '' + r;
  return t === '' ? null : t;
}
function M(r, s) {
  return r == null ? null : String(r);
}
const g = Symbol('is custom element'),
  A = Symbol('is html');
function N(r) {
  if (_) {
    var s = !1,
      e = () => {
        if (!s) {
          if (((s = !0), r.hasAttribute('value'))) {
            var t = r.value;
            (c(r, 'value', null), (r.value = t));
          }
          if (r.hasAttribute('checked')) {
            var a = r.checked;
            (c(r, 'checked', null), (r.checked = a));
          }
        }
      };
    ((r.__on_r = e), d(e), u());
  }
}
function c(r, s, e, t) {
  var a = m(r);
  (_ &&
    ((a[s] = r.getAttribute(s)),
    s === 'src' ||
      s === 'srcset' ||
      (s === 'href' && r.nodeName === 'LINK'))) ||
    (a[s] !== (a[s] = e) &&
      (s === 'loading' && (r[h] = e),
      e == null
        ? r.removeAttribute(s)
        : typeof e != 'string' && y(r).includes(s)
          ? (r[s] = e)
          : r.setAttribute(s, e)));
}
function m(r) {
  return (r.__attributes ??= {
    [g]: r.nodeName.includes('-'),
    [A]: r.namespaceURI === f,
  });
}
var n = new Map();
function y(r) {
  var s = r.getAttribute('is') || r.nodeName,
    e = n.get(s);
  if (e) return e;
  n.set(s, (e = []));
  for (var t, a = r, i = Element.prototype; i !== a; ) {
    t = v(a);
    for (var o in t) t[o].set && e.push(o);
    a = l(a);
  }
  return e;
}
export { M as a, N as r, c as s, S as t };
