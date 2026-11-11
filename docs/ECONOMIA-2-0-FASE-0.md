# Economia 2.0 — Fase 0: contrato técnico (11/11/2026)

Leitura somente do código da `main` em `15b59df`. Nenhum banco pessoal foi lido. Base: plano do autor `LMUP_Plano_Consolidado_Economia_Progressao_2_0_2026-11-07.md` (fora do repositório), seções 8 a 10. Este documento descreve **o que existe**; as regras novas continuam no plano do autor, com o status dele (fechado, hipótese, futuro).

## 1. Pontos de controle do plano, conferidos

| Item da seção 9 do plano          | Estado em 11/11                                                                                                        |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| PRs #75 e #78                     | #75 integrado (E01); #78 fechado sem merge a pedido do autor                                                           |
| CI e proteção                     | `verify (22)` e `verify (24)` obrigatórios; ruleset sem alteração desde 31/10; CI só foi reforçada                     |
| Instalação                        | 5174 consultada só por `GET /release.json`; banco pessoal não inspecionado                                             |
| Regras E01 (liberdade do jogador) | Cobertas por E2E desde o #75: Mundo sem exigir missões nem XP                                                          |
| Backup                            | Exporta todas as tabelas, incluindo `profile.camp`, `profile.campSettlement`, `profile.world` e recibos                |
| Auditoria de 04/11                | Ondas 0–2 entregues (ver `AUDITORIA-20261104-EXECUCAO.md`); pendências reclassificadas em `PLANO-EXECUCAO-20261111.md` |

## 2. Recursos e onde vivem

| Recurso                         | Onde fica                                                      | Observação                                                                                 |
| ------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| XP, nível                       | `profile.totalXpEarned`, `level`, `xpCurrent`, `xpNext`        | Derivados de `totalXpEarned` (`levelFields`)                                               |
| Ouro                            | `profile.gold`                                                 | Saldo único usado no app inteiro                                                           |
| Comida                          | `profile.food`                                                 | Gasta no cuidado dos companheiros                                                          |
| Débito de recompensa            | `profile.rewardDebt` (`{xp, gold, food}`)                      | Estorno vira débito, descontado das próximas recompensas                                   |
| Marcos de ambiente              | `profile.ecoGoldClaimedUpToStage`                              | Ouro extra por estágio, uma vez só                                                         |
| Materiais do acampamento antigo | `profile.camp.inventory` (madeira, pedra, ferro)               | Só existe em perfis que usaram o acampamento antigo                                        |
| Acampamento atual               | `profile.campSettlement` (caseiro, residência; sem estoque)    | Residência custa 50 de ouro, uma vez                                                       |
| Equipamentos                    | `ownedShopItems` (preço gravado na linha)                      | Catálogo vivo em `src/lib/shop/types.ts`; `src/lib/shop/items.ts` não é importado pelo app |
| Companheiros                    | `companions` (`foodInvested`, `evolutionStage`, `careHistory`) | 4 companheiros antigos; investimento precisa ser preservado (plano 6.3)                    |
| Conquistas                      | `achievementReceipts`                                          | Recibos idempotentes; não concedem ouro hoje                                               |

## 3. Quem credita e quem debita

| Operação                                           | Função                                                         | Registro (recibo)                                       | Estorno                                         |
| -------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------- | ----------------------------------------------- |
| Concluir missão, revisão, projeto                  | `grantReward` (`rewardService.ts:43`), via `occurrenceService` | `activityEvents` + `xpLogs`, com sequência              | `revokeRewards` cria evento `reversal` e débito |
| Bônus de projeto                                   | `taskService` → `grantReward` (kind `project`)                 | Idem                                                    | Idem, por `projectLifecycle`                    |
| Remover XP manual                                  | `removeManualXp` (`rewardService.ts:316`)                      | Evento `adjustment`                                     | —                                               |
| Comprar equipamento                                | `buyItem` (`shopService.ts`)                                   | Só a linha em `ownedShopItems`; **sem evento no razão** | Não há                                          |
| Alimentar companheiro                              | `companionService.ts:~300`                                     | `careHistory` no próprio companheiro                    | Não há                                          |
| Construir residência                               | `campSettlementService.ts:~70`                                 | `productivityAudit` (`camp-settlement:built`)           | Não há                                          |
| Acampamento antigo (construir, produzir, fabricar) | `campService.ts`                                               | `productivityAudit` (`camp:*`)                          | Não há                                          |

Toda escrita de saldo está numa transação Dexie. As conclusões têm idempotência pela ocorrência e revisão esperada (`recordProgress`). A compra é protegida por "já possui".

**Consequência para a Economia 2.0:** hoje há quatro formas de recibo (razão de eventos, linha de posse, histórico no companheiro e auditoria de produtividade). O "contrato único" pedido no plano (8.2) significa: **toda entrada e saída de ouro, comida e materiais passa por uma função de razão** que grava evento e saldo na mesma transação, com `requestId`, e tem regra de estorno. Gastos antigos ficam como estão; não reconstruir histórico.

## 4. Fronteira `camp` × `campSettlement`

- **`profile.camp`** (economia antiga): estoque de madeira, pedra e ferro, edifícios, trabalhadores e produção. Só é **criado** por `ensureCamp`, chamado apenas por `src/lib/camp/Camp.svelte`, que não está mais em nenhuma rota. Na prática, é dado dormente: perfis antigos podem tê-lo, perfis novos não.
- Ainda **lido** por: `backupDataService` (valida e exige o recibo `camp:<mundo>:init`), `campSettlementService` (perfil com acampamento antigo herda caseiro e residência sem pagar os 50) e `campPreviewService`.
- **`profile.campSettlement`**: estado do acampamento cinematográfico; não guarda estoque nem materiais.
- A mina antiga produz **ferro**, não minério. O plano pede minério → fundição; isso exige migração explícita, não renomear.

**Regra até a migração:** a arte isométrica e a tela antiga podem sair; `profile.camp`, sua validação no backup, `campState`, `campRegion` e os recibos `camp:*` ficam. A migração (Fase 3 ou 6) converte o estoque antigo para o contrato novo uma única vez, com recibo, e mantém o original para reversão.

## 5. Riscos que a Fase 1 em diante precisa cobrir

1. **Saldo paralelo:** materiais novos não podem nascer em `campSettlement` e em `camp` ao mesmo tempo. Um só lugar de estoque.
2. **Caixas duplicadas:** a caixa deriva de XP elegível já gravado em `activityEvents`; estorno de missão precisa estornar progresso de caixa. Restaurar backup ou reparar eventos não pode recriar caixas.
3. **Produção no tempo:** relógio, duas abas, retorno após meses e estoque cheio (o acampamento antigo já tem `clock` e `settleProduction`, mas com taxas que o plano manda não reusar).
4. **Compra sem razão:** loja e cuidado de companheiro não geram evento; qualquer gasto novo (edifícios, forja, entreposto) deve gerar.
5. **Débito:** `rewardDebt` hoje cobre XP, ouro e comida; materiais e caixas precisam de política própria de débito ou bloqueio.

## 6. Respostas do autor (11/11)

- O perfil pessoal **não tem** estoque do acampamento antigo: não há materiais a migrar. Backups antigos com `profile.camp` continuam aceitos.
- Depois da 5ª caixa do dia não há outra caixa; o XP excedente não acumula para caixas.
- Reclassificar por domínio vale daqui para frente: o que já foi conquistado fica no domínio antigo e o que for feito depois conta no novo, sem transferência; detalhes em `PLANO-EXECUCAO-20261111.md`, seção 5.
- Em aberto: preços (depois do S1) e as demais perguntas da seção 12 do plano.
