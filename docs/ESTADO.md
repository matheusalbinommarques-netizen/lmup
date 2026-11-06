# Estado atual do LMUP

Ponto de partida para agentes e para quem retoma o projeto. Atualize no mesmo PR quando uma entrega mudar algo abaixo. Prevalece sobre documentos antigos em `docs/`, que são registros históricos.

## Como consultar a versão

- Código de referência: `origin/main`. A `main` local pode estar desatualizada.
- Versão publicada: `npm run app:sync-status`, ou GET em `http://127.0.0.1:5174/release.json`. Nada além dessa leitura na porta 5174.
- Regras de publicação: [SINCRONIZACAO-GITHUB.md](SINCRONIZACAO-GITHUB.md).

## Sistemas ativos

| Sistema      | Entrada                       | Código principal                                                                                                                        |
| ------------ | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Hoje         | `/`                           | `src/lib/journey/Home.svelte`, `todayView.ts`                                                                                           |
| Missões      | `/missoes`                    | `Missions.svelte`, `ProductivityWorkspace.svelte`                                                                                       |
| Execução     | `/missao`, `/ocorrencia`      | `Execution.svelte`, `OccurrenceExecution.svelte`                                                                                        |
| Sessões      | `/sessoes`                    | `MissionSession.svelte`, `SavedSessions.svelte`                                                                                         |
| Projetos     | `/projetos`                   | `Projects.svelte`, `ProjectDetail.svelte`                                                                                               |
| Mundo        | `/mundo`, `/aventura`         | `src/routes/mundo`, `src/lib/content/world.ts`                                                                                          |
| Acampamento  | `/acampamento` e `/aposentos` | `src/lib/camp/cinematic/`                                                                                                               |
| Herói e loja | `/perfil`, `/loja`            | `Profile.svelte`, `HeroSlots.svelte`, `HeroGearDetail.svelte`, `HeroPortrait.svelte`, `ProfileAchievements.svelte`, `Collection.svelte` |
| Dados        | `/config`                     | `Settings.svelte`, `src/services/backupDataService.ts`                                                                                  |
| Persistência | –                             | `src/services/db.ts` (Dexie, schema 6)                                                                                                  |

## Não tratar como referência

- **Economia antiga do Acampamento** (`Camp.svelte`, `campConstruction`, `campProduction`, `campWorkshop` e relacionados em `src/lib/camp/`): está fora do fluxo publicado, mas **deve ser preservada**. É uma decisão de produto ainda aberta. Não remova nem reative.
- **Outros componentes fora do bundle**, como `AvatarAchievementsPanel.svelte`: não remova sem aprovação explícita.
- **`/laboratorio`** mostra um visual anterior ao atual; não serve de referência de design.
- **Rotas sobrepostas** (`/sessao`, `/cla`): continuam existindo; não as remova.
- **Endereços antigos do Acampamento** (`/refugio`, `/refugio/acampamento`, `/santuario`, `/bestiario`): são só redirecionamentos para `/acampamento` (`RedirectToCamp.svelte`), mantidos para favoritos e navegação offline. Registros do ambiente e companheiros ficam dentro do Acampamento, depois de construído.

## Decisões vigentes

- Desktop é a prioridade de produto; mobile continua coberto pela CI e não pode regredir.
- Sem punição por inatividade e sem bloqueio artificial da história principal.
- Mecânicas novas de RPG, como o Assentamento Vivo, são hipóteses, não decisões.
- Telas já aprovadas só mudam com prévia antes e depois e aprovação do autor.
- Nomes, artes e lore provisórios não são definitivos. A marca atual e a origem das artes estão em [arte/MARCA.md](arte/MARCA.md).
- O retrato do Herói é provisório (ícone encapuzado aprovado dentro da moldura rúnica) até a decisão DP3; o retrato enviado pelo usuário sempre vence. `heroi.png` não é o padrão.

## Entregas recentes

| PR  | Entrega                                    | Lição reutilizável                                                       |
| --- | ------------------------------------------ | ------------------------------------------------------------------------ |
| #59 | Horários em ordem e correções de texto     | Testar o comportamento antes de corrigir derrubou um achado errado       |
| #58 | Rotinas legíveis e navegáveis pelo teclado | Validar teclado e composição na prévia achou o que os testes não pegavam |
| #57 | Modelo de PR, estado e camadas de teste    | –                                                                        |
| #56 | Testes não alteram capturas versionadas    | Reproduzir o defeito antes de corrigir e testar o próprio verificador    |

## Pendências técnicas conhecidas

- `tests/e2e/today-shell.spec.ts:81` é ignorado de propósito no mobile (a barra lateral só existe no desktop).
- `tests/e2e/alpha.spec.ts:165` falha de forma intermitente no mobile sob carga; passa isolado.
- Toda versão publicada baixa o pré-cache inteiro, mesmo sem mudança no app.
