/** Keep the native, keyboard-editable input; expand picker activation to its full surface. */
export function timePicker(input: HTMLInputElement) {
  function open() {
    if (input.disabled || input.readOnly) return;
    input.focus({ preventScroll: true });
    try {
      input.showPicker?.();
    } catch {
      // Browsers without an available native picker retain direct keyboard entry.
    }
  }
  function keydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || (event.altKey && event.key === 'ArrowDown')) {
      event.preventDefault();
      open();
    }
  }
  input.addEventListener('click', open);
  input.addEventListener('keydown', keydown);
  return {
    destroy() {
      input.removeEventListener('click', open);
      input.removeEventListener('keydown', keydown);
    },
  };
}
