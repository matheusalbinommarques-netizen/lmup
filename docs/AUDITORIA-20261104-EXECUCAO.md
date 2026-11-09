# Auditoria de 04/11 — reconciliação de execução em 09/11/2026

Referências: plano mestre e backlog em `.claude/auditoria-20261104/plano/` (documentos locais), PRs #56–#78, `main` em `48aba9142189073a6d7b2fbad468b5115baf203a`. Os lotes são um mapa revisável; a ordem das ondas não é um portão, salvo dependências técnicas explícitas.

## Estado publicado confirmado em 09/11

- Commit publicado: `48aba91`; versão `e0de8f3975d39ee2`; schema 6.
- CI da main #42411227928: 501 unitários, 415 E2E aprovados e 1 ignorado intencionalmente, 50 PWA aprovados. Não são execuções locais de 09/11.
- `verify (22)` e `verify (24)` continuam obrigatórios, com branch atualizada. Ruleset ativo e sem atualização desde 31/10.
- Somente `GET /release.json` e metadados do sincronizador foram consultados. Banco e perfil pessoais não foram inspecionados. Backup manual do autor não confirmado.

| Lotes         | Implementação                            | Aceite e limite                                                                                                              |
| ------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| A01, B01, B02 | #56, #57 integrados                      | Capturas isoladas, modelo de PR e estado central                                                                             |
| A02, A03      | #58, #59 integrados                      | Rotinas legíveis e horários ordenados                                                                                        |
| A04           | #59 integrado parcialmente               | Resíduos de mês, singular e rótulo recorrente tratados na rodada de fechamento; ainda requerem avaliação e integração        |
| A05           | Retirado                                 | Achado refutado; não alterar sem nova evidência                                                                              |
| D01, D02      | #63, #66 integrados                      | Tipografia; D03 em diante não está automaticamente concluído                                                                 |
| A13           | #62 integrado                            | Backup primeiro em Configurações; não equivale ao lembrete A14 ou cópia em pasta A15                                         |
| A08, A09, A10 | #68–#70 integrados                       | Testes das guardas e mutantes correspondentes                                                                                |
| A11           | #71 integrado                            | Limites de título e aviso de saldo; formatos v1–v4 cobertos                                                                  |
| C01           | #72 integrado                            | Medidor versionado; sua existência não comprova ganho de C02                                                                 |
| C02           | #61 integrado                            | N+1 removido; fechamento exige relatório antes/depois com C01 e M06 morto, sem atribuir automaticamente toda diferença a C02 |
| B06           | #74 integrado                            | Guarda e cancelamento apenas de PR; execuções posteriores mostram cancelamentos de checks antigos de PR                      |
| E01           | #75 aberto, draft                        | Head `78707b9`, CI #42416672494 aprovada: 501 unitários, 421 E2E, 1 ignorado e 50 PWA; não integrado                         |
| C05           | Trabalho local não integrado             | Comparar compressão 1448×1086 com variante 432×324; decisão visual pendente                                                  |
| B03           | Ferramenta alternativa no #77, integrado | Capturas sob demanda; não implementa automaticamente todas as condições do comparador originalmente proposto                 |

## Mudanças autorizadas além da lista original

Marca (#60), entrada única do Acampamento (#64), ficha do Herói (#65), Hoje vazio (#67), estabilização do calendário dos testes (#73), aposentadoria do piloto (#76) e capturas visuais (#77). Não contar uma entrega adicional como conclusão automática de outro lote.

O autor autorizou #74 e, depois, #77 seguido de #76. #78 permanece temporário, sem merge. `/aventura` é compatibilidade por redirecionamento; a campanha existente está em `/mundo/campanha`. `rpgPilot`, serviços legados e estado do Mundo foram preservados.

## Fechamento em preparação, autorizado em 09/11

1. E01: revisão final e preparação da integração, sem merge nesta rodada. A primeira versão excluía o piloto com XP-gate; a atual cobre a investigação canônica existente, os dois desfechos sem missões/XP, inatividade e produtividade independente. Conteúdo futuro requer novas jornadas de teste.
2. A04: meses em português, plural correto, datas acessíveis e recorrência individual sem rótulo de rotina. Alteração de apresentação; não muda registros, recorrência ou recompensa.
3. C02: workflow sob demanda reconstrói somente o código anterior a C02, mede as duas versões com C01 na mesma máquina e restaura o fonte; M06 é aplicado somente em memória. Relatórios e logs ficam no artefato `auditoria-c02-*`. Um job verde sem esses relatórios não comprova o aceite.
4. C05: mostrar as alternativas antes de alterar a imagem usada pelo aplicativo. O original permanece. A compressão local reduz bytes, mas não pixels decodificados; a opção menor precisa de inspeção em 1x e 2x. Declarar impacto no pré-cache antes de integrar.

Merge e escolha visual continuam decisões do autor. Não executar os scripts de reconstrução de desempenho contra a instalação pessoal.

## Próximos candidatos, sem autorização nova implícita

A14/DP2, D03 em diante, C03 depois de medir C02, A12 e decisões de arte e RPG. E02/E03 e E06–E09 continuam condicionados às decisões e evidências previstas. Não é correto chamar Ondas 3–5 de concluídas.
