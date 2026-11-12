// S1: simulador da Economia 2.0 com os números-HIPÓTESE do plano do autor
// (07/11/2026) e a proposta V0.2. Não lê nem altera o app. Determinístico.
// Uso: node scripts/economy/simulate.mjs        (tabelas no terminal)
//      node scripts/economy/simulate.mjs --md   (Markdown)

export const EFFORT_XP = {
  micro: 10,
  small: 50,
  medium: 100,
  large: 150,
  deep: 250,
};
export const goldFor = (xp) => Math.floor(xp * 0.5);

// Caixas (decidido: até 5 por dia, nenhuma depois da 5ª; o resto é hipótese).
export const BOX_XP = 400;
export const BOX_FACTORS = [1, 0.75, 0.5, 0.5, 0.5];
export const BOX_BASE = { wood: 8, stone: 6, ore: 4 };

/**
 * A catalog lists buildings in unlock order. `levels[i]` is the price of
 * level i + 1 (gold plus materials). `production` is per day at level 1;
 * higher levels multiply it by `levelOutput`.
 */
export const CATALOGS = {
  // Plano do autor, seção 6.2 (NÃO aprovada): um nível, sem limite de estoque.
  'V0.1': {
    storage: [Infinity],
    levelOutput: [1],
    buildings: [
      { key: 'serraria', levels: [{ gold: 180 }], production: { wood: 12 } },
      {
        key: 'campo de caça',
        levels: [{ gold: 260, wood: 6 }],
        production: { food: 4 },
      },
      {
        key: 'pedreira',
        levels: [{ gold: 320, wood: 8 }],
        production: { stone: 8 },
      },
      { key: 'armazém', levels: [{ gold: 300, wood: 12, stone: 8 }] },
      {
        key: 'mina',
        levels: [{ gold: 450, wood: 10, stone: 8 }],
        production: { ore: 5 },
      },
      { key: 'entreposto', levels: [{ gold: 400, wood: 10, stone: 8 }] },
      {
        key: 'fundição',
        levels: [{ gold: 420, wood: 12, stone: 10 }],
        smelter: 3,
      },
      { key: 'forja', levels: [{ gold: 550, wood: 14, stone: 8, iron: 4 }] },
    ],
  },
  // Proposta V0.2 (para decisão do autor): começo barato, degraus crescentes
  // e 3 níveis por construção. Estoque limitado; o armazém amplia.
  'V0.2': {
    // Limite por material: sem armazém, e com armazém nível 1, 2 e 3.
    storage: [60, 160, 320, 600],
    levelOutput: [1, 1.5, 2],
    buildings: [
      {
        key: 'serraria',
        levels: [
          { gold: 150 },
          { gold: 900, wood: 40, stone: 20 },
          { gold: 2600, wood: 120, stone: 80, iron: 10 },
        ],
        production: { wood: 10 },
      },
      {
        key: 'campo de caça',
        levels: [
          { gold: 350, wood: 12 },
          { gold: 1100, wood: 50, stone: 25 },
          { gold: 3000, wood: 130, stone: 90, iron: 12 },
        ],
        production: { food: 4 },
      },
      {
        key: 'pedreira',
        levels: [
          { gold: 600, wood: 25 },
          { gold: 1400, wood: 60, stone: 30 },
          { gold: 3400, wood: 150, stone: 100, iron: 14 },
        ],
        production: { stone: 7 },
      },
      {
        key: 'armazém',
        levels: [
          { gold: 900, wood: 40, stone: 25 },
          { gold: 1800, wood: 90, stone: 60 },
          { gold: 3800, wood: 180, stone: 140, iron: 16 },
        ],
      },
      {
        key: 'mina',
        levels: [
          { gold: 1050, wood: 45, stone: 30 },
          { gold: 2200, wood: 100, stone: 70 },
          { gold: 4400, wood: 200, stone: 160, iron: 18 },
        ],
        production: { ore: 4 },
      },
      {
        key: 'entreposto',
        levels: [
          { gold: 1200, wood: 55, stone: 40 },
          { gold: 2600, wood: 120, stone: 90 },
          { gold: 5000, wood: 220, stone: 180, iron: 20 },
        ],
      },
      {
        key: 'fundição',
        levels: [
          { gold: 1450, wood: 60, stone: 50, ore: 16 },
          { gold: 3000, wood: 130, stone: 110, ore: 40 },
          { gold: 5200, wood: 230, stone: 190, ore: 70 },
        ],
        smelter: 2,
      },
      {
        key: 'forja',
        levels: [
          { gold: 1800, wood: 70, stone: 55, iron: 12 },
          { gold: 3400, wood: 140, stone: 110, iron: 30 },
          { gold: 6000, wood: 250, stone: 210, iron: 60 },
        ],
      },
    ],
  },
};

export const MIXES = {
  leve: { micro: 4, small: 10, medium: 5, large: 1, deep: 0 },
  equilibrado: { micro: 2, small: 7, medium: 7, large: 3, deep: 1 },
  intenso: { micro: 0, small: 4, medium: 6, large: 6, deep: 4 },
};
export const PROFILES = [
  { key: '1–5 por dia', missions: 3 },
  { key: '6–10 por dia', missions: 8 },
  { key: '10+ por dia', missions: 12 },
];

/** Fixed, evenly interleaved sequence of efforts for a mix (one cycle). */
function sequence(mix) {
  const total = Object.values(mix).reduce((a, b) => a + b, 0);
  const used = Object.fromEntries(Object.keys(mix).map((k) => [k, 0]));
  const out = [];
  for (let i = 1; i <= total; i++) {
    const [key] = Object.keys(mix)
      .map((k) => [k, (mix[k] * i) / total - used[k]])
      .sort((x, y) => y[1] - x[1])[0];
    used[key]++;
    out.push(key);
  }
  return out;
}

/** Boxes earned in one day from the day's XP, carrying partial progress. */
export function boxesForDay(dayXp, carry) {
  let progress = carry + dayXp;
  let boxes = 0;
  while (progress >= BOX_XP && boxes < BOX_FACTORS.length) {
    progress -= BOX_XP;
    boxes++;
  }
  // After the 5th box, the rest of the day does not count (author, 11/11).
  if (boxes === BOX_FACTORS.length) progress = 0;
  return { boxes, carry: progress };
}

/**
 * Strategy: unlock every building at level 1 in catalog order; then buy the
 * cheapest available upgrade. Materials from boxes go to what the next
 * purchase lacks. Every day is an active day.
 */
export function simulate({
  missions,
  mix,
  catalog = 'V0.1',
  days = 365,
  priceFactor = 1,
}) {
  const { buildings, storage, levelOutput } = CATALOGS[catalog];
  const efforts = sequence(MIXES[mix]);
  const stock = { gold: 0, wood: 0, stone: 0, ore: 0, iron: 0, food: 0 };
  const level = Object.fromEntries(buildings.map((b) => [b.key, 0]));
  const events = [];
  let cursor = 0,
    carry = 0,
    totalBoxes = 0,
    totalGold = 0;
  const price = (cost) =>
    Object.fromEntries(
      Object.entries(cost).map(([k, v]) => [k, Math.round(v * priceFactor)]),
    );
  const nextPurchase = () => {
    const locked = buildings.find((b) => level[b.key] === 0);
    if (locked) return { building: locked, cost: price(locked.levels[0]) };
    const upgrades = buildings
      .filter((b) => level[b.key] < b.levels.length)
      .map((b) => ({ building: b, cost: price(b.levels[level[b.key]]) }))
      .sort((a, b) => a.cost.gold - b.cost.gold);
    return upgrades[0];
  };
  const cap = () =>
    storage[Math.min(level['armazém'] ?? 0, storage.length - 1)];
  const add = (material, amount) => {
    stock[material] = Math.min(cap(), stock[material] + amount);
  };
  for (let day = 1; day <= days && nextPurchase(); day++) {
    let xp = 0;
    for (let m = 0; m < missions; m++)
      xp += EFFORT_XP[efforts[cursor++ % efforts.length]];
    const gold = goldFor(xp);
    stock.gold += gold;
    totalGold += gold;
    const result = boxesForDay(xp, carry);
    carry = result.carry;
    totalBoxes += result.boxes;
    for (let k = 0; k < result.boxes; k++) {
      const target = nextPurchase()?.cost ?? {};
      const material =
        ['wood', 'stone', 'ore'].find((m) => (target[m] ?? 0) > stock[m]) ??
        'wood';
      add(material, Math.floor(BOX_BASE[material] * BOX_FACTORS[k]));
    }
    for (const b of buildings) {
      const lv = level[b.key];
      if (!lv) continue;
      for (const [m, n] of Object.entries(b.production ?? {}))
        if (m === 'food') stock.food += Math.round(n * levelOutput[lv - 1]);
        else add(m, Math.round(n * levelOutput[lv - 1]));
      if (b.smelter) {
        const iron = Math.min(
          Math.round(b.smelter * levelOutput[lv - 1]),
          Math.floor(stock.ore / 2),
          stock.wood,
        );
        stock.ore -= iron * 2;
        stock.wood -= iron;
        add('iron', iron);
      }
    }
    for (let next = nextPurchase(); next; next = nextPurchase()) {
      const affordable = Object.entries(next.cost).every(
        ([k, v]) => stock[k] >= v,
      );
      if (!affordable) break;
      for (const [k, v] of Object.entries(next.cost)) stock[k] -= v;
      level[next.building.key]++;
      events.push({
        key: next.building.key,
        level: level[next.building.key],
        day,
      });
    }
  }
  const total = buildings.reduce((s, b) => s + b.levels.length, 0);
  const lastDay = events.at(-1)?.day ?? days;
  const allLevel1 = events.filter((e) => e.level === 1);
  const gaps = events.map((e, i) => e.day - (i ? events[i - 1].day : 0));
  const firstMonth = events.filter((e) => e.day <= 30);
  return {
    goldPerDay: Math.round((totalGold / Math.max(1, lastDay)) * 10) / 10,
    boxesPerDay: Math.round((totalBoxes / Math.max(1, lastDay)) * 10) / 10,
    first: events[0]?.day,
    byWeek1: events.filter((e) => e.day <= 7).length,
    byMonth1: firstMonth.length,
    allLevel1:
      allLevel1.length === buildings.length ? allLevel1.at(-1).day : null,
    complete: events.length === total ? lastDay : null,
    longestGap: Math.max(0, ...gaps),
    events,
    total,
  };
}

function render(md) {
  const lines = [];
  const row = (cells) =>
    md ? `| ${cells.join(' | ')} |` : cells.join('  ·  ');
  const days = (n) => (n == null ? '> 365' : `dia ${n}`);
  for (const catalog of Object.keys(CATALOGS)) {
    lines.push(md ? `\n### ${catalog}\n` : `\n==== ${catalog} ====`);
    lines.push(
      row([
        'Mistura',
        'Perfil',
        'Ouro/dia',
        'Caixas/dia',
        '1ª construção',
        'Até o dia 7',
        'Até o dia 30',
        'Todas no nível 1',
        'Tudo no máximo',
        'Maior espera',
      ]),
    );
    if (md)
      lines.push(
        '| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
      );
    for (const mix of Object.keys(MIXES))
      for (const profile of PROFILES) {
        const r = simulate({ missions: profile.missions, mix, catalog });
        lines.push(
          row([
            mix,
            profile.key,
            String(r.goldPerDay),
            String(r.boxesPerDay),
            days(r.first),
            `${r.byWeek1} de ${r.total}`,
            `${r.byMonth1} de ${r.total}`,
            days(r.allLevel1),
            days(r.complete),
            `${r.longestGap} dias`,
          ]),
        );
      }
  }
  const names = {
    gold: 'ouro',
    wood: 'madeira',
    stone: 'pedra',
    ore: 'minério',
    iron: 'ferro',
    food: 'comida',
  };
  const describe = (cost) =>
    Object.entries(cost)
      .map(([k, v]) => `${v} ${names[k]}`)
      .join(' + ');
  lines.push(md ? '\n### Preços da V0.2\n' : '\n==== preços V0.2 ====');
  lines.push(
    row([
      'Construção',
      'Nível 1',
      'Nível 2',
      'Nível 3',
      'Produção por dia (nível 1)',
    ]),
  );
  if (md) lines.push('| --- | --- | --- | --- | --- |');
  for (const b of CATALOGS['V0.2'].buildings)
    lines.push(
      row([
        b.key,
        ...b.levels.map(describe),
        b.production
          ? describe(b.production)
          : b.smelter
            ? `até ${b.smelter} ferro (2 minério + 1 madeira cada)`
            : '—',
      ]),
    );
  const reference = simulate({
    missions: 8,
    mix: 'equilibrado',
    catalog: 'V0.2',
  });
  lines.push(
    md
      ? '\n### V0.2 · linha do tempo do perfil de referência (6–10 por dia, equilibrado)\n'
      : '\n==== V0.2 · referência ====',
  );
  lines.push(
    reference.events
      .map((e) => `${e.key} ${e.level} (d${e.day})`)
      .join(md ? ' → ' : ', '),
  );
  return lines.join('\n');
}

if (process.argv[1]?.endsWith('simulate.mjs'))
  console.log(render(process.argv.includes('--md')));
