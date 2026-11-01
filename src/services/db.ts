// src/services/db.ts
import Dexie, { type Table } from 'dexie';
import { trackWrite } from './updateSafety';
import type {
  AchievementReceipt,
  ExecutionRecord,
  Occurrence,
  Planning,
  PlanVersion,
  ProductivityAudit,
  Resources,
  Routine,
  SavedMissionSession,
} from './productivityTypes';

// ---------------------------------------------
// PROFILE (herói)
// ---------------------------------------------
export interface Profile {
  rewardDebt?: Resources;
  id?: number;
  name: string;
  title?: string;

  level: number;
  xpCurrent: number;
  xpNext: number;
  totalXpEarned: number;

  gold: number; // usado no app inteiro
  food?: number; // NOVO – recurso de comida para alimentar/evoluir pets (opcional p/ não quebrar fallbacks)
  avatarUrl?: string;
  /** Optional non-canonical narrative pilot. Stored with profile for existing backup compatibility. */
  rpgPilot?: {
    scene: number;
    choice?: 'help' | 'follow';
    chapterOneEndXp?: number;
    chapterTwoUnlocked?: boolean;
    chapterTwoScene?: number;
  };

  // streak
  currentStreak: number;
  lastCompletionDate?: string | null;

  // pet ativo
  activeCompanionId?: number | null;

  createdAt?: string | Date;
  updatedAt?: string | Date;

  // último marco de ambiente com recompensa já contabilizada
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
export type TaskRecurrence = {
  kind: 'daily' | 'weekdays' | 'weekly';
  startDate: string;
  days?: number[]; // Local calendar weekdays, Sunday = 0.
};

export interface Task extends Planning {
  productivityVersion?: 1;
  routineId?: string | null;
  planningPaused?: boolean;
  id?: number;

  title: string;
  description?: string | null;
  subtasks?: string[];
  completedSubtasks?: number[];
  completionRevision?: number;
  completionEventId?: string | null;
  creationKey?: string;
  plannedDate?: string | null;
  recurrence?: TaskRecurrence | null;
  occurrenceSession?: string;
  lastOccurrenceDate?: string | null;
  skippedDate?: string | null;
  occurrenceOverride?: string | null;
  pinned?: boolean;
  executionState?: 'idle' | 'active' | 'paused';
  executionNotes?: string;
  notesRevision?: number;
  reviewSession?: string;
  effort?: 'small' | 'medium' | 'large' | 'deep';
  definitionRevision?: number;
  projectStageId?: string | null;
  reviewDueDate?: string | null;
  lastReviewDate?: string | null;

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
  eventId?: string;
  kind?: ActivityKind;
  taskId?: number;
  projectId?: number;
  goldDelta?: number;
  foodDelta?: number;

  createdAt?: string | Date;
}

// ---------------------------------------------
// INVENTÁRIO / LOJA
// ---------------------------------------------
export type InventoryItemType =
  'frame' | 'avatar' | 'background' | 'aura' | 'weapon-skin' | 'gear'; // NOVO – itens com efeitos de gameplay

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

  // NOVO – evolução do pet e comida investida
  evolutionStage?: number; // 1, 2, 3...
  careHistory?: {
    id: string;
    occurredAt: string;
    amount: number;
    fromStage: number;
    toStage: number;
  }[];
  foodInvested?: number; // total de comida já gasta nesse pet
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
  'planejando' | 'em_andamento' | 'concluido' | 'pausado' | 'arquivado';

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
  rewardEventId?: string | null;
  rewardRevision?: number;
  stages?: { id: string; title: string }[];
  revision?: number;
  creationKey?: string;
  rewardPolicy?: 'effort-v1';
}

export type ActivityKind =
  'task' | 'review' | 'project' | 'adjustment' | 'reversal';

export interface ActivityEvent {
  occurrenceId?: string;
  executionComplete?: boolean;
  grossReward?: Resources;
  compensation?: Resources;
  debtAdded?: Resources;
  milestoneGold?: number;
  id: string;
  kind: ActivityKind;
  sequence: number;
  occurredAt: string;
  date: string;
  taskId?: number;
  occurrenceDate?: string;
  taskTitle?: string;
  areaName?: string;
  areaId?: number;
  projectId?: number;
  sourceEventId?: string;
  baseXp: number;
  reviewOutcome?: 'recalled' | 'partial' | 'again';
  reviewStateBefore?: {
    completed: boolean;
    status?: TaskStatus;
    completionEventId?: string | null;
    completedAt?: string | Date | null;
    reviewStartedAt?: string | Date | null;
    reviewDueDate?: string | null;
    lastReviewDate?: string | null;
  };
  reward: { xp: number; gold: number; food: number };
  /** XP at grant time; optional for receipts created before Recompensa Viva. */
  progress?: { before: number; after: number };
  modifiers: {
    xpMultiplier: number;
    goldMultiplier: number;
    foodMultiplier: number;
  };
  awardedStages: number[];
  ecoClaimedBefore: number;
  protectionDays: number;
  streakBefore?: { currentStreak: number; lastCompletionDate: string | null };
  reversedAt?: string;
  reversalPolicy?: 'debt';
}

export interface RecoverySnapshot {
  id: string;
  reason: 'migration-v4' | 'migration-v5' | 'before-import' | 'before-reset';
  createdAt: string;
  data: Record<string, unknown[]>;
}

export const LEGACY_STORES = {
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
};

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
  activityEvents!: Table<ActivityEvent, string>;
  recoverySnapshots!: Table<RecoverySnapshot, string>;
  occurrences!: Table<Occurrence, string>;
  routines!: Table<Routine, string>;
  planVersions!: Table<PlanVersion, string>;
  executionRecords!: Table<ExecutionRecord, string>;
  productivityAudit!: Table<ProductivityAudit, string>;
  savedMissionSessions!: Table<SavedMissionSession, string>;
  achievementReceipts!: Table<AchievementReceipt, string>;

  constructor(name = 'LevelMeUpDB') {
    super(name);

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

    this.version(5)
      .stores({
        ...LEGACY_STORES,
        xpLogs: '++id, date, areaId, createdAt, eventId',
        activityEvents:
          'id, sequence, kind, taskId, projectId, sourceEventId, date',
        recoverySnapshots: 'id, createdAt, reason',
      })
      .upgrade(async (transaction) => {
        const data: Record<string, unknown[]> = {};
        for (const name of Object.keys(LEGACY_STORES)) {
          data[name] = await transaction.table(name).toArray();
        }
        if (Object.values(data).some((rows) => rows.length)) {
          await transaction.table('recoverySnapshots').add({
            id: 'migration-v4',
            reason: 'migration-v4',
            createdAt: new Date().toISOString(),
            data,
          });
        }
      });
    this.version(6)
      .stores({
        occurrences: 'id, taskId, originDate, plannedDate, routineId, status',
        routines: 'id, status',
        planVersions: 'id, taskId, effectiveFrom',
        executionRecords: 'id, occurrenceId, localDate, recordedAt',
        productivityAudit: 'id, entityId, recordedAt',
        savedMissionSessions: 'id, status',
        achievementReceipts: 'id, earnedAt',
      })
      .upgrade(async (transaction) => {
        const data: Record<string, unknown[]> = {};
        for (const name of [...Object.keys(LEGACY_STORES), 'activityEvents']) {
          data[name] = await transaction.table(name).toArray();
        }
        const now = new Date();
        if (Object.values(data).some((rows) => rows.length)) {
          await transaction.table('recoverySnapshots').add({
            id: 'migration-v5',
            reason: 'migration-v5',
            createdAt: now.toISOString(),
            data,
          });
        }
        // No invented past schedules or recomputed legacy rewards.
        const day = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        for (const task of data.tasks as Task[]) {
          await transaction.table('planVersions').add({
            id: `migration:${task.id}`,
            sequence: 0,
            taskId: task.id,
            effectiveFrom: day,
            recordedAt: now.toISOString(),
            definition: task,
          });
        }
      });
    for (const table of this.tables) {
      table.hook('reading', (value) => {
        if (Dexie.currentTransaction) trackWrite(Dexie.currentTransaction);
        return value;
      });
      table.hook('creating', (_key, _value, transaction) => {
        trackWrite(transaction);
      });
      table.hook('updating', (_changes, _key, _value, transaction) => {
        trackWrite(transaction);
      });
      table.hook('deleting', (_key, _value, transaction) => {
        trackWrite(transaction);
      });
    }
  }
}

export const db = new LevelMeUpDB();
