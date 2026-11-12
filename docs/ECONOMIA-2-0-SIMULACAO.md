# Economia 2.0 — S1: simulação dos números-hipótese (11/11/2026)

Gerado por `node scripts/economy/simulate.mjs --md` (determinístico; não lê nem altera o app). Números de entrada: plano do autor de 07/11 (seções 3.2, 3.3, 6.2), todos **HIPÓTESE**, exceto o teto de caixas (decidido em 11/11).

## Premissas

- XP por missão: Microação 10, Leve 50, Moderado 100, Exigente 150, Intenso 250 (`src/services/effort.ts`). Ouro = `floor(XP × 0,5)`, sem equipamentos, companheiros nem marcos.
- Caixa a cada 400 XP; até 5 por dia com 100%, 75%, 50%, 50%, 50%; depois da 5ª, nada no dia. Progresso parcial abaixo de 400 passa para o dia seguinte. Caixa base: 8 madeira, 6 pedra ou 4 minério; o simulador escolhe o que falta para a próxima construção.
- Construções e preços da V0.1, na ordem do plano: serraria, campo de caça, pedreira, armazém, mina, entreposto, fundição, forja. Produção começa no dia seguinte, com trabalhador imediato. Sem limite de estoque e sem compras na loja.
- Misturas de esforço por ciclo de 20 missões: **leve** (4 micro, 10 leves, 5 moderadas, 1 exigente), **equilibrado** (2, 7, 7, 3, 1 intensa), **intenso** (0, 4, 6, 6, 4).
- Todo dia é dia ativo.

## Resultados

### Mistura de esforço: leve

| Perfil       | Ouro/dia | Caixas/dia | Dia de cada construção                                                                                     | Intervalo médio | Tudo pronto |
| ------------ | -------: | ---------: | ---------------------------------------------------------------------------------------------------------- | --------------: | ----------: |
| 1–5 por dia  |     89.4 |        0.4 | serraria d2, campo de caça d5, pedreira d9, armazém d12, mina d17, entreposto d22, fundição d27, forja d33 |        4.1 dias |      dia 33 |
| 6–10 por dia |    236.9 |        1.2 | serraria d1, campo de caça d2, pedreira d4, armazém d5, mina d7, entreposto d9, fundição d10, forja d13    |        1.6 dias |      dia 13 |
| 10+ por dia  |    353.9 |        1.7 | serraria d1, campo de caça d2, pedreira d3, armazém d4, mina d5, entreposto d6, fundição d7, forja d9      |        1.1 dias |       dia 9 |

### Mistura de esforço: equilibrado

| Perfil       | Ouro/dia | Caixas/dia | Dia de cada construção                                                                                    | Intervalo médio | Tudo pronto |
| ------------ | -------: | ---------: | --------------------------------------------------------------------------------------------------------- | --------------: | ----------: |
| 1–5 por dia  |    131.1 |        0.6 | serraria d2, campo de caça d4, pedreira d6, armazém d9, mina d12, entreposto d15, fundição d18, forja d22 |        2.8 dias |      dia 22 |
| 6–10 por dia |    359.4 |        1.8 | serraria d1, campo de caça d2, pedreira d3, armazém d4, mina d5, entreposto d6, fundição d7, forja d9     |        1.1 dias |       dia 9 |
| 10+ por dia  |    527.9 |        2.6 | serraria d1, campo de caça d1, pedreira d2, armazém d3, mina d3, entreposto d4, fundição d5, forja d7     |        0.9 dias |       dia 7 |

### Mistura de esforço: intenso

| Perfil       | Ouro/dia | Caixas/dia | Dia de cada construção                                                                                   | Intervalo médio | Tudo pronto |
| ------------ | -------: | ---------: | -------------------------------------------------------------------------------------------------------- | --------------: | ----------: |
| 1–5 por dia  |    201.7 |          1 | serraria d2, campo de caça d3, pedreira d4, armazém d6, mina d8, entreposto d10, fundição d12, forja d15 |        1.9 dias |      dia 15 |
| 6–10 por dia |    539.3 |        2.6 | serraria d1, campo de caça d1, pedreira d2, armazém d3, mina d3, entreposto d4, fundição d5, forja d7    |        0.9 dias |       dia 7 |
| 10+ por dia  |    808.3 |          4 | serraria d1, campo de caça d1, pedreira d1, armazém d2, mina d2, entreposto d3, fundição d4, forja d6    |        0.8 dias |       dia 6 |

### Fator de preço (ouro e materiais) · 6–10 por dia

| Fator | Leve                                       | Equilibrado                                | Intenso                                    |
| ----: | ------------------------------------------ | ------------------------------------------ | ------------------------------------------ |
|   × 1 | 1.6 dias entre construções; tudo no dia 13 | 1.1 dias entre construções; tudo no dia 9  | 0.9 dias entre construções; tudo no dia 7  |
| × 1.5 | 2.4 dias entre construções; tudo no dia 19 | 1.6 dias entre construções; tudo no dia 13 | 1.1 dias entre construções; tudo no dia 9  |
|   × 2 | 3.1 dias entre construções; tudo no dia 25 | 2.1 dias entre construções; tudo no dia 17 | 1.5 dias entre construções; tudo no dia 12 |
| × 2.5 | 3.9 dias entre construções; tudo no dia 31 | 2.6 dias entre construções; tudo no dia 21 | 1.9 dias entre construções; tudo no dia 15 |
|   × 3 | 4.6 dias entre construções; tudo no dia 37 | 3.1 dias entre construções; tudo no dia 25 | 2.1 dias entre construções; tudo no dia 17 |
|   × 4 | 6.1 dias entre construções; tudo no dia 49 | 4.1 dias entre construções; tudo no dia 33 | 3.0 dias entre construções; tudo no dia 24 |

## O que os números dizem

1. **A V0.1 é barata demais para a meta do plano.** No perfil de referência (6–10 missões por dia, esforço equilibrado) as 8 construções saem em 9 dias, uma a cada 1,1 dia; a meta é um investimento relevante a cada 2–3 dias ativos.
2. **O gargalo é o ouro, não o material.** Multiplicar só o ouro por 2,5 dá 2,6 dias entre construções (tudo no dia 21); multiplicar só os materiais por 2,5 dá 1,8 dia. A serraria inunda o estoque de madeira (12/dia).
3. **Um fator de ×2 a ×2,5 no preço** coloca o perfil de referência em 2,1–2,6 dias entre construções. Perfis leves ficam em 3–4 dias; intensos, em 1,5–1,9.
4. **Caixas:** o perfil de referência abre 1,8 caixa por dia; o teto de 5 só é alcançado no perfil 10+ intenso (4/dia em média). O teto protege contra excesso sem pesar para quem faz pouco.
5. **Longevidade:** mesmo com ×2,5, a árvore inteira acaba em ~3 semanas. Sem níveis, melhorias e saídas recorrentes (plano 6.4), o ouro perde destino rápido.

## Sugestão para o autor decidir (nada aplicado)

- Ajustar os preços em ouro da V0.1 por cerca de ×2 a ×2,5, mantendo materiais quase como estão.
- Planejar níveis/melhorias por construção antes da Fase 6, para o ouro continuar tendo destino.
- Reavaliar com dados reais de esforço (o plano pede medir a distribuição real).

## Limites

Sem bônus de equipamentos e companheiros, sem marcos de ambiente, sem dias inativos, sem loja nem estoque máximo. Produção e trabalhadores simplificados. É uma comparação entre hipóteses, não uma previsão do uso real.
