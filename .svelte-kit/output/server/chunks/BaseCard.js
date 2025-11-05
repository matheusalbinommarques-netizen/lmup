import { $ as attributes, _ as stringify } from './index2.js';
function BaseButton($$renderer, $$props) {
  let {
    variant = 'primary',
    class: userClass = '',
    type = 'button',
    children,
    onclick = () => {},
    $$slots,
    $$events,
    ...rest
  } = $$props;
  const variants = {
    primary:
      'bg-primary text-white hover:bg-primary-light focus-visible:ring-primary',
    success:
      'bg-success text-white hover:bg-success/80 focus-visible:ring-success',
    danger: 'bg-danger text-white hover:bg-danger/80 focus-visible:ring-danger',
  };
  let baseClasses =
    'px-4 py-2 rounded-md font-semibold text-sm shadow-md transition-colors duração-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50';
  let selectedVariant = variants[variant] || variants.primary;
  $$renderer.push(
    `<button${attributes({
      type,
      ...rest,
      class: `${stringify(baseClasses)} ${stringify(selectedVariant)} ${stringify(userClass)}`,
    })}>`,
  );
  children?.($$renderer);
  $$renderer.push(`<!----></button>`);
}
function BaseCard($$renderer, $$props) {
  let {
    children,
    onclick = () => {},
    onkeydown = () => {},
    $$slots,
    $$events,
    ...rest
  } = $$props;
  $$renderer.push(
    `<div${attributes({
      class:
        'base-card bg-card border border-border rounded-md p-4 shadow-lg focus-visible:outline-primary focus-visible:outline-offset-2',
      role: 'button',
      tabindex: '0',
      ...rest,
    })}>`,
  );
  children?.($$renderer);
  $$renderer.push(`<!----></div>`);
}
export { BaseCard as B, BaseButton as a };
