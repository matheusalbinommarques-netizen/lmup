# Level Me Up — backlog de execução

Atualizado em 29/10/2026. Fonte de direção: [roadmap completo](ROADMAP-Level-Me-Up.md).

**Status:** E0 a E8 concluídas no escopo disponível; E9-01 e E9-T01–T06 concluídas. Beta com escopo congelado na revisão 8996fa87a5d6f4f4 (código 7329191). E9-02 permanece adiada a pedido do usuário; E9-03/04/05 seguem planejadas com seus critérios abertos.

**Próxima tarefa:** E9-02 quando as sessões com participantes forem retomadas. O usuário pediu para deixá-las para depois; E9-03/04/05 seguem suas dependências e não estão concluídas.

**Estados:** Planejada → Em andamento → Em verificação → Concluída. Se faltar uma condição externa, registrar o impedimento e seu impacto; não confundir dependência prevista com bloqueio inesperado. Ao concluir, acrescentar referência da alteração, evidência e pendências materiais.

**Política de atualização:** alterar este backlog a cada entrega. Se escopo ou dependência mudar, registrar a decisão no roadmap; não manter status desatualizado após implementação.

## E1 — Base reproduzível

| ID    | Tarefa                                               | Depende de   | Critério de aceite                                                                                            | Status    |
| ----- | ---------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------- | --------- |
| E1-01 | Preparar linha de desenvolvimento e ponto de retorno | E0           | Checkout isolado utilizável, origem confirmada, estado inicial registrado e procedimento de retorno definido. | Concluída |
| E1-02 | Reproduzir e registrar baseline                      | E1-01        | Instalação, lint, check, testes e build executados; falhas classificadas sem ocultar resultados.              | Concluída |
| E1-03 | Corrigir build e navegação de produção               | E1-02        | Build conclui; abrir e recarregar rota de projeto funciona no servidor de arquivos de teste.                  | Concluída |
| E1-04 | Corrigir contratos de tipos e coleta dos testes      | E1-02        | Check passa; aliases, ambiente e testes existentes correspondem aos contratos atuais.                         | Concluída |
| E1-05 | Triar e atualizar dependências por risco             | E1-03, E1-04 | Atualizações compatíveis verificadas; avisos residuais têm exposição e decisão documentadas.                  | Concluída |
| E1-06 | Consolidar verificações e documentação               | E1-05        | Checkout limpo reproduz os checks; artefatos gerados e instruções de execução/publicação estão tratados.      | Concluída |

## E2 — Dados e mecânicas confiáveis

| ID    | Tarefa                                                 | Depende de   | Critério de aceite                                                                                               | Status    |
| ----- | ------------------------------------------------------ | ------------ | ---------------------------------------------------------------------------------------------------------------- | --------- |
| E2-01 | Definir contratos de progresso e políticas de reversão | E1-06        | Eventos, saldos, legado, recursos gastos e reabertura de projeto têm regras explícitas.                          | Concluída |
| E2-02 | Implementar inicialização e migração do banco          | E2-01        | Perfil e catálogos inicializam independentemente da rota; fixture v4 migra preservando relações.                 | Concluída |
| E2-03 | Centralizar cálculo e registro de recompensa           | E2-02        | Prévia e concessão usam a mesma regra; evento guarda valores efetivos, bônus e origem.                           | Concluída |
| E2-04 | Tornar conclusão e efeitos atômicos e idempotentes     | E2-03        | Duplo envio, duas abas e falha de escrita não duplicam recurso nem deixam tarefa parcialmente concluída.         | Concluída |
| E2-05 | Implementar estorno e reconciliação                    | E2-04        | Estorno referencia o evento, não recalcula pelo equipamento atual; casos de saldo gasto e legado são explícitos. | Concluída |
| E2-06 | Validar backup e restauração                           | E2-02        | JSON inválido não altera dados; versão, IDs e relações são validados; retorno por backup é verificável.          | Concluída |
| E2-07 | Corrigir escopo de reinicialização                     | E2-06        | Reinício preserva apenas o comunicado e não deixa projetos, logs ou equipamentos incompatíveis.                  | Concluída |
| E2-08 | Fechar regressões das operações de progresso           | E2-05, E2-07 | Execução, estorno, bônus, falha e migração passam nos cenários definidos; evidências registradas.                | Concluída |

## E3 — Sistema visual e piloto de arte

| ID    | Tarefa                                          | Depende de   | Critério de aceite                                                                                  | Status    |
| ----- | ----------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------- | --------- |
| E3-01 | Definir tokens e padrões de interação           | E1-06        | Tipografia, cores, espaços, toque, foco, superfícies e estados têm referência única.                | Concluída |
| E3-02 | Construir componentes essenciais acessíveis     | E3-01        | Botão, campo, lista, cartão e diálogo funcionam por toque e teclado, incluindo erro e carregamento. | Concluída |
| E3-03 | Prototipar jornada em alturas e larguras móveis | E3-02        | Hoje, execução e conclusão têm ações alcançáveis com texto ampliado e altura reduzida.              | Concluída |
| E3-04 | Separar conteúdo narrativo das mecânicas        | E3-01        | Chaves estáveis referenciam textos e artes sem incorporar nomes de lore às regras de saldo.         | Concluída |
| E3-05 | Produzir e avaliar piloto de artes no contexto  | E3-03, E3-04 | Um companheiro, estágios do ambiente e objetos são coerentes e legíveis dentro das telas.           | Concluída |
| E3-06 | Definir exportação e orçamento das artes        | E3-05        | Formato, dimensão, versões e peso por uso estão documentados; assets essenciais têm fallback.       | Concluída |

## E4 — Jornada diária

| ID    | Tarefa                                                     | Depende de   | Critério de aceite                                                                                                             | Status    |
| ----- | ---------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------ | --------- |
| E4-01 | Implementar estrutura de navegação e equivalência de rotas | E2-08, E3-06 | Hoje, Missões, Projetos e Refúgio funcionam em ambos os layouts; funções antigas continuam acessíveis.                         | Concluída |
| E4-02 | Implementar primeiro acesso e criação rápida               | E4-01        | Criar perfil e missão real é curto; opções avançadas são secundárias; nenhum dado demonstrativo é confundido com dado pessoal. | Concluída |
| E4-03 | Construir Hoje e seleção explicável da próxima missão      | E4-02        | Em andamento, fixada e sugerida são distinguíveis; plano diário é escolhido pelo usuário.                                      | Concluída |
| E4-04 | Implementar execução por passos e notas                    | E4-02        | Passos legados são adaptados; progresso e notas persistem; conteúdo funcional cabe no celular.                                 | Concluída |
| E4-05 | Implementar pausa, retomada e estados de falha             | E4-04        | Recarregar ou voltar não perde trabalho; erro preserva conteúdo e permite repetir com segurança.                               | Concluída |
| E4-06 | Conectar conclusão, estorno e feedback                     | E4-03, E4-05 | Percurso de ponta a ponta usa serviços centrais, distingue conclusão comum de marco e permite encerrar.                        | Concluída |
| E4-07 | Validar Alpha 1                                            | E4-06        | Primeiro acesso e usuário existente completam o fluxo no desktop/celular; toque, teclado e rotas não bloqueiam ações.          | Concluída |

## E5 — Projetos, revisões e progressão

| ID    | Tarefa                                            | Depende de   | Critério de aceite                                                                                                 | Status    |
| ----- | ------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------ | --------- |
| E5-01 | Redesenhar projetos com objetivo, etapas e edição | E4-07        | Criar/editar projeto e associar missões é acessível; próxima etapa fica clara.                                     | Concluída |
| E5-02 | Corrigir datas e ciclo de vida de projetos        | E5-01        | Data de calendário é estável em fusos testados; concluir/reabrir mantém tarefas e bônus coerentes.                 | Concluída |
| E5-03 | Separar sessões de revisão da tarefa única        | E4-07        | Intervalo, disponibilidade e histórico de sessões são claros; recompensa não fabrica tarefas distintas.            | Concluída |
| E5-04 | Revisar dificuldade e curva de recompensa         | E5-02, E5-03 | Regras não dependem apenas da contagem artificial de passos; equipamento e prévia correspondem ao cálculo efetivo. | Concluída |
| E5-05 | Alinhar limites de nível e conquistas             | E5-04        | Todas as metas atuais são atingíveis; futuras são identificadas; regressões de bônus/revisão passam.               | Concluída |

## E6 — Refúgio e coleção

| ID    | Tarefa                                               | Depende de          | Critério de aceite                                                                                                 | Status    |
| ----- | ---------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------ | --------- |
| E6-01 | Construir Refúgio com alternativa funcional em lista | E4-07               | Natureza, companhia e coleção têm navegação unificada; ações não dependem da ilustração.                           | Concluída |
| E6-02 | Unificar evolução, cuidado e bônus dos companheiros  | E6-01               | Uma regra governa prévia e gravação; alimento e evolução são atômicos; inicialização não depende de visita à tela. | Concluída |
| E6-03 | Conectar marcos a mudanças de ambiente               | E6-01, E3-06        | Descobertas têm evento identificável, conteúdo substituível e estado persistente.                                  | Concluída |
| E6-04 | Redesenhar compra, inventário e equipamento          | E6-02               | Prévia, preço, saldo, slots e efeitos são claros; transações e reversões são consistentes.                         | Concluída |
| E6-05 | Reorganizar conquistas e expandir artes necessárias  | E6-03, E6-04, E5-05 | Conquistas recentes e próximas são úteis; catálogo e artes cobrem os estados distribuídos.                         | Concluída |
| E6-06 | Validar integrações da coleção                       | E6-05               | Comprar/equipar/alimentar/recarregar/restaurar não duplica itens, perde posse ou diverge dos bônus.                | Concluída |

## E7 — Histórico, progresso e configurações

| ID    | Tarefa                                                  | Depende de   | Critério de aceite                                                                                      | Status    |
| ----- | ------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------- | --------- |
| E7-01 | Reconstruir histórico e estatísticas pelos eventos      | E5-05, E6-06 | Tarefa, sessão, bônus e estorno são contados corretamente; saldos e gráficos reconciliam.               | Concluída |
| E7-02 | Aplicar conforto e acessibilidade globalmente           | E4-07        | Preferências funcionam em acesso direto e recarga; movimento reduzido e texto ampliado são respeitados. | Concluída |
| E7-03 | Reorganizar configurações, backup e informação de dados | E7-02, E2-07 | Armazenamento local, backup recente, importação e reset têm informação e feedback coerentes.            | Concluída |
| E7-04 | Validar Alpha 2 integrada                               | E7-01, E7-03 | Fluxos diários e secundários, dados vazios, antigos e restaurados passam na revisão integrada.          | Concluída |

## E8 — Produção, leveza e offline

| ID    | Tarefa                                       | Depende de | Critério de aceite                                                                                          | Status    |
| ----- | -------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------- | --------- |
| E8-01 | Otimizar assets e carregamento por tela      | E7-04      | Peso de produção é medido; imagens usam dimensão adequada e conteúdo secundário não bloqueia tarefa.        | Concluída |
| E8-02 | Configurar cache e navegação offline         | E8-01      | Fluxos essenciais abrem offline após carregamento inicial; URLs internas e fallback são testados.           | Concluída |
| E8-03 | Implementar atualização coordenada com dados | E8-02      | Atualização não interrompe gravação nem torna progresso irrecuperável; compatibilidade de schema é tratada. | Concluída |
| E8-04 | Validar instalação e falhas de armazenamento | E8-03      | PWA instalada funciona; indisponibilidade de rede/espaço/banco tem tratamento verificável.                  | Concluída |
| E8-05 | Conferir aparelhos e pacote candidato        | E8-04      | Testes em aparelhos disponíveis, relatório de limitações e build candidato reproduzível estão registrados.  | Concluída |

## E9 — Beta e primeira versão completa

| ID    | Tarefa                                               | Depende de | Critério de aceite                                                                                                               | Status    |
| ----- | ---------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------- | --------- |
| E9-01 | Revisar personalidade com o autor e aplicar catálogo | E8-05      | Lore e conteúdo da versão refletem a direção escolhida; mudanças não alteram IDs nem saldos.                                     | Concluída |
| E9-02 | Executar sessões com público e tratar obstáculos     | E9-01      | Percursos e dúvidas observadas geram prioridades; limitações da amostra permanecem claras.                                       | Planejada |
| E9-03 | Executar regressão final de dados e experiência      | E9-02      | Dados novos/antigos/restaurados, atualização e fluxos principais passam; nenhum bloqueio crítico conhecido.                      | Planejada |
| E9-04 | Preparar entrega, notas e recuperação                | E9-03      | Versão, checks, limitações, backup, recuperação e instruções de uso estão documentados.                                          | Planejada |
| E9-05 | Encerrar V1 e reavaliar horizontes                   | E9-04      | Roadmap registra o entregue e o remanescente; distribuição pública é preparada quando destino e solicitação estiverem definidos. | Planejada |

## Registro de entregas

| Data       | Etapa | Entregue                                                                                                             | Evidências                                                                                              | Próximo |
| ---------- | ----- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------- |
| 28/10/2026 | E0    | Comparação atual/destino, etapas, dependências, riscos e backlog                                                     | ROADMAP-Level-Me-Up.md e este documento                                                                 | E1-01   |
| 28/10/2026 | E1    | Build, tipos, testes, dependências e verificação limpa                                                               | Commit 6e678dd; entregas/E1/RESULTADO.md                                                                | E2-01   |
| 28/10/2026 | E2    | Inicialização, eventos, conclusão/estorno atômicos e recuperação validada                                            | Commits 59b8a48 e b462232; entregas/E2/RESULTADO.md; E2-verificacao.log; E2-navegador.log               | E3-01   |
| 28/10/2026 | E3    | Tokens, componentes, jornada piloto, catálogo narrativo e artes                                                      | Commits b0d905f e 8295d08; entregas/E3/RESULTADO.md; 51 testes de serviço e 38 cenários de navegador    | E4-01   |
| 29/10/2026 | E4    | Navegação real, Hoje, criação, passos, notas, pausa, conclusão e recuperação                                         | Commit 14743d9; entregas/E4/RESULTADO.md; 60 testes de serviços e 58 cenários de navegador              | E5-01   |
| 29/10/2026 | E5    | Projetos com etapas, revisões por sessão, datas de calendário, esforço e metas atingíveis                            | Commits 990952d e 2745533; entregas/E5/RESULTADO.md; 85 testes de serviços e 74 cenários de navegador   | E6-01   |
| 29/10/2026 | E6    | Refúgio integrado, cuidado com prévia, compra e equipamento transacionais, marcos e conquistas de coleção            | Commit f7fa331; entregas/E6/RESULTADO.md; 103 testes de serviços e 88 cenários de navegador             | E7-01   |
| 29/10/2026 | E7    | Progresso por registros, histórico líquido, conforto global, backup e recuperação com confirmação; Alpha 2 integrada | Commits 347a990 e 4e0bedf; entregas/E7/RESULTADO.md; 120 testes de serviços e 106 cenários de navegador | E8-01   |

E8 — entrega técnica de 29/10/2026: 126 testes de serviços, 106 cenários da jornada e 20 PWA; 20 capturas dos cenários finais e oito telas finais, medições antes/depois e candidato 799cfd949dd3461a com hashes conferidos em entregas/E8. Loja: 27,25 → 0,56 MB; conquistas: 46,73 → 0,68 MB com todas as imagens carregadas. Instalação pelo navegador no PC confirmada pelo usuário em 29/10/2026, após a entrega técnica. Celular não foi certificado; a confirmação não acrescenta testes manuais de suspensão, pressão de armazenamento ou execução pelo atalho. Ver entregas/E8/RESULTADO.md e docs/E8-offline-producao.md no projeto.

E9-01 — 29/10/2026: voz provisória compartilhada, exemplos editáveis sem criação automática, estados de Hoje e revisão futura corrigidos. Commit 5dbe646; entregas/E9/RESULTADO.md; 126 testes de serviços, 106 cenários anteriores, seis novos, 20 PWA e uma atualização real E8 → E9. Roteiro de sessões pronto, sem sessões realizadas; E9-02 adiada pelo usuário.

## Antecipações técnicas da E9 com avaliação adiada

| ID     | Entrega independente                                                                              | Depende de | Evidência                                                                                                                                       | Status    |
| ------ | ------------------------------------------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| E9-T01 | Preservar rascunho do perfil, recusar conflito e melhorar diálogos                                | E9-01      | Commit 86156ab; 132 testes de serviços, 118 da jornada e 20 PWA                                                                                 | Concluída |
| E9-T02 | Preparar candidato com guia, integridade e execução independente                                  | E9-T01     | ZIP 3aba550d13d46e92, cinco verificações de integridade e teste sem servidor; entregas/E9-tecnica/RESULTADO.md                                  | Concluída |
| E9-T03 | Integrar Perfil e equipamentos à jornada e unificar apresentação da companhia                     | E9-T01     | Commit fb52fe3; 138 testes de serviços, 128 cenários distintos da jornada, 20 PWA, cinco de integridade e candidato extraído online/offline     | Concluída |
| E9-T04 | Explorar paisagens e distinguir recompensas dos marcos no Refúgio; proteger importação incoerente | E9-T03     | Commit f87102c; 147 testes de serviços, 138 cenários distintos da jornada, 20 PWA, cinco de integridade e candidato extraído online/offline     | Concluída |
| E9-T05 | Explorar evoluções e conferir custo, saldo e conflitos no cuidado dos companheiros                | E9-T04     | Commit f8315af; 150 testes de serviços, 150 cenários distintos da jornada, 20 PWA e cinco de integridade; candidato extraído online/offline     | Concluída |
| E9-T06 | Uniformizar artes das evoluções, fechar acabamento e congelar funcionalidades da Beta             | E9-T05     | Commit 7329191; 12 artes/36 variantes, 150 testes de serviços, 152 cenários distintos de navegador, 20 PWA e candidato extraído íntegro/offline | Concluída |

E9-T03 — 29/10/2026: perfil integrado sem catálogos paralelos, rascunho mantido em erro de consulta e carga padrão medida de 9,43 para 0,44 MB de recursos. Candidato d740b5604a0e6cfd, relatório em entregas/E9-perfil/RESULTADO.md.

E9-T04 — 29/10/2026: quatro prévias visuais sem alteração de saldo, miniaturas compactas, recibos ativos/estornados e legado explícitos. Importação recusa perda de marcação de prêmio já registrado. Candidato d16964a99117ead7, relatório em entregas/E9-refugio/RESULTADO.md. A regressão ampla passou em 138 cenários; os 24 cenários de coleção e marcos foram repetidos após o acabamento visual, sem somar repetições.

E9-T05 — 29/10/2026: galeria dos três estágios de cada companhia, progresso até o próximo estágio, confirmação com saldo restante e bloqueio de prévia desatualizada por outra aba. Consulta restrita a perfil e companheiros. Candidato a7650ad8a5d1e554, relatório em entregas/E9-companheiros/RESULTADO.md. Os 26 cenários de coleção/companheiros foram repetidos após o acabamento visual, sem somar repetições.

E9-T06 — 29/10/2026: quatro famílias de companheiros com três estágios, 11 gerações novas e um piloto preservado, variantes leves e 12 miniaturas preparadas offline. A verificação de galeria exige imagens reais e não aceita lista vazia. Escopo congelado conforme recomendação aceita pelo autor; lista F01–F04 encerrada no relatório entregas/E9-fechamento-visual/RESULTADO.md. Candidato 8996fa87a5d6f4f4. Nenhuma nova funcionalidade opcional deve ser iniciada enquanto se aguarda avaliação, salvo reabertura explícita pelo autor.

Essas entregas antecipam preparação técnica; não encerram os critérios de E9-03/04/05, que ainda dependem da avaliação e ajustes de E9-02. O usuário confirmou a atualização da rodada E9-01 e pediu continuidade, mantendo as sessões adiadas.

## Fora do compromisso de implementação da V1

H2 (conta, sincronização, distribuição ampliada) e H3 (colaboração/Clã real) dependem de necessidade validada e projeto próprio, conforme os gates do roadmap. Não estão somados às tarefas desta versão.

Nota da publicação: referências a entregas/ indicam evidências locais preservadas no workspace. Ver [estado da Beta](../BETA-ATUAL.md).
