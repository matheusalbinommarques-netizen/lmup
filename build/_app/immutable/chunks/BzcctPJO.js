import {
  aL as he,
  aM as wt,
  o as qe,
  s as U,
  g as T,
  b as P,
  C as ee,
  aN as De,
  aO as vt,
  aP as yt,
} from './C4tos-D-.js';
const V = [];
function ke(e, t = he) {
  let n = null;
  const r = new Set();
  function a(s) {
    if (wt(e, s) && ((e = s), n)) {
      const c = !V.length;
      for (const l of r) (l[1](), V.push(l, e));
      if (c) {
        for (let l = 0; l < V.length; l += 2) V[l][0](V[l + 1]);
        V.length = 0;
      }
    }
  }
  function i(s) {
    a(s(e));
  }
  function o(s, c = he) {
    const l = [s, c];
    return (
      r.add(l),
      r.size === 1 && (n = t(a, i) || he),
      s(e),
      () => {
        (r.delete(l), r.size === 0 && n && (n(), (n = null)));
      }
    );
  }
  return { set: a, update: i, subscribe: o };
}
class Se {
  constructor(t, n) {
    ((this.status = t),
      typeof n == 'string'
        ? (this.body = { message: n })
        : n
          ? (this.body = n)
          : (this.body = { message: `Error: ${t}` }));
  }
  toString() {
    return JSON.stringify(this.body);
  }
}
class Ee {
  constructor(t, n) {
    ((this.status = t), (this.location = n));
  }
}
class Re extends Error {
  constructor(t, n, r) {
    (super(r), (this.status = t), (this.text = n));
  }
}
new URL('sveltekit-internal://');
function bt(e, t) {
  return e === '/' || t === 'ignore'
    ? e
    : t === 'never'
      ? e.endsWith('/')
        ? e.slice(0, -1)
        : e
      : t === 'always' && !e.endsWith('/')
        ? e + '/'
        : e;
}
function kt(e) {
  return e.split('%25').map(decodeURI).join('%25');
}
function St(e) {
  for (const t in e) e[t] = decodeURIComponent(e[t]);
  return e;
}
function pe({ href: e }) {
  return e.split('#')[0];
}
function Et(e, t, n, r = !1) {
  const a = new URL(e);
  Object.defineProperty(a, 'searchParams', {
    value: new Proxy(a.searchParams, {
      get(o, s) {
        if (s === 'get' || s === 'getAll' || s === 'has')
          return (l) => (n(l), o[s](l));
        t();
        const c = Reflect.get(o, s);
        return typeof c == 'function' ? c.bind(o) : c;
      },
    }),
    enumerable: !0,
    configurable: !0,
  });
  const i = ['href', 'pathname', 'search', 'toString', 'toJSON'];
  r && i.push('hash');
  for (const o of i)
    Object.defineProperty(a, o, {
      get() {
        return (t(), e[o]);
      },
      enumerable: !0,
      configurable: !0,
    });
  return a;
}
function Rt(...e) {
  let t = 5381;
  for (const n of e)
    if (typeof n == 'string') {
      let r = n.length;
      for (; r; ) t = (t * 33) ^ n.charCodeAt(--r);
    } else if (ArrayBuffer.isView(n)) {
      const r = new Uint8Array(n.buffer, n.byteOffset, n.byteLength);
      let a = r.length;
      for (; a; ) t = (t * 33) ^ r[--a];
    } else throw new TypeError('value must be a string or TypedArray');
  return (t >>> 0).toString(36);
}
new TextEncoder();
new TextDecoder();
function xt(e) {
  const t = atob(e),
    n = new Uint8Array(t.length);
  for (let r = 0; r < t.length; r++) n[r] = t.charCodeAt(r);
  return n;
}
const Lt = window.fetch;
window.fetch = (e, t) => (
  (e instanceof Request ? e.method : t?.method || 'GET') !== 'GET' &&
    z.delete(xe(e)),
  Lt(e, t)
);
const z = new Map();
function At(e, t) {
  const n = xe(e, t),
    r = document.querySelector(n);
  if (r?.textContent) {
    r.remove();
    let { body: a, ...i } = JSON.parse(r.textContent);
    const o = r.getAttribute('data-ttl');
    return (
      o && z.set(n, { body: a, init: i, ttl: 1e3 * Number(o) }),
      r.getAttribute('data-b64') !== null && (a = xt(a)),
      Promise.resolve(new Response(a, i))
    );
  }
  return window.fetch(e, t);
}
function Ut(e, t, n) {
  if (z.size > 0) {
    const r = xe(e, n),
      a = z.get(r);
    if (a) {
      if (
        performance.now() < a.ttl &&
        ['default', 'force-cache', 'only-if-cached', void 0].includes(n?.cache)
      )
        return new Response(a.body, a.init);
      z.delete(r);
    }
  }
  return window.fetch(t, n);
}
function xe(e, t) {
  let r = `script[data-sveltekit-fetched][data-url=${JSON.stringify(e instanceof Request ? e.url : e)}]`;
  if (t?.headers || t?.body) {
    const a = [];
    (t.headers && a.push([...new Headers(t.headers)].join(',')),
      t.body &&
        (typeof t.body == 'string' || ArrayBuffer.isView(t.body)) &&
        a.push(t.body),
      (r += `[data-hash="${Rt(...a)}"]`));
  }
  return r;
}
const Tt = /^(\[)?(\.\.\.)?(\w+)(?:=(\w+))?(\])?$/;
function Pt(e) {
  const t = [];
  return {
    pattern:
      e === '/'
        ? /^\/$/
        : new RegExp(
            `^${It(e)
              .map((r) => {
                const a = /^\[\.\.\.(\w+)(?:=(\w+))?\]$/.exec(r);
                if (a)
                  return (
                    t.push({
                      name: a[1],
                      matcher: a[2],
                      optional: !1,
                      rest: !0,
                      chained: !0,
                    }),
                    '(?:/([^]*))?'
                  );
                const i = /^\[\[(\w+)(?:=(\w+))?\]\]$/.exec(r);
                if (i)
                  return (
                    t.push({
                      name: i[1],
                      matcher: i[2],
                      optional: !0,
                      rest: !1,
                      chained: !0,
                    }),
                    '(?:/([^/]+))?'
                  );
                if (!r) return;
                const o = r.split(/\[(.+?)\](?!\])/);
                return (
                  '/' +
                  o
                    .map((c, l) => {
                      if (l % 2) {
                        if (c.startsWith('x+'))
                          return ge(
                            String.fromCharCode(parseInt(c.slice(2), 16)),
                          );
                        if (c.startsWith('u+'))
                          return ge(
                            String.fromCharCode(
                              ...c
                                .slice(2)
                                .split('-')
                                .map((w) => parseInt(w, 16)),
                            ),
                          );
                        const d = Tt.exec(c),
                          [, h, f, u, p] = d;
                        return (
                          t.push({
                            name: u,
                            matcher: p,
                            optional: !!h,
                            rest: !!f,
                            chained: f ? l === 1 && o[0] === '' : !1,
                          }),
                          f ? '([^]*?)' : h ? '([^/]*)?' : '([^/]+?)'
                        );
                      }
                      return ge(c);
                    })
                    .join('')
                );
              })
              .join('')}/?$`,
          ),
    params: t,
  };
}
function Ot(e) {
  return e !== '' && !/^\([^)]+\)$/.test(e);
}
function It(e) {
  return e.slice(1).split('/').filter(Ot);
}
function $t(e, t, n) {
  const r = {},
    a = e.slice(1),
    i = a.filter((s) => s !== void 0);
  let o = 0;
  for (let s = 0; s < t.length; s += 1) {
    const c = t[s];
    let l = a[s - o];
    if (
      (c.chained &&
        c.rest &&
        o &&
        ((l = a
          .slice(s - o, s + 1)
          .filter((d) => d)
          .join('/')),
        (o = 0)),
      l === void 0)
    ) {
      c.rest && (r[c.name] = '');
      continue;
    }
    if (!c.matcher || n[c.matcher](l)) {
      r[c.name] = l;
      const d = t[s + 1],
        h = a[s + 1];
      (d && !d.rest && d.optional && h && c.chained && (o = 0),
        !d && !h && Object.keys(r).length === i.length && (o = 0));
      continue;
    }
    if (c.optional && c.chained) {
      o++;
      continue;
    }
    return;
  }
  if (!o) return r;
}
function ge(e) {
  return e
    .normalize()
    .replace(/[[\]]/g, '\\$&')
    .replace(/%/g, '%25')
    .replace(/\//g, '%2[Ff]')
    .replace(/\?/g, '%3[Ff]')
    .replace(/#/g, '%23')
    .replace(/[.*+?^${}()|\\]/g, '\\$&');
}
function Ct({ nodes: e, server_loads: t, dictionary: n, matchers: r }) {
  const a = new Set(t);
  return Object.entries(n).map(([s, [c, l, d]]) => {
    const { pattern: h, params: f } = Pt(s),
      u = {
        id: s,
        exec: (p) => {
          const w = h.exec(p);
          if (w) return $t(w, f, r);
        },
        errors: [1, ...(d || [])].map((p) => e[p]),
        layouts: [0, ...(l || [])].map(o),
        leaf: i(c),
      };
    return (
      (u.errors.length = u.layouts.length =
        Math.max(u.errors.length, u.layouts.length)),
      u
    );
  });
  function i(s) {
    const c = s < 0;
    return (c && (s = ~s), [c, e[s]]);
  }
  function o(s) {
    return s === void 0 ? s : [a.has(s), e[s]];
  }
}
function We(e, t = JSON.parse) {
  try {
    return t(sessionStorage[e]);
  } catch {}
}
function Ve(e, t, n = JSON.stringify) {
  const r = n(t);
  try {
    sessionStorage[e] = r;
  } catch {}
}
const L = globalThis.__sveltekit_twuau4?.base ?? '',
  Nt = globalThis.__sveltekit_twuau4?.assets ?? L ?? '',
  jt = '1763420342018',
  Ye = 'sveltekit:snapshot',
  Je = 'sveltekit:scroll',
  Xe = 'sveltekit:states',
  qt = 'sveltekit:pageurl',
  B = 'sveltekit:history',
  H = 'sveltekit:navigation',
  N = { tap: 1, hover: 2, viewport: 3, eager: 4, off: -1, false: -1 },
  Le = location.origin;
function Qe(e) {
  if (e instanceof URL) return e;
  let t = document.baseURI;
  if (!t) {
    const n = document.getElementsByTagName('base');
    t = n.length ? n[0].href : document.URL;
  }
  return new URL(e, t);
}
function le() {
  return { x: pageXOffset, y: pageYOffset };
}
function M(e, t) {
  return e.getAttribute(`data-sveltekit-${t}`);
}
const Me = { ...N, '': N.hover };
function Ze(e) {
  let t = e.assignedSlot ?? e.parentNode;
  return (t?.nodeType === 11 && (t = t.host), t);
}
function et(e, t) {
  for (; e && e !== t; ) {
    if (e.nodeName.toUpperCase() === 'A' && e.hasAttribute('href')) return e;
    e = Ze(e);
  }
}
function we(e, t, n) {
  let r;
  try {
    if (
      ((r = new URL(
        e instanceof SVGAElement ? e.href.baseVal : e.href,
        document.baseURI,
      )),
      n && r.hash.match(/^#[^/]/))
    ) {
      const s = location.hash.split('#')[1] || '/';
      r.hash = `#${s}${r.hash}`;
    }
  } catch {}
  const a = e instanceof SVGAElement ? e.target.baseVal : e.target,
    i =
      !r ||
      !!a ||
      ue(r, t, n) ||
      (e.getAttribute('rel') || '').split(/\s+/).includes('external'),
    o = r?.origin === Le && e.hasAttribute('download');
  return { url: r, external: i, target: a, download: o };
}
function te(e) {
  let t = null,
    n = null,
    r = null,
    a = null,
    i = null,
    o = null,
    s = e;
  for (; s && s !== document.documentElement; )
    (r === null && (r = M(s, 'preload-code')),
      a === null && (a = M(s, 'preload-data')),
      t === null && (t = M(s, 'keepfocus')),
      n === null && (n = M(s, 'noscroll')),
      i === null && (i = M(s, 'reload')),
      o === null && (o = M(s, 'replacestate')),
      (s = Ze(s)));
  function c(l) {
    switch (l) {
      case '':
      case 'true':
        return !0;
      case 'off':
      case 'false':
        return !1;
      default:
        return;
    }
  }
  return {
    preload_code: Me[r ?? 'off'],
    preload_data: Me[a ?? 'off'],
    keepfocus: c(t),
    noscroll: c(n),
    reload: c(i),
    replace_state: c(o),
  };
}
function Be(e) {
  const t = ke(e);
  let n = !0;
  function r() {
    ((n = !0), t.update((o) => o));
  }
  function a(o) {
    ((n = !1), t.set(o));
  }
  function i(o) {
    let s;
    return t.subscribe((c) => {
      (s === void 0 || (n && c !== s)) && o((s = c));
    });
  }
  return { notify: r, set: a, subscribe: i };
}
const tt = { v: () => {} };
function Dt() {
  const { set: e, subscribe: t } = ke(!1);
  let n;
  async function r() {
    clearTimeout(n);
    try {
      const a = await fetch(`${Nt}/_app/version.json`, {
        headers: { pragma: 'no-cache', 'cache-control': 'no-cache' },
      });
      if (!a.ok) return !1;
      const o = (await a.json()).version !== jt;
      return (o && (e(!0), tt.v(), clearTimeout(n)), o);
    } catch {
      return !1;
    }
  }
  return { subscribe: t, check: r };
}
function ue(e, t, n) {
  return e.origin !== Le || !e.pathname.startsWith(t)
    ? !0
    : n
      ? !(
          e.pathname === t + '/' ||
          e.pathname === t + '/index.html' ||
          (e.protocol === 'file:' &&
            e.pathname.replace(/\/[^/]+\.html?$/, '') === t)
        )
      : !1;
}
function pn(e) {}
const nt = new Set([
  'load',
  'prerender',
  'csr',
  'ssr',
  'trailingSlash',
  'config',
]);
[...nt];
const Vt = new Set([...nt]);
[...Vt];
function Mt(e) {
  return e.filter((t) => t != null);
}
function Ae(e) {
  return e instanceof Se || e instanceof Re ? e.status : 500;
}
function Bt(e) {
  return e instanceof Re ? e.text : 'Internal Error';
}
let k, W, _e;
const Kt =
  qe.toString().includes('$$') || /function \w+\(\) \{\}/.test(qe.toString());
Kt
  ? ((k = {
      data: {},
      form: null,
      error: null,
      params: {},
      route: { id: null },
      state: {},
      status: -1,
      url: new URL('https://example.com'),
    }),
    (W = { current: null }),
    (_e = { current: !1 }))
  : ((k = new (class {
      #e = U({});
      get data() {
        return T(this.#e);
      }
      set data(t) {
        P(this.#e, t);
      }
      #t = U(null);
      get form() {
        return T(this.#t);
      }
      set form(t) {
        P(this.#t, t);
      }
      #n = U(null);
      get error() {
        return T(this.#n);
      }
      set error(t) {
        P(this.#n, t);
      }
      #r = U({});
      get params() {
        return T(this.#r);
      }
      set params(t) {
        P(this.#r, t);
      }
      #a = U({ id: null });
      get route() {
        return T(this.#a);
      }
      set route(t) {
        P(this.#a, t);
      }
      #o = U({});
      get state() {
        return T(this.#o);
      }
      set state(t) {
        P(this.#o, t);
      }
      #s = U(-1);
      get status() {
        return T(this.#s);
      }
      set status(t) {
        P(this.#s, t);
      }
      #i = U(new URL('https://example.com'));
      get url() {
        return T(this.#i);
      }
      set url(t) {
        P(this.#i, t);
      }
    })()),
    (W = new (class {
      #e = U(null);
      get current() {
        return T(this.#e);
      }
      set current(t) {
        P(this.#e, t);
      }
    })()),
    (_e = new (class {
      #e = U(!1);
      get current() {
        return T(this.#e);
      }
      set current(t) {
        P(this.#e, t);
      }
    })()),
    (tt.v = () => (_e.current = !0)));
function rt(e) {
  Object.assign(k, e);
}
const Ke = {
    spanContext() {
      return Ft;
    },
    setAttribute() {
      return this;
    },
    setAttributes() {
      return this;
    },
    addEvent() {
      return this;
    },
    setStatus() {
      return this;
    },
    updateName() {
      return this;
    },
    end() {
      return this;
    },
    isRecording() {
      return !1;
    },
    recordException() {
      return this;
    },
    addLink() {
      return this;
    },
    addLinks() {
      return this;
    },
  },
  Ft = { traceId: '', spanId: '', traceFlags: 0 },
  { onMount: Gt } = yt,
  zt = new Set(['icon', 'shortcut icon', 'apple-touch-icon']),
  q = We(Je) ?? {},
  Y = We(Ye) ?? {},
  C = { url: Be({}), page: Be({}), navigating: ke(null), updated: Dt() };
function Ue(e) {
  q[e] = le();
}
function Ht(e, t) {
  let n = e + 1;
  for (; q[n]; ) (delete q[n], (n += 1));
  for (n = t + 1; Y[n]; ) (delete Y[n], (n += 1));
}
function J(e, t = !1) {
  return (
    t ? location.replace(e.href) : (location.href = e.href),
    new Promise(() => {})
  );
}
async function at() {
  if ('serviceWorker' in navigator) {
    const e = await navigator.serviceWorker.getRegistration(L || '/');
    e && (await e.update());
  }
}
function Fe() {}
let Te, ve, ne, O, ye, v;
const re = [],
  ae = [];
let R = null;
function ot() {
  (R?.fork?.then((e) => e?.discard()), (R = null));
}
const Z = new Map(),
  st = new Set(),
  Wt = new Set(),
  K = new Set();
let m = { branch: [], error: null, url: null },
  it = !1,
  oe = !1,
  Ge = !0,
  X = !1,
  G = !1,
  ct = !1,
  Pe = !1,
  Oe,
  y,
  x,
  j;
const se = new Set(),
  ze = new Map();
async function wn(e, t, n) {
  (globalThis.__sveltekit_twuau4?.data && globalThis.__sveltekit_twuau4.data,
    document.URL !== location.href && (location.href = location.href),
    (v = e),
    await e.hooks.init?.(),
    (Te = Ct(e)),
    (O = document.documentElement),
    (ye = t),
    (ve = e.nodes[0]),
    (ne = e.nodes[1]),
    ve(),
    ne(),
    (y = history.state?.[B]),
    (x = history.state?.[H]),
    y ||
      ((y = x = Date.now()),
      history.replaceState({ ...history.state, [B]: y, [H]: x }, '')));
  const r = q[y];
  function a() {
    r && ((history.scrollRestoration = 'manual'), scrollTo(r.x, r.y));
  }
  (n
    ? (a(), await ln(ye, n))
    : (await F({
        type: 'enter',
        url: Qe(v.hash ? dn(new URL(location.href)) : location.href),
        replace_state: !0,
      }),
      a()),
    cn());
}
function Yt() {
  ((re.length = 0), (Pe = !1));
}
function lt(e) {
  ae.some((t) => t?.snapshot) && (Y[e] = ae.map((t) => t?.snapshot?.capture()));
}
function ut(e) {
  Y[e]?.forEach((t, n) => {
    ae[n]?.snapshot?.restore(t);
  });
}
function He() {
  (Ue(y), Ve(Je, q), lt(x), Ve(Ye, Y));
}
async function Jt(e, t, n, r) {
  let a;
  (t.invalidateAll && ot(),
    await F({
      type: 'goto',
      url: Qe(e),
      keepfocus: t.keepFocus,
      noscroll: t.noScroll,
      replace_state: t.replaceState,
      state: t.state,
      redirect_count: n,
      nav_token: r,
      accept: () => {
        (t.invalidateAll && ((Pe = !0), (a = [...ze.keys()])),
          t.invalidate && t.invalidate.forEach(sn));
      },
    }),
    t.invalidateAll &&
      ee()
        .then(ee)
        .then(() => {
          ze.forEach(({ resource: i }, o) => {
            a?.includes(o) && i.refresh?.();
          });
        }));
}
async function Xt(e) {
  if (e.id !== R?.id) {
    const t = {};
    if (
      (se.add(t),
      (R = {
        id: e.id,
        token: t,
        promise: ht({ ...e, preload: t }).then(
          (n) => (
            se.delete(t),
            n.type === 'loaded' && n.state.error && ot(),
            n
          ),
        ),
        fork: null,
      }),
      De)
    ) {
      const n = R;
      n.fork = n.promise.then((r) => {
        if (n === R && r.type === 'loaded')
          try {
            return De(() => {
              (Oe.$set(r.props), rt(r.props.page));
            });
          } catch {}
        return null;
      });
    }
  }
  return R.promise;
}
async function me(e) {
  const t = (await fe(e, !1))?.route;
  t && (await Promise.all([...t.layouts, t.leaf].map((n) => n?.[1]())));
}
async function ft(e, t, n) {
  m = e.state;
  const r = document.querySelector('style[data-sveltekit]');
  if (
    (r && r.remove(),
    Object.assign(k, e.props.page),
    (Oe = new v.root({
      target: t,
      props: { ...e.props, stores: C, components: ae },
      hydrate: n,
      sync: !1,
    })),
    await Promise.resolve(),
    ut(x),
    n)
  ) {
    const a = {
      from: null,
      to: {
        params: m.params,
        route: { id: m.route?.id ?? null },
        url: new URL(location.href),
      },
      willUnload: !1,
      type: 'enter',
      complete: Promise.resolve(),
    };
    K.forEach((i) => i(a));
  }
  oe = !0;
}
function ie({
  url: e,
  params: t,
  branch: n,
  status: r,
  error: a,
  route: i,
  form: o,
}) {
  let s = 'never';
  if (L && (e.pathname === L || e.pathname === L + '/')) s = 'always';
  else for (const u of n) u?.slash !== void 0 && (s = u.slash);
  ((e.pathname = bt(e.pathname, s)), (e.search = e.search));
  const c = {
    type: 'loaded',
    state: { url: e, params: t, branch: n, error: a, route: i },
    props: { constructors: Mt(n).map((u) => u.node.component), page: je(k) },
  };
  o !== void 0 && (c.props.form = o);
  let l = {},
    d = !k,
    h = 0;
  for (let u = 0; u < Math.max(n.length, m.branch.length); u += 1) {
    const p = n[u],
      w = m.branch[u];
    (p?.data !== w?.data && (d = !0),
      p &&
        ((l = { ...l, ...p.data }), d && (c.props[`data_${h}`] = l), (h += 1)));
  }
  return (
    (!m.url ||
      e.href !== m.url.href ||
      m.error !== a ||
      (o !== void 0 && o !== k.form) ||
      d) &&
      (c.props.page = {
        error: a,
        params: t,
        route: { id: i?.id ?? null },
        state: {},
        status: r,
        url: new URL(e),
        form: o ?? null,
        data: d ? l : k.data,
      }),
    c
  );
}
async function Ie({
  loader: e,
  parent: t,
  url: n,
  params: r,
  route: a,
  server_data_node: i,
}) {
  let o = null,
    s = !0;
  const c = {
      dependencies: new Set(),
      params: new Set(),
      parent: !1,
      route: !1,
      url: !1,
      search_params: new Set(),
    },
    l = await e();
  if (l.universal?.load) {
    let d = function (...f) {
      for (const u of f) {
        const { href: p } = new URL(u, n);
        c.dependencies.add(p);
      }
    };
    const h = {
      tracing: { enabled: !1, root: Ke, current: Ke },
      route: new Proxy(a, { get: (f, u) => (s && (c.route = !0), f[u]) }),
      params: new Proxy(r, { get: (f, u) => (s && c.params.add(u), f[u]) }),
      data: i?.data ?? null,
      url: Et(
        n,
        () => {
          s && (c.url = !0);
        },
        (f) => {
          s && c.search_params.add(f);
        },
        v.hash,
      ),
      async fetch(f, u) {
        f instanceof Request &&
          (u = {
            body:
              f.method === 'GET' || f.method === 'HEAD'
                ? void 0
                : await f.blob(),
            cache: f.cache,
            credentials: f.credentials,
            headers: [...f.headers].length > 0 ? f?.headers : void 0,
            integrity: f.integrity,
            keepalive: f.keepalive,
            method: f.method,
            mode: f.mode,
            redirect: f.redirect,
            referrer: f.referrer,
            referrerPolicy: f.referrerPolicy,
            signal: f.signal,
            ...u,
          });
        const { resolved: p, promise: w } = dt(f, u, n);
        return (s && d(p.href), w);
      },
      setHeaders: () => {},
      depends: d,
      parent() {
        return (s && (c.parent = !0), t());
      },
      untrack(f) {
        s = !1;
        try {
          return f();
        } finally {
          s = !0;
        }
      },
    };
    o = (await l.universal.load.call(null, h)) ?? null;
  }
  return {
    node: l,
    loader: e,
    server: i,
    universal: l.universal?.load ? { type: 'data', data: o, uses: c } : null,
    data: o ?? i?.data ?? null,
    slash: l.universal?.trailingSlash ?? i?.slash,
  };
}
function dt(e, t, n) {
  let r = e instanceof Request ? e.url : e;
  const a = new URL(r, n);
  a.origin === n.origin && (r = a.href.slice(n.origin.length));
  const i = oe ? Ut(r, a.href, t) : At(r, t);
  return { resolved: a, promise: i };
}
function Qt(e, t, n, r, a, i) {
  if (Pe) return !0;
  if (!a) return !1;
  if ((a.parent && e) || (a.route && t) || (a.url && n)) return !0;
  for (const o of a.search_params) if (r.has(o)) return !0;
  for (const o of a.params) if (i[o] !== m.params[o]) return !0;
  for (const o of a.dependencies) if (re.some((s) => s(new URL(o)))) return !0;
  return !1;
}
function $e(e, t) {
  return e?.type === 'data' ? e : e?.type === 'skip' ? (t ?? null) : null;
}
function Zt(e, t) {
  if (!e) return new Set(t.searchParams.keys());
  const n = new Set([...e.searchParams.keys(), ...t.searchParams.keys()]);
  for (const r of n) {
    const a = e.searchParams.getAll(r),
      i = t.searchParams.getAll(r);
    a.every((o) => i.includes(o)) &&
      i.every((o) => a.includes(o)) &&
      n.delete(r);
  }
  return n;
}
function en({ error: e, url: t, route: n, params: r }) {
  return {
    type: 'loaded',
    state: { error: e, url: t, route: n, params: r, branch: [] },
    props: { page: je(k), constructors: [] },
  };
}
async function ht({
  id: e,
  invalidating: t,
  url: n,
  params: r,
  route: a,
  preload: i,
}) {
  if (R?.id === e) return (se.delete(R.token), R.promise);
  const { errors: o, layouts: s, leaf: c } = a,
    l = [...s, c];
  (o.forEach((_) => _?.().catch(() => {})),
    l.forEach((_) => _?.[1]().catch(() => {})));
  const d = m.url ? e !== ce(m.url) : !1,
    h = m.route ? a.id !== m.route.id : !1,
    f = Zt(m.url, n);
  let u = !1;
  const p = l.map(async (_, g) => {
    if (!_) return;
    const S = m.branch[g];
    return _[1] === S?.loader && !Qt(u, h, d, f, S.universal?.uses, r)
      ? S
      : ((u = !0),
        Ie({
          loader: _[1],
          url: n,
          params: r,
          route: a,
          parent: async () => {
            const I = {};
            for (let A = 0; A < g; A += 1) Object.assign(I, (await p[A])?.data);
            return I;
          },
          server_data_node: $e(
            _[0] ? { type: 'skip' } : null,
            _[0] ? S?.server : void 0,
          ),
        }));
  });
  for (const _ of p) _.catch(() => {});
  const w = [];
  for (let _ = 0; _ < l.length; _ += 1)
    if (l[_])
      try {
        w.push(await p[_]);
      } catch (g) {
        if (g instanceof Ee) return { type: 'redirect', location: g.location };
        if (se.has(i))
          return en({
            error: await Q(g, { params: r, url: n, route: { id: a.id } }),
            url: n,
            params: r,
            route: a,
          });
        let S = Ae(g),
          E;
        if (g instanceof Se) E = g.body;
        else {
          if (await C.updated.check()) return (await at(), await J(n));
          E = await Q(g, { params: r, url: n, route: { id: a.id } });
        }
        const I = await tn(_, w, o);
        return I
          ? ie({
              url: n,
              params: r,
              branch: w.slice(0, I.idx).concat(I.node),
              status: S,
              error: E,
              route: a,
            })
          : await gt(n, { id: a.id }, E, S);
      }
    else w.push(void 0);
  return ie({
    url: n,
    params: r,
    branch: w,
    status: 200,
    error: null,
    route: a,
    form: t ? void 0 : null,
  });
}
async function tn(e, t, n) {
  for (; e--; )
    if (n[e]) {
      let r = e;
      for (; !t[r]; ) r -= 1;
      try {
        return {
          idx: r + 1,
          node: {
            node: await n[e](),
            loader: n[e],
            data: {},
            server: null,
            universal: null,
          },
        };
      } catch {
        continue;
      }
    }
}
async function Ce({ status: e, error: t, url: n, route: r }) {
  const a = {};
  let i = null;
  try {
    const o = await Ie({
        loader: ve,
        url: n,
        params: a,
        route: r,
        parent: () => Promise.resolve({}),
        server_data_node: $e(i),
      }),
      s = {
        node: await ne(),
        loader: ne,
        universal: null,
        server: null,
        data: null,
      };
    return ie({
      url: n,
      params: a,
      branch: [o, s],
      status: e,
      error: t,
      route: null,
    });
  } catch (o) {
    if (o instanceof Ee) return Jt(new URL(o.location, location.href), {}, 0);
    throw o;
  }
}
async function nn(e) {
  const t = e.href;
  if (Z.has(t)) return Z.get(t);
  let n;
  try {
    const r = (async () => {
      let a =
        (await v.hooks.reroute({
          url: new URL(e),
          fetch: async (i, o) => dt(i, o, e).promise,
        })) ?? e;
      if (typeof a == 'string') {
        const i = new URL(e);
        (v.hash ? (i.hash = a) : (i.pathname = a), (a = i));
      }
      return a;
    })();
    (Z.set(t, r), (n = await r));
  } catch {
    Z.delete(t);
    return;
  }
  return n;
}
async function fe(e, t) {
  if (e && !ue(e, L, v.hash)) {
    const n = await nn(e);
    if (!n) return;
    const r = rn(n);
    for (const a of Te) {
      const i = a.exec(r);
      if (i)
        return { id: ce(e), invalidating: t, route: a, params: St(i), url: e };
    }
  }
}
function rn(e) {
  return (
    kt(
      v.hash
        ? e.hash.replace(/^#/, '').replace(/[?#].+/, '')
        : e.pathname.slice(L.length),
    ) || '/'
  );
}
function ce(e) {
  return (v.hash ? e.hash.replace(/^#/, '') : e.pathname) + e.search;
}
function pt({ url: e, type: t, intent: n, delta: r, event: a }) {
  let i = !1;
  const o = Ne(m, n, e, t);
  (r !== void 0 && (o.navigation.delta = r),
    a !== void 0 && (o.navigation.event = a));
  const s = {
    ...o.navigation,
    cancel: () => {
      ((i = !0), o.reject(new Error('navigation cancelled')));
    },
  };
  return (X || st.forEach((c) => c(s)), i ? null : o);
}
async function F({
  type: e,
  url: t,
  popped: n,
  keepfocus: r,
  noscroll: a,
  replace_state: i,
  state: o = {},
  redirect_count: s = 0,
  nav_token: c = {},
  accept: l = Fe,
  block: d = Fe,
  event: h,
}) {
  const f = j;
  j = c;
  const u = await fe(t, !1),
    p =
      e === 'enter'
        ? Ne(m, u, t, e)
        : pt({ url: t, type: e, delta: n?.delta, intent: u, event: h });
  if (!p) {
    (d(), j === c && (j = f));
    return;
  }
  const w = y,
    _ = x;
  (l(),
    (X = !0),
    oe &&
      p.navigation.type !== 'enter' &&
      C.navigating.set((W.current = p.navigation)));
  let g = u && (await ht(u));
  if (!g) {
    if (ue(t, L, v.hash)) return await J(t, i);
    g = await gt(
      t,
      { id: null },
      await Q(new Re(404, 'Not Found', `Not found: ${t.pathname}`), {
        url: t,
        params: {},
        route: { id: null },
      }),
      404,
      i,
    );
  }
  if (((t = u?.url || t), j !== c))
    return (p.reject(new Error('navigation aborted')), !1);
  if (g.type === 'redirect') {
    if (s < 20) {
      (await F({
        type: e,
        url: new URL(g.location, t),
        popped: n,
        keepfocus: r,
        noscroll: a,
        replace_state: i,
        state: o,
        redirect_count: s + 1,
        nav_token: c,
      }),
        p.fulfil(void 0));
      return;
    }
    g = await Ce({
      status: 500,
      error: await Q(new Error('Redirect loop'), {
        url: t,
        params: {},
        route: { id: null },
      }),
      url: t,
      route: { id: null },
    });
  } else
    g.props.page.status >= 400 &&
      (await C.updated.check()) &&
      (await at(), await J(t, i));
  if (
    (Yt(),
    Ue(w),
    lt(_),
    g.props.page.url.pathname !== t.pathname &&
      (t.pathname = g.props.page.url.pathname),
    (o = n ? n.state : o),
    !n)
  ) {
    const b = i ? 0 : 1,
      D = { [B]: (y += b), [H]: (x += b), [Xe]: o };
    ((i ? history.replaceState : history.pushState).call(history, D, '', t),
      i || Ht(y, x));
  }
  const S = R?.fork;
  ((R = null), (g.props.page.state = o));
  let E;
  if (oe) {
    const b = (
      await Promise.all(Array.from(Wt, ($) => $(p.navigation)))
    ).filter(($) => typeof $ == 'function');
    if (b.length > 0) {
      let $ = function () {
        b.forEach((de) => {
          K.delete(de);
        });
      };
      (b.push($),
        b.forEach((de) => {
          K.add(de);
        }));
    }
    ((m = g.state), g.props.page && (g.props.page.url = t));
    const D = S && (await S);
    (D ? (E = D.commit()) : (Oe.$set(g.props), rt(g.props.page), (E = vt?.())),
      (ct = !0));
  } else await ft(g, ye, !1);
  const { activeElement: I } = document;
  (await E, await ee(), await ee());
  let A = n ? n.scroll : a ? le() : null;
  if (Ge) {
    const b = t.hash && document.getElementById(_t(t));
    if (A) scrollTo(A.x, A.y);
    else if (b) {
      b.scrollIntoView();
      const { top: D, left: $ } = b.getBoundingClientRect();
      A = { x: pageXOffset + $, y: pageYOffset + D };
    } else scrollTo(0, 0);
  }
  const mt =
    document.activeElement !== I && document.activeElement !== document.body;
  (!r && !mt && fn(t, A),
    (Ge = !0),
    g.props.page && Object.assign(k, g.props.page),
    (X = !1),
    e === 'popstate' && ut(x),
    p.fulfil(void 0),
    K.forEach((b) => b(p.navigation)),
    C.navigating.set((W.current = null)));
}
async function gt(e, t, n, r, a) {
  return e.origin === Le && e.pathname === location.pathname && !it
    ? await Ce({ status: r, error: n, url: e, route: t })
    : await J(e, a);
}
function an() {
  let e, t, n;
  O.addEventListener('mousemove', (s) => {
    const c = s.target;
    (clearTimeout(e),
      (e = setTimeout(() => {
        i(c, N.hover);
      }, 20)));
  });
  function r(s) {
    s.defaultPrevented || i(s.composedPath()[0], N.tap);
  }
  (O.addEventListener('mousedown', r),
    O.addEventListener('touchstart', r, { passive: !0 }));
  const a = new IntersectionObserver(
    (s) => {
      for (const c of s)
        c.isIntersecting && (me(new URL(c.target.href)), a.unobserve(c.target));
    },
    { threshold: 0 },
  );
  async function i(s, c) {
    const l = et(s, O),
      d = l === t && c >= n;
    if (!l || d) return;
    const { url: h, external: f, download: u } = we(l, L, v.hash);
    if (f || u) return;
    const p = te(l),
      w = h && ce(m.url) === ce(h);
    if (!(p.reload || w))
      if (c <= p.preload_data) {
        ((t = l), (n = N.tap));
        const _ = await fe(h, !1);
        if (!_) return;
        Xt(_);
      } else c <= p.preload_code && ((t = l), (n = c), me(h));
  }
  function o() {
    a.disconnect();
    for (const s of O.querySelectorAll('a')) {
      const { url: c, external: l, download: d } = we(s, L, v.hash);
      if (l || d) continue;
      const h = te(s);
      h.reload ||
        (h.preload_code === N.viewport && a.observe(s),
        h.preload_code === N.eager && me(c));
    }
  }
  (K.add(o), o());
}
function Q(e, t) {
  if (e instanceof Se) return e.body;
  const n = Ae(e),
    r = Bt(e);
  return (
    v.hooks.handleError({ error: e, event: t, status: n, message: r }) ?? {
      message: r,
    }
  );
}
function on(e, t) {
  Gt(
    () => (
      e.add(t),
      () => {
        e.delete(t);
      }
    ),
  );
}
function vn(e) {
  on(K, e);
}
function sn(e) {
  if (typeof e == 'function') re.push(e);
  else {
    const { href: t } = new URL(e, location.href);
    re.push((n) => n.href === t);
  }
}
function cn() {
  ((history.scrollRestoration = 'manual'),
    addEventListener('beforeunload', (t) => {
      let n = !1;
      if ((He(), !X)) {
        const r = Ne(m, void 0, null, 'leave'),
          a = {
            ...r.navigation,
            cancel: () => {
              ((n = !0), r.reject(new Error('navigation cancelled')));
            },
          };
        st.forEach((i) => i(a));
      }
      n
        ? (t.preventDefault(), (t.returnValue = ''))
        : (history.scrollRestoration = 'auto');
    }),
    addEventListener('visibilitychange', () => {
      document.visibilityState === 'hidden' && He();
    }),
    navigator.connection?.saveData || an(),
    O.addEventListener('click', async (t) => {
      if (
        t.button ||
        t.which !== 1 ||
        t.metaKey ||
        t.ctrlKey ||
        t.shiftKey ||
        t.altKey ||
        t.defaultPrevented
      )
        return;
      const n = et(t.composedPath()[0], O);
      if (!n) return;
      const { url: r, external: a, target: i, download: o } = we(n, L, v.hash);
      if (!r) return;
      if (i === '_parent' || i === '_top') {
        if (window.parent !== window) return;
      } else if (i && i !== '_self') return;
      const s = te(n);
      if (
        (!(n instanceof SVGAElement) &&
          r.protocol !== location.protocol &&
          !(r.protocol === 'https:' || r.protocol === 'http:')) ||
        o
      )
        return;
      const [l, d] = (v.hash ? r.hash.replace(/^#/, '') : r.href).split('#'),
        h = l === pe(location);
      if (a || (s.reload && (!h || !d))) {
        pt({ url: r, type: 'link', event: t }) ? (X = !0) : t.preventDefault();
        return;
      }
      if (d !== void 0 && h) {
        const [, f] = m.url.href.split('#');
        if (f === d) {
          if (
            (t.preventDefault(),
            d === '' ||
              (d === 'top' && n.ownerDocument.getElementById('top') === null))
          )
            scrollTo({ top: 0 });
          else {
            const u = n.ownerDocument.getElementById(decodeURIComponent(d));
            u && (u.scrollIntoView(), u.focus());
          }
          return;
        }
        if (((G = !0), Ue(y), e(r), !s.replace_state)) return;
        G = !1;
      }
      (t.preventDefault(),
        await new Promise((f) => {
          (requestAnimationFrame(() => {
            setTimeout(f, 0);
          }),
            setTimeout(f, 100));
        }),
        await F({
          type: 'link',
          url: r,
          keepfocus: s.keepfocus,
          noscroll: s.noscroll,
          replace_state: s.replace_state ?? r.href === location.href,
          event: t,
        }));
    }),
    O.addEventListener('submit', (t) => {
      if (t.defaultPrevented) return;
      const n = HTMLFormElement.prototype.cloneNode.call(t.target),
        r = t.submitter;
      if (
        (r?.formTarget || n.target) === '_blank' ||
        (r?.formMethod || n.method) !== 'get'
      )
        return;
      const o = new URL(
        (r?.hasAttribute('formaction') && r?.formAction) || n.action,
      );
      if (ue(o, L, !1)) return;
      const s = t.target,
        c = te(s);
      if (c.reload) return;
      (t.preventDefault(), t.stopPropagation());
      const l = new FormData(s, r);
      ((o.search = new URLSearchParams(l).toString()),
        F({
          type: 'form',
          url: o,
          keepfocus: c.keepfocus,
          noscroll: c.noscroll,
          replace_state: c.replace_state ?? o.href === location.href,
          event: t,
        }));
    }),
    addEventListener('popstate', async (t) => {
      if (!be) {
        if (t.state?.[B]) {
          const n = t.state[B];
          if (((j = {}), n === y)) return;
          const r = q[n],
            a = t.state[Xe] ?? {},
            i = new URL(t.state[qt] ?? location.href),
            o = t.state[H],
            s = m.url ? pe(location) === pe(m.url) : !1;
          if (o === x && (ct || s)) {
            (a !== k.state && (k.state = a),
              e(i),
              (q[y] = le()),
              r && scrollTo(r.x, r.y),
              (y = n));
            return;
          }
          const l = n - y;
          await F({
            type: 'popstate',
            url: i,
            popped: { state: a, scroll: r, delta: l },
            accept: () => {
              ((y = n), (x = o));
            },
            block: () => {
              history.go(-l);
            },
            nav_token: j,
            event: t,
          });
        } else if (!G) {
          const n = new URL(location.href);
          (e(n), v.hash && location.reload());
        }
      }
    }),
    addEventListener('hashchange', () => {
      G &&
        ((G = !1),
        history.replaceState(
          { ...history.state, [B]: ++y, [H]: x },
          '',
          location.href,
        ));
    }));
  for (const t of document.querySelectorAll('link'))
    zt.has(t.rel) && (t.href = t.href);
  addEventListener('pageshow', (t) => {
    t.persisted && C.navigating.set((W.current = null));
  });
  function e(t) {
    ((m.url = k.url = t), C.page.set(je(k)), C.page.notify());
  }
}
async function ln(
  e,
  {
    status: t = 200,
    error: n,
    node_ids: r,
    params: a,
    route: i,
    server_route: o,
    data: s,
    form: c,
  },
) {
  it = !0;
  const l = new URL(location.href);
  let d;
  (({ params: a = {}, route: i = { id: null } } = (await fe(l, !1)) || {}),
    (d = Te.find(({ id: u }) => u === i.id)));
  let h,
    f = !0;
  try {
    const u = r.map(async (w, _) => {
        const g = s[_];
        return (
          g?.uses && (g.uses = un(g.uses)),
          Ie({
            loader: v.nodes[w],
            url: l,
            params: a,
            route: i,
            parent: async () => {
              const S = {};
              for (let E = 0; E < _; E += 1)
                Object.assign(S, (await u[E]).data);
              return S;
            },
            server_data_node: $e(g),
          })
        );
      }),
      p = await Promise.all(u);
    if (d) {
      const w = d.layouts;
      for (let _ = 0; _ < w.length; _++) w[_] || p.splice(_, 0, void 0);
    }
    h = ie({
      url: l,
      params: a,
      branch: p,
      status: t,
      error: n,
      form: c,
      route: d ?? null,
    });
  } catch (u) {
    if (u instanceof Ee) {
      await J(new URL(u.location, location.href));
      return;
    }
    ((h = await Ce({
      status: Ae(u),
      error: await Q(u, { url: l, params: a, route: i }),
      url: l,
      route: i,
    })),
      (e.textContent = ''),
      (f = !1));
  }
  (h.props.page && (h.props.page.state = {}), await ft(h, e, f));
}
function un(e) {
  return {
    dependencies: new Set(e?.dependencies ?? []),
    params: new Set(e?.params ?? []),
    parent: !!e?.parent,
    route: !!e?.route,
    url: !!e?.url,
    search_params: new Set(e?.search_params ?? []),
  };
}
let be = !1;
function fn(e, t = null) {
  const n = document.querySelector('[autofocus]');
  if (n) n.focus();
  else {
    const r = _t(e);
    if (r && document.getElementById(r)) {
      const { x: i, y: o } = t ?? le();
      setTimeout(() => {
        const s = history.state;
        ((be = !0),
          location.replace(`#${r}`),
          v.hash && location.replace(e.hash),
          history.replaceState(s, '', e.hash),
          scrollTo(i, o),
          (be = !1));
      });
    } else {
      const i = document.body,
        o = i.getAttribute('tabindex');
      ((i.tabIndex = -1),
        i.focus({ preventScroll: !0, focusVisible: !1 }),
        o !== null
          ? i.setAttribute('tabindex', o)
          : i.removeAttribute('tabindex'));
    }
    const a = getSelection();
    if (a && a.type !== 'None') {
      const i = [];
      for (let o = 0; o < a.rangeCount; o += 1) i.push(a.getRangeAt(o));
      setTimeout(() => {
        if (a.rangeCount === i.length) {
          for (let o = 0; o < a.rangeCount; o += 1) {
            const s = i[o],
              c = a.getRangeAt(o);
            if (
              s.commonAncestorContainer !== c.commonAncestorContainer ||
              s.startContainer !== c.startContainer ||
              s.endContainer !== c.endContainer ||
              s.startOffset !== c.startOffset ||
              s.endOffset !== c.endOffset
            )
              return;
          }
          a.removeAllRanges();
        }
      });
    }
  }
}
function Ne(e, t, n, r) {
  let a, i;
  const o = new Promise((c, l) => {
    ((a = c), (i = l));
  });
  return (
    o.catch(() => {}),
    {
      navigation: {
        from: {
          params: e.params,
          route: { id: e.route?.id ?? null },
          url: e.url,
        },
        to: n && {
          params: t?.params ?? null,
          route: { id: t?.route?.id ?? null },
          url: n,
        },
        willUnload: !t,
        type: r,
        complete: o,
      },
      fulfil: a,
      reject: i,
    }
  );
}
function je(e) {
  return {
    data: e.data,
    error: e.error,
    form: e.form,
    params: e.params,
    route: e.route,
    state: e.state,
    status: e.status,
    url: e.url,
  };
}
function dn(e) {
  const t = new URL(e);
  return ((t.hash = decodeURIComponent(e.hash)), t);
}
function _t(e) {
  let t;
  if (v.hash) {
    const [, , n] = e.hash.split('#', 3);
    t = n ?? '';
  } else t = e.hash.slice(1);
  return decodeURIComponent(t);
}
export { vn as a, wn as b, pn as l, k as p, C as s };
