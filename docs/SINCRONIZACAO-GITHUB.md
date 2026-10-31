# GitHub e publicação do LMUP instalado

## Fonte oficial

`main` é a única fonte de atualizações do aplicativo instalado. Desenvolva em uma branch própria, abra um Pull Request para `main`, obtenha revisão e aguarde os jobs obrigatórios `verify (22)` e `verify (24)` do workflow **Verificar LMU**. Não envie commits diretamente para `main`. A antiga `release/lmup-local` fica preservada para recuperação da instalação anterior; não recebe novas promoções.

A proteção de `main` no GitHub deve exigir Pull Request, aprovação e esses dois jobs, além de impedir push direto e force push. O workflow executa lint, tipos, testes unitários e de publicação, build e auditoria em Node 22 e 24; em Node 24 também executa E2E, PWA e teste do pacote. A configuração dessas regras pertence às configurações do repositório e deve ser conferida antes de ativar a migração.

## Sincronização local

A tarefa do Windows roda a cada cinco minutos e no login, com as permissões normais do usuário. Ela usa a cópia isolada `.local-app/publication-main/`; alterações no diretório de desenvolvimento não são incorporadas. O controlador instalado em `.local-app/agent/scripts/` é uma cópia dos scripts validados e só muda durante instalação ou migração explícita.

Em cada ciclo, o sincronizador verifica remoto, branch, ausência de alterações locais e operações Git pendentes; busca apenas `origin/main` e aceita somente avanço direto. Se não há commit novo e a publicação ativa já veio dele, não recompila. Para um commit novo, instala dependências pelo lockfile, executa auditoria estrita ou exceção local válida para o commit e lockfile, `verify`, testes PWA e integridade do pacote. Antes de publicar, confere novamente commit e arquivos. O publicador copia e valida hashes e troca a publicação de uma vez. Falhas mantêm a última versão funcional. Não há stash, reset, force push, resolução automática de conflitos ou publicação direta de commits de desenvolvimento.

O app permanece em `http://127.0.0.1:5174/`, no mesmo perfil do Chrome. A sincronização não acessa IndexedDB, localStorage, Cache Storage ou backups pessoais. O Service Worker continua exigindo a confirmação de atualização entre abas; a versão nova só é aplicada quando o aplicativo oferece **Atualizar agora**. Até três versões de arquivos são mantidas para sessões abertas e recuperação.

## Migração de uma instalação existente

Execute na raiz da instalação que contém `.local-app/`. O procedimento não remove a cópia antiga, a tarefa nem as versões publicadas. Não apague `release/lmup-local` antes de confirmar a migração e o rollback.

1. Confirme no GitHub que `main` está protegida e que os dois jobs obrigatórios passaram no commit atual. Anote `npm run app:versao` e `npm run app:sync-status`. Faça também um backup dos dados pessoais pelo próprio aplicativo.
2. Prepare uma segunda cópia isolada e valide o mesmo commit localmente. Esta etapa não muda a publicação ativa:

   ```powershell
   powershell -NoProfile -ExecutionPolicy Bypass -File scripts/migrate-local-sync.ps1 -Mode prepare
   ```

3. Atualize a pasta da instalação para o mesmo commit aprovado em `main`, com a árvore de trabalho limpa. Confira `-Mode status` e ative. O script recusa controlador fora desse commit, desativa temporariamente a tarefa, recusa migração com sincronização em andamento, salva a configuração, o controlador e o ponteiro da publicação, troca a fonte para `main`, executa um ciclo completo de validação e publicação e reativa a tarefa. Se o ciclo falhar, restaura a configuração anterior e a publicação funcional:

   ```powershell
   powershell -NoProfile -ExecutionPolicy Bypass -File scripts/migrate-local-sync.ps1 -Mode activate
   ```

4. Confirme que `npm run app:sync-status` mostra `main` como origem e que `npm run app:versao` mostra a versão publicada. A versão no Chrome pode ser aplicada pelo fluxo seguro existente. Depois, uma alteração aprovada e integrada em `main` chegará automaticamente, após todas as verificações locais.

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

Consulte o estado com `npm run app:sync-status`, a versão servida com `npm run app:versao` e a tarefa com `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/install-local-sync.ps1 -Mode status`. `npm run app:sincronizar` executa um ciclo manual do mesmo controlador. O status informa `current`, `published`, `waiting`, `paused` ou `error`; logs e estado ficam em `.local-app/`. O serviço usa as credenciais já configuradas no Git, sem token na URL do remoto.
