// src/services/db.ts
import Dexie, { type Table } from 'dexie';

// ---------------------------------------------
// PROFILE (herói)
// ---------------------------------------------
export interface Profile {
  id?: number;
  name: string;
  title?: string;

  level: number;
  xpCurrent: number;
  xpNext: number;
  totalXpEarned: number;

  gold: number; // usado no app inteiro
  avatarUrl?: string;

  // streak
  currentStreak: number;
  lastCompletionDate?: string | null;

  // pet ativo
  activeCompanionId?: number | null;

  createdAt?: string | Date;
  updatedAt?: string | Date;

  // usado no EcoPanel
  ecoGoldClaimedUpToStage?: number;

  // conquistas em destaque na sala de troféus
  highlightAchievementIds?: string[];
}

// ---------------------------------------------
// AREAS
// ---------------------------------------------
export interface Area {
  id?: number;
  nome: string;
  descricao?: string;
  ordem?: number;
  cor?: string;
}

// ---------------------------------------------
// TASKS (missões)
// ---------------------------------------------
export type TaskRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type TaskStatus = 'available' | 'todo' | 'completed';

export interface Task {
  id?: number;

  title: string;
  description?: string;

  areaId?: number;

  // FASE 2 – projetos
  projectId?: number | null;

  xp: number;
  rarity: TaskRarity;

  status?: TaskStatus;
  completed?: boolean;
  archived?: boolean;

  createdAt: Date | string;
  updatedAt?: Date | string;
  completedAt?: Date | string | null;

  todoOrder?: number;

  // revisão espaçada
  reviewEnabled?: boolean;
  reviewIntervalDays?: number | null;
  reviewStartedAt?: Date | string | null;
}

// ---------------------------------------------
// XP LOGS
// ---------------------------------------------
export interface XpLog {
  id?: number;
  date: string; // yyyy-mm-dd
  amount: number;

  areaId?: number | null;
  type?: 'gain' | 'spend';
  reason?: string;

  createdAt?: string | Date;
}

// ---------------------------------------------
// INVENTÁRIO / LOJA
// ---------------------------------------------
export type InventoryItemType =
  | 'frame'
  | 'avatar'
  | 'background'
  | 'aura'
  | 'weapon-skin'
  | 'gear'; // NOVO – itens com efeitos de gameplay

// Raridade de itens da loja/gear
export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary';

// Slot de equipamento (um equipado por slot)
export type GearSlot = 'armor' | 'weapon' | 'amulet' | 'ring' | 'bag' | 'helm';

// Tipos de efeito possíveis
export type GearEffectType =
  | 'streak_protection_days' // armadura: dias de proteção de streak
  | 'rarity_subtask_reduction' // espada: - subtarefas p/ raridade alta
  | 'gold_multiplier' // amuleto: +% gold
  | 'sanctuary_bonus_multiplier' // anel: +% absoluto ao bônus do santuário
  | 'inventory_slots_bonus' // mochila: +slots de inventário
  | 'project_bonus_multiplier'; // elmo: +% no bônus de projeto concluído

export interface GearEffect {
  type: GearEffectType;
  value: number; // dias, %, slots etc. Ex.: 0.05 = 5% a mais
}

// Itens que já vão para o inventário (possuídos)
export interface InventoryItem {
  id?: number;
  key: string;
  type: InventoryItemType;
  name: string;
  description?: string;
  owned: boolean;
  equipped?: boolean;

  // Só faz sentido para type === 'gear' (mas deixamos opcional)
  rarity?: ItemRarity;
  slot?: GearSlot;
  effects?: GearEffect[];
}

// Itens disponíveis na loja
export interface ShopItem {
  id?: number;
  key: string;
  type: InventoryItemType;
  name: string;
  description?: string;
  price: number;

  // também podem ser gear na própria loja
  rarity?: ItemRarity;
  slot?: GearSlot;
  effects?: GearEffect[];
}

// Relação “perfil X item comprado na loja”
export type ShopItemRarity = 'common' | 'rare' | 'epic' | 'legendary';

// se você já tiver um tipo de categoria em outro lugar, pode reaproveitar.
// por enquanto vamos manter string mesmo pra não quebrar nada.
export interface OwnedShopItem {
  id?: number;

  // referência ao item da loja (ShopItem.id)
  itemId: number;

  // metadados opcionais da compra – usados pra exibir em telas futuras
  name?: string;
  description?: string | null;
  price?: number;

  // raridade e categoria pro TS parar de reclamar
  rarity?: ShopItemRarity;
  category?: string;

  // estado de uso
  equipped: boolean;

  // quando o jogador comprou
  acquiredAt: string;
}

// ---------------------------------------------
// COMPANIONS (PETS)
// ---------------------------------------------
export type CompanionRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Companion {
  id?: number;

  // ⚠️ estes são OPCIONAIS pra bater com o PET_SEED do bestiário
  key?: string;
  rarity?: CompanionRarity;
  type?: string;
  imagePath?: string;

  name: string;

  unlocked?: boolean;
  requiredLevel?: number;
  description?: string;
  createdAt?: string | Date;
}

// ---------------------------------------------
// LEGACY ITEM (ItemManager antigo)
// ---------------------------------------------
export interface LegacyItem {
  id?: number;
  titulo: string;
  descricao?: string;
  xp?: number;
  areaId?: number;
}

// ---------------------------------------------
// HERO PROJECT (FASE 2)
// ---------------------------------------------
export type HeroProjectStatus =
  | 'planejando'
  | 'em_andamento'
  | 'concluido'
  | 'pausado'
  | 'arquivado';

export interface HeroProject {
  id?: number;

  name: string;
  vision?: string | null;
  status: HeroProjectStatus;

  createdAt: Date | string;
  updatedAt?: Date | string;

  targetDate?: Date | string | null;

  color?: string | null;
  icon?: string | null;

  // pra Fase 4 (bônus de XP)
  rewardGranted?: boolean;
}

// ---------------------------------------------
// BANCO DEXIE
// ---------------------------------------------
export class LevelMeUpDB extends Dexie {
  profile!: Table<Profile, number>;
  tasks!: Table<Task, number>;
  areas!: Table<Area, number>;
  xpLogs!: Table<XpLog, number>;

  inventory!: Table<InventoryItem, number>;
  shopItems!: Table<ShopItem, number>;
  ownedShopItems!: Table<OwnedShopItem, number>;

  companions!: Table<Companion, number>;

  items!: Table<LegacyItem, number>; // legado

  projects!: Table<HeroProject, number>; // Fase 2

  constructor() {
    super('LevelMeUpDB');

    // versão 4 (já estávamos nela, não muda o schema aqui)
    this.version(4).stores({
      profile: '++id',

      tasks:
        '++id, areaId, projectId, status, completed, archived, createdAt, completedAt, reviewEnabled',

      xpLogs: '++id, date, areaId, createdAt',

      areas: '++id',

      inventory: '++id, key, type, owned, equipped',
      shopItems: '++id, key, type, price',
      ownedShopItems: '++id, itemId',

      companions: '++id, key, rarity, unlocked',

      items: '++id, areaId',

      projects: '++id, status, createdAt, targetDate',
    });
  }
}

export const db = new LevelMeUpDB();
