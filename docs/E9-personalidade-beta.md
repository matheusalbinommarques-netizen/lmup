# E9 — personalidade provisória e preparação da Beta

O autor confirmou em 29/10/2026 que esta rodada pode seguir com a direção provisória. A história definitiva continua aberta à personalidade do autor. Esta entrega aplica voz e nomes de interface sem inventar uma mitologia definitiva.

## Direção aplicada

Level Me Up: “Da ideia ao feito.” A fantasia acompanha a realização de algo fora do aplicativo. Missões organizam ações; passos ajudam a executar; o ambiente e os companheiros registram consequências do caminho. Não há cobrança por ausência nem promessa de produtividade clínica ou eficácia de estudo.

A voz é direta, próxima e concreta. Na criação, ajuda a começar. Na pausa, informa o que está guardado. Na conclusão, reconhece a ação e permite sair. Textos de falha dizem o que aconteceu e como recuperar, sem dramatização narrativa. Nomes funcionais permanecem visíveis: Hoje, Missões, Projetos, Configurações e backup. Refúgio permanece um nome provisório da exploração aprovada, não um novo cânone.

## Antes e depois

| Contexto       | Antes                                     | Agora                                                         |
| -------------- | ----------------------------------------- | ------------------------------------------------------------- |
| Identidade     | “A sua próxima conquista.”                | “Da ideia ao feito.”                                          |
| Primeiro uso   | Formulário em branco como único caminho   | Criação livre e exemplos opcionais, editáveis antes de salvar |
| Retomada       | Mesmo texto de qualquer missão disponível | Informa que a pessoa já começou e pode continuar              |
| Sem pendências | Cabeçalho ainda promete próximo passo     | Explica que não há missão disponível e permite encerrar       |
| Revisão futura | Estado genérico de conclusão              | Explica que a revisão ainda não está disponível               |
| Arquivadas     | Confundidas com estar em dia              | Informa ausência de missões ativas                            |

Os exemplos são três propostas de ação: estudar uma ideia, destravar um projeto e preparar o espaço. O clique preenche título e passos somente na memória do formulário, com os detalhes do exemplo abertos para revisão. A pessoa revisa, altera ou cancela; o banco só muda ao salvar. Criação livre abre vazia após cancelar um exemplo. Edição de missão existente mantém precedência sobre qualquer rascunho inicial. Não há tela de onboarding bloqueante nem missão de demonstração misturada aos dados pessoais.

A decisão de oferecer exemplos em um estado vazio é uma hipótese de design informada pelas [diretrizes de estados vazios da NN/g](https://www.nngroup.com/articles/empty-state-interface-design/). Os testes técnicos verificam o comportamento, não comprovam que a mudança aumenta engajamento.

## Onde a personalidade pode mudar

- src/lib/content/experience.ts: identidade, destinos compartilhados, voz de Hoje/Refúgio/conclusão e exemplos de missão.
- src/lib/content/world.ts: nomes e tipos dos companheiros, estágios e caminhos das ilustrações. O laboratório reutiliza a voz da experiência real.
- Catálogos da loja/conquistas e telas legadas ainda têm textos próprios; não se afirma que todo texto do aplicativo foi centralizado. Descrições de efeito precisam continuar correspondendo às regras.

Rotas, chaves de companheiros, IDs de itens/estágios e schema não mudam para trocar nomes. Nomes personalizados e registros existentes no banco são preservados. Custos, XP, bônus e duração de revisão continuam nos serviços. A migração visual de artes não foi ampliada nesta rodada: as imagens atuais seguem a proposta anterior e suas variantes otimizadas.

## Evidências e gate da Beta

Lint, tipos/Svelte e build passaram: zero erros e três avisos preexistentes. Passaram 126 testes de serviços, os 106 cenários existentes da jornada, seis cenários novos e 20 cenários PWA. Os novos cenários passaram na execução focalizada após ajustar um seletor ambíguo entre dois links equivalentes; o log da execução ampla anterior permanece nas evidências. São 16 capturas dos novos percursos.

A entrega inclui verificação técnica de cancelar um exemplo sem criar tarefa, criação livre posterior, edição do rascunho, pausa/retomada com notas, conclusão/estorno e estados de revisão futura/arquivamento. Telas de 320px e texto de 200% incluem foco no formulário e retorno ao disparador por Escape. Testes usam contextos descartáveis e dados fictícios.

O roteiro de sessões está no pacote externo entregas/E9/ROTEIRO-DE-AVALIACAO.md. Nenhuma sessão com participantes foi realizada por esta implementação. E9-02 permanece aberta; E9-03/04/05 dependem dos achados e ajustes posteriores. Não declarar V1 concluída ou engajamento comprovado antes desses gates.
