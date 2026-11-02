# LMUP — prévia consolidada de produtividade e navegação

Entrega em `feat/missions-ux-round1`, baseada na integração `8c6f55a` de Mundo. Todo o pacote permanece local, sem PR, push, merge ou publicação na instalação pessoal.

Prévia funcional: <http://127.0.0.1:5295/missoes?demo=1>. Galeria, comparações e relatório: <http://127.0.0.1:5294>. A demonstração contém somente exemplos sintéticos. O preparador cria o banco apenas quando ele ainda não existe nessa origem; preserva os dados de avaliações anteriores.

## Funcionalidades concluídas nesta rodada

- **Hoje:** planejamento atual separado das atividades antigas; conclusões pela data efetiva da execução; progresso restrito às ocorrências do plano atual; recebimentos líquidos do dia; ações contextuais para retirar, devolver e reagendar. Missões sem data continuam disponíveis sem aumentar o denominador do planejamento.
- **Retirar de hoje:** persiste após recarga, entre abas e em backups, sem arquivar, descartar progresso, apagar notas ou alterar recursos. Ocorrências com progresso ou pertencentes a sessões exigem confirmação. A sessão iniciada continua íntegra e pode ser retomada explicitamente.
- **Reagendar:** escolha explícita da data; preserva identidade, origem, progresso e recibos da ocorrência. Cadastros antigos ainda sem execução podem receber uma nova data sem fabricar progresso histórico.
- **Rotinas e sessões:** identificação da data original ao retomar; grupos de execuções atuais e anteriores; acesso à execução preservada pela rotina; sincronização com conclusões individuais; identificação de conclusões externas quando a origem foi registrada; reutilização atômica da mesma sequência, inclusive entre abas. Sobreposição parcial com outra sessão é informada, sem omitir atividades selecionadas ou alterar a composição existente.
- **Resumo econômico:** atividades concluídas, parciais e pendentes; líquido recebido e direito restante em destaque; meta, bruto, compensações e débitos de correções nos detalhes; aviso de XP adicional por tempo; marcos e registros de bônus de projetos identificados separadamente. O restante usa o direito acumulado da ocorrência, sem subtrair simplesmente o líquido recebido. Encerrar sessões não concede bônus.
- **Montagem de sessões:** somente ocorrências elegíveis; motivos visíveis para indisponibilidade, incluindo datas futuras, retiradas, pausa, conclusão e revisões. Nenhuma data é alterada para tornar a seleção possível.
- **Navegação:** sidebar sem Aventura e Mapa; acessos reunidos em Mundo, que mantém seus links internos e rotas antigas. Mobile com Hoje, Missões, Mundo e Mais; Herói, Projetos, Aposentos, Acampamento, Companheiros e os demais destinos continuam acessíveis. Concluir, editar, arquivar e excluir mantêm o contexto da página.

## Melhorias anteriormente aprovadas preservadas

Lista com filtros, busca, histórico e ferramentas; formulário unificado com rascunhos e “Salvar e criar outra”; acompanhamento simplificado; passos adicionáveis e ordenáveis; execução rápida e detalhada; Microação de 10 XP e 5 ouro base, sem mudança nos demais tiers; recompensas calculadas pela dificuldade, sem edição manual; recorrência centralizada e área padrão de rotinas; edição de missões dentro da rotina; configurações congeladas de execuções iniciadas; gestão de Áreas com descrição, ícones herdados, contagens, vínculos, transferência em lote e exclusão mediante destino; arquivamento e exclusão definitiva de missões pessoais como operações independentes.

A exclusão real continua preservando somente os recibos necessários, desvinculados do conteúdo pessoal, e o registro durável de exclusão. Missões narrativas de Mundo e Védria permanecem fora desse serviço. A exclusão não modifica saldos nem concede ou estorna recompensas.

## Validação e resultados

| Verificação                       | Resultado                                                                                                                                                    |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Lint completo e TypeScript/Svelte | Aprovados; zero erros e avisos de tipos                                                                                                                      |
| Serviços e integração             | 391 testes distintos aprovados: 390 na rodada completa e um cenário adicional de exclusão/backup, confirmado junto aos 18 testes direcionados do novo pacote |
| Build estático e PWA              | Aprovado; versão de cache `abdbd140afa216a9`                                                                                                                 |
| E2E completo, desktop e 390 px    | Cobertura final de 326 aprovados e 2 pulos condicionais de cenários exclusivos de desktop                                                                    |
| Jornadas adicionais em 320 px     | 18 aprovadas, incluindo Hoje, rotinas, formulário, áreas, sessões e navegação                                                                                |
| PWA/offline, desktop e mobile     | 46 cenários aprovados após reexecuções direcionadas                                                                                                          |
| Publicação local e sincronização  | Testes da verificação completa aprovados, sem executar publicação ou sincronização real                                                                      |
| Auditoria de dependências         | Nenhuma vulnerabilidade moderada, alta ou crítica; 5 de gravidade baixa registradas, sem alterar dependências                                                |

A primeira rodada E2E teve 281 aprovações, 45 falhas e 2 pulos. As falhas foram corrigidas com ajustes de compatibilidade de registros antigos, expectativas da interface anterior, preparação de bancos descartáveis e uso da porta configurada no teste de fusos. Os 112 cenários dos arquivos afetados tiveram 108 aprovações; os dois arquivos restantes passaram integralmente em mais 10 verificações. A cobertura final foi consolidada por cenário, sem repetir os 328 testes completos. Nos testes offline, 42 passaram inicialmente e os quatro cenários que ainda procuravam os controles antigos de Áreas passaram após a atualização de seus seletores. Não houve redução das verificações econômicas nem desativação de proteções.

Foram verificados backups antigos e atuais, restauração, persistência entre abas, prevenção de conclusão duplicada, recibos, compensação de débitos, progresso parcial, recorrências, exclusão pessoal, Mundo, Védria, Aposentos e Acampamento. A exclusão de uma missão concluída dentro de sessão também foi restaurada de backup sem conteúdo pessoal residual e sem alterar os saldos.

## Demonstração para avaliação

1. Em **Hoje**, comparar o plano atual com “Concluídas hoje” e expandir “Atividades de outros dias”. Retomar a atividade antiga não a inclui automaticamente no percentual do plano atual.
2. No menu de uma ocorrência, usar **Remover de hoje**; confirmar quando houver sessão/progresso. Reabrir a tela ou outra aba e conferir a retirada; usar **Devolver a hoje** para desfazê-la. Em ocorrências livres, **Reagendar** permite escolher outra data.
3. Em **Rotinas**, consultar a área e a recorrência centralizadas, criar missões com herança, alterar individualmente sua área e editar missões vinculadas. Salvar e reabrir preserva os valores. As execuções iniciadas mantêm suas configurações.
4. Em **Sessões salvas**, retomar a sequência, alternar execução rápida/detalhada, consultar líquido e detalhes econômicos, pausar e retomar. Concluir individualmente uma ocorrência da sequência atualiza seu progresso sem nova recompensa ao retornar.
5. Usar **Selecionar para sessão** para conferir os motivos de indisponibilidade. Em dias diferentes, as execuções anteriores aparecem separadas das atuais.
6. No mobile, usar **Mais** para os destinos secundários. Em **Mundo**, acessar mapa e campanha pelos controles existentes; as rotas antigas continuam disponíveis.

As capturas e comparações estão na galeria, em desktop, 390 px e 320 px. São demonstrações sintéticas, sem usar o banco da instalação pessoal.

## Limitações e pendências reais

- Registros antigos sem indicação da origem da execução não recebem retroativamente o rótulo “concluída fora da sessão”. O estado e os recibos continuam preservados.
- O reagendamento não altera uma ocorrência congelada por sessão iniciada. A interface explica a restrição; a execução existente pode ser retomada, ou uma próxima ocorrência organizada pela Agenda.
- Atividades antigas sem planejamento histórico confiável seguem o mecanismo existente de reconstrução explícita; não há reconstrução automática de histórico.
- Um backup antigo isolado, restaurado numa instalação totalmente nova sem qualquer registro posterior de exclusão, não pode conhecer uma exclusão ocorrida depois de sua exportação. Na mesma instalação, e em backups que carregam esse registro, as exclusões permanecem duráveis e são aplicadas à restauração.
- A auditoria encontrou cinco avisos de baixa gravidade. Atualizações de dependências e revisão global do balanceamento permanecem fora deste pacote.
- As suítes locais não substituem uma eventual CI da integração. Não foi aberto PR, executado merge ou alterada a publicação pessoal. A integração continua dependente da avaliação e aprovação explícita do usuário.

Arquivos centrais: `Home.svelte`, `todayView.ts`, `dailyPlanningService.ts`, `SessionSelection.svelte`, `SessionSummary.svelte`, `sessionSummary.ts`, `savedSessionService.ts`, `ProductivityWorkspace.svelte`, `SavedSessions.svelte`, `AppShell.svelte` e os testes direcionados. Os campos opcionais de retirada do dia e origem da execução usam a persistência e o backup existentes, sem uma economia paralela ou migração estrutural.
