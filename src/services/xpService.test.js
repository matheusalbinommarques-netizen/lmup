// Importa as ferramentas de teste (globais, graças ao config)
import { describe, it, expect } from 'vitest';

// Importa a função que queremos testar
import { calcularNivel } from './xpService.js';

// 'describe' agrupa uma suíte de testes
describe('xpService: calcularNivel', () => {
  // 'it' (ou 'test') define um caso de teste específico
  it('deve retornar Nível 1 para 0 XP', () => {
    const totalXp = 0;
    const stats = calcularNivel(totalXp);

    // 'expect' é a nossa asserção (o que esperamos que aconteça)
    expect(stats.nivel).toBe(1);
    expect(stats.progresso).toBe(0);
    expect(stats.xpAtualNesteNivel).toBe(0);
    expect(stats.xpParaProximoNivel).toBe(100); // Nível 1 -> 2 = 100 XP
  });

  it('deve calcular corretamente o progresso no Nível 1', () => {
    const totalXp = 50;
    const stats = calcularNivel(totalXp);

    expect(stats.nivel).toBe(1);
    expect(stats.progresso).toBe(50); // 50 / 100 XP
    expect(stats.xpAtualNesteNivel).toBe(50);
  });

  it('deve subir para o Nível 2 exatamente com 100 XP', () => {
    const totalXp = 100;
    const stats = calcularNivel(totalXp);

    expect(stats.nivel).toBe(2);
    expect(stats.progresso).toBe(0); // 0% do novo nível
    expect(stats.xpAtualNesteNivel).toBe(0);
    expect(stats.xpParaProximoNivel).toBe(200); // Nível 2 -> 3 = 200 XP
  });

  it('deve calcular o progresso no Nível 2', () => {
    // Nível 1 (100 XP) + 50 XP = 150 XP
    const totalXp = 150;
    const stats = calcularNivel(totalXp);

    expect(stats.nivel).toBe(2);
    expect(stats.progresso).toBe(25); // 50 / 200 XP
    expect(stats.xpAtualNesteNivel).toBe(50);
  });

  it('deve subir para o Nível 3 com 300 XP', () => {
    // Nível 1 (100 XP) + Nível 2 (200 XP) = 300 XP
    const totalXp = 300;
    const stats = calcularNivel(totalXp);

    expect(stats.nivel).toBe(3);
    expect(stats.progresso).toBe(0);
    expect(stats.xpAtualNesteNivel).toBe(0);
    expect(stats.xpParaProximoNivel).toBe(300); // Nível 3 -> 4 = 300 XP
  });

  it('deve lidar com XP muito alto (Nível 4)', () => {
    // Nv 1 (100) + Nv 2 (200) + Nv 3 (300) + 50 XP = 650 XP
    const totalXp = 650;
    const stats = calcularNivel(totalXp);

    expect(stats.nivel).toBe(4);
    expect(stats.progresso).toBe(12); // 50 / 400 XP = 12.5% (Math.floor)
    expect(stats.xpAtualNesteNivel).toBe(50);
  });
});