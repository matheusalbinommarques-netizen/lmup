import { db } from './db';
import { calendarDate, addCalendarDays } from './calendar';
import { dateKey } from './rewardService';
export async function configureReview(
  id: number,
  input: { enabled: boolean; intervalDays: number; dueDate?: string | null },
) {
  if (
    !Number.isSafeInteger(input.intervalDays) ||
    input.intervalDays < 1 ||
    input.intervalDays > 365
  )
    throw new Error('Escolha um intervalo entre 1 e 365 dias.');
  const requested = calendarDate(input.dueDate);
  await db.transaction('rw', db.tasks, db.activityEvents, async () => {
    const task = await db.tasks.get(id);
    if (!task || task.archived)
      throw new Error('Esta missão não está disponível.');
    if (input.enabled && task.recurrence)
      throw new Error(
        'Remova a recorrência da rotina antes de ativar revisões espaçadas.',
      );
    const today = dateKey();
    const already = (
      await db.activityEvents.where('taskId').equals(id).toArray()
    ).some(
      (event) =>
        (event.kind === 'review' || !!event.occurrenceDate) &&
        !event.reversedAt &&
        event.date === today,
    );
    const due =
      requested ??
      (task.completed ? addCalendarDays(today, input.intervalDays) : today);
    if (input.enabled && already && due <= today)
      throw new Error(
        'Você já registrou uma realização desta missão hoje. Escolha a próxima data a partir de amanhã.',
      );
    await db.tasks.update(id, {
      reviewEnabled: input.enabled,
      reviewIntervalDays: input.intervalDays,
      reviewDueDate: input.enabled ? due : null,
      ...(already ? { lastReviewDate: today } : {}),
      updatedAt: new Date(),
    });
  });
}
