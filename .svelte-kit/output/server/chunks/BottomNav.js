import {
  y as ensure_array_like,
  x as attr,
  z as attr_class,
  F as stringify,
} from './index.js';
import { p as page } from './index2.js';
import { e as escape_html } from './context.js';
function BottomNav($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const pathname = page.url.pathname;
    const items = [
      { href: '/', label: 'Progresso', icon: 'home' },
      { href: '/config', label: 'Configurações', icon: 'settings' },
    ];
    const isActive = (href) => pathname === href;
    $$renderer2.push(
      `<nav class="nav-wood fixed bottom-0 inset-x-0 z-40"><div class="section"><div class="flex items-center justify-around py-3"><!--[-->`,
    );
    const each_array = ensure_array_like(items);
    for (
      let $$index = 0, $$length = each_array.length;
      $$index < $$length;
      $$index++
    ) {
      let it = each_array[$$index];
      $$renderer2.push(
        `<a${attr('href', it.href)} class="flex flex-col items-center gap-1"${attr('aria-current', isActive(it.href) ? 'page' : void 0)}><div${attr_class(`nav-btn ${stringify(isActive(it.href) ? 'nav-active' : '')}`)}>`,
      );
      if (it.icon === 'home') {
        $$renderer2.push('<!--[-->');
        $$renderer2.push(
          `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5M5 10v10h14V10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`,
        );
      } else {
        $$renderer2.push('<!--[!-->');
        $$renderer2.push(
          `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" stroke="currentColor" stroke-width="2"></path><path d="M19.4 15a1 1 0 0 1 .2 1.1l-1.2 2a1 1 0 0 1-1.1.5l-2.2-.6a7.9 7.9 0 0 1-1.9 1.1l-.3 2.2a1 1 0 0 1-1 .9h-2.4a1 1 0 0 1-1-.9l-.3-2.2a7.9 7.9 0 0 1-1.9-1.1l-2.2.6a1 1 0 0 1-1.1-.5l-1.2-2a1 1 0 0 1 .2-1.1l1.7-1.5a8.4 8.4 0 0 1 0-2.3L2.9 9.7a1 1 0 0 1-.2-1.1l1.2-2a1 1 0 0 1 1.1-.5l2.2.6c.6-.4 1.2-.8 1.9-1.1l.3-2.2a1 1 0 0 1 1-.9h2.4a1 1 0 0 1 1 .9l.3 2.2c.7.3 1.3.7 1.9 1.1l2.2-.6a1 1 0 0 1 1.1.5l1.2 2a1 1 0 0 1-.2 1.1l-1.7 1.5c.1.8.1 1.5 0 2.3l1.7 1.5Z" stroke="currentColor" stroke-width="2"></path></svg>`,
        );
      }
      $$renderer2.push(
        `<!--]--></div> <span class="text-[11px] font-medium opacity-90">${escape_html(it.label)}</span></a>`,
      );
    }
    $$renderer2.push(`<!--]--></div></div></nav>`);
  });
}
export { BottomNav as B };
