import {
  U as attr_class,
  V as stringify,
  W as store_get,
  X as unsubscribe_stores,
} from '../../chunks/index2.js';
import { g as getContext } from '../../chunks/context.js';
import '@sveltejs/kit/internal';
import '../../chunks/exports.js';
import '../../chunks/utils.js';
import 'clsx';
import '@sveltejs/kit/internal/server';
import '../../chunks/state.svelte.js';
const getStores = () => {
  const stores$1 = getContext('__svelte__');
  return {
    /** @type {typeof page} */
    page: {
      subscribe: stores$1.page.subscribe,
    },
    /** @type {typeof navigating} */
    navigating: {
      subscribe: stores$1.navigating.subscribe,
    },
    /** @type {typeof updated} */
    updated: stores$1.updated,
  };
};
const page = {
  subscribe(fn) {
    const store = getStores().page;
    return store.subscribe(fn);
  },
};
function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let { children } = $$props;
    $$renderer2.push(
      `<main class="max-w-3xl mx-auto p-4 md:p-6"><header class="text-center py-6"><h1 class="text-primary text-4xl font-bold">Level Me Up!</h1></header> <nav class="flex mb-6 border-b-2 border-border"><a href="/"${attr_class(`text-lg font-semibold py-2 px-4 text-text-secondary border-b-2 border-transparent -mb-0.5 transition-colors duration-150 hover:text-text ${stringify(store_get(($$store_subs ??= {}), '$page', page).url.pathname === '/' ? 'text-primary border-primary' : '')}`)}>Progresso</a> <a href="/config"${attr_class(`text-lg font-semibold py-2 px-4 text-text-secondary border-b-2 border-transparent -mb-0.5 transition-colors duração-150 hover:text-text ${stringify(store_get(($$store_subs ??= {}), '$page', page).url.pathname === '/config' ? 'text-primary border-primary' : '')}`)}>Configurações</a></nav> `,
    );
    children?.($$renderer2);
    $$renderer2.push(`<!----></main>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export { _layout as default };
