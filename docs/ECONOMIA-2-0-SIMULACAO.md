# Economia 2.0 — S1: simulação e proposta de balanceamento V0.2 (11/11/2026)

Gerado por `npm run economy:simulate -- --md` (determinístico; não lê nem altera o app). A **V0.1** são os números do plano do autor (07/11, seção 6.2). A **V0.2** é uma proposta para o autor decidir. Tudo aqui é **HIPÓTESE**, exceto o teto de caixas (decidido em 11/11). Nada foi aplicado ao app.

## Objetivo do balanceamento

O LMUP é para meses e anos. A curva precisa:

1. **Recompensar logo no começo:** primeira construção no 1º ou 2º dia; várias na primeira semana.
2. **Desacelerar aos poucos:** intervalos curtos no primeiro mês e crescentes depois, sem paredes.
3. **Durar:** no perfil de referência do plano (6–10 missões por dia), a árvore completa leva cerca de 5 a 6 meses.
4. **Não premiar a moagem:** quem faz muito avança mais rápido, mas não termina em semanas.

## Premissas

- XP por missão: Microação 10, Leve 50, Moderado 100, Exigente 150, Intenso 250 (`src/services/effort.ts`). Ouro = `floor(XP × 0,5)`, sem equipamentos, companheiros nem marcos.
- Caixa a cada 400 XP; até 5 por dia com 100%, 75%, 50%, 50%, 50%; depois da 5ª, nada no dia. Progresso parcial abaixo de 400 passa para o dia seguinte. Caixa base: 8 madeira, 6 pedra ou 4 minério, escolhida conforme o que falta.
- Estratégia: libera as 8 construções no nível 1 na ordem do plano; depois compra a melhoria mais barata. Produção começa no dia seguinte, com trabalhador imediato. Todo dia é dia ativo; sem loja.
- V0.2: 3 níveis por construção; produção ×1, ×1,5 e ×2 por nível; estoque limitado por material (60 sem armazém; 160, 320 e 600 com armazém nível 1, 2 e 3).
- Misturas de esforço por ciclo de 20 missões: **leve** (4 micro, 10 leves, 5 moderadas, 1 exigente), **equilibrado** (2, 7, 7, 3, 1 intensa), **intenso** (0, 4, 6, 6, 4).

## Resultados

### V0.1

| Mistura     | Perfil       | Ouro/dia | Caixas/dia | 1ª construção | Até o dia 7 | Até o dia 30 | Todas no nível 1 | Tudo no máximo | Maior espera |
| ----------- | ------------ | -------: | ---------: | ------------: | ----------: | -----------: | ---------------: | -------------: | -----------: |
| leve        | 1–5 por dia  |     89.4 |        0.4 |         dia 2 |      2 de 8 |       7 de 8 |           dia 33 |         dia 33 |       6 dias |
| leve        | 6–10 por dia |    236.9 |        1.2 |         dia 1 |      5 de 8 |       8 de 8 |           dia 13 |         dia 13 |       3 dias |
| leve        | 10+ por dia  |    353.9 |        1.7 |         dia 1 |      7 de 8 |       8 de 8 |            dia 9 |          dia 9 |       2 dias |
| equilibrado | 1–5 por dia  |    131.1 |        0.6 |         dia 2 |      3 de 8 |       8 de 8 |           dia 22 |         dia 22 |       4 dias |
| equilibrado | 6–10 por dia |    359.4 |        1.8 |         dia 1 |      7 de 8 |       8 de 8 |            dia 9 |          dia 9 |       2 dias |
| equilibrado | 10+ por dia  |    527.9 |        2.6 |         dia 1 |      8 de 8 |       8 de 8 |            dia 7 |          dia 7 |       2 dias |
| intenso     | 1–5 por dia  |    201.7 |          1 |         dia 2 |      4 de 8 |       8 de 8 |           dia 15 |         dia 15 |       3 dias |
| intenso     | 6–10 por dia |    539.3 |        2.6 |         dia 1 |      8 de 8 |       8 de 8 |            dia 7 |          dia 7 |       2 dias |
| intenso     | 10+ por dia  |    808.3 |          4 |         dia 1 |      8 de 8 |       8 de 8 |            dia 6 |          dia 6 |       2 dias |

### V0.2

| Mistura     | Perfil       | Ouro/dia | Caixas/dia | 1ª construção | Até o dia 7 | Até o dia 30 | Todas no nível 1 | Tudo no máximo | Maior espera |
| ----------- | ------------ | -------: | ---------: | ------------: | ----------: | -----------: | ---------------: | -------------: | -----------: |
| leve        | 1–5 por dia  |     98.5 |        0.5 |         dia 2 |     2 de 24 |      4 de 24 |           dia 84 |          > 365 |      38 dias |
| leve        | 6–10 por dia |    237.9 |        1.2 |         dia 1 |     3 de 24 |      7 de 24 |           dia 32 |        dia 241 |      25 dias |
| leve        | 10+ por dia  |    357.2 |        1.8 |         dia 1 |     4 de 24 |     10 de 24 |           dia 23 |        dia 161 |      17 dias |
| equilibrado | 1–5 por dia  |    139.2 |        0.7 |         dia 1 |     2 de 24 |      5 de 24 |           dia 57 |          > 365 |      38 dias |
| equilibrado | 6–10 por dia |    353.9 |        1.8 |         dia 1 |     4 de 24 |     10 de 24 |           dia 24 |        dia 162 |      17 dias |
| equilibrado | 10+ por dia  |    530.8 |        2.7 |         dia 1 |     4 de 24 |     12 de 24 |           dia 20 |        dia 112 |      12 dias |
| intenso     | 1–5 por dia  |    202.5 |          1 |         dia 1 |     3 de 24 |      7 de 24 |           dia 38 |        dia 283 |      29 dias |
| intenso     | 6–10 por dia |    540.1 |        2.7 |         dia 1 |     5 de 24 |     12 de 24 |           dia 20 |        dia 111 |      11 dias |
| intenso     | 10+ por dia  |      810 |        4.1 |         dia 1 |     5 de 24 |     13 de 24 |           dia 18 |        dia 100 |      11 dias |

### Preços da V0.2

| Construção    | Nível 1                                        | Nível 2                                          | Nível 3                                          | Produção por dia (nível 1)               |
| ------------- | ---------------------------------------------- | ------------------------------------------------ | ------------------------------------------------ | ---------------------------------------- |
| serraria      | 150 ouro                                       | 900 ouro + 40 madeira + 20 pedra                 | 2600 ouro + 120 madeira + 80 pedra + 10 ferro    | 10 madeira                               |
| campo de caça | 350 ouro + 12 madeira                          | 1100 ouro + 50 madeira + 25 pedra                | 3000 ouro + 130 madeira + 90 pedra + 12 ferro    | 4 comida                                 |
| pedreira      | 600 ouro + 25 madeira                          | 1400 ouro + 60 madeira + 30 pedra                | 3400 ouro + 150 madeira + 100 pedra + 14 ferro   | 7 pedra                                  |
| armazém       | 900 ouro + 40 madeira + 25 pedra               | 1800 ouro + 90 madeira + 60 pedra                | 3800 ouro + 180 madeira + 140 pedra + 16 ferro   | —                                        |
| mina          | 1050 ouro + 45 madeira + 30 pedra              | 2200 ouro + 100 madeira + 70 pedra               | 4400 ouro + 200 madeira + 160 pedra + 18 ferro   | 4 minério                                |
| entreposto    | 1200 ouro + 55 madeira + 40 pedra              | 2600 ouro + 120 madeira + 90 pedra               | 5000 ouro + 220 madeira + 180 pedra + 20 ferro   | —                                        |
| fundição      | 1450 ouro + 60 madeira + 50 pedra + 16 minério | 3000 ouro + 130 madeira + 110 pedra + 40 minério | 5200 ouro + 230 madeira + 190 pedra + 70 minério | até 2 ferro (2 minério + 1 madeira cada) |
| forja         | 1800 ouro + 70 madeira + 55 pedra + 12 ferro   | 3400 ouro + 140 madeira + 110 pedra + 30 ferro   | 6000 ouro + 250 madeira + 210 pedra + 60 ferro   | —                                        |

### V0.2 · linha do tempo do perfil de referência (6–10 por dia, equilibrado)

serraria 1 (d1) → campo de caça 1 (d2) → pedreira 1 (d4) → armazém 1 (d7) → mina 1 (d9) → entreposto 1 (d13) → fundição 1 (d18) → forja 1 (d24) → serraria 2 (d25) → campo de caça 2 (d27) → pedreira 2 (d31) → armazém 2 (d37) → mina 2 (d43) → serraria 3 (d50) → entreposto 2 (d57) → campo de caça 3 (d66) → fundição 2 (d74) → pedreira 3 (d84) → forja 2 (d93) → armazém 3 (d104) → mina 3 (d117) → entreposto 3 (d131) → fundição 3 (d145) → forja 3 (d162)

## Leitura

**V0.1 é rápida demais.** No perfil de referência, as 8 construções saem em 9 dias (uma a cada 1,1 dia) e, sem níveis, o ouro fica sem destino na segunda semana.

**V0.2 no perfil de referência (6–10 por dia, equilibrado):**

- semana 1: serraria (dia 1), campo de caça (2), pedreira (4), armazém (7);
- mês 1: todas as 8 no nível 1 (dia 24), intervalos de 1 a 6 dias;
- meses 2 a 5: níveis 2 e 3, intervalos de 6 a 17 dias, que crescem devagar;
- tudo no máximo no dia 162 (~5,5 meses).

**Outros perfis:** quem faz 10+ missões intensas fecha tudo em ~100 dias (3,3 meses), não em uma semana. Quem faz 1–5 missões leves ganha a 1ª construção no dia 2 e 4 até o dia 30, mas a partir do 2º mês espera de 10 a 20 dias entre construções e leva mais de um ano para fechar tudo.

**O gargalo é o ouro.** Os materiais vêm em ritmo suficiente das caixas e da produção, e o limite de estoque impede acumular meses de material.

## Decisões para o autor

1. **Adotar a V0.2 como base** (ou pedir outro ponto da curva: mais rápido ou mais lento).
2. **Perfis leves:** os intervalos longos são proporcionais à renda (~100 ouro por dia). Baixar preços para eles faria os perfis intensos terminarem rápido demais. Alternativas que não mexem na curva principal:
   - metas menores entre construções: equipamentos, receitas da forja, encomendas do entreposto;
   - o objetivo visível da Fase 1, mostrando o progresso até a próxima construção.
3. **Construções sem produção** (armazém, entreposto, forja) precisam de utilidade própria por nível (capacidade, preços, receitas) antes da Fase 6, como o plano pede.

## Limites

Sem bônus de equipamentos e companheiros, sem marcos de ambiente, sem dias inativos, sem venda no entreposto nem compras na loja. Trabalhadores e receitas simplificados. É uma comparação entre hipóteses, não uma previsão do uso real; deve ser revista com a distribuição real de esforço.
