# LMUP — prévia de Missões, formulário, rotinas e sessões

Atualização da segunda avaliação: [ajustes e validação](missions-ux-review-2-2026-11-02.md).

Data: 02/11/2026. Branch local: `feat/missions-ux-round1`. Base: `8c6f55a` (PR #50 integrado). Nenhum PR, push, merge ou publicação na instalação principal.

## Avaliação

- [Abrir demonstração com dados sintéticos](http://127.0.0.1:5295/missoes?demo=1).
- [Comparações antes/depois e capturas desktop, 390 e 320 px](http://127.0.0.1:5294/).
- [Sessões salvas](http://127.0.0.1:5295/missoes?view=sessions) e [sessão em andamento](http://127.0.0.1:5295/sessoes), após abrir a demonstração.

A demonstração prepara exemplos apenas quando não existe banco nessa origem. Reabrir o endereço preserva as alterações feitas durante a avaliação. Os navegadores de teste são descartáveis. Nenhum dado pessoal foi importado ou alterado. A prévia só escuta no computador local. A pasta de evidências fica fora do repositório, em `../evidencias-ux-20261102`.

## O que mudou

**Incremento 1 — organização da Lista:** quatro destinos principais (Lista, Agenda, Rotinas e Áreas), ferramentas secundárias agrupadas, seleção Pendentes/Concluídas/Todas, período de histórico e ações em menu ancorado. Busca, filtros de área/projeto/data, agrupamento, prioridades, seleção de sessão, recuperação, arquivo e ferramentas existentes permanecem acessíveis. Estados vazios e contadores acompanham o filtro atual.

**Incremento 2 — formulário unificado:** criação e edição usam as mesmas quatro seções: Geral, Planejamento, Acompanhamento e Passos e detalhes. No desktop, navegação lateral; no mobile, abas horizontais dentro do formulário. Os campos essenciais vêm primeiro. Os valores continuam montados ao alternar seções; data, recorrência e esforço continuam nos respectivos campos; o resumo no rodapé foi removido na segunda avaliação. Mantidos campos opcionais, projetos, ícones herdados, revisão, rascunho durante a edição, padrões de criação, restrições de rotina, validações e Salvar e criar outra. O fechamento por teclado e a volta do foco preservam o contexto.

**Microação:** novo menor esforço, com 10 XP e 5 ouro base, um quinto do tier Leve. Escala anterior preservada:

| Esforço          | XP base | Ouro base |
| ---------------- | ------: | --------: |
| Microação (novo) |      10 |         5 |
| Leve             |      50 |        25 |
| Moderado         |     100 |        50 |
| Exigente         |     150 |        75 |
| Intenso          |     250 |       125 |

O formulário mostra os valores base nas opções e atualiza a previsão com os bônus atuais. Não há edição manual de XP/ouro. Permanecem modificadores, arredondamentos, recursos já aplicáveis, recibos, débitos e prevenção de duplicação. Microação usa o motor existente em execução individual, recorrência, rotina e sessão. Não foi criada economia paralela, bônus de rotina/sessão ou limite diário. Cadastros legados com recompensas próprias preservam seus valores quando não se muda o esforço.

**Rotinas:** área padrão opcional, herdada somente pelas novas missões criadas dentro da rotina. Área individual continua no cadastro da missão. Vincular missões existentes ou trocar o padrão não reclassifica missões antigas. Cada atividade vinculada oferece Editar, que reutiliza o formulário unificado, mantém o rascunho da rotina ao salvar/cancelar e atualiza sua apresentação. Uma sessão já iniciada mantém as ocorrências e configurações anteriores, inclusive atividades ainda pendentes. O editor informa quando a execução conserva a configuração anterior. Exclusão de áreas usa o serviço existente e atualiza também o padrão da rotina.

**Exclusão definitiva:** Arquivar e Excluir definitivamente são ações independentes. Missões pessoais ativas e arquivadas podem ser excluídas mesmo com progresso, notas ou recompensas, com confirmação explícita. A operação remove o cadastro, ocorrências, registros de execução, versões de planejamento, conteúdo pessoal em auditorias e vínculos relacionados; preserva projetos e atividades independentes. Rotinas e sessões são ajustadas sem referências quebradas. Os recibos necessários permanecem sem título, nota, área ou vínculo com a missão, mantendo os valores contábeis. Nenhum ganho, estorno ou bônus é executado pela exclusão. Recuperações locais também são saneadas.

A distinção narrativa foi auditada: objetivos de Mundo/Védria ficam nos estados narrativos `profile.world` e `profile.rpgPilot`, separados da tabela de missões pessoais. Novos cadastros pessoais recebem origem explícita `personal`; registros legados dessa tabela mantêm compatibilidade. Origem `story` e origens desconhecidas são recusadas pela exclusão pessoal. Nome, área, dificuldade e ícone não são critérios de autorização.

**Navegação:** concluir pela Lista atualiza missão, contadores e feedback de recompensa sem abrir Hoje. Busca, aba e filtros permanecem. Edição, arquivamento e exclusão preservam a rota atual. Execuções abertas explicitamente por Hoje/Agenda continuam no contexto de execução após registrar progresso. A saída do recibo é uma ação explícita para Missões. No modo detalhado da sessão, avançar exige ação do usuário; no modo rápido, a seleção avança para a próxima pendente, conforme a ampliação aprovada.

**Sessões:** cartões salvos mostram nome, total, concluídas/total, percentual real, barra compacta, estado e Retomar. Na execução, sequência compacta à esquerda no desktop e recolhível no celular, atividade destacada, ordenação/remoção em menus contextuais, progresso geral e recompensa bruta restante calculada com as regras existentes. Conclusão rápida é o padrão para atividades elegíveis de acompanhamento direto; usa registro de progresso existente e seleciona a próxima pendente na mesma tela. Os modos detalhado, parcial, revisão, notas, passos, tempo e quantidade preservam os controles existentes. Não há cronômetro artificial de 25 minutos. Pausa, retomada e encerramento preservam a identidade das ocorrências; encerrar não concede bônus. Concluídas, atividades com acompanhamento específico, revisão ou restrições exigem o caminho aplicável.

Não foram implementadas edição ou duplicação de sessões inexistentes apenas por aparecerem na referência.

## Demonstrações registradas

A galeria inclui em cada largura:

1. Rotina Saúde e três missões com área herdada.
2. Editor Microação mostrando a recompensa e alteração individual para Casa.
3. Rotina atualizada sem perda do rascunho.
4. Salvar, fechar e reabrir, com persistência.
5. Trocar o padrão para Casa mantendo Saúde nas outras missões.
6. Sessão iniciada antes da edição usando configuração e recompensa preservadas.
7. Execução detalhada, sessão pausada, retomada, conclusão rápida, fim e encerramento.
8. Confirmação de exclusão definitiva com informação sobre conteúdo removido e recibos preservados.

As comparações da Lista e do formulário partem da base integrada. As comparações de sessões foram capturadas imediatamente antes da reorganização de sessão, já com as demais ampliações da prévia. Os dados comparados são sintéticos.

## Validação

- Tipos e diagnósticos Svelte: zero erros e avisos.
- Lint: aprovado.
- Build estático e PWA: aprovado.
- 84 testes de serviço direcionados aprovados, em nove arquivos: jornada, produtividade, ícones de áreas, Microação, rotina, remoção, exclusão com histórico e conclusão rápida.
- 87 cenários de navegador distintos validados em desktop, 390 px e 320 px: 72 de Lista/formulário/rotina/sessão/contexto/remoção/produtividade e 15 de recibos, marcos e recompensas. Execuções foram direcionadas; seletores antigos de navegação foram adaptados. Falhas causadas por recargas de desenvolvimento e expectativas da interface anterior foram corrigidas e repetidas com sucesso na versão estável.
- 17 cenários offline de desktop validados; dois exigiram atualizar o teste para abrir o modo detalhado ou usar a saída explícita para Missões e passaram na repetição. Incluem progresso proporcional, backup, rotina, notas, atualizações entre abas, preservação offline e exclusão após recarga.
- Após os últimos ajustes de foco/feedback: repetição direcionada de formulário, rotina e sessão nas três larguras.

Os testes de exclusão verificam missões ativas/arquivadas, com/sem histórico, vínculos em projetos/rotinas/sessões, recibos e débitos preservados, recuperação local, restauração de backup anterior, falha transacional, repetição de comando e tentativa em outra aba. Os de sessão verificam avanço, retomada, configuração congelada e alternância de modos sem recompensar duas vezes.

Não foi executada novamente toda a suíte do produto a cada alteração.

## Persistência, limites e pendências

- Banco continua no esquema 6 e backup no formato 4; foram acrescentados campos opcionais e validações, sem migração estrutural. Rotinas antigas sem padrão e missões legadas continuam aceitas.
- O registro durável de exclusões é unido ao registro recebido ao restaurar backups nesta versão. Isso impede reintrodução por arquivo antigo nesta instalação e acompanha backups novos. Sincronização entre abas usa o mesmo banco e as revisões existentes.
- Um dispositivo limpo que receba somente um backup anterior à exclusão não tem como saber de uma exclusão posterior. Para transportar essa decisão, é preciso também transportar um backup novo com o registro. Arquivos externos antigos não são apagados nem alterados pela aplicação.
- Versões antigas do aplicativo não reconhecem necessariamente Microação ou o novo registro de exclusão. Não importar dados desta prévia em uma versão anterior. A publicação e eventual evolução do formato permanecem sujeitas à avaliação.
- Os registros contábeis mantêm valores/datas/identificadores necessários à integridade. Não representam conteúdo pessoal da missão; não houve limpeza de transações independentes.
- A previsão de recompensa da sessão é bruta. Os ganhos efetivos continuam sujeitos a compensações e demais regras existentes, com recibo do valor efetivamente recebido.
- Execução detalhada é a existente no produto; campos e possibilidades dependem da configuração real. Não foi criado um sistema novo de cronômetros ou sessões.
- Mundo, Acampamento, Aposentos e serviços centrais da economia não foram reformulados. Alterações de persistência ficaram restritas às ampliações autorizadas.
- Os incrementos originais posteriores ao 2 continuam fora desta entrega, salvo as ampliações expressamente aprovadas nesta conversa. Navegação definitiva de Mundo e balanceamento global ficam para avaliação posterior.

O desenvolvimento desta entrega termina na prévia. Integração à main, PR e publicação dependem de aprovação explícita após avaliação.
