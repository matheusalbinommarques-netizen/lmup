import { db } from './db';
import { isTaskIconKey } from '$lib/content/visualAssets';

/** Customize the implicit area without creating a second Geral or touching missions. */
export async function saveGeneralAreaIcon(
  iconKey: string | null,
  expectedIconKey: string | null | undefined,
) {
  if (iconKey !== null && !isTaskIconKey(iconKey))
    throw new Error('Escolha um ícone da biblioteca disponível.');
  return db.transaction('rw', db.profile, db.productivityAudit, async () => {
    const profile = await db.profile.get(1);
    if (!profile)
      throw new Error('Seu perfil não está disponível. Reabra a edição.');
    if (profile.generalAreaIconKey !== expectedIconKey)
      throw new Error(
        'O ícone de Geral mudou em outra aba. Reabra para conferir.',
      );
    if (profile.generalAreaIconKey === iconKey) return;
    await db.profile.update(1, { generalAreaIconKey: iconKey });
    await db.productivityAudit.add({
      id: crypto.randomUUID(),
      entityId: 'area:0',
      action: 'area-icon-edit',
      recordedAt: new Date().toISOString(),
      before: { iconKey: profile.generalAreaIconKey ?? null },
      after: { iconKey },
    });
  });
}

function areaName(value: string) {
  const name = value.trim();
  if (!name || name.length > 80)
    throw new Error('Escreva um nome de até 80 caracteres.');
  return name;
}
export async function saveArea(
  name: string,
  id?: number,
  iconKey?: string | null,
  description?: string,
) {
  if (iconKey != null && !isTaskIconKey(iconKey))
    throw new Error('Escolha um ícone da biblioteca disponível.');
  const nome = areaName(name);
  return db.transaction('rw', db.areas, db.productivityAudit, async () => {
    const previous = id === undefined ? undefined : await db.areas.get(id);
    if (
      description !== undefined &&
      (typeof description !== 'string' ||
        (description.length > 4000 && description !== previous?.descricao))
    )
      throw new Error('A descrição deve ter até 4000 caracteres.');
    if (id !== undefined && !(await db.areas.get(id)))
      throw new Error('Esta área não está mais disponível.');
    if (
      nome.toLocaleLowerCase('pt-BR') === 'geral' ||
      (await db.areas
        .filter(
          (area) =>
            area.id !== id &&
            area.nome.toLocaleLowerCase('pt-BR') ===
              nome.toLocaleLowerCase('pt-BR'),
        )
        .count())
    )
      throw new Error('Já existe uma área com esse nome.');
    if (id !== undefined) {
      await db.areas.update(id, {
        nome,
        ...(description !== undefined ? { descricao: description.trim() } : {}),
        ...(iconKey !== undefined ? { iconKey, iconConflict: false } : {}),
      });
      await db.productivityAudit.add({
        id: crypto.randomUUID(),
        entityId: `area:${id}`,
        action: 'area-edit',
        recordedAt: new Date().toISOString(),
        before: previous,
        after: await db.areas.get(id),
      });
      return id;
    }
    const created = await db.areas.add({
      nome,
      iconKey: iconKey ?? null,
      ...(description !== undefined ? { descricao: description.trim() } : {}),
    });
    await db.productivityAudit.add({
      id: crypto.randomUUID(),
      entityId: `area:${created}`,
      action: 'area-create',
      recordedAt: new Date().toISOString(),
      before: null,
      after: await db.areas.get(created),
    });
    return created;
  });
}
export async function deleteArea(id: number, destination = 0) {
  await db.transaction(
    'rw',
    db.areas,
    db.tasks,
    db.routines,
    db.productivityAudit,
    async () => {
      const previous = await db.areas.get(id);
      const linkedTasks = await db.tasks.where('areaId').equals(id).toArray();
      const linkedRoutines = await db.routines
        .filter((routine) => routine.defaultAreaId === id)
        .toArray();
      if (!id || id === destination)
        throw new Error('Escolha outra área de destino.');
      if (!(await db.areas.get(id)))
        throw new Error('Esta área não está mais disponível.');
      if (destination !== 0 && !(await db.areas.get(destination)))
        throw new Error('A área de destino mudou. Escolha novamente.');
      await db.tasks
        .where('areaId')
        .equals(id)
        .modify((task) => {
          task.areaId = destination;
          task.definitionRevision = (task.definitionRevision ?? 0) + 1;
        });
      await db.routines
        .filter((routine) => routine.defaultAreaId === id)
        .modify((routine) => {
          routine.defaultAreaId = destination;
          routine.revision++;
        });
      // XP logs and event receipts are immutable historical records.
      await db.areas.delete(id);
      await db.productivityAudit.add({
        id: crypto.randomUUID(),
        entityId: `area:${id}`,
        action: 'area-delete',
        recordedAt: new Date().toISOString(),
        before: {
          area: previous,
          taskIds: linkedTasks.map((task) => task.id),
          routineIds: linkedRoutines.map((routine) => routine.id),
        },
        after: { destination },
      });
    },
  );
}

/** Reclassify current definitions only; occurrences and economic receipts stay untouched. */
export async function transferAreaTasks(
  taskIds: number[],
  destination: number,
  expected: { id: number; areaId: number; revision: number }[],
) {
  if (
    !taskIds.length ||
    new Set(taskIds).size !== taskIds.length ||
    taskIds.some((id) => !Number.isSafeInteger(id) || id <= 0) ||
    !Number.isSafeInteger(destination) ||
    destination < 0
  )
    throw new Error('Selecione missões e uma área de destino válida.');
  return db.transaction(
    'rw',
    db.areas,
    db.tasks,
    db.productivityAudit,
    async () => {
      if (destination !== 0 && !(await db.areas.get(destination)))
        throw new Error('A área de destino mudou. Escolha novamente.');
      const tasks = await db.tasks.bulkGet(taskIds);
      for (const task of tasks) {
        const prior = expected.find((row) => row.id === task?.id);
        if (
          !task ||
          !prior ||
          (task.areaId ?? 0) !== prior.areaId ||
          (task.definitionRevision ?? 0) !== prior.revision
        )
          throw new Error(
            'Uma missão mudou em outra aba. Atualize a seleção antes de transferir.',
          );
      }
      const changed = tasks.filter(
        (task) => (task!.areaId ?? 0) !== destination,
      );
      if (!changed.length) return 0;
      for (const task of changed)
        await db.tasks.update(task!.id!, {
          areaId: destination,
          definitionRevision: (task!.definitionRevision ?? 0) + 1,
        });
      await db.productivityAudit.add({
        id: crypto.randomUUID(),
        entityId: `area:${destination}`,
        action: 'area-transfer',
        recordedAt: new Date().toISOString(),
        before: changed.map((task) => ({
          taskId: task!.id,
          areaId: task!.areaId ?? 0,
        })),
        after: { destination, taskIds: changed.map((task) => task!.id) },
      });
      return changed.length;
    },
  );
}
