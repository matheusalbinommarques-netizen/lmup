import { describe, it, expect } from 'vitest';
import { ECO_STAGES, getEcoStageForTotalXp } from '$services/ecoConfig';
import { GARDEN_ROOT, GARDEN_HOTSPOT, getGardenScene } from './gardenProof';
import { sortSceneLayers } from './sceneTypes';
describe('prova isolada do Jardim', () => {
  it.each([
    [0, 1],
    [2499, 1],
    [2500, 2],
    [7499, 2],
    [7500, 3],
    [11999, 3],
    [12000, 4],
    [999999, 4],
  ])('preserva o limite de %i XP no estágio %i', (xp, stage) => {
    expect(getGardenScene(xp).id).toBe('garden-' + stage);
  });
  it('mantém paisagem, câmera, pedras, raízes e hotspot no mesmo referencial', () => {
    const scenes = ECO_STAGES.map((s) => getGardenScene(s.minXp));
    expect(new Set(scenes.map((s) => s.background)).size).toBe(1);
    for (const scene of scenes) {
      expect([scene.width, scene.height]).toEqual([836, 470]);
      expect(scene.layers.find((l) => l.id === 'tree')?.position).toEqual(
        GARDEN_ROOT,
      );
      expect(scene.hotspot.position).toEqual(GARDEN_HOTSPOT);
      for (const id of ['repair', 'foreground', 'rune-stones']) {
        expect(scene.layers.find((l) => l.id === id)).toEqual(
          scenes[0].layers.find((l) => l.id === id),
        );
      }
    }
    expect(
      new Set(scenes.map((s) => s.layers.find((l) => l.id === 'tree')?.src))
        .size,
    ).toBe(4);
  });
  it('permite inspecionar o terreno sem árvore nem sombra e sem alterar a configuração canônica', () => {
    const before = structuredClone(ECO_STAGES);
    const scene = getGardenScene(12000, { tree: false, vegetation: false });
    expect(scene.layers.find((l) => l.id === 'tree')?.opacity).toBe(0);
    expect(scene.layers.find((l) => l.id === 'contact-shadow')?.opacity).toBe(
      0,
    );
    expect(scene.layers.find((l) => l.id === 'vegetation')?.opacity).toBe(0);
    expect(ECO_STAGES).toEqual(before);
    expect(getEcoStageForTotalXp(12000).goldRewardOnEnter).toBe(1000);
  });
  it('não deixa uma amostra inválida escapar do estágio inicial', () => {
    for (const xp of [NaN, Infinity, -10])
      expect(getGardenScene(xp).id).toBe('garden-1');
  });
  it('ordena profundidade sem mutar a declaração de camadas', () => {
    const scene = getGardenScene(0);
    const original = scene.layers.slice().reverse();
    const before = [...original];
    expect(sortSceneLayers(original).map((l) => l.depth)).toEqual([
      1, 3, 4, 5, 7, 8, 9,
    ]);
    expect(original).toEqual(before);
  });
});
