import 'clsx';
import { B as BottomNav } from '../../chunks/BottomNav.js';
function _layout($$renderer, $$props) {
  let { children } = $$props;
  $$renderer.push(
    `<div class="min-h-screen flex flex-col bg-background text-text"><main class="flex-1 px-4 pt-8 pb-24 max-w-3xl mx-auto w-full">`,
  );
  children($$renderer);
  $$renderer.push(`<!----></main> `);
  BottomNav($$renderer);
  $$renderer.push(`<!----></div>`);
}
export { _layout as default };
