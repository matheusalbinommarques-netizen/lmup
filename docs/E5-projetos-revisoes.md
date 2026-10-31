# E5 — Projetos, revisões e progressão

Entrega de 29/10/2026, sobre a jornada real da E4. Implementação local na linha codex/e5-projetos-revisoes. Nenhum envio ao GitHub ou publicação faz parte desta entrega.

## O que mudou

Projetos passam a ter objetivo, data de calendário, etapas ordenadas, edição, busca e arquivo. O detalhe reúne o resultado desejado, progresso por etapas, próxima missão pendente e associação de missões existentes. Etapas vazias mantêm o projeto aberto. Arquivar preserva as relações e o histórico; restaurar um projeto premiado não concede outro prêmio. Edições concorrentes de projeto e missão recusam sobrescrever uma versão mais recente e mantêm o formulário para comparação.

Criar e editar missões, inclusive pelo organizador anterior, usa o mesmo serviço. Há quatro esforços explícitos: leve (50 XP base), moderado (100), exigente (150) e intenso (250). Passos ajudam na execução; sua quantidade não define mais o esforço nem altera a recompensa. Missões antigas mantêm XP e raridade enquanto a pessoa não escolher outro esforço. Editar passos limpa somente as marcações desses passos, com aviso no formulário. Notas e recibos já emitidos permanecem.

A rota /revisoes reúne as práticas. A missão permanece única, com sessões separadas, intervalo escolhido entre 1 e 365 dias, próxima data e histórico com recibos efetivos. A tela de execução convida a lembrar antes de consultar as notas e permite registrar uma avaliação opcional. Essa avaliação não muda automaticamente o intervalo. Há no máximo uma sessão recompensada por missão em cada dia local; atraso não gera multa. Cada sessão reinicia seus passos. Desfazer estorna a última sessão e restaura a situação anterior; desativar revisões conserva o histórico.

## Regras e compatibilidade

- Bônus base de projeto: 10% da soma de XP base das missões participantes. A quantidade de tarefas não aumenta esse percentual. Para missões concluídas, usa-se a base registrada no primeiro evento válido, evitando que editar esforço depois da conclusão infle o bônus. Um projeto requer missões ativas e todas as suas etapas preenchidas e concluídas.
- O capacete de projeto acrescenta 15 pontos percentuais: 10% → 25%. Espadas concedem 5%, 10% ou 15% de XP em missões e revisões, sem alterar raridade por contagem de passos. A evolução III da Aberração concede 20% de XP e 15% de Gold/Comida. Descrições e prévias correspondem ao cálculo central.
- Reabrir um projeto estorna apenas o bônus dele, preservando recompensas das missões, vínculos e notas. Se os recursos necessários já tiverem sido gastos, a operação inteira é recusada. O mesmo cuidado se aplica ao estorno de sessões. Novas missões em projeto premiado passam por essa reabertura segura.
- Projeto pausado ou arquivado não recebe bônus automático. Completar uma revisão posterior de uma missão já concluída não fabrica outra tarefa ou outro bônus de projeto. Desfazer essa revisão conserva a conclusão anterior e o bônus que continua justificado.
- Recibos anteriores não são recalculados com os novos equipamentos. Conclusões legadas sem evento não recebem sessões inventadas nem estorno estimado. Bônus de projeto legado sem evento é preservado quando não há informação para reversão segura.
- Data desejada é um dia de calendário, sem conversão de fuso. Valores antigos no formato ISO conservam o dia escrito originalmente. As telas foram verificadas em São Paulo, Los Angeles e Tóquio.
- O limite atual continua em nível 30. Há uma conquista para esse limite. As metas de nível 50 e 100 passam a ser identificadas como futuras.

O banco permanece na versão 5; os campos são opcionais para compatibilidade com os registros existentes. A validação de backup cobre etapas, esforço, datas, sessões e relações de eventos. Os novos dados passam pela exportação e restauração validadas. Não há sincronização em nuvem.

## Referência de produto

O convite para tentar recuperar o conteúdo antes de consultar notas é informado pelo experimento de [Karpicke e Blunt, Science (2011)](https://pubmed.ncbi.nlm.nih.gov/21252317/), que encontrou ganhos de aprendizagem com prática de recuperação nas condições estudadas. Isso não demonstra engajamento deste aplicativo. Intervalos de 1–365 dias, valores de XP e bônus são decisões de produto desta implementação, não valores cientificamente ótimos. O aplicativo não aplica um algoritmo adaptativo de repetição espaçada.

## Verificação

Lint, tipos, testes de serviços e build fazem parte de npm run verify. A suíte de produção verifica desktop e viewport móvel, dados legados, estorno, concorrência, restauração, intervalos, etapas vazias, esforço e datas em três fusos. Os novos diálogos também são exercitados em 320×568 com texto ampliado a 200%. Evidências externas ao repositório estão na pasta entregas/E5 do workspace.

Os testes usam bancos e contextos descartáveis, sem ler ou modificar o perfil pessoal. Restam três avisos existentes de captura inicial de propriedades em EditProfileModal e ShopItemCard. Capturas de tela e testes de navegador não substituem validação com participantes, leitor de tela e aparelhos físicos. Estatísticas serão revistas em E7; offline/atualização da PWA em E8. A próxima etapa é E6: Refúgio e coleção.
