# Sessões ativas — prévia funcional

Implementação na branch `feat/active-mission-sessions`, a partir da main `74505b3`. Não integrada à main.

## Comportamento entregue

- Acesso a Sessões ativas junto de Pendentes, Concluídas e Todas, com contador. A lista reúne filas em andamento e pausadas; somente uma permanece em foco.
- Pendentes mostra atividades disponíveis para organizar. Atividades reservadas em sessões abertas não são oferecidas para outra sessão; seus cadastros continuam em Todas, com identificação do vínculo.
- Inclusão de missões na execução e nos cartões de sessão, com busca e área, preservando cursor, ordem anterior, progresso e configuração das ocorrências existentes. As novas ocorrências entram no fim e não alteram a rotina de origem.
- Pausar mantém a fila e oferece retomada. Encerrar exige confirmação, informa as conclusões preservadas e as pendências liberadas. As atividades mantêm suas datas; encerramento não é reagendamento.
- A última conclusão encerra automaticamente a fila e mostra o resumo no mesmo contexto. Não há bônus de sessão nem navegação automática para Hoje. A volta à Lista depende da ação explícita do usuário.
- Sessões encerradas deixam de ser retomáveis e não aparecem na lista. A fila é removida de fato; permanece apenas um registro mínimo com identificador, estado e encerramento para validar as referências dos registros de execução.
- Sessões antigas encerradas ou inteiramente concluídas são normalizadas sem mover saldos. Seus vínculos deixam de bloquear reagendamento ou reserva em novas sessões.
- Backups continuam no formato e esquema existentes, com metadados opcionais validados. Uma restauração no mesmo perfil preserva encerramentos já registrados, sem descartar os demais dados. Uma instalação limpa com um backup anterior ao encerramento não conhece ações posteriores que não constem do arquivo.
- Organização avançada sai dos menus. A rota antiga encaminha à Lista atual, preservando os parâmetros de consulta. As funções de cadastro, execução, revisões, correções e histórico continuam nos componentes atuais.

## Integridade

As operações de incluir e encerrar usam as transações existentes, com validação da revisão e da disponibilidade de cada ocorrência. A mesma ocorrência não pode ser reservada em duas sessões abertas. Uma aba desatualizada não pode reabrir ou editar uma sessão encerrada. Conclusão rápida, detalhada e individual atualizam o ciclo da sessão; repetição da conclusão mantém os mesmos recibos e saldos.

Não houve mudança de XP, ouro, comida, modificadores, progressão, inventário ou dados narrativos. Progresso parcial e sua configuração permanecem preservados ao liberar uma ocorrência para nova sessão.

## Validação executada

- 79 testes de serviço aprovados nos arquivos activeSessions, consolidatedProductivity, productivity, backupDataService e personalTaskDeletion.
- Tipos/Svelte: zero erros e zero avisos. Lint dos arquivos alterados e build de produção aprovados.
- Cobertura das jornadas afetadas: 105 cenários em desktop, 390 e 320 px. O lote amplo teve 103 aprovações e duas falhas identificadas: espera de navegação num teste antigo e botão principal ligeiramente abaixo da primeira dobra em 320 px. Após corrigir a espera e o espaçamento, os 15 cenários diretamente envolvidos foram repetidos e todos passaram, cobrindo também os nove novos cenários do fluxo.
- Capturas reais de Lista, sessões pausadas, execução, seleção, confirmação e conclusão nas três larguras; somente dados sintéticos.
- Suítes completas e CI obrigatória ficam para a integração, após avaliação desta prévia.

## Prévia

- Demonstração: http://127.0.0.1:5297/__demo
- Galeria e comparações: http://127.0.0.1:5298/
- O exemplo contém uma sessão aberta, uma missão concluída, uma missão com progresso parcial, uma pendente e outra disponível para adicionar.
- A demonstração inicializa somente uma origem vazia nessa porta. Não sobrescreve um banco existente. O aplicativo instalado e os dados pessoais não foram abertos ou modificados.

O ambiente de desenvolvimento e os artefatos volumosos ficam em D:\Codex-artifacts\lmup-active-sessions-20261102 devido à falta de espaço no C. O acesso pela pasta sessoes-ativas-20261102 do workspace foi preservado. A frente de Acampamento em outra branch não foi alterada.

Conferência final: seis cenários de última conclusão rápida/detalhada repetidos nas três larguras e aprovados; o estado de gravação é liberado quando a sessão termina. Build da prévia: 1c4be774c02c5104. Demonstração e todas as capturas da galeria foram abertas e conferidas.
