# Acampamento — integração ao fluxo principal

03/11/2026. Branch: `feat/camp-modular-continuation`. Checkout: `D:/Projetos/Level Me Up`.

Prévia da compilação normal: http://127.0.0.1:5310/refugio/acampamento.
Demonstração aprovada, preservada na origem anterior: http://127.0.0.1:5308/refugio/acampamento.
Capturas desta etapa: `D:/Codex-artifacts/camp-integration-20261103/captures/`.
Galeria: `D:/Codex-artifacts/camp-integration-20261103/GALERIA.html`.

## Comportamento integrado

O Centro cinematográfico agora é a tela normal de `/refugio/acampamento`, acessível pela navegação principal no computador, pelo menu no celular e pelo Mundo. `/aposentos` abre diretamente o interior quando construído; antes da compra retorna ao Centro. Bestiário e Jardim abrem suas cenas pelos hotspots do Centro. Todas retornam ao Centro. O retorno ao Mundo continua dentro da pintura, à esquerda, na posição aprovada.

A compilação normal usa o XP acumulado da jornada. A conclusão de uma missão foi verificada com Centro e Jardim já abertos em abas distintas: ambos passaram imediatamente ao estágio 2 pelo XP concedido pelo serviço existente, sem recarga das cenas ou controles de simulação.

Uma compra de 50 ouro habilita casa, Bestiário e Jardim. A compra registra um recibo único e não provisiona recursos, XP ou recompensas. Um perfil novo nesta origem começa com os recursos normais do aplicativo: zero ouro e zero comida. Os testes preparam recursos exclusivamente nos contextos descartáveis. Não foi carregado um perfil pessoal nesta prévia.

O estado normal fica em `profile.campSettlement`, separado de `campPreview` e da economia anterior em `profile.camp`. Não há mudança de schema do IndexedDB. Perfis que já possuem acampamento legado válido e seu recibo são reconhecidos como construídos sem cobrança adicional. Estoque, construções, recibos antigos, XP, nível, comida e demais dados permanecem preservados. Um legado sem recibo é recusado, sem reparação ou substituição automática dos dados.

A restauração de backup valida estado e recibos e renova a época para impedir confirmações antigas. Backups anteriores sem o novo campo continuam aceitos. Falhas de gravação revertem integralmente a compra e a inicialização.

No Acampamento normal não aparecem simulação de XP, saldo sintético ou reinício de demonstração. Mesmo que um backup carregue `campPreview`, esse campo não substitui o XP normal nem a lista de companhias do painel do Centro. O modo de demonstração mantém seus serviços e banco separados, com recusa explícita dos comandos da integração normal.

Aposentos reutiliza os painéis existentes de inventário, conquistas e progresso. No Jardim, “Consultar registros do ambiente” reutiliza a consulta dos marcos em painel sobreposto; abrir o painel não concede recompensas. Companhias não descobertas permanecem ocultas no Bestiário do Centro. As regras de companhia inicial e desbloqueio do aplicativo existente foram preservadas.

As rotas anteriores de consulta (`/refugio`, `/santuario` e `/bestiario`) permanecem compatíveis no modo normal para preservar acesso aos registros e à coleção existentes. A navegação do novo Acampamento utiliza suas próprias cenas. Não foi criado outro exterior para os Aposentos. A interface antiga de construção/produção foi retirada do fluxo normal do Centro; seus serviços e estado foram preservados internamente.

## Offline e apresentação

As imagens aprovadas agora entram também no precache normal, por lista explícita. O limite de 3 MiB por arquivo permanece. Build final: 476 arquivos essenciais, 51.816.413 bytes, release `8f54921f0ca8e6ff`. O aumento em relação ao build normal anterior corresponde às imagens das cenas e dos painéis.

Após concluir a preparação inicial online foram verificados compra, navegação para o Jardim/interior, imagens, persistência de saldo/XP e recarga offline. Uma confirmação aberta em outra aba bloqueia a atualização; cancelar libera a atualização sem cobrar.

Nenhuma arte foi recriada nesta etapa. Permanecem as limitações de recortes, sombras e fidelidade visual registradas em `docs/CAMP-MODULAR-20261103.md`. A prova visual já aprovada não foi refeita. Foram produzidas capturas do modo normal, incluindo quatro estágios, interior, Centro vazio/construído e celular.

## Validação executada nesta etapa

- Lint: passou.
- Svelte/TypeScript: zero erros e zero avisos.
- Testes direcionados de serviços e cenas: **78 passaram em seis arquivos**, cobrindo compra única, concorrência, saldo insuficiente, rollback, legado, backup, restauração e isolamento da demonstração.
- Cache: **seis testes passaram**.
- Navegador: **14 casos do Acampamento passaram**, computador/celular, incluindo atualização por uma missão da jornada. Outros **48 casos de rotas, Mundo e registros do ambiente passaram**. As repetições foram limitadas aos testes de preparação e seletores corrigidos; os 62 casos distintos passaram nas rodadas registradas.
- Offline/PWA direcionado: **seis casos passaram**, computador/celular, em 22,5 segundos na rodada final.
- Acesso pelos menus da versão final e retorno ao Mundo: conferidos nos dois tamanhos, sem erros de página.
- Compilação normal: passou. `git diff --check`: sem erros de espaços.

Os seis casos antigos de interação com a interface econômica do Centro foram substituídos pelos testes da interface cinematográfica que passou a ocupar essa rota. Os testes de serviço da economia anterior continuam executados e aprovados; os antigos arquivos de teste de interface foram preservados como referência nos artefatos desta etapa. Os testes de atualização offline foram adaptados à confirmação de compra atual, preservando a verificação de bloqueio entre abas. Não foram adicionadas omissões ou desativadas proteções de atualização.

Não houve repetição da suíte completa, publicação, merge em `main` ou alteração da instalação real `http://127.0.0.1:5174`. Toda execução no navegador usou perfis/contextos sintéticos descartáveis. Os builds, logs, capturas e arquivos de trabalho permaneceram no D:.

Logs em `D:/Codex-artifacts/camp-integration-20261103/`: `lint.log`, `check.log`, `service-tests.log`, `cache-tests.log`, `browser-tests.log`, `browser-camp-final.log`, `canonical-xp-tests.log`, `offline-tests.log`, `normal-build.log`. A rodada inicial de navegador registra falhas de seletores/fixtures, corrigidas e repetidas nos logs finais. `main-navigation.json` registra a conferência dos acessos da versão final.

## Arquivos desta integração

- `src/lib/camp/cinematic/settlementState.ts`: estado normal estritamente validado.
- `src/services/campSettlementService.ts` e `.test.ts`: inicialização sem provisão, reconhecimento do legado e compra atômica.
- `src/services/campPreviewService.test.ts`: recusa dos comandos normais no banco da demonstração.
- `src/services/db.ts`, `backupDataService.ts`: campo opcional e validação/restauração sem mudança de schema.
- `src/lib/camp/cinematic/CampCinematic.svelte`, `state.ts`: seleção explícita do modo, XP normal e controles sintéticos restritos.
- `src/lib/journey/AppShell.svelte`, `Refuge.svelte`, `Companions.svelte`: navegação, painel dos marcos e descoberta independente da simulação.
- `src/lib/world/WorldExperience.svelte`: entrada para o Centro.
- `src/routes/refugio/acampamento/+page.svelte`, `src/routes/aposentos/+page.svelte`: uso normal da experiência aprovada.
- `scripts/local-precache.mjs`, `.test.mjs`: imagens revisadas no cache do aplicativo normal.
- `tests/e2e/camp-flow.ts`, `camp-integrated.spec.ts`, `world-exploration.spec.ts`; `tests/pwa/camp-offline.spec.ts`, `world-camp-integration.spec.ts`: jornadas atualizadas.
- `.gitignore`: saída gerada dos testes da demonstração excluída do versionamento.
- Este relatório: `docs/CAMP-INTEGRACAO-20261103.md`.

## Reabrir a prévia

```powershell
Set-Location 'D:\Projetos\Level Me Up'
$env:TEMP = 'D:\Codex-storage\tmp'
$env:TMP = $env:TEMP
$env:LMU_PREVIEW_PORT = '5310'
node scripts/serve-static.mjs
```

O servidor serve o build normal em `D:/Projetos/Level Me Up/build`. Para reconstruir: definir `VITE_CAMP_PREVIEW=false` e executar `npm run build`. A integração está disponível para revisão nessa origem separada; não foi ativada na instalação pessoal.
