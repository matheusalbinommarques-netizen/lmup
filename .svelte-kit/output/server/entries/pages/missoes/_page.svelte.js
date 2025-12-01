import {
  y as attr_class,
  x as attr,
  w as ensure_array_like,
  F as stringify,
  J as bind_props,
  z as attr_style,
  G as clsx,
} from '../../../chunks/index2.js';
import { d as db, P as PageTitleCard } from '../../../chunks/PageTitleCard.js';
import { liveQuery } from 'dexie';
import { g as getXpForNextLevel } from '../../../chunks/xpService.js';
import { e as escape_html } from '../../../chunks/context.js';
function AreaManager($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { selectedId = 'all' } = $$props;
    let areas = [];
    let newAreaName = '';
    liveQuery(() => db.areas.toArray());
    $$renderer2.push(
      `<section class="flex flex-col gap-3"><h3 class="text-[1.5rem] uppercase tracking-[0.22em] text-amber-300/80">Áreas de Foco</h3> <div class="flex flex-row gap-2 overflow-x-auto no-scrollbar pb-2 -mb-2 svelte-3ics1j" role="tablist" aria-label="Filtro de Áreas"><button${attr_class(`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${stringify(selectedId === 'all' ? 'bg-primary/20 text-primary border-primary/30' : 'text-slate-400 bg-slate-900/50 border-slate-800 hover:bg-slate-800')}`)} role="tab"${attr('aria-selected', selectedId === 'all')}>Todas</button> <!--[-->`,
    );
    const each_array = ensure_array_like(areas);
    for (
      let $$index = 0, $$length = each_array.length;
      $$index < $$length;
      $$index++
    ) {
      let area = each_array[$$index];
      $$renderer2.push(
        `<div class="relative shrink-0 group" role="tab"${attr('aria-selected', selectedId === area.id)}><button${attr_class(`w-full h-full pl-4 pr-3 py-2 rounded-lg text-sm font-medium transition-colors border ${stringify(selectedId === area.id ? 'bg-primary/20 text-primary border-primary/30' : 'text-slate-400 bg-slate-900/50 border-slate-800 hover:bg-slate-800')}`)}>${escape_html(area.nome)}</button> <button title="Excluir Área" aria-label="Excluir Área" class="absolute -top-2 -right-2 z-10 w-5 h-5 rounded-full bg-slate-700 text-slate-300 text-xs font-bold flex items-center justify-center border-2 border-slate-900 opacity-0 group-hover:opacity-100 transition-opacity hover:!opacity-100 hover:bg-red-500 hover:text-white">X</button></div>`,
      );
    }
    $$renderer2.push(
      `<!--]--></div> <form class="flex gap-2"><input type="text"${attr('value', newAreaName)} placeholder="Nova Área (ex: Programação)" class="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/30"/> <button type="submit" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"${attr('disabled', !newAreaName.trim(), true)}>Criar Área</button></form></section>`,
    );
    bind_props($$props, { selectedId });
  });
}
let currentRange = '7d';
function getCurrentRange() {
  return currentRange;
}
function XpByAreaChart($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let xpLogs = [];
    let areas = [];
    let selectedRange = getCurrentRange();
    function parseYMD(dateStr) {
      if (!dateStr) return null;
      const parts = dateStr.split('-');
      if (parts.length !== 3) return null;
      const [yStr, mStr, dStr] = parts;
      const y = Number(yStr);
      const m = Number(mStr);
      const d = Number(dStr);
      if (!y || !m || !d) return null;
      return new Date(y, m - 1, d);
    }
    function isLogWithinRange(log, range) {
      const d = parseYMD(log.date);
      if (!d) return false;
      const today = /* @__PURE__ */ new Date();
      const todayDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      );
      const logDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      {
        const daysBack = 6;
        const start = new Date(
          todayDay.getFullYear(),
          todayDay.getMonth(),
          todayDay.getDate() - daysBack,
        );
        return logDay >= start && logDay <= todayDay;
      }
    }
    const areaMap = areas.reduce(
      (map, a) => {
        if (a.id) map[a.id] = a.nome;
        return map;
      },
      { 0: 'Geral' },
    );
    const xpByArea = (() => {
      const acc = {};
      if (!xpLogs.length) return acc;
      for (const log of xpLogs) {
        if (!isLogWithinRange(log)) continue;
        const areaId = log.areaId ?? 0;
        const label = areaMap[areaId] ?? 'Geral';
        acc[label] = (acc[label] ?? 0) + (log.amount ?? 0);
      }
      return acc;
    })();
    const labels = Object.keys(xpByArea).sort(
      (a, b) => (xpByArea[b] ?? 0) - (xpByArea[a] ?? 0),
    );
    const values = labels.map((l) => xpByArea[l] ?? 0);
    const total = values.reduce((s, v) => s + v, 0);
    const hasData = total > 0;
    function colorForIndex(i, n = 12) {
      const hue = Math.round(((i % n) / n) * 360);
      return `hsl(${hue} 70% 55%)`;
    }
    const R = 38;
    const C = 2 * Math.PI * R;
    const segments = (() => {
      if (!hasData) return [];
      let accLen = 0;
      const out = [];
      for (let i = 0; i < values.length; i++) {
        const v = values[i];
        const p = v / total;
        const len = C * p;
        out.push({
          label: labels[i],
          value: v,
          percent: p,
          len,
          offset: accLen,
          color: colorForIndex(i),
        });
        accLen += len;
      }
      return out;
    })();
    function pct(p) {
      return `${Math.round(p * 100)}%`;
    }
    const currentRangeLabel = (() => {
      switch (selectedRange) {
        case '7d':
          return 'Últimos 7 dias';
        case '30d':
          return 'Últimos 30 dias';
        case '6m':
          return 'Últimos 6 meses';
        case '1y':
          return 'Últimos 12 meses';
      }
    })();
    $$renderer2.push(
      `<section class="mx-auto w-full max-w-4xl rounded-2xl border border-green-500/60 bg-slate-950/70 px-4 py-3 shadow-[0_0_20px_rgba(56,189,248,0.45)]"><header class="text-center space-y-1 mb-4"><p class="text-[0.7rem] uppercase tracking-[0.22em] text-slate-400">Estatísticas</p> <h2 class="text-xl font-semibold text-slate-100">XP por Área</h2> <p class="text-[0.7rem] text-slate-500 mt-1">${escape_html(currentRangeLabel)}</p> <div class="mx-auto mt-3 h-px w-24 bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div></header> `,
    );
    if (hasData) {
      $$renderer2.push('<!--[-->');
      $$renderer2.push(
        `<div class="flex flex-col items-center gap-5"><div class="flex items-center justify-center w-full"><svg viewBox="0 0 100 100" class="w-full max-w-md h-64 lg:h-80" role="img" aria-label="Distribuição de XP por área"><circle cx="50" cy="50"${attr('r', R)} fill="none" stroke="rgba(148,163,184,0.15)" stroke-width="14"></circle><g transform="rotate(-90 50 50)"><!--[-->`,
      );
      const each_array = ensure_array_like(segments);
      for (let i = 0, $$length = each_array.length; i < $$length; i++) {
        let seg = each_array[i];
        $$renderer2.push(
          `<circle cx="50" cy="50"${attr('r', R)} fill="none"${attr('stroke', seg.color)} stroke-width="14" stroke-linecap="butt"${attr('stroke-dasharray', `${seg.len} ${C - seg.len}`)}${attr('stroke-dashoffset', `-${seg.offset}`)}><title>${escape_html(seg.label)}: ${escape_html(seg.value)} XP (${escape_html(pct(seg.percent))})</title></circle>`,
        );
      }
      $$renderer2.push(
        `<!--]--></g><g aria-hidden="true"><circle cx="50" cy="50" r="22" fill="rgba(15,23,42,0.9)"></circle><text x="50" y="47" text-anchor="middle" class="fill-slate-300" font-size="8" font-weight="600">Total XP</text><text x="50" y="60" text-anchor="middle" class="fill-amber-300" font-size="10" font-weight="700">${escape_html(total)}</text></g></svg></div> <div class="mx-auto w-full max-w-md"><ul class="space-y-2"><!--[-->`,
      );
      const each_array_1 = ensure_array_like(segments);
      for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
        let seg = each_array_1[i];
        $$renderer2.push(
          `<li class="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm"><div class="flex items-center gap-2 min-w-0"><span class="inline-block h-3 w-3 rounded-sm"${attr_style(`background:${seg.color}`)} aria-hidden="true"></span> <span class="truncate text-slate-200">${escape_html(seg.label)}</span></div> <div class="flex items-center gap-2 shrink-0"><span class="text-slate-400">${escape_html(pct(seg.percent))}</span> <span class="text-amber-300 font-semibold">${escape_html(seg.value)} XP</span></div></li>`,
        );
      }
      $$renderer2.push(`<!--]--></ul></div></div>`);
    } else {
      $$renderer2.push('<!--[!-->');
      $$renderer2.push(
        `<div class="flex items-center justify-center h-64 lg:h-80 text-slate-500"><p>Complete missões no período selecionado para ver suas estatísticas aqui!</p></div>`,
      );
    }
    $$renderer2.push(`<!--]--></section>`);
  });
}
function StatsManager($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const fallbackProfile = {
      name: 'Seu herói',
      title: 'Nobre aventureiro',
      level: 1,
      xpCurrent: 0,
      totalXpEarned: 0,
    };
    const hero = fallbackProfile;
    liveQuery(() => db.profile.get(1));
    const totalXp = hero.totalXpEarned;
    const level = hero.level;
    const currentLevelXp = hero.xpCurrent;
    const xpToNextLevel = getXpForNextLevel(level);
    const remainingXp = Math.max(xpToNextLevel - currentLevelXp, 0);
    const xpProgress =
      xpToNextLevel > 0
        ? Math.min(100, (currentLevelXp / xpToNextLevel) * 100)
        : 0;
    $$renderer2.push(`<section class="w-full"><div class="realm-card relative mx-auto max-w-4xl overflow-hidden px-6 py-5 md:px-8 md:py-6"><div class="pointer-events-none absolute inset-0 opacity-40" aria-hidden="true"><div class="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.45),_transparent_60%)]"></div></div> <div class="relative flex flex-col gap-4"><div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><p class="text-[0.65rem] uppercase tracking-[0.25em] text-sky-400/80">Status do herói</p> <h2 class="text-xl md:text-2xl font-bold text-slate-50">${escape_html(hero.name)}</h2> <p class="text-[0.7rem] text-slate-400">${escape_html(hero.title)}</p> <p class="mt-1 text-xs text-slate-300/80 max-w-md">Complete pequenas missões todos os dias para subir de nível e manter
            sua chama de foco acesa.</p></div> <div class="flex flex-col items-end gap-2 text-xs"><div class="inline-flex items-center gap-2 rounded-full border border-amber-400/70 bg-amber-500/10 px-3 py-1 text-amber-100 shadow-md shadow-amber-900/40"><span class="text-sm">🔥</span> `);
    {
      $$renderer2.push('<!--[!-->');
      $$renderer2.push(`<span class="font-semibold">Comece hoje</span>`);
    }
    $$renderer2.push(
      `<!--]--></div> <p class="text-[0.7rem] text-slate-400">XP total: <span class="font-semibold text-slate-100">${escape_html(totalXp)}</span></p></div></div> <div class="flex flex-col items-center justify-between gap-4 md:flex-row"><div class="flex items-center gap-4"><div class="relative flex h-32 w-32 items-center justify-center rounded-full border border-amber-400/80 bg-slate-950 shadow-[0_0_20px_rgba(251,191,36,0.7)] overflow-hidden">`,
    );
    {
      $$renderer2.push('<!--[!-->');
      $$renderer2.push(
        `<div class="h-full w-full grid place-items-center text-sm text-amber-200/80">?</div>`,
      );
    }
    $$renderer2.push(
      `<!--]--></div> <div class="space-y-2"><p class="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-amber-200/80">Nível atual</p> <div class="inline-flex items-center justify-center rounded-md border border-amber-200/80 bg-slate-950/90 px-4 py-1 text-sm font-semibold text-amber-200/80 shadow-[0_0_14px_rgba(56,189,248,0.6)]">${escape_html(level)}</div> <p class="text-xs text-slate-300/85 max-w-xs">Falta <span class="font-semibold text-sky-100">${escape_html(remainingXp)}</span> XP para o próximo nível.</p></div></div> <div class="w-full space-y-2 md:w-1/2"><div class="flex items-center justify-between text-[0.7rem] text-slate-400"><span>Progresso até o próximo nível</span> <span class="inline-flex items-center gap-1 font-medium text-slate-200"><img src="/art/icones/icon-xp.png" alt="XP" class="h-4 w-4 object-contain"/> <span>${escape_html(currentLevelXp)} / ${escape_html(xpToNextLevel)}</span></span></div> <div class="h-2.5 w-full overflow-hidden rounded-full border border-slate-800 bg-slate-900"><div class="h-full rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-lime-400 transition-[width] duration-500 ease-out"${attr_style(`width: ${xpProgress}%;`)}></div></div></div></div></div></div></section>`,
    );
  });
}
function SelfComparisonPanel($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const RANGES = ['7d', '30d', '6m', '1y'];
    let xpLogs = [];
    let selectedRange = getCurrentRange();
    liveQuery(() => db.xpLogs.toArray());
    const MS_PER_DAY = 1e3 * 60 * 60 * 24;
    function parseDate(dateStr) {
      if (!dateStr) return null;
      const [yStr, mStr, dStr] = dateStr.split('-');
      const y = Number(yStr),
        m = Number(mStr),
        d = Number(dStr);
      if (!y || !m || !d) return null;
      return new Date(y, m - 1, d);
    }
    function formatDayLabel(d) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      return `${day}/${month}`;
    }
    function toDateKey(d) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }
    function buildPoints(logs, range) {
      if (!logs?.length) return [];
      const today = /* @__PURE__ */ new Date();
      {
        const days = 7;
        const result = [];
        for (let i = days - 1; i >= 0; i--) {
          const d = new Date(today.getTime() - i * MS_PER_DAY);
          const key = toDateKey(d);
          const label = formatDayLabel(d);
          const value = logs
            .filter((log) => log.date === key)
            .reduce((s, log) => s + (log.amount ?? 0), 0);
          result.push({ label, value });
        }
        return result;
      }
    }
    const points = buildPoints(xpLogs);
    const maxValue = points.length
      ? points.reduce((m, p) => (p.value > m ? p.value : m), 0)
      : 0;
    const svgBars = (() => {
      if (!points.length) return [];
      const max = maxValue || 1;
      const chartWidth = 100,
        chartHeight = 100;
      const paddingX = 4,
        paddingTop = 4,
        paddingBottom = 12;
      const innerWidth = chartWidth - paddingX * 2;
      const innerHeight = chartHeight - paddingTop - paddingBottom;
      const n = points.length;
      const step = innerWidth / n;
      const barWidth = step * 0.7;
      return points.map((p, i) => {
        const rawHeight = (p.value / max) * innerHeight;
        const height = Math.max(rawHeight, 1);
        const x = paddingX + i * step + (step - barWidth) / 2;
        const y = chartHeight - paddingBottom - height;
        return {
          label: p.label,
          value: p.value,
          x,
          y,
          width: barWidth,
          height,
        };
      });
    })();
    const hasData = points.some((p) => p.value !== 0);
    const totalInRange = points.reduce((sum, p) => sum + p.value, 0);
    const averageValue = points.length
      ? Math.round(totalInRange / points.length)
      : 0;
    const bestPointLabel = (() => {
      if (!points.length) return '—';
      let best = points[0];
      for (const p of points) if (p.value > best.value) best = p;
      return best.value === 0 ? '—' : best.label;
    })();
    const bestWeekdayLabel = (() => {
      if (!xpLogs.length) return '—';
      const byWeekday = [0, 0, 0, 0, 0, 0, 0];
      for (const log of xpLogs) {
        const d = parseDate(log.date);
        if (!d) continue;
        byWeekday[d.getDay()] += log.amount ?? 0;
      }
      const labels = [
        'Domingo',
        'Segunda',
        'Terça',
        'Quarta',
        'Quinta',
        'Sexta',
        'Sábado',
      ];
      let best = 0;
      for (let i = 1; i < 7; i++) if (byWeekday[i] > byWeekday[best]) best = i;
      return byWeekday[best] === 0 ? '—' : labels[best];
    })();
    const headerTitle = (() => {
      switch (selectedRange) {
        case '7d':
          return 'XP diário — últimos 7 dias';
        case '30d':
          return 'XP diário — últimos 30 dias';
        case '6m':
          return 'XP mensal — últimos 6 meses';
        case '1y':
          return 'XP mensal — últimos 12 meses';
      }
    })();
    const unitLabel = 'dia';
    function shouldShowLabel(index, total, range) {
      return true;
    }
    function formatAxisLabel(label, range) {
      return label.slice(0, 2);
    }
    $$renderer2.push(
      `<section class="mx-auto w-full max-w-4xl rounded-2xl border border-green-500/60 bg-slate-950/70 px-4 py-3 shadow-[0_0_20px_rgba(56,189,248,0.45)]"><div class="mx-auto max-w-4xl rounded-3xl border border-slate-800 bg-slate-950/85 px-4 py-4 md:px-6 md:py-5 shadow-[0_0_30px_rgba(15,23,42,0.7)]"><header class="mb-4 text-center space-y-1"><p class="text-[1rem] uppercase tracking-[0.22em] text-slate-400">Comparação pessoal</p> <h3 class="text-base font-semibold text-slate-100 md:text-lg">${escape_html(headerTitle)}</h3> <p class="text-[0.7rem] text-slate-500">Gráfico atualizado em tempo real conforme você ganha XP.</p></header> `,
    );
    if (hasData) {
      $$renderer2.push('<!--[-->');
      $$renderer2.push(
        `<div class="mb-4 grid gap-3 text-xs text-slate-300 md:grid-cols-3"><div class="rounded-2xl border border-emerald-500/70 bg-emerald-950/40 px-3 py-2.5 shadow-[0_0_18px_rgba(16,185,129,0.45)]"><p class="text-[0.65rem] uppercase tracking-[0.18em] text-emerald-200/80">Total no período</p> <p class="mt-1 text-lg font-semibold text-emerald-100">${escape_html(totalInRange)} XP</p> <p class="text-[0.7rem] text-emerald-200/80">Somando tudo que você fez em cada ${escape_html(unitLabel)}.</p></div> <div class="rounded-2xl border border-yellow-300/60 bg-slate-950/70 px-3 py-2.5 shadow-[0_0_20px_rgba(234,179,8,0.25)]"><p class="text-[0.65rem] uppercase tracking-[0.18em] text-slate-400">Média por ${escape_html(unitLabel)}</p> <p class="mt-1 text-lg font-semibold text-slate-100">${escape_html(averageValue)} XP</p> <p class="text-[0.7rem] text-slate-400">Se mantiver esse ritmo, seu crescimento continua estável.</p></div> <div class="rounded-2xl border border-blue-300/60 bg-slate-950/70 px-3 py-2.5 shadow-[0_0_20px_rgba(59,130,246,0.25)]"><p class="text-[0.65rem] uppercase tracking-[0.18em] text-slate-400">Melhor ${escape_html('dia')} do período</p> <p class="mt-1 text-sm font-semibold text-emerald-300">${escape_html(bestPointLabel)}</p> <p class="text-[0.7rem] text-slate-400">Quando você mais acumulou XP dentro deste recorte.</p></div></div> <div class="mb-4 flex flex-wrap items-center justify-center gap-2 text-[0.7rem]"><!--[-->`,
      );
      const each_array = ensure_array_like(RANGES);
      for (
        let $$index = 0, $$length = each_array.length;
        $$index < $$length;
        $$index++
      ) {
        let range = each_array[$$index];
        $$renderer2.push(
          `<button type="button"${attr_class(`rounded-full px-3 py-1.5 border transition-colors ${selectedRange === range ? 'border-emerald-400/80 bg-emerald-500/15 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.6)]' : 'border-slate-700 bg-slate-900/80 text-slate-300 hover:border-emerald-400/60 hover:text-emerald-200'}`)}>${escape_html(range === '7d' ? '7 dias' : range === '30d' ? '30 dias' : range === '6m' ? '6 meses' : '1 ano')}</button>`,
        );
      }
      $$renderer2.push(
        `<!--]--></div> <div class="mb-4 rounded-2xl border border-slate-800 bg-slate-950/90 px-3 py-3"><svg viewBox="0 0 100 100" class="h-52 w-full" role="img"${attr('aria-label', `XP por ${stringify(unitLabel)}`)}><line x1="0" y1="88" x2="100" y2="88" stroke="rgba(148,163,184,0.6)" stroke-width="0.5"></line><!--[-->`,
      );
      const each_array_1 = ensure_array_like(svgBars);
      for (
        let index = 0, $$length = each_array_1.length;
        index < $$length;
        index++
      ) {
        let bar = each_array_1[index];
        $$renderer2.push(
          `<rect${attr('x', bar.x)}${attr('y', bar.y)}${attr('width', bar.width)}${attr('height', bar.height)} rx="1.5" fill="#22c55e"><title>${escape_html(bar.label)}: ${escape_html(bar.value)} XP</title></rect>`,
        );
        if (shouldShowLabel(index, svgBars.length)) {
          $$renderer2.push('<!--[-->');
          $$renderer2.push(
            `<text${attr('x', bar.x + bar.width / 2)} y="96" font-size="4.2" fill="rgba(148,163,184,0.9)" text-anchor="middle">${escape_html(formatAxisLabel(bar.label))}</text>`,
          );
        } else {
          $$renderer2.push('<!--[!-->');
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(
        `<!--]--></svg></div> <div class="mx-auto w-full max-w-4xl rounded-2xl border border-green-500/60 bg-slate-950/70 px-4 py-3 shadow-[0_0_20px_rgba(56,189,248,0.45)]"><p class="text-center text-[0.65rem] uppercase tracking-[0.18em] text-green-300/80">Dia da semana mais forte</p> <p class="text-center text-lg font-semibold text-emerald-300">${escape_html(bestWeekdayLabel)}</p> <p class="text-[0.7rem] text-slate-400">Considerando todo o histórico, é quando você tende a render mais.</p></div>`,
      );
    } else {
      $$renderer2.push('<!--[!-->');
      $$renderer2.push(`<p class="text-sm text-slate-400">Complete algumas missões a partir de agora para que o painel comece a
        registrar seu XP diário e mensal. Assim que você ganhar XP, o gráfico
        será atualizado automaticamente.</p>`);
    }
    $$renderer2.push(`<!--]--></div></section>`);
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let tasks = [];
    let areas = [];
    let xpLogs = [];
    let projects = [];
    let goldMultiplier = 1;
    let selectedAreaId = 'all';
    const rarityOrder = ['common', 'rare', 'epic', 'legendary'];
    let selectedRarity = null;
    liveQuery(async () => {
      const rows = await db.tasks.toArray();
      return (rows ?? []).sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });
    });
    liveQuery(() => db.areas.toArray());
    liveQuery(() => db.xpLogs.toArray());
    liveQuery(() => db.projects.toArray());
    const areaMap = areas.reduce(
      (map, area) => {
        if (area.id) map[area.id] = area.nome;
        return map;
      },
      { 0: 'Geral' },
    );
    const projectMap = projects.reduce((map, project) => {
      if (project.id != null) {
        map[project.id] = project.name;
      }
      return map;
    }, {});
    const activeProjects = projects.filter((p) =>
      ['planejando', 'em_andamento', 'pausado'].includes(p.status),
    );
    function computeSuggestedDailyTask() {
      if (!tasks.length) return null;
      const statsByArea = {};
      for (const task of tasks) {
        const anyTask = task;
        if (anyTask.archived) continue;
        const areaId = task.areaId ?? 0;
        let stats = statsByArea[areaId];
        if (!stats) {
          stats = {
            completedCount: 0,
            pendingTasks: [],
            oldestPendingCreatedAt: Number.POSITIVE_INFINITY,
          };
          statsByArea[areaId] = stats;
        }
        const status = getTaskStatus(task);
        if (status === 'completed') {
          stats.completedCount += 1;
        } else {
          stats.pendingTasks.push(task);
          const createdAtValue = task.createdAt;
          const createdAtTime =
            createdAtValue instanceof Date
              ? createdAtValue.getTime()
              : new Date(createdAtValue).getTime();
          if (createdAtTime < stats.oldestPendingCreatedAt) {
            stats.oldestPendingCreatedAt = createdAtTime;
          }
        }
      }
      const candidates = Object.values(statsByArea).filter(
        (stats) => stats.pendingTasks.length > 0,
      );
      if (!candidates.length) return null;
      candidates.sort((a, b) => {
        if (a.completedCount !== b.completedCount) {
          return a.completedCount - b.completedCount;
        }
        if (a.oldestPendingCreatedAt !== b.oldestPendingCreatedAt) {
          return a.oldestPendingCreatedAt - b.oldestPendingCreatedAt;
        }
        return 0;
      });
      const worstAreaStats = candidates[0];
      const sortedPendings = [...worstAreaStats.pendingTasks].sort((t1, t2) => {
        const aVal = t1.createdAt;
        const bVal = t2.createdAt;
        const a =
          aVal instanceof Date ? aVal.getTime() : new Date(aVal).getTime();
        const b =
          bVal instanceof Date ? bVal.getTime() : new Date(bVal).getTime();
        return a - b;
      });
      return sortedPendings[0] ?? null;
    }
    const suggestedDailyTask = computeSuggestedDailyTask();
    function parseYMD(dateStr) {
      const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
      if (!m) return null;
      const y = +m[1],
        mm = +m[2],
        d = +m[3];
      return new Date(y, mm - 1, d);
    }
    function toDateKey(d) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }
    function getFoodRewardForXp(xp) {
      if (!xp || xp <= 0) return 0;
      if (xp <= 25) return 1;
      if (xp <= 50) return 2;
      if (xp <= 75) return 3;
      if (xp <= 100) return 4;
      return 4 + Math.floor((xp - 100) / 50);
    }
    function computeWeeklyStats() {
      const byDay = {};
      for (const log of xpLogs) {
        const key = log.date;
        byDay[key] = (byDay[key] ?? 0) + (log.amount ?? 0);
      }
      const today = /* @__PURE__ */ new Date();
      let totalXp = 0;
      const start = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - 6,
      );
      for (let i = 6; i >= 0; i--) {
        const d = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - i,
        );
        const key = toDateKey(d);
        const dayXp = byDay[key] ?? 0;
        totalXp += dayXp;
      }
      let missions = 0;
      let food = 0;
      for (const log of xpLogs) {
        const d = parseYMD(log.date);
        if (!d) continue;
        const dFloor = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const todayFloor = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
        );
        if (dFloor >= start && dFloor <= todayFloor) {
          const amount = log.amount ?? 0;
          if (amount > 0) {
            missions++;
            food += getFoodRewardForXp(amount);
          }
        }
      }
      const gm = goldMultiplier;
      const gold = Math.floor(Math.max(0, totalXp) * 0.5 * gm);
      return { missions, xp: totalXp, gold, food };
    }
    const weeklyStats = computeWeeklyStats();
    function isReviewEnabled(task) {
      if (!task) return false;
      return task.reviewEnabled === true;
    }
    function computeReviewMissions() {
      const list = [];
      for (const task of tasks) {
        const anyTask = task;
        if (anyTask.archived) continue;
        if (!anyTask.reviewEnabled) continue;
        const interval = Number(anyTask.reviewIntervalDays ?? 0);
        if (!interval || interval <= 0) continue;
        const startedRaw = anyTask.reviewStartedAt ?? task.createdAt;
        if (!startedRaw) continue;
        const started =
          startedRaw instanceof Date ? startedRaw : new Date(startedRaw);
        if (isNaN(started.getTime())) continue;
        const nextReview = new Date(
          started.getFullYear(),
          started.getMonth(),
          started.getDate() + interval,
        );
        list.push({ task, intervalDays: interval, nextReviewDate: nextReview });
      }
      list.sort(
        (a, b) => a.nextReviewDate.getTime() - b.nextReviewDate.getTime(),
      );
      return list;
    }
    const reviewMissions = computeReviewMissions();
    function formatDateShort(d) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      return `${day}/${month}`;
    }
    const rarityColors = {
      common: 'border-slate-600 text-slate-400',
      rare: 'border-blue-500 text-blue-400',
      epic: 'border-purple-500 text-purple-400',
      legendary: 'border-[#ffb74d] text-[#ffb74d]',
    };
    const rarityLabels = {
      common: 'Comum',
      rare: 'Rara',
      epic: 'Épica',
      legendary: 'Lendária',
    };
    const chipBase =
      'px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors';
    const chipOn = {
      common: 'bg-slate-700 text-slate-100 border-slate-400',
      rare: 'bg-blue-500/20 text-blue-300 border-blue-400',
      epic: 'bg-purple-500/20 text-purple-300 border-purple-400',
      legendary: 'bg-[#ffb74d]/20 text-[#ffb74d] border-[#ffb74d]',
    };
    const chipOff = {
      common: 'border-slate-600 text-slate-400 hover:bg-slate-800',
      rare: 'border-blue-500 text-blue-400 hover:bg-blue-950/40',
      epic: 'border-purple-500 text-purple-400 hover:bg-purple-950/40',
      legendary:
        'border-[#ffb74d] text-[#ffb74d] hover:bg[rgba(255,183,77,0.12)]',
    };
    function chipClass(r) {
      const state = selectedRarity === r ? chipOn[r] : chipOff[r];
      return `${chipBase} ${state}`;
    }
    function getTaskStatus(task) {
      const anyTask = task;
      if (anyTask.archived) return 'completed';
      const reviewEnabled = anyTask.reviewEnabled === true;
      if (reviewEnabled) {
        if (anyTask.status === 'todo') return 'todo';
        if (anyTask.status === 'completed') return 'completed';
        return 'available';
      }
      if (task.completed || anyTask.status === 'completed') return 'completed';
      if (anyTask.status === 'todo') return 'todo';
      return 'available';
    }
    let filteredTasks = (() => {
      const base = tasks
        .filter((t) => !t.archived)
        .filter((t) => {
          const status = getTaskStatus(t);
          return status === 'available';
        })
        .filter((t) =>
          selectedAreaId === 'all' ? true : t.areaId === selectedAreaId,
        )
        .filter((t) => true)
        .filter((t) => true);
      {
        return base;
      }
    })();
    const bestWeekdayLabel = (() => {
      if (!xpLogs.length) return '—';
      const byWeekday = [0, 0, 0, 0, 0, 0, 0];
      for (const log of xpLogs) {
        const d = parseYMD(log.date);
        if (!d) continue;
        byWeekday[d.getDay()] += log.amount ?? 0;
      }
      const labels = [
        'Domingo',
        'Segunda',
        'Terça',
        'Quarta',
        'Quinta',
        'Sexta',
        'Sábado',
      ];
      let best = 0;
      for (let i = 1; i < 7; i++) if (byWeekday[i] > byWeekday[best]) best = i;
      return byWeekday[best] === 0 ? '—' : labels[best];
    })();
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      {
        $$renderer3.push('<!--[!-->');
      }
      $$renderer3.push(`<!--]--> `);
      {
        $$renderer3.push('<!--[!-->');
      }
      $$renderer3.push(`<!--]--> <div class="flex flex-col gap-6">`);
      PageTitleCard($$renderer3, {
        title: 'Quadro de Missões',
        subtitle:
          'Complete tarefas para ganhar XP, manter a chama da consistência acesa e evoluir seu herói!',
        iconSrc: '/art/icones/icon-missoes.png',
        align: 'center',
      });
      $$renderer3.push(`<!----> `);
      StatsManager($$renderer3);
      $$renderer3.push(`<!----> `);
      if (suggestedDailyTask) {
        $$renderer3.push('<!--[-->');
        const task = suggestedDailyTask;
        $$renderer3.push(
          `<section class="mx-auto w-full max-w-4xl rounded-2xl border border-emerald-500/60 bg-emerald-950/40 px-4 py-3 shadow-[0_0_20px_rgba(16,185,129,0.35)] flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div class="flex items-start gap-3"><div class="mt-1 hidden h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-2xl md:flex">📌</div> <div><p class="text-[0.65rem] uppercase tracking-[0.22em] text-emerald-300/80">Missão sugerida do dia</p> <h3 class="mt-1 text-sm font-semibold text-emerald-100">${escape_html(task.title)}</h3> <p class="mt-1 text-xs text-emerald-100/80">Foque em <span class="font-semibold">${escape_html(areaMap[task.areaId ?? 0] ?? 'Geral')}</span> para equilibrar suas áreas de foco.</p></div></div> <div class="mt-2 flex items-center gap-3 md:mt-0"><span class="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-3 py-1 text-[0.7rem] font-semibold text-emerald-100">+${escape_html(task.xp)} XP</span> <button type="button" class="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-slate-950 shadow-[0_0_14px_rgba(16,185,129,0.6)] hover:bg-emerald-400 transition-colors">Ver na lista</button></div></section>`,
        );
      } else {
        $$renderer3.push('<!--[!-->');
      }
      $$renderer3.push(
        `<!--]--> <section class="mx-auto w-full max-w-4xl rounded-2xl border border-amber-500/70 bg-slate-950/70 px-4 py-3 shadow-[0_0_26px_rgba(16,185,129,0.65)] flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><p class="text-[0.8rem] uppercase tracking-[0.22em] text-amber-400">Retrospectiva da última semana</p> <p class="mt-1 text-xs text-slate-400">Considerando as missões concluídas (logs de XP) nos últimos 7 dias.</p></div> <div class="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-xs md:mt-0 md:text-right"><div><p class="text-slate-400">Missões concluídas</p> <p class="mt-1 text-base font-semibold text-slate-100">${escape_html(weeklyStats.missions)}</p></div> <div><p class="text-slate-400">XP ganho</p> <p class="mt-1 text-base font-semibold text-[#eec39a]">${escape_html(weeklyStats.xp)}</p></div> <div><p class="text-slate-400">Gold ganho</p> <p class="mt-1 flex items-center justify-center gap-1 text-base font-semibold text-amber-300 md:justify-end">${escape_html(weeklyStats.gold)} <img src="/art/icones/gold-icon.png" alt="Gold" class="h-4 w-4 object-contain"/></p></div> <div><p class="text-slate-400">Comida ganha</p> <p class="mt-1 flex items-center justify-center gap-1 text-base font-semibold text-emerald-300 md:justify-end">${escape_html(weeklyStats.food)} <span class="text-sm">🍖</span></p></div></div></section> <div class="mx-auto flex w-full max-w-4xl flex-col gap-6"><div class="mt-6 grid gap-6 lg:grid-cols-2">`,
      );
      XpByAreaChart($$renderer3);
      $$renderer3.push(`<!----> `);
      SelfComparisonPanel($$renderer3);
      $$renderer3.push(`<!----></div> <section class="mx-auto w-full max-w-4xl rounded-2xl border border-sky-500/60 bg-slate-900/70 px-4 py-3 shadow-[0_0_20px_rgba(56,189,248,0.45)]"><div class="flex items-center justify-between gap-3 mb-2"><div><p class="text-[0.7rem] uppercase tracking-[0.22em] text-sky-300/80">Missões para Revisão</p> <p class="mt-1 text-xs text-slate-400">Missões com revisão ativada, seus intervalos e próxima revisão.</p></div> <span class="rounded-full bg-slate-800/80 px-3 py-1 text-[0.7rem] text-slate-200">${escape_html(reviewMissions.length)}
          ${escape_html(reviewMissions.length === 1 ? ' missão' : ' missões')}</span></div> `);
      if (reviewMissions.length === 0) {
        $$renderer3.push('<!--[-->');
        $$renderer3.push(`<p class="mt-1 text-xs text-slate-500">Nenhuma missão configurada para revisão. Use o ícone de marcador nas
          missões abaixo para definir um intervalo de revisão.</p>`);
      } else {
        $$renderer3.push('<!--[!-->');
        $$renderer3.push(`<div class="mt-3 space-y-2"><!--[-->`);
        const each_array_1 = ensure_array_like(reviewMissions);
        for (
          let $$index_1 = 0, $$length = each_array_1.length;
          $$index_1 < $$length;
          $$index_1++
        ) {
          let item = each_array_1[$$index_1];
          const task = item.task;
          $$renderer3.push(`<div class="flex items-center justify-between gap-3 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs"><div class="min-w-0"><p class="truncate text-slate-100 font-medium">${escape_html(task.title)}</p> <p class="mt-0.5 text-[0.7rem] text-slate-400">Área: ${escape_html(areaMap[task.areaId ?? 0] ?? 'Geral')}</p> <p class="mt-0.5 text-[0.7rem] text-sky-300">Revisar a cada ${escape_html(item.intervalDays)}
                  ${escape_html(item.intervalDays === 1 ? ' dia' : ' dias')} • Próxima revisão:
                  ${escape_html(formatDateShort(item.nextReviewDate))}</p></div> <button type="button" class="shrink-0 rounded-lg bg-sky-500 px-3 py-1 text-[0.7rem] font-semibold text-slate-950 hover:bg-sky-400 transition-colors">Ir para missão</button></div>`);
        }
        $$renderer3.push(`<!--]--></div>`);
      }
      $$renderer3.push(
        `<!--]--></section> <section class="mx-auto w-full max-w-4xl rounded-2xl border border-amber-500/60 bg-slate-900/70 px-4 py-3 shadow-[0_0_20px_rgba(56,189,248,0.45)]"><div class="flex items-center justify-between mb-2 gap-2">`,
      );
      AreaManager($$renderer3, {
        get selectedId() {
          return selectedAreaId;
        },
        set selectedId($$value) {
          selectedAreaId = $$value;
          $$settled = false;
        },
      });
      $$renderer3.push(`<!----> <p class="text-xs text-slate-400">`);
      {
        $$renderer3.push('<!--[!-->');
      }
      $$renderer3.push(`<!--]--></p> `);
      {
        $$renderer3.push('<!--[!-->');
      }
      $$renderer3.push(
        `<!--]--></div> <div class="flex flex-wrap gap-2"><!--[-->`,
      );
      const each_array_2 = ensure_array_like(rarityOrder);
      for (
        let $$index_2 = 0, $$length = each_array_2.length;
        $$index_2 < $$length;
        $$index_2++
      ) {
        let r = each_array_2[$$index_2];
        $$renderer3.push(
          `<button type="button"${attr_class(clsx(chipClass(r)))}${attr('aria-pressed', selectedRarity === r)}${attr('aria-label', `Filtrar por raridade ${rarityLabels[r]}`)}>${escape_html(rarityLabels[r])}</button>`,
        );
      }
      $$renderer3.push(
        `<!--]--></div> <div class="mt-3 flex flex-wrap items-center gap-2"><p class="text-xs text-slate-400">Projeto:</p> <select class="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-100">`,
      );
      $$renderer3.option({ value: 'all' }, ($$renderer4) => {
        $$renderer4.push(`Todos os projetos`);
      });
      $$renderer3.push(`<!--[-->`);
      const each_array_3 = ensure_array_like(activeProjects);
      for (
        let $$index_3 = 0, $$length = each_array_3.length;
        $$index_3 < $$length;
        $$index_3++
      ) {
        let project = each_array_3[$$index_3];
        if (project.id) {
          $$renderer3.push('<!--[-->');
          $$renderer3.option({ value: project.id }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(project.name)}`);
          });
        } else {
          $$renderer3.push('<!--[!-->');
        }
        $$renderer3.push(`<!--]-->`);
      }
      $$renderer3.push(`<!--]--></select> `);
      {
        $$renderer3.push('<!--[!-->');
      }
      $$renderer3.push(
        `<!--]--></div></section> <div class="flex items-center justify-between gap-4 bg-slate-900/50 p-2 rounded-xl border border-slate-800"><div class="flex gap-2"><button${attr_class(
          `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${stringify(
            'bg-blue-500/20 text-blue-300 border border-blue-400/40',
          )}`,
        )}>Disponíveis</button> <button${attr_class(`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${stringify('text-slate-400 hover:bg-slate-800')}`)}>A Fazer</button> <button${attr_class(`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${stringify('text-slate-400 hover:bg-slate-800')}`)}>Concluídas</button></div> <button class="flex items-center gap-2 bg-[#ffb74d] hover:bg-[#ffa726] text-slate-950 px-4 py-2 rounded-lg font-bold text-sm transition-colors"><span>+</span> Nova Missão</button></div> <div class="grid grid-cols-1 gap-3">`,
      );
      if (filteredTasks.length === 0) {
        $$renderer3.push('<!--[-->');
        $$renderer3.push(
          `<div class="text-center py-10 text-slate-500 bg-slate-900/30 rounded-2xl border border-slate-800/50 border-dashed"><p>Nenhuma missão encontrada para esta seleção.</p> <button class="text-sm text-primary hover:underline mt-2">Adicionar uma missão?</button></div>`,
        );
      } else {
        $$renderer3.push('<!--[!-->');
        $$renderer3.push(`<!--[-->`);
        const each_array_4 = ensure_array_like(filteredTasks);
        for (
          let $$index_4 = 0, $$length = each_array_4.length;
          $$index_4 < $$length;
          $$index_4++
        ) {
          let task = each_array_4[$$index_4];
          $$renderer3.push(
            `<div${attr_class(`group flex items-center gap-4 p-4 bg-slate-900/80 border rounded-xl transition-colors ${stringify(rarityColors[task.rarity])} ${stringify(getTaskStatus(task) === 'completed' ? 'opacity-50 grayscale' : 'shadow-md')}`)}><button${attr_class(`shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${stringify(getTaskStatus(task) === 'completed' ? 'bg-green-500/20 border-green-500 text-green-500' : 'border-slate-600 hover:border-[#ffb74d] text-transparent')}`)} aria-label="Completar missão">`,
          );
          if (getTaskStatus(task) === 'completed') {
            $$renderer3.push('<!--[-->');
            $$renderer3.push(`✓`);
          } else {
            $$renderer3.push('<!--[!-->');
          }
          $$renderer3.push(
            `<!--]--></button> <div class="flex-1 min-w-0"><div class="flex items-center gap-2 mb-1 flex-wrap"><span${attr_class(`text-xs font-bold uppercase tracking-wider opacity-70 ${stringify(rarityColors[task.rarity])}`)}>${escape_html(rarityLabels[task.rarity])}</span> <span class="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">${escape_html(areaMap[task.areaId ?? 0] || 'Sem Área')}</span> `,
          );
          if (task.projectId && projectMap[task.projectId]) {
            $$renderer3.push('<!--[-->');
            $$renderer3.push(
              `<span class="text-[0.65rem] px-2 py-0.5 rounded-full bg-emerald-900/40 border border-emerald-500/40 text-emerald-200">${escape_html(projectMap[task.projectId])}</span>`,
            );
          } else {
            $$renderer3.push('<!--[!-->');
          }
          $$renderer3.push(
            `<!--]--> <button type="button"${attr_class(`text-[0.65rem] px-2 py-0.5 rounded-full border transition-colors ${stringify(getTaskStatus(task) === 'todo' ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10' : 'border-slate-600 text-slate-400 hover:border-emerald-400 hover:text-emerald-300')}`)}>A Fazer</button></div> <h3${attr_class(`text-slate-100 font-medium break-words whitespace-pre-line ${stringify(getTaskStatus(task) === 'completed' ? 'line-through' : '')}`)}>${escape_html(task.title)}</h3></div> <div class="shrink-0 flex flex-col items-end gap-1 text-xs"><div class="flex items-center gap-1"><img src="/art/icones/icon-xp.png" alt="XP" class="h-6 w-6 object-contain"/> <span class="text-[#eec39a] font-bold">+${escape_html(task.xp)} XP</span></div> <div class="flex items-center gap-1 text-amber-200"><img src="/art/icones/gold-icon.png" alt="Gold" class="h-6 w-6 object-contain"/> <span class="font-semibold">+${escape_html(Math.floor(task.xp * 0.5 * goldMultiplier))} Gold</span></div> <div class="flex items-center gap-1 text-emerald-200"><span class="text-sm">🍖</span> <span class="font-semibold">+${escape_html(getFoodRewardForXp(task.xp))} Comida</span></div></div> <div class="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">`,
          );
          if (getTaskStatus(task) === 'todo') {
            $$renderer3.push('<!--[-->');
            $$renderer3.push(
              `<button type="button" class="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-sky-300 hover:bg-slate-800 text-xs" aria-label="Subir na ordem" title="Subir na ordem">↑</button> <button type="button" class="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-sky-300 hover:bg-slate-800 text-xs" aria-label="Descer na ordem" title="Descer na ordem">↓</button>`,
            );
          } else {
            $$renderer3.push('<!--[!-->');
          }
          $$renderer3.push(
            `<!--]--> <button class="w-8 h-8 flex items-center justify-center rounded-lg text-sky-400 hover:text-sky-200 hover:bg-slate-800" aria-label="Configurar revisão">`,
          );
          if (isReviewEnabled(task)) {
            $$renderer3.push('<!--[-->');
            $$renderer3.push(`<span title="Revisão ativada">🔖</span>`);
          } else {
            $$renderer3.push('<!--[!-->');
            $$renderer3.push(`<span title="Ativar revisão">🏷️</span>`);
          }
          $$renderer3.push(
            `<!--]--></button> <button class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-primary hover:bg-slate-800" aria-label="Editar">✏️</button> `,
          );
          if (getTaskStatus(task) === 'completed') {
            $$renderer3.push('<!--[-->');
            $$renderer3.push(
              `<button class="w-8 h-8 flex items-center justify-center rounded-lg text-amber-300 hover:text-amber-200 hover:bg-slate-800" aria-label="Voltar para disponível" title="Voltar para disponível (perde XP/Gold, exceto missões de revisão)">↩</button>`,
            );
          } else {
            $$renderer3.push('<!--[!-->');
          }
          $$renderer3.push(
            `<!--]--> <button class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-800" aria-label="Excluir">🗑️</button></div></div>`,
          );
        }
        $$renderer3.push(`<!--]-->`);
      }
      $$renderer3.push(
        `<!--]--></div> <section class="mx-auto w-full max-w-4xl rounded-2xl border border-green-500/60 bg-slate-950/70 px-4 py-3 shadow-[0_0_20px_rgba(56,189,248,0.45)]"><p class="text-center text-[0.65rem] uppercase tracking-[0.18em] text-green-300/80">Dia da semana mais forte</p> <p class="text-center text-lg font-semibold text-emerald-300">${escape_html(bestWeekdayLabel)}</p> <p class="text-[0.7rem] text-slate-400 text-center">Considerando todo o histórico, é quando você tende a render mais.</p></section></div></div>`,
      );
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
  });
}
export { _page as default };
