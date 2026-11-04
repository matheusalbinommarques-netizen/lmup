import { describe, it, expect } from 'vitest';
import { campScene, resolveCampScene, CENTER_ROOT } from './scenes';
import { ECO_STAGES } from '$services/ecoConfig';
describe('cenas modulares do Acampamento', () => {
  it('tem apenas caseiro e Outras áreas antes da compra, sem árvore física', () => {
    const scene = campScene('center', false, 12000);
    expect(scene.points.map((p) => p.id)).toEqual(['caretaker', 'preparation']);
    expect(scene.canvas.layers.map((l) => l.id)).toEqual(['empty-footprints']);
    expect(scene.canvas.layers.some((l) => l.id === 'tree')).toBe(false);
  });
  it('habilita diretamente interior, Bestiário e Jardim após a compra', () => {
    const scene = campScene('center', true, 0);
    expect(scene.points.map((p) => p.id)).toEqual([
      'bestiary',
      'caretaker',
      'interior',
      'garden',
      'preparation',
    ]);
    expect(scene.points.some((p) => p.id === 'exterior')).toBe(false);
  });
  it('mantém Centro e Jardim no mesmo estágio da fonte canônica', () => {
    for (const stage of ECO_STAGES) {
      const center = campScene('center', true, stage.minXp),
        garden = campScene('garden', true, stage.minXp);
      const a = center.canvas.layers.find((l) => l.id === 'tree')!,
        b = garden.canvas.layers.find((l) => l.id === 'tree')!;
      expect(a.src).toBe(b.src);
      expect(a.position).toEqual(CENTER_ROOT);
      expect(center.canvas.background).toBe(
        '/art/camp-modular/center-built.webp',
      );
      expect(garden.canvas.background).toBe(
        '/art/camp-modular/approved-garden.png',
      );
    }
  });
  it('conserva base e primeiro plano enquanto muda só a árvore/vegetação e runas', () => {
    const first = campScene('center', true, 0),
      last = campScene('center', true, 12000);
    expect(first.canvas.background).toBe(last.canvas.background);
    expect(first.canvas.layers.find((l) => l.id === 'bed-foreground')).toEqual(
      last.canvas.layers.find((l) => l.id === 'bed-foreground'),
    );
    expect(first.canvas.width).toBe(last.canvas.width);
    expect(first.canvas.height).toBe(last.canvas.height);
  });
  it('resolve links antigos sem recriar o exterior e bloqueia acessos não construídos', () => {
    expect(resolveCampScene('exterior', true)).toBe('interior');
    for (const name of ['garden', 'interior', 'bestiary', 'exterior'])
      expect(resolveCampScene(name, false)).toBe('center');
    for (const name of ['workshops', 'expansion'])
      expect(resolveCampScene(name, false)).toBe('preparation');
    expect(resolveCampScene('unknown', true)).toBe('center');
  });
});
