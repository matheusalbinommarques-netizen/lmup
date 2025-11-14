// src/services/projectService.ts

// Status possíveis de um projeto do herói
export type HeroProjectStatus =
  | 'planejando'
  | 'em_andamento'
  | 'concluido'
  | 'pausado'
  | 'arquivado';

// Modelo base de Projeto (sem Dexie ainda, só types)
export interface HeroProject {
  id?: number;

  name: string;
  vision?: string;

  status: HeroProjectStatus;

  // Prazo opcional (aceita Date ou string tipo '2025-01-31')
  targetDate?: Date | string | null;

  // Datas de criação/atualização – seguem o padrão do db.ts (Date | string)
  createdAt: Date | string;
  updatedAt?: Date | string;
}
