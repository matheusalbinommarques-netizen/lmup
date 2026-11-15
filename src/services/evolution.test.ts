import { describe, expect, it } from 'vitest';
import type { ActivityEvent, Area, HeroProject, Task } from './db';
import type { ExecutionRecord, Occurrence } from './productivityTypes';
import { evolutionView, type EvolutionInput } from './evolution';

const TODAY = '2026-11-15';
let seq = 0;
const task = (id: number, extra: Partial<Task> = {}) =>
  ({
    id,
    title: `Missão ${id}`,
    completed: false,
    archived: false,
    areaId: 1,
    createdAt: '2026-10-01T10:00:00.000Z',
    ...extra,
  }) as Task;
const event = (date: string, extra: Partial<ActivityEvent> = {}) =>
  ({
    id: `e${++seq}`,
    kind: 'task',
    sequence: seq,
    date,
    occurredAt: `${date}T10:00:00.000Z`,
    ...extra,
  }) as ActivityEvent;
const project = (id: number, extra: Partial<HeroProject> = {}) =>
  ({
    id,
    name: `Projeto ${id}`,
    status: 'em_andamento',
    createdAt: '2026-10-20T10:00:00.000Z',
    ...extra,
  }) as HeroProject;
const record = (localDate: string, minutes: number | null, extra = {}) =>
  ({
    id: `r${++seq}`,
    occurrenceId: 'o1',
    localDate,
    minutes,
    correction: false,
    ...extra,
  }) as ExecutionRecord;

const base = (extra: Partial<EvolutionInput> = {}): EvolutionInput => ({
  profile: {
    lifeWheel: {
      version: 1,
      checkins: [
        { id: 'c1', at: '2026-11-09T12:00:00.000Z', ratings: { home: 3 } },
      ],
      focus: { home: { since: '2026-11-09', intention: 'Receber visita' } },
    },
  },
  areas: [{ id: 1, nome: 'Casa', domain: 'home' } as Area],
  tasks: [],
  events: [],
  routines: [],
  occurrences: [],
  projects: [],
  executionRecords: [],
  plannedToday: [],
  ...extra,
});

describe('Evolução: focos atuais', () => {
  it('mostra só as áreas em foco, com sentimento, intenção e faixa de 30 dias', () => {
    const view = evolutionView(
      base({
        tasks: [task(1)],
        events: [
          event('2026-11-15', { taskId: 1 }),
          event('2026-10-17', { taskId: 1 }),
          event('2026-10-16', { taskId: 1 }), // fora da janela atual
        ],
      }),
      TODAY,
    );
    expect(view.focus).toHaveLength(1);
    const [home] = view.focus;
    expect(home).toMatchObject({
      key: 'home',
      rating: 3,
      activeDays: 2,
      previousActiveDays: 1,
      intention: 'Receber visita',
    });
    expect(home.strip).toHaveLength(30);
    expect(home.strip[0]).toBe(true); // 17/10 abre a janela de 30 dias
    expect(home.strip[1]).toBe(false);
    expect(home.strip[29]).toBe(true);
    expect(home.strip.filter(Boolean)).toHaveLength(2);
    expect(view.lastCheckin).toBe('2026-11-09');
  });

  it('sem avaliação nem foco, a lista fica vazia', () => {
    const view = evolutionView(base({ profile: {} }), TODAY);
    expect(view.focus).toEqual([]);
    expect(view.hasCheckins).toBe(false);
  });
});

describe('Evolução: projetos ativos', () => {
  it('lista ativos com progresso, próxima ação pela ordem das etapas e área', () => {
    const view = evolutionView(
      base({
        projects: [
          project(1, {
            areaId: 1,
            stages: [
              { id: 'a', title: 'A' },
              { id: 'b', title: 'B' },
            ],
          }),
          project(2, { status: 'concluido' }),
          project(3, { status: 'arquivado' }),
          project(4, { status: 'planejando', areaId: null }),
        ],
        tasks: [
          task(10, { projectId: 1, projectStageId: 'b' }),
          task(11, { projectId: 1, projectStageId: 'a', completed: true }),
          task(12, { projectId: 1, projectStageId: 'a' }),
          task(13, { projectId: 1, archived: true }),
        ],
      }),
      TODAY,
    );
    expect(view.projects.map((row) => row.id)).toEqual([1, 4]);
    expect(view.projects[0]).toMatchObject({
      areaName: 'Casa',
      done: 1,
      total: 3,
      next: { taskId: 12, title: 'Missão 12' },
      when: null,
    });
    expect(view.projects[1]).toMatchObject({
      areaName: 'Sem área',
      next: null,
      staleDays: null,
    });
    expect(view.completedProjects).toBe(1);
  });

  it('marca "no dia de hoje" e data futura da próxima ação', () => {
    const tasks = [
      task(10, { projectId: 1 }),
      task(20, { projectId: 2, plannedDate: '2026-11-18' }),
    ];
    const view = evolutionView(
      base({
        projects: [project(1), project(2)],
        tasks,
        plannedToday: [{ taskId: 10 } as Occurrence],
      }),
      TODAY,
    );
    const byId = new Map(view.projects.map((row) => [row.id, row]));
    expect(byId.get(1)?.when).toBe('today');
    expect(byId.get(2)?.when).toBe('2026-11-18');
  });

  it('parada: 14 dias sem ação conta desde a criação ou a última conclusão', () => {
    const view = evolutionView(
      base({
        projects: [
          project(1, { createdAt: '2026-10-23T10:00:00.000Z' }),
          project(2, { createdAt: '2026-11-02T10:00:00.000Z' }),
          project(3, { createdAt: '2026-10-01T10:00:00.000Z' }),
          project(4, {
            createdAt: '2026-10-01T10:00:00.000Z',
            status: 'pausado',
          }),
        ],
        tasks: [
          task(10, { projectId: 1 }),
          task(20, { projectId: 2 }),
          task(30, { projectId: 3 }),
          task(31, { projectId: 3, completed: true }),
          task(40, { projectId: 4 }),
        ],
        events: [event('2026-11-10', { taskId: 31 })],
      }),
      TODAY,
    );
    const byId = new Map(view.projects.map((row) => [row.id, row]));
    expect(byId.get(1)?.staleDays).toBe(23);
    expect(byId.get(2)?.staleDays).toBeNull(); // 13 dias
    expect(byId.get(3)?.staleDays).toBeNull(); // concluiu há 5 dias
    expect(byId.get(4)?.staleDays).toBeNull(); // pausado não é parado
  });

  it('conclusão estornada não conta como ação no projeto', () => {
    const view = evolutionView(
      base({
        projects: [project(1, { createdAt: '2026-10-01T10:00:00.000Z' })],
        tasks: [task(10, { projectId: 1 }), task(11, { projectId: 1 })],
        events: [event('2026-11-14', { taskId: 11, reversedAt: '2026-11-14' })],
      }),
      TODAY,
    );
    expect(view.projects[0].staleDays).toBe(45);
  });
});

describe('Evolução: meu progresso (30 dias)', () => {
  it('soma esforço, progresso de projeto e projetos concluídos na janela', () => {
    const view = evolutionView(
      base({
        projects: [
          project(1),
          project(2, { status: 'concluido', name: 'Garagem' }),
        ],
        tasks: [
          task(10, { projectId: 1 }),
          task(11),
          task(12, { projectId: 2 }),
        ],
        events: [
          event('2026-11-14', { taskId: 10 }),
          event('2026-11-01', { taskId: 12 }),
          event('2026-11-13', { taskId: 11 }),
          event('2026-11-12', { taskId: 11, kind: 'review' }),
          event('2026-11-11', { taskId: 11, reversedAt: '2026-11-11' }),
          event('2026-11-10', { taskId: 11, executionComplete: false }),
          event('2026-10-01', { taskId: 11 }),
          event('2026-11-14', { kind: 'project', projectId: 2 }),
          event('2026-11-14', {
            kind: 'project',
            projectId: 1,
            reversedAt: '2026-11-14',
          }),
        ],
        executionRecords: [
          record('2026-11-14', 40),
          record('2026-11-13', null),
          record('2026-11-13', 25, { correction: true }),
          record('2026-10-01', 90),
        ],
      }),
      TODAY,
    );
    expect(view.progress).toEqual({
      missions: 4,
      minutes: 40,
      projectMissions: 2,
      projectsTouched: 1, // o projeto concluído não entra entre os ativos
      finished: ['Garagem'],
    });
  });

  it('execução corrigida a zero não conta como missão concluída', () => {
    const view = evolutionView(
      base({
        tasks: [task(11)],
        occurrences: [{ id: 'o9', taskId: 11, value: 0 } as Occurrence],
        events: [event('2026-11-14', { taskId: 11, occurrenceId: 'o9' })],
      }),
      TODAY,
    );
    expect(view.progress.missions).toBe(0);
  });
});
