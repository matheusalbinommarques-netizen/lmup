# Estado atual do LMUP

Ponto de partida para agentes e para quem retoma o projeto. Atualize no mesmo PR quando uma entrega mudar algo abaixo. Prevalece sobre documentos antigos em `docs/`, que são registros históricos.

Execução e pendências do plano de 04/11: [reconciliação de 09/11](AUDITORIA-20261104-EXECUCAO.md). Não considerar um PR integrado como prova de que todos os critérios do lote foram atendidos.

## Como consultar a versão

- Código de referência: `origin/main`. A `main` local pode estar desatualizada.
- Versão publicada: `npm run app:sync-status`, ou GET em `http://127.0.0.1:5174/release.json`. Nada além dessa leitura na porta 5174.
- Regras de publicação: [SINCRONIZACAO-GITHUB.md](SINCRONIZACAO-GITHUB.md). Autorização vigente e último ciclo: `npm run app:aprovar -- --status`.

## Sistemas ativos

| Sistema      | Entrada                       | Código principal                                                                                                                                                                                   |
| ------------ | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hoje         | `/`                           | `src/lib/journey/Home.svelte`, `todayView.ts`                                                                                                                                                      |
| Missões      | `/missoes`                    | `Missions.svelte`, `ProductivityWorkspace.svelte`                                                                                                                                                  |
| Execução     | `/executar/<ocorrência>`      | `ExecutionScreen.svelte`, `dayQueue.ts`; `/missao` é o detalhe e `/ocorrencia` o registro e a correção                                                                                             |
| Sessões      | `/sessoes`                    | `MissionSession.svelte`, `SavedSessions.svelte`                                                                                                                                                    |
| Evolução     | `/evolucao`                   | `Evolution.svelte`, `src/services/evolution.ts`; Roda (`/roda`), Projetos, Meu progresso e a revisão semanal (`/revisao-semanal`, `WeeklyReview.svelte`, `weeklyReview.ts`) ficam sob este destino |
| Projetos     | `/projetos`                   | `Projects.svelte`, `ProjectDetail.svelte`                                                                                                                                                          |
| Mundo        | `/mundo`, `/mundo/campanha`   | `src/routes/mundo`, `src/lib/world/WorldExperience.svelte`, `src/services/worldService.ts`                                                                                                         |
| Acampamento  | `/acampamento` e `/aposentos` | `src/lib/camp/cinematic/`                                                                                                                                                                          |
| Herói e loja | `/perfil`, `/loja`            | `Profile.svelte`, `HeroSlots.svelte`, `HeroGearDetail.svelte`, `HeroPortrait.svelte`, `ProfileAchievements.svelte`, `Collection.svelte`                                                            |
| Dados        | `/config`                     | `Settings.svelte`, `src/services/backupDataService.ts`                                                                                                                                             |
| Persistência | –                             | `src/services/db.ts` (Dexie, schema 6)                                                                                                                                                             |

## Não tratar como referência

- **Economia antiga do Acampamento** (`Camp.svelte`, `campConstruction`, `campProduction`, `campWorkshop` e relacionados em `src/lib/camp/`): está fora do fluxo publicado, mas **deve ser preservada**. É uma decisão de produto ainda aberta. Não remova nem reative.
- **Outros componentes fora do bundle**, como `AvatarAchievementsPanel.svelte`: não remova sem aprovação explícita.
- **Piloto experimental de Védria:** `/aventura` não é mais jogável; apenas redireciona a `/mundo`. O endereço antigo `/aventura?campanha=ermos` redireciona a `/mundo/campanha`. `src/lib/content/pilot.ts` e `src/services/rpgPilotService.ts` permanecem como código legado fora do fluxo ativo, sem permissão para reativar automaticamente. O campo histórico `profile.rpgPilot` continua no esquema e nos backups; não o apague.
- **`/laboratorio`** mostra um visual anterior ao atual; não serve de referência de design.
- **Rotas sobrepostas** (`/sessao`, `/cla`): continuam existindo; não as remova.
- **Endereços antigos do Acampamento** (`/refugio`, `/refugio/acampamento`, `/santuario`, `/bestiario`): são só redirecionamentos para `/acampamento` (`RedirectToCamp.svelte`), mantidos para favoritos e navegação offline. Registros do ambiente e companheiros ficam dentro do Acampamento, depois de construído.

## Decisões vigentes

- Desktop é a prioridade de produto; mobile continua coberto pela CI e não pode regredir.
- Sem punição por inatividade e sem bloqueio artificial da história principal. A campanha jogável atual é a investigação do Oásis e seu diário no Mundo, não o piloto XP de Védria.
- Mecânicas novas de RPG, como o Assentamento Vivo, são hipóteses, não decisões.
- Telas já aprovadas só mudam com prévia antes e depois e aprovação do autor.
- Nomes, artes e lore provisórios não são definitivos. A marca atual e a origem das artes estão em [arte/MARCA.md](arte/MARCA.md).
- O retrato do Herói é provisório (ícone encapuzado aprovado dentro da moldura rúnica) até a decisão DP3; o retrato enviado pelo usuário sempre vence. `heroi.png` não é o padrão.
- Hoje e Configurações têm um [lembrete opcional de backup a cada 14 dias](A14-LEMBRETE-BACKUP.md), dispensável por mais 14 dias. Instalação vazia não avisa; sem exportação anterior, a carência começa na primeira visita com conteúdo. Cópia automática em pasta continua fora do escopo.
- Plano em execução: [Dia único](PLANO-DIA-UNICO.md), 7 lotes. "Parada" = missão avulsa com dia e 14 dias sem ação, igual no Hoje e na Roda. Conclusão pela linha só para missões diretas, sem passos e do dia; desfazer usa o estorno existente (débito compensado por ganhos futuros). Desde o lote 2, Hoje e Agenda seguem a mesma ordem do dia (`dayOrder` na ocorrência). Desde o lote 3, toda execução acontece em `/executar` (dia, bloco ou missão avulsa); a fila é um trecho do Dia e o cronômetro opcional grava `startedAt` e minutos no registro de execução. Desde o lote 4a, a navegação tem quatro destinos iguais no desktop e no mobile (Hoje · Missões · Evolução · Jornada, em `navigation.ts`), Configurações fica no rodapé da lateral e no ⚙ do mobile, e o projeto tem área opcional (`areaId`, 0 = Geral). Desde o lote 4b, a camada de jogo (`profile.gameLayer`: completa, discreta, desligada; ausente = completa) decide o que aparece, sem mudar registros; caixas e "No que investir?" ficam no Acampamento; os tokens de cor do shell estão num bloco único em `visual.css`. Desde o lote 5a, missão avulsa sem dia fica em Missões › Sem dia (Caixa de entrada; `someday` = Algum dia) e não entra no Hoje; a captura em linguagem natural (`capture.ts`) mostra o destino antes de gravar. Desde o lote 5b, a aba Agenda virou Semana (planejador de 7 dias em `WeekPlanner.svelte`); a visão de dia fica em `?view=agenda&mode=day`. Desde o lote 5c, "Inserir bloco" traz uma rotina para o Dia de hoje (`routineBlocks.ts`, só hoje, sem mudar a rotina); seleções em Missões e "Executar rotina" abrem `/executar` com a fila da seleção (`?fila=selecao`) e não criam mais sessões salvas; sessões antigas continuam em `/sessoes` e podem virar rotina ("Salvar como rotina"). Desde o lote 6a, a Evolução tem a revisão semanal em 3 passos opcionais (semana de domingo a sábado; no sábado, a semana corrente; de domingo a sexta, a última encerrada; sem fila de semanas perdidas). O histórico fica em `profile.weeklyReview` (versionado, validado no backup; schema continua 6); aceitar executa uma ação confirmada, recusar só registra, ignorar não grava. Desde o lote 6b, o passo 3 traz sugestões de horário e duração a partir do cronômetro (`suggestions.ts`; uma por vez, aceitas de hoje em diante, "Não sugerir mais" por missão e tipo), e a preferência `profile.weeklyReview.sundays` põe a linha "Revisão da semana" no Dia aos domingos, sem criar missão. Desde o lote 7, perfil novo nasce na camada Discreta com o primeiro uso opcional pendente (`profile.firstUse`, painel no Hoje com "Agora não", "Pular passo" e "Pular tudo"; retomada em Configurações); perfis e backups sem o campo nunca o veem. `profile.dayHours` (início e fim do dia, opcionais) só muda as horas ≈ e mostra aviso quando a estimativa passa do fim; horas fixas não mudam.
- Auditoria da CI: moderado ou acima reprova, salvo exceção temporária por advisory em `scripts/audit-exceptions.json` ([política](AUDITORIA-SEGURANCA.md)). Nenhuma vigente: a de GHSA-fc5q-39xc-vjpf (`picomatch` <= 4.0.7) saiu em 18/11/2026, quando o GitHub retirou o advisory e o `npm audit` deixou de apontá-lo. A publicação local usa a mesma classificação e exceção (código no agente; exceções lidas do commit candidato), e o resto segue a regra local; na instalação, vale depois de `install-local-sync.ps1 -Mode update-agent`.
- Publicação local: o sincronizador recebe a `main`, mas só publica o commit exato autorizado com `npm run app:aprovar` depois do "integrar e publicar" do autor; falha para até nova autorização ([processo](../AGENTS.md#integração-e-publicação)). Na instalação, vale depois do `update-agent` desta versão do agente, que exige autorização específica.

## Entregas recentes

| PR      | Entrega                                                      | Lição reutilizável                                                       |
| ------- | ------------------------------------------------------------ | ------------------------------------------------------------------------ |
| #59     | Horários em ordem e correções de texto                       | Testar o comportamento antes de corrigir derrubou um achado errado       |
| #60–#63 | Marca LMU, economia de leituras, backup e tipografia         | Sem afirmar desempenho medido onde não houve comparação                  |
| #64     | Acampamento como entrada única e redirecionamentos antigos   | Preservar economia e links offline                                       |
| #65–#67 | Ficha do Herói, textos e Hoje                                | Retrato continua provisório                                              |
| #68–#71 | Testes de integridade e importação de backup                 | Guardas de execução, planejamento e backups                              |
| #72     | Medidor de desempenho versionado                             | Medir antes/depois na mesma máquina                                      |
| #73     | Testes de rotinas independentes do dia da semana             | Explicitar recorrência nos cenários                                      |
| #74     | Guarda de arquivos versionados e cancelamento de PR obsoleto | Execução confirmada; falta ensaio deliberado do cancelamento             |
| #76     | Piloto `/aventura` aposentado; campanha em `/mundo/campanha` | Redirecionar links antigos sem apagar `rpgPilot`                         |
| #77     | Capturas visuais sob demanda                                 | Capturar imagens não equivale à aprovação visual                         |
| #58     | Rotinas legíveis e navegáveis pelo teclado                   | Validar teclado e composição na prévia achou o que os testes não pegavam |
| #57     | Modelo de PR, estado e camadas de teste                      | –                                                                        |
| #79     | A04 concluído e C02 medido com M06                           | Ganho medido não equivale à meta de latência atingida                    |
| #75     | Liberdade do jogador na investigação do Oásis                | Cobrir desfechos, inatividade e produtividade independente               |
| #80     | Fundo lateral com compressão A aprovada                      | Menos bytes de imagem não reduz pixels decodificados nem pré-cache total |
| #56     | Testes não alteram capturas versionadas                      | Reproduzir o defeito antes de corrigir e testar o próprio verificador    |
| C03     | Leitura compartilhada: concluir com 5 anos em 1,4 s          | Contar leituras antes de otimizar; snapshot em `$state.raw`              |
| Lote 1  | Linha de Missão no Hoje: um clique, selos e paradas          | Reproduzir a corrida no teste antes de corrigir                          |
| Lote 2  | Ordem única do dia, hora ≈ e hora fixa editável na linha     | Digitação simulada não preenche `input type=time`; use teclas ou `fill`  |
| Lote 3  | Uma tela de execução, cronômetro opcional e blocos de rotina | Migrar specs por helper (`tests/e2e/execution.ts`), não trecho a trecho  |
| Lote 4a | Quatro destinos, página Evolução e área do projeto           | "No dia" é `todayView().planned`; `plannedToday` inclui as sem data      |
| Lote 4b | Camada de jogo, tokens únicos, caixas no Acampamento         | Prévia com link semeado (`semear.html` no `build/` da worktree)          |
| Lote 5a | Sem dia (caixa + algum dia) e captura com destino visível    | Sem dia saiu do Hoje: specs que contavam com isso precisam de dia        |
| Lote 5b | Semana no lugar da Agenda: 7 dias, mover e reordenar         | Layout por largura do contêiner, não do viewport (1280 tem ~1000 úteis)  |
| Lote 5c | Inserir bloco, fila da seleção e "Salvar como rotina"        | Specs de sessão semeiam uma sessão antiga (`e2e/legacy-session.ts`)      |
| Lote 6a | Revisão semanal: cartão na Evolução e fluxo em 3 passos      | Dia passado só tem plano com versão registrada: semear `planVersions`    |
| Lote 6b | Sugestões de horário e duração e linha de revisão no domingo | Advisory retirado no GitHub leva horas para sair do `npm audit` (#118)   |
| Lote 7  | Primeiro uso opcional, início e fim do dia                   | Banco vazio = perfil novo: `existingUser` só onde a Completa é exigida   |

## Pendências técnicas conhecidas

- `journeyQuery()` é uma fonte compartilhada (`shareReplay`): componentes não podem mutar o snapshot recebido; guarde-o em `$state.raw`. Detalhes em [C03-LEITURA-COMPARTILHADA.md](C03-LEITURA-COMPARTILHADA.md).
- `tests/e2e/today-shell.spec.ts:81` é ignorado de propósito no mobile (a barra lateral só existe no desktop).
- `tests/e2e/alpha.spec.ts:165` falha de forma intermitente no mobile sob carga; passa isolado.
- `tests/e2e/execution-screen.spec.ts:111` (lote 3, passo "Assistir" desmarcado depois do `reload`) foi **corrigido no teste** (20/11). Causa comprovada: `check()` devolve o controle assim que o checkbox nativo muda, mas `setTaskStep` grava numa transação assíncrona do IndexedDB, e o `reload` derrubava a página antes do commit; o banco ficava com `completedSubtasks: []`. Localmente o commit chegava só ~5 ms antes do `reload`; com CPU limitada a 4× a spec original falhou 9/10 no desktop e 10/10 no mobile. O teste agora espera o rótulo do passo ficar riscado, o que só acontece quando o `liveQuery` lê a tarefa gravada. Com a correção: 10/10 em cada projeto com CPU 4× e 40/40 sem limitação (`--repeat-each=20`, 2 workers). O app não mudou: a navegação interna já é bloqueada durante a gravação, e só uma recarga do navegador nos ~10 ms da transação perde a marcação.
- Com 6 workers locais (`--repeat-each=20` de uma só spec), 3 de 40 execuções estouraram 5 s porque o servidor estático de teste (`scripts/serve-static.mjs`) levou ~8,4 s para entregar os chunks JS depois de um `reload`; o dado já estava gravado. Com 2 workers, como na CI, não ocorreu. Pode explicar parte das falhas "sob carga" listadas aqui; não investigado.
- `tests/e2e/area-icons.spec.ts:107` e `tests/e2e/consolidated-productivity.spec.ts:183` falharam 1 vez cada no desktop numa rodada local das specs afetadas do lote 5b, depois da integração do SvelteKit 3 (16/11): o cartão de próxima missão sem o ícone da área e "Executar rotina" sem chegar a `/sessoes`. Passaram em 6/6 isoladas, na segunda rodada completa e na CI do #111. Causa não comprovada (hipótese: carga). Os testes não foram alterados por isso; o segundo mudou no lote 5c porque "Executar rotina" passou a abrir a fila da seleção.
- `tests/e2e/alpha2.spec.ts:83` falhou 1 vez no desktop na suíte completa do lote 6a (17/11): `layered-scene` do Acampamento não apareceu em 5 s em `camp-flow.ts:130`; a captura da falha mostra a cena já carregada. Passou em 5/5 isolada e no mobile da mesma rodada. O lote não toca o Acampamento. Causa não comprovada (hipótese: carga no início da suíte); não está corrigido.
- `tests/pwa/offline.spec.ts:781` ("controle legado sem cache confirmado não aparece como pronto para offline", projeto `mobile-pwa`) é intermitente e **não está corrigido**. Na publicação local do lote 6b (18/11), falhou 1 vez em 50 (o aviso "Atualização disponível" não apareceu em 5 s depois de `registration.update()`) e passou na tentativa seguinte, sem mudança de código; já tinha falhado localmente em 12, 13 e 15/11. Causa não comprovada (hipótese: prazo fixo na interface com a máquina carregada). Investigar sem enfraquecer o teste, num assunto separado.
- `tests/e2e/week.spec.ts:197` ("abrir um dia leva à visão de dia", mobile) falhou 1 vez na suíte completa do lote 7 (25/11, 3 workers) e passou em 6/6 isolada. A tela Semana não usa nada do lote. Causa não comprovada (hipótese: carga, como o `week.spec.ts:122`).
- Toda versão publicada baixa o pré-cache inteiro, mesmo sem mudança no app.
