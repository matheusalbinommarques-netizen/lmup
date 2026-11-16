import { describe, expect, it } from 'vitest';
import {
  dayLabel,
  destinationLabel,
  minutesLabel,
  parseCapture,
  sentence,
} from './capture';

// Sábado, 14 de novembro de 2026 (dia do design P2).
const today = '2026-11-14';

describe('parseCapture', () => {
  it('reads weekday and duration like the design example', () => {
    const capture = parseCapture('Ligar para o seguro 30min sex', today);
    expect(capture.title).toBe('Ligar para o seguro');
    expect(capture.destination).toEqual({ kind: 'day', date: '2026-11-20' });
    expect(capture.estimatedMinutes).toBe(30);
    expect(capture.tokens.map((token) => token.text)).toEqual(['30min', 'sex']);
    expect(destinationLabel(capture, today)).toBe('Sexta, 20 nov.');
  });

  it('sends text without a day to the inbox, or to today from the Hoje', () => {
    expect(parseCapture('Comprar presente', today).destination).toEqual({
      kind: 'inbox',
    });
    expect(parseCapture('Comprar presente', today).plannedDate).toBeNull();
    const fromToday = parseCapture('Comprar presente', today, 'today');
    expect(fromToday.destination).toEqual({ kind: 'today', date: today });
    expect(fromToday.plannedDate).toBe(today);
  });

  it('reads hoje, amanhã and depois de amanhã', () => {
    expect(parseCapture('Pagar luz hoje', today).destination).toEqual({
      kind: 'today',
      date: today,
    });
    expect(parseCapture('Pagar luz amanhã', today).plannedDate).toBe(
      '2026-11-15',
    );
    expect(parseCapture('Pagar luz amanha', today).plannedDate).toBe(
      '2026-11-15',
    );
    const later = parseCapture('Pagar luz depois de amanhã', today);
    expect(later.plannedDate).toBe('2026-11-16');
    expect(later.title).toBe('Pagar luz');
  });

  it('reads algum dia without a date or time', () => {
    const capture = parseCapture('Aprender a fazer pão algum dia', today);
    expect(capture.someday).toBe(true);
    expect(capture.plannedDate).toBeNull();
    expect(capture.title).toBe('Aprender a fazer pão');
    expect(destinationLabel(capture, today)).toBe('Algum dia');
    // Mesmo no Hoje, "algum dia" vence o padrão.
    expect(parseCapture('Horta algum dia', today, 'today').someday).toBe(true);
  });

  it('reads weekdays as the next one, and the same weekday as today', () => {
    expect(parseCapture('Feira no sábado', today).plannedDate).toBe(today);
    expect(parseCapture('Reunião na segunda', today).plannedDate).toBe(
      '2026-11-16',
    );
    expect(parseCapture('Reunião segunda-feira', today).plannedDate).toBe(
      '2026-11-16',
    );
    expect(parseCapture('Natação qua', today).plannedDate).toBe('2026-11-18');
    expect(parseCapture('Consertar terça', today).plannedDate).toBe(
      '2026-11-17',
    );
  });

  it('does not read the verb "ter" or words that contain weekdays', () => {
    const capture = parseCapture('Ter conversa com o sexteto', today);
    expect(capture.plannedDate).toBeNull();
    expect(capture.title).toBe('Ter conversa com o sexteto');
  });

  it('reads numeric dates, rolling past ones to the next year or month', () => {
    expect(parseCapture('Renovar CNH 20/11', today).plannedDate).toBe(
      '2026-11-20',
    );
    expect(parseCapture('Renovar CNH 10/11', today).plannedDate).toBe(
      '2027-11-10',
    );
    expect(parseCapture('Renovar CNH 10/11/2026', today).plannedDate).toBe(
      '2026-11-10',
    );
    expect(parseCapture('Aluguel dia 20', today).plannedDate).toBe(
      '2026-11-20',
    );
    expect(parseCapture('Aluguel dia 5', today).plannedDate).toBe('2026-12-05');
    expect(parseCapture('Aluguel dia 5', '2026-12-14').plannedDate).toBe(
      '2027-01-05',
    );
    expect(parseCapture('Data 31/02', today).plannedDate).toBeNull();
  });

  it('reads times and durations without confusing them', () => {
    const meeting = parseCapture('Reunião às 14h 1h', today);
    expect(meeting.plannedTime).toBe('14:00');
    expect(meeting.estimatedMinutes).toBe(60);
    expect(meeting.title).toBe('Reunião');
    // Hora sem dia vale para hoje.
    expect(meeting.destination).toEqual({ kind: 'today', date: today });
    expect(destinationLabel(meeting, today)).toBe('Hoje, 14:00');
    expect(parseCapture('Dentista 16:30 sex', today).plannedTime).toBe('16:30');
    expect(parseCapture('Dentista 9h30', today).plannedTime).toBe('09:30');
    expect(parseCapture('Estudar 1h30', today).estimatedMinutes).toBe(90);
    expect(parseCapture('Estudar 2 horas', today).estimatedMinutes).toBe(120);
    expect(parseCapture('Estudar 45 min', today).estimatedMinutes).toBe(45);
    // "9h" sozinho é hora, não duração; "Reunião 9h por 1h" lê os dois.
    const both = parseCapture('Reunião 9h por 1h', today);
    expect(both.plannedTime).toBe('09:00');
    expect(both.estimatedMinutes).toBe(60);
    expect(parseCapture('Treino às 25h', today).plannedTime).toBeNull();
  });

  it('keeps the text literal when asked', () => {
    const capture = parseCapture('Ler "Hoje" 30min', today, 'inbox', true);
    expect(capture.title).toBe('Ler "Hoje" 30min');
    expect(capture.tokens).toEqual([]);
    expect(capture.destination).toEqual({ kind: 'inbox' });
  });

  it('reads only the first of each kind', () => {
    const capture = parseCapture('Ligar amanhã ou sex', today);
    expect(capture.plannedDate).toBe('2026-11-15');
    expect(capture.title).toBe('Ligar ou sex');
  });

  it('returns an empty title when only tokens were typed', () => {
    expect(parseCapture('amanhã 30min', today).title).toBe('');
  });
});

describe('labels', () => {
  it('names days and durations', () => {
    expect(dayLabel(today, today)).toBe('Hoje');
    expect(dayLabel('2026-11-15', today)).toBe('Amanhã');
    expect(dayLabel('2026-11-20', today)).toBe('Sexta, 20 nov.');
    expect(dayLabel('2027-01-05', today)).toBe('Terça, 5 jan. 2027');
    expect(minutesLabel(30)).toBe('30 min');
    expect(minutesLabel(60)).toBe('1 h');
    expect(minutesLabel(90)).toBe('1h30');
    expect(sentence('Foi para Sexta, 20 nov.')).toBe('Foi para Sexta, 20 nov.');
    expect(sentence('Foi para Hoje')).toBe('Foi para Hoje.');
  });
});
