import {
  w as ensure_array_like,
  x as attr,
  y as attr_class,
  z as stringify,
} from '../../chunks/index2.js';
import { b as base } from '../../chunks/server.js';
import '@sveltejs/kit/internal/server';
import { e as escape_html } from '../../chunks/context.js';
import '@sveltejs/kit/internal';
import '../../chunks/exports.js';
import '../../chunks/utils.js';
import '../../chunks/state.svelte.js';
function BottomNav($$renderer, $$props) {
  let { currentPath = '/' } = $$props;
  const items = [
    { path: '/', href: `${base}/`, label: 'Progresso', icon: '🏠' },
    {
      path: '/config',
      href: `${base}/config`,
      label: 'Configurações',
      icon: '⚙️',
    },
  ];
  $$renderer.push(
    `<nav class="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60"><ul class="mx-auto max-w-3xl grid grid-cols-2"><!--[-->`,
  );
  const each_array = ensure_array_like(items);
  for (
    let $$index = 0, $$length = each_array.length;
    $$index < $$length;
    $$index++
  ) {
    let item = each_array[$$index];
    $$renderer.push(
      `<li><a${attr('href', item.href)}${attr('aria-current', currentPath === item.path ? 'page' : void 0)}${attr_class(`flex flex-col items-center gap-1 py-3 text-sm ${stringify(currentPath === item.path ? 'text-primary font-semibold' : 'text-text-secondary')}`)}><span>${escape_html(item.icon)}</span> <span>${escape_html(item.label)}</span></a></li>`,
    );
  }
  $$renderer.push(`<!--]--></ul></nav>`);
}
function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { children } = $$props;
    let currentPath = '/';
    $$renderer2.push(
      `<main class="max-w-3xl mx-auto p-4 md:p-6 pb-24"><header class="text-center py-6"><h1 class="text-primary text-4xl font-bold">Level Me Up!</h1></header> <nav class="flex gap-6 mb-6 border-b-2 border-border"><a${attr(
        'href',
        // mantém currentPath sincronizado com o store `page`
        `${base}/`,
      )}${attr_class(
        `py-2 text-lg font-semibold ${stringify(
          'text-primary border-b-2 border-primary -mb-0.5',
        )}`,
      )}>Progresso</a> <a${attr('href', `${base}/config`)}${attr_class(`py-2 text-lg font-semibold ${stringify('text-text-secondary')}`)}>Configurações</a></nav> `,
    );
    children?.($$renderer2);
    $$renderer2.push(`<!----></main> `);
    BottomNav($$renderer2, { currentPath });
    $$renderer2.push(`<!---->`);
  });
}
export { _layout as default };
