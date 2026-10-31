# Revisão de segurança para a primeira publicação estável

Data da análise: 31/10/2026. Escopo: distribuição estática do LMUP no Chrome, servida apenas em `127.0.0.1:5174`, e ferramentas que constroem essa distribuição. Esta é uma análise de exposição dos avisos identificados, não uma certificação de ausência de outras vulnerabilidades.

**Recomendação: liberação local condicionada à aprovação explícita de uma exceção temporária e limitada. Não ativar automaticamente antes dessa aprovação.** Não foi identificado um caminho de exploração dos avisos restantes no aplicativo distribuído nesta configuração. A auditoria estrita continua reprovando; não a apresentamos como aprovada.

## Resultado e correções compatíveis

O relatório inicial continha **21 registros moderados e 7 baixos**, sem altos ou críticos. Os moderados derivam de **duas vulnerabilidades de origem**, propagadas pela árvore de dependências; não representam 21 vulnerabilidades independentes.

Aplicado sem atualização de versão principal das ferramentas:

| Correção                                      | Resultado                                                                                                                                                                                         |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sucrase` 3.35.0 → 3.35.1, no lockfile        | Remove sua cadeia antiga de `glob` e elimina um registro moderado. O [changelog oficial](https://github.com/alangpierce/sucrase/blob/main/CHANGELOG.md) descreve a substituição por `tinyglobby`. |
| Override específico de `cookie` 0.6.0 → 0.7.2 | Corrige a validação dos campos do cookie e remove um registro baixo. Mantém as APIs de parse/serialize consumidas pelo framework; o LMUP distribuído não utiliza cookies de servidor.             |

Resultado posterior: **20 registros moderados e 6 baixos**, sem altos ou críticos. Nenhum `npm audit fix --force`, downgrade de ferramentas ou override de versões principais de `glob`/`minimatch` foi aplicado.

## Alertas de origem, impacto e exposição

| Alerta                                                                                                                                | Gravidade        | Impacto descrito                                                                                                                                         | Exposição no LMUP e decisão                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [minimatch — GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249), versões instaladas 3.1.5, 5.1.9, 9.0.9 e 10.2.6 | Moderada         | Padrão de glob controlado por atacante pode amplificar processamento, consumindo CPU e memória. O aviso marca versões anteriores a 11.0.1 como afetadas. | ESLint, ferramentas TypeScript e build. Os padrões vêm dos arquivos de configuração e scripts revisados do repositório, não das missões, backups ou entradas do usuário. A reprodução descrita envolve otimização de padrões; não presumimos que todas as versões antigas reproduzam o mesmo caso. Ausente no caminho de execução do servidor estático. Risco residual de disponibilidade do processo de build; propor exceção local. |
| [glob — GHSA-3g3m-2fjr-6pw4](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4), versão restante 11.1.0                               | Moderada         | Travessia de diretórios pode continuar depois do cancelamento por AbortSignal, consumindo I/O e CPU. Correção anunciada em 14.0.2.                       | Usado por `workbox-build` para gerar o manifesto de arquivos. `scripts/build-pwa.mjs` fornece uma pasta e padrões fixos. Não existe uma API HTTP de glob nem padrões fornecidos por usuários. O limite do sincronizador encerra a árvore de processos de uma verificação que exceda o prazo no Windows. Não equiparar esse limite a uma correção da biblioteca. Propor exceção local.                                                 |
| [deepmerge — GHSA-gcqx-w48m-w2h4](https://github.com/advisories/GHSA-gcqx-w48m-w2h4), 4.3.1                                           | Baixa            | Objetos maliciosos podem alterar o protótipo do objeto resultante do merge. Sem correção publicada no aviso consultado.                                  | Plugin Svelte/Vite e resolução de módulos Rollup, durante desenvolvimento/build. Não é usado para mesclar backups ou objetos de missões. Configuração do repositório aprovada é a entrada confiável. Manter em acompanhamento.                                                                                                                                                                                                        |
| [SvelteKit — GHSA-pfhg-q3qv-9q6r](https://github.com/sveltejs/kit/security/advisories/GHSA-pfhg-q3qv-9q6r), 2.70.3                    | Baixa            | Redirecionamento externo em ações de formulários melhorados por `use:enhance` e rotas que aceitam caminhos iniciados por `//`.                           | Não há `use:enhance`, importação de `$app/forms` ou ações de servidor no LMUP. Os formulários salvam no IndexedDB. O servidor distribuído aceita somente GET/HEAD e não executa SvelteKit. Caminho descrito no aviso não identificado nesta distribuição.                                                                                                                                                                             |
| [SvelteKit — GHSA-27mw-82g8-phjj](https://github.com/sveltejs/kit/security/advisories/GHSA-27mw-82g8-phjj), 2.70.3                    | Baixa            | XSS quando o pré-render usa `setHeaders` com `cache-control` controlado por fonte não confiável.                                                         | Não há `setHeaders` no código da aplicação nem cabeçalho externo usado no pré-render. O servidor fixa `Cache-Control: no-store`. A condição necessária para o ataque não está presente na configuração revisada.                                                                                                                                                                                                                      |
| [cookie — GHSA-pxg6-pf52-xh8x](https://github.com/advisories/GHSA-pxg6-pf52-xh8x)                                                     | Baixa, corrigida | Nomes, paths ou domínios de cookies sem validação podem alterar os campos serializados.                                                                  | Corrigido com 0.7.2; não permanece na auditoria.                                                                                                                                                                                                                                                                                                                                                                                      |

As descrições de impacto acima são paráfrases dos avisos ligados. A avaliação de exposição é uma inferência a partir do código e da configuração do LMUP.

## Classificação dos 21 registros moderados iniciais

Todos os registros abaixo pertencem à validação de código ou à construção do aplicativo, não a módulos utilizados pelo servidor estático em execução. A presença do SvelteKit em `dependencies` não significa que seu servidor seja distribuído: `ssr = false`, adapter estático e o servidor próprio de arquivos definem o caminho real de execução.

| Dependência reportada                         | Origem do alerta                     | Ambiente                     | Após correção         |
| --------------------------------------------- | ------------------------------------ | ---------------------------- | --------------------- |
| `@eslint-community/eslint-utils`              | cadeia ESLint → minimatch            | lint                         | permanece             |
| `@eslint/config-array`                        | minimatch                            | lint                         | permanece             |
| `@eslint/eslintrc`                            | minimatch                            | lint                         | permanece             |
| `@typescript-eslint/eslint-plugin`            | parser/utils/ESLint → minimatch      | lint                         | permanece             |
| `@typescript-eslint/parser`                   | typescript-estree/ESLint → minimatch | lint                         | permanece             |
| `@typescript-eslint/type-utils`               | typescript-estree/utils → minimatch  | lint                         | permanece             |
| `@typescript-eslint/typescript-estree`        | minimatch                            | lint                         | permanece             |
| `@typescript-eslint/utils`                    | utils/ESLint → minimatch             | lint                         | permanece             |
| `eslint`                                      | config/eslintrc/minimatch            | lint                         | permanece             |
| `eslint-config-prettier`                      | ESLint → minimatch                   | lint                         | permanece             |
| `eslint-plugin-prettier`                      | ESLint/config → minimatch            | lint                         | permanece             |
| `eslint-plugin-svelte`                        | ESLint/utils → minimatch             | lint                         | permanece             |
| `typescript-eslint`                           | plugin/parser/utils → minimatch      | lint                         | permanece             |
| `@trickfilm400/rollup-plugin-off-main-thread` | ejs → jake → filelist → minimatch    | build                        | permanece             |
| `ejs`                                         | jake → filelist → minimatch          | build                        | permanece             |
| `filelist`                                    | minimatch                            | build                        | permanece             |
| `glob`                                        | cancelamento e minimatch             | build                        | permanece em Workbox  |
| `jake`                                        | filelist → minimatch                 | build                        | permanece             |
| `minimatch`                                   | vulnerabilidade de origem            | lint/build                   | permanece             |
| `sucrase`                                     | glob → minimatch/cancelamento        | build                        | removido do relatório |
| `workbox-build`                               | glob e cadeia Rollup/EJS             | geração do manifesto offline | permanece             |

Os seis registros baixos restantes são `deepmerge`, `@rollup/plugin-node-resolve`, `@sveltejs/kit`, `@sveltejs/adapter-static`, `@sveltejs/vite-plugin-svelte` e `@sveltejs/vite-plugin-svelte-inspector`. Derivam das três vulnerabilidades baixas ainda abertas descritas acima, incluindo propagação entre pacotes.

## Evidências e limites

- `src/routes/+layout.ts`: renderização pessoal no navegador e shell pré-renderizado; sem backend de dados do usuário.
- `svelte.config.js`: adapter estático. A saída de servidor do compilador não é a distribuição servida.
- `scripts/static-server.mjs` e seus helpers: dependem de módulos nativos do Node; não carregam ESLint, glob, minimatch, cookie ou deepmerge para tratar requisições.
- `scripts/build-pwa.mjs`: Workbox é usado apenas para listar arquivos; o service worker é gerado do código próprio em `pwa/worker.js`. Não é distribuído `workbox-build` ao navegador.
- Busca no código não encontrou `use:enhance`, `$app/forms`, `setHeaders` ou uso de cookies de servidor.
- A correção no lockfile exige repetir os 184 testes de interface, build, testes de serviço, publicação, política de exceção, offline e integridade de pacote antes de criar a branch estável.

Código de um repositório ou configuração de build malicioso continua podendo executar comandos com as permissões do usuário. Por isso, a branch estável deve receber apenas commits revisados e aprovados. O clone isolado protege os arquivos de desenvolvimento e a ativação atômica protege a versão publicada; não constituem isolamento de segurança do sistema operacional.

## Exceção proposta, ainda não aprovada

Escopo proposto: **uma publicação local do commit validado**, com hash SHA-256 do conteúdo do `package-lock.json` normalizado apenas de CRLF para LF, por até sete dias. A normalização evita divergências artificiais no checkout Windows; qualquer mudança de conteúdo invalida a aprovação. Cobrir somente os dois avisos moderados acima. Não alterar `audit:security`, não esconder falhas da integração contínua e não aplicar a exceção a hospedagem pública, servidor SvelteKit, código não revisado ou outro lockfile.

O controlador foi preparado para exigir `approved: true`, identificação de quem aprovou, commit e hash do lockfile correspondentes, aprovação não futura e prazo máximo de sete dias. Um alerta novo, alto/crítico, erro de rede, relatório inválido, prazo vencido ou alteração de commit/lockfile bloqueia a publicação. O arquivo de aprovação é local e ignorado pelo Git. **Nenhuma aprovação é criada automaticamente.**

Antes de ativar, apresentar ao usuário o commit final, o hash do lockfile e os testes concluídos. A tarefa de sincronização deve permanecer desativada enquanto a aprovação estiver pendente. A versão já instalada continua funcionando.

Se a configuração distribuída passar a usar ações SvelteKit, cookies de servidor, headers externos no pré-render ou padrões/objetos não confiáveis nas bibliotecas afetadas, a conclusão desta análise deixa de valer e a publicação deve ser bloqueada até nova revisão.

## Tarefa separada: manutenção das dependências

Estado: pendente, fora da primeira publicação local. Reavaliar antes do término da exceção e quando surgirem backports compatíveis.

1. Avaliar atualização coordenada de ESLint/TypeScript e suas integrações para aceitar minimatch corrigido, preservando contratos de API.
2. Acompanhar Workbox/glob e atualizar de forma suportada; não forçar glob 14 ou minimatch 11 sobre consumidores legados.
3. Planejar SvelteKit 3 e adapter compatível em branch de manutenção, com revisão de migração, cache e rotas.
4. Acompanhar correção upstream do deepmerge; não trocar por uma versão antiga apenas para silenciar a auditoria.
5. Exigir novamente os 184 testes de interface, testes offline, importação/backup, concorrência e build antes da promoção.

Nenhum upgrade principal dessa tarefa foi misturado à entrega atual.

## Verificação após as correções

- Lint e tipos/Svelte sem erros; build estático concluído.
- 167 testes de serviço aprovados.
- 184 testes de interface aprovados em desktop e celular, incluindo criação/edição, rotina por ocorrência, duas abas, recompensas, estorno, backup e recuperação.
- 30 testes PWA aprovados, incluindo offline, atualização adiada por rascunhos e coordenação entre abas.
- 5 verificações de integridade do pacote aprovadas.
- 12 testes de publicação/sincronização e 4 testes da política de aprovação aprovados; uma simulação com o relatório real foi bloqueada sem aprovação e exercitou a exceção apenas em memória.
- Auditoria estrita: **reprovada, 20 moderados e 6 baixos**. Este resultado exige a decisão explícita de risco proposta acima.

A versão servida ao usuário permaneceu em `7ab804d0572a39a1` durante o trabalho. Não foi aplicada uma nova versão, não foi recarregada a sessão pessoal e não foi criado um arquivo de aprovação.
