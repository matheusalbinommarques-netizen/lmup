# Atualização PWA entre abas: investigação e correção da espera

Base investigada: e013031c21c0d15b8ddda4c29d55922689aa5d20. Trabalho no [PR #37](https://github.com/matheusalbinommarques-netizen/lmup/pull/37), em branch isolada no C:. Data: 31/10/2026.

## Problema e causa tratada

O teste **outra aba com notas não salvas bloqueia a troca até salvar**, em tests/pwa/offline.spec.ts, falhava depois de salvar e pedir novamente a atualização. As duas abas já estavam salvas e bloqueadas para a troca, mas o controlador permanecia na revisão anterior. O cenário com formulário aberto e o cenário de aba legada usavam a mesma forma de espera.

A espera anterior consultava repetidamente a versão por MessageChannel/LMU_META no worker antigo. Essa observação cria trabalho justamente no worker que precisa ficar ocioso para ser substituído. A condição de corrida depende do momento em que a consulta coincide com o pedido de ativação; aumentar o prazo ou repetir a tentativa não remove essa interferência.

O diagnóstico no CI separou o consenso entre abas da ativação nativa: o worker b recebeu o pedido certo, houve ACK positivo das duas abas, a lista de clientes permaneceu igual, a barreira concluiu com sucesso e skipWaiting iniciou sem concluir durante o prazo. Não se tratava de notas ainda não salvas, falta de ACK ou pedido dirigido ao worker errado nessa falha.

A implementação do Chromium 156 usado no CI fundamenta a relação com ociosidade: [IsReadyToActivate](https://github.com/chromium/chromium/blob/156.0.8078.4/content/browser/service_worker/service_worker_registration.cc) depende de HasNoWork do worker antigo; [HasNoWork e SkipWaiting](https://github.com/chromium/chromium/blob/156.0.8078.4/content/browser/service_worker/service_worker_version.cc) consideram trabalho no navegador e ociosidade do renderer. A atribuição à sondagem do teste é a conclusão da investigação apoiada nesses registros e na comparação antes/depois, não uma alegação de defeito no armazenamento pessoal.

## Correção

A espera agora registra DOMContentLoaded de todas as abas antes do clique e aguarda a recarga real. Nenhuma mensagem de sondagem é enviada ao worker antigo durante essa janela. As versões são lidas depois da recarga.

O limite continua em 30 segundos, sem aumentar timeouts nem retries. As verificações de bloqueio com rascunho, formulário ou aba sem protocolo permanecem. No teste de notas, também se exige que as duas abas recarreguem, recebam a mesma versão nova, preservem a URL e mostrem as notas salvas. Não basta mais observar uma troca de controlador sem confirmar a recarga das páginas.

Não há mudança funcional no aplicativo, em pwa/worker.js, no protocolo de consenso ou no sincronizador.

## Evidências recuperadas

| Execução | Evidência |
| --- | --- |
| [41235035026, tentativa 1](https://github.com/matheusalbinommarques-netizen/lmup/actions/runs/41235035026/attempts/1) | Job 124636880986: notas falham em desktop e celular, esperando a versão mudar. |
| [41240387525, tentativa 1](https://github.com/matheusalbinommarques-netizen/lmup/actions/runs/41240387525/attempts/1) | Job 124652877578: mesma falha em desktop; a tentativa posterior verde não explica a primeira. |
| [41246779319](https://github.com/matheusalbinommarques-netizen/lmup/actions/runs/41246779319) | Job 124671741024: formulário falha nas duas plataformas; worker novo instalado em espera e tela Aplicando atualização. |
| Histórico local no C:, sync.log | Linhas 1165 e 1470 registram a mesma falha de notas em celular e desktop. Apenas leitura do histórico. |
| Controle local inicial | Uma falha e nove aprovações; trace, duas capturas e snapshot preservados fora do Git. |
| [41252321680](https://github.com/matheusalbinommarques-netizen/lmup/actions/runs/41252321680) | 188/188 E2E e 29/30 PWA; o diagnóstico das duas abas confirma dados salvos, a ativo e b aguardando. [Artefato](https://github.com/matheusalbinommarques-netizen/lmup/actions/runs/41252321680/artifacts/13061716875), SHA-256 9bd150efa4d77588d3f3d6d2105adaeeb53640fcd07ff40390a7140e8cabc129. |
| [41253447894](https://github.com/matheusalbinommarques-netizen/lmup/actions/runs/41253447894) | Controle dirigido no Linux: duas aprovações e falha na terceira execução; sete não executadas pela parada na primeira falha. Consenso positivo e skip-start sem skip-end. A suíte ampla não foi repetida. [Artefato](https://github.com/matheusalbinommarques-netizen/lmup/actions/runs/41253447894/artifacts/13061832732), SHA-256 0a22871dcc3d5605e976f7d4c1aeb77d8cef54d160c63c769c3095e22bade4c8. |

Os workflows antigos não enviavam artefatos: os logs citavam traces que não foram recuperáveis. Os três logs históricos completos, recortes locais, arquivos da reprodução, artefato do CI e manifesto de hashes estão em ../investigacao-pwa/ no workspace do C:.

## Ambiente e comparação controlada

Foi identificado um desvio no node_modules do checkout de desenvolvimento: Playwright 1.56.1 e Dexie 4.2.1, enquanto o lockfile exige 1.64.1 e 4.4.7. Os primeiros números locais são exploratórios desse ambiente antigo, não validação do lockfile. npm ci alinhou a cópia do C: e foi instalado o Chromium 156.0.8078.4 correspondente ao CI. Nenhuma versão no package.json ou no lockfile foi alterada.

Com as dependências alinhadas e a espera corrigida, sem instrumentação do worker: **20/20 repetições** do cenário de notas, dez por plataforma, retries zero e parada na primeira falha; **4/4 cenários relacionados**, formulário e aba legada em desktop/celular. Os logs são correcao-notas.log e correlatos.log, e os traces estão em correcao-traces/.

As amostras instrumentadas anteriores que passaram não foram aceitas como correção. A validação remota do commit final, incluindo a etapa dirigida antes da suíte completa, continua sendo gate para a integração. Uma amostra finita não prova ausência absoluta de futuras falhas.

## CI e preservação de evidências

Havia pares push/pull_request para o mesmo SHA, por exemplo 20c6231 nas execuções 41248493338 e 41248508265. Push agora dispara somente na main; pull_request permanece sem filtro de arquivos. Os jobs obrigatórios verify (22) e verify (24), build, testes e auditoria foram preservados. Nos dois commits de diagnóstico houve somente uma execução por commit, por pull_request.

Node 24 começa com uma amostra fixa do cenário de notas, cinco vezes em cada plataforma, sem retry e com parada na primeira falha. Depois executa as etapas amplas existentes. A variável explícita LMU_PWA_DIAGNOSTICS habilita somente nesse ensaio o registro de APPLY/ACK, resultado da barreira e início/fim de skipWaiting no servidor de teste. A suíte completa usa o worker sem essa instrumentação.

Em falhas, traces, capturas e snapshots são enviados como artefatos por 14 dias. Um hook executado somente após falhar registra versões e estado de cada aba. Nenhum mecanismo transforma uma falha em aprovação por repetição automática. Os filtros seguem a [documentação oficial de eventos do GitHub](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow).

A conexão GitHub não permite ler a configuração administrativa de proteção (403), e a CLI local não tem autenticação. Os nomes exigidos e todas as etapas foram preservados; nenhuma regra de proteção foi alterada.

## Preservação operacional

A instalação no D:, sua tarefa, controlador, sincronizador e dados do navegador não foram modificados manualmente. Os testes usam contextos descartáveis e a porta 4274. O endereço operacional 127.0.0.1:5174 e o perfil pessoal do Chrome não foram usados nos ensaios.