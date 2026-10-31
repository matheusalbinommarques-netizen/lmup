export function calendarDate(
  value: Date | string | null | undefined,
): string | null {
  if (value == null || value === '') return null;
  const text =
    value instanceof Date
      ? Number.isNaN(value.getTime())
        ? ''
        : value.toISOString()
      : value;
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:$|T)/.exec(text);
  if (text.length > 10 && Number.isNaN(new Date(text).getTime()))
    throw new Error('Escolha uma data de calendário válida.');
  if (!match) throw new Error('Escolha uma data de calendário válida.');
  const key = `${match[1]}-${match[2]}-${match[3]}`;
  const date = new Date(`${key}T12:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== key)
    throw new Error('Escolha uma data de calendário válida.');
  return key;
}
export function addCalendarDays(key: string, days: number): string {
  const valid = calendarDate(key);
  if (!valid || !Number.isInteger(days))
    throw new Error('Intervalo de calendário inválido.');
  const date = new Date(`${valid}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
export function formatCalendar(value?: string | Date | null): string {
  try {
    const key = calendarDate(value);
    return key
      ? `${key.slice(8, 10)}/${key.slice(5, 7)}/${key.slice(0, 4)}`
      : 'Sem prazo';
  } catch {
    return 'Data antiga inválida';
  }
}
