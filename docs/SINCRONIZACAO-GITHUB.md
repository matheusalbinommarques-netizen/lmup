# GitHub e publicação do LMUP instalado

## Fonte oficial

`main` é a única fonte de atualizações do aplicativo instalado. Desenvolva em uma branch própria, abra um Pull Request para `main` e aguarde os jobs obrigatórios `verify (22)` e `verify (24)` do workflow **Verificar LMU**. O mantenedor confere o diff e decide o merge. Não envie commits diretamente para `main`. A antiga `release/lmup-local` fica preservada para recuperação da instalação anterior; não recebe novas promoções.

A regra ativa de `main` exige Pull Request e esses dois jobs, impede exclusão e force push e não permite bypass. Ela não exige uma aprovação formal de outro colaborador; o merge continua sendo uma decisão manual após os checks. O workflow executa lint, tipos, testes unitários e de publicação, build e auditoria em Node 22 e 24; em Node 24 também executa E2E, PWA e teste do pacote. No Node 24, o job `build (24)` publica o build como artefato com manifesto SHA-256; `e2e (1/2)`, `e2e (2/2)` (shards nativos do Playwright) e `pwa` conferem o manifesto e testam esse mesmo build em paralelo. O check `verify (24)` só aprova quando os quatro jobs terminam com sucesso; falha, cancelamento ou job pulado o reprovam.

## Sincronização local

A tarefa do Windows roda a cada cinco minutos e no login, com as permissões normais do usuário, sem abrir janela: chama `wscript.exe` com o iniciador `start-local-sync-hidden.js`, que roda o lançador `start-local-sync.ps1` da mesma pasta já oculto, espera só esse processo e devolve o código de saída do ciclo. Chamar o `powershell.exe` direto, mesmo com `-WindowStyle Hidden`, abre um console que toma o foco por alguns segundos a cada disparo. Ela usa a cópia isolada `.local-app/publication-main/`; alterações no diretório de desenvolvimento não são incorporadas. O controlador instalado em `.local-app/agent/scripts/` é uma cópia dos scripts validados e só muda durante instalação ou migração explícita.

Em cada ciclo, o sincronizador verifica remoto, branch, ausência de alterações locais e operações Git pendentes; busca apenas `origin/main` e aceita somente avanço direto. Se não há commit novo e a publicação ativa já veio dele, não recompila. Um commit novo só segue se tiver autorização de publicação para aquele commit exato (seção abaixo); sem ela, o ciclo para em `awaiting-approval`, sem compilar nem publicar. Para um commit autorizado, instala dependências pelo lockfile, executa a auditoria (a mesma exceção temporária por advisory aprovada para a CI, lida como dado do `scripts/audit-exceptions.json` do commit candidato; no que sobra, a regra local: alto ou crítico bloqueia, moderado exige exceção local válida para o commit e lockfile), `verify`, testes PWA e integridade do pacote. Antes de publicar, confere novamente commit e arquivos. O publicador copia e valida hashes e troca a publicação de uma vez. Falhas mantêm a última versão funcional. Não há stash, reset, force push, resolução automática de conflitos ou publicação direta de commits de desenvolvimento.

O app permanece em `http://127.0.0.1:5174/`, no mesmo perfil do Chrome. A sincronização não acessa IndexedDB, localStorage, Cache Storage ou backups pessoais. O Service Worker continua exigindo a confirmação de atualização entre abas; a versão nova só é aplicada quando o aplicativo oferece **Atualizar agora**. Até três versões de arquivos são mantidas para sessões abertas e recuperação.

## Autorização de publicação

Receber a `main` não autoriza publicá-la. O autor autoriza "integrar e publicar" um PR num SHA exato do HEAD; depois do merge, a autorização é gravada na pasta da instalação (a que contém `.local-app/`):

```powershell
npm run app:aprovar -- --pr <número> --head <SHA completo do HEAD aprovado> --aguardar
```

Antes de gravar, o comando confere:

- no GitHub (`gh`, no repositório do remoto da sincronização), que o PR foi integrado na `main` a partir desse HEAD;
- que `verify (22)` e `verify (24)` passaram nesse HEAD e que nenhum outro check falhou;
- no Git, que o commit do merge está na `main`, contém o HEAD e tem exatamente a mesma árvore que a CI verificou.

Se algo não conferir, recusa sem gravar nada. Um commit novo no PR, um merge de branch desatualizada ou outro commit na `main` nunca herdam a autorização.

A autorização fica em `.local-app/sync-approval.json`, com o commit, a árvore, o PR, o HEAD e os checks. É gravada de forma atômica (arquivo temporário e renomeação) sob a mesma trava da publicação: com um ciclo em andamento, o comando recusa e pode ser repetido depois.

O sincronizador só compila e publica quando a `main` recebida é o commit autorizado e tem a árvore registrada. Depois da publicação confirmada, consome a autorização e guarda o registro em `sync-approval-used.json`. Se o processo cair depois de trocar a versão e antes de consumir, o ciclo seguinte reconhece a versão ativa e consome, sem recompilar.

Uma falha na auditoria, nos testes ou na publicação mantém a versão anterior e marca a autorização como falhada (`approval-failed`). O sincronizador não repete o ciclo; tentar de novo exige uma nova execução de `app:aprovar`, decisão do autor. Com `--aguardar`, o comando espera o ciclo e para na falha. Na publicação, confere os hashes da versão ativa e a `release.json` servida na porta 5174 e relata o resultado. Com o sincronizador pausado, avisa e deixa a autorização aguardando.

- `npm run app:aprovar -- --status` mostra a autorização vigente, a última consumida e o estado do ciclo.
- `npm run app:aprovar -- --revogar` remove a autorização vigente. Não interrompe um ciclo já em andamento.
- Se a `main` avançar antes do ciclo, o commit autorizado não é publicado: o estado mostra o commit recebido e o autorizado, e o novo commit precisa de nova autorização.

## Migração de uma instalação existente

Execute na raiz da instalação que contém `.local-app/`. O procedimento não remove a cópia antiga, a tarefa nem as versões publicadas. Não apague `release/lmup-local` antes de confirmar a migração e o rollback.

1. Confirme no GitHub que `main` está protegida e que os dois jobs obrigatórios passaram no commit atual. Anote `npm run app:versao` e `npm run app:sync-status`. Faça também um backup dos dados pessoais pelo próprio aplicativo.
2. Prepare uma segunda cópia isolada e valide o mesmo commit localmente. Esta etapa não muda a publicação ativa:

   ```powershell
   powershell -NoProfile -ExecutionPolicy Bypass -File scripts/migrate-local-sync.ps1 -Mode prepare
   ```

3. Atualize a pasta da instalação para o mesmo commit aprovado em `main`, com a árvore de trabalho limpa. Confira `-Mode status` e ative. O script recusa controlador fora desse commit, desativa temporariamente a tarefa, recusa migração com sincronização em andamento, salva a configuração, o controlador e o ponteiro da publicação, troca a fonte para `main`, executa um ciclo completo de validação e publicação e reativa a tarefa. Se o ciclo falhar, restaura a configuração anterior e a publicação funcional. Como o ciclo só publica um commit autorizado, autorize antes o commit da `main` com `npm run app:aprovar` (seção [Autorização de publicação](#autorização-de-publicação)); sem isso, a ativação para em `awaiting-approval` e restaura o estado anterior:

   ```powershell
   powershell -NoProfile -ExecutionPolicy Bypass -File scripts/migrate-local-sync.ps1 -Mode activate
   ```

4. Confirme que `npm run app:sync-status` mostra `main` como origem e que `npm run app:versao` mostra a versão publicada. A versão no Chrome pode ser aplicada pelo fluxo seguro existente. Depois, uma alteração integrada em `main` só é publicada com a autorização do commit exato (seção acima), após todas as verificações locais.

Se uma validação falhar, a tarefa antiga e a publicação anterior são preservadas. Corrija a causa, execute `prepare` novamente e depois `activate`. Para voltar à fonte anterior, use:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/migrate-local-sync.ps1 -Mode rollback
```

O rollback restaura o ponteiro da publicação, a configuração e o controlador salvos em `.local-app/migration-main-backup/`. O backup também guarda e confere os arquivos da versão anterior, mesmo que a retenção normal deixe de mantê-los. Não remove a cópia `publication-main`, a antiga `publication`, as versões guardadas ou os dados do Chrome. Antes de voltar a ativar `main`, execute `prepare` novamente.

## Instalações novas e manutenção

Para uma instalação nova, prepare o sincronizador com:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/install-local-sync.ps1 -Branch main
```

O instalador deixa a tarefa desativada sem `-Enable`; use esse parâmetro apenas depois de conferir a proteção de `main`, a auditoria e a versão a publicar. Em uma instalação antiga, o instalador recusa substituir a configuração e orienta a migração acima.

O agente roda uma cópia própria dos scripts em `.local-app/agent/scripts`. Para atualizá-la depois de um merge que mude esses arquivos, a partir de uma cópia limpa e atualizada da `main`:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/install-local-sync.ps1 -Branch main -Mode update-agent
```

O modo `update-agent` prepara e valida a nova versão (arquivos da lista, sintaxe, importações), espera nenhum ciclo ou publicação estar em andamento e a grava completa em `agent/versions/<id>`. Depois troca `agent/current.json` (versão atual e anterior) numa única renomeação e, na primeira vez, põe em `agent/scripts/sync-local.mjs` (o caminho que a tarefa agendada executa) um carregador fixo (`scripts/agent-bootstrap.mjs`), guardando o original como `sync-local.legacy.mjs`. Interrompido em qualquer passo, o agente continua com a versão anterior ou já com a nova, nunca sem nenhuma; se a atual sumir, o carregador roda a anterior, e sem nenhuma sai sem publicar. Versões antigas não são apagadas automaticamente. Não altera a configuração, a tarefa agendada, o lançador `.local-app/start-local-sync.ps1`, a cópia `publication-main` nem o servidor da porta 5174. A lista de arquivos do agente fica em `scripts/local-agent-files.mjs` e é conferida por teste contra os dois instaladores.

Uma tarefa criada antes do iniciador oculto (ação `powershell.exe -File ...\start-local-sync.ps1`) muda só a ação, sem reinstalar:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/local-sync-task-action.ps1 -Mode apply -TaskName '<nome da tarefa>'
```

O modo `apply` espera o ciclo em andamento terminar, exporta a definição inteira da tarefa para `.local-app/sync-task-antes-janela-oculta-<data>.xml`, copia o iniciador para a pasta do lançador que a tarefa já roda e troca a ação. Gatilhos, usuário, configurações e diretório de trabalho são conferidos contra o backup; se algo além da ação mudar, a definição original é registrada de volta. Para voltar: `-Mode rollback -TaskName '<nome>' -Backup <xml>`. `-Mode status` mostra o mecanismo em uso. Os testes com o Agendador de Tarefas de verdade (foco da janela, troca e reversão em tarefas sintéticas) rodam com `LMUP_TEST_SCHEDULED_TASK=1 node --test scripts/local-sync-launcher.test.mjs`.

Consulte o estado com `npm run app:sync-status`, a versão servida com `npm run app:versao` e a tarefa com `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/install-local-sync.ps1 -Mode status`. `npm run app:sincronizar` executa um ciclo manual do mesmo controlador. O status informa `current`, `published`, `awaiting-approval` (commit recebido sem autorização), `approval-failed` (commit autorizado que falhou; aguarda nova autorização), `waiting`, `paused` ou `error`; logs e estado ficam em `.local-app/`. O serviço usa as credenciais já configuradas no Git, sem token na URL do remoto.
