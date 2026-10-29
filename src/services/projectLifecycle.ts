import { db } from './db';
import { revokeRewards } from './rewardService';
export async function reopenProjectForWork(id: number) {
  const project = await db.projects.get(id);
  if (!project) throw new Error('O projeto não está mais disponível.');
  if (project.status === 'arquivado')
    throw new Error('Restaure o projeto antes de associar missões.');
  if (project.rewardGranted) {
    if (!project.rewardEventId)
      throw new Error(
        'Este bônus é antigo e não permite estorno exato. Preserve o projeto e crie um novo para continuar.',
      );
    await revokeRewards([project.rewardEventId]);
    await db.projects.update(id, {
      rewardGranted: false,
      rewardEventId: null,
      rewardRevision: (project.rewardRevision ?? 0) + 1,
    });
  }
  if (project.status === 'concluido' || project.rewardGranted)
    await db.projects.update(id, {
      status: 'em_andamento',
      updatedAt: new Date(),
      revision: (project.revision ?? 0) + 1,
    });
}
