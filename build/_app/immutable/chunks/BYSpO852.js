import {
  I as L,
  a0 as A,
  aq as M,
  J as N,
  a4 as b,
  a3 as w,
  a7 as I,
  m as h,
  ag as y,
  ar as P,
  as as O,
  at as x,
  h as _,
  C as s,
  a as V,
  A as v,
  au as C,
  c as D,
} from './Cowx68EC.js';
function J(e) {
  return (
    e.endsWith('capture') &&
    e !== 'gotpointercapture' &&
    e !== 'lostpointercapture'
  );
}
const R = [
  'beforeinput',
  'click',
  'change',
  'dblclick',
  'contextmenu',
  'focusin',
  'focusout',
  'input',
  'keydown',
  'keyup',
  'mousedown',
  'mousemove',
  'mouseout',
  'mouseover',
  'mouseup',
  'pointerdown',
  'pointermove',
  'pointerout',
  'pointerover',
  'pointerup',
  'touchend',
  'touchmove',
  'touchstart',
];
function X(e) {
  return R.includes(e);
}
const B = {
  formnovalidate: 'formNoValidate',
  ismap: 'isMap',
  nomodule: 'noModule',
  playsinline: 'playsInline',
  readonly: 'readOnly',
  defaultvalue: 'defaultValue',
  defaultchecked: 'defaultChecked',
  srcobject: 'srcObject',
  novalidate: 'noValidate',
  allowfullscreen: 'allowFullscreen',
  disablepictureinpicture: 'disablePictureInPicture',
  disableremoteplayback: 'disableRemotePlayback',
};
function K(e) {
  return ((e = e.toLowerCase()), B[e] ?? e);
}
const W = ['touchstart', 'touchmove'];
function Q(e) {
  return W.includes(e);
}
const j = new Set(),
  q = new Set();
function F(e, t, a, i = {}) {
  function n(r) {
    if ((i.capture || U.call(t, r), !r.cancelBubble))
      return M(() => a?.call(this, r));
  }
  return (
    e.startsWith('pointer') || e.startsWith('touch') || e === 'wheel'
      ? A(() => {
          t.addEventListener(e, n, i);
        })
      : t.addEventListener(e, n, i),
    n
  );
}
function Y(e, t, a, i, n) {
  var r = { capture: i, passive: n },
    o = F(e, t, a, r);
  (t === document.body ||
    t === window ||
    t === document ||
    t instanceof HTMLMediaElement) &&
    L(() => {
      t.removeEventListener(e, o, r);
    });
}
function Z(e) {
  for (var t = 0; t < e.length; t++) j.add(e[t]);
  for (var a of q) a(e);
}
let T = null;
function U(e) {
  var t = this,
    a = t.ownerDocument,
    i = e.type,
    n = e.composedPath?.() || [],
    r = n[0] || e.target;
  T = e;
  var o = 0,
    l = T === e && e.__root;
  if (l) {
    var c = n.indexOf(l);
    if (c !== -1 && (t === document || t === window)) {
      e.__root = t;
      return;
    }
    var m = n.indexOf(t);
    if (m === -1) return;
    c <= m && (o = c);
  }
  if (((r = n[o] || e.target), r !== t)) {
    N(e, 'currentTarget', {
      configurable: !0,
      get() {
        return r || a;
      },
    });
    var k = I,
      S = h;
    (b(null), w(null));
    try {
      for (var d, g = []; r !== null; ) {
        var p = r.assignedSlot || r.parentNode || r.host || null;
        try {
          var E = r['__' + i];
          E != null && (!r.disabled || e.target === r) && E.call(r, e);
        } catch (f) {
          d ? g.push(f) : (d = f);
        }
        if (e.cancelBubble || p === t || p === null) break;
        r = p;
      }
      if (d) {
        for (let f of g)
          queueMicrotask(() => {
            throw f;
          });
        throw d;
      }
    } finally {
      ((e.__root = t), delete e.currentTarget, b(k), w(S));
    }
  }
}
function G(e) {
  var t = document.createElement('template');
  return ((t.innerHTML = e.replaceAll('<!>', '<!---->')), t.content);
}
function u(e, t) {
  var a = h;
  a.nodes_start === null && ((a.nodes_start = e), (a.nodes_end = t));
}
function $(e, t) {
  var a = (t & O) !== 0,
    i = (t & x) !== 0,
    n,
    r = !e.startsWith('<!>');
  return () => {
    if (_) return (u(s, null), s);
    n === void 0 && ((n = G(r ? e : '<!>' + e)), a || (n = y(n)));
    var o = i || P ? document.importNode(n, !0) : n.cloneNode(!0);
    if (a) {
      var l = y(o),
        c = o.lastChild;
      u(l, c);
    } else u(o, o);
    return o;
  };
}
function ee(e = '') {
  if (!_) {
    var t = v(e + '');
    return (u(t, t), t);
  }
  var a = s;
  return (a.nodeType !== C && (a.before((a = v())), D(a)), u(a, a), a);
}
function te() {
  if (_) return (u(s, null), s);
  var e = document.createDocumentFragment(),
    t = document.createComment(''),
    a = v();
  return (e.append(t, a), u(t, a), e);
}
function ae(e, t) {
  if (_) {
    ((h.nodes_end = s), V());
    return;
  }
  e !== null && e.before(t);
}
const H = '5';
typeof window < 'u' && ((window.__svelte ??= {}).v ??= new Set()).add(H);
export {
  ae as a,
  j as b,
  u as c,
  te as d,
  J as e,
  $ as f,
  F as g,
  U as h,
  Q as i,
  Z as j,
  X as k,
  Y as l,
  K as n,
  q as r,
  ee as t,
};
