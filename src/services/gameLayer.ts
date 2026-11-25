import { readable } from 'svelte/store';
import { liveQuery } from 'dexie';
import { db, type Profile } from './db';
import { resolveFirstUseStep } from './firstUse';

/**
 * Camada de jogo (lote 4b, design "LMUP Hoje" D1–D3). Só muda o que aparece
 * na tela: XP, ouro, comida e recibos continuam sendo registrados em
 * qualquer camada, então ligar o jogo depois não perde nada.
 * - completa: Jornada na navegação, um cartão de jogo no Hoje;
 * - discreta: uma linha de XP; Jornada no rodapé da lateral / "Mais";
 * - desligada: nada de XP, ouro ou comida nas telas de produtividade.
 */
export const GAME_LAYERS = ['completa', 'discreta', 'desligada'] as const;
export type GameLayer = (typeof GAME_LAYERS)[number];

export const gameLayerLabels: Record<
  GameLayer,
  { title: string; description: string }
> = {
  completa: {
    title: 'Completa',
    description: 'Herói, Acampamento e recompensas visíveis.',
  },
  discreta: {
    title: 'Discreta',
    description:
      'Uma linha de XP; a Jornada fica no rodapé da lateral ou em "Mais".',
  },
  desligada: {
    title: 'Desligada',
    description:
      'Só produtividade e método. XP e ouro continuam guardados, sem aparecer.',
  },
};

export const isGameLayer = (value: unknown): value is GameLayer =>
  typeof value === 'string' &&
  (GAME_LAYERS as readonly string[]).includes(value);

/**
 * Usuários atuais (sem preferência gravada) continuam na camada Completa.
 * Perfis novos (lote 7) já nascem com 'discreta' gravada.
 */
export const gameLayerOf = (profile?: Pick<Profile, 'gameLayer'> | null) =>
  isGameLayer(profile?.gameLayer) ? profile.gameLayer : 'completa';

export async function setGameLayer(layer: GameLayer) {
  if (!isGameLayer(layer)) throw new Error('Camada de jogo inválida.');
  await db.transaction('rw', db.profile, async () => {
    const profile = await db.profile.get(1);
    if (!profile) throw new Error('Abra sua jornada primeiro.');
    // Escolher a camada (aqui ou em Configurações) resolve o passo do
    // primeiro uso, inclusive quando a camada já era a escolhida.
    await resolveFirstUseStep('layer', 'done');
    if (profile.gameLayer === layer) return;
    await db.profile.update(1, { gameLayer: layer });
  });
}

function applyToDocument(layer: GameLayer) {
  if (typeof document !== 'undefined')
    document.documentElement.dataset.gameLayer = layer;
}

/** Camada atual, viva entre abas; 'completa' até o banco responder. */
export const gameLayer = readable<GameLayer>('completa', (set) => {
  if (typeof indexedDB === 'undefined') return;
  const sub = liveQuery(() => db.profile.get(1)).subscribe({
    next: (profile) => {
      const layer = gameLayerOf(profile);
      applyToDocument(layer);
      set(layer);
    },
    error: () => applyToDocument('completa'),
  });
  return () => sub.unsubscribe();
});
