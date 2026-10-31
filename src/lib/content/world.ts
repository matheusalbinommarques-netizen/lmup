import { destinations, homeCopy, executionCopy } from './experience';

// Presentation catalog. Keys and numeric progression IDs remain stable when lore changes.
export const companionContent = {
  wolf: {
    name: 'Lobo Etéreo',
    type: 'Caçador das Sombras',
    images: [
      '/art/companions-v2/wolf-1.webp',
      '/art/companions-v2/wolf-2.webp',
      '/art/companions-v2/wolf-3.webp',
    ],
    pilot: '/art/companions-v2/wolf-1.webp',
  },
  lich: {
    name: 'Lorde Lich',
    type: 'Mago Imortal',
    images: [
      '/art/companions-v2/lich-1.webp',
      '/art/companions-v2/lich-2.webp',
      '/art/companions-v2/lich-3.webp',
    ],
  },
  dragon: {
    name: 'Dragão Ancião',
    type: 'Guardião de Chamas',
    images: [
      '/art/companions-v2/dragon-1.webp',
      '/art/companions-v2/dragon-2.webp',
      '/art/companions-v2/dragon-3.webp',
    ],
  },
  aberration: {
    name: 'Aberração Abissal',
    type: 'Eco do Vazio',
    images: [
      '/art/companions-v2/aberration-1.webp',
      '/art/companions-v2/aberration-2.webp',
      '/art/companions-v2/aberration-3.webp',
    ],
  },
} as const;

export const sanctuaryContent = {
  1: {
    label: 'Semente',
    image: '/art/bg/eco-stage-1-seed.webp',
    pilot: '/art/pilot/scene-1.webp',
    description: 'Um começo pequeno já muda a paisagem.',
  },
  2: {
    label: 'Brotinho',
    image: '/art/bg/eco-stage-2-sprout.webp',
    pilot: '/art/pilot/scene-2.webp',
    description: 'As primeiras folhas encontram seu espaço.',
  },
  3: {
    label: 'Árvore Jovem',
    image: '/art/bg/eco-stage-3-tree.webp',
    pilot: '/art/pilot/scene-3.webp',
    description: 'O que você cultivou começa a ganhar forma.',
  },
  4: {
    label: 'Floresta Anciã',
    image: '/art/bg/eco-stage-4-forest.webp',
    pilot: '/art/pilot/scene-4.webp',
    description: 'Uma paisagem construída um passo de cada vez.',
  },
} as const;

export const journeyCopy = {
  ...destinations,
  welcome: homeCopy.title,
  companionMessage: homeCopy.companion,
  completion: executionCopy.completion,
};
