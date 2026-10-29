# E7 — Histórico, progresso e configurações

Entrega local de 29/10/2026, sobre E6. Linha de desenvolvimento: codex/e7-progresso-configuracoes. A rota /progresso reúne estatísticas e movimentos; /config reúne conforto, backup, recuperação e reinício. Hoje e o menu Perfil e mais dão acesso ao progresso. Não houve publicação ou envio ao GitHub.

## Contagem e recursos

O relatório lê os eventos de progresso, os recibos de posse de equipamentos e os recibos de cuidado dos companheiros. Não recalcula recompensas com os equipamentos atuais nem trata passos, revisões repetidas ou bônus de projeto como novas missões. Missões distintas são os IDs de missões com conclusão ou revisão válida no período. Sessões de revisão e bônus de projeto têm contagens próprias. Uma conclusão estornada deixa de participar dessas contagens válidas; seu lançamento positivo e o lançamento negativo do estorno continuam no movimento de recursos.

XP líquido é a soma dos valores efetivos dos recibos, com ajustes e estornos nas datas em que ocorreram. Um estorno de uma concessão anterior ao período pode produzir um dia negativo. Compras descontam Gold, cuidados descontam Comida, sem acrescentar XP. Os períodos disponíveis são 7 dias, 30 dias e todo o histórico. O gráfico completo mostra até 30 dias mais recentes com registros, com aviso de que os totais incluem todo o período. No período completo, registros com data futura também permanecem visíveis; o filtro de dias encerra no dia atual.

Áreas vêm do log vinculado ao evento, preservando a atribuição registrada mesmo se a missão mudar de área. Área removida continua identificável; área zero e recibos sem área são agrupados em Geral e bônus. Nomes de missões e projetos são os nomes atuais, indicados como tal. O detalhe mostra os valores e multiplicadores armazenados. Os valores visíveis do gráfico também estão em texto; o sinal numérico diferencia ganhos e perdas independentemente da cor.

A composição de saldo separa o movimento detalhado disponível e a diferença anterior ou sem registro. Essa diferença é calculada contra o saldo atual. Ela não é um saldo inicial comprovado nem uma reconstrução auditada das transações antigas. Logs sem evento vinculado não viram novas concessões, e conclusões legadas sem recibo não viram sessões inventadas. Compras sem preço registrado têm indicação de custo desconhecido. Investimento antigo de comida sem recibo individual permanece na diferença sem detalhamento.

O relatório é somente leitura: não corrige saldos ou grava eventos. Compras vêm de ownedShopItems, cuidados de careHistory e XP de activityEvents. xpLogs é usado para a área do recibo e a identificação de registros legados, sem duplicar XP já representado por eventos.

## Conforto global

A leitura das preferências foi movida da tela de Configurações para a inicialização do layout. A chave existente lmup:neuro-prefs continua compatível. Modo foco reduz a arte decorativa; texto maior amplia a base de leitura; estímulos suaves reduzem brilho e desativam animações; reduzir movimento desativa animações e rolagem suave. A preferência de movimento do sistema também vale. Ícones de ação e conteúdo funcional não são apagados por seletores genéricos de aria-hidden.

Escolhas são aplicadas no acesso direto, na recarga e na navegação entre telas; alterações em outra aba são sincronizadas. Apenas valores booleanos verdadeiros são aceitos, com defaults seguros para armazenamento inválido. Se o navegador impedir guardar a preferência, ela continua valendo no acesso atual e a interface informa a limitação. As preferências pertencem ao navegador e não são substituídas por importar ou reiniciar a jornada.

## Backup, recuperação e reinício

Configurações usa os mesmos diálogos e controles da jornada real. A importação prepara e valida um arquivo de até 25 MB, mostra a jornada, contagens e recursos, e só substitui dados após confirmação. O arquivo preparado é mantido como um objeto sem proxy reativo para passar novamente pela validação e clonagem. Cancelar não grava recuperação nem altera o banco. Erros aparecem junto ao fluxo, preservando os dados atuais.

A exportação registra a última solicitação de arquivo neste navegador, com aviso de que isso não comprova que o arquivo foi salvo. A interface explica ausência de conta e sincronização, o vínculo com navegador/endereço e a diferença entre arquivo externo e recuperação local. A lista de recuperações informa motivo, data e quantidade de missões; a mais recente pode ser exportada. Permanecem até cinco cópias recentes, além da cópia de migração quando houver.

O reinício pede a palavra REINICIAR e descreve seu escopo. Missões, projetos, eventos, itens e evolução são reiniciados; nome e avatar são preservados. Preferências continuam no navegador. Uma recuperação local é guardada antes da operação. Importação e reinício continuam atômicos, com validação e reversão em caso de falha; não exigem recarregar a página para as consultas refletirem os novos dados. Gravações pendentes são protegidas contra saída pela navegação.

## Ajuste encontrado na integração

A Alpha 2 identificou um caso em que desfazer a primeira revisão após uma conclusão normal restaurava a data da conclusão como última revisão. Isso bloqueava indevidamente uma nova prática no mesmo dia. O estorno agora conserva a ausência de revisão anterior e a base correta de agendamento, mantendo a conclusão normal e sua recompensa. Uma regressão de serviço e o fluxo completo no navegador cobrem conclusão, primeira revisão, estorno e nova disponibilidade.

## Validação e limites

Lint e tipos aprovados; 119 testes de serviços e 106 cenários de produção em desktop e viewport móvel. Após ajustes visuais, 16 cenários da Alpha 2 foram repetidos. A cobertura inclui estatísticas líquidas, área registrada, legado, compras/cuidado, revisão/estorno, acesso direto às preferências, sincronização entre abas, falha de armazenamento de preferências, importação cancelada/inválida/válida, reinício e recuperação. Texto com fonte base em 200% é exercitado em 320×568. Testes e capturas usam contextos descartáveis e não acessam o perfil pessoal.

A referência de leitura ampliada é o [entendimento do critério 1.4.4 do W3C](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html). O controle de animação considera o [critério 2.3.3 do W3C](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html). Esses documentos orientam a implementação e os cenários; não constituem certificação de conformidade desta aplicação.

Permanecem três avisos legados de captura inicial de propriedades em EditProfileModal e ShopItemCard. Não houve teste com participantes, leitor de tela, aparelhos físicos ou medição de engajamento. O banco continua na versão 5 e o backup no formato 3. Nenhuma conta, nuvem ou sincronização foi acrescentada. A etapa E8 verificará leveza, cache, instalação e atualização offline; o produto ainda não é apresentado como validado nesses aspectos.
