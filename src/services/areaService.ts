import { db } from './db';

function areaName(value: string) {
  const name = value.trim();
  if (!name || name.length > 80)
    throw new Error('Escreva um nome de até 80 caracteres.');
  return name;
}
export async function saveArea(name: string, id?: number) {
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
      await db.areas.update(id, { nome });
      return id;
    }
    return db.areas.add({ nome });
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
