/**
 * Domínios da vida (nomes definitivos do plano Economia 2.0, 07/11/2026).
 * Classificação opcional: nada no app depende de um domínio estar preenchido.
 */
export const DOMAINS = [
  { key: 'health', label: 'Saúde Física', short: 'Saúde' },
  { key: 'emotional', label: 'Saúde Emocional', short: 'Emocional' },
  { key: 'knowledge', label: 'Conhecimento', short: 'Conhecimento' },
  { key: 'career', label: 'Trabalho e Carreira', short: 'Carreira' },
  { key: 'finance', label: 'Finanças', short: 'Finanças' },
  { key: 'home', label: 'Casa e Ambiente', short: 'Casa' },
  { key: 'relations', label: 'Relações', short: 'Relações' },
  { key: 'leisure', label: 'Lazer', short: 'Lazer' },
  { key: 'creativity', label: 'Criatividade', short: 'Criatividade' },
  { key: 'values', label: 'Valores e Contribuição', short: 'Valores' },
] as const;
export type DomainKey = (typeof DOMAINS)[number]['key'];
export const isDomainKey = (value: unknown): value is DomainKey =>
  DOMAINS.some((row) => row.key === value);
export const domainLabel = (key: DomainKey) =>
  DOMAINS.find((row) => row.key === key)!.label;
