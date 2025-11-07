import {
  o as c,
  q as l,
  _ as u,
  $ as d,
  a0 as h,
  a1 as v,
  a2 as g,
} from './BOOFhtRP.js';
function A(s, r, e) {
  var a = s == null ? '' : '' + s;
  return a === '' ? null : a;
}
function M(s, r) {
  return s == null ? null : String(s);
}
function k(s, r, e, a, t, i) {
  var o = s.__className;
  if (c || o !== e || o === void 0) {
    var _ = A(e);
    ((!c || _ !== s.getAttribute('class')) &&
      (_ == null ? s.removeAttribute('class') : (s.className = _)),
      (s.__className = e));
  }
  return i;
}
const p = Symbol('is custom element'),
  N = Symbol('is html');
function E(s) {
  if (c) {
    var r = !1,
      e = () => {
        if (!r) {
          if (((r = !0), s.hasAttribute('value'))) {
            var a = s.value;
            (n(s, 'value', null), (s.value = a));
          }
          if (s.hasAttribute('checked')) {
            var t = s.checked;
            (n(s, 'checked', null), (s.checked = t));
          }
        }
      };
    ((s.__on_r = e), l(e), u());
  }
}
function n(s, r, e, a) {
  var t = y(s);
  (c &&
    ((t[r] = s.getAttribute(r)),
    r === 'src' ||
      r === 'srcset' ||
      (r === 'href' && s.nodeName === 'LINK'))) ||
    (t[r] !== (t[r] = e) &&
      (r === 'loading' && (s[d] = e),
      e == null
        ? s.removeAttribute(r)
        : typeof e != 'string' && m(s).includes(r)
          ? (s[r] = e)
          : s.setAttribute(r, e)));
}
function y(s) {
  return (s.__attributes ??= {
    [p]: s.nodeName.includes('-'),
    [N]: s.namespaceURI === h,
  });
}
var f = new Map();
function m(s) {
  var r = s.getAttribute('is') || s.nodeName,
    e = f.get(r);
  if (e) return e;
  f.set(r, (e = []));
  for (var a, t = s, i = Element.prototype; i !== t; ) {
    a = g(t);
    for (var o in a) a[o].set && e.push(o);
    t = v(t);
  }
  return e;
}
export { k as a, E as r, n as s, M as t };
