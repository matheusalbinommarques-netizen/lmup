import { K as head, y as attr_class } from '../../../chunks/index2.js';
import { liveQuery } from 'dexie';
import { d as db, P as PageTitleCard } from '../../../chunks/PageTitleCard.js';
import {
  g as getProjectDifficultyInfoForTasks,
  a as getProjectBaseXp,
} from '../../../chunks/projectService.js';
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let projects = [];
    let tasks = [];
    liveQuery(() => db.projects.toArray());
    liveQuery(() => db.tasks.toArray());
    liveQuery(() => db.profile.get(1));
    const STATUS_ORDER = {
      em_andamento: 0,
      planejando: 1,
      pausado: 2,
      concluido: 3,
      arquivado: 4,
    };
    const DIFFICULTY_UI = {
      none: {
        label: 'Sem missões',
        range: '0 missões',
        classes: 'border-slate-600 text-slate-300 bg-slate-900/80',
      },
      facil: {
        label: 'Fácil',
        range: '1–2 missões',
        classes: 'border-emerald-400 text-emerald-200 bg-emerald-900/40',
      },
      media: {
        label: 'Média',
        range: '3–4 missões',
        classes: 'border-sky-400 text-sky-200 bg-sky-900/40',
      },
      dificil: {
        label: 'Difícil',
        range: '5–9 missões',
        classes: 'border-purple-400 text-purple-200 bg-purple-900/40',
      },
      expert: {
        label: 'Expert',
        range: '10+ missões',
        classes: 'border-[#ffb74d] text-[#ffb74d] bg-[rgba(255,183,77,0.12)]',
      },
    };
    function isTaskCompleted(task) {
      const anyTask = task;
      if (anyTask.archived) return true;
      if (task.completed) return true;
      if (anyTask.status === 'completed') return true;
      return false;
    }
    const activeStatuses = ['planejando', 'em_andamento', 'pausado'];
    const sanctuaryMultiplier = /* @__PURE__ */ (() => {
      return 1;
    })();
    const projectsWithStats = (() => {
      return projects.map((project) => {
        if (!project.id) {
          return {
            project,
            totalTasks: 0,
            completedTasks: 0,
            completionPercent: 0,
            difficulty: DIFFICULTY_UI.none,
            baseXp: 0,
            bonusXpBase: 0,
            bonusXpPercent: 0,
            bonusXpWithSanctuary: 0,
            bonusGoldWithSanctuary: 0,
          };
        }
        const relatedTasks = tasks.filter(
          (t) => t.projectId === project.id && !t.archived,
        );
        const totalTasks = relatedTasks.length;
        const completedTasks = relatedTasks.filter((t) =>
          isTaskCompleted(t),
        ).length;
        const completionPercent =
          totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        const projectDiffInfo = getProjectDifficultyInfoForTasks(relatedTasks);
        const difficultyKey = projectDiffInfo.difficultyKey ?? 'none';
        const difficulty = DIFFICULTY_UI[difficultyKey];
        const baseXp = Number(getProjectBaseXp(relatedTasks) ?? 0);
        const bonusXpBase = Math.floor(
          Number(baseXp) * Number(projectDiffInfo.bonusXpFraction ?? 0),
        );
        const bonusXpWithSanctuary = Math.round(
          Number(bonusXpBase) * Number(sanctuaryMultiplier),
        );
        const bonusGoldWithSanctuary = Math.floor(
          Math.abs(Number(bonusXpWithSanctuary)) * 0.5,
        );
        return {
          project,
          totalTasks,
          completedTasks,
          completionPercent,
          difficulty,
          baseXp,
          bonusXpBase,
          bonusXpPercent: projectDiffInfo.bonusXpPercent ?? 0,
          bonusXpWithSanctuary,
          bonusGoldWithSanctuary,
        };
      });
    })();
    (() => {
      const filtered = projectsWithStats.filter(({ project }) => {
        {
          return activeStatuses.includes(project.status);
        }
      });
      const copy = [...filtered];
      copy.sort((a, b) => {
        const orderA = STATUS_ORDER[a.project.status] ?? 99;
        const orderB = STATUS_ORDER[b.project.status] ?? 99;
        if (orderA !== orderB) return orderA - orderB;
        const aCreated = a.project.createdAt
          ? new Date(a.project.createdAt).getTime()
          : 0;
        const bCreated = b.project.createdAt
          ? new Date(b.project.createdAt).getTime()
          : 0;
        return aCreated - bCreated;
      });
      return copy;
    })();
    head('16dim71', $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Projetos do Herói • Level Me Up</title>`);
      });
    });
    $$renderer2.push(`<div class="flex flex-col gap-6">`);
    PageTitleCard($$renderer2, {
      title: 'Projetos do Herói',
      subtitle:
        'Enxergue suas grandes Sagas, quantas missões cada uma carrega e o quão desafiadoras elas são.',
      iconSrc: '/art/icones/icon-projetos.png',
      align: 'center',
    });
    $$renderer2.push(`<!----> <section class="mx-auto flex w-full max-w-5xl flex-col gap-4 rounded-3xl border border-amber-500/70 bg-slate-950/80 px-5 py-4 shadow-[0_0_32px_rgba(245,158,11,0.45)]"><header class="flex flex-wrap items-center justify-between gap-3"><div><p class="text-[0.7rem] uppercase tracking-[0.22em] text-amber-300/80">Visão geral das Sagas</p> <p class="mt-1 text-xs text-slate-300">Dificuldade é baseada na quantidade de missões ligadas ao projeto e
          define o bônus de XP ao concluir a Saga.</p></div> <div class="flex flex-col items-end gap-2"><div class="flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900/80 p-1 text-[0.7rem]"><button type="button"${attr_class(`rounded-full px-3 py-1 font-semibold transition-colors ${'bg-emerald-500 text-slate-950'}`)}>Ativos</button> <button type="button"${attr_class(`rounded-full px-3 py-1 font-semibold transition-colors ${'text-slate-300 hover:bg-slate-800'}`)}>Concluídos</button> <button type="button"${attr_class(`rounded-full px-3 py-1 font-semibold transition-colors ${'text-slate-300 hover:bg-slate-800'}`)}>Todos</button></div> <button type="button" class="mt-1 inline-flex items-center rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-slate-950 hover:bg-emerald-400">Novo projeto</button></div></header> `);
    {
      $$renderer2.push('<!--[-->');
      $$renderer2.push(
        `<div class="mt-4 flex items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-8 text-sm text-slate-300">Carregando projetos...</div>`,
      );
    }
    $$renderer2.push(`<!--]--></section> `);
    {
      $$renderer2.push('<!--[!-->');
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
export { _page as default };
