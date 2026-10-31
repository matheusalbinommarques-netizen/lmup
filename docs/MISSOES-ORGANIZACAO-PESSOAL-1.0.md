# Missões e Organização Pessoal 1.0

## Uso cotidiano

Em **Missões**, use **Nova missão**, escreva o nome e crie. Área, esforço, planejamento e recorrência ficam no mesmo cadastro. Descrição, passos, projeto e destaque são opcionais, em “Passos e outros detalhes”. As ações de salvar ficam fora da rolagem dos campos.

- **Hoje** mostra atividades planejadas e rotinas previstas para o dia.
- **Próximas** mostra datas futuras e a próxima ocorrência de cada rotina, sem gerar cópias ou acumular dias perdidos.
- **Todas** inclui também ideias sem data e missões antigas. Use a busca e o filtro de área; projeto, agrupamento por área e fixadas ficam em “Mais filtros”.
- **Concluídas** mostra os recibos de cada realização, incluindo ocorrências de dias diferentes e estornos identificados. Abrir um recibo não concede recursos novamente.

Use Hoje, Amanhã ou Outra data para planejar. “Sem data” mantém uma missão pontual em Todas. A Home conserva sua composição e destaca o que realmente está previsto para o dia; atividades futuras e ideias sem data não se tornam sugestões de hoje automaticamente.

## Áreas

“Gerenciar áreas” está disponível na lista e dentro do cadastro/edição. É possível criar, renomear e excluir áreas. A exclusão exige confirmação e permite escolher Geral ou outra área para receber as missões. Geral é a área padrão permanente.

As transferências são atômicas. Missões, logs de XP e recibos permanecem no banco. Uma edição aberta antes de uma transferência é recusada para evitar que um rascunho antigo restaure a área excluída.

## Recorrência e integridade

Foram entregues **Diariamente**, **Dias específicos da semana** e **Semanalmente**, com um dia escolhido. A data planejada define a partir de quando vale a repetição; os dias selecionados determinam quando ela aparece. Tirar uma rotina de hoje pula somente esse dia, sem penalidade nem recompensa. Planejar para hoje permite uma realização explícita nesse dia.

Cada rotina mantém uma única missão. Suas realizações são eventos separados no histórico existente, com data da ocorrência, recursos efetivamente recebidos, nome e área no momento da conclusão. A verificação por missão/data e a concessão acontecem na mesma transação do IndexedDB. IDs de eventos incluem a data e a revisão de estorno. Assim, duas abas, recargas e edições não concedem outra recompensa para a mesma realização.

Os passos recomeçam a cada dia previsto; as notas continuam associadas à missão. Uma submissão que atravessa a meia-noite é recusada para reabrir a ocorrência correta. Não há tarefas atrasadas criadas automaticamente nem geração de XP por dias não realizados.

Desfazer uma ocorrência antiga preserva as demais. Desfazer a ocorrência atual permite realizá-la novamente, após devolver exatamente seus recursos. As proteções existentes contra saldos insuficientes continuam valendo. O bônus de projeto não é concedido novamente a cada dia da rotina.

Recorrência e revisão espaçada são configurações independentes. Uma missão não mantém as duas ativas ao mesmo tempo: é necessário desativar explicitamente uma para configurar a outra. O histórico é mantido. Trocar uma revisão por rotina no mesmo dia não permite obter uma segunda recompensa; estornar a realização correspondente permite refazê-la corretamente.

## Auditoria e integração

| Base encontrada                                                      | Entrega                                                                                       |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `Missions.svelte`: disponíveis, hoje e concluídas; busca simples     | Agenda com quatro vistas, filtros, agrupamento, ações compactas e histórico por evento        |
| `QuickCreate.svelte`: criação por nome, esforço e detalhes opcionais | Áreas diretamente no cadastro, datas livres, recorrência e edição dos mesmos campos           |
| `AreaManager.svelte`: criação e exclusão na área antiga              | Serviço atômico compartilhado e gerenciamento completo na experiência principal               |
| `taskDefinitionService.ts`: definição com revisão para concorrência  | Validação de planejamento e recorrência, preservação de recibos e proteção de edições antigas |
| `journeyService.ts`: execução, plano de hoje e fixação               | Disponibilidade por calendário, sessão de passos por ocorrência e planejamento explícito      |
| `taskService.ts`: concessão e estorno em transação                   | Idempotência por ocorrência e estorno do recibo selecionado                                   |
| `reviewService.ts`: sessões de estudo independentes                  | Regras de estudo mantidas; combinação acidental com rotina recusada                           |
| `rewardService.ts`, progressão e Refúgio                             | Reutilizados; XP, ouro, comida, multiplicadores e marcos econômicos mantidos                  |
| Recompensa Viva                                                      | Conclusão direta da lista ou execução abre o recibo real; celebração consumida uma vez        |

Os campos de rotina e os metadados de recibos são opcionais nos registros existentes. Não foi necessário criar novas tabelas, apagar dados ou converter missões antigas. Backups preservam as configurações e ocorrências; a validação recusa dias inválidos, configurações incompatíveis e ocorrências com recompensas duplicadas. Recibos anteriores sem nome/área históricos continuam usando os dados disponíveis, sem inventar informações antigas.

As datas usam chaves do calendário local. A agenda se atualiza ao voltar à janela e periodicamente, inclusive offline. Não depende de servidor, cron ou sincronização externa.

## Capturas reais

Capturas do aplicativo em execução com dados de teste descartáveis, criados pela interface. As datas foram controladas para testar dias sucessivos; as recompensas foram calculadas pelos serviços reais. Nenhum dado pessoal foi substituído.

| Tela                     | Desktop                                                         | Celular                                                        |
| ------------------------ | --------------------------------------------------------------- | -------------------------------------------------------------- |
| Hoje                     | [Abrir](missoes-organizador-capturas/desktop-hoje.png)          | [Abrir](missoes-organizador-capturas/mobile-hoje.png)          |
| Cadastro rápido          | [Abrir](missoes-organizador-capturas/desktop-cadastro.png)      | [Abrir](missoes-organizador-capturas/mobile-cadastro.png)      |
| Recorrência e edição     | [Abrir](missoes-organizador-capturas/desktop-recorrencia.png)   | [Abrir](missoes-organizador-capturas/mobile-recorrencia.png)   |
| Gerenciamento de áreas   | [Abrir](missoes-organizador-capturas/desktop-areas.png)         | [Abrir](missoes-organizador-capturas/mobile-areas.png)         |
| Próximas atividades      | [Abrir](missoes-organizador-capturas/desktop-proximas.png)      | [Abrir](missoes-organizador-capturas/mobile-proximas.png)      |
| Execução                 | [Abrir](missoes-organizador-capturas/desktop-execucao.png)      | [Abrir](missoes-organizador-capturas/mobile-execucao.png)      |
| Recompensa Viva          | [Abrir](missoes-organizador-capturas/desktop-recompensa.png)    | [Abrir](missoes-organizador-capturas/mobile-recompensa.png)    |
| Histórico por ocorrência | [Abrir](missoes-organizador-capturas/desktop-historico.png)     | [Abrir](missoes-organizador-capturas/mobile-historico.png)     |
| Home no dia seguinte     | [Abrir](missoes-organizador-capturas/desktop-home-novo-dia.png) | [Abrir](missoes-organizador-capturas/mobile-home-novo-dia.png) |

As referências orientaram hierarquia, navegação, molduras e cores. A interface usa componentes funcionais; não há fundos com telas prontas. Os filtros extras ficam recolhidos para deixar a primeira missão acessível no celular. As capturas incluem desktop e viewport móvel; não representam certificação em aparelhos físicos.

## Escopo posterior

Recorrência mensal, calendário completo, operações em massa, relatórios por área e modelos de rotinas permanecem em P1. Não são necessários para usar os fluxos diários entregues.

## Verificação da entrega — 31/10/2026

- Lint aprovado; Svelte/TypeScript sem erros nem avisos; build de produção gerado.
- **167 testes de serviço aprovados**, incluindo dez testes novos de integridade do organizador.
- **30 testes de interface aprovados na rodada final**, em desktop e celular, cobrindo o organizador, projetos, revisões e Recompensa Viva. A suíte geral de 184 cenários também foi exercitada; os testes finais incluem a espera pela confirmação de gravação antes de navegar ou recarregar.
- **26 testes da PWA aprovados**. Após o último ajuste de recorrência, os quatro cenários de organizador e recompensa offline foram repetidos e aprovados no build entregue.
- As 18 capturas foram renovadas pela rodada final de interface.
- `git diff --check` sem erros de espaços em branco.

Os testes verificam criação, renomeação e exclusão de áreas, transferência de missões, planejamento futuro e sem data, rotina diária, dias específicos, repetição semanal, concorrência entre abas, dia seguinte, estorno de ocorrência antiga, edição de rotina, exportação/restauração, calendário na troca de ano e independência das revisões. A interface também é verificada em 320px com texto ampliado.
