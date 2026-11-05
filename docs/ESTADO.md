# Estado atual do LMUP

Ponto de partida para agentes e para quem retoma o projeto. Atualize no mesmo PR quando uma entrega mudar algo abaixo. Prevalece sobre documentos antigos em `docs/`, que são registros históricos.

## Como consultar a versão

- Código de referência: `origin/main`. A `main` local pode estar desatualizada.
- Versão publicada: `npm run app:sync-status`, ou GET em `http://127.0.0.1:5174/release.json`. Nada além dessa leitura na porta 5174.
- Regras de publicação: [SINCRONIZACAO-GITHUB.md](SINCRONIZACAO-GITHUB.md).

## Sistemas ativos

| Sistema      | Entrada                         | Código principal                                             |
| ------------ | ------------------------------- | ------------------------------------------------------------ |
| Hoje         | `/`                             | `src/lib/journey/Home.svelte`, `todayView.ts`                |
| Missões      | `/missoes`                      | `Missions.svelte`, `ProductivityWorkspace.svelte`            |
| Execução     | `/missao`, `/ocorrencia`        | `Execution.svelte`, `OccurrenceExecution.svelte`             |
| Sessões      | `/sessoes`                      | `MissionSession.svelte`, `SavedSessions.svelte`              |
| Projetos     | `/projetos`                     | `Projects.svelte`, `ProjectDetail.svelte`                    |
| Mundo        | `/mundo`, `/aventura`           | `src/routes/mundo`, `src/lib/content/world.ts`               |
| Acampamento  | `/refugio/acampamento` e outras | `src/lib/camp/cinematic/`                                    |
| Herói e loja | `/perfil`, `/loja`              | `Profile.svelte`, `HeroIdentity.svelte`, `Collection.svelte` |
| Dados        | `/config`                       | `Settings.svelte`, `src/services/backupDataService.ts`       |
| Persistência | –                               | `src/services/db.ts` (Dexie, schema 6)                       |

## Não tratar como referência

- **Economia antiga do Acampamento** (`Camp.svelte`, `campConstruction`, `campProduction`, `campWorkshop` e relacionados em `src/lib/camp/`): está fora do fluxo publicado, mas **deve ser preservada**. É uma decisão de produto ainda aberta. Não remova nem reative.
- **Outros componentes fora do bundle**, como `AvatarAchievementsPanel.svelte`: não remova sem aprovação explícita.
- **`/laboratorio`** mostra um visual anterior ao atual; não serve de referência de design.
- **Rotas sobrepostas** (`/sessao`, `/refugio`, `/santuario`, `/cla`): continuam existindo; não as remova.

## Decisões vigentes

- Desktop é a prioridade de produto; mobile continua coberto pela CI e não pode regredir.
- Sem punição por inatividade e sem bloqueio artificial da história principal.
- Mecânicas novas de RPG, como o Assentamento Vivo, são hipóteses, não decisões.
- Telas já aprovadas só mudam com prévia antes e depois e aprovação do autor.
- Nomes, artes e lore provisórios não são definitivos. O logotipo oficial é preservado.

## Entregas recentes

| PR  | Entrega                                 | Lição reutilizável                                                    |
| --- | --------------------------------------- | --------------------------------------------------------------------- |
| #56 | Testes não alteram capturas versionadas | Reproduzir o defeito antes de corrigir e testar o próprio verificador |

## Pendências técnicas conhecidas

- Um teste E2E ignorado na CI; candidato: `tests/e2e/today-shell.spec.ts:85`. Falta confirmar.
- Toda versão publicada baixa o pré-cache inteiro, mesmo sem mudança no app.
