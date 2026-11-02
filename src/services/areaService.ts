import { db } from './db';
import { isTaskIconKey } from '$lib/content/visualAssets';

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
) {
  if (iconKey != null && !isTaskIconKey(iconKey))
    throw new Error('Escolha um ícone da biblioteca disponível.');
  const nome = areaName(name);
  return db.transaction('rw', db.areas, async () => {
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
        ...(iconKey !== undefined ? { iconKey, iconConflict: false } : {}),
      });
      return id;
    }
    return db.areas.add({ nome, iconKey: iconKey ?? null });
  });
}
export async function deleteArea(id: number, destination = 0) {
  await db.transaction('rw', db.areas, db.tasks, async () => {
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
    // XP logs and event receipts are immutable historical records.
    await db.areas.delete(id);
  });
}
