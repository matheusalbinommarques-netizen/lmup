import { f as Rr, a as Nr } from './DzhFJs4K.js';
import {
  b as Mr,
  y as Yn,
  B as Fr,
  av as Lr,
  h as st,
  aB as Ti,
  aC as Ii,
  aD as Di,
  I as Bi,
  aE as qi,
  e as Ri,
  aF as Ni,
  d as Tr,
  aG as Mi,
  aH as Fi,
  Q as Li,
  aI as Ui,
  aJ as Vi,
  aK as $i,
  aL as zi,
  aM as Yi,
  _ as Ur,
  K as Vr,
  $ as $r,
} from './dJOEbL3k.js';
import { t as Wi, c as Gi, a as Qi, s as zr } from './Ca0y2NF9.js';
import { p as ut, r as Yr } from './BXJXcbsa.js';
import { b as Hi, c as Xi, d as Ji, n as Zi, e as eo } from './hCnymrOV.js';
function to(w, j) {
  var I = void 0,
    E;
  Mr(() => {
    I !== (I = j()) &&
      (E && (Yn(E), (E = null)),
      I &&
        (E = Fr(() => {
          Lr(() => I(w));
        })));
  });
}
function zn(w, j = {}, I, E) {
  for (var U in I) {
    var V = I[U];
    j[U] !== V &&
      (I[U] == null ? w.style.removeProperty(U) : w.style.setProperty(U, V, E));
  }
}
function no(w, j, I, E) {
  var U = w.__style;
  if (st || U !== j) {
    var V = Wi(j, E);
    ((!st || V !== w.getAttribute('style')) &&
      (V == null ? w.removeAttribute('style') : (w.style.cssText = V)),
      (w.__style = j));
  } else
    E &&
      (Array.isArray(E)
        ? (zn(w, I?.[0], E[0]), zn(w, I?.[1], E[1], 'important'))
        : zn(w, I, E));
  return E;
}
function Wn(w, j, I = !1) {
  if (w.multiple) {
    if (j == null) return;
    if (!Ti(j)) return Ii();
    for (var E of w.options) E.selected = j.includes(Ir(E));
    return;
  }
  for (E of w.options) {
    var U = Ir(E);
    if (Di(U, j)) {
      E.selected = !0;
      return;
    }
  }
  (!I || j !== void 0) && (w.selectedIndex = -1);
}
function ro(w) {
  var j = new MutationObserver(() => {
    Wn(w, w.__value);
  });
  (j.observe(w, {
    childList: !0,
    subtree: !0,
    attributes: !0,
    attributeFilter: ['value'],
  }),
    Bi(() => {
      j.disconnect();
    }));
}
function Ir(w) {
  return '__value' in w ? w.__value : w.value;
}
const Ot = Symbol('class'),
  Pt = Symbol('style'),
  Wr = Symbol('is custom element'),
  Gr = Symbol('is html');
function io(w) {
  if (st) {
    var j = !1,
      I = () => {
        if (!j) {
          if (((j = !0), w.hasAttribute('value'))) {
            var E = w.value;
            (rn(w, 'value', null), (w.value = E));
          }
          if (w.hasAttribute('checked')) {
            var U = w.checked;
            (rn(w, 'checked', null), (w.checked = U));
          }
        }
      };
    ((w.__on_r = I), Li(I), Ui());
  }
}
function oo(w, j) {
  j
    ? w.hasAttribute('selected') || w.setAttribute('selected', '')
    : w.removeAttribute('selected');
}
function rn(w, j, I, E) {
  var U = Hr(w);
  (st &&
    ((U[j] = w.getAttribute(j)),
    j === 'src' ||
      j === 'srcset' ||
      (j === 'href' && w.nodeName === 'LINK'))) ||
    (U[j] !== (U[j] = I) &&
      (j === 'loading' && (w[zi] = I),
      I == null
        ? w.removeAttribute(j)
        : typeof I != 'string' && Xr(w).includes(j)
          ? (w[j] = I)
          : w.setAttribute(j, I)));
}
function ao(w, j, I, E, U = !1, V = !1) {
  if (st && U && w.tagName === 'INPUT') {
    var $ = w,
      z = $.type === 'checkbox' ? 'defaultChecked' : 'defaultValue';
    z in I || io($);
  }
  var W = Hr(w),
    X = W[Wr],
    ve = !W[Gr];
  let te = st && X;
  te && Tr(!1);
  var J = j || {},
    Oe = w.tagName === 'OPTION';
  for (var re in j) re in I || (I[re] = null);
  (I.class ? (I.class = Gi(I.class)) : I[Ot] && (I.class = null),
    I[Pt] && (I.style ??= null));
  var me = Xr(w);
  for (const L in I) {
    let M = I[L];
    if (Oe && L === 'value' && M == null) {
      ((w.value = w.__value = ''), (J[L] = M));
      continue;
    }
    if (L === 'class') {
      var Ie = w.namespaceURI === 'http://www.w3.org/1999/xhtml';
      (Qi(w, Ie, M, E, j?.[Ot], I[Ot]), (J[L] = M), (J[Ot] = I[Ot]));
      continue;
    }
    if (L === 'style') {
      (no(w, M, j?.[Pt], I[Pt]), (J[L] = M), (J[Pt] = I[Pt]));
      continue;
    }
    var fe = J[L];
    if (!(M === fe && !(M === void 0 && w.hasAttribute(L)))) {
      J[L] = M;
      var De = L[0] + L[1];
      if (De !== '$$')
        if (De === 'on') {
          const ue = {},
            Pe = '$$' + L;
          let ie = L.slice(2);
          var Qe = eo(ie);
          if (
            (Hi(ie) && ((ie = ie.slice(0, -7)), (ue.capture = !0)), !Qe && fe)
          ) {
            if (M != null) continue;
            (w.removeEventListener(ie, J[Pe], ue), (J[Pe] = null));
          }
          if (M != null)
            if (Qe) ((w[`__${ie}`] = M), Ji([ie]));
            else {
              let Et = function (Be) {
                J[L].call(this, Be);
              };
              J[Pe] = Xi(ie, w, Et, ue);
            }
          else Qe && (w[`__${ie}`] = void 0);
        } else if (L === 'style') rn(w, L, M);
        else if (L === 'autofocus') Mi(w, !!M);
        else if (!X && (L === '__value' || (L === 'value' && M != null)))
          w.value = w.__value = M;
        else if (L === 'selected' && Oe) oo(w, M);
        else {
          var ne = L;
          ve || (ne = Zi(ne));
          var ct = ne === 'defaultValue' || ne === 'defaultChecked';
          if (M == null && !X && !ct)
            if (((W[L] = null), ne === 'value' || ne === 'checked')) {
              let ue = w;
              const Pe = j === void 0;
              if (ne === 'value') {
                let ie = ue.defaultValue;
                (ue.removeAttribute(ne),
                  (ue.defaultValue = ie),
                  (ue.value = ue.__value = Pe ? ie : null));
              } else {
                let ie = ue.defaultChecked;
                (ue.removeAttribute(ne),
                  (ue.defaultChecked = ie),
                  (ue.checked = Pe ? ie : !1));
              }
            } else w.removeAttribute(L);
          else
            ct || (me.includes(ne) && (X || typeof M != 'string'))
              ? ((w[ne] = M), ne in W && (W[ne] = Fi))
              : typeof M != 'function' && rn(w, ne, M);
        }
    }
  }
  return (te && Tr(!0), J);
}
function Qr(w, j, I = [], E = [], U = [], V, $ = !1, z = !1) {
  qi(U, I, E, (W) => {
    var X = void 0,
      ve = {},
      te = w.nodeName === 'SELECT',
      J = !1;
    if (
      (Mr(() => {
        var re = j(...W.map(Ri)),
          me = ao(w, X, re, V, $, z);
        J && te && 'value' in re && Wn(w, re.value);
        for (let fe of Object.getOwnPropertySymbols(ve)) re[fe] || Yn(ve[fe]);
        for (let fe of Object.getOwnPropertySymbols(re)) {
          var Ie = re[fe];
          (fe.description === Ni &&
            (!X || Ie !== X[fe]) &&
            (ve[fe] && Yn(ve[fe]), (ve[fe] = Fr(() => to(w, () => Ie)))),
            (me[fe] = Ie));
        }
        X = me;
      }),
      te)
    ) {
      var Oe = w;
      Lr(() => {
        (Wn(Oe, X.value, !0), ro(Oe));
      });
    }
    J = !0;
  });
}
function Hr(w) {
  return (w.__attributes ??= {
    [Wr]: w.nodeName.includes('-'),
    [Gr]: w.namespaceURI === Vi,
  });
}
var Dr = new Map();
function Xr(w) {
  var j = w.getAttribute('is') || w.nodeName,
    I = Dr.get(j);
  if (I) return I;
  Dr.set(j, (I = []));
  for (var E, U = w, V = Element.prototype; V !== U; ) {
    E = Yi(U);
    for (var $ in E) E[$].set && I.push($);
    U = $i(U);
  }
  return I;
}
var uo =
  typeof globalThis < 'u'
    ? globalThis
    : typeof window < 'u'
      ? window
      : typeof global < 'u'
        ? global
        : typeof self < 'u'
          ? self
          : {};
function so(w) {
  return w && w.__esModule && Object.prototype.hasOwnProperty.call(w, 'default')
    ? w.default
    : w;
}
var nn = { exports: {} },
  co = nn.exports,
  Br;
function lo() {
  return (
    Br ||
      ((Br = 1),
      (function (w, j) {
        (function (I, E) {
          w.exports = E();
        })(co, function () {
          var I = function (e, t) {
              return (I =
                Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array &&
                  function (n, r) {
                    n.__proto__ = r;
                  }) ||
                function (n, r) {
                  for (var i in r)
                    Object.prototype.hasOwnProperty.call(r, i) && (n[i] = r[i]);
                })(e, t);
            },
            E = function () {
              return (E =
                Object.assign ||
                function (e) {
                  for (var t, n = 1, r = arguments.length; n < r; n++)
                    for (var i in (t = arguments[n]))
                      Object.prototype.hasOwnProperty.call(t, i) &&
                        (e[i] = t[i]);
                  return e;
                }).apply(this, arguments);
            };
          function U(e, t, n) {
            for (var r, i = 0, o = t.length; i < o; i++)
              (!r && i in t) ||
                ((r = r || Array.prototype.slice.call(t, 0, i))[i] = t[i]);
            return e.concat(r || Array.prototype.slice.call(t));
          }
          var V =
              typeof globalThis < 'u'
                ? globalThis
                : typeof self < 'u'
                  ? self
                  : typeof window < 'u'
                    ? window
                    : uo,
            $ = Object.keys,
            z = Array.isArray;
          function W(e, t) {
            return (
              typeof t != 'object' ||
                $(t).forEach(function (n) {
                  e[n] = t[n];
                }),
              e
            );
          }
          typeof Promise > 'u' || V.Promise || (V.Promise = Promise);
          var X = Object.getPrototypeOf,
            ve = {}.hasOwnProperty;
          function te(e, t) {
            return ve.call(e, t);
          }
          function J(e, t) {
            (typeof t == 'function' && (t = t(X(e))),
              (typeof Reflect > 'u' ? $ : Reflect.ownKeys)(t).forEach(
                function (n) {
                  re(e, n, t[n]);
                },
              ));
          }
          var Oe = Object.defineProperty;
          function re(e, t, n, r) {
            Oe(
              e,
              t,
              W(
                n && te(n, 'get') && typeof n.get == 'function'
                  ? { get: n.get, set: n.set, configurable: !0 }
                  : { value: n, configurable: !0, writable: !0 },
                r,
              ),
            );
          }
          function me(e) {
            return {
              from: function (t) {
                return (
                  (e.prototype = Object.create(t.prototype)),
                  re(e.prototype, 'constructor', e),
                  { extend: J.bind(null, e.prototype) }
                );
              },
            };
          }
          var Ie = Object.getOwnPropertyDescriptor,
            fe = [].slice;
          function De(e, t, n) {
            return fe.call(e, t, n);
          }
          function Qe(e, t) {
            return t(e);
          }
          function ne(e) {
            if (!e) throw new Error('Assertion Failed');
          }
          function ct(e) {
            V.setImmediate ? setImmediate(e) : setTimeout(e, 0);
          }
          function L(e, t) {
            if (typeof t == 'string' && te(e, t)) return e[t];
            if (!t) return e;
            if (typeof t != 'string') {
              for (var n = [], r = 0, i = t.length; r < i; ++r) {
                var o = L(e, t[r]);
                n.push(o);
              }
              return n;
            }
            var a = t.indexOf('.');
            if (a !== -1) {
              var u = e[t.substr(0, a)];
              return u == null ? void 0 : L(u, t.substr(a + 1));
            }
          }
          function M(e, t, n) {
            if (
              e &&
              t !== void 0 &&
              !('isFrozen' in Object && Object.isFrozen(e))
            )
              if (typeof t != 'string' && 'length' in t) {
                ne(typeof n != 'string' && 'length' in n);
                for (var r = 0, i = t.length; r < i; ++r) M(e, t[r], n[r]);
              } else {
                var o,
                  a,
                  u = t.indexOf('.');
                u !== -1
                  ? ((o = t.substr(0, u)),
                    (a = t.substr(u + 1)) === ''
                      ? n === void 0
                        ? z(e) && !isNaN(parseInt(o))
                          ? e.splice(o, 1)
                          : delete e[o]
                        : (e[o] = n)
                      : M(
                          (u = !(u = e[o]) || !te(e, o) ? (e[o] = {}) : u),
                          a,
                          n,
                        ))
                  : n === void 0
                    ? z(e) && !isNaN(parseInt(t))
                      ? e.splice(t, 1)
                      : delete e[t]
                    : (e[t] = n);
              }
          }
          function ue(e) {
            var t,
              n = {};
            for (t in e) te(e, t) && (n[t] = e[t]);
            return n;
          }
          var Pe = [].concat;
          function ie(e) {
            return Pe.apply([], e);
          }
          var Me =
              'BigUint64Array,BigInt64Array,Array,Boolean,String,Date,RegExp,Blob,File,FileList,FileSystemFileHandle,FileSystemDirectoryHandle,ArrayBuffer,DataView,Uint8ClampedArray,ImageBitmap,ImageData,Map,Set,CryptoKey'
                .split(',')
                .concat(
                  ie(
                    [8, 16, 32, 64].map(function (e) {
                      return ['Int', 'Uint', 'Float'].map(function (t) {
                        return t + e + 'Array';
                      });
                    }),
                  ),
                )
                .filter(function (e) {
                  return V[e];
                }),
            Et = new Set(
              Me.map(function (e) {
                return V[e];
              }),
            ),
            Be = null;
          function qe(e) {
            return (
              (Be = new WeakMap()),
              (e = (function t(n) {
                if (!n || typeof n != 'object') return n;
                var r = Be.get(n);
                if (r) return r;
                if (z(n)) {
                  ((r = []), Be.set(n, r));
                  for (var i = 0, o = n.length; i < o; ++i) r.push(t(n[i]));
                } else if (Et.has(n.constructor)) r = n;
                else {
                  var a,
                    u = X(n);
                  for (a in ((r =
                    u === Object.prototype ? {} : Object.create(u)),
                  Be.set(n, r),
                  n))
                    te(n, a) && (r[a] = t(n[a]));
                }
                return r;
              })(e)),
              (Be = null),
              e
            );
          }
          var Jr = {}.toString;
          function an(e) {
            return Jr.call(e).slice(8, -1);
          }
          var un = typeof Symbol < 'u' ? Symbol.iterator : '@@iterator',
            Zr =
              typeof un == 'symbol'
                ? function (e) {
                    var t;
                    return e != null && (t = e[un]) && t.apply(e);
                  }
                : function () {
                    return null;
                  };
          function Re(e, t) {
            return ((t = e.indexOf(t)), 0 <= t && e.splice(t, 1), 0 <= t);
          }
          var He = {};
          function we(e) {
            var t, n, r, i;
            if (arguments.length === 1) {
              if (z(e)) return e.slice();
              if (this === He && typeof e == 'string') return [e];
              if ((i = Zr(e))) {
                for (n = []; !(r = i.next()).done; ) n.push(r.value);
                return n;
              }
              if (e == null) return [e];
              if (typeof (t = e.length) != 'number') return [e];
              for (n = new Array(t); t--; ) n[t] = e[t];
              return n;
            }
            for (t = arguments.length, n = new Array(t); t--; )
              n[t] = arguments[t];
            return n;
          }
          var sn =
              typeof Symbol < 'u'
                ? function (e) {
                    return e[Symbol.toStringTag] === 'AsyncFunction';
                  }
                : function () {
                    return !1;
                  },
            ht = [
              'Unknown',
              'Constraint',
              'Data',
              'TransactionInactive',
              'ReadOnly',
              'Version',
              'NotFound',
              'InvalidState',
              'InvalidAccess',
              'Abort',
              'Timeout',
              'QuotaExceeded',
              'Syntax',
              'DataClone',
            ],
            ye = [
              'Modify',
              'Bulk',
              'OpenFailed',
              'VersionChange',
              'Schema',
              'Upgrade',
              'InvalidTable',
              'MissingAPI',
              'NoSuchDatabase',
              'InvalidArgument',
              'SubTransaction',
              'Unsupported',
              'Internal',
              'DatabaseClosed',
              'PrematureCommit',
              'ForeignAwait',
            ].concat(ht),
            ei = {
              VersionChanged:
                'Database version changed by other database connection',
              DatabaseClosed: 'Database has been closed',
              Abort: 'Transaction aborted',
              TransactionInactive:
                'Transaction has already completed or failed',
              MissingAPI:
                'IndexedDB API missing. Please visit https://tinyurl.com/y2uuvskb',
            };
          function Xe(e, t) {
            ((this.name = e), (this.message = t));
          }
          function Qn(e, t) {
            return (
              e +
              '. Errors: ' +
              Object.keys(t)
                .map(function (n) {
                  return t[n].toString();
                })
                .filter(function (n, r, i) {
                  return i.indexOf(n) === r;
                }).join(`
`)
            );
          }
          function Kt(e, t, n, r) {
            ((this.failures = t),
              (this.failedKeys = r),
              (this.successCount = n),
              (this.message = Qn(e, t)));
          }
          function Je(e, t) {
            ((this.name = 'BulkError'),
              (this.failures = Object.keys(t).map(function (n) {
                return t[n];
              })),
              (this.failuresByPos = t),
              (this.message = Qn(e, this.failures)));
          }
          (me(Xe)
            .from(Error)
            .extend({
              toString: function () {
                return this.name + ': ' + this.message;
              },
            }),
            me(Kt).from(Xe),
            me(Je).from(Xe));
          var cn = ye.reduce(function (e, t) {
              return ((e[t] = t + 'Error'), e);
            }, {}),
            ti = Xe,
            D = ye.reduce(function (e, t) {
              var n = t + 'Error';
              function r(i, o) {
                ((this.name = n),
                  i
                    ? typeof i == 'string'
                      ? ((this.message = ''.concat(i).concat(
                          o
                            ? `
 ` + o
                            : '',
                        )),
                        (this.inner = o || null))
                      : typeof i == 'object' &&
                        ((this.message = ''
                          .concat(i.name, ' ')
                          .concat(i.message)),
                        (this.inner = i))
                    : ((this.message = ei[t] || n), (this.inner = null)));
              }
              return (me(r).from(ti), (e[t] = r), e);
            }, {});
          ((D.Syntax = SyntaxError),
            (D.Type = TypeError),
            (D.Range = RangeError));
          var Hn = ht.reduce(function (e, t) {
              return ((e[t + 'Error'] = D[t]), e);
            }, {}),
            St = ye.reduce(function (e, t) {
              return (
                ['Syntax', 'Type', 'Range'].indexOf(t) === -1 &&
                  (e[t + 'Error'] = D[t]),
                e
              );
            }, {});
          function G() {}
          function lt(e) {
            return e;
          }
          function ni(e, t) {
            return e == null || e === lt
              ? t
              : function (n) {
                  return t(e(n));
                };
          }
          function Ne(e, t) {
            return function () {
              (e.apply(this, arguments), t.apply(this, arguments));
            };
          }
          function ri(e, t) {
            return e === G
              ? t
              : function () {
                  var n = e.apply(this, arguments);
                  n !== void 0 && (arguments[0] = n);
                  var r = this.onsuccess,
                    i = this.onerror;
                  ((this.onsuccess = null), (this.onerror = null));
                  var o = t.apply(this, arguments);
                  return (
                    r &&
                      (this.onsuccess = this.onsuccess
                        ? Ne(r, this.onsuccess)
                        : r),
                    i &&
                      (this.onerror = this.onerror ? Ne(i, this.onerror) : i),
                    o !== void 0 ? o : n
                  );
                };
          }
          function ii(e, t) {
            return e === G
              ? t
              : function () {
                  e.apply(this, arguments);
                  var n = this.onsuccess,
                    r = this.onerror;
                  ((this.onsuccess = this.onerror = null),
                    t.apply(this, arguments),
                    n &&
                      (this.onsuccess = this.onsuccess
                        ? Ne(n, this.onsuccess)
                        : n),
                    r &&
                      (this.onerror = this.onerror ? Ne(r, this.onerror) : r));
                };
          }
          function oi(e, t) {
            return e === G
              ? t
              : function (n) {
                  var r = e.apply(this, arguments);
                  W(n, r);
                  var i = this.onsuccess,
                    o = this.onerror;
                  return (
                    (this.onsuccess = null),
                    (this.onerror = null),
                    (n = t.apply(this, arguments)),
                    i &&
                      (this.onsuccess = this.onsuccess
                        ? Ne(i, this.onsuccess)
                        : i),
                    o &&
                      (this.onerror = this.onerror ? Ne(o, this.onerror) : o),
                    r === void 0 ? (n === void 0 ? void 0 : n) : W(r, n)
                  );
                };
          }
          function ai(e, t) {
            return e === G
              ? t
              : function () {
                  return (
                    t.apply(this, arguments) !== !1 && e.apply(this, arguments)
                  );
                };
          }
          function ln(e, t) {
            return e === G
              ? t
              : function () {
                  var n = e.apply(this, arguments);
                  if (n && typeof n.then == 'function') {
                    for (
                      var r = this, i = arguments.length, o = new Array(i);
                      i--;

                    )
                      o[i] = arguments[i];
                    return n.then(function () {
                      return t.apply(r, o);
                    });
                  }
                  return t.apply(this, arguments);
                };
          }
          ((St.ModifyError = Kt), (St.DexieError = Xe), (St.BulkError = Je));
          var be =
            typeof location < 'u' &&
            /^(http|https):\/\/(localhost|127\.0\.0\.1)/.test(location.href);
          function Xn(e) {
            be = e;
          }
          var ft = {},
            Jn = 100,
            Me =
              typeof Promise > 'u'
                ? []
                : (function () {
                    var e = Promise.resolve();
                    if (typeof crypto > 'u' || !crypto.subtle)
                      return [e, X(e), e];
                    var t = crypto.subtle.digest(
                      'SHA-512',
                      new Uint8Array([0]),
                    );
                    return [t, X(t), e];
                  })(),
            ht = Me[0],
            ye = Me[1],
            Me = Me[2],
            ye = ye && ye.then,
            Fe = ht && ht.constructor,
            fn = !!Me,
            dt = function (e, t) {
              (pt.push([e, t]), At && (queueMicrotask(si), (At = !1)));
            },
            hn = !0,
            At = !0,
            Le = [],
            Ct = [],
            dn = lt,
            Ee = {
              id: 'global',
              global: !0,
              ref: 0,
              unhandleds: [],
              onunhandled: G,
              pgp: !1,
              env: {},
              finalize: G,
            },
            T = Ee,
            pt = [],
            Ue = 0,
            jt = [];
          function A(e) {
            if (typeof this != 'object')
              throw new TypeError('Promises must be constructed via new');
            ((this._listeners = []), (this._lib = !1));
            var t = (this._PSD = T);
            if (typeof e != 'function') {
              if (e !== ft) throw new TypeError('Not a function');
              return (
                (this._state = arguments[1]),
                (this._value = arguments[2]),
                void (this._state === !1 && yn(this, this._value))
              );
            }
            ((this._state = null),
              (this._value = null),
              ++t.ref,
              (function n(r, i) {
                try {
                  i(
                    function (o) {
                      if (r._state === null) {
                        if (o === r)
                          throw new TypeError(
                            'A promise cannot be resolved with itself.',
                          );
                        var a = r._lib && Ze();
                        (o && typeof o.then == 'function'
                          ? n(r, function (u, c) {
                              o instanceof A ? o._then(u, c) : o.then(u, c);
                            })
                          : ((r._state = !0), (r._value = o), er(r)),
                          a && et());
                      }
                    },
                    yn.bind(null, r),
                  );
                } catch (o) {
                  yn(r, o);
                }
              })(this, e));
          }
          var pn = {
            get: function () {
              var e = T,
                t = Bt;
              function n(r, i) {
                var o = this,
                  a = !e.global && (e !== T || t !== Bt),
                  u = a && !Se(),
                  c = new A(function (l, p) {
                    vn(o, new Zn(nr(r, e, a, u), nr(i, e, a, u), l, p, e));
                  });
                return (
                  this._consoleTask && (c._consoleTask = this._consoleTask),
                  c
                );
              }
              return ((n.prototype = ft), n);
            },
            set: function (e) {
              re(
                this,
                'then',
                e && e.prototype === ft
                  ? pn
                  : {
                      get: function () {
                        return e;
                      },
                      set: pn.set,
                    },
              );
            },
          };
          function Zn(e, t, n, r, i) {
            ((this.onFulfilled = typeof e == 'function' ? e : null),
              (this.onRejected = typeof t == 'function' ? t : null),
              (this.resolve = n),
              (this.reject = r),
              (this.psd = i));
          }
          function yn(e, t) {
            var n, r;
            (Ct.push(t),
              e._state === null &&
                ((n = e._lib && Ze()),
                (t = dn(t)),
                (e._state = !1),
                (e._value = t),
                (r = e),
                Le.some(function (i) {
                  return i._value === r._value;
                }) || Le.push(r),
                er(e),
                n && et()));
          }
          function er(e) {
            var t = e._listeners;
            e._listeners = [];
            for (var n = 0, r = t.length; n < r; ++n) vn(e, t[n]);
            var i = e._PSD;
            (--i.ref || i.finalize(),
              Ue === 0 &&
                (++Ue,
                dt(function () {
                  --Ue == 0 && mn();
                }, [])));
          }
          function vn(e, t) {
            if (e._state !== null) {
              var n = e._state ? t.onFulfilled : t.onRejected;
              if (n === null)
                return (e._state ? t.resolve : t.reject)(e._value);
              (++t.psd.ref, ++Ue, dt(ui, [n, e, t]));
            } else e._listeners.push(t);
          }
          function ui(e, t, n) {
            try {
              var r,
                i = t._value;
              (!t._state && Ct.length && (Ct = []),
                (r =
                  be && t._consoleTask
                    ? t._consoleTask.run(function () {
                        return e(i);
                      })
                    : e(i)),
                t._state ||
                  Ct.indexOf(i) !== -1 ||
                  (function (o) {
                    for (var a = Le.length; a; )
                      if (Le[--a]._value === o._value) return Le.splice(a, 1);
                  })(t),
                n.resolve(r));
            } catch (o) {
              n.reject(o);
            } finally {
              (--Ue == 0 && mn(), --n.psd.ref || n.psd.finalize());
            }
          }
          function si() {
            Ve(Ee, function () {
              Ze() && et();
            });
          }
          function Ze() {
            var e = hn;
            return ((At = hn = !1), e);
          }
          function et() {
            var e, t, n;
            do
              for (; 0 < pt.length; )
                for (e = pt, pt = [], n = e.length, t = 0; t < n; ++t) {
                  var r = e[t];
                  r[0].apply(null, r[1]);
                }
            while (0 < pt.length);
            At = hn = !0;
          }
          function mn() {
            var e = Le;
            ((Le = []),
              e.forEach(function (r) {
                r._PSD.onunhandled.call(null, r._value, r);
              }));
            for (var t = jt.slice(0), n = t.length; n; ) t[--n]();
          }
          function Tt(e) {
            return new A(ft, !1, e);
          }
          function H(e, t) {
            var n = T;
            return function () {
              var r = Ze(),
                i = T;
              try {
                return (Ae(n, !0), e.apply(this, arguments));
              } catch (o) {
                t && t(o);
              } finally {
                (Ae(i, !1), r && et());
              }
            };
          }
          (J(A.prototype, {
            then: pn,
            _then: function (e, t) {
              vn(this, new Zn(null, null, e, t, T));
            },
            catch: function (e) {
              if (arguments.length === 1) return this.then(null, e);
              var t = e,
                n = arguments[1];
              return typeof t == 'function'
                ? this.then(null, function (r) {
                    return (r instanceof t ? n : Tt)(r);
                  })
                : this.then(null, function (r) {
                    return (r && r.name === t ? n : Tt)(r);
                  });
            },
            finally: function (e) {
              return this.then(
                function (t) {
                  return A.resolve(e()).then(function () {
                    return t;
                  });
                },
                function (t) {
                  return A.resolve(e()).then(function () {
                    return Tt(t);
                  });
                },
              );
            },
            timeout: function (e, t) {
              var n = this;
              return e < 1 / 0
                ? new A(function (r, i) {
                    var o = setTimeout(function () {
                      return i(new D.Timeout(t));
                    }, e);
                    n.then(r, i).finally(clearTimeout.bind(null, o));
                  })
                : this;
            },
          }),
            typeof Symbol < 'u' &&
              Symbol.toStringTag &&
              re(A.prototype, Symbol.toStringTag, 'Dexie.Promise'),
            (Ee.env = tr()),
            J(A, {
              all: function () {
                var e = we.apply(null, arguments).map(qt);
                return new A(function (t, n) {
                  e.length === 0 && t([]);
                  var r = e.length;
                  e.forEach(function (i, o) {
                    return A.resolve(i).then(function (a) {
                      ((e[o] = a), --r || t(e));
                    }, n);
                  });
                });
              },
              resolve: function (e) {
                return e instanceof A
                  ? e
                  : e && typeof e.then == 'function'
                    ? new A(function (t, n) {
                        e.then(t, n);
                      })
                    : new A(ft, !0, e);
              },
              reject: Tt,
              race: function () {
                var e = we.apply(null, arguments).map(qt);
                return new A(function (t, n) {
                  e.map(function (r) {
                    return A.resolve(r).then(t, n);
                  });
                });
              },
              PSD: {
                get: function () {
                  return T;
                },
                set: function (e) {
                  return (T = e);
                },
              },
              totalEchoes: {
                get: function () {
                  return Bt;
                },
              },
              newPSD: Ke,
              usePSD: Ve,
              scheduler: {
                get: function () {
                  return dt;
                },
                set: function (e) {
                  dt = e;
                },
              },
              rejectionMapper: {
                get: function () {
                  return dn;
                },
                set: function (e) {
                  dn = e;
                },
              },
              follow: function (e, t) {
                return new A(function (n, r) {
                  return Ke(
                    function (i, o) {
                      var a = T;
                      ((a.unhandleds = []),
                        (a.onunhandled = o),
                        (a.finalize = Ne(function () {
                          var u,
                            c = this;
                          ((u = function () {
                            c.unhandleds.length === 0
                              ? i()
                              : o(c.unhandleds[0]);
                          }),
                            jt.push(function l() {
                              (u(), jt.splice(jt.indexOf(l), 1));
                            }),
                            ++Ue,
                            dt(function () {
                              --Ue == 0 && mn();
                            }, []));
                        }, a.finalize)),
                        e());
                    },
                    t,
                    n,
                    r,
                  );
                });
              },
            }),
            Fe &&
              (Fe.allSettled &&
                re(A, 'allSettled', function () {
                  var e = we.apply(null, arguments).map(qt);
                  return new A(function (t) {
                    e.length === 0 && t([]);
                    var n = e.length,
                      r = new Array(n);
                    e.forEach(function (i, o) {
                      return A.resolve(i)
                        .then(
                          function (a) {
                            return (r[o] = { status: 'fulfilled', value: a });
                          },
                          function (a) {
                            return (r[o] = { status: 'rejected', reason: a });
                          },
                        )
                        .then(function () {
                          return --n || t(r);
                        });
                    });
                  });
                }),
              Fe.any &&
                typeof AggregateError < 'u' &&
                re(A, 'any', function () {
                  var e = we.apply(null, arguments).map(qt);
                  return new A(function (t, n) {
                    e.length === 0 && n(new AggregateError([]));
                    var r = e.length,
                      i = new Array(r);
                    e.forEach(function (o, a) {
                      return A.resolve(o).then(
                        function (u) {
                          return t(u);
                        },
                        function (u) {
                          ((i[a] = u), --r || n(new AggregateError(i)));
                        },
                      );
                    });
                  });
                }),
              Fe.withResolvers && (A.withResolvers = Fe.withResolvers)));
          var oe = { awaits: 0, echoes: 0, id: 0 },
            ci = 0,
            It = [],
            Dt = 0,
            Bt = 0,
            li = 0;
          function Ke(e, t, n, r) {
            var i = T,
              o = Object.create(i);
            return (
              (o.parent = i),
              (o.ref = 0),
              (o.global = !1),
              (o.id = ++li),
              Ee.env,
              (o.env = fn
                ? {
                    Promise: A,
                    PromiseProp: { value: A, configurable: !0, writable: !0 },
                    all: A.all,
                    race: A.race,
                    allSettled: A.allSettled,
                    any: A.any,
                    resolve: A.resolve,
                    reject: A.reject,
                  }
                : {}),
              t && W(o, t),
              ++i.ref,
              (o.finalize = function () {
                --this.parent.ref || this.parent.finalize();
              }),
              (r = Ve(o, e, n, r)),
              o.ref === 0 && o.finalize(),
              r
            );
          }
          function tt() {
            return (
              oe.id || (oe.id = ++ci),
              ++oe.awaits,
              (oe.echoes += Jn),
              oe.id
            );
          }
          function Se() {
            return (
              !!oe.awaits &&
              (--oe.awaits == 0 && (oe.id = 0),
              (oe.echoes = oe.awaits * Jn),
              !0)
            );
          }
          function qt(e) {
            return oe.echoes && e && e.constructor === Fe
              ? (tt(),
                e.then(
                  function (t) {
                    return (Se(), t);
                  },
                  function (t) {
                    return (Se(), Z(t));
                  },
                ))
              : e;
          }
          function fi() {
            var e = It[It.length - 1];
            (It.pop(), Ae(e, !1));
          }
          function Ae(e, t) {
            var n,
              r = T;
            ((t ? !oe.echoes || (Dt++ && e === T) : !Dt || (--Dt && e === T)) ||
              queueMicrotask(
                t
                  ? function (i) {
                      (++Bt,
                        (oe.echoes && --oe.echoes != 0) ||
                          (oe.echoes = oe.awaits = oe.id = 0),
                        It.push(T),
                        Ae(i, !0));
                    }.bind(null, e)
                  : fi,
              ),
              e !== T &&
                ((T = e),
                r === Ee && (Ee.env = tr()),
                fn &&
                  ((n = Ee.env.Promise),
                  (t = e.env),
                  (r.global || e.global) &&
                    (Object.defineProperty(V, 'Promise', t.PromiseProp),
                    (n.all = t.all),
                    (n.race = t.race),
                    (n.resolve = t.resolve),
                    (n.reject = t.reject),
                    t.allSettled && (n.allSettled = t.allSettled),
                    t.any && (n.any = t.any)))));
          }
          function tr() {
            var e = V.Promise;
            return fn
              ? {
                  Promise: e,
                  PromiseProp: Object.getOwnPropertyDescriptor(V, 'Promise'),
                  all: e.all,
                  race: e.race,
                  allSettled: e.allSettled,
                  any: e.any,
                  resolve: e.resolve,
                  reject: e.reject,
                }
              : {};
          }
          function Ve(e, t, n, r, i) {
            var o = T;
            try {
              return (Ae(e, !0), t(n, r, i));
            } finally {
              Ae(o, !1);
            }
          }
          function nr(e, t, n, r) {
            return typeof e != 'function'
              ? e
              : function () {
                  var i = T;
                  (n && tt(), Ae(t, !0));
                  try {
                    return e.apply(this, arguments);
                  } finally {
                    (Ae(i, !1), r && queueMicrotask(Se));
                  }
                };
          }
          function bn(e) {
            Promise === Fe && oe.echoes === 0
              ? Dt === 0
                ? e()
                : enqueueNativeMicroTask(e)
              : setTimeout(e, 0);
          }
          ('' + ye).indexOf('[native code]') === -1 && (tt = Se = G);
          var Z = A.reject,
            $e = '￿',
            ke =
              'Invalid key provided. Keys must be of type string, number, Date or Array<string | number | Date>.',
            rr = 'String expected.',
            nt = [],
            Rt = '__dbnames',
            gn = 'readonly',
            _n = 'readwrite';
          function ze(e, t) {
            return e
              ? t
                ? function () {
                    return e.apply(this, arguments) && t.apply(this, arguments);
                  }
                : e
              : t;
          }
          var ir = {
            type: 3,
            lower: -1 / 0,
            lowerOpen: !1,
            upper: [[]],
            upperOpen: !1,
          };
          function Nt(e) {
            return typeof e != 'string' || /\./.test(e)
              ? function (t) {
                  return t;
                }
              : function (t) {
                  return (
                    t[e] === void 0 && e in t && delete (t = qe(t))[e],
                    t
                  );
                };
          }
          function or() {
            throw D.Type(
              'Entity instances must never be new:ed. Instances are generated by the framework bypassing the constructor.',
            );
          }
          function F(e, t) {
            try {
              var n = ar(e),
                r = ar(t);
              if (n !== r)
                return n === 'Array'
                  ? 1
                  : r === 'Array'
                    ? -1
                    : n === 'binary'
                      ? 1
                      : r === 'binary'
                        ? -1
                        : n === 'string'
                          ? 1
                          : r === 'string'
                            ? -1
                            : n === 'Date'
                              ? 1
                              : r !== 'Date'
                                ? NaN
                                : -1;
              switch (n) {
                case 'number':
                case 'Date':
                case 'string':
                  return t < e ? 1 : e < t ? -1 : 0;
                case 'binary':
                  return (function (i, o) {
                    for (
                      var a = i.length, u = o.length, c = a < u ? a : u, l = 0;
                      l < c;
                      ++l
                    )
                      if (i[l] !== o[l]) return i[l] < o[l] ? -1 : 1;
                    return a === u ? 0 : a < u ? -1 : 1;
                  })(ur(e), ur(t));
                case 'Array':
                  return (function (i, o) {
                    for (
                      var a = i.length, u = o.length, c = a < u ? a : u, l = 0;
                      l < c;
                      ++l
                    ) {
                      var p = F(i[l], o[l]);
                      if (p !== 0) return p;
                    }
                    return a === u ? 0 : a < u ? -1 : 1;
                  })(e, t);
              }
            } catch {}
            return NaN;
          }
          function ar(e) {
            var t = typeof e;
            return t != 'object'
              ? t
              : ArrayBuffer.isView(e)
                ? 'binary'
                : ((e = an(e)), e === 'ArrayBuffer' ? 'binary' : e);
          }
          function ur(e) {
            return e instanceof Uint8Array
              ? e
              : ArrayBuffer.isView(e)
                ? new Uint8Array(e.buffer, e.byteOffset, e.byteLength)
                : new Uint8Array(e);
          }
          function Mt(e, t, n) {
            var r = e.schema.yProps;
            return r
              ? (t &&
                  0 < n.numFailures &&
                  (t = t.filter(function (i, o) {
                    return !n.failures[o];
                  })),
                Promise.all(
                  r.map(function (i) {
                    return (
                      (i = i.updatesTable),
                      t
                        ? e.db.table(i).where('k').anyOf(t).delete()
                        : e.db.table(i).clear()
                    );
                  }),
                ).then(function () {
                  return n;
                }))
              : n;
          }
          var yt =
            ((sr.prototype.execute = function (e) {
              var t = this['@@propmod'];
              if (t.add !== void 0) {
                var n = t.add;
                if (z(n)) return U(U([], z(e) ? e : [], !0), n).sort();
                if (typeof n == 'number') return (Number(e) || 0) + n;
                if (typeof n == 'bigint')
                  try {
                    return BigInt(e) + n;
                  } catch {
                    return BigInt(0) + n;
                  }
                throw new TypeError('Invalid term '.concat(n));
              }
              if (t.remove !== void 0) {
                var r = t.remove;
                if (z(r))
                  return z(e)
                    ? e
                        .filter(function (i) {
                          return !r.includes(i);
                        })
                        .sort()
                    : [];
                if (typeof r == 'number') return Number(e) - r;
                if (typeof r == 'bigint')
                  try {
                    return BigInt(e) - r;
                  } catch {
                    return BigInt(0) - r;
                  }
                throw new TypeError('Invalid subtrahend '.concat(r));
              }
              return (
                (n =
                  (n = t.replacePrefix) === null || n === void 0
                    ? void 0
                    : n[0]),
                n && typeof e == 'string' && e.startsWith(n)
                  ? t.replacePrefix[1] + e.substring(n.length)
                  : e
              );
            }),
            sr);
          function sr(e) {
            this['@@propmod'] = e;
          }
          function cr(e, t) {
            for (var n = $(t), r = n.length, i = !1, o = 0; o < r; ++o) {
              var a = n[o],
                u = t[a],
                c = L(e, a);
              u instanceof yt
                ? (M(e, a, u.execute(c)), (i = !0))
                : c !== u && (M(e, a, u), (i = !0));
            }
            return i;
          }
          var lr =
            ((Q.prototype._trans = function (e, t, n) {
              var r = this._tx || T.trans,
                i = this.name,
                o =
                  be &&
                  typeof console < 'u' &&
                  console.createTask &&
                  console.createTask(
                    'Dexie: '
                      .concat(e === 'readonly' ? 'read' : 'write', ' ')
                      .concat(this.name),
                  );
              function a(l, p, s) {
                if (!s.schema[i])
                  throw new D.NotFound(
                    'Table ' + i + ' not part of transaction',
                  );
                return t(s.idbtrans, s);
              }
              var u = Ze();
              try {
                var c =
                  r && r.db._novip === this.db._novip
                    ? r === T.trans
                      ? r._promise(e, a, n)
                      : Ke(
                          function () {
                            return r._promise(e, a, n);
                          },
                          { trans: r, transless: T.transless || T },
                        )
                    : (function l(p, s, v, f) {
                        if (
                          p.idbdb &&
                          (p._state.openComplete || T.letThrough || p._vip)
                        ) {
                          var h = p._createTransaction(s, v, p._dbSchema);
                          try {
                            (h.create(), (p._state.PR1398_maxLoop = 3));
                          } catch (d) {
                            return d.name === cn.InvalidState &&
                              p.isOpen() &&
                              0 < --p._state.PR1398_maxLoop
                              ? (console.warn('Dexie: Need to reopen db'),
                                p.close({ disableAutoOpen: !1 }),
                                p.open().then(function () {
                                  return l(p, s, v, f);
                                }))
                              : Z(d);
                          }
                          return h
                            ._promise(s, function (d, y) {
                              return Ke(function () {
                                return ((T.trans = h), f(d, y, h));
                              });
                            })
                            .then(function (d) {
                              if (s === 'readwrite')
                                try {
                                  h.idbtrans.commit();
                                } catch {}
                              return s === 'readonly'
                                ? d
                                : h._completion.then(function () {
                                    return d;
                                  });
                            });
                        }
                        if (p._state.openComplete)
                          return Z(new D.DatabaseClosed(p._state.dbOpenError));
                        if (!p._state.isBeingOpened) {
                          if (!p._state.autoOpen)
                            return Z(new D.DatabaseClosed());
                          p.open().catch(G);
                        }
                        return p._state.dbReadyPromise.then(function () {
                          return l(p, s, v, f);
                        });
                      })(this.db, e, [this.name], a);
                return (
                  o &&
                    ((c._consoleTask = o),
                    (c = c.catch(function (l) {
                      return (console.trace(l), Z(l));
                    }))),
                  c
                );
              } finally {
                u && et();
              }
            }),
            (Q.prototype.get = function (e, t) {
              var n = this;
              return e && e.constructor === Object
                ? this.where(e).first(t)
                : e == null
                  ? Z(new D.Type('Invalid argument to Table.get()'))
                  : this._trans('readonly', function (r) {
                      return n.core
                        .get({ trans: r, key: e })
                        .then(function (i) {
                          return n.hook.reading.fire(i);
                        });
                    }).then(t);
            }),
            (Q.prototype.where = function (e) {
              if (typeof e == 'string') return new this.db.WhereClause(this, e);
              if (z(e))
                return new this.db.WhereClause(
                  this,
                  '['.concat(e.join('+'), ']'),
                );
              var t = $(e);
              if (t.length === 1) return this.where(t[0]).equals(e[t[0]]);
              var n = this.schema.indexes
                .concat(this.schema.primKey)
                .filter(function (u) {
                  if (
                    u.compound &&
                    t.every(function (l) {
                      return 0 <= u.keyPath.indexOf(l);
                    })
                  ) {
                    for (var c = 0; c < t.length; ++c)
                      if (t.indexOf(u.keyPath[c]) === -1) return !1;
                    return !0;
                  }
                  return !1;
                })
                .sort(function (u, c) {
                  return u.keyPath.length - c.keyPath.length;
                })[0];
              if (n && this.db._maxKey !== $e) {
                var o = n.keyPath.slice(0, t.length);
                return this.where(o).equals(
                  o.map(function (c) {
                    return e[c];
                  }),
                );
              }
              !n &&
                be &&
                console.warn(
                  'The query '
                    .concat(JSON.stringify(e), ' on ')
                    .concat(this.name, ' would benefit from a ') +
                    'compound index ['.concat(t.join('+'), ']'),
                );
              var r = this.schema.idxByName;
              function i(u, c) {
                return F(u, c) === 0;
              }
              var a = t.reduce(
                  function (s, c) {
                    var l = s[0],
                      p = s[1],
                      s = r[c],
                      v = e[c];
                    return [
                      l || s,
                      l || !s
                        ? ze(
                            p,
                            s && s.multi
                              ? function (f) {
                                  return (
                                    (f = L(f, c)),
                                    z(f) &&
                                      f.some(function (h) {
                                        return i(v, h);
                                      })
                                  );
                                }
                              : function (f) {
                                  return i(v, L(f, c));
                                },
                          )
                        : p,
                    ];
                  },
                  [null, null],
                ),
                o = a[0],
                a = a[1];
              return o
                ? this.where(o.name).equals(e[o.keyPath]).filter(a)
                : n
                  ? this.filter(a)
                  : this.where(t).equals('');
            }),
            (Q.prototype.filter = function (e) {
              return this.toCollection().and(e);
            }),
            (Q.prototype.count = function (e) {
              return this.toCollection().count(e);
            }),
            (Q.prototype.offset = function (e) {
              return this.toCollection().offset(e);
            }),
            (Q.prototype.limit = function (e) {
              return this.toCollection().limit(e);
            }),
            (Q.prototype.each = function (e) {
              return this.toCollection().each(e);
            }),
            (Q.prototype.toArray = function (e) {
              return this.toCollection().toArray(e);
            }),
            (Q.prototype.toCollection = function () {
              return new this.db.Collection(new this.db.WhereClause(this));
            }),
            (Q.prototype.orderBy = function (e) {
              return new this.db.Collection(
                new this.db.WhereClause(
                  this,
                  z(e) ? '['.concat(e.join('+'), ']') : e,
                ),
              );
            }),
            (Q.prototype.reverse = function () {
              return this.toCollection().reverse();
            }),
            (Q.prototype.mapToClass = function (e) {
              var t,
                n = this.db,
                r = this.name;
              function i() {
                return (t !== null && t.apply(this, arguments)) || this;
              }
              (this.schema.mappedClass = e).prototype instanceof or &&
                ((function (c, l) {
                  if (typeof l != 'function' && l !== null)
                    throw new TypeError(
                      'Class extends value ' +
                        String(l) +
                        ' is not a constructor or null',
                    );
                  function p() {
                    this.constructor = c;
                  }
                  (I(c, l),
                    (c.prototype =
                      l === null
                        ? Object.create(l)
                        : ((p.prototype = l.prototype), new p())));
                })(i, (t = e)),
                Object.defineProperty(i.prototype, 'db', {
                  get: function () {
                    return n;
                  },
                  enumerable: !1,
                  configurable: !0,
                }),
                (i.prototype.table = function () {
                  return r;
                }),
                (e = i));
              for (var o = new Set(), a = e.prototype; a; a = X(a))
                Object.getOwnPropertyNames(a).forEach(function (c) {
                  return o.add(c);
                });
              function u(c) {
                if (!c) return c;
                var l,
                  p = Object.create(e.prototype);
                for (l in c)
                  if (!o.has(l))
                    try {
                      p[l] = c[l];
                    } catch {}
                return p;
              }
              return (
                this.schema.readHook &&
                  this.hook.reading.unsubscribe(this.schema.readHook),
                (this.schema.readHook = u),
                this.hook('reading', u),
                e
              );
            }),
            (Q.prototype.defineClass = function () {
              return this.mapToClass(function (e) {
                W(this, e);
              });
            }),
            (Q.prototype.add = function (e, t) {
              var n = this,
                r = this.schema.primKey,
                i = r.auto,
                o = r.keyPath,
                a = e;
              return (
                o && i && (a = Nt(o)(e)),
                this._trans('readwrite', function (u) {
                  return n.core.mutate({
                    trans: u,
                    type: 'add',
                    keys: t != null ? [t] : null,
                    values: [a],
                  });
                })
                  .then(function (u) {
                    return u.numFailures
                      ? A.reject(u.failures[0])
                      : u.lastResult;
                  })
                  .then(function (u) {
                    if (o)
                      try {
                        M(e, o, u);
                      } catch {}
                    return u;
                  })
              );
            }),
            (Q.prototype.upsert = function (e, t) {
              var n = this,
                r = this.schema.primKey.keyPath;
              return this._trans('readwrite', function (i) {
                return n.core.get({ trans: i, key: e }).then(function (o) {
                  var a = o ?? {};
                  return (
                    cr(a, t),
                    r && M(a, r, e),
                    n.core
                      .mutate({
                        trans: i,
                        type: 'put',
                        values: [a],
                        keys: [e],
                        upsert: !0,
                        updates: { keys: [e], changeSpecs: [t] },
                      })
                      .then(function (u) {
                        return u.numFailures ? A.reject(u.failures[0]) : !!o;
                      })
                  );
                });
              });
            }),
            (Q.prototype.update = function (e, t) {
              return typeof e != 'object' || z(e)
                ? this.where(':id').equals(e).modify(t)
                : ((e = L(e, this.schema.primKey.keyPath)),
                  e === void 0
                    ? Z(
                        new D.InvalidArgument(
                          'Given object does not contain its primary key',
                        ),
                      )
                    : this.where(':id').equals(e).modify(t));
            }),
            (Q.prototype.put = function (e, t) {
              var n = this,
                r = this.schema.primKey,
                i = r.auto,
                o = r.keyPath,
                a = e;
              return (
                o && i && (a = Nt(o)(e)),
                this._trans('readwrite', function (u) {
                  return n.core.mutate({
                    trans: u,
                    type: 'put',
                    values: [a],
                    keys: t != null ? [t] : null,
                  });
                })
                  .then(function (u) {
                    return u.numFailures
                      ? A.reject(u.failures[0])
                      : u.lastResult;
                  })
                  .then(function (u) {
                    if (o)
                      try {
                        M(e, o, u);
                      } catch {}
                    return u;
                  })
              );
            }),
            (Q.prototype.delete = function (e) {
              var t = this;
              return this._trans('readwrite', function (n) {
                return t.core
                  .mutate({ trans: n, type: 'delete', keys: [e] })
                  .then(function (r) {
                    return Mt(t, [e], r);
                  })
                  .then(function (r) {
                    return r.numFailures ? A.reject(r.failures[0]) : void 0;
                  });
              });
            }),
            (Q.prototype.clear = function () {
              var e = this;
              return this._trans('readwrite', function (t) {
                return e.core
                  .mutate({ trans: t, type: 'deleteRange', range: ir })
                  .then(function (n) {
                    return Mt(e, null, n);
                  });
              }).then(function (t) {
                return t.numFailures ? A.reject(t.failures[0]) : void 0;
              });
            }),
            (Q.prototype.bulkGet = function (e) {
              var t = this;
              return this._trans('readonly', function (n) {
                return t.core.getMany({ keys: e, trans: n }).then(function (r) {
                  return r.map(function (i) {
                    return t.hook.reading.fire(i);
                  });
                });
              });
            }),
            (Q.prototype.bulkAdd = function (e, t, n) {
              var r = this,
                i = Array.isArray(t) ? t : void 0,
                o = (n = n || (i ? void 0 : t)) ? n.allKeys : void 0;
              return this._trans('readwrite', function (a) {
                var l = r.schema.primKey,
                  u = l.auto,
                  l = l.keyPath;
                if (l && i)
                  throw new D.InvalidArgument(
                    'bulkAdd(): keys argument invalid on tables with inbound keys',
                  );
                if (i && i.length !== e.length)
                  throw new D.InvalidArgument(
                    'Arguments objects and keys must have the same length',
                  );
                var c = e.length,
                  l = l && u ? e.map(Nt(l)) : e;
                return r.core
                  .mutate({
                    trans: a,
                    type: 'add',
                    keys: i,
                    values: l,
                    wantResults: o,
                  })
                  .then(function (h) {
                    var s = h.numFailures,
                      v = h.results,
                      f = h.lastResult,
                      h = h.failures;
                    if (s === 0) return o ? v : f;
                    throw new Je(
                      ''
                        .concat(r.name, '.bulkAdd(): ')
                        .concat(s, ' of ')
                        .concat(c, ' operations failed'),
                      h,
                    );
                  });
              });
            }),
            (Q.prototype.bulkPut = function (e, t, n) {
              var r = this,
                i = Array.isArray(t) ? t : void 0,
                o = (n = n || (i ? void 0 : t)) ? n.allKeys : void 0;
              return this._trans('readwrite', function (a) {
                var l = r.schema.primKey,
                  u = l.auto,
                  l = l.keyPath;
                if (l && i)
                  throw new D.InvalidArgument(
                    'bulkPut(): keys argument invalid on tables with inbound keys',
                  );
                if (i && i.length !== e.length)
                  throw new D.InvalidArgument(
                    'Arguments objects and keys must have the same length',
                  );
                var c = e.length,
                  l = l && u ? e.map(Nt(l)) : e;
                return r.core
                  .mutate({
                    trans: a,
                    type: 'put',
                    keys: i,
                    values: l,
                    wantResults: o,
                  })
                  .then(function (h) {
                    var s = h.numFailures,
                      v = h.results,
                      f = h.lastResult,
                      h = h.failures;
                    if (s === 0) return o ? v : f;
                    throw new Je(
                      ''
                        .concat(r.name, '.bulkPut(): ')
                        .concat(s, ' of ')
                        .concat(c, ' operations failed'),
                      h,
                    );
                  });
              });
            }),
            (Q.prototype.bulkUpdate = function (e) {
              var t = this,
                n = this.core,
                r = e.map(function (a) {
                  return a.key;
                }),
                i = e.map(function (a) {
                  return a.changes;
                }),
                o = [];
              return this._trans('readwrite', function (a) {
                return n
                  .getMany({ trans: a, keys: r, cache: 'clone' })
                  .then(function (u) {
                    var c = [],
                      l = [];
                    e.forEach(function (s, v) {
                      var f = s.key,
                        h = s.changes,
                        d = u[v];
                      if (d) {
                        for (var y = 0, m = Object.keys(h); y < m.length; y++) {
                          var b = m[y],
                            g = h[b];
                          if (b === t.schema.primKey.keyPath) {
                            if (F(g, f) !== 0)
                              throw new D.Constraint(
                                'Cannot update primary key in bulkUpdate()',
                              );
                          } else M(d, b, g);
                        }
                        (o.push(v), c.push(f), l.push(d));
                      }
                    });
                    var p = c.length;
                    return n
                      .mutate({
                        trans: a,
                        type: 'put',
                        keys: c,
                        values: l,
                        updates: { keys: r, changeSpecs: i },
                      })
                      .then(function (s) {
                        var v = s.numFailures,
                          f = s.failures;
                        if (v === 0) return p;
                        for (var h = 0, d = Object.keys(f); h < d.length; h++) {
                          var y,
                            m = d[h],
                            b = o[Number(m)];
                          b != null && ((y = f[m]), delete f[m], (f[b] = y));
                        }
                        throw new Je(
                          ''
                            .concat(t.name, '.bulkUpdate(): ')
                            .concat(v, ' of ')
                            .concat(p, ' operations failed'),
                          f,
                        );
                      });
                  });
              });
            }),
            (Q.prototype.bulkDelete = function (e) {
              var t = this,
                n = e.length;
              return this._trans('readwrite', function (r) {
                return t.core
                  .mutate({ trans: r, type: 'delete', keys: e })
                  .then(function (i) {
                    return Mt(t, e, i);
                  });
              }).then(function (a) {
                var i = a.numFailures,
                  o = a.lastResult,
                  a = a.failures;
                if (i === 0) return o;
                throw new Je(
                  ''
                    .concat(t.name, '.bulkDelete(): ')
                    .concat(i, ' of ')
                    .concat(n, ' operations failed'),
                  a,
                );
              });
            }),
            Q);
          function Q() {}
          function vt(e) {
            function t(a, u) {
              if (u) {
                for (var c = arguments.length, l = new Array(c - 1); --c; )
                  l[c - 1] = arguments[c];
                return (n[a].subscribe.apply(null, l), e);
              }
              if (typeof a == 'string') return n[a];
            }
            var n = {};
            t.addEventType = o;
            for (var r = 1, i = arguments.length; r < i; ++r) o(arguments[r]);
            return t;
            function o(a, u, c) {
              if (typeof a != 'object') {
                var l;
                u = u || ai;
                var p = {
                  subscribers: [],
                  fire: (c = c || G),
                  subscribe: function (s) {
                    p.subscribers.indexOf(s) === -1 &&
                      (p.subscribers.push(s), (p.fire = u(p.fire, s)));
                  },
                  unsubscribe: function (s) {
                    ((p.subscribers = p.subscribers.filter(function (v) {
                      return v !== s;
                    })),
                      (p.fire = p.subscribers.reduce(u, c)));
                  },
                };
                return (n[a] = t[a] = p);
              }
              $((l = a)).forEach(function (s) {
                var v = l[s];
                if (z(v)) o(s, l[s][0], l[s][1]);
                else {
                  if (v !== 'asap')
                    throw new D.InvalidArgument('Invalid event config');
                  var f = o(s, lt, function () {
                    for (var h = arguments.length, d = new Array(h); h--; )
                      d[h] = arguments[h];
                    f.subscribers.forEach(function (y) {
                      ct(function () {
                        y.apply(null, d);
                      });
                    });
                  });
                }
              });
            }
          }
          function mt(e, t) {
            return (me(t).from({ prototype: e }), t);
          }
          function rt(e, t) {
            return (
              !(e.filter || e.algorithm || e.or) &&
              (t ? e.justLimit : !e.replayFilter)
            );
          }
          function wn(e, t) {
            e.filter = ze(e.filter, t);
          }
          function kn(e, t, n) {
            var r = e.replayFilter;
            ((e.replayFilter = r
              ? function () {
                  return ze(r(), t());
                }
              : t),
              (e.justLimit = n && !r));
          }
          function Ft(e, t) {
            if (e.isPrimKey) return t.primaryKey;
            var n = t.getIndexByKeyPath(e.index);
            if (!n)
              throw new D.Schema(
                'KeyPath ' +
                  e.index +
                  ' on object store ' +
                  t.name +
                  ' is not indexed',
              );
            return n;
          }
          function fr(e, t, n) {
            var r = Ft(e, t.schema);
            return t.openCursor({
              trans: n,
              values: !e.keysOnly,
              reverse: e.dir === 'prev',
              unique: !!e.unique,
              query: { index: r, range: e.range },
            });
          }
          function Lt(e, t, n, r) {
            var i = e.replayFilter ? ze(e.filter, e.replayFilter()) : e.filter;
            if (e.or) {
              var o = {},
                a = function (u, c, l) {
                  var p, s;
                  (i &&
                    !i(
                      c,
                      l,
                      function (v) {
                        return c.stop(v);
                      },
                      function (v) {
                        return c.fail(v);
                      },
                    )) ||
                    ((s = '' + (p = c.primaryKey)) == '[object ArrayBuffer]' &&
                      (s = '' + new Uint8Array(p)),
                    te(o, s) || ((o[s] = !0), t(u, c, l)));
                };
              return Promise.all([
                e.or._iterate(a, n),
                hr(fr(e, r, n), e.algorithm, a, !e.keysOnly && e.valueMapper),
              ]);
            }
            return hr(
              fr(e, r, n),
              ze(e.algorithm, i),
              t,
              !e.keysOnly && e.valueMapper,
            );
          }
          function hr(e, t, n, r) {
            var i = H(
              r
                ? function (o, a, u) {
                    return n(r(o), a, u);
                  }
                : n,
            );
            return e.then(function (o) {
              if (o)
                return o.start(function () {
                  var a = function () {
                    return o.continue();
                  };
                  ((t &&
                    !t(
                      o,
                      function (u) {
                        return (a = u);
                      },
                      function (u) {
                        (o.stop(u), (a = G));
                      },
                      function (u) {
                        (o.fail(u), (a = G));
                      },
                    )) ||
                    i(o.value, o, function (u) {
                      return (a = u);
                    }),
                    a());
                });
            });
          }
          var hi =
            ((Y.prototype._read = function (e, t) {
              var n = this._ctx;
              return n.error
                ? n.table._trans(null, Z.bind(null, n.error))
                : n.table._trans('readonly', e).then(t);
            }),
            (Y.prototype._write = function (e) {
              var t = this._ctx;
              return t.error
                ? t.table._trans(null, Z.bind(null, t.error))
                : t.table._trans('readwrite', e, 'locked');
            }),
            (Y.prototype._addAlgorithm = function (e) {
              var t = this._ctx;
              t.algorithm = ze(t.algorithm, e);
            }),
            (Y.prototype._iterate = function (e, t) {
              return Lt(this._ctx, e, t, this._ctx.table.core);
            }),
            (Y.prototype.clone = function (e) {
              var t = Object.create(this.constructor.prototype),
                n = Object.create(this._ctx);
              return (e && W(n, e), (t._ctx = n), t);
            }),
            (Y.prototype.raw = function () {
              return ((this._ctx.valueMapper = null), this);
            }),
            (Y.prototype.each = function (e) {
              var t = this._ctx;
              return this._read(function (n) {
                return Lt(t, e, n, t.table.core);
              });
            }),
            (Y.prototype.count = function (e) {
              var t = this;
              return this._read(function (n) {
                var r = t._ctx,
                  i = r.table.core;
                if (rt(r, !0))
                  return i
                    .count({
                      trans: n,
                      query: { index: Ft(r, i.schema), range: r.range },
                    })
                    .then(function (a) {
                      return Math.min(a, r.limit);
                    });
                var o = 0;
                return Lt(
                  r,
                  function () {
                    return (++o, !1);
                  },
                  n,
                  i,
                ).then(function () {
                  return o;
                });
              }).then(e);
            }),
            (Y.prototype.sortBy = function (e, t) {
              var n = e.split('.').reverse(),
                r = n[0],
                i = n.length - 1;
              function o(c, l) {
                return l ? o(c[n[l]], l - 1) : c[r];
              }
              var a = this._ctx.dir === 'next' ? 1 : -1;
              function u(c, l) {
                return F(o(c, i), o(l, i)) * a;
              }
              return this.toArray(function (c) {
                return c.sort(u);
              }).then(t);
            }),
            (Y.prototype.toArray = function (e) {
              var t = this;
              return this._read(function (n) {
                var r = t._ctx;
                if (r.dir === 'next' && rt(r, !0) && 0 < r.limit) {
                  var i = r.valueMapper,
                    o = Ft(r, r.table.core.schema);
                  return r.table.core
                    .query({
                      trans: n,
                      limit: r.limit,
                      values: !0,
                      query: { index: o, range: r.range },
                    })
                    .then(function (u) {
                      return ((u = u.result), i ? u.map(i) : u);
                    });
                }
                var a = [];
                return Lt(
                  r,
                  function (u) {
                    return a.push(u);
                  },
                  n,
                  r.table.core,
                ).then(function () {
                  return a;
                });
              }, e);
            }),
            (Y.prototype.offset = function (e) {
              var t = this._ctx;
              return (
                e <= 0 ||
                  ((t.offset += e),
                  rt(t)
                    ? kn(t, function () {
                        var n = e;
                        return function (r, i) {
                          return (
                            n === 0 ||
                            (n === 1
                              ? --n
                              : i(function () {
                                  (r.advance(n), (n = 0));
                                }),
                            !1)
                          );
                        };
                      })
                    : kn(t, function () {
                        var n = e;
                        return function () {
                          return --n < 0;
                        };
                      })),
                this
              );
            }),
            (Y.prototype.limit = function (e) {
              return (
                (this._ctx.limit = Math.min(this._ctx.limit, e)),
                kn(
                  this._ctx,
                  function () {
                    var t = e;
                    return function (n, r, i) {
                      return (--t <= 0 && r(i), 0 <= t);
                    };
                  },
                  !0,
                ),
                this
              );
            }),
            (Y.prototype.until = function (e, t) {
              return (
                wn(this._ctx, function (n, r, i) {
                  return !e(n.value) || (r(i), t);
                }),
                this
              );
            }),
            (Y.prototype.first = function (e) {
              return this.limit(1)
                .toArray(function (t) {
                  return t[0];
                })
                .then(e);
            }),
            (Y.prototype.last = function (e) {
              return this.reverse().first(e);
            }),
            (Y.prototype.filter = function (e) {
              var t;
              return (
                wn(this._ctx, function (n) {
                  return e(n.value);
                }),
                ((t = this._ctx).isMatch = ze(t.isMatch, e)),
                this
              );
            }),
            (Y.prototype.and = function (e) {
              return this.filter(e);
            }),
            (Y.prototype.or = function (e) {
              return new this.db.WhereClause(this._ctx.table, e, this);
            }),
            (Y.prototype.reverse = function () {
              return (
                (this._ctx.dir = this._ctx.dir === 'prev' ? 'next' : 'prev'),
                this._ondirectionchange &&
                  this._ondirectionchange(this._ctx.dir),
                this
              );
            }),
            (Y.prototype.desc = function () {
              return this.reverse();
            }),
            (Y.prototype.eachKey = function (e) {
              var t = this._ctx;
              return (
                (t.keysOnly = !t.isMatch),
                this.each(function (n, r) {
                  e(r.key, r);
                })
              );
            }),
            (Y.prototype.eachUniqueKey = function (e) {
              return ((this._ctx.unique = 'unique'), this.eachKey(e));
            }),
            (Y.prototype.eachPrimaryKey = function (e) {
              var t = this._ctx;
              return (
                (t.keysOnly = !t.isMatch),
                this.each(function (n, r) {
                  e(r.primaryKey, r);
                })
              );
            }),
            (Y.prototype.keys = function (e) {
              var t = this._ctx;
              t.keysOnly = !t.isMatch;
              var n = [];
              return this.each(function (r, i) {
                n.push(i.key);
              })
                .then(function () {
                  return n;
                })
                .then(e);
            }),
            (Y.prototype.primaryKeys = function (e) {
              var t = this._ctx;
              if (t.dir === 'next' && rt(t, !0) && 0 < t.limit)
                return this._read(function (r) {
                  var i = Ft(t, t.table.core.schema);
                  return t.table.core.query({
                    trans: r,
                    values: !1,
                    limit: t.limit,
                    query: { index: i, range: t.range },
                  });
                })
                  .then(function (r) {
                    return r.result;
                  })
                  .then(e);
              t.keysOnly = !t.isMatch;
              var n = [];
              return this.each(function (r, i) {
                n.push(i.primaryKey);
              })
                .then(function () {
                  return n;
                })
                .then(e);
            }),
            (Y.prototype.uniqueKeys = function (e) {
              return ((this._ctx.unique = 'unique'), this.keys(e));
            }),
            (Y.prototype.firstKey = function (e) {
              return this.limit(1)
                .keys(function (t) {
                  return t[0];
                })
                .then(e);
            }),
            (Y.prototype.lastKey = function (e) {
              return this.reverse().firstKey(e);
            }),
            (Y.prototype.distinct = function () {
              var e = this._ctx,
                e = e.index && e.table.schema.idxByName[e.index];
              if (!e || !e.multi) return this;
              var t = {};
              return (
                wn(this._ctx, function (i) {
                  var r = i.primaryKey.toString(),
                    i = te(t, r);
                  return ((t[r] = !0), !i);
                }),
                this
              );
            }),
            (Y.prototype.modify = function (e) {
              var t = this,
                n = this._ctx;
              return this._write(function (r) {
                var i =
                    typeof e == 'function'
                      ? e
                      : function (d) {
                          return cr(d, e);
                        },
                  o = n.table.core,
                  l = o.schema.primaryKey,
                  a = l.outbound,
                  u = l.extractKey,
                  c = 200,
                  l = t.db._options.modifyChunkSize;
                l &&
                  (c = typeof l == 'object' ? l[o.name] || l['*'] || 200 : l);
                function p(d, b) {
                  var m = b.failures,
                    b = b.numFailures;
                  v += d - b;
                  for (var g = 0, _ = $(m); g < _.length; g++) {
                    var x = _[g];
                    s.push(m[x]);
                  }
                }
                var s = [],
                  v = 0,
                  f = [],
                  h = e === dr;
                return t
                  .clone()
                  .primaryKeys()
                  .then(function (d) {
                    function y(b) {
                      var g = Math.min(c, d.length - b),
                        _ = d.slice(b, b + g);
                      return (
                        h
                          ? Promise.resolve([])
                          : o.getMany({ trans: r, keys: _, cache: 'immutable' })
                      ).then(function (x) {
                        var K = [],
                          k = [],
                          O = a ? [] : null,
                          S = h ? _ : [];
                        if (!h)
                          for (var P = 0; P < g; ++P) {
                            var C = x[P],
                              q = { value: qe(C), primKey: d[b + P] };
                            i.call(q, q.value, q) !== !1 &&
                              (q.value == null
                                ? S.push(d[b + P])
                                : a || F(u(C), u(q.value)) === 0
                                  ? (k.push(q.value), a && O.push(d[b + P]))
                                  : (S.push(d[b + P]), K.push(q.value)));
                          }
                        return Promise.resolve(
                          0 < K.length &&
                            o
                              .mutate({ trans: r, type: 'add', values: K })
                              .then(function (R) {
                                for (var N in R.failures)
                                  S.splice(parseInt(N), 1);
                                p(K.length, R);
                              }),
                        )
                          .then(function () {
                            return (
                              (0 < k.length || (m && typeof e == 'object')) &&
                              o
                                .mutate({
                                  trans: r,
                                  type: 'put',
                                  keys: O,
                                  values: k,
                                  criteria: m,
                                  changeSpec: typeof e != 'function' && e,
                                  isAdditionalChunk: 0 < b,
                                })
                                .then(function (R) {
                                  return p(k.length, R);
                                })
                            );
                          })
                          .then(function () {
                            return (
                              (0 < S.length || (m && h)) &&
                              o
                                .mutate({
                                  trans: r,
                                  type: 'delete',
                                  keys: S,
                                  criteria: m,
                                  isAdditionalChunk: 0 < b,
                                })
                                .then(function (R) {
                                  return Mt(n.table, S, R);
                                })
                                .then(function (R) {
                                  return p(S.length, R);
                                })
                            );
                          })
                          .then(function () {
                            return d.length > b + g && y(b + c);
                          });
                      });
                    }
                    var m = rt(n) &&
                      n.limit === 1 / 0 &&
                      (typeof e != 'function' || h) && {
                        index: n.index,
                        range: n.range,
                      };
                    return y(0).then(function () {
                      if (0 < s.length)
                        throw new Kt(
                          'Error modifying one or more objects',
                          s,
                          v,
                          f,
                        );
                      return d.length;
                    });
                  });
              });
            }),
            (Y.prototype.delete = function () {
              var e = this._ctx,
                t = e.range;
              return !rt(e) ||
                e.table.schema.yProps ||
                (!e.isPrimKey && t.type !== 3)
                ? this.modify(dr)
                : this._write(function (n) {
                    var r = e.table.core.schema.primaryKey,
                      i = t;
                    return e.table.core
                      .count({ trans: n, query: { index: r, range: i } })
                      .then(function (o) {
                        return e.table.core
                          .mutate({ trans: n, type: 'deleteRange', range: i })
                          .then(function (c) {
                            var u = c.failures,
                              c = c.numFailures;
                            if (c)
                              throw new Kt(
                                'Could not delete some values',
                                Object.keys(u).map(function (l) {
                                  return u[l];
                                }),
                                o - c,
                              );
                            return o - c;
                          });
                      });
                  });
            }),
            Y);
          function Y() {}
          var dr = function (e, t) {
            return (t.value = null);
          };
          function di(e, t) {
            return e < t ? -1 : e === t ? 0 : 1;
          }
          function pi(e, t) {
            return t < e ? -1 : e === t ? 0 : 1;
          }
          function de(e, t, n) {
            return (
              (e = e instanceof yr ? new e.Collection(e) : e),
              (e._ctx.error = new (n || TypeError)(t)),
              e
            );
          }
          function it(e) {
            return new e.Collection(e, function () {
              return pr('');
            }).limit(0);
          }
          function Ut(e, t, n, r) {
            var i,
              o,
              a,
              u,
              c,
              l,
              p,
              s = n.length;
            if (
              !n.every(function (h) {
                return typeof h == 'string';
              })
            )
              return de(e, rr);
            function v(h) {
              ((i =
                h === 'next'
                  ? function (y) {
                      return y.toUpperCase();
                    }
                  : function (y) {
                      return y.toLowerCase();
                    }),
                (o =
                  h === 'next'
                    ? function (y) {
                        return y.toLowerCase();
                      }
                    : function (y) {
                        return y.toUpperCase();
                      }),
                (a = h === 'next' ? di : pi));
              var d = n
                .map(function (y) {
                  return { lower: o(y), upper: i(y) };
                })
                .sort(function (y, m) {
                  return a(y.lower, m.lower);
                });
              ((u = d.map(function (y) {
                return y.upper;
              })),
                (c = d.map(function (y) {
                  return y.lower;
                })),
                (p = (l = h) === 'next' ? '' : r));
            }
            (v('next'),
              (e = new e.Collection(e, function () {
                return Ce(u[0], c[s - 1] + r);
              })),
              (e._ondirectionchange = function (h) {
                v(h);
              }));
            var f = 0;
            return (
              e._addAlgorithm(function (h, d, y) {
                var m = h.key;
                if (typeof m != 'string') return !1;
                var b = o(m);
                if (t(b, c, f)) return !0;
                for (var g = null, _ = f; _ < s; ++_) {
                  var x = (function (K, k, O, S, P, C) {
                    for (
                      var q = Math.min(K.length, S.length), R = -1, N = 0;
                      N < q;
                      ++N
                    ) {
                      var pe = k[N];
                      if (pe !== S[N])
                        return P(K[N], O[N]) < 0
                          ? K.substr(0, N) + O[N] + O.substr(N + 1)
                          : P(K[N], S[N]) < 0
                            ? K.substr(0, N) + S[N] + O.substr(N + 1)
                            : 0 <= R
                              ? K.substr(0, R) + k[R] + O.substr(R + 1)
                              : null;
                      P(K[N], pe) < 0 && (R = N);
                    }
                    return q < S.length && C === 'next'
                      ? K + O.substr(K.length)
                      : q < K.length && C === 'prev'
                        ? K.substr(0, O.length)
                        : R < 0
                          ? null
                          : K.substr(0, R) + S[R] + O.substr(R + 1);
                  })(m, b, u[_], c[_], a, l);
                  x === null && g === null
                    ? (f = _ + 1)
                    : (g === null || 0 < a(g, x)) && (g = x);
                }
                return (
                  d(
                    g !== null
                      ? function () {
                          h.continue(g + p);
                        }
                      : y,
                  ),
                  !1
                );
              }),
              e
            );
          }
          function Ce(e, t, n, r) {
            return { type: 2, lower: e, upper: t, lowerOpen: n, upperOpen: r };
          }
          function pr(e) {
            return { type: 1, lower: e, upper: e };
          }
          var yr =
            (Object.defineProperty(ae.prototype, 'Collection', {
              get: function () {
                return this._ctx.table.db.Collection;
              },
              enumerable: !1,
              configurable: !0,
            }),
            (ae.prototype.between = function (e, t, n, r) {
              ((n = n !== !1), (r = r === !0));
              try {
                return 0 < this._cmp(e, t) ||
                  (this._cmp(e, t) === 0 && (n || r) && (!n || !r))
                  ? it(this)
                  : new this.Collection(this, function () {
                      return Ce(e, t, !n, !r);
                    });
              } catch {
                return de(this, ke);
              }
            }),
            (ae.prototype.equals = function (e) {
              return e == null
                ? de(this, ke)
                : new this.Collection(this, function () {
                    return pr(e);
                  });
            }),
            (ae.prototype.above = function (e) {
              return e == null
                ? de(this, ke)
                : new this.Collection(this, function () {
                    return Ce(e, void 0, !0);
                  });
            }),
            (ae.prototype.aboveOrEqual = function (e) {
              return e == null
                ? de(this, ke)
                : new this.Collection(this, function () {
                    return Ce(e, void 0, !1);
                  });
            }),
            (ae.prototype.below = function (e) {
              return e == null
                ? de(this, ke)
                : new this.Collection(this, function () {
                    return Ce(void 0, e, !1, !0);
                  });
            }),
            (ae.prototype.belowOrEqual = function (e) {
              return e == null
                ? de(this, ke)
                : new this.Collection(this, function () {
                    return Ce(void 0, e);
                  });
            }),
            (ae.prototype.startsWith = function (e) {
              return typeof e != 'string'
                ? de(this, rr)
                : this.between(e, e + $e, !0, !0);
            }),
            (ae.prototype.startsWithIgnoreCase = function (e) {
              return e === ''
                ? this.startsWith(e)
                : Ut(
                    this,
                    function (t, n) {
                      return t.indexOf(n[0]) === 0;
                    },
                    [e],
                    $e,
                  );
            }),
            (ae.prototype.equalsIgnoreCase = function (e) {
              return Ut(
                this,
                function (t, n) {
                  return t === n[0];
                },
                [e],
                '',
              );
            }),
            (ae.prototype.anyOfIgnoreCase = function () {
              var e = we.apply(He, arguments);
              return e.length === 0
                ? it(this)
                : Ut(
                    this,
                    function (t, n) {
                      return n.indexOf(t) !== -1;
                    },
                    e,
                    '',
                  );
            }),
            (ae.prototype.startsWithAnyOfIgnoreCase = function () {
              var e = we.apply(He, arguments);
              return e.length === 0
                ? it(this)
                : Ut(
                    this,
                    function (t, n) {
                      return n.some(function (r) {
                        return t.indexOf(r) === 0;
                      });
                    },
                    e,
                    $e,
                  );
            }),
            (ae.prototype.anyOf = function () {
              var e = this,
                t = we.apply(He, arguments),
                n = this._cmp;
              try {
                t.sort(n);
              } catch {
                return de(this, ke);
              }
              if (t.length === 0) return it(this);
              var r = new this.Collection(this, function () {
                return Ce(t[0], t[t.length - 1]);
              });
              r._ondirectionchange = function (o) {
                ((n = o === 'next' ? e._ascending : e._descending), t.sort(n));
              };
              var i = 0;
              return (
                r._addAlgorithm(function (o, a, u) {
                  for (var c = o.key; 0 < n(c, t[i]); )
                    if (++i === t.length) return (a(u), !1);
                  return (
                    n(c, t[i]) === 0 ||
                    (a(function () {
                      o.continue(t[i]);
                    }),
                    !1)
                  );
                }),
                r
              );
            }),
            (ae.prototype.notEqual = function (e) {
              return this.inAnyRange(
                [
                  [-1 / 0, e],
                  [e, this.db._maxKey],
                ],
                { includeLowers: !1, includeUppers: !1 },
              );
            }),
            (ae.prototype.noneOf = function () {
              var e = we.apply(He, arguments);
              if (e.length === 0) return new this.Collection(this);
              try {
                e.sort(this._ascending);
              } catch {
                return de(this, ke);
              }
              var t = e.reduce(function (n, r) {
                return n ? n.concat([[n[n.length - 1][1], r]]) : [[-1 / 0, r]];
              }, null);
              return (
                t.push([e[e.length - 1], this.db._maxKey]),
                this.inAnyRange(t, { includeLowers: !1, includeUppers: !1 })
              );
            }),
            (ae.prototype.inAnyRange = function (m, t) {
              var n = this,
                r = this._cmp,
                i = this._ascending,
                o = this._descending,
                a = this._min,
                u = this._max;
              if (m.length === 0) return it(this);
              if (
                !m.every(function (b) {
                  return (
                    b[0] !== void 0 && b[1] !== void 0 && i(b[0], b[1]) <= 0
                  );
                })
              )
                return de(
                  this,
                  'First argument to inAnyRange() must be an Array of two-value Arrays [lower,upper] where upper must not be lower than lower',
                  D.InvalidArgument,
                );
              var c = !t || t.includeLowers !== !1,
                l = t && t.includeUppers === !0,
                p,
                s = i;
              function v(b, g) {
                return s(b[0], g[0]);
              }
              try {
                (p = m.reduce(function (b, g) {
                  for (var _ = 0, x = b.length; _ < x; ++_) {
                    var K = b[_];
                    if (r(g[0], K[1]) < 0 && 0 < r(g[1], K[0])) {
                      ((K[0] = a(K[0], g[0])), (K[1] = u(K[1], g[1])));
                      break;
                    }
                  }
                  return (_ === x && b.push(g), b);
                }, [])).sort(v);
              } catch {
                return de(this, ke);
              }
              var f = 0,
                h = l
                  ? function (b) {
                      return 0 < i(b, p[f][1]);
                    }
                  : function (b) {
                      return 0 <= i(b, p[f][1]);
                    },
                d = c
                  ? function (b) {
                      return 0 < o(b, p[f][0]);
                    }
                  : function (b) {
                      return 0 <= o(b, p[f][0]);
                    },
                y = h,
                m = new this.Collection(this, function () {
                  return Ce(p[0][0], p[p.length - 1][1], !c, !l);
                });
              return (
                (m._ondirectionchange = function (b) {
                  ((s = b === 'next' ? ((y = h), i) : ((y = d), o)), p.sort(v));
                }),
                m._addAlgorithm(function (b, g, _) {
                  for (var x, K = b.key; y(K); )
                    if (++f === p.length) return (g(_), !1);
                  return (
                    (!h((x = K)) && !d(x)) ||
                    (n._cmp(K, p[f][1]) === 0 ||
                      n._cmp(K, p[f][0]) === 0 ||
                      g(function () {
                        s === i ? b.continue(p[f][0]) : b.continue(p[f][1]);
                      }),
                    !1)
                  );
                }),
                m
              );
            }),
            (ae.prototype.startsWithAnyOf = function () {
              var e = we.apply(He, arguments);
              return e.every(function (t) {
                return typeof t == 'string';
              })
                ? e.length === 0
                  ? it(this)
                  : this.inAnyRange(
                      e.map(function (t) {
                        return [t, t + $e];
                      }),
                    )
                : de(this, 'startsWithAnyOf() only works with strings');
            }),
            ae);
          function ae() {}
          function ge(e) {
            return H(function (t) {
              return (bt(t), e(t.target.error), !1);
            });
          }
          function bt(e) {
            (e.stopPropagation && e.stopPropagation(),
              e.preventDefault && e.preventDefault());
          }
          var gt = 'storagemutated',
            xn = 'x-storagemutated-1',
            je = vt(null, gt),
            yi =
              ((_e.prototype._lock = function () {
                return (
                  ne(!T.global),
                  ++this._reculock,
                  this._reculock !== 1 || T.global || (T.lockOwnerFor = this),
                  this
                );
              }),
              (_e.prototype._unlock = function () {
                if ((ne(!T.global), --this._reculock == 0))
                  for (
                    T.global || (T.lockOwnerFor = null);
                    0 < this._blockedFuncs.length && !this._locked();

                  ) {
                    var e = this._blockedFuncs.shift();
                    try {
                      Ve(e[1], e[0]);
                    } catch {}
                  }
                return this;
              }),
              (_e.prototype._locked = function () {
                return this._reculock && T.lockOwnerFor !== this;
              }),
              (_e.prototype.create = function (e) {
                var t = this;
                if (!this.mode) return this;
                var n = this.db.idbdb,
                  r = this.db._state.dbOpenError;
                if ((ne(!this.idbtrans), !e && !n))
                  switch (r && r.name) {
                    case 'DatabaseClosedError':
                      throw new D.DatabaseClosed(r);
                    case 'MissingAPIError':
                      throw new D.MissingAPI(r.message, r);
                    default:
                      throw new D.OpenFailed(r);
                  }
                if (!this.active) throw new D.TransactionInactive();
                return (
                  ne(this._completion._state === null),
                  ((e = this.idbtrans =
                    e ||
                    (this.db.core || n).transaction(
                      this.storeNames,
                      this.mode,
                      { durability: this.chromeTransactionDurability },
                    )).onerror = H(function (i) {
                    (bt(i), t._reject(e.error));
                  })),
                  (e.onabort = H(function (i) {
                    (bt(i),
                      t.active && t._reject(new D.Abort(e.error)),
                      (t.active = !1),
                      t.on('abort').fire(i));
                  })),
                  (e.oncomplete = H(function () {
                    ((t.active = !1),
                      t._resolve(),
                      'mutatedParts' in e &&
                        je.storagemutated.fire(e.mutatedParts));
                  })),
                  this
                );
              }),
              (_e.prototype._promise = function (e, t, n) {
                var r = this;
                if (e === 'readwrite' && this.mode !== 'readwrite')
                  return Z(new D.ReadOnly('Transaction is readonly'));
                if (!this.active) return Z(new D.TransactionInactive());
                if (this._locked())
                  return new A(function (o, a) {
                    r._blockedFuncs.push([
                      function () {
                        r._promise(e, t, n).then(o, a);
                      },
                      T,
                    ]);
                  });
                if (n)
                  return Ke(function () {
                    var o = new A(function (a, u) {
                      r._lock();
                      var c = t(a, u, r);
                      c && c.then && c.then(a, u);
                    });
                    return (
                      o.finally(function () {
                        return r._unlock();
                      }),
                      (o._lib = !0),
                      o
                    );
                  });
                var i = new A(function (o, a) {
                  var u = t(o, a, r);
                  u && u.then && u.then(o, a);
                });
                return ((i._lib = !0), i);
              }),
              (_e.prototype._root = function () {
                return this.parent ? this.parent._root() : this;
              }),
              (_e.prototype.waitFor = function (e) {
                var t,
                  n = this._root(),
                  r = A.resolve(e);
                n._waitingFor
                  ? (n._waitingFor = n._waitingFor.then(function () {
                      return r;
                    }))
                  : ((n._waitingFor = r),
                    (n._waitingQueue = []),
                    (t = n.idbtrans.objectStore(n.storeNames[0])),
                    (function o() {
                      for (++n._spinCount; n._waitingQueue.length; )
                        n._waitingQueue.shift()();
                      n._waitingFor && (t.get(-1 / 0).onsuccess = o);
                    })());
                var i = n._waitingFor;
                return new A(function (o, a) {
                  r.then(
                    function (u) {
                      return n._waitingQueue.push(H(o.bind(null, u)));
                    },
                    function (u) {
                      return n._waitingQueue.push(H(a.bind(null, u)));
                    },
                  ).finally(function () {
                    n._waitingFor === i && (n._waitingFor = null);
                  });
                });
              }),
              (_e.prototype.abort = function () {
                this.active &&
                  ((this.active = !1),
                  this.idbtrans && this.idbtrans.abort(),
                  this._reject(new D.Abort()));
              }),
              (_e.prototype.table = function (e) {
                var t = this._memoizedTables || (this._memoizedTables = {});
                if (te(t, e)) return t[e];
                var n = this.schema[e];
                if (!n)
                  throw new D.NotFound(
                    'Table ' + e + ' not part of transaction',
                  );
                return (
                  (n = new this.db.Table(e, n, this)),
                  (n.core = this.db.core.table(e)),
                  (t[e] = n)
                );
              }),
              _e);
          function _e() {}
          function On(e, t, n, r, i, o, a, u) {
            return {
              name: e,
              keyPath: t,
              unique: n,
              multi: r,
              auto: i,
              compound: o,
              src:
                (n && !a ? '&' : '') + (r ? '*' : '') + (i ? '++' : '') + vr(t),
              type: u,
            };
          }
          function vr(e) {
            return typeof e == 'string'
              ? e
              : e
                ? '[' + [].join.call(e, '+') + ']'
                : '';
          }
          function Pn(e, t, n) {
            return {
              name: e,
              primKey: t,
              indexes: n,
              mappedClass: null,
              idxByName:
                ((r = function (i) {
                  return [i.name, i];
                }),
                n.reduce(function (i, o, a) {
                  return ((a = r(o, a)), a && (i[a[0]] = a[1]), i);
                }, {})),
            };
            var r;
          }
          var _t = function (e) {
            try {
              return (
                e.only([[]]),
                (_t = function () {
                  return [[]];
                }),
                [[]]
              );
            } catch {
              return (
                (_t = function () {
                  return $e;
                }),
                $e
              );
            }
          };
          function En(e) {
            return e == null
              ? function () {}
              : typeof e == 'string'
                ? (t = e).split('.').length === 1
                  ? function (n) {
                      return n[t];
                    }
                  : function (n) {
                      return L(n, t);
                    }
                : function (n) {
                    return L(n, e);
                  };
            var t;
          }
          function mr(e) {
            return [].slice.call(e);
          }
          var vi = 0;
          function wt(e) {
            return e == null
              ? ':id'
              : typeof e == 'string'
                ? e
                : '['.concat(e.join('+'), ']');
          }
          function mi(e, t, c) {
            function r(y) {
              if (y.type === 3) return null;
              if (y.type === 4)
                throw new Error('Cannot convert never type to IDBKeyRange');
              var f = y.lower,
                h = y.upper,
                d = y.lowerOpen,
                y = y.upperOpen;
              return f === void 0
                ? h === void 0
                  ? null
                  : t.upperBound(h, !!y)
                : h === void 0
                  ? t.lowerBound(f, !!d)
                  : t.bound(f, h, !!d, !!y);
            }
            function i(v) {
              var f,
                h = v.name;
              return {
                name: h,
                schema: v,
                mutate: function (d) {
                  var y = d.trans,
                    m = d.type,
                    b = d.keys,
                    g = d.values,
                    _ = d.range;
                  return new Promise(function (x, K) {
                    x = H(x);
                    var k = y.objectStore(h),
                      O = k.keyPath == null,
                      S = m === 'put' || m === 'add';
                    if (!S && m !== 'delete' && m !== 'deleteRange')
                      throw new Error('Invalid operation type: ' + m);
                    var P,
                      C = (b || g || { length: 1 }).length;
                    if (b && g && b.length !== g.length)
                      throw new Error(
                        'Given keys array must have same length as given values array.',
                      );
                    if (C === 0)
                      return x({
                        numFailures: 0,
                        failures: {},
                        results: [],
                        lastResult: void 0,
                      });
                    function q(he) {
                      (++pe, bt(he));
                    }
                    var R = [],
                      N = [],
                      pe = 0;
                    if (m === 'deleteRange') {
                      if (_.type === 4)
                        return x({
                          numFailures: pe,
                          failures: N,
                          results: [],
                          lastResult: void 0,
                        });
                      _.type === 3
                        ? R.push((P = k.clear()))
                        : R.push((P = k.delete(r(_))));
                    } else {
                      var O = S ? (O ? [g, b] : [g, null]) : [b, null],
                        B = O[0],
                        ce = O[1];
                      if (S)
                        for (var le = 0; le < C; ++le)
                          (R.push(
                            (P =
                              ce && ce[le] !== void 0
                                ? k[m](B[le], ce[le])
                                : k[m](B[le])),
                          ),
                            (P.onerror = q));
                      else
                        for (le = 0; le < C; ++le)
                          (R.push((P = k[m](B[le]))), (P.onerror = q));
                    }
                    function en(he) {
                      ((he = he.target.result),
                        R.forEach(function (Ge, $n) {
                          return Ge.error != null && (N[$n] = Ge.error);
                        }),
                        x({
                          numFailures: pe,
                          failures: N,
                          results:
                            m === 'delete'
                              ? b
                              : R.map(function (Ge) {
                                  return Ge.result;
                                }),
                          lastResult: he,
                        }));
                    }
                    ((P.onerror = function (he) {
                      (q(he), en(he));
                    }),
                      (P.onsuccess = en));
                  });
                },
                getMany: function (d) {
                  var y = d.trans,
                    m = d.keys;
                  return new Promise(function (b, g) {
                    b = H(b);
                    for (
                      var _,
                        x = y.objectStore(h),
                        K = m.length,
                        k = new Array(K),
                        O = 0,
                        S = 0,
                        P = function (R) {
                          ((R = R.target),
                            (k[R._pos] = R.result),
                            ++S === O && b(k));
                        },
                        C = ge(g),
                        q = 0;
                      q < K;
                      ++q
                    )
                      m[q] != null &&
                        (((_ = x.get(m[q]))._pos = q),
                        (_.onsuccess = P),
                        (_.onerror = C),
                        ++O);
                    O === 0 && b(k);
                  });
                },
                get: function (d) {
                  var y = d.trans,
                    m = d.key;
                  return new Promise(function (b, g) {
                    b = H(b);
                    var _ = y.objectStore(h).get(m);
                    ((_.onsuccess = function (x) {
                      return b(x.target.result);
                    }),
                      (_.onerror = ge(g)));
                  });
                },
                query:
                  ((f = l),
                  function (d) {
                    return new Promise(function (y, m) {
                      y = H(y);
                      var b,
                        g,
                        _,
                        O = d.trans,
                        x = d.values,
                        K = d.limit,
                        P = d.query,
                        k = K === 1 / 0 ? void 0 : K,
                        S = P.index,
                        P = P.range,
                        O = O.objectStore(h),
                        S = S.isPrimaryKey ? O : O.index(S.name),
                        P = r(P);
                      if (K === 0) return y({ result: [] });
                      f
                        ? (((k = x
                            ? S.getAll(P, k)
                            : S.getAllKeys(P, k)).onsuccess = function (C) {
                            return y({ result: C.target.result });
                          }),
                          (k.onerror = ge(m)))
                        : ((b = 0),
                          (g =
                            !x && 'openKeyCursor' in S
                              ? S.openKeyCursor(P)
                              : S.openCursor(P)),
                          (_ = []),
                          (g.onsuccess = function (C) {
                            var q = g.result;
                            return q
                              ? (_.push(x ? q.value : q.primaryKey),
                                ++b === K
                                  ? y({ result: _ })
                                  : void q.continue())
                              : y({ result: _ });
                          }),
                          (g.onerror = ge(m)));
                    });
                  }),
                openCursor: function (d) {
                  var y = d.trans,
                    m = d.values,
                    b = d.query,
                    g = d.reverse,
                    _ = d.unique;
                  return new Promise(function (x, K) {
                    x = H(x);
                    var S = b.index,
                      k = b.range,
                      O = y.objectStore(h),
                      O = S.isPrimaryKey ? O : O.index(S.name),
                      S = g
                        ? _
                          ? 'prevunique'
                          : 'prev'
                        : _
                          ? 'nextunique'
                          : 'next',
                      P =
                        !m && 'openKeyCursor' in O
                          ? O.openKeyCursor(r(k), S)
                          : O.openCursor(r(k), S);
                    ((P.onerror = ge(K)),
                      (P.onsuccess = H(function (C) {
                        var q,
                          R,
                          N,
                          pe,
                          B = P.result;
                        B
                          ? ((B.___id = ++vi),
                            (B.done = !1),
                            (q = B.continue.bind(B)),
                            (R = (R = B.continuePrimaryKey) && R.bind(B)),
                            (N = B.advance.bind(B)),
                            (pe = function () {
                              throw new Error('Cursor not stopped');
                            }),
                            (B.trans = y),
                            (B.stop =
                              B.continue =
                              B.continuePrimaryKey =
                              B.advance =
                                function () {
                                  throw new Error('Cursor not started');
                                }),
                            (B.fail = H(K)),
                            (B.next = function () {
                              var ce = this,
                                le = 1;
                              return this.start(function () {
                                return le-- ? ce.continue() : ce.stop();
                              }).then(function () {
                                return ce;
                              });
                            }),
                            (B.start = function (ce) {
                              function le() {
                                if (P.result)
                                  try {
                                    ce();
                                  } catch (he) {
                                    B.fail(he);
                                  }
                                else
                                  ((B.done = !0),
                                    (B.start = function () {
                                      throw new Error(
                                        'Cursor behind last entry',
                                      );
                                    }),
                                    B.stop());
                              }
                              var en = new Promise(function (he, Ge) {
                                ((he = H(he)),
                                  (P.onerror = ge(Ge)),
                                  (B.fail = Ge),
                                  (B.stop = function ($n) {
                                    ((B.stop =
                                      B.continue =
                                      B.continuePrimaryKey =
                                      B.advance =
                                        pe),
                                      he($n));
                                  }));
                              });
                              return (
                                (P.onsuccess = H(function (he) {
                                  ((P.onsuccess = le), le());
                                })),
                                (B.continue = q),
                                (B.continuePrimaryKey = R),
                                (B.advance = N),
                                le(),
                                en
                              );
                            }),
                            x(B))
                          : x(null);
                      }, K)));
                  });
                },
                count: function (d) {
                  var y = d.query,
                    m = d.trans,
                    b = y.index,
                    g = y.range;
                  return new Promise(function (_, x) {
                    var K = m.objectStore(h),
                      k = b.isPrimaryKey ? K : K.index(b.name),
                      K = r(g),
                      k = K ? k.count(K) : k.count();
                    ((k.onsuccess = H(function (O) {
                      return _(O.target.result);
                    })),
                      (k.onerror = ge(x)));
                  });
                },
              };
            }
            var o,
              a,
              u,
              p =
                ((a = c),
                (u = mr((o = e).objectStoreNames)),
                {
                  schema: {
                    name: o.name,
                    tables: u
                      .map(function (v) {
                        return a.objectStore(v);
                      })
                      .map(function (v) {
                        var f = v.keyPath,
                          y = v.autoIncrement,
                          h = z(f),
                          d = {},
                          y = {
                            name: v.name,
                            primaryKey: {
                              name: null,
                              isPrimaryKey: !0,
                              outbound: f == null,
                              compound: h,
                              keyPath: f,
                              autoIncrement: y,
                              unique: !0,
                              extractKey: En(f),
                            },
                            indexes: mr(v.indexNames)
                              .map(function (m) {
                                return v.index(m);
                              })
                              .map(function (_) {
                                var b = _.name,
                                  g = _.unique,
                                  x = _.multiEntry,
                                  _ = _.keyPath,
                                  x = {
                                    name: b,
                                    compound: z(_),
                                    keyPath: _,
                                    unique: g,
                                    multiEntry: x,
                                    extractKey: En(_),
                                  };
                                return (d[wt(_)] = x);
                              }),
                            getIndexByKeyPath: function (m) {
                              return d[wt(m)];
                            },
                          };
                        return (
                          (d[':id'] = y.primaryKey),
                          f != null && (d[wt(f)] = y.primaryKey),
                          y
                        );
                      }),
                  },
                  hasGetAll:
                    0 < u.length &&
                    'getAll' in a.objectStore(u[0]) &&
                    !(
                      typeof navigator < 'u' &&
                      /Safari/.test(navigator.userAgent) &&
                      !/(Chrome\/|Edge\/)/.test(navigator.userAgent) &&
                      [].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1] <
                        604
                    ),
                }),
              c = p.schema,
              l = p.hasGetAll,
              p = c.tables.map(i),
              s = {};
            return (
              p.forEach(function (v) {
                return (s[v.name] = v);
              }),
              {
                stack: 'dbcore',
                transaction: e.transaction.bind(e),
                table: function (v) {
                  if (!s[v])
                    throw new Error("Table '".concat(v, "' not found"));
                  return s[v];
                },
                MIN_KEY: -1 / 0,
                MAX_KEY: _t(t),
                schema: c,
              }
            );
          }
          function bi(e, t, n, r) {
            var i = n.IDBKeyRange;
            return (
              n.indexedDB,
              {
                dbcore:
                  ((r = mi(t, i, r)),
                  e.dbcore.reduce(function (o, a) {
                    return ((a = a.create), E(E({}, o), a(o)));
                  }, r)),
              }
            );
          }
          function Vt(e, r) {
            var n = r.db,
              r = bi(e._middlewares, n, e._deps, r);
            ((e.core = r.dbcore),
              e.tables.forEach(function (i) {
                var o = i.name;
                e.core.schema.tables.some(function (a) {
                  return a.name === o;
                }) &&
                  ((i.core = e.core.table(o)),
                  e[o] instanceof e.Table && (e[o].core = i.core));
              }));
          }
          function $t(e, t, n, r) {
            n.forEach(function (i) {
              var o = r[i];
              t.forEach(function (a) {
                var u = (function c(l, p) {
                  return Ie(l, p) || ((l = X(l)) && c(l, p));
                })(a, i);
                (!u || ('value' in u && u.value === void 0)) &&
                  (a === e.Transaction.prototype || a instanceof e.Transaction
                    ? re(a, i, {
                        get: function () {
                          return this.table(i);
                        },
                        set: function (c) {
                          Oe(this, i, {
                            value: c,
                            writable: !0,
                            configurable: !0,
                            enumerable: !0,
                          });
                        },
                      })
                    : (a[i] = new e.Table(i, o)));
              });
            });
          }
          function Kn(e, t) {
            t.forEach(function (n) {
              for (var r in n) n[r] instanceof e.Table && delete n[r];
            });
          }
          function gi(e, t) {
            return e._cfg.version - t._cfg.version;
          }
          function _i(e, t, n, r) {
            var i = e._dbSchema;
            n.objectStoreNames.contains('$meta') &&
              !i.$meta &&
              ((i.$meta = Pn('$meta', gr('')[0], [])),
              e._storeNames.push('$meta'));
            var o = e._createTransaction('readwrite', e._storeNames, i);
            (o.create(n), o._completion.catch(r));
            var a = o._reject.bind(o),
              u = T.transless || T;
            Ke(function () {
              return (
                (T.trans = o),
                (T.transless = u),
                t !== 0
                  ? (Vt(e, n),
                    (l = t),
                    ((c = o).storeNames.includes('$meta')
                      ? c
                          .table('$meta')
                          .get('version')
                          .then(function (p) {
                            return p ?? l;
                          })
                      : A.resolve(l)
                    )
                      .then(function (p) {
                        return (
                          (v = p),
                          (f = o),
                          (h = n),
                          (d = []),
                          (p = (s = e)._versions),
                          (y = s._dbSchema = Yt(0, s.idbdb, h)),
                          (p = p.filter(function (m) {
                            return m._cfg.version >= v;
                          })).length !== 0
                            ? (p.forEach(function (m) {
                                (d.push(function () {
                                  var b = y,
                                    g = m._cfg.dbschema;
                                  (Wt(s, b, h),
                                    Wt(s, g, h),
                                    (y = s._dbSchema = g));
                                  var _ = Sn(b, g);
                                  (_.add.forEach(function (S) {
                                    An(h, S[0], S[1].primKey, S[1].indexes);
                                  }),
                                    _.change.forEach(function (S) {
                                      if (S.recreate)
                                        throw new D.Upgrade(
                                          'Not yet support for changing primary key',
                                        );
                                      var P = h.objectStore(S.name);
                                      (S.add.forEach(function (C) {
                                        return zt(P, C);
                                      }),
                                        S.change.forEach(function (C) {
                                          (P.deleteIndex(C.name), zt(P, C));
                                        }),
                                        S.del.forEach(function (C) {
                                          return P.deleteIndex(C);
                                        }));
                                    }));
                                  var x = m._cfg.contentUpgrade;
                                  if (x && m._cfg.version > v) {
                                    (Vt(s, h), (f._memoizedTables = {}));
                                    var K = ue(g);
                                    (_.del.forEach(function (S) {
                                      K[S] = b[S];
                                    }),
                                      Kn(s, [s.Transaction.prototype]),
                                      $t(s, [s.Transaction.prototype], $(K), K),
                                      (f.schema = K));
                                    var k,
                                      O = sn(x);
                                    return (
                                      O && tt(),
                                      (_ = A.follow(function () {
                                        var S;
                                        (k = x(f)) &&
                                          O &&
                                          ((S = Se.bind(null, null)),
                                          k.then(S, S));
                                      })),
                                      k && typeof k.then == 'function'
                                        ? A.resolve(k)
                                        : _.then(function () {
                                            return k;
                                          })
                                    );
                                  }
                                }),
                                  d.push(function (b) {
                                    var g,
                                      _,
                                      x = m._cfg.dbschema;
                                    ((g = x),
                                      (_ = b),
                                      [].slice
                                        .call(_.db.objectStoreNames)
                                        .forEach(function (K) {
                                          return (
                                            g[K] == null &&
                                            _.db.deleteObjectStore(K)
                                          );
                                        }),
                                      Kn(s, [s.Transaction.prototype]),
                                      $t(
                                        s,
                                        [s.Transaction.prototype],
                                        s._storeNames,
                                        s._dbSchema,
                                      ),
                                      (f.schema = s._dbSchema));
                                  }),
                                  d.push(function (b) {
                                    s.idbdb.objectStoreNames.contains(
                                      '$meta',
                                    ) &&
                                      (Math.ceil(s.idbdb.version / 10) ===
                                      m._cfg.version
                                        ? (s.idbdb.deleteObjectStore('$meta'),
                                          delete s._dbSchema.$meta,
                                          (s._storeNames = s._storeNames.filter(
                                            function (g) {
                                              return g !== '$meta';
                                            },
                                          )))
                                        : b
                                            .objectStore('$meta')
                                            .put(m._cfg.version, 'version'));
                                  }));
                              }),
                              (function m() {
                                return d.length
                                  ? A.resolve(d.shift()(f.idbtrans)).then(m)
                                  : A.resolve();
                              })().then(function () {
                                br(y, h);
                              }))
                            : A.resolve()
                        );
                        var s, v, f, h, d, y;
                      })
                      .catch(a))
                  : ($(i).forEach(function (p) {
                      An(n, p, i[p].primKey, i[p].indexes);
                    }),
                    Vt(e, n),
                    void A.follow(function () {
                      return e.on.populate.fire(o);
                    }).catch(a))
              );
              var c, l;
            });
          }
          function wi(e, t) {
            (br(e._dbSchema, t),
              t.db.version % 10 != 0 ||
                t.objectStoreNames.contains('$meta') ||
                t.db
                  .createObjectStore('$meta')
                  .add(Math.ceil(t.db.version / 10 - 1), 'version'));
            var n = Yt(0, e.idbdb, t);
            Wt(e, e._dbSchema, t);
            for (var r = 0, i = Sn(n, e._dbSchema).change; r < i.length; r++) {
              var o = (function (a) {
                if (a.change.length || a.recreate)
                  return (
                    console.warn(
                      'Unable to patch indexes of table '.concat(
                        a.name,
                        ' because it has changes on the type of index or primary key.',
                      ),
                    ),
                    { value: void 0 }
                  );
                var u = t.objectStore(a.name);
                a.add.forEach(function (c) {
                  (be &&
                    console.debug(
                      'Dexie upgrade patch: Creating missing index '
                        .concat(a.name, '.')
                        .concat(c.src),
                    ),
                    zt(u, c));
                });
              })(i[r]);
              if (typeof o == 'object') return o.value;
            }
          }
          function Sn(e, t) {
            var n,
              r = { del: [], add: [], change: [] };
            for (n in e) t[n] || r.del.push(n);
            for (n in t) {
              var i = e[n],
                o = t[n];
              if (i) {
                var a = {
                  name: n,
                  def: o,
                  recreate: !1,
                  del: [],
                  add: [],
                  change: [],
                };
                if (
                  '' + (i.primKey.keyPath || '') !=
                    '' + (o.primKey.keyPath || '') ||
                  i.primKey.auto !== o.primKey.auto
                )
                  ((a.recreate = !0), r.change.push(a));
                else {
                  var u = i.idxByName,
                    c = o.idxByName,
                    l = void 0;
                  for (l in u) c[l] || a.del.push(l);
                  for (l in c) {
                    var p = u[l],
                      s = c[l];
                    p ? p.src !== s.src && a.change.push(s) : a.add.push(s);
                  }
                  (0 < a.del.length ||
                    0 < a.add.length ||
                    0 < a.change.length) &&
                    r.change.push(a);
                }
              } else r.add.push([n, o]);
            }
            return r;
          }
          function An(e, t, n, r) {
            var i = e.db.createObjectStore(
              t,
              n.keyPath
                ? { keyPath: n.keyPath, autoIncrement: n.auto }
                : { autoIncrement: n.auto },
            );
            return (
              r.forEach(function (o) {
                return zt(i, o);
              }),
              i
            );
          }
          function br(e, t) {
            $(e).forEach(function (n) {
              t.db.objectStoreNames.contains(n) ||
                (be && console.debug('Dexie: Creating missing table', n),
                An(t, n, e[n].primKey, e[n].indexes));
            });
          }
          function zt(e, t) {
            e.createIndex(t.name, t.keyPath, {
              unique: t.unique,
              multiEntry: t.multi,
            });
          }
          function Yt(e, t, n) {
            var r = {};
            return (
              De(t.objectStoreNames, 0).forEach(function (i) {
                for (
                  var o = n.objectStore(i),
                    a = On(
                      vr((l = o.keyPath)),
                      l || '',
                      !0,
                      !1,
                      !!o.autoIncrement,
                      l && typeof l != 'string',
                      !0,
                    ),
                    u = [],
                    c = 0;
                  c < o.indexNames.length;
                  ++c
                ) {
                  var p = o.index(o.indexNames[c]),
                    l = p.keyPath,
                    p = On(
                      p.name,
                      l,
                      !!p.unique,
                      !!p.multiEntry,
                      !1,
                      l && typeof l != 'string',
                      !1,
                    );
                  u.push(p);
                }
                r[i] = Pn(i, a, u);
              }),
              r
            );
          }
          function Wt(e, t, n) {
            for (var r = n.db.objectStoreNames, i = 0; i < r.length; ++i) {
              var o = r[i],
                a = n.objectStore(o);
              e._hasGetAll = 'getAll' in a;
              for (var u = 0; u < a.indexNames.length; ++u) {
                var c = a.indexNames[u],
                  l = a.index(c).keyPath,
                  p = typeof l == 'string' ? l : '[' + De(l).join('+') + ']';
                !t[o] ||
                  ((l = t[o].idxByName[p]) &&
                    ((l.name = c),
                    delete t[o].idxByName[p],
                    (t[o].idxByName[c] = l)));
              }
            }
            typeof navigator < 'u' &&
              /Safari/.test(navigator.userAgent) &&
              !/(Chrome\/|Edge\/)/.test(navigator.userAgent) &&
              V.WorkerGlobalScope &&
              V instanceof V.WorkerGlobalScope &&
              [].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1] < 604 &&
              (e._hasGetAll = !1);
          }
          function gr(e) {
            return e.split(',').map(function (t, n) {
              var o = t.split(':'),
                r = (i = o[1]) === null || i === void 0 ? void 0 : i.trim(),
                i = (t = o[0].trim()).replace(/([&*]|\+\+)/g, ''),
                o = /^\[/.test(i) ? i.match(/^\[(.*)\]$/)[1].split('+') : i;
              return On(
                i,
                o || null,
                /\&/.test(t),
                /\*/.test(t),
                /\+\+/.test(t),
                z(o),
                n === 0,
                r,
              );
            });
          }
          var ki =
            ((ot.prototype._createTableSchema = Pn),
            (ot.prototype._parseIndexSyntax = gr),
            (ot.prototype._parseStoresSpec = function (e, t) {
              var n = this;
              $(e).forEach(function (r) {
                if (e[r] !== null) {
                  var i = n._parseIndexSyntax(e[r]),
                    o = i.shift();
                  if (!o)
                    throw new D.Schema(
                      'Invalid schema for table ' + r + ': ' + e[r],
                    );
                  if (((o.unique = !0), o.multi))
                    throw new D.Schema('Primary key cannot be multiEntry*');
                  (i.forEach(function (a) {
                    if (a.auto)
                      throw new D.Schema(
                        'Only primary key can be marked as autoIncrement (++)',
                      );
                    if (!a.keyPath)
                      throw new D.Schema(
                        'Index must have a name and cannot be an empty string',
                      );
                  }),
                    (i = n._createTableSchema(r, o, i)),
                    (t[r] = i));
                }
              });
            }),
            (ot.prototype.stores = function (n) {
              var t = this.db;
              this._cfg.storesSource = this._cfg.storesSource
                ? W(this._cfg.storesSource, n)
                : n;
              var n = t._versions,
                r = {},
                i = {};
              return (
                n.forEach(function (o) {
                  (W(r, o._cfg.storesSource),
                    (i = o._cfg.dbschema = {}),
                    o._parseStoresSpec(r, i));
                }),
                (t._dbSchema = i),
                Kn(t, [t._allTables, t, t.Transaction.prototype]),
                $t(
                  t,
                  [t._allTables, t, t.Transaction.prototype, this._cfg.tables],
                  $(i),
                  i,
                ),
                (t._storeNames = $(i)),
                this
              );
            }),
            (ot.prototype.upgrade = function (e) {
              return (
                (this._cfg.contentUpgrade = ln(
                  this._cfg.contentUpgrade || G,
                  e,
                )),
                this
              );
            }),
            ot);
          function ot() {}
          function Cn(e, t) {
            var n = e._dbNamesDB;
            return (
              n ||
                (n = e._dbNamesDB =
                  new xe(Rt, { addons: [], indexedDB: e, IDBKeyRange: t }))
                  .version(1)
                  .stores({ dbnames: 'name' }),
              n.table('dbnames')
            );
          }
          function jn(e) {
            return e && typeof e.databases == 'function';
          }
          function Tn(e) {
            return Ke(function () {
              return ((T.letThrough = !0), e());
            });
          }
          function In(e) {
            return !('from' in e);
          }
          var se = function (e, t) {
            if (!this) {
              var n = new se();
              return (e && 'd' in e && W(n, e), n);
            }
            W(
              this,
              arguments.length
                ? { d: 1, from: e, to: 1 < arguments.length ? t : e }
                : { d: 0 },
            );
          };
          function kt(e, t, n) {
            var r = F(t, n);
            if (!isNaN(r)) {
              if (0 < r) throw RangeError();
              if (In(e)) return W(e, { from: t, to: n, d: 1 });
              var i = e.l,
                r = e.r;
              if (F(n, e.from) < 0)
                return (
                  i
                    ? kt(i, t, n)
                    : (e.l = { from: t, to: n, d: 1, l: null, r: null }),
                  wr(e)
                );
              if (0 < F(t, e.to))
                return (
                  r
                    ? kt(r, t, n)
                    : (e.r = { from: t, to: n, d: 1, l: null, r: null }),
                  wr(e)
                );
              (F(t, e.from) < 0 &&
                ((e.from = t), (e.l = null), (e.d = r ? r.d + 1 : 1)),
                0 < F(n, e.to) &&
                  ((e.to = n), (e.r = null), (e.d = e.l ? e.l.d + 1 : 1)),
                (n = !e.r),
                i && !e.l && xt(e, i),
                r && n && xt(e, r));
            }
          }
          function xt(e, t) {
            In(t) ||
              (function n(r, c) {
                var o = c.from,
                  a = c.to,
                  u = c.l,
                  c = c.r;
                (kt(r, o, a), u && n(r, u), c && n(r, c));
              })(e, t);
          }
          function _r(e, t) {
            var n = Gt(t),
              r = n.next();
            if (r.done) return !1;
            for (
              var i = r.value, o = Gt(e), a = o.next(i.from), u = a.value;
              !r.done && !a.done;

            ) {
              if (F(u.from, i.to) <= 0 && 0 <= F(u.to, i.from)) return !0;
              F(i.from, u.from) < 0
                ? (i = (r = n.next(u.from)).value)
                : (u = (a = o.next(i.from)).value);
            }
            return !1;
          }
          function Gt(e) {
            var t = In(e) ? null : { s: 0, n: e };
            return {
              next: function (n) {
                for (var r = 0 < arguments.length; t; )
                  switch (t.s) {
                    case 0:
                      if (((t.s = 1), r))
                        for (; t.n.l && F(n, t.n.from) < 0; )
                          t = { up: t, n: t.n.l, s: 1 };
                      else for (; t.n.l; ) t = { up: t, n: t.n.l, s: 1 };
                    case 1:
                      if (((t.s = 2), !r || F(n, t.n.to) <= 0))
                        return { value: t.n, done: !1 };
                    case 2:
                      if (t.n.r) {
                        ((t.s = 3), (t = { up: t, n: t.n.r, s: 0 }));
                        continue;
                      }
                    case 3:
                      t = t.up;
                  }
                return { done: !0 };
              },
            };
          }
          function wr(e) {
            var t,
              n,
              r =
                (((t = e.r) === null || t === void 0 ? void 0 : t.d) || 0) -
                (((n = e.l) === null || n === void 0 ? void 0 : n.d) || 0),
              i = 1 < r ? 'r' : r < -1 ? 'l' : '';
            (i &&
              ((t = i == 'r' ? 'l' : 'r'),
              (n = E({}, e)),
              (r = e[i]),
              (e.from = r.from),
              (e.to = r.to),
              (e[i] = r[i]),
              (n[i] = r[t]),
              ((e[t] = n).d = kr(n))),
              (e.d = kr(e)));
          }
          function kr(n) {
            var t = n.r,
              n = n.l;
            return (t ? (n ? Math.max(t.d, n.d) : t.d) : n ? n.d : 0) + 1;
          }
          function Qt(e, t) {
            return (
              $(t).forEach(function (n) {
                e[n]
                  ? xt(e[n], t[n])
                  : (e[n] = (function r(i) {
                      var o,
                        a,
                        u = {};
                      for (o in i)
                        te(i, o) &&
                          ((a = i[o]),
                          (u[o] =
                            !a || typeof a != 'object' || Et.has(a.constructor)
                              ? a
                              : r(a)));
                      return u;
                    })(t[n]));
              }),
              e
            );
          }
          function Dn(e, t) {
            return (
              e.all ||
              t.all ||
              Object.keys(e).some(function (n) {
                return t[n] && _r(t[n], e[n]);
              })
            );
          }
          J(
            se.prototype,
            (((ye = {
              add: function (e) {
                return (xt(this, e), this);
              },
              addKey: function (e) {
                return (kt(this, e, e), this);
              },
              addKeys: function (e) {
                var t = this;
                return (
                  e.forEach(function (n) {
                    return kt(t, n, n);
                  }),
                  this
                );
              },
              hasKey: function (e) {
                var t = Gt(this).next(e).value;
                return t && F(t.from, e) <= 0 && 0 <= F(t.to, e);
              },
            })[un] = function () {
              return Gt(this);
            }),
            ye),
          );
          var Ye = {},
            Bn = {},
            qn = !1;
          function Ht(e) {
            (Qt(Bn, e),
              qn ||
                ((qn = !0),
                setTimeout(function () {
                  ((qn = !1), Rn(Bn, !(Bn = {})));
                }, 0)));
          }
          function Rn(e, t) {
            t === void 0 && (t = !1);
            var n = new Set();
            if (e.all)
              for (var r = 0, i = Object.values(Ye); r < i.length; r++)
                xr((a = i[r]), e, n, t);
            else
              for (var o in e) {
                var a,
                  u = /^idb\:\/\/(.*)\/(.*)\//.exec(o);
                u &&
                  ((o = u[1]),
                  (u = u[2]),
                  (a = Ye['idb://'.concat(o, '/').concat(u)]) &&
                    xr(a, e, n, t));
              }
            n.forEach(function (c) {
              return c();
            });
          }
          function xr(e, t, n, r) {
            for (
              var i = [], o = 0, a = Object.entries(e.queries.query);
              o < a.length;
              o++
            ) {
              for (
                var u = a[o], c = u[0], l = [], p = 0, s = u[1];
                p < s.length;
                p++
              ) {
                var v = s[p];
                Dn(t, v.obsSet)
                  ? v.subscribers.forEach(function (y) {
                      return n.add(y);
                    })
                  : r && l.push(v);
              }
              r && i.push([c, l]);
            }
            if (r)
              for (var f = 0, h = i; f < h.length; f++) {
                var d = h[f],
                  c = d[0],
                  l = d[1];
                e.queries.query[c] = l;
              }
          }
          function xi(e) {
            var t = e._state,
              n = e._deps.indexedDB;
            if (t.isBeingOpened || e.idbdb)
              return t.dbReadyPromise.then(function () {
                return t.dbOpenError ? Z(t.dbOpenError) : e;
              });
            ((t.isBeingOpened = !0),
              (t.dbOpenError = null),
              (t.openComplete = !1));
            var r = t.openCanceller,
              i = Math.round(10 * e.verno),
              o = !1;
            function a() {
              if (t.openCanceller !== r)
                throw new D.DatabaseClosed('db.open() was cancelled');
            }
            function u() {
              return new A(function (v, f) {
                if ((a(), !n)) throw new D.MissingAPI();
                var h = e.name,
                  d = t.autoSchema || !i ? n.open(h) : n.open(h, i);
                if (!d) throw new D.MissingAPI();
                ((d.onerror = ge(f)),
                  (d.onblocked = H(e._fireOnBlocked)),
                  (d.onupgradeneeded = H(function (y) {
                    var m;
                    ((p = d.transaction),
                      t.autoSchema && !e._options.allowEmptyDB
                        ? ((d.onerror = bt),
                          p.abort(),
                          d.result.close(),
                          ((m = n.deleteDatabase(h)).onsuccess = m.onerror =
                            H(function () {
                              f(
                                new D.NoSuchDatabase(
                                  'Database '.concat(h, ' doesnt exist'),
                                ),
                              );
                            })))
                        : ((p.onerror = ge(f)),
                          (y =
                            y.oldVersion > Math.pow(2, 62) ? 0 : y.oldVersion),
                          (s = y < 1),
                          (e.idbdb = d.result),
                          o && wi(e, p),
                          _i(e, y / 10, p, f)));
                  }, f)),
                  (d.onsuccess = H(function () {
                    p = null;
                    var y,
                      m,
                      b,
                      g,
                      _,
                      x = (e.idbdb = d.result),
                      K = De(x.objectStoreNames);
                    if (0 < K.length)
                      try {
                        var k = x.transaction(
                          (g = K).length === 1 ? g[0] : g,
                          'readonly',
                        );
                        if (t.autoSchema)
                          ((m = x),
                            (b = k),
                            ((y = e).verno = m.version / 10),
                            (b = y._dbSchema = Yt(0, m, b)),
                            (y._storeNames = De(m.objectStoreNames, 0)),
                            $t(y, [y._allTables], $(b), b));
                        else if (
                          (Wt(e, e._dbSchema, k),
                          ((_ = Sn(Yt(0, (_ = e).idbdb, k), _._dbSchema)).add
                            .length ||
                            _.change.some(function (O) {
                              return O.add.length || O.change.length;
                            })) &&
                            !o)
                        )
                          return (
                            console.warn(
                              'Dexie SchemaDiff: Schema was extended without increasing the number passed to db.version(). Dexie will add missing parts and increment native version number to workaround this.',
                            ),
                            x.close(),
                            (i = x.version + 1),
                            (o = !0),
                            v(u())
                          );
                        Vt(e, k);
                      } catch {}
                    (nt.push(e),
                      (x.onversionchange = H(function (O) {
                        ((t.vcFired = !0), e.on('versionchange').fire(O));
                      })),
                      (x.onclose = H(function () {
                        e.close({ disableAutoOpen: !1 });
                      })),
                      s &&
                        ((_ = e._deps),
                        (k = h),
                        (x = _.indexedDB),
                        (_ = _.IDBKeyRange),
                        jn(x) ||
                          k === Rt ||
                          Cn(x, _).put({ name: k }).catch(G)),
                      v());
                  }, f)));
              }).catch(function (v) {
                switch (v?.name) {
                  case 'UnknownError':
                    if (0 < t.PR1398_maxLoop)
                      return (
                        t.PR1398_maxLoop--,
                        console.warn(
                          'Dexie: Workaround for Chrome UnknownError on open()',
                        ),
                        u()
                      );
                    break;
                  case 'VersionError':
                    if (0 < i) return ((i = 0), u());
                }
                return A.reject(v);
              });
            }
            var c,
              l = t.dbReadyResolve,
              p = null,
              s = !1;
            return A.race([
              r,
              (typeof navigator > 'u'
                ? A.resolve()
                : !navigator.userAgentData &&
                    /Safari\//.test(navigator.userAgent) &&
                    !/Chrom(e|ium)\//.test(navigator.userAgent) &&
                    indexedDB.databases
                  ? new Promise(function (v) {
                      function f() {
                        return indexedDB.databases().finally(v);
                      }
                      ((c = setInterval(f, 100)), f());
                    }).finally(function () {
                      return clearInterval(c);
                    })
                  : Promise.resolve()
              ).then(u),
            ])
              .then(function () {
                return (
                  a(),
                  (t.onReadyBeingFired = []),
                  A.resolve(
                    Tn(function () {
                      return e.on.ready.fire(e.vip);
                    }),
                  ).then(function v() {
                    if (0 < t.onReadyBeingFired.length) {
                      var f = t.onReadyBeingFired.reduce(ln, G);
                      return (
                        (t.onReadyBeingFired = []),
                        A.resolve(
                          Tn(function () {
                            return f(e.vip);
                          }),
                        ).then(v)
                      );
                    }
                  })
                );
              })
              .finally(function () {
                t.openCanceller === r &&
                  ((t.onReadyBeingFired = null), (t.isBeingOpened = !1));
              })
              .catch(function (v) {
                t.dbOpenError = v;
                try {
                  p && p.abort();
                } catch {}
                return (r === t.openCanceller && e._close(), Z(v));
              })
              .finally(function () {
                ((t.openComplete = !0), l());
              })
              .then(function () {
                var v;
                return (
                  s &&
                    ((v = {}),
                    e.tables.forEach(function (f) {
                      (f.schema.indexes.forEach(function (h) {
                        h.name &&
                          (v[
                            'idb://'
                              .concat(e.name, '/')
                              .concat(f.name, '/')
                              .concat(h.name)
                          ] = new se(-1 / 0, [[[]]]));
                      }),
                        (v['idb://'.concat(e.name, '/').concat(f.name, '/')] =
                          v[
                            'idb://'
                              .concat(e.name, '/')
                              .concat(f.name, '/:dels')
                          ] =
                            new se(-1 / 0, [[[]]])));
                    }),
                    je(gt).fire(v),
                    Rn(v, !0)),
                  e
                );
              });
          }
          function Nn(e) {
            function t(o) {
              return e.next(o);
            }
            var n = i(t),
              r = i(function (o) {
                return e.throw(o);
              });
            function i(o) {
              return function (c) {
                var u = o(c),
                  c = u.value;
                return u.done
                  ? c
                  : c && typeof c.then == 'function'
                    ? c.then(n, r)
                    : z(c)
                      ? Promise.all(c).then(n, r)
                      : n(c);
              };
            }
            return i(t)();
          }
          function Xt(e, t, n) {
            for (var r = z(e) ? e.slice() : [e], i = 0; i < n; ++i) r.push(t);
            return r;
          }
          var Oi = {
            stack: 'dbcore',
            name: 'VirtualIndexMiddleware',
            level: 1,
            create: function (e) {
              return E(E({}, e), {
                table: function (t) {
                  var n = e.table(t),
                    r = n.schema,
                    i = {},
                    o = [];
                  function a(s, v, f) {
                    var h = wt(s),
                      d = (i[h] = i[h] || []),
                      y = s == null ? 0 : typeof s == 'string' ? 1 : s.length,
                      m = 0 < v,
                      m = E(E({}, f), {
                        name: m
                          ? ''.concat(h, '(virtual-from:').concat(f.name, ')')
                          : f.name,
                        lowLevelIndex: f,
                        isVirtual: m,
                        keyTail: v,
                        keyLength: y,
                        extractKey: En(s),
                        unique: !m && f.unique,
                      });
                    return (
                      d.push(m),
                      m.isPrimaryKey || o.push(m),
                      1 < y && a(y === 2 ? s[0] : s.slice(0, y - 1), v + 1, f),
                      d.sort(function (b, g) {
                        return b.keyTail - g.keyTail;
                      }),
                      m
                    );
                  }
                  ((t = a(r.primaryKey.keyPath, 0, r.primaryKey)),
                    (i[':id'] = [t]));
                  for (var u = 0, c = r.indexes; u < c.length; u++) {
                    var l = c[u];
                    a(l.keyPath, 0, l);
                  }
                  function p(s) {
                    var v,
                      f = s.query.index;
                    return f.isVirtual
                      ? E(E({}, s), {
                          query: {
                            index: f.lowLevelIndex,
                            range:
                              ((v = s.query.range),
                              (f = f.keyTail),
                              {
                                type: v.type === 1 ? 2 : v.type,
                                lower: Xt(
                                  v.lower,
                                  v.lowerOpen ? e.MAX_KEY : e.MIN_KEY,
                                  f,
                                ),
                                lowerOpen: !0,
                                upper: Xt(
                                  v.upper,
                                  v.upperOpen ? e.MIN_KEY : e.MAX_KEY,
                                  f,
                                ),
                                upperOpen: !0,
                              }),
                          },
                        })
                      : s;
                  }
                  return E(E({}, n), {
                    schema: E(E({}, r), {
                      primaryKey: t,
                      indexes: o,
                      getIndexByKeyPath: function (s) {
                        return (s = i[wt(s)]) && s[0];
                      },
                    }),
                    count: function (s) {
                      return n.count(p(s));
                    },
                    query: function (s) {
                      return n.query(p(s));
                    },
                    openCursor: function (s) {
                      var v = s.query.index,
                        f = v.keyTail,
                        h = v.isVirtual,
                        d = v.keyLength;
                      return h
                        ? n.openCursor(p(s)).then(function (m) {
                            return m && y(m);
                          })
                        : n.openCursor(s);
                      function y(m) {
                        return Object.create(m, {
                          continue: {
                            value: function (b) {
                              b != null
                                ? m.continue(
                                    Xt(b, s.reverse ? e.MAX_KEY : e.MIN_KEY, f),
                                  )
                                : s.unique
                                  ? m.continue(
                                      m.key
                                        .slice(0, d)
                                        .concat(
                                          s.reverse ? e.MIN_KEY : e.MAX_KEY,
                                          f,
                                        ),
                                    )
                                  : m.continue();
                            },
                          },
                          continuePrimaryKey: {
                            value: function (b, g) {
                              m.continuePrimaryKey(Xt(b, e.MAX_KEY, f), g);
                            },
                          },
                          primaryKey: {
                            get: function () {
                              return m.primaryKey;
                            },
                          },
                          key: {
                            get: function () {
                              var b = m.key;
                              return d === 1 ? b[0] : b.slice(0, d);
                            },
                          },
                          value: {
                            get: function () {
                              return m.value;
                            },
                          },
                        });
                      }
                    },
                  });
                },
              });
            },
          };
          function Mn(e, t, n, r) {
            return (
              (n = n || {}),
              (r = r || ''),
              $(e).forEach(function (i) {
                var o, a, u;
                te(t, i)
                  ? ((o = e[i]),
                    (a = t[i]),
                    typeof o == 'object' && typeof a == 'object' && o && a
                      ? (u = an(o)) !== an(a)
                        ? (n[r + i] = t[i])
                        : u === 'Object'
                          ? Mn(o, a, n, r + i + '.')
                          : o !== a && (n[r + i] = t[i])
                      : o !== a && (n[r + i] = t[i]))
                  : (n[r + i] = void 0);
              }),
              $(t).forEach(function (i) {
                te(e, i) || (n[r + i] = t[i]);
              }),
              n
            );
          }
          function Fn(e, t) {
            return t.type === 'delete'
              ? t.keys
              : t.keys || t.values.map(e.extractKey);
          }
          var Pi = {
            stack: 'dbcore',
            name: 'HooksMiddleware',
            level: 2,
            create: function (e) {
              return E(E({}, e), {
                table: function (t) {
                  var n = e.table(t),
                    r = n.schema.primaryKey;
                  return E(E({}, n), {
                    mutate: function (i) {
                      var o = T.trans,
                        a = o.table(t).hook,
                        u = a.deleting,
                        c = a.creating,
                        l = a.updating;
                      switch (i.type) {
                        case 'add':
                          if (c.fire === G) break;
                          return o._promise(
                            'readwrite',
                            function () {
                              return p(i);
                            },
                            !0,
                          );
                        case 'put':
                          if (c.fire === G && l.fire === G) break;
                          return o._promise(
                            'readwrite',
                            function () {
                              return p(i);
                            },
                            !0,
                          );
                        case 'delete':
                          if (u.fire === G) break;
                          return o._promise(
                            'readwrite',
                            function () {
                              return p(i);
                            },
                            !0,
                          );
                        case 'deleteRange':
                          if (u.fire === G) break;
                          return o._promise(
                            'readwrite',
                            function () {
                              return (function s(v, f, h) {
                                return n
                                  .query({
                                    trans: v,
                                    values: !1,
                                    query: { index: r, range: f },
                                    limit: h,
                                  })
                                  .then(function (d) {
                                    var y = d.result;
                                    return p({
                                      type: 'delete',
                                      keys: y,
                                      trans: v,
                                    }).then(function (m) {
                                      return 0 < m.numFailures
                                        ? Promise.reject(m.failures[0])
                                        : y.length < h
                                          ? {
                                              failures: [],
                                              numFailures: 0,
                                              lastResult: void 0,
                                            }
                                          : s(
                                              v,
                                              E(E({}, f), {
                                                lower: y[y.length - 1],
                                                lowerOpen: !0,
                                              }),
                                              h,
                                            );
                                    });
                                  });
                              })(i.trans, i.range, 1e4);
                            },
                            !0,
                          );
                      }
                      return n.mutate(i);
                      function p(s) {
                        var v,
                          f,
                          h,
                          d = T.trans,
                          y = s.keys || Fn(r, s);
                        if (!y) throw new Error('Keys missing');
                        return (
                          (s =
                            s.type === 'add' || s.type === 'put'
                              ? E(E({}, s), { keys: y })
                              : E({}, s)).type !== 'delete' &&
                            (s.values = U([], s.values)),
                          s.keys && (s.keys = U([], s.keys)),
                          (v = n),
                          (h = y),
                          ((f = s).type === 'add'
                            ? Promise.resolve([])
                            : v.getMany({
                                trans: f.trans,
                                keys: h,
                                cache: 'immutable',
                              })
                          ).then(function (m) {
                            var b = y.map(function (g, _) {
                              var x,
                                K,
                                k,
                                O = m[_],
                                S = { onerror: null, onsuccess: null };
                              return (
                                s.type === 'delete'
                                  ? u.fire.call(S, g, O, d)
                                  : s.type === 'add' || O === void 0
                                    ? ((x = c.fire.call(S, g, s.values[_], d)),
                                      g == null &&
                                        x != null &&
                                        ((s.keys[_] = g = x),
                                        r.outbound ||
                                          M(s.values[_], r.keyPath, g)))
                                    : ((x = Mn(O, s.values[_])),
                                      (K = l.fire.call(S, x, g, O, d)) &&
                                        ((k = s.values[_]),
                                        Object.keys(K).forEach(function (P) {
                                          te(k, P)
                                            ? (k[P] = K[P])
                                            : M(k, P, K[P]);
                                        }))),
                                S
                              );
                            });
                            return n
                              .mutate(s)
                              .then(function (g) {
                                for (
                                  var _ = g.failures,
                                    x = g.results,
                                    K = g.numFailures,
                                    g = g.lastResult,
                                    k = 0;
                                  k < y.length;
                                  ++k
                                ) {
                                  var O = (x || y)[k],
                                    S = b[k];
                                  O == null
                                    ? S.onerror && S.onerror(_[k])
                                    : S.onsuccess &&
                                      S.onsuccess(
                                        s.type === 'put' && m[k]
                                          ? s.values[k]
                                          : O,
                                      );
                                }
                                return {
                                  failures: _,
                                  results: x,
                                  numFailures: K,
                                  lastResult: g,
                                };
                              })
                              .catch(function (g) {
                                return (
                                  b.forEach(function (_) {
                                    return _.onerror && _.onerror(g);
                                  }),
                                  Promise.reject(g)
                                );
                              });
                          })
                        );
                      }
                    },
                  });
                },
              });
            },
          };
          function Or(e, t, n) {
            try {
              if (!t || t.keys.length < e.length) return null;
              for (
                var r = [], i = 0, o = 0;
                i < t.keys.length && o < e.length;
                ++i
              )
                F(t.keys[i], e[o]) === 0 &&
                  (r.push(n ? qe(t.values[i]) : t.values[i]), ++o);
              return r.length === e.length ? r : null;
            } catch {
              return null;
            }
          }
          var Ei = {
            stack: 'dbcore',
            level: -1,
            create: function (e) {
              return {
                table: function (t) {
                  var n = e.table(t);
                  return E(E({}, n), {
                    getMany: function (r) {
                      if (!r.cache) return n.getMany(r);
                      var i = Or(r.keys, r.trans._cache, r.cache === 'clone');
                      return i
                        ? A.resolve(i)
                        : n.getMany(r).then(function (o) {
                            return (
                              (r.trans._cache = {
                                keys: r.keys,
                                values: r.cache === 'clone' ? qe(o) : o,
                              }),
                              o
                            );
                          });
                    },
                    mutate: function (r) {
                      return (
                        r.type !== 'add' && (r.trans._cache = null),
                        n.mutate(r)
                      );
                    },
                  });
                },
              };
            },
          };
          function Pr(e, t) {
            return (
              e.trans.mode === 'readonly' &&
              !!e.subscr &&
              !e.trans.explicit &&
              e.trans.db._options.cache !== 'disabled' &&
              !t.schema.primaryKey.outbound
            );
          }
          function Er(e, t) {
            switch (e) {
              case 'query':
                return t.values && !t.unique;
              case 'get':
              case 'getMany':
              case 'count':
              case 'openCursor':
                return !1;
            }
          }
          var Ki = {
            stack: 'dbcore',
            level: 0,
            name: 'Observability',
            create: function (e) {
              var t = e.schema.name,
                n = new se(e.MIN_KEY, e.MAX_KEY);
              return E(E({}, e), {
                transaction: function (r, i, o) {
                  if (T.subscr && i !== 'readonly')
                    throw new D.ReadOnly(
                      'Readwrite transaction in liveQuery context. Querier source: '.concat(
                        T.querier,
                      ),
                    );
                  return e.transaction(r, i, o);
                },
                table: function (r) {
                  var i = e.table(r),
                    o = i.schema,
                    a = o.primaryKey,
                    s = o.indexes,
                    u = a.extractKey,
                    c = a.outbound,
                    l =
                      a.autoIncrement &&
                      s.filter(function (f) {
                        return f.compound && f.keyPath.includes(a.keyPath);
                      }),
                    p = E(E({}, i), {
                      mutate: function (f) {
                        function h(P) {
                          return (
                            (P = 'idb://'
                              .concat(t, '/')
                              .concat(r, '/')
                              .concat(P)),
                            g[P] || (g[P] = new se())
                          );
                        }
                        var d,
                          y,
                          m,
                          b = f.trans,
                          g = f.mutatedParts || (f.mutatedParts = {}),
                          _ = h(''),
                          x = h(':dels'),
                          K = f.type,
                          S =
                            f.type === 'deleteRange'
                              ? [f.range]
                              : f.type === 'delete'
                                ? [f.keys]
                                : f.values.length < 50
                                  ? [
                                      Fn(a, f).filter(function (P) {
                                        return P;
                                      }),
                                      f.values,
                                    ]
                                  : [],
                          k = S[0],
                          O = S[1],
                          S = f.trans._cache;
                        return (
                          z(k)
                            ? (_.addKeys(k),
                              (S =
                                K === 'delete' || k.length === O.length
                                  ? Or(k, S)
                                  : null) || x.addKeys(k),
                              (S || O) &&
                                ((d = h),
                                (y = S),
                                (m = O),
                                o.indexes.forEach(function (P) {
                                  var C = d(P.name || '');
                                  function q(N) {
                                    return N != null ? P.extractKey(N) : null;
                                  }
                                  function R(N) {
                                    return P.multiEntry && z(N)
                                      ? N.forEach(function (pe) {
                                          return C.addKey(pe);
                                        })
                                      : C.addKey(N);
                                  }
                                  (y || m).forEach(function (N, ce) {
                                    var B = y && q(y[ce]),
                                      ce = m && q(m[ce]);
                                    F(B, ce) !== 0 &&
                                      (B != null && R(B), ce != null && R(ce));
                                  });
                                })))
                            : k
                              ? ((O = {
                                  from:
                                    (O = k.lower) !== null && O !== void 0
                                      ? O
                                      : e.MIN_KEY,
                                  to:
                                    (O = k.upper) !== null && O !== void 0
                                      ? O
                                      : e.MAX_KEY,
                                }),
                                x.add(O),
                                _.add(O))
                              : (_.add(n),
                                x.add(n),
                                o.indexes.forEach(function (P) {
                                  return h(P.name).add(n);
                                })),
                          i.mutate(f).then(function (P) {
                            return (
                              !k ||
                                (f.type !== 'add' && f.type !== 'put') ||
                                (_.addKeys(P.results),
                                l &&
                                  l.forEach(function (C) {
                                    for (
                                      var q = f.values.map(function (B) {
                                          return C.extractKey(B);
                                        }),
                                        R = C.keyPath.findIndex(function (B) {
                                          return B === a.keyPath;
                                        }),
                                        N = 0,
                                        pe = P.results.length;
                                      N < pe;
                                      ++N
                                    )
                                      q[N][R] = P.results[N];
                                    h(C.name).addKeys(q);
                                  })),
                              (b.mutatedParts = Qt(b.mutatedParts || {}, g)),
                              P
                            );
                          })
                        );
                      },
                    }),
                    s = function (h) {
                      var d = h.query,
                        h = d.index,
                        d = d.range;
                      return [
                        h,
                        new se(
                          (h = d.lower) !== null && h !== void 0
                            ? h
                            : e.MIN_KEY,
                          (d = d.upper) !== null && d !== void 0
                            ? d
                            : e.MAX_KEY,
                        ),
                      ];
                    },
                    v = {
                      get: function (f) {
                        return [a, new se(f.key)];
                      },
                      getMany: function (f) {
                        return [a, new se().addKeys(f.keys)];
                      },
                      count: s,
                      query: s,
                      openCursor: s,
                    };
                  return (
                    $(v).forEach(function (f) {
                      p[f] = function (h) {
                        var d = T.subscr,
                          y = !!d,
                          m = Pr(T, i) && Er(f, h) ? (h.obsSet = {}) : d;
                        if (y) {
                          var b = function (O) {
                              return (
                                (O = 'idb://'
                                  .concat(t, '/')
                                  .concat(r, '/')
                                  .concat(O)),
                                m[O] || (m[O] = new se())
                              );
                            },
                            g = b(''),
                            _ = b(':dels'),
                            d = v[f](h),
                            y = d[0],
                            d = d[1];
                          if (
                            ((f === 'query' && y.isPrimaryKey && !h.values
                              ? _
                              : b(y.name || '')
                            ).add(d),
                            !y.isPrimaryKey)
                          ) {
                            if (f !== 'count') {
                              var x =
                                f === 'query' &&
                                c &&
                                h.values &&
                                i.query(E(E({}, h), { values: !1 }));
                              return i[f]
                                .apply(this, arguments)
                                .then(function (O) {
                                  if (f === 'query') {
                                    if (c && h.values)
                                      return x.then(function (q) {
                                        return (
                                          (q = q.result),
                                          g.addKeys(q),
                                          O
                                        );
                                      });
                                    var S = h.values
                                      ? O.result.map(u)
                                      : O.result;
                                    (h.values ? g : _).addKeys(S);
                                  } else if (f === 'openCursor') {
                                    var P = O,
                                      C = h.values;
                                    return (
                                      P &&
                                      Object.create(P, {
                                        key: {
                                          get: function () {
                                            return (
                                              _.addKey(P.primaryKey),
                                              P.key
                                            );
                                          },
                                        },
                                        primaryKey: {
                                          get: function () {
                                            var q = P.primaryKey;
                                            return (_.addKey(q), q);
                                          },
                                        },
                                        value: {
                                          get: function () {
                                            return (
                                              C && g.addKey(P.primaryKey),
                                              P.value
                                            );
                                          },
                                        },
                                      })
                                    );
                                  }
                                  return O;
                                });
                            }
                            _.add(n);
                          }
                        }
                        return i[f].apply(this, arguments);
                      };
                    }),
                    p
                  );
                },
              });
            },
          };
          function Kr(e, t, n) {
            if (n.numFailures === 0) return t;
            if (t.type === 'deleteRange') return null;
            var r = t.keys
              ? t.keys.length
              : 'values' in t && t.values
                ? t.values.length
                : 1;
            return n.numFailures === r
              ? null
              : ((t = E({}, t)),
                z(t.keys) &&
                  (t.keys = t.keys.filter(function (i, o) {
                    return !(o in n.failures);
                  })),
                'values' in t &&
                  z(t.values) &&
                  (t.values = t.values.filter(function (i, o) {
                    return !(o in n.failures);
                  })),
                t);
          }
          function Ln(e, t) {
            return (
              (n = e),
              ((r = t).lower === void 0 ||
                (r.lowerOpen ? 0 < F(n, r.lower) : 0 <= F(n, r.lower))) &&
                ((e = e),
                (t = t).upper === void 0 ||
                  (t.upperOpen ? F(e, t.upper) < 0 : F(e, t.upper) <= 0))
            );
            var n, r;
          }
          function Sr(e, t, v, r, i, o) {
            if (!v || v.length === 0) return e;
            var a = t.query.index,
              u = a.multiEntry,
              c = t.query.range,
              l = r.schema.primaryKey.extractKey,
              p = a.extractKey,
              s = (a.lowLevelIndex || a).extractKey,
              v = v.reduce(function (f, h) {
                var d = f,
                  y = [];
                if (h.type === 'add' || h.type === 'put')
                  for (var m = new se(), b = h.values.length - 1; 0 <= b; --b) {
                    var g,
                      _ = h.values[b],
                      x = l(_);
                    m.hasKey(x) ||
                      ((g = p(_)),
                      (u && z(g)
                        ? g.some(function (P) {
                            return Ln(P, c);
                          })
                        : Ln(g, c)) && (m.addKey(x), y.push(_)));
                  }
                switch (h.type) {
                  case 'add':
                    var K = new se().addKeys(
                        t.values
                          ? f.map(function (C) {
                              return l(C);
                            })
                          : f,
                      ),
                      d = f.concat(
                        t.values
                          ? y.filter(function (C) {
                              return (
                                (C = l(C)),
                                !K.hasKey(C) && (K.addKey(C), !0)
                              );
                            })
                          : y
                              .map(function (C) {
                                return l(C);
                              })
                              .filter(function (C) {
                                return !K.hasKey(C) && (K.addKey(C), !0);
                              }),
                      );
                    break;
                  case 'put':
                    var k = new se().addKeys(
                      h.values.map(function (C) {
                        return l(C);
                      }),
                    );
                    d = f
                      .filter(function (C) {
                        return !k.hasKey(t.values ? l(C) : C);
                      })
                      .concat(
                        t.values
                          ? y
                          : y.map(function (C) {
                              return l(C);
                            }),
                      );
                    break;
                  case 'delete':
                    var O = new se().addKeys(h.keys);
                    d = f.filter(function (C) {
                      return !O.hasKey(t.values ? l(C) : C);
                    });
                    break;
                  case 'deleteRange':
                    var S = h.range;
                    d = f.filter(function (C) {
                      return !Ln(l(C), S);
                    });
                }
                return d;
              }, e);
            return v === e
              ? e
              : (v.sort(function (f, h) {
                  return F(s(f), s(h)) || F(l(f), l(h));
                }),
                t.limit &&
                  t.limit < 1 / 0 &&
                  (v.length > t.limit
                    ? (v.length = t.limit)
                    : e.length === t.limit &&
                      v.length < t.limit &&
                      (i.dirty = !0)),
                o ? Object.freeze(v) : v);
          }
          function Ar(e, t) {
            return (
              F(e.lower, t.lower) === 0 &&
              F(e.upper, t.upper) === 0 &&
              !!e.lowerOpen == !!t.lowerOpen &&
              !!e.upperOpen == !!t.upperOpen
            );
          }
          function Si(e, t) {
            return (
              (function (n, r, i, o) {
                if (n === void 0) return r !== void 0 ? -1 : 0;
                if (r === void 0) return 1;
                if ((r = F(n, r)) === 0) {
                  if (i && o) return 0;
                  if (i) return 1;
                  if (o) return -1;
                }
                return r;
              })(e.lower, t.lower, e.lowerOpen, t.lowerOpen) <= 0 &&
              0 <=
                (function (n, r, i, o) {
                  if (n === void 0) return r !== void 0 ? 1 : 0;
                  if (r === void 0) return -1;
                  if ((r = F(n, r)) === 0) {
                    if (i && o) return 0;
                    if (i) return -1;
                    if (o) return 1;
                  }
                  return r;
                })(e.upper, t.upper, e.upperOpen, t.upperOpen)
            );
          }
          function Ai(e, t, n, r) {
            (e.subscribers.add(n),
              r.addEventListener('abort', function () {
                var i, o;
                (e.subscribers.delete(n),
                  e.subscribers.size === 0 &&
                    ((i = e),
                    (o = t),
                    setTimeout(function () {
                      i.subscribers.size === 0 && Re(o, i);
                    }, 3e3)));
              }));
          }
          var Ci = {
            stack: 'dbcore',
            level: 0,
            name: 'Cache',
            create: function (e) {
              var t = e.schema.name;
              return E(E({}, e), {
                transaction: function (n, r, i) {
                  var o,
                    a,
                    u = e.transaction(n, r, i);
                  return (
                    r === 'readwrite' &&
                      ((a = (o = new AbortController()).signal),
                      (i = function (c) {
                        return function () {
                          if ((o.abort(), r === 'readwrite')) {
                            for (
                              var l = new Set(), p = 0, s = n;
                              p < s.length;
                              p++
                            ) {
                              var v = s[p],
                                f = Ye['idb://'.concat(t, '/').concat(v)];
                              if (f) {
                                var h = e.table(v),
                                  d = f.optimisticOps.filter(function (C) {
                                    return C.trans === u;
                                  });
                                if (u._explicit && c && u.mutatedParts)
                                  for (
                                    var y = 0,
                                      m = Object.values(f.queries.query);
                                    y < m.length;
                                    y++
                                  )
                                    for (
                                      var b = 0, g = (K = m[y]).slice();
                                      b < g.length;
                                      b++
                                    )
                                      Dn((k = g[b]).obsSet, u.mutatedParts) &&
                                        (Re(K, k),
                                        k.subscribers.forEach(function (C) {
                                          return l.add(C);
                                        }));
                                else if (0 < d.length) {
                                  f.optimisticOps = f.optimisticOps.filter(
                                    function (C) {
                                      return C.trans !== u;
                                    },
                                  );
                                  for (
                                    var _ = 0,
                                      x = Object.values(f.queries.query);
                                    _ < x.length;
                                    _++
                                  )
                                    for (
                                      var K,
                                        k,
                                        O,
                                        S = 0,
                                        P = (K = x[_]).slice();
                                      S < P.length;
                                      S++
                                    )
                                      (k = P[S]).res != null &&
                                        u.mutatedParts &&
                                        (c && !k.dirty
                                          ? ((O = Object.isFrozen(k.res)),
                                            (O = Sr(k.res, k.req, d, h, k, O)),
                                            k.dirty
                                              ? (Re(K, k),
                                                k.subscribers.forEach(
                                                  function (C) {
                                                    return l.add(C);
                                                  },
                                                ))
                                              : O !== k.res &&
                                                ((k.res = O),
                                                (k.promise = A.resolve({
                                                  result: O,
                                                }))))
                                          : (k.dirty && Re(K, k),
                                            k.subscribers.forEach(function (C) {
                                              return l.add(C);
                                            })));
                                }
                              }
                            }
                            l.forEach(function (C) {
                              return C();
                            });
                          }
                        };
                      }),
                      u.addEventListener('abort', i(!1), { signal: a }),
                      u.addEventListener('error', i(!1), { signal: a }),
                      u.addEventListener('complete', i(!0), { signal: a })),
                    u
                  );
                },
                table: function (n) {
                  var r = e.table(n),
                    i = r.schema.primaryKey;
                  return E(E({}, r), {
                    mutate: function (o) {
                      var a = T.trans;
                      if (
                        i.outbound ||
                        a.db._options.cache === 'disabled' ||
                        a.explicit ||
                        a.idbtrans.mode !== 'readwrite'
                      )
                        return r.mutate(o);
                      var u = Ye['idb://'.concat(t, '/').concat(n)];
                      return u
                        ? ((a = r.mutate(o)),
                          (o.type !== 'add' && o.type !== 'put') ||
                          !(
                            50 <= o.values.length ||
                            Fn(i, o).some(function (c) {
                              return c == null;
                            })
                          )
                            ? (u.optimisticOps.push(o),
                              o.mutatedParts && Ht(o.mutatedParts),
                              a.then(function (c) {
                                0 < c.numFailures &&
                                  (Re(u.optimisticOps, o),
                                  (c = Kr(0, o, c)) && u.optimisticOps.push(c),
                                  o.mutatedParts && Ht(o.mutatedParts));
                              }),
                              a.catch(function () {
                                (Re(u.optimisticOps, o),
                                  o.mutatedParts && Ht(o.mutatedParts));
                              }))
                            : a.then(function (c) {
                                var l = Kr(
                                  0,
                                  E(E({}, o), {
                                    values: o.values.map(function (p, s) {
                                      var v;
                                      return c.failures[s]
                                        ? p
                                        : ((p =
                                            (v = i.keyPath) !== null &&
                                            v !== void 0 &&
                                            v.includes('.')
                                              ? qe(p)
                                              : E({}, p)),
                                          M(p, i.keyPath, c.results[s]),
                                          p);
                                    }),
                                  }),
                                  c,
                                );
                                (u.optimisticOps.push(l),
                                  queueMicrotask(function () {
                                    return o.mutatedParts && Ht(o.mutatedParts);
                                  }));
                              }),
                          a)
                        : r.mutate(o);
                    },
                    query: function (o) {
                      if (!Pr(T, r) || !Er('query', o)) return r.query(o);
                      var a =
                          ((l = T.trans) === null || l === void 0
                            ? void 0
                            : l.db._options.cache) === 'immutable',
                        s = T,
                        u = s.requery,
                        c = s.signal,
                        l = (function (h, d, y, m) {
                          var b = Ye['idb://'.concat(h, '/').concat(d)];
                          if (!b) return [];
                          if (!(d = b.queries[y])) return [null, !1, b, null];
                          var g =
                            d[(m.query ? m.query.index.name : null) || ''];
                          if (!g) return [null, !1, b, null];
                          switch (y) {
                            case 'query':
                              var _ = g.find(function (x) {
                                return (
                                  x.req.limit === m.limit &&
                                  x.req.values === m.values &&
                                  Ar(x.req.query.range, m.query.range)
                                );
                              });
                              return _
                                ? [_, !0, b, g]
                                : [
                                    g.find(function (x) {
                                      return (
                                        ('limit' in x.req
                                          ? x.req.limit
                                          : 1 / 0) >= m.limit &&
                                        (!m.values || x.req.values) &&
                                        Si(x.req.query.range, m.query.range)
                                      );
                                    }),
                                    !1,
                                    b,
                                    g,
                                  ];
                            case 'count':
                              return (
                                (_ = g.find(function (x) {
                                  return Ar(x.req.query.range, m.query.range);
                                })),
                                [_, !!_, b, g]
                              );
                          }
                        })(t, n, 'query', o),
                        p = l[0],
                        s = l[1],
                        v = l[2],
                        f = l[3];
                      return (
                        p && s
                          ? (p.obsSet = o.obsSet)
                          : ((s = r
                              .query(o)
                              .then(function (h) {
                                var d = h.result;
                                if ((p && (p.res = d), a)) {
                                  for (var y = 0, m = d.length; y < m; ++y)
                                    Object.freeze(d[y]);
                                  Object.freeze(d);
                                } else h.result = qe(d);
                                return h;
                              })
                              .catch(function (h) {
                                return (f && p && Re(f, p), Promise.reject(h));
                              })),
                            (p = {
                              obsSet: o.obsSet,
                              promise: s,
                              subscribers: new Set(),
                              type: 'query',
                              req: o,
                              dirty: !1,
                            }),
                            f
                              ? f.push(p)
                              : ((f = [p]),
                                ((v =
                                  v ||
                                  (Ye['idb://'.concat(t, '/').concat(n)] = {
                                    queries: { query: {}, count: {} },
                                    objs: new Map(),
                                    optimisticOps: [],
                                    unsignaledParts: {},
                                  })).queries.query[o.query.index.name || ''] =
                                  f))),
                        Ai(p, f, u, c),
                        p.promise.then(function (h) {
                          return {
                            result: Sr(h.result, o, v?.optimisticOps, r, p, a),
                          };
                        })
                      );
                    },
                  });
                },
              });
            },
          };
          function Jt(e, t) {
            return new Proxy(e, {
              get: function (n, r, i) {
                return r === 'db' ? t : Reflect.get(n, r, i);
              },
            });
          }
          var xe =
            ((ee.prototype.version = function (e) {
              if (isNaN(e) || e < 0.1)
                throw new D.Type('Given version is not a positive number');
              if (
                ((e = Math.round(10 * e) / 10),
                this.idbdb || this._state.isBeingOpened)
              )
                throw new D.Schema('Cannot add version when database is open');
              this.verno = Math.max(this.verno, e);
              var t = this._versions,
                n = t.filter(function (r) {
                  return r._cfg.version === e;
                })[0];
              return (
                n ||
                ((n = new this.Version(e)),
                t.push(n),
                t.sort(gi),
                n.stores({}),
                (this._state.autoSchema = !1),
                n)
              );
            }),
            (ee.prototype._whenReady = function (e) {
              var t = this;
              return this.idbdb &&
                (this._state.openComplete || T.letThrough || this._vip)
                ? e()
                : new A(function (n, r) {
                    if (t._state.openComplete)
                      return r(new D.DatabaseClosed(t._state.dbOpenError));
                    if (!t._state.isBeingOpened) {
                      if (!t._state.autoOpen)
                        return void r(new D.DatabaseClosed());
                      t.open().catch(G);
                    }
                    t._state.dbReadyPromise.then(n, r);
                  }).then(e);
            }),
            (ee.prototype.use = function (e) {
              var t = e.stack,
                n = e.create,
                r = e.level,
                i = e.name;
              return (
                i && this.unuse({ stack: t, name: i }),
                (e = this._middlewares[t] || (this._middlewares[t] = [])),
                e.push({ stack: t, create: n, level: r ?? 10, name: i }),
                e.sort(function (o, a) {
                  return o.level - a.level;
                }),
                this
              );
            }),
            (ee.prototype.unuse = function (e) {
              var t = e.stack,
                n = e.name,
                r = e.create;
              return (
                t &&
                  this._middlewares[t] &&
                  (this._middlewares[t] = this._middlewares[t].filter(
                    function (i) {
                      return r ? i.create !== r : !!n && i.name !== n;
                    },
                  )),
                this
              );
            }),
            (ee.prototype.open = function () {
              var e = this;
              return Ve(Ee, function () {
                return xi(e);
              });
            }),
            (ee.prototype._close = function () {
              this.on.close.fire(new CustomEvent('close'));
              var e = this._state,
                t = nt.indexOf(this);
              if ((0 <= t && nt.splice(t, 1), this.idbdb)) {
                try {
                  this.idbdb.close();
                } catch {}
                this.idbdb = null;
              }
              e.isBeingOpened ||
                ((e.dbReadyPromise = new A(function (n) {
                  e.dbReadyResolve = n;
                })),
                (e.openCanceller = new A(function (n, r) {
                  e.cancelOpen = r;
                })));
            }),
            (ee.prototype.close = function (n) {
              var t = (n === void 0 ? { disableAutoOpen: !0 } : n)
                  .disableAutoOpen,
                n = this._state;
              t
                ? (n.isBeingOpened && n.cancelOpen(new D.DatabaseClosed()),
                  this._close(),
                  (n.autoOpen = !1),
                  (n.dbOpenError = new D.DatabaseClosed()))
                : (this._close(),
                  (n.autoOpen = this._options.autoOpen || n.isBeingOpened),
                  (n.openComplete = !1),
                  (n.dbOpenError = null));
            }),
            (ee.prototype.delete = function (e) {
              var t = this;
              e === void 0 && (e = { disableAutoOpen: !0 });
              var n = 0 < arguments.length && typeof arguments[0] != 'object',
                r = this._state;
              return new A(function (i, o) {
                function a() {
                  t.close(e);
                  var u = t._deps.indexedDB.deleteDatabase(t.name);
                  ((u.onsuccess = H(function () {
                    var c, l, p;
                    ((c = t._deps),
                      (l = t.name),
                      (p = c.indexedDB),
                      (c = c.IDBKeyRange),
                      jn(p) || l === Rt || Cn(p, c).delete(l).catch(G),
                      i());
                  })),
                    (u.onerror = ge(o)),
                    (u.onblocked = t._fireOnBlocked));
                }
                if (n)
                  throw new D.InvalidArgument(
                    'Invalid closeOptions argument to db.delete()',
                  );
                r.isBeingOpened ? r.dbReadyPromise.then(a) : a();
              });
            }),
            (ee.prototype.backendDB = function () {
              return this.idbdb;
            }),
            (ee.prototype.isOpen = function () {
              return this.idbdb !== null;
            }),
            (ee.prototype.hasBeenClosed = function () {
              var e = this._state.dbOpenError;
              return e && e.name === 'DatabaseClosed';
            }),
            (ee.prototype.hasFailed = function () {
              return this._state.dbOpenError !== null;
            }),
            (ee.prototype.dynamicallyOpened = function () {
              return this._state.autoSchema;
            }),
            Object.defineProperty(ee.prototype, 'tables', {
              get: function () {
                var e = this;
                return $(this._allTables).map(function (t) {
                  return e._allTables[t];
                });
              },
              enumerable: !1,
              configurable: !0,
            }),
            (ee.prototype.transaction = function () {
              var e = function (t, n, r) {
                var i = arguments.length;
                if (i < 2) throw new D.InvalidArgument('Too few arguments');
                for (var o = new Array(i - 1); --i; ) o[i - 1] = arguments[i];
                return ((r = o.pop()), [t, ie(o), r]);
              }.apply(this, arguments);
              return this._transaction.apply(this, e);
            }),
            (ee.prototype._transaction = function (e, t, n) {
              var r = this,
                i = T.trans;
              (i && i.db === this && e.indexOf('!') === -1) || (i = null);
              var o,
                a,
                u = e.indexOf('?') !== -1;
              e = e.replace('!', '').replace('?', '');
              try {
                if (
                  ((a = t.map(function (l) {
                    if (
                      ((l = l instanceof r.Table ? l.name : l),
                      typeof l != 'string')
                    )
                      throw new TypeError(
                        'Invalid table argument to Dexie.transaction(). Only Table or String are allowed',
                      );
                    return l;
                  })),
                  e == 'r' || e === gn)
                )
                  o = gn;
                else {
                  if (e != 'rw' && e != _n)
                    throw new D.InvalidArgument(
                      'Invalid transaction mode: ' + e,
                    );
                  o = _n;
                }
                if (i) {
                  if (i.mode === gn && o === _n) {
                    if (!u)
                      throw new D.SubTransaction(
                        'Cannot enter a sub-transaction with READWRITE mode when parent transaction is READONLY',
                      );
                    i = null;
                  }
                  (i &&
                    a.forEach(function (l) {
                      if (i && i.storeNames.indexOf(l) === -1) {
                        if (!u)
                          throw new D.SubTransaction(
                            'Table ' +
                              l +
                              ' not included in parent transaction.',
                          );
                        i = null;
                      }
                    }),
                    u && i && !i.active && (i = null));
                }
              } catch (l) {
                return i
                  ? i._promise(null, function (p, s) {
                      s(l);
                    })
                  : Z(l);
              }
              var c = function l(p, s, v, f, h) {
                return A.resolve().then(function () {
                  var d = T.transless || T,
                    y = p._createTransaction(s, v, p._dbSchema, f);
                  if (((y.explicit = !0), (d = { trans: y, transless: d }), f))
                    y.idbtrans = f.idbtrans;
                  else
                    try {
                      (y.create(),
                        (y.idbtrans._explicit = !0),
                        (p._state.PR1398_maxLoop = 3));
                    } catch (g) {
                      return g.name === cn.InvalidState &&
                        p.isOpen() &&
                        0 < --p._state.PR1398_maxLoop
                        ? (console.warn('Dexie: Need to reopen db'),
                          p.close({ disableAutoOpen: !1 }),
                          p.open().then(function () {
                            return l(p, s, v, null, h);
                          }))
                        : Z(g);
                    }
                  var m,
                    b = sn(h);
                  return (
                    b && tt(),
                    (d = A.follow(function () {
                      var g;
                      (m = h.call(y, y)) &&
                        (b
                          ? ((g = Se.bind(null, null)), m.then(g, g))
                          : typeof m.next == 'function' &&
                            typeof m.throw == 'function' &&
                            (m = Nn(m)));
                    }, d)),
                    (m && typeof m.then == 'function'
                      ? A.resolve(m).then(function (g) {
                          return y.active
                            ? g
                            : Z(
                                new D.PrematureCommit(
                                  'Transaction committed too early. See http://bit.ly/2kdckMn',
                                ),
                              );
                        })
                      : d.then(function () {
                          return m;
                        })
                    )
                      .then(function (g) {
                        return (
                          f && y._resolve(),
                          y._completion.then(function () {
                            return g;
                          })
                        );
                      })
                      .catch(function (g) {
                        return (y._reject(g), Z(g));
                      })
                  );
                });
              }.bind(null, this, o, a, i, n);
              return i
                ? i._promise(o, c, 'lock')
                : T.trans
                  ? Ve(T.transless, function () {
                      return r._whenReady(c);
                    })
                  : this._whenReady(c);
            }),
            (ee.prototype.table = function (e) {
              if (!te(this._allTables, e))
                throw new D.InvalidTable('Table '.concat(e, ' does not exist'));
              return this._allTables[e];
            }),
            ee);
          function ee(e, t) {
            var n = this;
            ((this._middlewares = {}), (this.verno = 0));
            var r = ee.dependencies;
            ((this._options = t =
              E(
                {
                  addons: ee.addons,
                  autoOpen: !0,
                  indexedDB: r.indexedDB,
                  IDBKeyRange: r.IDBKeyRange,
                  cache: 'cloned',
                },
                t,
              )),
              (this._deps = {
                indexedDB: t.indexedDB,
                IDBKeyRange: t.IDBKeyRange,
              }),
              (r = t.addons),
              (this._dbSchema = {}),
              (this._versions = []),
              (this._storeNames = []),
              (this._allTables = {}),
              (this.idbdb = null),
              (this._novip = this));
            var i,
              o,
              a,
              u,
              c,
              l = {
                dbOpenError: null,
                isBeingOpened: !1,
                onReadyBeingFired: null,
                openComplete: !1,
                dbReadyResolve: G,
                dbReadyPromise: null,
                cancelOpen: G,
                openCanceller: null,
                autoSchema: !0,
                PR1398_maxLoop: 3,
                autoOpen: t.autoOpen,
              };
            ((l.dbReadyPromise = new A(function (s) {
              l.dbReadyResolve = s;
            })),
              (l.openCanceller = new A(function (s, v) {
                l.cancelOpen = v;
              })),
              (this._state = l),
              (this.name = e),
              (this.on = vt(
                this,
                'populate',
                'blocked',
                'versionchange',
                'close',
                { ready: [ln, G] },
              )),
              (this.once = function (s, v) {
                var f = function () {
                  for (var h = [], d = 0; d < arguments.length; d++)
                    h[d] = arguments[d];
                  (n.on(s).unsubscribe(f), v.apply(n, h));
                };
                return n.on(s, f);
              }),
              (this.on.ready.subscribe = Qe(
                this.on.ready.subscribe,
                function (s) {
                  return function (v, f) {
                    ee.vip(function () {
                      var h,
                        d = n._state;
                      d.openComplete
                        ? (d.dbOpenError || A.resolve().then(v), f && s(v))
                        : d.onReadyBeingFired
                          ? (d.onReadyBeingFired.push(v), f && s(v))
                          : (s(v),
                            (h = n),
                            f ||
                              s(function y() {
                                (h.on.ready.unsubscribe(v),
                                  h.on.ready.unsubscribe(y));
                              }));
                    });
                  };
                },
              )),
              (this.Collection =
                ((i = this),
                mt(hi.prototype, function (m, y) {
                  this.db = i;
                  var f = ir,
                    h = null;
                  if (y)
                    try {
                      f = y();
                    } catch (b) {
                      h = b;
                    }
                  var d = m._ctx,
                    y = d.table,
                    m = y.hook.reading.fire;
                  this._ctx = {
                    table: y,
                    index: d.index,
                    isPrimKey:
                      !d.index ||
                      (y.schema.primKey.keyPath &&
                        d.index === y.schema.primKey.name),
                    range: f,
                    keysOnly: !1,
                    dir: 'next',
                    unique: '',
                    algorithm: null,
                    filter: null,
                    replayFilter: null,
                    justLimit: !0,
                    isMatch: null,
                    offset: 0,
                    limit: 1 / 0,
                    error: h,
                    or: d.or,
                    valueMapper: m !== lt ? m : null,
                  };
                }))),
              (this.Table =
                ((o = this),
                mt(lr.prototype, function (s, v, f) {
                  ((this.db = o),
                    (this._tx = f),
                    (this.name = s),
                    (this.schema = v),
                    (this.hook = o._allTables[s]
                      ? o._allTables[s].hook
                      : vt(null, {
                          creating: [ri, G],
                          reading: [ni, lt],
                          updating: [oi, G],
                          deleting: [ii, G],
                        })));
                }))),
              (this.Transaction =
                ((a = this),
                mt(yi.prototype, function (s, v, f, h, d) {
                  var y = this;
                  (s !== 'readonly' &&
                    v.forEach(function (m) {
                      ((m =
                        (m = f[m]) === null || m === void 0
                          ? void 0
                          : m.yProps),
                        m &&
                          (v = v.concat(
                            m.map(function (b) {
                              return b.updatesTable;
                            }),
                          )));
                    }),
                    (this.db = a),
                    (this.mode = s),
                    (this.storeNames = v),
                    (this.schema = f),
                    (this.chromeTransactionDurability = h),
                    (this.idbtrans = null),
                    (this.on = vt(this, 'complete', 'error', 'abort')),
                    (this.parent = d || null),
                    (this.active = !0),
                    (this._reculock = 0),
                    (this._blockedFuncs = []),
                    (this._resolve = null),
                    (this._reject = null),
                    (this._waitingFor = null),
                    (this._waitingQueue = null),
                    (this._spinCount = 0),
                    (this._completion = new A(function (m, b) {
                      ((y._resolve = m), (y._reject = b));
                    })),
                    this._completion.then(
                      function () {
                        ((y.active = !1), y.on.complete.fire());
                      },
                      function (m) {
                        var b = y.active;
                        return (
                          (y.active = !1),
                          y.on.error.fire(m),
                          y.parent
                            ? y.parent._reject(m)
                            : b && y.idbtrans && y.idbtrans.abort(),
                          Z(m)
                        );
                      },
                    ));
                }))),
              (this.Version =
                ((u = this),
                mt(ki.prototype, function (s) {
                  ((this.db = u),
                    (this._cfg = {
                      version: s,
                      storesSource: null,
                      dbschema: {},
                      tables: {},
                      contentUpgrade: null,
                    }));
                }))),
              (this.WhereClause =
                ((c = this),
                mt(yr.prototype, function (s, v, f) {
                  if (
                    ((this.db = c),
                    (this._ctx = {
                      table: s,
                      index: v === ':id' ? null : v,
                      or: f,
                    }),
                    (this._cmp = this._ascending = F),
                    (this._descending = function (h, d) {
                      return F(d, h);
                    }),
                    (this._max = function (h, d) {
                      return 0 < F(h, d) ? h : d;
                    }),
                    (this._min = function (h, d) {
                      return F(h, d) < 0 ? h : d;
                    }),
                    (this._IDBKeyRange = c._deps.IDBKeyRange),
                    !this._IDBKeyRange)
                  )
                    throw new D.MissingAPI();
                }))),
              this.on('versionchange', function (s) {
                (0 < s.newVersion
                  ? console.warn(
                      "Another connection wants to upgrade database '".concat(
                        n.name,
                        "'. Closing db now to resume the upgrade.",
                      ),
                    )
                  : console.warn(
                      "Another connection wants to delete database '".concat(
                        n.name,
                        "'. Closing db now to resume the delete request.",
                      ),
                    ),
                  n.close({ disableAutoOpen: !1 }));
              }),
              this.on('blocked', function (s) {
                !s.newVersion || s.newVersion < s.oldVersion
                  ? console.warn(
                      "Dexie.delete('".concat(n.name, "') was blocked"),
                    )
                  : console.warn(
                      "Upgrade '"
                        .concat(
                          n.name,
                          "' blocked by other connection holding version ",
                        )
                        .concat(s.oldVersion / 10),
                    );
              }),
              (this._maxKey = _t(t.IDBKeyRange)),
              (this._createTransaction = function (s, v, f, h) {
                return new n.Transaction(
                  s,
                  v,
                  f,
                  n._options.chromeTransactionDurability,
                  h,
                );
              }),
              (this._fireOnBlocked = function (s) {
                (n.on('blocked').fire(s),
                  nt
                    .filter(function (v) {
                      return v.name === n.name && v !== n && !v._state.vcFired;
                    })
                    .map(function (v) {
                      return v.on('versionchange').fire(s);
                    }));
              }),
              this.use(Ei),
              this.use(Ci),
              this.use(Ki),
              this.use(Oi),
              this.use(Pi));
            var p = new Proxy(this, {
              get: function (s, v, f) {
                if (v === '_vip') return !0;
                if (v === 'table')
                  return function (d) {
                    return Jt(n.table(d), p);
                  };
                var h = Reflect.get(s, v, f);
                return h instanceof lr
                  ? Jt(h, p)
                  : v === 'tables'
                    ? h.map(function (d) {
                        return Jt(d, p);
                      })
                    : v === '_createTransaction'
                      ? function () {
                          return Jt(h.apply(this, arguments), p);
                        }
                      : h;
              },
            });
            ((this.vip = p),
              r.forEach(function (s) {
                return s(n);
              }));
          }
          var Zt,
            ye =
              typeof Symbol < 'u' && 'observable' in Symbol
                ? Symbol.observable
                : '@@observable',
            ji =
              ((Un.prototype.subscribe = function (e, t, n) {
                return this._subscribe(
                  e && typeof e != 'function'
                    ? e
                    : { next: e, error: t, complete: n },
                );
              }),
              (Un.prototype[ye] = function () {
                return this;
              }),
              Un);
          function Un(e) {
            this._subscribe = e;
          }
          try {
            Zt = {
              indexedDB:
                V.indexedDB ||
                V.mozIndexedDB ||
                V.webkitIndexedDB ||
                V.msIndexedDB,
              IDBKeyRange: V.IDBKeyRange || V.webkitIDBKeyRange,
            };
          } catch {
            Zt = { indexedDB: null, IDBKeyRange: null };
          }
          function Cr(e) {
            var t,
              n = !1,
              r = new ji(function (i) {
                var o = sn(e),
                  a,
                  u = !1,
                  c = {},
                  l = {},
                  p = {
                    get closed() {
                      return u;
                    },
                    unsubscribe: function () {
                      u ||
                        ((u = !0),
                        a && a.abort(),
                        s && je.storagemutated.unsubscribe(f));
                    },
                  };
                i.start && i.start(p);
                var s = !1,
                  v = function () {
                    return bn(h);
                  },
                  f = function (d) {
                    (Qt(c, d), Dn(l, c) && v());
                  },
                  h = function () {
                    var d, y, m;
                    !u &&
                      Zt.indexedDB &&
                      ((c = {}),
                      (d = {}),
                      a && a.abort(),
                      (a = new AbortController()),
                      (m = (function (b) {
                        var g = Ze();
                        try {
                          o && tt();
                          var _ = Ke(e, b);
                          return (_ = o ? _.finally(Se) : _);
                        } finally {
                          g && et();
                        }
                      })(
                        (y = {
                          subscr: d,
                          signal: a.signal,
                          requery: v,
                          querier: e,
                          trans: null,
                        }),
                      )),
                      Promise.resolve(m).then(
                        function (b) {
                          ((n = !0),
                            (t = b),
                            u ||
                              y.signal.aborted ||
                              ((c = {}),
                              (function (g) {
                                for (var _ in g) if (te(g, _)) return;
                                return 1;
                              })((l = d)) ||
                                s ||
                                (je(gt, f), (s = !0)),
                              bn(function () {
                                return !u && i.next && i.next(b);
                              })));
                        },
                        function (b) {
                          ((n = !1),
                            ['DatabaseClosedError', 'AbortError'].includes(
                              b?.name,
                            ) ||
                              u ||
                              bn(function () {
                                u || (i.error && i.error(b));
                              }));
                        },
                      ));
                  };
                return (setTimeout(v, 0), p);
              });
            return (
              (r.hasValue = function () {
                return n;
              }),
              (r.getValue = function () {
                return t;
              }),
              r
            );
          }
          var We = xe;
          function Vn(e) {
            var t = Te;
            try {
              ((Te = !0), je.storagemutated.fire(e), Rn(e, !0));
            } finally {
              Te = t;
            }
          }
          (J(
            We,
            E(E({}, St), {
              delete: function (e) {
                return new We(e, { addons: [] }).delete();
              },
              exists: function (e) {
                return new We(e, { addons: [] })
                  .open()
                  .then(function (t) {
                    return (t.close(), !0);
                  })
                  .catch('NoSuchDatabaseError', function () {
                    return !1;
                  });
              },
              getDatabaseNames: function (e) {
                try {
                  return (
                    (t = We.dependencies),
                    (n = t.indexedDB),
                    (t = t.IDBKeyRange),
                    (jn(n)
                      ? Promise.resolve(n.databases()).then(function (r) {
                          return r
                            .map(function (i) {
                              return i.name;
                            })
                            .filter(function (i) {
                              return i !== Rt;
                            });
                        })
                      : Cn(n, t).toCollection().primaryKeys()
                    ).then(e)
                  );
                } catch {
                  return Z(new D.MissingAPI());
                }
                var t, n;
              },
              defineClass: function () {
                return function (e) {
                  W(this, e);
                };
              },
              ignoreTransaction: function (e) {
                return T.trans ? Ve(T.transless, e) : e();
              },
              vip: Tn,
              async: function (e) {
                return function () {
                  try {
                    var t = Nn(e.apply(this, arguments));
                    return t && typeof t.then == 'function' ? t : A.resolve(t);
                  } catch (n) {
                    return Z(n);
                  }
                };
              },
              spawn: function (e, t, n) {
                try {
                  var r = Nn(e.apply(n, t || []));
                  return r && typeof r.then == 'function' ? r : A.resolve(r);
                } catch (i) {
                  return Z(i);
                }
              },
              currentTransaction: {
                get: function () {
                  return T.trans || null;
                },
              },
              waitFor: function (e, t) {
                return (
                  (t = A.resolve(
                    typeof e == 'function' ? We.ignoreTransaction(e) : e,
                  ).timeout(t || 6e4)),
                  T.trans ? T.trans.waitFor(t) : t
                );
              },
              Promise: A,
              debug: {
                get: function () {
                  return be;
                },
                set: function (e) {
                  Xn(e);
                },
              },
              derive: me,
              extend: W,
              props: J,
              override: Qe,
              Events: vt,
              on: je,
              liveQuery: Cr,
              extendObservabilitySet: Qt,
              getByKeyPath: L,
              setByKeyPath: M,
              delByKeyPath: function (e, t) {
                typeof t == 'string'
                  ? M(e, t, void 0)
                  : 'length' in t &&
                    [].map.call(t, function (n) {
                      M(e, n, void 0);
                    });
              },
              shallowClone: ue,
              deepClone: qe,
              getObjectDiff: Mn,
              cmp: F,
              asap: ct,
              minKey: -1 / 0,
              addons: [],
              connections: nt,
              errnames: cn,
              dependencies: Zt,
              cache: Ye,
              semVer: '4.2.1',
              version: '4.2.1'
                .split('.')
                .map(function (e) {
                  return parseInt(e);
                })
                .reduce(function (e, t, n) {
                  return e + t / Math.pow(10, 2 * n);
                }),
            }),
          ),
            (We.maxKey = _t(We.dependencies.IDBKeyRange)),
            typeof dispatchEvent < 'u' &&
              typeof addEventListener < 'u' &&
              (je(gt, function (e) {
                Te ||
                  ((e = new CustomEvent(xn, { detail: e })),
                  (Te = !0),
                  dispatchEvent(e),
                  (Te = !1));
              }),
              addEventListener(xn, function (e) {
                ((e = e.detail), Te || Vn(e));
              })));
          var at,
            Te = !1,
            jr = function () {};
          return (
            typeof BroadcastChannel < 'u' &&
              ((jr = function () {
                (at = new BroadcastChannel(xn)).onmessage = function (e) {
                  return e.data && Vn(e.data);
                };
              })(),
              typeof at.unref == 'function' && at.unref(),
              je(gt, function (e) {
                Te || at.postMessage(e);
              })),
            typeof addEventListener < 'u' &&
              (addEventListener('pagehide', function (e) {
                if (!xe.disableBfCache && e.persisted) {
                  (be && console.debug('Dexie: handling persisted pagehide'),
                    at?.close());
                  for (var t = 0, n = nt; t < n.length; t++)
                    n[t].close({ disableAutoOpen: !1 });
                }
              }),
              addEventListener('pageshow', function (e) {
                !xe.disableBfCache &&
                  e.persisted &&
                  (be && console.debug('Dexie: handling persisted pageshow'),
                  jr(),
                  Vn({ all: new se(-1 / 0, [[]]) }));
              })),
            (A.rejectionMapper = function (e, t) {
              return !e ||
                e instanceof Xe ||
                e instanceof TypeError ||
                e instanceof SyntaxError ||
                !e.name ||
                !Hn[e.name]
                ? e
                : ((t = new Hn[e.name](t || e.message, e)),
                  'stack' in e &&
                    re(t, 'stack', {
                      get: function () {
                        return this.inner.stack;
                      },
                    }),
                  t);
            }),
            Xn(be),
            E(
              xe,
              Object.freeze({
                __proto__: null,
                Dexie: xe,
                liveQuery: Cr,
                Entity: or,
                cmp: F,
                PropModification: yt,
                replacePrefix: function (e, t) {
                  return new yt({ replacePrefix: [e, t] });
                },
                add: function (e) {
                  return new yt({ add: e });
                },
                remove: function (e) {
                  return new yt({ remove: e });
                },
                default: xe,
                RangeSet: se,
                mergeRanges: xt,
                rangesOverlap: _r,
              }),
              { default: xe },
            ),
            xe
          );
        });
      })(nn)),
    nn.exports
  );
}
var fo = lo();
const Gn = so(fo),
  qr = Symbol.for('Dexie'),
  on = globalThis[qr] || (globalThis[qr] = Gn);
if (Gn.semVer !== on.semVer)
  throw new Error(
    `Two different versions of Dexie loaded in the same app: ${Gn.semVer} and ${on.semVer}`,
  );
const {
  liveQuery: _o,
  mergeRanges: wo,
  rangesOverlap: ko,
  RangeSet: xo,
  cmp: Oo,
  Entity: Po,
  PropModification: Eo,
  replacePrefix: Ko,
  add: So,
  remove: Ao,
  DexieYProvider: Co,
} = on;
let tn = null;
((tn = new on('levelMeUpDB')),
  tn
    .version(1)
    .stores({ areas: '++id, nome', itens: '++id, areaId, nome, tipo' }),
  tn
    .version(2)
    .stores({
      areas: '++id, nome',
      itens: '++id, areaId, nome, tipo',
      meta: 'key',
    }),
  tn.open().catch((w) => {
    console.error(`Falha ao abrir o DB: ${w.stack || w}`);
  }));
var ho = Rr('<button><!></button>');
function jo(w, j) {
  let I = ut(j, 'variant', 3, 'primary'),
    E = ut(j, 'class', 3, ''),
    U = ut(j, 'type', 3, 'button'),
    V = ut(j, 'onclick', 3, () => {}),
    $ = Yr(j, [
      '$$slots',
      '$$events',
      '$$legacy',
      'variant',
      'class',
      'type',
      'children',
      'onclick',
    ]);
  const z = {
    primary:
      'bg-primary text-white hover:bg-primary-light focus-visible:ring-primary',
    success:
      'bg-success text-white hover:bg-success/80 focus-visible:ring-success',
    danger: 'bg-danger text-white hover:bg-danger/80 focus-visible:ring-danger',
  };
  let W = z[I()] || z.primary;
  var X = ho();
  Qr(X, () => ({
    type: U(),
    ...$,
    class: `px-4 py-2 rounded-md font-semibold text-sm shadow-md transition-colors duração-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 ${W ?? ''} ${E() ?? ''}`,
    onclick: V(),
  }));
  var ve = Ur(X);
  (zr(ve, () => j.children ?? Vr), $r(X), Nr(w, X));
}
var po = Rr('<div><!></div>');
function To(w, j) {
  let I = ut(j, 'onclick', 3, () => {}),
    E = ut(j, 'onkeydown', 3, () => {}),
    U = Yr(j, [
      '$$slots',
      '$$events',
      '$$legacy',
      'children',
      'onclick',
      'onkeydown',
    ]);
  function V(W) {
    W.target === W.currentTarget &&
      (W.key === 'Enter' || W.key === ' ') &&
      (W.preventDefault(), W.currentTarget.click());
  }
  var $ = po();
  Qr($, () => ({
    class:
      'base-card bg-card border border-border rounded-md p-4 shadow-lg focus-visible:outline-primary focus-visible:outline-offset-2',
    role: 'button',
    tabindex: '0',
    ...U,
    onclick: I(),
    onkeydown: V || E(),
  }));
  var z = Ur($);
  (zr(z, () => j.children ?? Vr), $r($), Nr(w, $));
}
export {
  To as B,
  jo as a,
  uo as c,
  tn as d,
  so as g,
  _o as l,
  io as r,
  no as s,
};
