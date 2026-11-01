# Missões, rotinas e produtividade

## Contrato aprovado em 01/11/2026

- Uma rotina ativa controla o calendário de uma missão, preservando seu projeto e o planejamento anterior para desvinculação.
- Ocorrências mantêm identidade pela origem; reagendar duas ocorrências para o mesmo dia não une suas execuções ou recompensas.
- Horário é início desejado; prazo final é independente. Compromissos acompanham o horário local. Registros preservam instante, data/hora local, fuso e deslocamento.
- O método escolhido controla progresso e conclusão. Missões legadas mantêm sua exigência de passos até configuração explícita.
- Ocorrências iniciadas preservam configuração e modificadores. Alterações econômicas na ocorrência exigem correção explícita com prévia e auditoria.
- Modificadores ficam fixos no primeiro progresso positivo. Recompensas são diferenças de direitos cumulativos arredondados, sem ganho por fracionamento.
- Excedente temporal concede XP linear, até 50% do XP-base; modificadores incidem depois. Não aumenta ouro ou comida. Estimativa e meta recompensável são independentes.
- Correções geram débitos independentes de XP, ouro e comida. Ganhos futuros compensam débitos; saldos disponíveis, nível e recursos já investidos permanecem preservados.
- Prêmios e benefícios alcançados do Refúgio permanecem. O prêmio de estágio é contabilizado separadamente, sem reconcessão.
- Primeira ocorrência concluída satisfaz o vínculo ao projeto. Correções invalidantes reabrem o projeto e compensam seu bônus sem duplicação.
- Revisões espaçadas mantêm suas regras; recordação parcial não é execução parcial.
- Execuções retroativas são permitidas; execuções futuras são recusadas. Recuperar depois melhora cumprimento, sem alterar pontualidade.
- Rotinas exigem todas as atividades previstas para cumprimento integral e também mostram percentual parcial. Pausas justificadas não contam como execução.
- Conquistas visuais têm recibos persistentes, sem prêmios econômicos novos, e permitem invalidação auditada de reconhecimento indevido.
- Histórico confiável começa na migração; reconstruções manuais são explícitas e não podem duplicar conclusões legadas conhecidas.
- Várias sessões podem ser salvas; somente uma fica em foco. Progresso e orçamento pertencem à ocorrência.

## Persistência e segurança

Migração aditiva Dexie 5 → 6: preserva tabelas, IDs, recibos e vínculos; salva recuperação `migration-v5` e registra o começo do planejamento confiável. Ocorrências futuras são derivadas de versões do planejamento; apenas ocorrências consultadas para execução ou sessão são persistidas. Não há materialização infinita.

Backup formato 4 inclui ocorrências, versões, rotinas, registros de execução, auditoria, sessões e recibos de conquistas. Formatos anteriores continuam aceitos. Importação valida vínculos, direitos de recompensa, origens de débitos e saldo de débitos antes de substituir dados, em transação com recuperação.

Não é seguro voltar apenas os arquivos do aplicativo para uma versão que conheça somente IndexedDB v5 depois de abrir v6. Recuperação deve usar código compatível com v6; nenhum downgrade ou limpeza automática do banco pessoal é permitido.

## Padrões provisórios

Importância: baixa, normal e alta; ausência equivale a normal. Etapas têm pesos iguais. Pausas: duas por período fixo de 30 dias, configuráveis por rotina e contadas por dia de origem; os períodos começam na data inicial da rotina. Sugestão inicial de horários: 08h–22h, sem aplicar mudanças. Ausência de duração reserva 30 minutos somente no cálculo da sugestão, nunca como tempo executado. Baixo cumprimento por área exige ao menos três ocorrências previstas e menos de 50% concluídas.

Tempo manual em métodos não temporais é somado por registro. Em correções explícitas, informa-se o total corrigido; o histórico conserva a diferença, inclusive negativa, sem fabricar outra execução.

## Integração e publicação do esquema 6

A CI obrigatória permanece em Node 22 e 24, incluindo desktop, mobile, PWA, persistência entre abas, pacote e auditoria. Nenhuma proteção da `main` foi alterada. Instalações pessoais não participam das prévias ou dos testes.

O controlador desta entrega aceita somente os esquemas conhecidos 5 e 6. Controladores antigos que aceitam somente 5 recusam a publicação de 6 de forma segura. O controlador instalado é uma cópia: não se atualiza apenas por integrar o PR.

Antes de publicar 6 em uma instalação existente, atualizar o controlador a partir de uma cópia limpa da `main`, seguindo `scripts/install-local-sync.ps1 -Branch main`. Primeiro conferir a tarefa, aguardar qualquer ciclo em andamento, preservar configuração e controlador anteriores e conferir os bloqueios de publicação. Não substituir arquivos durante um ciclo ativo. A instalação só deve ser reativada depois dessas verificações. Não usar a migração de branch como atalho para atualizar o esquema.

Após a publicação, a atualização do aplicativo mantém o fluxo existente de confirmação entre abas e proteção de rascunhos. Não forçar recarga nem abrir o banco pessoal em testes. Depois de migrar para 6, voltar a um pacote 5 não é um rollback compatível; usar uma correção compatível com 6 e preservar os backups.

## Execução e medições

Base: `main` em `fb019d72e797a4a23c2e0dc2eab0ed0a8063d974`. Checkout isolado em `missoes-produtividade`, branch `feat/missions-productivity`; trabalho local do acampamento preservado.

Branch criada em 01/11/2026 às 13h34min24s, conforme reflog. Primeira prévia funcional verificada às 13h51min02s: **16min38s desde a criação da branch**, excluindo a investigação e a preparação anteriores. Fluxo: criação avançada → agenda → progresso parcial → recarga → conclusão → correção com débito. Navegador descartável, dados sintéticos, zero erros de página.

Prévia de desenvolvimento em `http://127.0.0.1:5193`, separada da instalação pessoal. A prévia não representa publicação, CI aprovada ou pacote concluído. Validação consolidada e integração permanecem pendentes durante a implementação.
