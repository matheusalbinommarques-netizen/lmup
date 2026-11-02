# LMUP — ajustes da segunda avaliação

02/11/2026 · branch `feat/missions-ux-round1` · base integrada `8c6f55a`.

[Prévia funcional com dados sintéticos](http://127.0.0.1:5295/missoes?demo=1) · [Comparações visuais](http://127.0.0.1:5294/)

## Formulário e acompanhamento

- Removido o resumo de data e esforço circulado no rodapé. Os valores continuam nos seus respectivos campos; os indicadores de alteração nas abas permanecem.
- O acompanhamento oferece três escolhas: **Concluir de uma vez**, **Concluir por passos** e **Medir progresso**. Tempo, quantidade e porcentagem ficam no terceiro caminho. As três escolhas principais aparecem juntas no celular.
- O comportamento automático dos cadastros antigos é preservado até uma escolha explícita. Passos opcionais continuam possíveis em uma missão de conclusão direta.
- Passos são itens individuais com Adicionar, Remover e mover para cima/baixo. Enter adiciona e foca o próximo campo. Ordem e valores persistem na edição e ao trocar de seção. Mantidos os limites e validações existentes; o número de passos não cria recompensa adicional.
- A execução detalhada ganhou recompensa com ícones, ação principal em largura total, menos espaços vazios e notas/ações secundárias abaixo da conclusão. Iniciar, concluir, registrar progresso, revisar e salvar notas usam os serviços anteriores. Corrigido o recolhimento involuntário das notas após o salvamento.
- Ferramentas utiliza o mesmo padrão visual de botões das abas, com ícone, altura, tipografia e bordas coerentes.

## Áreas

- Busca, cartões compactos, contagens por cadastro e atividades vinculadas, incluindo rotinas que usam a área como padrão ou por suas missões. As contagens distinguem ativas, concluídas e arquivadas; não somam ocorrências recorrentes.
- Atalho para abrir a Lista filtrada pela área, incluindo Geral.
- Criação/edição de nome, descrição opcional e ícone. A descrição usa o campo `Area.descricao` já existente. Nenhuma estrutura paralela, subárea ou hierarquia foi criada.
- Na criação, **Editar ícone da área** fica imediatamente à esquerda de **Criar área**. A biblioteca abre por esse botão. O desenho no botão foi removido no ajuste seguinte. A herança visual continua centralizada na área.
- **Transferir várias missões**, na aba Áreas, permite buscar e selecionar cadastros ativos, concluídos e arquivados, escolher destino, revisar e confirmar. A transação valida se os cadastros ainda correspondem à seleção; uma alteração concorrente impede a transferência parcial.
- A transferência altera somente `areaId` e a revisão da definição atual. Não reescreve ocorrências, registros de execução, notas, projetos, composição de rotinas/sessões, histórico ou recibos econômicos.
- Excluir área ocupada exige escolher previamente o destino. A operação transfere seus cadastros e o padrão das rotinas relacionadas, preservando os demais dados. Geral permanece como destino válido e não pode ser excluída.
- Criação, edição, transferência e exclusão usam o serviço existente e registram auditoria no mecanismo existente. Transferir novamente para a área atual é uma operação sem efeito.

## Compatibilidade e preservação

Banco permanece no esquema 6; backup permanece no formato 4. Áreas antigas sem descrição continuam aceitas. Descrições válidas são exportadas/restauradas; não há migração de classificação. Rotinas continuam herdando área somente em missões novas, com alteração individual permitida; editar o padrão não reclassifica missões existentes.

Não foram alterados o motor global de economia, Mundo, Acampamento ou Aposentos. Dados pessoais não foram utilizados. As sessões iniciadas mantêm suas configurações anteriores e os recibos permanecem imutáveis.

## Validação executada

- Verificação de tipos e Svelte: zero erros e avisos; lint aprovado; build estático/PWA aprovado.
- **35 testes de serviço** aprovados: metadados de área, ícones, rotina, exclusão pessoal e conclusão rápida. Os testes novos verificam backup/restauração, transferências em todos os estados, preservação integral dos dados independentes, auditoria, destino inválido, seleção desatualizada, exclusão ocupada e repetição sem efeito.
- **54 cenários distintos de navegador** validados em desktop, 390 e 320 px: formulário, passos, áreas, ícones, rotinas, produtividade, notas, conclusão e contexto. Foram utilizadas execuções direcionadas; cenários interrompidos por recarga de desenvolvimento ou seletores antigos foram ajustados/repetidos na prévia estável.
- **4 cenários offline** aprovados: agenda/progresso/backup e criação de área/rotina, em desktop e mobile.
- Novas capturas antes/depois em desktop, 390 e 320 px para formulário, acompanhamento, passos, execução detalhada e Áreas.

## Arquivos principais

Interface: `QuickCreate.svelte`, `PlanningDetails.svelte`, `Execution.svelte`, `AreasDialog.svelte`, `Missions.svelte`, `IconPicker.svelte` e `ContextMenu.svelte`. Serviços: `areaService.ts`, `journeyQuery.ts`, validação de descrição em `backupDataService.ts`. Testes: `areaManagement.test.ts`, `refinement-ux.spec.ts` e adaptação dos testes existentes aos novos controles.

A transferência em lote fica na gestão completa da aba Áreas; o diálogo de área aberto durante a criação de missão mantém o fluxo compacto de cadastro/edição, preservando o rascunho da missão.

A prévia continua local. Nenhum PR, push, merge ou publicação na main. O trabalho termina novamente na avaliação.

## Ajustes seguintes — nome, recorrência e botão de ícone

- Removido “Como quer ser chamado?” do formulário de missão; o cadastro de missão deixa de enviar nome de perfil.
- “Editar ícone da área” fica somente em texto, sem o desenho do livro. A seleção e a herança do ícone continuam funcionando.
- A rotina agora expõe sua recorrência: diariamente, semanalmente ou em dias específicos, junto à data inicial. Os dias persistem no modelo existente; não houve migração ou alteração econômica.
- Ao criar uma missão dentro da rotina, o Planejamento mostra a configuração herdada e informa que o vínculo/recorrência se aplicam ao salvar a rotina. Não existe uma segunda escolha de recorrência para essa missão. Na edição de missão já vinculada, o calendário continua controlado pela rotina.
- O rascunho da rotina, a área individual e as configurações das execuções iniciadas permanecem preservados. A aplicação da recorrência continua na transação existente de salvamento da rotina.
- Validação desta atualização: 15 testes de serviço de rotina/organizador e nove execuções de navegador em desktop, 390 e 320 px aprovados, além de tipos, lint e build. A jornada nova verifica herança diária, mudança para semanal/dias específicos e persistência após recarga.
