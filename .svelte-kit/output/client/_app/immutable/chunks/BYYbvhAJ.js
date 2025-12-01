import {
  I as u,
  J as o,
  K as _,
  F as t,
  L as g,
  M as p,
  N as i,
  O as l,
  P as d,
  Q as m,
} from './C4tos-D-.js';
function E(n, r) {
  let s = null,
    f = t;
  var a;
  if (t) {
    s = m;
    for (
      var e = g(document.head);
      e !== null && (e.nodeType !== p || e.data !== n);

    )
      e = i(e);
    if (e === null) l(!1);
    else {
      var y = i(e);
      (e.remove(), d(y));
    }
  }
  t || (a = document.head.appendChild(u()));
  try {
    o(() => r(a), _);
  } finally {
    f && (l(!0), d(s));
  }
}
export { E as h };
