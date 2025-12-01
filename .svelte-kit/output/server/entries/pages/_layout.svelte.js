import 'clsx';
import {
  w as ensure_array_like,
  x as attr,
  y as attr_class,
} from '../../chunks/index2.js';
import '@sveltejs/kit/internal';
import '../../chunks/exports.js';
import '../../chunks/utils.js';
import '@sveltejs/kit/internal/server';
import '../../chunks/state.svelte.js';
import { a as ssr_context, e as escape_html } from '../../chunks/context.js';
function onDestroy(fn) {
  /** @type {SSRContext} */
  ssr_context.r.on_destroy(fn);
}
function BottomNav($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let pathname = '/';
    const links = [
      {
        href: '/',
        label: 'Taverna',
        icon: '/art/icones/icon-taverna.png',
      },
      {
        href: '/missoes',
        label: 'Missões',
        icon: '/art/icones/icon-missoes.png',
      },
      {
        href: '/projetos',
        label: 'Projetos',
        icon: '/art/icones/icon-projetos.png',
      },
      { href: '/cla', label: 'Clã', icon: '/art/icones/icon-cla.png' },
      {
        href: '/config',
        label: 'Config.',
        icon: '/art/icones/icon-config.png',
      },
    ];
    function isActive(href) {
      return (
        pathname === href || (href !== '/' && pathname.startsWith(href + '/'))
      );
    }
    $$renderer2.push(
      `<nav class="fixed inset-x-0 bottom-0 z-40 border-t border-slate-800/70 bg-slate-900/95 backdrop-blur" aria-label="Navegação inferior"><div class="bottom-nav-inner"><!--[-->`,
    );
    const each_array = ensure_array_like(links);
    for (
      let $$index = 0, $$length = each_array.length;
      $$index < $$length;
      $$index++
    ) {
      let link = each_array[$$index];
      $$renderer2.push(
        `<a${attr('href', link.href)}${attr_class(`flex flex-col items-center gap-1 rounded-xl px-2 py-1 text-[0.65rem] font-medium transition-colors ${isActive(link.href) ? 'text-emerald-300 drop-shadow-[0_0_12px_rgba(52,211,153,0.9)]' : 'text-slate-400 hover:text-slate-100'}`)}${attr('aria-current', isActive(link.href) ? 'page' : void 0)}><img${attr('src', link.icon)}${attr('alt', link.label)} class="h-6 w-6"/> <span>${escape_html(link.label)}</span></a>`,
      );
    }
    $$renderer2.push(`<!--]--></div></nav>`);
  });
}
function DesktopNav($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let pathname = '/';
    onDestroy(() => {});
    const links = [
      {
        href: '/',
        label: 'Taverna do Herói',
        icon: '/art/icones/icon-taverna.png',
      },
      {
        href: '/missoes',
        label: 'Quadro de Missões',
        icon: '/art/icones/icon-missoes.png',
      },
      {
        href: '/projetos',
        label: 'Projetos do Herói',
        icon: '/art/icones/icon-projetos.png',
      },
      { href: '/cla', label: 'Clã', icon: '/art/icones/icon-cla.png' },
      {
        href: '/santuario',
        label: 'Santuário',
        icon: '/art/icones/icon-leaf-eco.png',
      },
      {
        href: '/config',
        label: 'Cofre Arcano',
        icon: '/art/icones/icon-config.png',
      },
    ];
    function isActive(href) {
      return (
        pathname === href || (href !== '/' && pathname.startsWith(href + '/'))
      );
    }
    $$renderer2.push(
      `<aside class="hidden w-64 flex-col gap-6 border-r border-slate-800/50 bg-slate-900/80 p-4 md:flex"><a href="/" class="flex items-center gap-3 px-2 group"><img src="/art/icones/logo lmu.png" alt="Logo LMU" class="h-12 w-12 drop-shadow-[0_0_18px_rgba(251,191,36,0.45)]" decoding="async"/> <div class="flex flex-col leading-tight"><span class="relative inline-block font-serif text-lg md:text-xl font-extrabold"><span class="absolute inset-0 text-amber-300 blur opacity-80 group-hover:blur-xl group-hover:opacity-100 transition-all duration-300" aria-hidden="true">Level Me Up!</span> <span class="relative text-amber-100">Level Me Up!</span></span></div></a> <nav class="flex flex-1 flex-col gap-1" aria-label="Navegação lateral"><!--[-->`,
    );
    const each_array = ensure_array_like(links);
    for (
      let $$index = 0, $$length = each_array.length;
      $$index < $$length;
      $$index++
    ) {
      let link = each_array[$$index];
      $$renderer2.push(
        `<a${attr('href', link.href)}${attr_class(`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${isActive(link.href) ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/60 shadow-[0_0_18px_rgba(52,211,153,0.65)]' : 'text-slate-300 hover:bg-slate-800/70 border border-transparent'}`)}${attr('aria-current', isActive(link.href) ? 'page' : void 0)}><img${attr('src', link.icon)}${attr('alt', link.label)} class="h-5 w-5"/> <span>${escape_html(link.label)}</span></a>`,
      );
    }
    $$renderer2.push(`<!--]--></nav></aside>`);
  });
}
function _layout($$renderer, $$props) {
  const { children } = $$props;
  $$renderer.push(
    `<div class="min-h-dvh bg-slate-950 text-slate-200 md:flex">`,
  );
  DesktopNav($$renderer);
  $$renderer.push(
    `<!----> <div class="flex-1 min-w-0 relative flex flex-col"><main class="flex-1 p-4 md:p-8 overflow-y-auto scroll-smooth pb-[100px] md:pb-8"><div class="mx-auto w-full max-w-5xl">`,
  );
  children($$renderer);
  $$renderer.push(
    `<!----></div></main></div> <div class="md:hidden fixed bottom-0 left-0 right-0 z-50">`,
  );
  BottomNav($$renderer);
  $$renderer.push(`<!----></div></div>`);
}
export { _layout as default };
