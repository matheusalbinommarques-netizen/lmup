import 'clsx';
import '../../../chunks/db.js';
import { z as attr_class, x as attr } from '../../../chunks/index.js';
import { e as escape_html } from '../../../chunks/context.js';
async function exportarDados() {
  {
    return;
  }
}
function BaseCard($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const { $$slots, $$events, ...props } = $$props;
    $$renderer2.push(
      `<section${attr_class(`bg-card rounded-xl shadow-lg border border-border/60 p-6 md:p-8 space-y-4 ${props.class ?? ''}`)}>`,
    );
    if (props.title) {
      $$renderer2.push('<!--[-->');
      $$renderer2.push(
        `<header class="flex items-center justify-between"><h2 class="text-xl font-semibold text-text">${escape_html(props.title)}</h2></header>`,
      );
    } else {
      $$renderer2.push('<!--[!-->');
    }
    $$renderer2.push(`<!--]--> <div>`);
    props.children?.($$renderer2);
    $$renderer2.push(`<!----></div></section>`);
  });
}
function BaseButton($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const { $$slots, $$events, ...props } = $$props;
    const variants = {
      primary: 'bg-primary hover:bg-primary/90 text-white',
      secondary: 'bg-card hover:bg-card/80 text-text',
      success: 'bg-green-600 hover:bg-green-700 text-white',
      danger: 'bg-red-600 hover:bg-red-700 text-white',
    };
    const baseClasses =
      'px-4 py-2 rounded-md font-semibold text-sm shadow-md transition-colors duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50';
    const currentVariant = props.variant ?? 'primary';
    $$renderer2.push(
      `<button${attr('type', props.type ?? 'button')}${attr_class(`${baseClasses} ${variants[currentVariant]}`)}${attr('disabled', props.disabled, true)}>`,
    );
    props.children?.($$renderer2);
    $$renderer2.push(`<!----></button>`);
  });
}
function SettingsManager($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    async function handleExportClick() {
      await exportarDados();
    }
    function handleImportClick() {}
    BaseCard($$renderer2, {
      title: 'Configurações & Backup',
      children: ($$renderer3) => {
        $$renderer3.push(
          `<div class="space-y-6"><section class="space-y-2"><h3 class="text-lg font-semibold text-text">Backup de dados</h3> <p class="text-sm text-text-secondary">Exporte seus dados para um arquivo JSON ou importe um backup existente.</p> <div class="flex flex-wrap gap-3">`,
        );
        BaseButton($$renderer3, {
          variant: 'secondary',
          onclick: handleExportClick,
          children: ($$renderer4) => {
            $$renderer4.push(`<!---->Exportar dados`);
          },
          $$slots: { default: true },
        });
        $$renderer3.push(`<!----> `);
        BaseButton($$renderer3, {
          variant: 'secondary',
          onclick: handleImportClick,
          children: ($$renderer4) => {
            $$renderer4.push(`<!---->Importar backup`);
          },
          $$slots: { default: true },
        });
        $$renderer3.push(
          `<!----> <input type="file" accept="application/json" class="hidden"/></div></section></div>`,
        );
      },
      $$slots: { default: true },
    });
  });
}
function _page($$renderer) {
  SettingsManager($$renderer);
}
export { _page as default };
