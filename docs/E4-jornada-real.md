# E4 — Jornada diária com dados reais

Entrega de 29/10/2026. O sistema visual de E3 passa a operar sobre o banco pessoal existente. O laboratório continua separado, com dados de exemplo em memória.

## Rotas e acesso às funções

| Destino                                                                 | Comportamento                                                                 |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `/`                                                                     | Hoje: missão em andamento, destaque, sugestão explicada e plano escolhido     |
| `/missoes`                                                              | Busca, disponíveis/hoje/concluídas, fixação, planejamento e criação rápida    |
| `/missao/:id`                                                           | Passos, notas, pausa, retomada, conclusão e desfazimento                      |
| `/projetos` e `/projetos/:id`                                           | Projetos e detalhes atuais, preservados para o redesenho de E5                |
| `/refugio`                                                              | Ambiente pelo XP real e acesso à natureza, companheiros, coleção e conquistas |
| `/perfil`                                                               | Perfil, seleção de companheiro e equipamentos da antiga tela inicial          |
| `/arquivo/missoes`                                                      | Organizador anterior: áreas, edição, revisões, ordem e análises               |
| Rotas de loja, inventário, troféus, bestiário, Santuário e configuração | Mantidas e acessíveis por Perfil e mais, também no celular                    |
| `/cla`                                                                  | Preservada com aviso explícito de conteúdo demonstrativo                      |

Não há redirecionamento que descarte IDs de projetos ou filtros de projeto em `/missoes?projectId=...`. A antiga tela inicial continua em Perfil; os recursos do organizador anterior ficam disponíveis enquanto são migrados por fluxo.

## Escolha do próximo passo

1. Missão disponível em andamento ou pausada, pela atividade recente.
2. Missão fixada pela pessoa. Só uma pode ficar fixada.
3. Missão explicitamente incluída no plano do dia.
4. Sugestão de uma missão disponível mais antiga, com explicação e opção de escolher outra.

Fixar não inclui automaticamente no plano. O plano tem data local e não gera penalidade ao passar o dia. A criação oferece a opção visível de incluir a nova missão em hoje. Revisões respeitam a disponibilidade existente; o redesenho de sessões e intervalos pertence a E5.

## Persistência e compatibilidade

Não há troca do nome, origem ou versão estrutural do banco. Os novos campos são opcionais nos registros de tarefa: plano, destaque, estado de execução, notas, revisão das notas e chave de criação. Dados existentes são lidos sem reescrever saldos, históricos ou tarefas em lote.

Passos legados continuam sendo strings. Linhas vazias são ignoradas na execução sem deslocar os índices originais. As marcações persistem em `completedSubtasks`. O serviço de conclusão exige todos os passos válidos; o botão sozinho não é a barreira.

O editor anterior preserva o estado atual de conclusão ao salvar alterações em outra aba. Alterar a lista de passos reinicia as marcações, com aviso explícito; notas e recompensas recebidas são preservadas.

Notas são salvas por uma fila de gravações. Cada gravação compara a revisão esperada: um texto antigo não sobrescreve uma alteração de outra aba silenciosamente. Falha mantém o rascunho na tela e permite usar o texto local e tentar de novo, ou sair explicitamente sem salvar. Navegação e recarga são protegidas enquanto houver gravação pendente ou rascunho não salvo.

Os campos novos entram no backup, são validados e sobrevivem à restauração. Criação duplicada com a mesma chave não produz duas tarefas. Passos concorrentes são atualizados dentro de transação, preservando outras marcações.

## Conclusão

O percurso usa `completeTask` e `undoTask` de E2. A tela mostra valores registrados, incluindo bônus de projeto separado da missão. Desfazer estorna os eventos associados e mantém passos e notas. Saldos gastos e conclusões legadas continuam recebendo a política explícita de E2.

Salvar passos, pausar ou escrever notas não concede XP. O progresso é local ao navegador; não há conta, sincronização ou colaboração ativa.

## Limites desta Alpha

Projetos, revisões, Refúgio completo, análises, configuração e coleção ainda têm evolução prevista em E5–E7. A navegação já oferece acesso às funções atuais. Offline e atualização da PWA pertencem a E8. Não houve teste com participantes nem certificação em aparelhos físicos ou leitores de tela.

## Verificação local

Lint e tipos aprovados, 60 testes de serviços aprovados e build estático gerado. A suíte de navegador passou em 58 cenários no Chrome, em desktop e viewport móvel. Os 24 cenários de Alpha e design foram repetidos após a revisão de contraste e formulário. Permanecem cinco avisos já existentes sobre captura inicial de propriedades.

A Alpha verifica criação, pausa, recarga, retomada, notas, falha de escrita com rascunho preservado, duas abas, plano, fixação, acesso às funções anteriores, texto ampliado, tarefa inexistente, backup legado e bônus de projeto com estorno conjunto. Testes usam contextos descartáveis e dados sintéticos.
