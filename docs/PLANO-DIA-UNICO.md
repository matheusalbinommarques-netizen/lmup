# Plano "Dia único" (15/11/2026)

Origem: dogfooding de 14/11/2026 e proposta do Claude Design (projeto "LMUP Revisão e Proposta": Hoje, Linha de Missão, Fluxos, Planejamento, Evolução, Sistema, Revisão). Decisões aprovadas pelo autor em 15/11/2026.

## Problema

O mesmo dia existe em quatro versões que não concordam: Plano do dia (Hoje), Agenda (ordem por horário), Sessão (fila própria, sem horário) e Rotina (ordem que a Agenda ignora). Há três telas de execução (`/missao`, `/ocorrencia`, `/sessoes`) e três critérios de "próxima missão". O Hoje não hierarquiza: pendências paradas e importância alta não aparecem.

## Lotes

Cada lote: worktree própria a partir de `origin/main`, prévia em porta 5180+, PR só depois da aprovação da prévia, merge só com autorização.

| Lote | Entrega                                                                                                                                                                                                                    | Dados                                        |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| 1    | Linha de Missão no Hoje: concluir com um clique e desfazer, selos (importância alta, parada há 14 dias ou mais, em foco), grupo "Paradas há mais tempo", frase de status no lugar da que cobra, correção da criação rápida | Sem mudança                                  |
| 2    | Ordem única do dia, hora editável na linha ("só hoje" / "daqui para frente"), hora calculada (≈) com 15 min padrão, âncoras e aviso de conflito, arrastar com ▲▼ e teclado, concluídas no lugar                            | Campo opcional de ordem na ocorrência        |
| 3    | Uma tela de execução com cronômetro opcional; verbos fixos; "Iniciar dia / Continuar o dia / Iniciar bloco"; fila sem ordem própria                                                                                        | Início real opcional no registro de execução |
| 4    | Navegação Hoje · Missões · Evolução · Jornada; página Evolução; área opcional do projeto; camada de jogo (completa, discreta, desligada); tokens únicos; caixas e "No que investir?" para o Acampamento                    | Área do projeto; preferência de camada       |
| 5    | Semana, aba "Sem dia" (caixa de entrada + algum dia), captura em linguagem natural com destino visível, inserir bloco, sessões salvas viram rotinas                                                                        | Marcação "algum dia"                         |
| 6    | Revisão semanal em 3 passos; sugestões de duração (mediana, 3+ medições) e horário (6+ em 21 dias, início real)                                                                                                            | Lê dados dos lotes 2 e 3                     |
| 7    | Primeiro uso opcional (áreas, início e fim do dia, camada de jogo)                                                                                                                                                         | Preferências                                 |

## Decisões fechadas

- Destinos: Hoje · Missões · Evolução · Jornada, iguais no desktop e no mobile.
- Camada de jogo padrão para quem pula o primeiro uso: Discreta; usuários atuais continuam em Completa.
- "Parada" = 14 dias sem ação, só em missão avulsa com dia; sem dia vai para a triagem semanal.
- Duração: esforço é dificuldade, não tempo; sem duração conta 15 min, sinalizado ("15 min*").
- Importância alta em dourado-tinta; coral só para conflito e erro.
- Ícones de linha (Lucide, ISC) na produtividade, empacotados; pintados na navegação, na Jornada e nos estados vazios.
- Cormorant só de 22 px para cima; interface na fonte do sistema.
- Clã, `/cla`, `/sessao`, `/laboratorio` saem do menu; as rotas continuam.
- "Revisões" atuais passam a "Repetições".
- Sem notificações: lembretes de revisão viram bloco opcional no Dia.
- Consolidação do design system fica para depois dos 7 lotes.

## Lote 1: o que mudou

- `src/services/dayRow.ts`: `staleDays` (parada), `inFocus` (área em foco na Roda), `canCompleteInline` (conclusão sem tela de execução).
- `src/lib/ui/DayRow.svelte` e `LineIcon.svelte`; ícones em `src/lib/content/lineIcons.ts` (licença em `LUCIDE-LICENSE.txt`).
- Hoje: linhas novas, grupo "Paradas há mais tempo" (3 visíveis, "Ver as N paradas"), aviso "concluída · Desfazer", frase "N de M feitos · próxima: …", menu com "Iniciar/Retomar" e "Remarcar".
- `QuickCreate.svelte`: o título é capturado antes de salvar; o que se digita durante o salvamento não se perde nem se mistura.
- Desfazer usa o estorno existente (`undoTask`): o saldo fica como débito compensado por ganhos futuros, como na Lista.

## Lote 2: o que mudou

- `src/services/dayOrder.ts`: `orderDay` (ordem única), `dayTimeline` (◆ fixa, ≈ calculada, 15 min sem duração, conflito), `saveDayOrder`, `setRowTime`.
- Dado: `dayOrder: { day, rank }` opcional na ocorrência, validado no backup; gravar a ordem não muda progresso, recompensa nem revisão.
- Sem ordem manual: horas fixas por horário; item sem hora entra antes da próxima hora fixa ainda por vir, para a hora ≈ começar agora.
- Hoje e Agenda usam a mesma ordem; a próxima é a primeira pendente da ordem. Hora fixa que passou sem início não é a próxima e oferece Remarcar.
- Linha: hora editável (clique ou F2; Enter/Esc), "Só hoje" / "Daqui para frente" em rotina; fixar a hora leva a linha ao lugar dessa hora.
- Mover: arrastar pela alça (desktop), "Reordenar" com ▲▼ (44 px no mobile), Alt + ↑/↓; foco preservado e posição anunciada.
- Concluídas ficam no lugar (riscadas; o círculo desfaz) e podem ser ocultadas.
- Conflito só quando todo o trecho até a hora fixa tem duração real (design F3); com item sem duração, uma hora ≈ pode passar da ◆ seguinte sem aviso.
- O cartão "Próxima missão" continua; a mesma missão aparece destacada na lista. Removê-lo fica para decisão do autor.

## Lote 3: o que mudou

- Uma tela de execução em `/executar/<ocorrência>` (`ExecutionScreen.svelte`, design E1–E4): missão avulsa (mostra "Depois"), fila do dia (`?fila=dia`) e bloco (`?fila=bloco`).
- Fila sem ordem própria (`src/lib/journey/dayQueue.ts`): o dia é a lista do Hoje sem as paradas; bloco = 2+ itens seguidos da mesma rotina. Mover na fila grava a ordem do Dia; "Pular para depois" não muda nada.
- Hoje: botão principal "Iniciar dia" / "Continuar o dia"; cabeçalho de bloco com "Iniciar bloco"; bloco concluído recolhe. Iniciar/Retomar das linhas, Missões e Agenda levam à tela nova.
- Cronômetro opcional (`executionTimer.ts`): começa desligado, sobrevive à recarga (localStorage por ocorrência) e só vira dado ao Concluir ou Registrar parte.
- Dado: `startedAt` opcional no registro de execução (até 24 h antes da execução), validado no backup; minutos do cronômetro somam em `actualMinutes`. Recompensa e saldo não mudam.
- Depois de concluir: "concluída · +XP · Por quê? · Desfazer" e "A seguir" com Iniciar; nada começa sozinho. "Por quê?" abre o recibo completo (resumo de recompensa) na página da missão.
- `/missao/<id>` virou o detalhe da missão (definição, notas, histórico, gestão e recibos); `/ocorrencia/<id>` ficou como registro e correção. Missão legada continua sem criar ocorrência ao ser aberta.
- Verbos fixos: Iniciar, Retomar, Concluir (Ctrl + Enter), Registrar parte, Pausar, Pular para depois, Remarcar, Iniciar/Encerrar bloco.
- Sessões salvas (`/sessoes`) e a seleção de sessão em Missões continuam até o lote 5 ("sessões salvas viram rotinas"), com os verbos novos.

## Lote 4a: o que mudou

O lote 4 foi dividido: 4a (navegação, Evolução, área do projeto) e 4b (camada de jogo, tokens únicos, caixas e "No que investir?" no Acampamento).

- `src/lib/journey/navigation.ts`: quatro destinos iguais no desktop e no mobile; Evolução marca `/roda`, `/projetos` e `/progresso`; Jornada marca Herói, Acampamento, Mundo e Loja (e as rotas antigas de cada um).
- O menu "Seu espaço" e o botão "Mais" saíram. Configurações fica no rodapé da lateral e no ⚙ do cabeçalho mobile. Clã, `/sessao` e `/laboratorio` saem do menu; as rotas continuam.
- Jornada: abas Herói · Acampamento · Mundo · Loja no topo dessas telas; o destino abre em Herói. Até o 4b, a Jornada aparece para todos (usuários atuais estão na camada Completa).
- `/evolucao` (design E1/E2/E4): focos da Roda com sentimento, dias com ação e faixa de 30 dias; projetos ativos com progresso, próxima ação e "Pôr no dia" (`planTask`); Meu progresso em 30 dias (esforço, progresso, resultado). A revisão semanal entra no lote 6.
- Projeto "parado": 14 dias sem conclusão ou registro de execução em missões do projeto, contados desde a criação; pausado não é parado.
- Dado: `areaId` opcional no projeto (null = sem área; 0 = Geral), validado no backup; excluir a área leva os projetos à área de destino, com auditoria.
- Worker: `/evolucao` e `/roda` abrem offline sem visita prévia.

## Lote 4b: o que mudou

- Camada de jogo em Configurações (`src/services/gameLayer.ts`, `profile.gameLayer`). Ausente = Completa: usuários atuais não mudam. Discreta como padrão de quem pula o primeiro uso entra com o lote 7; até lá ninguém muda sozinho.
- Completa: Hoje · Missões · Evolução · Jornada; no Hoje, um cartão "Jornada" (nível, XP até o próximo nível, ganhos do dia, companheiro). Discreta: três destinos, Jornada no rodapé da lateral e em "Mais" no mobile, e a linha "Hoje +N XP · Por que ganhei isso?". Desligada: três destinos e nada de XP, ouro ou comida nas telas de produtividade.
- Em qualquer camada XP, ouro, comida e recibos continuam sendo registrados; trocar de camada só grava a preferência. Avisos de estorno e débito continuam mostrando valores, porque descrevem consequência.
- Fora da Completa, molduras ornamentadas viram superfície simples na produtividade; as telas da Jornada mantêm a moldura.
- Saíram do Hoje: "No que investir?" e Suprimentos (agora abaixo da cena do Acampamento), "Próxima conquista", cartões Mundo/Aposentos/Projetos e "O caminho adiante" (Herói, conquistas e Mundo continuam na Jornada).
- Marcações `data-game="xp" | "loot" | "card"` escondem valores por camada em Missões, criação rápida, detalhe da missão, projeto, sessões salvas e aviso pós-execução.
- Tokens: bloco único de 13 tokens no `.visual-shell` (`visual.css`), com `--lmu-control-line` para bordas de campo; `--d05-label` e `--d05-border` apontam para eles. A troca dos cinzas soltos e o tema claro ficam para a consolidação depois dos 7 lotes.
- Texto: "construção, item ou melhoria".

## Lote 5a: o que mudou

O lote 5 foi dividido: 5a (Sem dia e captura), 5b (Semana) e 5c (inserir bloco, sessões salvas viram rotinas).

- Missões › Sem dia (`Undated.svelte`, design P2): Caixa de entrada (capturadas sem dia, com idade; 14 dias ou mais = "entra na triagem da revisão semanal") e Algum dia (5 visíveis, "Ver as N"). Ações: Hoje, Escolher dia (próximos 7 dias com contagem, ou outro dia), Algum dia, Trazer para a semana, Voltar para a caixa.
- Dado: `someday` opcional na missão, só sem dia e sem recorrência, validado no backup; ganhar dia, rotina ou recorrência o remove. `setTaskDay` (`inbox.ts`) muda só o plano, com auditoria e idempotência por requisição; missão com progresso é recusada (remarca-se pelo Dia).
- Sem dia não entra no Hoje (nem como próxima sugerida) e não ganha selo de parada.
- Captura em linguagem natural (`capture.ts`, `CaptureField.svelte`): hoje, amanhã, depois de amanhã, dia da semana (o próprio dia = hoje; "ter" sozinho é verbo, vale "terça"), 20/11, "dia 20", "às 14h", 14:30, 9h (a partir das 5h é hora), 30min, 1h30 (até 4h é duração), "algum dia". Hora sem dia vale para hoje. "Usar só o texto" desliga a leitura.
- A mesma captura fica no Hoje ("Adicionar ao dia"); sem data, entra no Dia de hoje.

## Lote 5b: o que mudou

- A aba Agenda virou Semana (decisão do autor, 16/11): abre o planejador do design P1/S1 (`WeekPlanner.svelte`, `week.ts`). A visão de dia da Agenda continua em `?view=agenda&mode=day`, aberta pelo nome do dia (desktop) ou "Abrir o dia" (celular), e volta por "Ver a semana". O resumo semanal antigo saiu.
- Sete dias a partir de hoje ("Próximos 7 dias"); ‹ › andam de 7 em 7 e "Hoje" volta. Cada dia mostra as missões avulsas na ordem única (hoje = a mesma lista do Hoje), com ◆ hora fixa ou "sem hora" e duração ou "15 min*". O resumo soma só durações reais ("2 pendentes · 1 h com duração · 1 sem").
- Rotinas e recorrentes ficam num chip por dia ("↻ 2 rotinas · 5 recorrentes"); "Mostrar rotinas" abre os blocos das rotinas e as recorrentes.
- Layout pela largura disponível: com 1150 px ou mais, coluna Sem dia com 4 itens da caixa e "Escolher dia"; abaixo disso, um cartão "Sem dia" no topo; abaixo de 760 px, um dia aberto por vez (design S1) e "Reordenar" com ▲▼ de 44 px.
- Mover: arrastar entre dias (desktop), ⋯ com os 7 dias, outro dia, "Sem dia" e "Editar", ou Alt + ←/→. Ordem: arrastar no mesmo dia, Alt + ↑/↓ ou ▲▼; muda só dentro da lista visível. Não leva para dias passados.
- `moveToDay` (`week.ts`): avulsa sem progresso muda o próprio dia (`setTaskDay`); repetição, rotina ou avulsa com progresso remarca só a ocorrência (`changeOccurrence`), preservando progresso e recompensas. Recusa concluída, dia passado e ocorrência em sessão iniciada; idempotente por requisição.
- Item sem hora movido para um dia futuro entra no fim; para hoje, segue a regra do lote 2 (antes da próxima hora fixa ainda por vir).
- Avisos com data não dobram mais o ponto ("20 nov.."), também no Sem dia do 5a (`sentence` em `capture.ts`).

## Lote 5c: o que mudou

- Inserir bloco (design P3, `InsertBlock.svelte`, `routineBlocks.ts`): pelo "Inserir bloco de rotina" do Plano do dia ou pelo ⋯ de uma linha ("Inserir bloco depois desta"). Painel lateral: rotina, itens (desmarcáveis só para hoje; os que já estão no Dia aparecem como "já no Dia"), onde (depois de uma missão, em hora fixa ou no fim do dia) e a prévia "Começa ≈ … e termina ≈ …; fica antes de …" calculada pela linha do tempo do Dia.
- `insertBlock` vale só para hoje: cada missão ganha a ocorrência do dia pelo mesmo desvio de um dia de "Pôr no dia" (`occurrenceOverride`); a rotina, seus dias e a repetição das missões não mudam, nem progresso, recompensa ou eventos. Hora fixa muda só a ocorrência de hoje do primeiro item. Idempotente por requisição e auditado (`routine-insert`); desfaz-se com "Remover de hoje". Recusa rotina pausada ou arquivada e outro dia; pula o que já está no Dia, foi resolvido hoje ou foi remarcado.
- Seleções viram fila de execução (decisão do autor, 16/11): "Selecionar para executar" na Lista, "Executar seleção" na visão de dia e "Executar rotina" abrem `/executar/<ocorrência>?fila=selecao&ids=…`, com a fila na ordem do Dia. Não criam mais sessões salvas.
- Sessões salvas antes continuam em `/sessoes` e em Missões › Sessões ativas, com o histórico. "Salvar como rotina" abre o editor de rotina com as missões da sessão, na ordem dela e sem horário; o autor escolhe os dias. Ficam de fora, com o motivo, missões arquivadas, repetições, já em outra rotina ou avulsas concluídas. Nada é gravado até salvar a rotina.
- `Dialog` ganhou a variante `side` (painel à direita; largura total no celular).
