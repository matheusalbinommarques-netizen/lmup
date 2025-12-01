import { d as t } from './CUrLQr9X.js';
function p(r) {
  return String(r).padStart(2, '0');
}
function P(r = new Date()) {
  const a = r.getFullYear(),
    e = p(r.getMonth() + 1),
    o = p(r.getDate()),
    s = p(r.getHours()),
    n = p(r.getMinutes()),
    i = p(r.getSeconds());
  return `${a}${e}${o}-${s}${n}${i}`;
}
function I(r, a) {
  const e = URL.createObjectURL(r),
    o = document.createElement('a');
  ((o.href = e),
    (o.download = a),
    (o.style.display = 'none'),
    document.body.appendChild(o),
    o.click(),
    setTimeout(() => {
      (document.body.removeChild(o), URL.revokeObjectURL(e));
    }, 0));
}
function S(r) {
  return (
    !!r && typeof r == 'object' && Object.getPrototypeOf(r) === Object.prototype
  );
}
function j(r) {
  function a(e) {
    if (Array.isArray(e)) return e.map(a);
    if (!S(e)) return e;
    const o = {};
    for (const [s, n] of Object.entries(e)) {
      if (n == null) {
        o[s] = n;
        continue;
      }
      if (s === 'date' && typeof n == 'string') {
        o[s] = n;
        continue;
      }
      if (s.endsWith('At') && typeof n == 'string') {
        const i =
            /^\d{4}-\d{2}-\d{2}(?:[T\s]\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?)?$/.test(
              n,
            ),
          c = new Date(n);
        if (i && !Number.isNaN(c.getTime())) {
          o[s] = c;
          continue;
        }
      }
      o[s] = a(n);
    }
    return o;
  }
  return a(r);
}
async function D() {
  try {
    const [r, a, e, o, s, n, i, c, l] = await Promise.all([
        t.profile.get(1),
        t.areas.toArray(),
        t.tasks.toArray(),
        t.companions.toArray(),
        t.xpLogs.toArray(),
        t.inventory.toArray(),
        t.shopItems.toArray(),
        t.ownedShopItems.toArray(),
        t.projects.toArray(),
      ]),
      u = {
        meta: {
          app: 'Level Me Up!',
          formatVersion: 2,
          exportedAt: new Date().toISOString(),
        },
        data: {
          profile: r ?? null,
          areas: a,
          tasks: e,
          companions: o,
          xpLogs: s,
          inventory: n,
          shopItems: i,
          ownedShopItems: c,
          projects: l,
        },
      },
      d = JSON.stringify(u, null, 2),
      m = new Blob([d], { type: 'application/json;charset=utf-8' }),
      y = `lmup-backup-${P()}.json`;
    I(m, y);
  } catch (r) {
    throw (console.error('Erro ao exportar dados:', r), r);
  }
}
async function N(r) {
  if (!r || typeof r.text != 'function')
    throw new Error(
      'Arquivo inválido — selecione um .json exportado pelo app.',
    );
  try {
    const a = await r.text();
    let e;
    try {
      e = JSON.parse(a);
    } catch {
      throw new Error('JSON inválido.');
    }
    if (!e || !e.data || !S(e.data))
      throw new Error('Estrutura de backup não reconhecida.');
    const o = j(e),
      {
        profile: s,
        areas: n,
        tasks: i,
        companions: c,
        xpLogs: l,
        inventory: u,
        shopItems: d,
        ownedShopItems: m,
        projects: y,
      } = o.data,
      f = Array.isArray(n) ? n : [],
      h = Array.isArray(i) ? i : [],
      w = Array.isArray(c) ? c : [],
      A = Array.isArray(l) ? l : [],
      g = Array.isArray(u) ? u : [],
      v = Array.isArray(d) ? d : [],
      k = Array.isArray(m) ? m : [],
      b = Array.isArray(y) ? y : [];
    await t.transaction(
      'rw',
      [
        t.profile,
        t.areas,
        t.tasks,
        t.companions,
        t.xpLogs,
        t.inventory,
        t.shopItems,
        t.ownedShopItems,
        t.projects,
      ],
      async () => {
        (await Promise.all([
          t.xpLogs.clear(),
          t.companions.clear(),
          t.tasks.clear(),
          t.areas.clear(),
          t.inventory.clear(),
          t.shopItems.clear(),
          t.ownedShopItems.clear(),
          t.projects.clear(),
          t.profile.clear(),
        ]),
          f.length && (await t.areas.bulkPut(f)),
          h.length && (await t.tasks.bulkPut(h)),
          w.length && (await t.companions.bulkPut(w)),
          A.length && (await t.xpLogs.bulkPut(A)),
          g.length && (await t.inventory.bulkPut(g)),
          v.length && (await t.shopItems.bulkPut(v)),
          k.length && (await t.ownedShopItems.bulkPut(k)),
          b.length && (await t.projects.bulkPut(b)));
        const x = s ?? {
          id: 1,
          name: 'Seu herói',
          title: 'Nobre Aventureiro Nv. 1',
          level: 1,
          xpCurrent: 0,
          xpNext: 100,
          avatarUrl: '',
          totalXpEarned: 0,
          currentStreak: 0,
          lastCompletionDate: '',
          activeCompanionId: 1,
          gold: 0,
        };
        ((x.id = 1), await t.profile.put(x));
      },
    );
  } catch (a) {
    throw (
      console.error('Erro ao importar dados:', a),
      new Error('Arquivo de backup inválido ou corrompido')
    );
  }
}
async function E() {
  try {
    (await t.transaction('rw', [t.profile, t.areas, t.tasks], async () => {
      const r = await t.profile.get(1);
      await Promise.all([t.areas.clear(), t.tasks.clear()]);
      const a = {
        id: 1,
        name: r?.name ?? 'Seu herói',
        title: 'Nobre Aventureiro Nv. 1',
        level: 1,
        xpCurrent: 0,
        xpNext: 100,
        avatarUrl: r?.avatarUrl ?? '',
        totalXpEarned: 0,
        currentStreak: 0,
        lastCompletionDate: '',
        activeCompanionId: r?.activeCompanionId ?? 1,
        gold: 0,
      };
      await t.profile.put(a);
    }),
      console.log('Progresso resetado. Perfil preservado.'));
  } catch (r) {
    throw (console.error('Erro ao limpar dados:', r), r);
  }
}
export { E as clearAllData, D as exportData, N as importData };
