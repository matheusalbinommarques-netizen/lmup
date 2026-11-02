# Ajustes de pendências e controles — 02/11/2026

A prévia adicional em `fix/today-banner-sidebar` agora inclui:

- Pendentes deixa de exibir a ocorrência recorrente já concluída hoje. O cadastro permanece em Todas e o registro em Concluídas; a próxima ocorrência volta a aparecer no dia correspondente. Quando há mais de uma ocorrência atual, uma ainda incompleta mantém a missão como pendente.
- Os filtros De/Até do histórico usam campos escuros, com borda, altura de controle, foco visível e calendário nativo, preservando a filtragem existente.
- Na Agenda, atividades concluídas mostram um visto dourado no lugar do checkbox de seleção. A seleção de atividades ainda pendentes para sessões continua independente da conclusão.
- Atividades de outros dias ficam expandidas em Hoje, com Trazer para hoje e Escolher data visíveis. A ação para hoje é direta quando não há progresso; progresso parcial exige confirmação. Continua disponível retomar a execução original.
- O serviço de planejamento aceita hoje como destino de uma ocorrência de outro dia. Preserva identidade, origem, progresso, recibos e saldos; não concede recompensas ao reagendar. O caminho legado sem execução preserva o cadastro sem inventar histórico. A operação continua auditada e protegida contra repetição e revisões desatualizadas.
- Ocorrências de sessões iniciadas continuam protegidas contra reagendamento, inclusive para hoje. A mensagem explica a restrição e a execução original permanece acessível. Não há migração nem alteração global da economia, recorrência ou composição de sessões.
- Próxima missão reúne as ações diárias e Manter em destaque em um único menu. A escolha por teclado no seletor preserva o comportamento nativo.
- Os menus contextuais usam a mesma fonte de interface em todas as ações, incluindo Completar missão, sem a fonte de título e sua sombra. Os demais títulos e botões principais preservam o estilo RPG.

## Validação executada

- `consolidatedProductivity.test.ts`: 20 testes aprovados. Incluem reagendamento com progresso, identidade e origem preservadas, repetição idempotente, proteção de sessão, ausência de novas recompensas e persistência do reagendamento após backup/restauração.
- Tipos/Svelte: zero erros e zero avisos. Lint dos arquivos alterados aprovado. Build de produção aprovado.
- Playwright direcionado: 45 cenários aprovados em desktop, 390 e 320 px, nos arquivos daily-followup, consolidated-productivity, home-rpg, home-world e visual-compatibility. Incluem retorno da recorrência no dia seguinte, permanência no contexto, filtro histórico, indicadores da Agenda, fonte calculada dos menus, prioridade manual, reagendamento e recarga, além das jornadas anteriores de Hoje.
- Capturas com dados sintéticos nas três larguras e inspeção visual de menu, Agenda e pendências mobile. Instalação pessoal e banco do usuário não foram acessados.

## Limites da entrega

O reagendamento é uma ação explícita: não há transferência automática em massa de ocorrências antigas nem novas recompensas por trocar a data. Ocorrências congeladas por sessões iniciadas mantêm a data e a composição original. Esta prévia permanece fora da main para avaliação; a integração anterior pelo PR #51 permanece preservada.

Prévia: http://127.0.0.1:5295/__demo
Galeria: http://127.0.0.1:5294/#ajustes-diarios
