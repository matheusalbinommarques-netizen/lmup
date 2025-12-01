import {
  F as n,
  au as v,
  av as d,
  aw as h,
  ax as g,
  a9 as y,
  ay as p,
} from './C4tos-D-.js';
function _(r) {
  var s,
    e,
    t = '';
  if (typeof r == 'string' || typeof r == 'number') t += r;
  else if (typeof r == 'object')
    if (Array.isArray(r)) {
      var a = r.length;
      for (s = 0; s < a; s++)
        r[s] && (e = _(r[s])) && (t && (t += ' '), (t += e));
    } else for (e in r) r[e] && (t && (t += ' '), (t += e));
  return t;
}
function A() {
  for (var r, s, e = 0, t = '', a = arguments.length; e < a; e++)
    (r = arguments[e]) && (s = _(r)) && (t && (t += ' '), (t += s));
  return t;
}
function M(r) {
  return typeof r == 'object' ? A(r) : (r ?? '');
}
function N(r, s, e) {
  var t = r == null ? '' : '' + r;
  return t === '' ? null : t;
}
function k(r, s) {
  return r == null ? null : String(r);
}
function L(r, s, e, t, a, o) {
  var i = r.__className;
  if (n || i !== e || i === void 0) {
    var f = N(e);
    ((!n || f !== r.getAttribute('class')) &&
      (f == null ? r.removeAttribute('class') : (r.className = f)),
      (r.__className = e));
  }
  return o;
}
const S = Symbol('is custom element'),
  m = Symbol('is html');
function T(r) {
  if (n) {
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
    ((r.__on_r = e), y(e), p());
  }
}
function I(r, s) {
  var e = l(r);
  e.value === (e.value = s ?? void 0) ||
    (r.value === s && (s !== 0 || r.nodeName !== 'PROGRESS')) ||
    (r.value = s ?? '');
}
function c(r, s, e, t) {
  var a = l(r);
  (n &&
    ((a[s] = r.getAttribute(s)),
    s === 'src' ||
      s === 'srcset' ||
      (s === 'href' && r.nodeName === 'LINK'))) ||
    (a[s] !== (a[s] = e) &&
      (s === 'loading' && (r[v] = e),
      e == null
        ? r.removeAttribute(s)
        : typeof e != 'string' && b(r).includes(s)
          ? (r[s] = e)
          : r.setAttribute(s, e)));
}
function l(r) {
  return (r.__attributes ??= {
    [S]: r.nodeName.includes('-'),
    [m]: r.namespaceURI === d,
  });
}
var u = new Map();
function b(r) {
  var s = r.getAttribute('is') || r.nodeName,
    e = u.get(s);
  if (e) return e;
  u.set(s, (e = []));
  for (var t, a = r, o = Element.prototype; o !== a; ) {
    t = g(a);
    for (var i in t) t[i].set && e.push(i);
    a = h(a);
  }
  return e;
}
export { L as a, I as b, M as c, T as r, c as s, k as t };
