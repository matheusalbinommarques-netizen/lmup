import { db } from './db';
import { progressTransaction } from './rewardService';
import { savePlanVersion } from './occurrenceService';

export async function previewAreaMerge(
  sourceId: number,
  destinationId: number,
) {
  return db.transaction('r', db.tables, async () => {
    const source = await db.areas.get(sourceId),
      destination = await db.areas.get(destinationId);
    if (
      !source ||
      !destination ||
      source.archived ||
      destination.archived ||
      sourceId === destinationId
    )
      throw new Error('Escolha duas áreas disponíveis e diferentes.');
    const tasks = await db.tasks.where('areaId').equals(sourceId).toArray();
    const routines = await db.routines
      .filter((row) => row.defaultAreaId === sourceId)
      .toArray();
    const conflicts = [];
    if (source.iconKey !== destination.iconKey)
      conflicts.push(
        'As missões transferidas herdarão o ícone do destino. O ícone da origem será preservado no arquivo.',
      );
    if (source.descricao || source.cor || source.ordem !== undefined)
      conflicts.push(
        'Descrição, cor e ordem da origem serão preservadas no arquivo. A configuração do destino prevalece na lista comum.',
      );
    return {
      source,
      destination,
      tasks,
      routines,
      conflicts,
      token: JSON.stringify({ source, destination, tasks, routines }),
    };
  });
}
export async function mergeAreas(
  sourceId: number,
  destinationId: number,
  token: string,
  requestId: string,
) {
  if (!/^[\w:-]{1,120}$/.test(requestId))
    throw new Error('Reabra a mesclagem para continuar.');
  return progressTransaction(async () => {
    const prior = await db.productivityAudit.get(requestId);
    if (prior) {
      if (
        prior.action !== 'area-merge' ||
        prior.entityId !== `area:${sourceId}` ||
        (prior.after as { destinationId: number }).destinationId !==
          destinationId
      )
        throw new Error('Identificador já utilizado.');
      return;
    }
    const preview = await previewAreaMerge(sourceId, destinationId);
    if (preview.token !== token)
      throw new Error(
        'As áreas ou seus vínculos mudaram. Atualize a prévia antes de confirmar.',
      );
    for (const task of preview.tasks) {
      await db.tasks.update(task.id!, {
        areaId: destinationId,
        definitionRevision: (task.definitionRevision ?? 0) + 1,
      });
      await savePlanVersion((await db.tasks.get(task.id!))!);
    }
    for (const routine of preview.routines)
      await db.routines.update(routine.id, {
        defaultAreaId: destinationId,
        revision: routine.revision + 1,
      });
    await db.areas.update(sourceId, {
      archived: true,
      mergedInto: destinationId,
    });
    await db.productivityAudit.add({
      id: requestId,
      entityId: `area:${sourceId}`,
      action: 'area-merge',
      recordedAt: new Date().toISOString(),
      before: {
        source: preview.source,
        tasks: preview.tasks,
        routines: preview.routines,
      },
      after: { destinationId, destination: preview.destination },
    });
  });
}

export async function previewRoutineMerge(
  sourceId: string,
  destinationId: string,
) {
  return db.transaction('r', db.tables, async () => {
    const source = await db.routines.get(sourceId),
      destination = await db.routines.get(destinationId);
    if (
      !source ||
      !destination ||
      source.status === 'archived' ||
      destination.status === 'archived' ||
      sourceId === destinationId
    )
      throw new Error('Escolha duas rotinas disponíveis e diferentes.');
    const tasks = await db.tasks.bulkGet([
      ...new Set(
        [...source.entries, ...destination.entries].map(
          (entry) => entry.taskId,
        ),
      ),
    ]);
    if (tasks.some((task) => !task))
      throw new Error(
        'Uma missão vinculada não está disponível. Atualize as rotinas.',
      );
    const entries = [
      ...destination.entries,
      ...source.entries
        .filter(
          (entry) =>
            !destination.entries.some((old) => old.taskId === entry.taskId),
        )
        .map((entry) => ({ ...entry, days: [...(entry.days ?? source.days)] })),
    ];
    const conflicts: string[] = [];
    const days = (entry: (typeof entries)[number]) =>
      entry.days ?? destination.days;
    for (let i = 0; i < entries.length; i++)
      for (let j = i + 1; j < entries.length; j++) {
        const a = tasks.find((task) => task?.id === entries[i].taskId)!;
        const b = tasks.find((task) => task?.id === entries[j].taskId)!;
        if (
          a.title.trim().toLocaleLowerCase('pt-BR') ===
          b.title.trim().toLocaleLowerCase('pt-BR')
        )
          conflicts.push(
            `“${a.title}”: cadastros diferentes com o mesmo nome serão mantidos separadamente.`,
          );
        if (
          entries[i].time &&
          entries[j].time &&
          days(entries[i]).some((day) => days(entries[j]).includes(day))
        ) {
          const number = (time: string) =>
            Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
          const aStart = number(entries[i].time!),
            bStart = number(entries[j].time!);
          if (
            aStart < bStart + (b.estimatedMinutes ?? 30) &&
            bStart < aStart + (a.estimatedMinutes ?? 30)
          )
            conflicts.push(
              `Horários sobrepostos: “${a.title}” e “${b.title}”. As duas missões serão mantidas com seus horários.`,
            );
        }
      }
    if (source.status !== destination.status)
      conflicts.push(
        `O estado final das missões transferidas seguirá o destino: ${destination.status === 'active' ? 'ativa' : 'pausada'}.`,
      );
    if (source.defaultAreaId !== destination.defaultAreaId)
      conflicts.push(
        'A área padrão do destino prevalece para novas missões; áreas das missões existentes são preservadas.',
      );
    return {
      source,
      destination,
      tasks,
      entries,
      conflicts,
      token: JSON.stringify({ source, destination, tasks }),
    };
  });
}
export async function mergeRoutines(
  sourceId: string,
  destinationId: string,
  token: string,
  requestId: string,
) {
  if (!/^[\w:-]{1,120}$/.test(requestId))
    throw new Error('Reabra a mesclagem para continuar.');
  return progressTransaction(async () => {
    const prior = await db.productivityAudit.get(requestId);
    if (prior) {
      if (
        prior.action !== 'routine-merge' ||
        prior.entityId !== sourceId ||
        (prior.after as { destinationId: string }).destinationId !==
          destinationId
      )
        throw new Error('Identificador já utilizado.');
      return;
    }
    const preview = await previewRoutineMerge(sourceId, destinationId);
    if (preview.token !== token)
      throw new Error(
        'As rotinas ou suas missões mudaram. Atualize a prévia antes de confirmar.',
      );
    for (const entry of preview.source.entries) {
      const task = (await db.tasks.get(entry.taskId))!;
      if (task.routineId !== sourceId)
        throw new Error('O vínculo de uma missão mudou. Atualize a prévia.');
      const actual = preview.entries.find(
        (item) => item.taskId === entry.taskId,
      )!;
      await db.tasks.update(task.id!, {
        routineId: destinationId,
        plannedTime: actual.time,
        planningPaused: preview.destination.status !== 'active',
        definitionRevision: (task.definitionRevision ?? 0) + 1,
      });
      await savePlanVersion((await db.tasks.get(task.id!))!);
    }
    await db.routines.update(destinationId, {
      entries: preview.entries,
      revision: preview.destination.revision + 1,
    });
    await db.routines.update(sourceId, {
      entries: [],
      status: 'archived',
      mergedInto: destinationId,
      revision: preview.source.revision + 1,
    });
    await db.productivityAudit.add({
      id: requestId,
      entityId: sourceId,
      action: 'routine-merge',
      recordedAt: new Date().toISOString(),
      before: { source: preview.source, destination: preview.destination },
      after: { destinationId },
    });
  });
}
