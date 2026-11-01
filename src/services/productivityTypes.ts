export type Resources = { xp: number; gold: number; food: number };
export type ProgressMethod =
  'direct' | 'time' | 'quantity' | 'percentage' | 'steps';
export type ProgressConfig = {
  method: ProgressMethod;
  target?: number;
  unit?: string;
};
export type Planning = {
  plannedTime?: string | null;
  estimatedMinutes?: number | null;
  deadline?: string | null;
  importance?: 'low' | 'normal' | 'high';
  tracking?: ProgressConfig;
};
export type Occurrence = Planning & {
  id: string;
  taskId: number;
  originDate: string;
  plannedDate: string;
  originalTime: string | null;
  title: string;
  areaId: number;
  projectId?: number | null;
  routineId?: string;
  baseXp: number;
  legacyCompletionOnly?: boolean;
  steps: string[];
  checkedSteps: number[];
  value: number;
  actualMinutes?: number;
  due: Resources;
  modifiers?: {
    xpMultiplier: number;
    goldMultiplier: number;
    foodMultiplier: number;
  };
  status:
    | 'planned'
    | 'active'
    | 'paused'
    | 'partial'
    | 'completed'
    | 'discarded'
    | 'excused';
  revision: number;
  completedAt?: string;
  completedLocalDate?: string;
  completionEventId?: string;
  reconstructed?: boolean;
  planningSuspended?: boolean;
  discardReason?: 'user' | 'definition';
  recovered?: boolean;
  createdAt: string;
};
export type Routine = {
  id: string;
  name: string;
  description: string;
  days: number[];
  startDate: string;
  status: 'active' | 'paused' | 'archived';
  entries: {
    taskId: number;
    time: string | null;
    previousPlan: Record<string, unknown>;
  }[];
  pauseQuota: number;
  pausePeriodDays: number;
  revision: number;
  createdAt: string;
};
export type PlanVersion = {
  sequence: number;
  id: string;
  taskId: number;
  effectiveFrom: string;
  recordedAt: string;
  definition: Record<string, unknown>;
};
export type ExecutionRecord = {
  id: string;
  occurrenceId: string;
  before: number;
  after: number;
  minutes: number | null;
  executedAt: string;
  localDate: string;
  localTime: string;
  timezone: string;
  offsetMinutes: number;
  recordedAt: string;
  correction: boolean;
  method?: ProgressMethod;
  revision: number;
};
export type ProductivityAudit = {
  id: string;
  entityId: string;
  action: string;
  recordedAt: string;
  before: unknown;
  after: unknown;
};
export type SavedMissionSession = {
  id: string;
  name: string;
  occurrenceIds: string[];
  cursor: number;
  status: 'active' | 'paused' | 'ended';
  mode: 'focus' | 'overview';
  revision: number;
  createdAt: string;
};
export type AchievementReceipt = {
  id: string;
  earnedAt: string;
  invalidatedAt?: string;
  reason?: string;
};
export const ZERO_RESOURCES: Resources = { xp: 0, gold: 0, food: 0 };
