/** Insert the HH:mm separator while preserving keyboard edits and selection. */
export function timeEntry(input: HTMLInputElement) {
  function format(event: Event) {
    if (event instanceof InputEvent && event.isComposing) return;
    const raw = input.value;
    const caret = input.selectionStart ?? raw.length;
    const deleting =
      event instanceof InputEvent && event.inputType.startsWith('delete');
    const digits = raw.replace(/\D/g, '').slice(0, 4);
    const [hours, ...minutes] = raw.split(':');
    // Keep incomplete segments during replacement (e.g. selecting 13 in 13:00).
    const value =
      raw.includes(':') && digits.length
        ? `${hours.replace(/\D/g, '').slice(0, 2)}:${minutes.join('').replace(/\D/g, '').slice(0, 2)}`
        : digits.length >= 2
          ? `${digits.slice(0, 2)}:${digits.slice(2)}`
          : digits;
    if (value === raw) {
      if (!deleting && caret === 2 && value[2] === ':')
        input.setSelectionRange(3, 3);
      return;
    }
    const preceding = Math.min(
      raw.slice(0, caret).replace(/\D/g, '').length,
      4,
    );
    const position = Math.min(
      value.length,
      preceding +
        (preceding > 2 || (preceding === 2 && (caret > 2 || !deleting))
          ? 1
          : 0),
    );
    input.value = value;
    input.setSelectionRange(position, position);
  }
  input.addEventListener('input', format);
  input.addEventListener('compositionend', format);
  return {
    destroy() {
      input.removeEventListener('input', format);
      input.removeEventListener('compositionend', format);
    },
  };
}
