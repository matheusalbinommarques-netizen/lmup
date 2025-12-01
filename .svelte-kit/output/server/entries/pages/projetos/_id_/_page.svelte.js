import { K as head } from '../../../../chunks/index2.js';
import 'dexie';
import { P as PageTitleCard } from '../../../../chunks/PageTitleCard.js';
import {
  a as getProjectBaseXp,
  g as getProjectDifficultyInfoForTasks,
} from '../../../../chunks/projectService.js';
import { e as escape_html } from '../../../../chunks/context.js';
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    data.projectId ?? null;
    let tasks = [];
    function isTaskCompleted(task) {
      const anyTask = task;
      if (anyTask.archived) return true;
      if (task.completed) return true;
      if (anyTask.status === 'completed') return true;
      return false;
    }
    const activeProjectTasks = tasks.filter((t) => !t.archived);
    activeProjectTasks.length;
    activeProjectTasks.filter((t) => isTaskCompleted(t)).length;
    Number(getProjectBaseXp(activeProjectTasks) ?? 0);
    getProjectDifficultyInfoForTasks(activeProjectTasks);
    const pageTitle = 'Projeto inválido • Projetos do Herói';
    head('14afoed', $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>${escape_html(pageTitle)}</title>`);
      });
    });
    $$renderer2.push(`<div class="flex flex-col gap-6">`);
    PageTitleCard($$renderer2, {
      title: 'Projeto inválido',
      subtitle: 'Não foi possível localizar este projeto.',
      align: 'center',
    });
    $$renderer2.push(`<!----> `);
    {
      $$renderer2.push('<!--[-->');
      $$renderer2.push(
        `<section class="mx-auto w-full max-w-4xl rounded-3xl border border-slate-800 bg-slate-950/80 px-5 py-6 text-center text-sm text-slate-200">Carregando projeto...</section>`,
      );
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
export { _page as default };
