import type { Task, TaskRarity } from './db';
export type Effort = NonNullable<Task['effort']>;
export const EFFORTS: {
  key: Effort;
  label: string;
  description: string;
  xp: number;
  rarity: TaskRarity;
}[] = [
  {
    key: 'small',
    label: 'Leve',
    description: 'Um passo curto e familiar',
    xp: 50,
    rarity: 'common',
  },
  {
    key: 'medium',
    label: 'Moderado',
    description: 'Exige atenção e alguma elaboração',
    xp: 100,
    rarity: 'rare',
  },
  {
    key: 'large',
    label: 'Exigente',
    description: 'Desafio com esforço significativo',
    xp: 150,
    rarity: 'epic',
  },
  {
    key: 'deep',
    label: 'Intenso',
    description: 'Trabalho aprofundado e desafiador',
    xp: 250,
    rarity: 'legendary',
  },
];
export function effortDefinition(key: Effort) {
  const value = EFFORTS.find((item) => item.key === key);
  if (!value) throw new Error('Escolha um esforço válido.');
  return value;
}
