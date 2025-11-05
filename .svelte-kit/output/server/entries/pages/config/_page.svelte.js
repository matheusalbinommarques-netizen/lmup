import 'clsx';
import 'dexie';
import { B as BaseCard, a as BaseButton } from '../../../chunks/BaseCard.js';
async function exportarDados() {
  return;
}
async function importarDados() {
  return;
}
function SettingsManager($$renderer) {
  BaseCard($$renderer, {
    children: ($$renderer2) => {
      $$renderer2.push(`<h2 class="text-2xl font-semibold text-center text-text mb-6">Configurações</h2> <div class="space-y-6"><div class="setting-item p-4 bg-background border border-border rounded-lg"><div class="text-lg font-semibold text-text-secondary">Backup e Restauração</div> <p class="text-sm text-text-secondary mt-1 mb-4">Exporte seus dados (áreas, itens, XP) como um arquivo JSON. Você pode
        importá-lo de volta mais tarde ou em outro dispositivo.</p> <div class="actions flex flex-col md:flex-row gap-4">`);
      BaseButton($$renderer2, {
        onclick: exportarDados,
        variant: 'primary',
        children: ($$renderer3) => {
          $$renderer3.push(`<!---->Exportar Dados (JSON)`);
        },
        $$slots: { default: true },
      });
      $$renderer2.push(`<!----> `);
      BaseButton($$renderer2, {
        onclick: importarDados,
        variant: 'danger',
        children: ($$renderer3) => {
          $$renderer3.push(`<!---->Importar Dados (JSON)`);
        },
        $$slots: { default: true },
      });
      $$renderer2.push(`<!----></div></div></div>`);
    },
    $$slots: { default: true },
  });
}
function _page($$renderer) {
  SettingsManager($$renderer);
}
export { _page as default };
