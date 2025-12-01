import 'clsx';
import {
  x as attr,
  z as attr_style,
  w as ensure_array_like,
  y as attr_class,
  F as stringify,
  G as clsx,
} from '../../../chunks/index2.js';
import { d as db, P as PageTitleCard } from '../../../chunks/PageTitleCard.js';
import { liveQuery } from 'dexie';
import { e as escape_html } from '../../../chunks/context.js';
const ECO_STAGES = [
  {
    id: 1,
    label: 'Semente',
    image: '/art/bg/eco-stage-1-seed.webp',
    minXp: 0,
    maxXp: 2500,
    xpBonusMultiplier: 1,
    goldRewardOnEnter: 0,
  },
  {
    id: 2,
    label: 'Brotinho',
    image: '/art/bg/eco-stage-2-sprout.webp',
    minXp: 2500,
    maxXp: 7500,
    xpBonusMultiplier: 1.05,
    goldRewardOnEnter: 200,
  },
  {
    id: 3,
    label: 'Árvore Jovem',
    image: '/art/bg/eco-stage-3-tree.webp',
    minXp: 7500,
    maxXp: 12e3,
    xpBonusMultiplier: 1.1,
    goldRewardOnEnter: 500,
  },
  {
    id: 4,
    label: 'Floresta Anciã',
    image: '/art/bg/eco-stage-4-forest.webp',
    minXp: 12e3,
    maxXp: null,
    xpBonusMultiplier: 1.2,
    goldRewardOnEnter: 1e3,
  },
];
function getEcoStageForTotalXp(totalXp) {
  let current = ECO_STAGES[0];
  for (const stage of ECO_STAGES) {
    if (totalXp >= stage.minXp) {
      current = stage;
    } else {
      break;
    }
  }
  return current;
}
function getEcoProgressForTotalXp(totalXp) {
  const stage = getEcoStageForTotalXp(totalXp);
  if (stage.maxXp == null) {
    return 100;
  }
  const clamped = Math.max(stage.minXp, Math.min(totalXp, stage.maxXp));
  const range = stage.maxXp - stage.minXp;
  if (range <= 0) return 100;
  const progress = ((clamped - stage.minXp) / range) * 100;
  return Math.max(0, Math.min(100, progress));
}
function EcoPanel($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const fallbackProfile = {
      totalXpEarned: 0,
    };
    const hero = fallbackProfile;
    let areas = [];
    let xpLogs = [];
    liveQuery(() => db.profile.get(1));
    liveQuery(() => db.areas.toArray());
    liveQuery(() => db.xpLogs.toArray());
    const totalXp = hero.totalXpEarned;
    const ecoStage = getEcoStageForTotalXp(totalXp);
    const ecoProgress = getEcoProgressForTotalXp(totalXp);
    const baseEcoBonusPercent = Math.round(
      ((ecoStage.xpBonusMultiplier ?? 1) - 1) * 100,
    );
    const ecoBonusExtraFromGear = 0;
    const ecoBonusTotalPercent = Math.max(
      0,
      baseEcoBonusPercent + ecoBonusExtraFromGear,
    );
    const ecoGoldClaimedUpToStage = (() => {
      const meta = hero;
      const raw = meta?.ecoGoldClaimedUpToStage;
      if (typeof raw === 'number' && raw >= 1) {
        return raw;
      }
      return 1;
    })();
    const ecoStagesWithStatus = (() => {
      const current = ecoStage;
      const claimedUpTo = ecoGoldClaimedUpToStage;
      return ECO_STAGES.map((stage) => {
        let status;
        if (stage.id <= claimedUpTo) {
          status = 'claimed';
        } else if (stage.id <= current.id) {
          status = 'available';
        } else {
          status = 'locked';
        }
        return { ...stage, status };
      });
    })();
    const topAreas = (() => {
      if (!xpLogs.length) return [];
      const now = /* @__PURE__ */ new Date();
      const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1e3;
      const cutoff = new Date(now.getTime() - THIRTY_DAYS_MS);
      const sumByArea = {};
      for (const log of xpLogs) {
        const amount = Number(log.amount) || 0;
        if (amount <= 0) continue;
        let createdAt;
        if (log.createdAt instanceof Date) {
          createdAt = log.createdAt;
        } else if (typeof log.createdAt === 'string') {
          createdAt = new Date(log.createdAt);
        } else if (typeof log.date === 'string') {
          createdAt = new Date(log.date);
        } else {
          continue;
        }
        if (createdAt.getTime() < cutoff.getTime()) continue;
        const rawId = log.areaId ?? 0;
        const areaId = Number.isFinite(rawId) ? rawId : 0;
        sumByArea[areaId] = (sumByArea[areaId] ?? 0) + amount;
      }
      const entries = Object.entries(sumByArea).map(([idStr, total]) => {
        const areaId = Number(idStr);
        const areaObj = areas.find((a) => a.id === areaId);
        const name =
          areaId === 0
            ? 'Geral'
            : areaObj?.nome?.trim() || `Área #${areaId.toString()}`;
        return { areaId, name, totalXp: total };
      });
      if (!entries.length) return [];
      const totalAll = entries.reduce((acc, e) => acc + e.totalXp, 0) || 1;
      entries.sort((a, b) => b.totalXp - a.totalXp);
      return entries
        .slice(0, 3)
        .map((e) => ({
          ...e,
          percentOfTotal: Math.round((e.totalXp / totalAll) * 100),
        }));
    })();
    $$renderer2.push(
      `<section class="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-lg relative overflow-hidden flex flex-col gap-5"><div class="flex flex-col gap-4 md:flex-row"><div class="md:w-2/3 flex flex-col gap-3"><img${attr('src', ecoStage.image)}${attr('alt', ecoStage.label)} class="w-full h-68 object-cover rounded-lg border border-slate-700/50 shadow-inner"/> <div><div class="flex items-center justify-between text-xs text-slate-400 mb-1"><span class="font-medium text-slate-300">Estágio do Santuário: <span class="text-emerald-300">${escape_html(ecoStage.label)}</span></span> <span class="inline-flex items-center gap-1 font-medium text-slate-200"><img src="/art/icones/icon-xp.png" alt="XP" class="h-4 w-4 object-contain"/> `,
    );
    if (ecoStage.maxXp != null) {
      $$renderer2.push('<!--[-->');
      $$renderer2.push(`<span>${escape_html(totalXp.toLocaleString())} /
                ${escape_html(ecoStage.maxXp.toLocaleString())}</span>`);
    } else {
      $$renderer2.push('<!--[!-->');
      $$renderer2.push(
        `<span>${escape_html(totalXp.toLocaleString())} (Máx)</span>`,
      );
    }
    $$renderer2.push(`<!--]--></span></div> <div class="h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800/50"><div class="h-full bg-gradient-to-r from-green-600 to-emerald-400 transition-all duration-500"${attr_style(`width: ${Math.max(0, Math.min(100, ecoProgress)).toFixed(1)}%;`)}></div></div> <p class="mt-1 text-[0.7rem] text-slate-400">Progresso dentro do estágio atual do Santuário. O bônus de XP aumenta
          conforme você evolui — e pode ser turbinado por anéis especiais.</p></div></div> <aside class="md:w-1/3 flex flex-col gap-3"><div class="rounded-xl border border-emerald-500/40 bg-slate-950/70 px-3 py-3 flex flex-col gap-2"><h3 class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Bênçãos do Santuário</h3> <p class="text-[0.8rem] text-slate-200">Bônus permanente de XP: <span class="font-semibold text-emerald-300">+${escape_html(ecoBonusTotalPercent)}%</span> em todas as missões.</p> <p class="text-[0.7rem] text-slate-400">O bônus é aplicado automaticamente sempre que você ganha XP. Ouro é
          calculado em cima do XP final, então o Santuário também turbina seu
          Gold.</p> `);
    {
      $$renderer2.push('<!--[!-->');
    }
    $$renderer2.push(
      `<!--]--> <div class="mt-2 space-y-1.5 text-[0.7rem]"><!--[-->`,
    );
    const each_array = ensure_array_like(ECO_STAGES);
    for (
      let $$index = 0, $$length = each_array.length;
      $$index < $$length;
      $$index++
    ) {
      let stage = each_array[$$index];
      $$renderer2.push(
        `<div class="flex items-center justify-between gap-2"><div class="flex items-center gap-2"><span${attr_class(`inline-flex h-5 w-5 items-center justify-center rounded-full border text-[0.6rem] ${stringify(ecoStage.id >= stage.id ? 'border-emerald-400 text-emerald-300 bg-emerald-950/60' : 'border-slate-700 text-slate-400 bg-slate-900')}`)}>${escape_html(stage.id)}</span> <span${attr_class(`font-medium ${stringify(ecoStage.id >= stage.id ? 'text-slate-100' : 'text-slate-400')}`)}>${escape_html(stage.label)}</span></div> <span class="text-slate-400">+${escape_html(Math.round((stage.xpBonusMultiplier - 1) * 100))}% XP base</span></div>`,
      );
    }
    $$renderer2.push(`<!--]--></div></div> <div class="rounded-xl border border-amber-500/40 bg-slate-950/70 px-3 py-3 flex flex-col gap-2"><h3 class="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">Recompensas do Santuário</h3> <p class="text-[0.7rem] text-slate-300">Ao alcançar cada estágio, você já recebeu (ou receberá) um baú único
          de Gold:</p> <div class="mt-1 space-y-1.5 text-[0.7rem]"><!--[-->`);
    const each_array_1 = ensure_array_like(ecoStagesWithStatus);
    for (
      let $$index_1 = 0, $$length = each_array_1.length;
      $$index_1 < $$length;
      $$index_1++
    ) {
      let stage = each_array_1[$$index_1];
      $$renderer2.push(
        `<div class="flex items-center justify-between gap-2"><div class="flex items-center gap-2"><span class="text-base">`,
      );
      if (stage.status === 'claimed') {
        $$renderer2.push('<!--[-->');
        $$renderer2.push(`✅`);
      } else {
        $$renderer2.push('<!--[!-->');
        if (stage.status === 'available') {
          $$renderer2.push('<!--[-->');
          $$renderer2.push(`🎁`);
        } else {
          $$renderer2.push('<!--[!-->');
          $$renderer2.push(`🔒`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(
        `<!--]--></span> <span${attr_class(`font-medium ${stringify(stage.status === 'locked' ? 'text-slate-500' : 'text-slate-100')}`)}>${escape_html(stage.label)}</span></div> <span${attr_class(clsx(stage.status === 'claimed' ? 'text-amber-300' : stage.status === 'available' ? 'text-amber-200' : 'text-slate-500'))}>+${escape_html(stage.goldRewardOnEnter)} Gold</span></div>`,
      );
    }
    $$renderer2.push(`<!--]--></div> <p class="mt-1 text-[0.65rem] text-slate-500">Essas recompensas são automáticas e só são dadas uma vez por estágio,
          mesmo que você saia e volte do jogo.</p></div></aside></div> <div class="mt-1 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 flex flex-col gap-2"><div class="flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between"><h3 class="text-sm font-semibold text-slate-100">🌱 Árvore de Área em Destaque</h3> <p class="text-[0.7rem] text-slate-400 md:max-w-md">Mostra quais áreas mais alimentaram o Santuário nos últimos ~30 dias.
        Quanto mais XP uma área gera, mais ela "rega" sua floresta.</p></div> `);
    if (topAreas.length > 0) {
      $$renderer2.push('<!--[-->');
      $$renderer2.push(`<div class="mt-2 space-y-2"><!--[-->`);
      const each_array_2 = ensure_array_like(topAreas);
      for (
        let $$index_2 = 0, $$length = each_array_2.length;
        $$index_2 < $$length;
        $$index_2++
      ) {
        let area = each_array_2[$$index_2];
        $$renderer2.push(
          `<div class="space-y-1"><div class="flex items-center justify-between text-[0.75rem]"><span class="font-medium text-slate-100">${escape_html(area.name)}</span> <span class="text-slate-400">+${escape_html(area.totalXp.toLocaleString())} XP <span class="text-slate-500">• ${escape_html(area.percentOfTotal)}%</span></span></div> <div class="h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800/60"><div class="h-full bg-gradient-to-r from-emerald-500 to-emerald-300"${attr_style(`width: ${Math.max(5, Math.min(100, area.percentOfTotal))}%;`)}></div></div></div>`,
        );
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push('<!--[!-->');
      $$renderer2.push(`<p class="mt-2 text-[0.7rem] text-slate-500">Ainda não há XP suficiente registrado para destacar áreas. Complete
        algumas missões para começar a ver a floresta ganhar forma.</p>`);
    }
    $$renderer2.push(`<!--]--></div></section>`);
  });
}
function _page($$renderer) {
  $$renderer.push(`<div class="flex flex-col gap-6">`);
  PageTitleCard($$renderer, {
    title: 'Santuário da Natureza',
    subtitle:
      'Conclua missões e ganhe experiência, e seu santuário florescerá para uma floresta vigorosa!',
    iconSrc: '/art/icones/ritual-restauracao.png',
    align: 'center',
  });
  $$renderer.push(`<!----> `);
  EcoPanel($$renderer);
  $$renderer.push(`<!----></div>`);
}
export { _page as default };
