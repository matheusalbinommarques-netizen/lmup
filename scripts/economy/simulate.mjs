// S1: simulador da Economia 2.0 com os números-HIPÓTESE do plano do autor
// (07/11/2026). Não lê nem altera o app ou qualquer banco. Determinístico.
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

// Construções e produção da V0.1 (NÃO aprovada).
export const BUILDINGS = [
  { key: 'serraria', gold: 180, cost: {} },
  { key: 'campo de caça', gold: 260, cost: { wood: 6 } },
  { key: 'pedreira', gold: 320, cost: { wood: 8 } },
  { key: 'armazém', gold: 300, cost: { wood: 12, stone: 8 } },
  { key: 'mina', gold: 450, cost: { wood: 10, stone: 8 } },
  { key: 'entreposto', gold: 400, cost: { wood: 10, stone: 8 } },
  { key: 'fundição', gold: 420, cost: { wood: 12, stone: 10 } },
  { key: 'forja', gold: 550, cost: { wood: 14, stone: 8, iron: 4 } },
];
const PRODUCTION = {
  serraria: { wood: 12 },
  pedreira: { stone: 8 },
  mina: { ore: 5 },
  'campo de caça': { food: 4 },
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

export function simulate({ missions, mix, days = 120, priceFactor = 1 }) {
  const efforts = sequence(MIXES[mix]);
  const stock = { gold: 0, wood: 0, stone: 0, ore: 0, iron: 0, food: 0 };
  const built = [];
  let cursor = 0,
    carry = 0,
    totalBoxes = 0,
    totalGold = 0;
  const next = () => BUILDINGS.find((b) => !built.some((x) => x.key === b.key));
  for (let day = 1; day <= days && next(); day++) {
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
      // Choose what the next building lacks most, in order wood → stone → ore.
      const target = next()?.cost ?? {};
      const material =
        ['wood', 'stone', 'ore'].find(
          (m) => Math.round((target[m] ?? 0) * priceFactor) > stock[m],
        ) ?? 'wood';
      stock[material] += Math.floor(BOX_BASE[material] * BOX_FACTORS[k]);
    }
    for (const b of built)
      for (const [m, n] of Object.entries(PRODUCTION[b.key] ?? {}))
        stock[m] += n;
    if (built.some((b) => b.key === 'fundição')) {
      const iron = Math.min(3, Math.floor(stock.ore / 2), stock.wood);
      stock.ore -= iron * 2;
      stock.wood -= iron;
      stock.iron += iron;
    }
    // Build as many as affordable today, in order.
    for (let b = next(); b; b = next()) {
      const price = (n) => Math.round(n * priceFactor);
      const enough =
        stock.gold >= price(b.gold) &&
        Object.entries(b.cost).every(([m, n]) => stock[m] >= price(n));
      if (!enough) break;
      stock.gold -= price(b.gold);
      for (const [m, n] of Object.entries(b.cost)) stock[m] -= price(n);
      built.push({ key: b.key, day });
    }
  }
  const gaps = built.map((b, i) => b.day - (i ? built[i - 1].day : 0));
  return {
    xpPerDay: efforts.slice(0, missions).reduce((s, e) => s + EFFORT_XP[e], 0),
    goldPerDay:
      Math.round((totalGold / Math.max(1, built.at(-1)?.day ?? days)) * 10) /
      10,
    boxesPerDay:
      Math.round((totalBoxes / Math.max(1, built.at(-1)?.day ?? days)) * 10) /
      10,
    built,
    gaps,
    finished: built.length === BUILDINGS.length,
  };
}

function render(md) {
  const lines = [];
  const row = (cells) =>
    md ? `| ${cells.join(' | ')} |` : cells.join('  ·  ');
  for (const mix of Object.keys(MIXES)) {
    lines.push(md ? `\n### Mistura de esforço: ${mix}\n` : `\n== ${mix} ==`);
    lines.push(
      row([
        'Perfil',
        'Ouro/dia',
        'Caixas/dia',
        'Dia de cada construção',
        'Intervalo médio',
        'Tudo pronto',
      ]),
    );
    if (md) lines.push('| --- | ---: | ---: | --- | ---: | ---: |');
    for (const profile of PROFILES) {
      const r = simulate({ missions: profile.missions, mix });
      const average = r.gaps.length
        ? (r.gaps.reduce((a, b) => a + b, 0) / r.gaps.length).toFixed(1)
        : '—';
      lines.push(
        row([
          profile.key,
          String(r.goldPerDay),
          String(r.boxesPerDay),
          r.built.map((b) => `${b.key} d${b.day}`).join(', ') || '—',
          `${average} dias`,
          r.finished ? `dia ${r.built.at(-1).day}` : 'não em 120 dias',
        ]),
      );
    }
  }
  lines.push(
    md
      ? '\n### Fator de preço (ouro e materiais) · 6–10 por dia\n'
      : '\n== fator de preço · 6–10 por dia ==',
  );
  lines.push(row(['Fator', 'Leve', 'Equilibrado', 'Intenso']));
  if (md) lines.push('| ---: | --- | --- | --- |');
  for (const factor of [1, 1.5, 2, 2.5, 3, 4]) {
    const cells = Object.keys(MIXES).map((mix) => {
      const r = simulate({ missions: 8, mix, priceFactor: factor });
      const average = (
        r.gaps.reduce((a, b) => a + b, 0) / Math.max(1, r.gaps.length)
      ).toFixed(1);
      return `${average} dias entre construções; tudo no dia ${r.finished ? r.built.at(-1).day : '>120'}`;
    });
    lines.push(row([`× ${factor}`, ...cells]));
  }
  return lines.join('\n');
}

if (process.argv[1]?.endsWith('simulate.mjs'))
  console.log(render(process.argv.includes('--md')));
