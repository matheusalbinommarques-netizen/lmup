import 'clsx';
import {
  w as ensure_array_like,
  x as attr,
  y as attr_class,
  z as stringify,
} from '../../chunks/index.js';
import { b as base } from '../../chunks/server.js';
import '@sveltejs/kit/internal/server';
import { e as escape_html } from '../../chunks/context.js';
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
  let { children } = $$props;
  $$renderer.push(
    `<div class="min-h-screen flex flex-col bg-background text-text"><main class="flex-1 px-4 pt-8 pb-24 max-w-3xl mx-auto w-full">`,
  );
  children($$renderer);
  $$renderer.push(`<!----></main> `);
  BottomNav($$renderer, {});
  $$renderer.push(`<!----></div>`);
}
export { _layout as default };
