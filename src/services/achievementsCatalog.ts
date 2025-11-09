// src/services/achievementsCatalog.ts

export type Rarity = 'comum' | 'raro' | 'épico' | 'lendário';

export type Category =
  | 'missoes'
  | 'consistencia'
  | 'progresso'
  | 'areas'
  | 'eco'
  | 'companheiros'
  | 'sociais'
  | 'economia';

export type AchievementStats = {
  totalXp: number;
  streak: number;
  level: number;
  completedMissions: number;
  completedEpicOrLegendary: number;
  completedLegendary: number;
  maxTasksInSingleArea: number;
  completedAreasCount: number;
  maxAreaLevel: number;
  areasAtLeastLevel20: number;
  unlockedCompanionsCount: number;
  hasWolf: boolean;
  hasDragon: boolean;
  allCompanionsUnlocked: boolean;
  companionInteractions: number;
};

export type AchievementDef = {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: Rarity;
  category: Category;
  future?: boolean;
  condition: (stats: AchievementStats) => boolean;
};

export type SectionMeta = {
  id: string;
  title: string;
  subtitle: string;
  category: Category;
};

/**
 * Helper pra criar o objeto de stats com defaults seguros.
 * Assim o AvatarAchievementsPanel pode chamar só com totalXp/streak/level
 * e o painel completo usa todos os campos.
 */
export function createAchievementStats(
  partial: Partial<AchievementStats>,
): AchievementStats {
  return {
    totalXp: 0,
    streak: 0,
    level: 1,
    completedMissions: 0,
    completedEpicOrLegendary: 0,
    completedLegendary: 0,
    maxTasksInSingleArea: 0,
    completedAreasCount: 0,
    maxAreaLevel: 0,
    areasAtLeastLevel20: 0,
    unlockedCompanionsCount: 0,
    hasWolf: false,
    hasDragon: false,
    allCompanionsUnlocked: false,
    companionInteractions: 0,
    ...partial,
  };
}

// =============================================================
// Catálogo de conquistas
// =============================================================

export const ALL_ACHIEVEMENTS: AchievementDef[] = [
  // 1. Missões (Core Loop)
  {
    id: 'primeiro-passo',
    title: 'O Primeiro Passo',
    description: 'Complete sua primeira missão.',
    icon: '🎯',
    rarity: 'comum',
    category: 'missoes',
    condition: ({ completedMissions }) => completedMissions >= 1,
  },
  {
    id: 'aventureiro',
    title: 'Aventureiro',
    description: 'Complete 10 missões.',
    icon: '🗺️',
    rarity: 'comum',
    category: 'missoes',
    condition: ({ completedMissions }) => completedMissions >= 10,
  },
  {
    id: 'veterano',
    title: 'Veterano',
    description: 'Complete 100 missões.',
    icon: '⚔️',
    rarity: 'raro',
    category: 'missoes',
    condition: ({ completedMissions }) => completedMissions >= 100,
  },
  {
    id: 'cacador-missoes',
    title: 'Caçador de Missões',
    description: 'Complete 500 missões.',
    icon: '🏹',
    rarity: 'épico',
    category: 'missoes',
    condition: ({ completedMissions }) => completedMissions >= 500,
  },
  {
    id: 'lenda-viva',
    title: 'Lenda Viva',
    description: 'Complete 1000 missões.',
    icon: '🏆',
    rarity: 'lendário',
    category: 'missoes',
    condition: ({ completedMissions }) => completedMissions >= 1000,
  },
  {
    id: 'matador-gigantes',
    title: 'Matador de Gigantes',
    description: 'Complete sua primeira missão Épica ou Lendária.',
    icon: '🗡️',
    rarity: 'raro',
    category: 'missoes',
    condition: ({ completedEpicOrLegendary }) => completedEpicOrLegendary >= 1,
  },
  {
    id: 'exterminador',
    title: 'Exterminador',
    description: 'Complete 50 missões Lendárias.',
    icon: '💀',
    rarity: 'épico',
    category: 'missoes',
    condition: ({ completedLegendary }) => completedLegendary >= 50,
  },

  // 2. Consistência (Streaks)
  {
    id: 'acendendo-tocha',
    title: 'Acendendo a Tocha',
    description: 'Mantenha um streak de 3 dias.',
    icon: '🕯️',
    rarity: 'comum',
    category: 'consistencia',
    condition: ({ streak }) => streak >= 3,
  },
  {
    id: 'em-chamas',
    title: 'Em Chamas!',
    description: 'Mantenha um streak de 7 dias.',
    icon: '🔥',
    rarity: 'raro',
    category: 'consistencia',
    condition: ({ streak }) => streak >= 7,
  },
  {
    id: 'fogo-controlado',
    title: 'Fogo Controlado',
    description: 'Mantenha um streak de 30 dias.',
    icon: '♨️',
    rarity: 'épico',
    category: 'consistencia',
    condition: ({ streak }) => streak >= 30,
  },
  {
    id: 'a-fenix',
    title: 'A Fênix',
    description: 'Mantenha um streak de 100 dias.',
    icon: '🪶',
    rarity: 'lendário',
    category: 'consistencia',
    condition: ({ streak }) => streak >= 100,
  },

  // 3. Progressão (Nível e XP)
  {
    id: 'novato',
    title: 'Novato',
    description: 'Alcance o Nível 5.',
    icon: '🎓',
    rarity: 'comum',
    category: 'progresso',
    condition: ({ level }) => level >= 5,
  },
  {
    id: 'perito',
    title: 'Perito',
    description: 'Alcance o Nível 25.',
    icon: '📘',
    rarity: 'raro',
    category: 'progresso',
    condition: ({ level }) => level >= 25,
  },
  {
    id: 'mestre',
    title: 'Mestre',
    description: 'Alcance o Nível 50.',
    icon: '🧙‍♂️',
    rarity: 'épico',
    category: 'progresso',
    condition: ({ level }) => level >= 50,
  },
  {
    id: 'semideus',
    title: 'Semideus',
    description: 'Alcance o Nível 100.',
    icon: '⚡',
    rarity: 'lendário',
    category: 'progresso',
    condition: ({ level }) => level >= 100,
  },
  {
    id: 'acumulador',
    title: 'Acumulador',
    description: 'Ganhe 10.000 XP no total.',
    icon: '💰',
    rarity: 'raro',
    category: 'progresso',
    condition: ({ totalXp }) => totalXp >= 10_000,
  },

  // 4. Áreas (Especialização)
  {
    id: 'focado',
    title: 'Focado',
    description: 'Adicione 5 missões a uma única Área.',
    icon: '🎯',
    rarity: 'comum',
    category: 'areas',
    condition: ({ maxTasksInSingleArea }) => maxTasksInSingleArea >= 5,
  },
  {
    id: 'especialista',
    title: 'Especialista',
    description: 'Leve uma Área ao nível 10.',
    icon: '🏛️',
    rarity: 'raro',
    category: 'areas',
    condition: ({ maxAreaLevel }) => maxAreaLevel >= 10,
  },
  {
    id: 'mestre-area',
    title: 'Mestre de Área',
    description: 'Leve uma Área ao nível 25.',
    icon: '🌐',
    rarity: 'épico',
    category: 'areas',
    condition: ({ maxAreaLevel }) => maxAreaLevel >= 25,
  },
  {
    id: 'multitarefa',
    title: 'Multitarefa',
    description: 'Complete pelo menos uma missão em 5 Áreas diferentes.',
    icon: '🧩',
    rarity: 'raro',
    category: 'areas',
    condition: ({ completedAreasCount }) => completedAreasCount >= 5,
  },
  {
    id: 'polimata',
    title: 'Polímata',
    description: 'Leve 3 Áreas diferentes ao nível 20.',
    icon: '📚',
    rarity: 'lendário',
    category: 'areas',
    condition: ({ areasAtLeastLevel20 }) => areasAtLeastLevel20 >= 3,
  },

  // 5. Eco
  {
    id: 'o-semeador',
    title: 'O Semeador',
    description: 'Inicie seu Ecossistema (Alcance o Estágio 1 - Semente).',
    icon: '🌱',
    rarity: 'comum',
    category: 'eco',
    // provisório: vamos ligar com eco de verdade depois
    condition: ({ totalXp }) => totalXp >= 1,
  },
  {
    id: 'brotando',
    title: 'Brotando',
    description: 'Faça seu Ecossistema crescer (Alcance o Estágio 2 - Broto).',
    icon: '🌿',
    rarity: 'raro',
    category: 'eco',
    condition: ({ totalXp }) => totalXp >= 2500,
  },
  {
    id: 'arvore-da-vida',
    title: 'Árvore da Vida',
    description: 'Expanda sua floresta (Alcance o Estágio 3 - Árvore).',
    icon: '🌳',
    rarity: 'épico',
    category: 'eco',
    condition: ({ totalXp }) => totalXp >= 7500,
  },
  {
    id: 'guardiao-floresta',
    title: 'Guardião da Floresta',
    description: 'Alcance o estágio final do seu Ecossistema.',
    icon: '🌲',
    rarity: 'lendário',
    category: 'eco',
    condition: ({ totalXp }) => totalXp >= 12000,
  },

  // 6. Companheiros (Bestiário)
  {
    id: 'novo-amigo',
    title: 'Novo Amigo',
    description: 'Adquira seu primeiro companheiro.',
    icon: '🤝',
    rarity: 'comum',
    category: 'companheiros',
    condition: ({ unlockedCompanionsCount }) => unlockedCompanionsCount >= 1,
  },
  {
    id: 'melhores-amigos',
    title: 'Melhores Amigos',
    description: 'Alimente ou interaja com seu companheiro 10 vezes.',
    icon: '❤️',
    rarity: 'raro',
    category: 'companheiros',
    condition: ({ companionInteractions }) => companionInteractions >= 10,
    future: true,
  },
  {
    id: 'domador-lobos',
    title: 'Domador de Lobos',
    description: 'Adote o companheiro Lobo.',
    icon: '🐺',
    rarity: 'raro',
    category: 'companheiros',
    condition: ({ hasWolf }) => hasWolf,
  },
  {
    id: 'mae-pai-dragao',
    title: 'Mãe/Pai de Dragão',
    description: 'Adote o companheiro Dragão.',
    icon: '🐉',
    rarity: 'épico',
    category: 'companheiros',
    condition: ({ hasDragon }) => hasDragon,
  },
  {
    id: 'colecionador',
    title: 'Colecionador',
    description: 'Desbloqueie todos os companheiros disponíveis no Bestiário.',
    icon: '🧾',
    rarity: 'lendário',
    category: 'companheiros',
    condition: ({ allCompanionsUnlocked }) => allCompanionsUnlocked,
  },

  // 7. Sociais (Clã) – futuro
  {
    id: 'recruta',
    title: 'Recruta',
    description: 'Entre ou crie um Clã.',
    icon: '👥',
    rarity: 'comum',
    category: 'sociais',
    condition: () => false,
    future: true,
  },
  {
    id: 'trabalho-equipe',
    title: 'Trabalho em Equipe',
    description: 'Complete uma missão de Clã.',
    icon: '🤝',
    rarity: 'raro',
    category: 'sociais',
    condition: () => false,
    future: true,
  },
  {
    id: 'membro-fundador',
    title: 'Membro Fundador',
    description: 'Seja o líder de um Clã com 10 membros.',
    icon: '👑',
    rarity: 'épico',
    category: 'sociais',
    condition: () => false,
    future: true,
  },

  // 8. Economia (Loja / Inventário) – futuro
  {
    id: 'primeira-compra',
    title: 'Primeira Compra',
    description: 'Compre seu primeiro item na Loja.',
    icon: '🛒',
    rarity: 'comum',
    category: 'economia',
    condition: () => false,
    future: true,
  },
  {
    id: 'cliente-fiel',
    title: 'Cliente Fiel',
    description: 'Gaste 1.000 moedas na Loja.',
    icon: '💳',
    rarity: 'raro',
    category: 'economia',
    condition: () => false,
    future: true,
  },
  {
    id: 'pao-duro',
    title: 'Pão-Duro',
    description: 'Acumule 5.000 moedas.',
    icon: '🪙',
    rarity: 'raro',
    category: 'economia',
    condition: () => false,
    future: true,
  },
  {
    id: 'magnata',
    title: 'Magnata',
    description: 'Acumule 50.000 moedas.',
    icon: '🏦',
    rarity: 'épico',
    category: 'economia',
    condition: () => false,
    future: true,
  },
  {
    id: 'arsenal-completo',
    title: 'Arsenal Completo',
    description: 'Possua 10 itens diferentes no inventário.',
    icon: '🗡️',
    rarity: 'raro',
    category: 'economia',
    condition: () => false,
    future: true,
  },
];

// =============================================================
// Metadados das seções (para o mapa de conquistas)
// =============================================================

export const SECTIONS: SectionMeta[] = [
  {
    id: 'sec-missoes',
    title: '1. Conquistas de Missões',
    subtitle: 'Focadas em completar as tarefas diárias.',
    category: 'missoes',
  },
  {
    id: 'sec-consistencia',
    title: '2. Conquistas de Consistência',
    subtitle: 'Mantenha a chama acesa dia após dia para fortalecer seu streak.',
    category: 'consistencia',
  },
  {
    id: 'sec-progresso',
    title: '3. Conquistas de Progressão',
    subtitle: 'Representam o quanto você já caminhou acumulando experiência.',
    category: 'progresso',
  },
  {
    id: 'sec-areas',
    title: '4. Conquistas de Áreas',
    subtitle:
      'Incentivam equilíbrio ou foco em áreas específicas do seu reino.',
    category: 'areas',
  },
  {
    id: 'sec-eco',
    title: '5. Conquistas do Sistema Ecológico',
    subtitle:
      'Seu jardim de foco reage conforme você mantém o ritmo e cuida das missões.',
    category: 'eco',
  },
  {
    id: 'sec-companheiros',
    title: '6. Conquistas de Companheiros',
    subtitle:
      'Laços com seus companheiros mágicos conforme você explora o bestiário.',
    category: 'companheiros',
  },
  {
    id: 'sec-sociais',
    title: '7. Conquistas Sociais',
    subtitle:
      'Voltadas para interações em grupo e missões compartilhadas (futuro).',
    category: 'sociais',
  },
  {
    id: 'sec-economia',
    title: '8. Conquistas de Economia',
    subtitle:
      'Relacionadas às moedas do reino, compras e coleção de itens (futuro).',
    category: 'economia',
  },
];

// =============================================================
// Destaques usados no painel do avatar
// =============================================================

export type HighlightAchievementId =
  | 'acendendo-tocha'
  | 'em-chamas'
  | 'novato'
  | 'perito'
  | 'acumulador';

export const HIGHLIGHT_ACHIEVEMENT_IDS: HighlightAchievementId[] = [
  'acendendo-tocha',
  'em-chamas',
  'novato',
  'perito',
  'acumulador',
];
