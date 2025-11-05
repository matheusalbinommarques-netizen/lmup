import 'clsx';
import {
  U as attr,
  Y as ensure_array_like,
  Z as attr_style,
  _ as stringify,
} from '../../chunks/index2.js';
import 'dexie';
import { B as BaseCard, a as BaseButton } from '../../chunks/BaseCard.js';
import { BehaviorSubject } from 'rxjs';
import { e as escape_html } from '../../chunks/context.js';
const XP_POR_NIVEL_BASE = 100;
const FATOR_CRESCIMENTO = 1.5;
new BehaviorSubject(0);
new BehaviorSubject({ count: 0, lastCheckin: null });
function calcularNivel(xp) {
  let nivel = 0;
  let xpParaProximoNivel = XP_POR_NIVEL_BASE;
  let xpAcumulado = 0;
  while (xp >= xpAcumulado + xpParaProximoNivel) {
    xpAcumulado += xpParaProximoNivel;
    nivel++;
    xpParaProximoNivel = Math.floor(xpParaProximoNivel * FATOR_CRESCIMENTO);
  }
  const xpAtualNesteNivel = xp - xpAcumulado;
  const progresso = (xpAtualNesteNivel / xpParaProximoNivel) * 100;
  return {
    nivel,
    progresso,
    xpAtualNesteNivel,
    xpParaProximoNivel,
  };
}
function ItemManager($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { area } = $$props;
    let newItemName = '';
    let items = [];
    async function handleCompleteItem(item) {
      return;
    }
    BaseCard($$renderer2, {
      children: ($$renderer3) => {
        $$renderer3.push(
          `<h3 class="text-xl font-semibold text-center text-text mb-4">${escape_html(area.nome)}</h3> <form class="flex gap-2 mb-4"><input type="text" placeholder="Nome do novo item (ex: Estudar Svelte 5)"${attr('value', newItemName)} class="flex-grow bg-background border border-border text-text rounded-md p-2 focus:ring-2 focus:ring-primary focus:outline-none"/> `,
        );
        BaseButton($$renderer3, {
          type: 'submit',
          variant: 'primary',
          children: ($$renderer4) => {
            $$renderer4.push(`<!---->Adicionar Item`);
          },
          $$slots: { default: true },
        });
        $$renderer3.push(
          `<!----></form> <div class="item-list flex flex-col gap-3">`,
        );
        if (items.length > 0) {
          $$renderer3.push('<!--[-->');
          $$renderer3.push(`<!--[-->`);
          const each_array = ensure_array_like(items);
          for (
            let $$index = 0, $$length = each_array.length;
            $$index < $$length;
            $$index++
          ) {
            let item = each_array[$$index];
            $$renderer3.push(
              `<div class="item flex justify-between items-center p-3 bg-background rounded-md border border-border"><span class="text-text">${escape_html(item.nome)} <span class="text-sm text-text-secondary ml-2">(+${escape_html(item.xp)} XP)</span></span> `,
            );
            BaseButton($$renderer3, {
              onclick: () => handleCompleteItem(),
              variant: 'success',
              class: 'py-1 px-3 text-sm',
              children: ($$renderer4) => {
                $$renderer4.push(`<!---->Completar`);
              },
              $$slots: { default: true },
            });
            $$renderer3.push(`<!----></div>`);
          }
          $$renderer3.push(`<!--]-->`);
        } else {
          $$renderer3.push('<!--[!-->');
          $$renderer3.push(
            `<p class="empty-message text-center text-text-secondary p-4">Nenhum item cadastrado para esta área.</p>`,
          );
        }
        $$renderer3.push(`<!--]--></div>`);
      },
      $$slots: { default: true },
    });
  });
}
function AreaManager($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let newAreaName = '';
    let areas = [];
    $$renderer2.push(
      `<div class="area-manager"><form class="add-form flex gap-2 mb-6 p-4 bg-card border border-border rounded-lg shadow"><input type="text" placeholder="Nome da nova área (ex: SvelteKit, Finanças)"${attr('value', newAreaName)} class="flex-grow bg-background border border-border text-text rounded-md p-2 focus:ring-2 focus:ring-primary focus:outline-none"/> `,
    );
    BaseButton($$renderer2, {
      type: 'submit',
      variant: 'primary',
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->Adicionar Área`);
      },
      $$slots: { default: true },
    });
    $$renderer2.push(
      `<!----></form> <div class="area-list flex flex-col gap-6">`,
    );
    if (areas.length > 0) {
      $$renderer2.push('<!--[-->');
      $$renderer2.push(`<!--[-->`);
      const each_array = ensure_array_like(areas);
      for (
        let $$index = 0, $$length = each_array.length;
        $$index < $$length;
        $$index++
      ) {
        let area = each_array[$$index];
        ItemManager($$renderer2, { area });
      }
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push('<!--[!-->');
      $$renderer2.push(
        `<p class="empty-message text-center text-text-secondary p-6">Nenhuma área de foco cadastrada. Crie uma acima para começar!</p>`,
      );
    }
    $$renderer2.push(`<!--]--></div></div>`);
  });
}
function StatsManager($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let totalXp = 0;
    let streak = { count: 0 };
    let stats = calcularNivel(totalXp);
    $$renderer2.push(
      `<div class="stats-manager bg-card border border-border rounded-lg p-4 md:p-6 shadow-lg mb-6 flex flex-col md:flex-row justify-between items-center gap-4"><div class="stat-item flex flex-col items-center min-w-[80px]"><span class="label text-xs font-semibold text-text-secondary uppercase mb-1">NÍVEL</span> <span class="value text-3xl font-bold text-primary">${escape_html(stats.nivel)}</span></div> <div class="xp-bar-container w-full flex-grow flex flex-col items-center"><span class="label text-xs font-semibold text-text-secondary uppercase mb-1">XP TOTAL: ${escape_html(totalXp)}</span> <div class="xp-bar w-full h-3 bg-background border border-border rounded-full overflow-hidden mb-1"><div class="xp-progress h-full bg-success transition-all duration-300 ease-out"${attr_style(`width: ${stringify(stats.progresso)}%;`)}></div></div> <span class="progress-label text-xs text-text-secondary font-medium">${escape_html(stats.xpAtualNesteNivel)} / ${escape_html(stats.xpParaProximoNivel)} XP</span></div> <div class="stat-item flex flex-col items-center min-w-[80px]"><span class="label text-xs font-semibold text-text-secondary uppercase mb-1">STREAK</span> <span class="value text-3xl font-bold text-danger">🔥 ${escape_html(streak.count)}</span></div></div>`,
    );
  });
}
function _page($$renderer) {
  StatsManager($$renderer);
  $$renderer.push(`<!----> `);
  AreaManager($$renderer);
  $$renderer.push(`<!---->`);
}
export { _page as default };
