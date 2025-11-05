import {
  ah as i,
  ar as v,
  as as h,
  at as p,
  m as u,
  h as d,
  C as o,
  a as E,
  A as f,
  au as T,
  c as g,
} from './dJOEbL3k.js';
function y(r) {
  var t = document.createElement('template');
  return ((t.innerHTML = r.replaceAll('<!>', '<!---->')), t.content);
}
function n(r, t) {
  var e = u;
  e.nodes_start === null && ((e.nodes_start = r), (e.nodes_end = t));
}
function x(r, t) {
  var e = (t & h) !== 0,
    _ = (t & p) !== 0,
    a,
    c = !r.startsWith('<!>');
  return () => {
    if (d) return (n(o, null), o);
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
function A(r = '') {
  if (!d) {
    var t = f(r + '');
    return (n(t, t), t);
  }
  var e = o;
  return (e.nodeType !== T && (e.before((e = f())), g(e)), n(e, e), e);
}
function M() {
  if (d) return (n(o, null), o);
  var r = document.createDocumentFragment(),
    t = document.createComment(''),
    e = f();
  return (r.append(t, e), n(t, e), r);
}
function C(r, t) {
  if (d) {
    ((u.nodes_end = o), E());
    return;
  }
  r !== null && r.before(t);
}
const N = '5';
typeof window < 'u' && ((window.__svelte ??= {}).v ??= new Set()).add(N);
export { C as a, n as b, M as c, x as f, A as t };
