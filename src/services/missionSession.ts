// Session selection is UI-only. Reward and execution records remain in IndexedDB.
export type MissionSession = {
  date: string;
  taskIds: number[];
  cursor: number;
};
export const MISSION_SESSION_KEY = 'lmup.mission-session.v1';

export function normalizeMissionSession(value: unknown, today: string): MissionSession | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const candidate = value as Partial<MissionSession>;
  if (candidate.date !== today || !Array.isArray(candidate.taskIds)) return null;
  if (!candidate.taskIds.length || candidate.taskIds.length > 50) return null;
  if (
    candidate.taskIds.some((id) => !Number.isSafeInteger(id) || id <= 0) ||
    new Set(candidate.taskIds).size !== candidate.taskIds.length ||
    !Number.isSafeInteger(candidate.cursor) ||
    candidate.cursor! < 0 ||
    candidate.cursor! > candidate.taskIds.length
  ) return null;
  return { date: today, taskIds: [...candidate.taskIds], cursor: candidate.cursor! };
}

export function newMissionSession(ids: number[], today: string): MissionSession {
  const result = normalizeMissionSession({ date: today, taskIds: ids, cursor: 0 }, today);
  if (!result) throw new Error('Escolha de 1 a 50 missões diferentes para sua sessão.');
  return result;
}

export function readMissionSession(today: string): MissionSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(MISSION_SESSION_KEY);
    return raw ? normalizeMissionSession(JSON.parse(raw), today) : null;
  } catch {
    return null;
  }
}

export function removeMissionFromSession(
  session: MissionSession,
  taskId: number,
): MissionSession | null {
  const index = session.taskIds.indexOf(taskId);
  if (index < 0) return session;
  const taskIds = session.taskIds.filter((id) => id !== taskId);
  if (!taskIds.length) return null;
  const cursor = index < session.cursor ? session.cursor - 1 : session.cursor;
  return { ...session, taskIds, cursor };
}

export function saveMissionSession(value: MissionSession | null): void {
  if (typeof window === 'undefined') return;
  const valid = value && normalizeMissionSession(value, value.date);
  if (value && !valid)
    throw new Error('Sessão inválida. Selecione novamente suas missões.');
  try {
    if (valid)
      window.localStorage.setItem(MISSION_SESSION_KEY, JSON.stringify(valid));
    else window.localStorage.removeItem(MISSION_SESSION_KEY);
  } catch {
    throw new Error('Não foi possível salvar a sessão neste navegador.');
  }
}

export function clearMissionSession(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(MISSION_SESSION_KEY);
  } catch {
    // The saved queue is disposable; task history remains in IndexedDB.
  }
}
