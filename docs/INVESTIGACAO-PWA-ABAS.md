# Investigação da atualização PWA entre abas

Data: 31/10/2026. Base: `e013031c21c0d15b8ddda4c29d55922689aa5d20`.

## Estado da investigação

**Causa ainda não comprovada. Este trabalho não deve ser apresentado como correção da intermitência nem integrado como tal.** Aumentar timeouts, repetir jobs até ficarem verdes ou aceitar uma amostra sem falhas não resolve o problema.

O teste principal é `tests/pwa/offline.spec.ts`, cenário **outra aba com notas não salvas bloqueia a troca até salvar**. A falha ocorre na primeira verificação da versão depois de salvar as notas e clicar novamente em Atualizar agora. O bloqueio inicial por notas não salvas funciona; a revisão ativa permanece na versão anterior por 30 segundos. O cenário **revisão pronta espera formulário aberto e preserva URL e dados ao atualizar** também apresentou falha equivalente.

## Evidências anteriores

| Execução                                                                                                              | Evidência                                                                                                                                                                                         |
| --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [41235035026, tentativa 1](https://github.com/matheusalbinommarques-netizen/lmup/actions/runs/41235035026/attempts/1) | Job `124636880986`: cenário de notas falha em desktop e celular na asserção de mudança de versão.                                                                                                 |
| [41240387525, tentativa 1](https://github.com/matheusalbinommarques-netizen/lmup/actions/runs/41240387525/attempts/1) | Job `124652877578`: cenário de notas falha em desktop; a tentativa posterior verde não explica a primeira falha.                                                                                  |
| [41246779319](https://github.com/matheusalbinommarques-netizen/lmup/actions/runs/41246779319)                         | Job `124671741024`: cenário de formulário falha nas duas plataformas. Diagnóstico: controlador antigo `activated`, novo worker `installed` em waiting, interface mostrando Aplicando atualização. |
| Instalação anterior no C:, `sync.log`, linhas 1165 e 1470                                                             | Mesmo cenário de notas falha respectivamente em celular e desktop, na mesma asserção. Apenas leitura do histórico; sincronizador não alterado.                                                    |

Os logs históricos mencionam `trace.zip`, capturas e `error-context.md`, mas o workflow não fazia upload desses arquivos. A consulta aos artefatos da execução `41246779319` retornou lista vazia. Não é possível apresentar esses traces como recuperados.

Os três logs completos dos jobs e os recortes locais foram preservados fora do Git, em `../investigacao-pwa/` no workspace do C:.

## Reprodução dirigida

O build da base foi executado uma vez, seguido apenas dos cenários afetados na porta de teste `4274`, com contextos descartáveis do Playwright. Não foi usado o perfil pessoal do Chrome nem a origem operacional `5174`.

Primeiro controle sem alteração no aplicativo ou nos testes: `--grep 'outra aba com notas' --repeat-each 5 --retries 0 --trace on`, nas duas plataformas. Resultado: **1 falha e 9 aprovações**. A falha é a mesma asserção de versão após salvar. Seu trace, duas capturas e snapshot estão em `../investigacao-pwa/baseline-traces/`; o log está em `baseline-isolado.log`.

Amostras exploratórias com registro de mensagens e inspeção dos workers passaram (12 cenários relacionados e depois 30 execuções do cenário de notas). Uma amostra com instrumentação inserida somente no worker de teste passou 10/10. Isso não comprova estabilidade do código original: observar a execução pode mudar sua ordem e seu tempo. Uma rodada adicional de instrumentação foi descartada por falha na geração do arquivo de trace; não foi classificada como falha do protocolo PWA.

Um controle posterior, sem instrumentação no aplicativo/worker e com coleta somente em caso de falha, passou 20/20 nos dois cenários relacionados. Esse resultado também não invalida a falha inicial. Na alteração final, a coleta foi movida para o hook após a falha, sem fixture automática que antecipe a criação do contexto de navegador.

Nenhum timeout ou retry foi aumentado. Nenhuma mudança funcional foi aplicada ao aplicativo, ao Service Worker de produção ou ao sincronizador. As tentativas anteriores de aumentar a janela de ACK ou esperar confirmação de desbloqueio, posteriormente revertidas no histórico, também não constituem prova da causa.

## Hipóteses e próximo experimento

1. **Tentativa anterior ainda em conclusão ou desbloqueio tardio entre abas.** Registrar o identificador de cada PREPARE/ACK/ABORT e o instante de conclusão da tentativa. Um ACK negativo tardio precisa ser distinguido de uma ativação já aceita; não basta acrescentar espera fixa.
2. **Ativação aceita, mas impedida por evento pendente no worker anterior ou no candidato.** O estado observado no CI é compatível com essa hipótese, mas os logs antigos não registram `skipWaiting()` nem as promessas pendentes de `waitUntil`/`respondWith`. O próximo experimento deve registrar essas etapas no worker de teste e provocar, separadamente, a conclusão tardia de um fetch e a liberação de uma tentativa abortada. Isso permite testar causalidade, em vez de repetir a suíte.
3. **Corrida no teste entre registro, instalação e seleção do worker aguardando.** Capturar, em cada aba, metadados do controlador, active e waiting, além da navegação. Confirmar explicitamente qual candidato recebeu a solicitação. O texto do aviso sozinho não identifica o worker.

O ciclo de vida de ativação depende dos eventos pendentes e das condições da registration; veja a [especificação de Try Activate](https://www.w3.org/TR/service-workers/#try-activate-algorithm). Essa referência fundamenta o experimento, não prova que um defeito do navegador causou estas falhas.

Antes de ampliar para outro navegador, atualizar Playwright/Chromium ou redesenhar o protocolo, concluir esses experimentos controlados e comparar com o trace do controle que falhou. Não atribuir a causa ao teste, ao navegador ou ao aplicativo sem essa distinção.

## Duplicação de CI e preservação de evidências

Foram encontrados pares `push`/`pull_request` para o mesmo SHA, por exemplo `20c6231`: execuções `41248493338` e `41248508265`. O workflow passa a executar `push` apenas na `main`, mantendo `pull_request` sem filtros de arquivos e os jobs `verify (22)` e `verify (24)` com todas as etapas existentes. A verificação do merge na main permanece; o push de uma branch de trabalho deixa de disparar uma segunda suíte. Isso segue os [filtros oficiais de eventos do GitHub Actions](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow).

Em falhas do job Node 24, o workflow envia `test-results/` e `test-results-pwa/` como artefatos, com retenção de 14 dias e identificação da execução/tentativa. Os traces continuam sendo retidos somente quando o teste falha. Não há retry adicional ou asserção relaxada.

Os nomes dos checks obrigatórios foram preservados. A conexão GitHub retornou 403 ao consultar a configuração administrativa de proteção, e a CLI local não tem autenticação. Não foi alterada nenhuma regra de proteção.

## Evidência nova do PR de diagnóstico

A execução [41252321680](https://github.com/matheusalbinommarques-netizen/lmup/actions/runs/41252321680) passou em Node 22 e falhou em Node 24 exatamente no cenário de notas (29/30 PWA; 188/188 E2E). Sem reexecução do job, foi possível recuperar pela primeira vez o [artefato completo](https://github.com/matheusalbinommarques-netizen/lmup/actions/runs/41252321680/artifacts/13061716875), SHA-256 `9bd150efa4d77588d3f3d6d2105adaeeb53640fcd07ff40390a7140e8cabc129`. O diagnóstico confirma, nas duas abas: notas salvas, tela Aplicando atualização, worker `a` ativo e `b` instalado em espera, ambos com schema 5/protocolo 1.

Foi também identificada divergência de dependências no checkout local: Playwright 1.56.1/Dexie 4.2.1 instalados versus 1.64.1/4.4.7 no lockfile. Os números locais anteriores são evidência exploratória desse ambiente antigo, e não validação do lockfile. `npm ci` alinhou a cópia de desenvolvimento do C:, e foi instalado o Chromium 156 correspondente ao CI. Cinco reproduções dirigidas no ambiente alinhado, com instrumentação, passaram; isso ainda não prova correção.

O próximo commit acrescenta uma etapa curta de estabilidade antes dos testes amplos no Node 24: apenas o cenário de notas, cinco vezes por plataforma, retries zero e parada na primeira falha. O servidor de teste pode registrar, somente mediante variável explícita, quem recebeu APPLY/ACK, o resultado da barreira e início/fim de skipWaiting. A suíte completa e as demais etapas obrigatórias permanecem. O worker de produção não foi alterado.

## Validação deste conjunto de diagnóstico

- `npm run verify`: lint e tipos sem erros; 172 testes unitários e 21 testes de publicação aprovados; build concluído.
- Uma execução completa local de `test:pwa`, com retries explicitamente em zero: **30/30 aprovados**. Esse resultado valida a alteração de diagnóstico, mas não demonstra a eliminação da intermitência reproduzida no controle inicial.
- Os checks remotos `verify (22)` e `verify (24)` devem ser conferidos no PR. Mesmo que aprovem, este trabalho continua sem comprovação da causa e sem autorização técnica para declarar resolvido o problema PWA.

## Preservação operacional

A instalação operacional no D:, sua tarefa agendada, o controlador e os dados pessoais do navegador não foram modificados. O código foi trabalhado na branch isolada `fix/pwa-cross-tab-stability` do checkout no C:. Sem causa comprovada e regressão determinística, este conjunto deve permanecer em revisão, sem merge e sem declaração de estabilidade definitiva.
