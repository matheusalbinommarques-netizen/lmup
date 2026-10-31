# GitHub e publicação do LMUP instalado

**Ativação pendente:** a primeira publicação estável aguarda a aprovação descrita na [análise de segurança](SEGURANCA-PUBLICACAO-LOCAL.md). O instalador prepara o clone e uma tarefa desativada por padrão. A versão já instalada permanece ativa.

## Branches e aprovação

- `origin` aponta para o repositório GitHub do LMUP. O antigo remoto no disco foi preservado como `local-origin`.
- `feat/home-rpg-reference` é a branch de desenvolvimento, incluindo o redesign, Recompensa Viva, Missões, Áreas e Recorrências.
- `release/lmup-local` é a única fonte oficial para o aplicativo instalado. Não há merge automático na `main` nem promoção automática de commits de desenvolvimento.

Para uma próxima entrega, faça commit e push na branch de desenvolvimento e aprove explicitamente o commit completo:

```sh
npm run app:promover -- --aprovar COMMIT_COMPLETO_DE_40_CARACTERES
```

Esse comando exige o commit escolhido no HEAD da branch de desenvolvimento, o projeto limpo e o mesmo commit já publicado no GitHub. Executa `verify`, auditoria de dependências e testes PWA; confere novamente o estado e envia o commit para `release/lmup-local`. Um avanço que exigiria reescrever a branch estável é recusado pelo Git. Não usa push forçado.

Outra opção é abrir um PR da branch de desenvolvimento para `release/lmup-local`, conferir os resultados da integração contínua e aprovar seu merge no GitHub. O workflow existente verifica pushes e PRs. A proteção de branch e revisores obrigatórios dependem das configurações do repositório; não são presumidos por este mecanismo.

## Sincronização neste computador

Uma tarefa do Windows executa a sincronização a cada cinco minutos e ao entrar na conta. Ela roda com as permissões normais do usuário, sem abrir o Codex ou uma janela de terminal. É necessário estar conectado à conta do Windows e ter acesso à rede e ao GitHub. Com o computador desligado ou suspenso, a sincronização aguarda.

A cópia de publicação é um clone independente em `.local-app/publication/`, ignorado pelo Git. O desenvolvimento continua na pasta original, inclusive com alterações pendentes. O sincronizador não faz checkout, merge ou instalação de dependências nessa pasta de desenvolvimento.

O controlador instalado em `.local-app/agent/` é uma cópia dos scripts validados. Edições experimentais nos scripts de desenvolvimento não alteram imediatamente o controlador. Mudanças futuras no controlador exigem reinstalação explícita pelo instalador; as novas funcionalidades do aplicativo continuam chegando pela branch estável.

Em cada ciclo:

1. Garante que o servidor local está disponível, sem encerrar um servidor diferente na mesma porta.
2. Confere o endereço do remoto, a branch e a ausência de alterações ou operações Git pendentes na cópia isolada.
3. Busca exclusivamente `origin/release/lmup-local` e aceita somente avanço direto. Sem stash, reset, descarte ou resolução automática de conflitos.
4. Instala as dependências pelo lockfile, executa a auditoria de segurança, `verify`, testes PWA no Chrome e teste de integridade do pacote. Hooks são desabilitados nessa cópia para impedir publicações recursivas. Uma auditoria acima do limite existente de severidade também bloqueia a publicação.
5. Confere novamente branch, commit e arquivos. Copia e confere o build por hashes, ativando a publicação completa de uma vez.
6. Registra o commit e a versão efetivamente publicados. Se o mesmo commit já estiver publicado, não reinstala nem recompila.

Uma falha mantém os arquivos publicados anteriormente. Se o código isolado avançou, mas os testes falharam, o próximo ciclo tenta validar novamente esse commit. Arquivos editados manualmente na cópia isolada bloqueiam a atualização e são preservados.

Uma trava compartilhada com o publicador impede publicação simultânea; a tarefa do Windows também ignora execuções sobrepostas. Cada comando Git tem limite de tempo; instalação e verificação têm limites por comando. A saída das verificações e os erros ficam no log.

## Aplicativo e dados

A origem continua sendo `http://127.0.0.1:5174/`. O sincronizador não acessa nem modifica o perfil pessoal do Chrome, IndexedDB, backups ou arquivos exportados pelo usuário. A atualização do aplicativo não altera as regras econômicas.

O aplicativo busca novidades ao abrir, retornar à janela e a cada minuto enquanto visível. A atualização só é aplicada com **Atualizar agora**, preservando o protocolo existente entre abas e a proteção para operações e formulários pendentes. Na primeira atualização, use **Configurações → Verificar atualização** se ainda estiver na versão anterior à detecção automática.

O publicador mantém até três versões completas e continua oferecendo arquivos imutáveis anteriores às sessões abertas. O banco continua no schema 5 e o protocolo de atualização em 1. Um build com outros valores é recusado pelo publicador: migrações exigem revisão explícita do código de publicação, backup e validação antes de habilitar a nova versão.

O antigo hook de publicação direta após commits foi desabilitado nesta instalação. `app:publicar` recusa publicação direta enquanto a sincronização oficial estiver habilitada. Isso impede que um commit experimental de desenvolvimento chegue ao app por esse caminho.

## Consulta, recuperação e remoção

Na raiz do projeto:

```sh
npm run app:sync-status
npm run app:sincronizar
npm run app:versao
```

O status informa `current`, `published`, `waiting`, `paused` ou `error`, com motivo e horário. `waiting` pode indicar arquivos locais na cópia isolada, outra branch, uma operação Git pendente ou histórico divergente. Nenhum desses casos é resolvido descartando código automaticamente.

Arquivos locais de diagnóstico:

- `.local-app/sync-status.json`: resultado do último ciclo.
- `.local-app/sync.log` e `.previous`: verificações e resultados, com rotação entre ciclos.
- `.local-app/sync-launch-error.log`: erros de inicialização da tarefa.
- `.local-app/active.json`: commit, versão e identificador da publicação ativa.
- `.local-app/sync-config.json`: remoto, branch e caminhos, sem tokens ou senhas.

O serviço usa as credenciais já configuradas no Git do usuário, sem solicitar senha em segundo plano. Se perder o acesso, registre novamente o acesso ao GitHub por um terminal interativo e tente sincronizar. Não coloque tokens na URL do remoto.

Para instalar ou reinstalar o controlador e a tarefa, usando scripts revisados:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/install-local-sync.ps1 -Branch release/lmup-local
```

Somente após os critérios de segurança e a aprovação explícita, usar o mesmo comando com `-Enable`. Sem esse parâmetro, a tarefa e a configuração de sincronização ficam desativadas. Os alertas moderados continuam bloqueando mesmo com a tarefa habilitada, salvo uma exceção local explícita, limitada ao commit e lockfile revisados e com validade máxima de sete dias. Uma exceção não modifica a checagem estrita do GitHub.

Para consultar a tarefa ou removê-la:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/install-local-sync.ps1 -Mode status
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/install-local-sync.ps1 -Mode remove
```

A remoção da tarefa não exclui o clone, as versões publicadas ou os dados pessoais. Parar a sincronização não encerra o servidor do aplicativo já iniciado.

## Preservação inicial e verificação

Antes da publicação, foram identificados seis commits locais ausentes do GitHub, além das alterações de redesign, recompensa e organização pessoal ainda sem commit. O código recente foi conferido e preservado. A varredura de arquivos e diffs desses commits não encontrou padrões de credenciais, chaves privadas, arquivos de ambiente ou bancos de dados destinados ao envio. As capturas de interface e fontes locais fazem parte das entregas; caches, builds, dependências e estado da publicação ficam ignorados.

Os testes de sincronização usam repositórios descartáveis, sem tocar no perfil do Chrome ou no banco pessoal. Cobrem avanço direto, ausência de novidade, edição local, divergência, troca de branch/remoto, falha de testes, falha de publicação, edição durante a validação e trava compartilhada.
