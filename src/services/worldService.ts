import { db } from './db';
import {
  hotspots,
  clues,
  personalTasks,
  type SceneId,
  type HotspotId,
} from '$lib/world/content';
import {
  createWorld,
  validateWorld,
  evidenceComplete,
  type WorldState,
} from '$lib/world/worldState';
export type WorldCommand =
  | { type: 'enter'; scene: SceneId }
  | { type: 'inspect'; id: HotspotId }
  | { type: 'collect' }
  | { type: 'talk' }
  | {
      type: 'choose';
      choice:
        'ask' | 'accept' | 'hint' | 'review' | 'rescue' | 'route' | 'leave';
    };
export async function ensureWorld() {
  return db.transaction('rw', db.profile, async () => {
    const p = await db.profile.get(1);
    if (!p) throw Error('Abra sua jornada antes de explorar.');
    if (p.world) {
      validateWorld(p.world);
      return p.world;
    }
    const world = createWorld();
    await db.profile.update(1, { world });
    return world;
  });
}
export async function actInWorld(
  command: WorldCommand,
  expected: { epoch: string; revision: number },
  requestId: string,
): Promise<WorldState> {
  if (!/^[\w:-]{1,120}$/.test(requestId))
    throw Error('Reabra esta ação para tentar novamente.');
  return db.transaction('rw', db.profile, async () => {
    const p = await db.profile.get(1);
    if (!p?.world) throw Error('Abra o Mundo antes de continuar.');
    validateWorld(p.world);
    const current = p.world,
      signature = JSON.stringify(command),
      prior = current.receipts.find((x) => x.id === requestId);
    if (prior) {
      if (prior.signature !== signature)
        throw Error('Operação já utilizada com outra escolha.');
      return current;
    }
    if (
      current.epoch !== expected.epoch ||
      current.revision !== expected.revision
    )
      throw Error(
        'O Mundo mudou em outra aba ou foi restaurado. Confira a cena atual e tente novamente.',
      );
    const w = structuredClone(current);
    const log = (id: string, text: string) => {
      if (!w.journal.some((x) => x.id === id))
        w.journal.push({ id, text, at: new Date().toISOString() });
    };
    if (command.type === 'enter') {
      if (!['settlement', 'outskirts'].includes(command.scene))
        throw Error('Cena indisponível.');
      if (command.scene === 'outskirts' && w.quest === 'new')
        throw Error('Converse com Lucan antes de sair para investigar.');
      w.lastScene = command.scene;
      delete w.focus;
      delete w.dialogue;
      if (!w.visitedScenes.includes(command.scene))
        w.visitedScenes.push(command.scene);
    } else if (command.type === 'inspect') {
      const point = hotspots.find(
        (x) => x.id === command.id && x.scene === w.lastScene,
      );
      if (!point) throw Error('Este ponto não está nesta cena.');
      if (point.id === 'lucan')
        throw Error('Use a conversa para falar com Lucan.');
      w.focus = point.id;
      delete w.dialogue;
    } else if (command.type === 'collect') {
      const point = hotspots.find(
        (x) => x.id === w.focus && x.scene === w.lastScene,
      );
      if (w.quest !== 'active' || !point || !('clue' in point))
        throw Error('Não há uma pista da investigação para registrar aqui.');
      if (!w.clues.includes(point.clue)) {
        w.clues.push(point.clue);
        log(
          `clue:${point.clue}`,
          `${clues[point.clue].name}: ${clues[point.clue].text}`,
        );
      }
    } else if (command.type === 'talk') {
      if (w.lastScene !== 'settlement')
        throw Error('Lucan está no assentamento.');
      delete w.focus;
      w.dialogue =
        w.quest === 'solved'
          ? 'ending'
          : w.quest === 'new'
            ? 'welcome'
            : evidenceComplete(w)
              ? 'report'
              : 'progress';
    } else if (command.type === 'choose') {
      const node = w.dialogue;
      if (!node) throw Error('Abra a conversa antes de responder.');
      const choice = command.choice;
      if (choice === 'leave') delete w.dialogue;
      else if (choice === 'ask' && node === 'welcome') w.dialogue = 'briefing';
      else if (
        choice === 'accept' &&
        ['welcome', 'briefing'].includes(node) &&
        w.quest === 'new'
      ) {
        w.quest = 'active';
        w.dialogue = 'progress';
        if (!w.discovered.includes('variel')) w.discovered.push('variel');
        log(
          'quest:accepted',
          'Você aceitou investigar o atraso da caravana. Lucan indicou o caminho dos arredores e o Entreposto de Variel.',
        );
      } else if (choice === 'hint' && node === 'progress') w.dialogue = 'hint';
      else if (
        choice === 'review' &&
        ['report', 'evidence'].includes(node) &&
        evidenceComplete(w)
      )
        w.dialogue = node === 'report' ? 'evidence' : 'report';
      else if (
        ['rescue', 'route'].includes(choice) &&
        ['report', 'evidence'].includes(node) &&
        w.quest === 'active' &&
        evidenceComplete(w)
      ) {
        w.quest = 'solved';
        w.resolution = choice as 'rescue' | 'route';
        w.dialogue = 'ending';
        log(
          'quest:solved',
          'A carroça parou por um eixo quebrado. Os carregadores voltaram ao Oásis com parte dos mantimentos; a carga restante ficou junto à carroça. ' +
            personalTasks[w.resolution].journal,
        );
      } else throw Error('Esta resposta não está disponível no momento.');
    } else throw Error('Ação desconhecida.');
    if (JSON.stringify(w) === JSON.stringify(current)) return current;
    w.revision++;
    w.receipts = [...w.receipts, { id: requestId, signature }].slice(-128);
    validateWorld(w);
    await db.profile.update(1, { world: w });
    return w;
  });
}
