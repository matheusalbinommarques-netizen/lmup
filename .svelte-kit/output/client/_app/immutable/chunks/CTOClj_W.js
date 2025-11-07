import {
  a5 as i,
  a6 as v,
  a7 as p,
  a8 as h,
  a3 as u,
  h as f,
  f as o,
  H as E,
  b as d,
  a9 as T,
  O as g,
} from './B9t7ERLA.js';
function y(r) {
  var t = document.createElement('template');
  return ((t.innerHTML = r.replaceAll('<!>', '<!---->')), t.content);
}
function n(r, t) {
  var e = u;
  e.nodes_start === null && ((e.nodes_start = r), (e.nodes_end = t));
}
function x(r, t) {
  var e = (t & p) !== 0,
    _ = (t & h) !== 0,
    a,
    c = !r.startsWith('<!>');
  return () => {
    if (f) return (n(o, null), o);
    a === void 0 && ((a = y(c ? r : '<!>' + r)), e || (a = i(a)));
    var s = _ || v ? document.importNode(a, !0) : a.cloneNode(!0);
    if (e) {
      var m = i(s),
        l = s.lastChild;
      n(m, l);
    } else n(s, s);
    return s;
  };
}
function M(r = '') {
  if (!f) {
    var t = d(r + '');
    return (n(t, t), t);
  }
  var e = o;
  return (e.nodeType !== T && (e.before((e = d())), g(e)), n(e, e), e);
}
function O() {
  if (f) return (n(o, null), o);
  var r = document.createDocumentFragment(),
    t = document.createComment(''),
    e = d();
  return (r.append(t, e), n(t, e), r);
}
function b(r, t) {
  if (f) {
    ((u.nodes_end = o), E());
    return;
  }
  r !== null && r.before(t);
}
const N = '5';
typeof window < 'u' && ((window.__svelte ??= {}).v ??= new Set()).add(N);
export { b as a, n as b, O as c, x as f, M as t };
