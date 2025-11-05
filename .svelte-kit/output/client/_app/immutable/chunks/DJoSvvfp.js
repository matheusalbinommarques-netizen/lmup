import {
  b as j,
  E as W,
  y as k,
  B as D,
  av as K,
  h as N,
  aB as X,
  aC as m,
  aD as x,
  I as rr,
  aE as ir,
  e as fr,
  aF as er,
  d as R,
  aG as tr,
  aH as sr,
  a0 as ar,
  aI as ur,
  aJ as lr,
  aK as or,
  aL as cr,
  aM as nr,
} from './Cowx68EC.js';
import { B as vr } from './f0HoYL7i.js';
import { e as dr, g as br, j as gr, n as hr, k as _r } from './BYSpO852.js';
function Pr(r, e, ...i) {
  var f = new vr(r);
  j(() => {
    const t = e() ?? null;
    f.ensure(t, t && ((s) => t(s, ...i)));
  }, W);
}
function pr(r, e) {
  var i = void 0,
    f;
  j(() => {
    i !== (i = e()) &&
      (f && (k(f), (f = null)),
      i &&
        (f = D(() => {
          K(() => i(r));
        })));
  });
}
function Y(r) {
  var e,
    i,
    f = '';
  if (typeof r == 'string' || typeof r == 'number') f += r;
  else if (typeof r == 'object')
    if (Array.isArray(r)) {
      var t = r.length;
      for (e = 0; e < t; e++)
        r[e] && (i = Y(r[e])) && (f && (f += ' '), (f += i));
    } else for (i in r) r[i] && (f && (f += ' '), (f += i));
  return f;
}
function Ar() {
  for (var r, e, i = 0, f = '', t = arguments.length; i < t; i++)
    (r = arguments[i]) && (e = Y(r)) && (f && (f += ' '), (f += e));
  return f;
}
function Nr(r) {
  return typeof r == 'object' ? Ar(r) : (r ?? '');
}
const U = [
  ...` 	
\r\f \v\uFEFF`,
];
function Er(r, e, i) {
  var f = r == null ? '' : '' + r;
  if ((e && (f = f ? f + ' ' + e : e), i)) {
    for (var t in i)
      if (i[t]) f = f ? f + ' ' + t : t;
      else if (f.length)
        for (var s = t.length, l = 0; (l = f.indexOf(t, l)) >= 0; ) {
          var c = l + s;
          (l === 0 || U.includes(f[l - 1])) &&
          (c === f.length || U.includes(f[c]))
            ? (f = (l === 0 ? '' : f.substring(0, l)) + f.substring(c + 1))
            : (l = c);
        }
  }
  return f === '' ? null : f;
}
function F(r, e = !1) {
  var i = e ? ' !important;' : ';',
    f = '';
  for (var t in r) {
    var s = r[t];
    s != null && s !== '' && (f += ' ' + t + ': ' + s + i);
  }
  return f;
}
function M(r) {
  return r[0] !== '-' || r[1] !== '-' ? r.toLowerCase() : r;
}
function Sr(r, e) {
  if (e) {
    var i = '',
      f,
      t;
    if ((Array.isArray(e) ? ((f = e[0]), (t = e[1])) : (f = e), r)) {
      r = String(r)
        .replaceAll(/\s*\/\*.*?\*\/\s*/g, '')
        .trim();
      var s = !1,
        l = 0,
        c = !1,
        d = [];
      (f && d.push(...Object.keys(f).map(M)),
        t && d.push(...Object.keys(t).map(M)));
      var n = 0,
        h = -1;
      const S = r.length;
      for (var v = 0; v < S; v++) {
        var a = r[v];
        if (
          (c
            ? a === '/' && r[v - 1] === '*' && (c = !1)
            : s
              ? s === a && (s = !1)
              : a === '/' && r[v + 1] === '*'
                ? (c = !0)
                : a === '"' || a === "'"
                  ? (s = a)
                  : a === '('
                    ? l++
                    : a === ')' && l--,
          !c && s === !1 && l === 0)
        ) {
          if (a === ':' && h === -1) h = v;
          else if (a === ';' || v === S - 1) {
            if (h !== -1) {
              var E = M(r.substring(n, h).trim());
              if (!d.includes(E)) {
                a !== ';' && v++;
                var A = r.substring(n, v).trim();
                i += ' ' + A + ';';
              }
            }
            ((n = v + 1), (h = -1));
          }
        }
      }
    }
    return (
      f && (i += F(f)),
      t && (i += F(t, !0)),
      (i = i.trim()),
      i === '' ? null : i
    );
  }
  return r == null ? null : String(r);
}
function Tr(r, e, i, f, t, s) {
  var l = r.__className;
  if (N || l !== i || l === void 0) {
    var c = Er(i, f, s);
    ((!N || c !== r.getAttribute('class')) &&
      (c == null
        ? r.removeAttribute('class')
        : e
          ? (r.className = c)
          : r.setAttribute('class', c)),
      (r.__className = i));
  } else if (s && t !== s)
    for (var d in s) {
      var n = !!s[d];
      (t == null || n !== !!t[d]) && r.classList.toggle(d, n);
    }
  return s;
}
function w(r, e = {}, i, f) {
  for (var t in i) {
    var s = i[t];
    e[t] !== s &&
      (i[t] == null ? r.style.removeProperty(t) : r.style.setProperty(t, s, f));
  }
}
function Ir(r, e, i, f) {
  var t = r.__style;
  if (N || t !== e) {
    var s = Sr(e, f);
    ((!N || s !== r.getAttribute('style')) &&
      (s == null ? r.removeAttribute('style') : (r.style.cssText = s)),
      (r.__style = e));
  } else
    f &&
      (Array.isArray(f)
        ? (w(r, i?.[0], f[0]), w(r, i?.[1], f[1], 'important'))
        : w(r, i, f));
  return f;
}
function P(r, e, i = !1) {
  if (r.multiple) {
    if (e == null) return;
    if (!X(e)) return m();
    for (var f of r.options) f.selected = e.includes(H(f));
    return;
  }
  for (f of r.options) {
    var t = H(f);
    if (x(t, e)) {
      f.selected = !0;
      return;
    }
  }
  (!i || e !== void 0) && (r.selectedIndex = -1);
}
function Lr(r) {
  var e = new MutationObserver(() => {
    P(r, r.__value);
  });
  (e.observe(r, {
    childList: !0,
    subtree: !0,
    attributes: !0,
    attributeFilter: ['value'],
  }),
    rr(() => {
      e.disconnect();
    }));
}
function H(r) {
  return '__value' in r ? r.__value : r.value;
}
const L = Symbol('class'),
  O = Symbol('style'),
  G = Symbol('is custom element'),
  q = Symbol('is html');
function Or(r) {
  if (N) {
    var e = !1,
      i = () => {
        if (!e) {
          if (((e = !0), r.hasAttribute('value'))) {
            var f = r.value;
            (y(r, 'value', null), (r.value = f));
          }
          if (r.hasAttribute('checked')) {
            var t = r.checked;
            (y(r, 'checked', null), (r.checked = t));
          }
        }
      };
    ((r.__on_r = i), ar(i), ur());
  }
}
function yr(r, e) {
  e
    ? r.hasAttribute('selected') || r.setAttribute('selected', '')
    : r.removeAttribute('selected');
}
function y(r, e, i, f) {
  var t = z(r);
  (N &&
    ((t[e] = r.getAttribute(e)),
    e === 'src' ||
      e === 'srcset' ||
      (e === 'href' && r.nodeName === 'LINK'))) ||
    (t[e] !== (t[e] = i) &&
      (e === 'loading' && (r[cr] = i),
      i == null
        ? r.removeAttribute(e)
        : typeof i != 'string' && J(r).includes(e)
          ? (r[e] = i)
          : r.setAttribute(e, i)));
}
function Cr(r, e, i, f, t = !1, s = !1) {
  if (N && t && r.tagName === 'INPUT') {
    var l = r,
      c = l.type === 'checkbox' ? 'defaultChecked' : 'defaultValue';
    c in i || Or(l);
  }
  var d = z(r),
    n = d[G],
    h = !d[q];
  let v = N && n;
  v && R(!1);
  var a = e || {},
    E = r.tagName === 'OPTION';
  for (var A in e) A in i || (i[A] = null);
  (i.class ? (i.class = Nr(i.class)) : i[L] && (i.class = null),
    i[O] && (i.style ??= null));
  var S = J(r);
  for (const u in i) {
    let o = i[u];
    if (E && u === 'value' && o == null) {
      ((r.value = r.__value = ''), (a[u] = o));
      continue;
    }
    if (u === 'class') {
      var I = r.namespaceURI === 'http://www.w3.org/1999/xhtml';
      (Tr(r, I, o, f, e?.[L], i[L]), (a[u] = o), (a[L] = i[L]));
      continue;
    }
    if (u === 'style') {
      (Ir(r, o, e?.[O], i[O]), (a[u] = o), (a[O] = i[O]));
      continue;
    }
    var _ = a[u];
    if (!(o === _ && !(o === void 0 && r.hasAttribute(u)))) {
      a[u] = o;
      var $ = u[0] + u[1];
      if ($ !== '$$')
        if ($ === 'on') {
          const p = {},
            T = '$$' + u;
          let b = u.slice(2);
          var C = _r(b);
          if ((dr(b) && ((b = b.slice(0, -7)), (p.capture = !0)), !C && _)) {
            if (o != null) continue;
            (r.removeEventListener(b, a[T], p), (a[T] = null));
          }
          if (o != null)
            if (C) ((r[`__${b}`] = o), gr([b]));
            else {
              let Z = function (Q) {
                a[u].call(this, Q);
              };
              a[T] = br(b, r, Z, p);
            }
          else C && (r[`__${b}`] = void 0);
        } else if (u === 'style') y(r, u, o);
        else if (u === 'autofocus') tr(r, !!o);
        else if (!n && (u === '__value' || (u === 'value' && o != null)))
          r.value = r.__value = o;
        else if (u === 'selected' && E) yr(r, o);
        else {
          var g = u;
          h || (g = hr(g));
          var B = g === 'defaultValue' || g === 'defaultChecked';
          if (o == null && !n && !B)
            if (((d[u] = null), g === 'value' || g === 'checked')) {
              let p = r;
              const T = e === void 0;
              if (g === 'value') {
                let b = p.defaultValue;
                (p.removeAttribute(g),
                  (p.defaultValue = b),
                  (p.value = p.__value = T ? b : null));
              } else {
                let b = p.defaultChecked;
                (p.removeAttribute(g),
                  (p.defaultChecked = b),
                  (p.checked = T ? b : !1));
              }
            } else r.removeAttribute(u);
          else
            B || (S.includes(g) && (n || typeof o != 'string'))
              ? ((r[g] = o), g in d && (d[g] = sr))
              : typeof o != 'function' && y(r, g, o);
        }
    }
  }
  return (v && R(!0), a);
}
function jr(r, e, i = [], f = [], t = [], s, l = !1, c = !1) {
  ir(t, i, f, (d) => {
    var n = void 0,
      h = {},
      v = r.nodeName === 'SELECT',
      a = !1;
    if (
      (j(() => {
        var A = e(...d.map(fr)),
          S = Cr(r, n, A, s, l, c);
        a && v && 'value' in A && P(r, A.value);
        for (let _ of Object.getOwnPropertySymbols(h)) A[_] || k(h[_]);
        for (let _ of Object.getOwnPropertySymbols(A)) {
          var I = A[_];
          (_.description === er &&
            (!n || I !== n[_]) &&
            (h[_] && k(h[_]), (h[_] = D(() => pr(r, () => I)))),
            (S[_] = I));
        }
        n = S;
      }),
      v)
    ) {
      var E = r;
      K(() => {
        (P(E, n.value, !0), Lr(E));
      });
    }
    a = !0;
  });
}
function z(r) {
  return (r.__attributes ??= {
    [G]: r.nodeName.includes('-'),
    [q]: r.namespaceURI === lr,
  });
}
var V = new Map();
function J(r) {
  var e = r.getAttribute('is') || r.nodeName,
    i = V.get(e);
  if (i) return i;
  V.set(e, (i = []));
  for (var f, t = r, s = Element.prototype; s !== t; ) {
    f = nr(t);
    for (var l in f) f[l].set && i.push(l);
    t = or(t);
  }
  return i;
}
export { y as a, Tr as b, jr as c, Ir as d, Or as r, Pr as s };
