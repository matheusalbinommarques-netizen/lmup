# Auditoria de 04/11 — reconciliação de execução em 09/11/2026

Referências: plano mestre e backlog em `.claude/auditoria-20261104/plano/` (documentos locais), PRs #56–#80; linha de base da conferência em `48aba9142189073a6d7b2fbad468b5115baf203a`. Os lotes são um mapa revisável; a ordem das ondas não é um portão, salvo dependências técnicas explícitas.

## Linha de base publicada, confirmada antes do fechamento

- Commit publicado: `48aba91`; versão `e0de8f3975d39ee2`; schema 6.
- CI da main #42411227928: 501 unitários, 415 E2E aprovados e 1 ignorado intencionalmente, 50 PWA aprovados. Não são execuções locais de 09/11.
- `verify (22)` e `verify (24)` continuam obrigatórios, com branch atualizada. Ruleset ativo e sem atualização desde 31/10.
- Somente `GET /release.json` e metadados do sincronizador foram consultados. Banco e perfil pessoais não foram inspecionados. O autor confirmou ter backup recente exportado e guardado fora do navegador em 09/11.

| Lotes         | Implementação                             | Aceite e limite                                                                                                       |
| ------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| A01, B01, B02 | #56, #57 integrados                       | Capturas isoladas, modelo de PR e estado central                                                                      |
| A02, A03      | #58, #59 integrados                       | Rotinas legíveis e horários ordenados                                                                                 |
| A04           | #59 e #79 integrados                      | Prévia aprovada em 09/11; mês em português, singular, datas acessíveis e rótulo recorrente corrigidos                 |
| A05           | Retirado                                  | Achado refutado; não alterar sem nova evidência                                                                       |
| D01, D02      | #63, #66 integrados                       | Tipografia; D03 em diante não está automaticamente concluído                                                          |
| A13           | #62 integrado                             | Backup primeiro em Configurações; não equivale ao lembrete A14 ou cópia em pasta A15                                  |
| A08, A09, A10 | #68–#70 integrados                        | Testes das guardas e mutantes correspondentes                                                                         |
| A11           | #71 integrado                             | Limites de título e aviso de saldo; formatos v1–v4 cobertos                                                           |
| C01           | #72 integrado                             | Medidor versionado; sua existência não comprova ganho de C02                                                          |
| C02           | #61 integrado; aceite comprovado em 09/11 | C01 antes/depois na mesma máquina e M06 morto; resultados abaixo, sem promessa de ganho universal                     |
| B06           | #74 integrado                             | Guarda e cancelamento apenas de PR; execuções posteriores mostram cancelamentos de checks antigos de PR               |
| E01           | #75 integrado após atualizar com #79      | Dois desfechos sem missões/XP, inatividade e produtividade independente; checks obrigatórios aprovados antes do merge |
| C05           | Entrega do #80, autorizada em 09/11       | Opção A aprovada: 1448×1086 e 259.754 bytes; variante offline e original preservado para a Home                       |
| B03           | Ferramenta alternativa no #77, integrado  | Capturas sob demanda; não implementa automaticamente todas as condições do comparador originalmente proposto          |

## Mudanças autorizadas além da lista original

Marca (#60), entrada única do Acampamento (#64), ficha do Herói (#65), Hoje vazio (#67), estabilização do calendário dos testes (#73), aposentadoria do piloto (#76) e capturas visuais (#77). Não contar uma entrega adicional como conclusão automática de outro lote.

O autor autorizou #74 e, depois, #77 seguido de #76. #78 permanece temporário, sem merge. `/aventura` é compatibilidade por redirecionamento; a campanha existente está em `/mundo/campanha`. `rpgPilot`, serviços legados e estado do Mundo foram preservados.

## Fechamento aprovado em 09/11

O autor aprovou a integração sequencial dos PRs #79, #75 e #80 em 09/11/2026. Cada branch deve estar atualizada com a `main`, com `verify (22)` e `verify (24)` aprovados, sem alterar a proteção ou a CI.

1. E01: integrado pelo #75 após atualização sobre o #79. A primeira versão excluía o piloto com XP-gate; a atual cobre a investigação canônica existente, os dois desfechos sem missões/XP, inatividade e produtividade independente. Conteúdo futuro requer novas jornadas de teste.
2. A04: meses em português, plural correto, datas acessíveis e recorrência individual sem rótulo de rotina. Alteração de apresentação; não muda registros, recorrência ou recompensa.
3. C02: workflow sob demanda reconstrói somente o código anterior a C02, mede as duas versões com C01 na mesma máquina e restaura o fonte; M06 é aplicado somente em memória. Relatórios e logs ficam no artefato `auditoria-c02-*`. A execução #42718356229 aprovou a medição, a detecção de M06 e a restauração do fonte; relatórios preservados abaixo.
4. C05: comparação gerada e inspecionada em 1x/2x; autor escolheu A (259.754 bytes e 1448×1086) em vez de B (61.394 bytes e 432×324), substituindo a proposta inicial. A variante acrescenta 259.754 bytes de imagem ao pré-cache e não reduz pixels decodificados. O original continua porque a Home o utiliza. Ver [C05-FUNDO-LATERAL.md](C05-FUNDO-LATERAL.md). Integração autorizada pelo autor; checks obrigatórios preservados.

As escolhas visuais A04 e C05 e a integração desta rodada foram aprovadas pelo autor. Isso não autoriza automaticamente outros lotes. Não executar os scripts de reconstrução de desempenho contra a instalação pessoal.

## C02 — resultado observado, não promessa

Execução [#42718356229](https://github.com/matheusalbinommarques-netizen/lmup/actions/runs/42718356229), no head `5811433` do #79. Medidor C01 completo, três repetições e mediana, mesma máquina e configuração. O antes reconstrói apenas o N+1 original de `refreshCompletionStreak`; o depois usa a implementação já publicada.

| Linhas por tabela | Concluir antes | Concluir depois | Redução observada |
| ----------------: | -------------: | --------------: | ----------------: |
|                 0 |          74 ms |           74 ms |                0% |
|             2.920 |       1.115 ms |          725 ms |             35,0% |
|             8.760 |       2.835 ms |        2.070 ms |             27,0% |
|            14.600 |       5.067 ms |        3.712 ms |             26,7% |

A ordem foi fixa (antes e depois), em um runner de CI. Variação da máquina e aquecimento podem participar da diferença; não extrapolar para a instalação pessoal. Abertura das telas ficou na mesma ordem de grandeza, sem ganho consistente. A meta proposta de concluir em ≤1,5 s com 14.600 linhas **não foi atingida**; C03 continua candidato, sem ser iniciado ou autorizado automaticamente.

M06 foi morto pela asserção de caracterização sobre conclusões estornadas. Baseline: três testes aprovados; mutante: uma falha de comportamento esperada, não uma falha de carregamento. O fonte foi restaurado e a guarda de diff aprovou. Relatórios permanentes: [c02.json](auditoria-20261109/c02.json), [baseline](auditoria-20261109/m06-baseline.json) e [M06](auditoria-20261109/m06-mutant.json).

Repetição de C02 no head `cd013da9` do #79: [execução #42719808747](https://github.com/matheusalbinommarques-netizen/lmup/actions/runs/42719808747), com 14.600 linhas/tabela, mediana de 4.039 → 3.062 ms (24,2%). M06 e restauração novamente aprovados. A diferença entre execuções reforça o limite de comparação; a meta de 1,5 s continua não atingida.

## Próximos candidatos, sem autorização nova implícita

A14/DP2: o autor autorizou seguir com o lembrete de 14 dias, dispensável, sem aviso em instalação vazia e sem cópia em pasta. Implementação e critérios em [A14-LEMBRETE-BACKUP.md](A14-LEMBRETE-BACKUP.md); aceite visual e merge permanecem separados da autorização de implementar.

**Substituído em 11/11/2026 por [PLANO-EXECUCAO-20261111.md](PLANO-EXECUCAO-20261111.md)**, que junta estas pendências ao plano de Economia 2.0 do autor e ao contrato técnico [ECONOMIA-2-0-FASE-0.md](ECONOMIA-2-0-FASE-0.md). C03 foi integrado no #83.
