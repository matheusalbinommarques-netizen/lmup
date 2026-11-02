# Exclusão e arquivamento de missões

Branch independente `feat/mission-removal`, baseada na main `bbcaf277`. A integração fica aguardando a avaliação conjunta solicitada pelo usuário.

## Operação

A ação Excluir missão, na lista e no detalhe, abre uma prévia de vínculos. Sem histórico relevante ou vínculos, permite excluir definitivamente cadastro, ocorrências sem uso e planejamento automático. Com execuções, recibos, notas, histórico ou vínculos, oferece arquivamento. Cancelar não grava nada. Tirar de hoje e remover da sessão continuam ações distintas.

A operação revalida a prévia dentro da transação. Mudanças em outra aba exigem revisar a confirmação. Identificadores de operação evitam duplicação; falha na gravação final reverte a transação.

Arquivamento mantém a tarefa, notas, projeto, ocorrências, execuções, recibos e saldos. Retira a atividade das sequências atuais de rotinas e das partes pendentes de sessões salvas; preserva as entidades, os demais participantes e um registro da alteração. Rotina que fica vazia é pausada. Não conclui projetos nem concede ou estorna prêmios. Novos planos ficam suspensos. A lista Arquivadas e o detalhe permitem consultar os registros, sem execução normal.

Nenhuma tabela, índice, versão de schema ou formato de backup novo. Não há alteração na economia. O organizador legado usa o mesmo serviço. Rascunhos de notas de outra aba permanecem disponíveis para copiar se a missão for arquivada enquanto ela está aberta.

## Validação

- Oito testes novos de consistência, duplicação, concorrência, preservação econômica, projeto, rotina/sessão, backup/restauração e rollback.
- 41 testes existentes de produtividade/backup aprovados.
- Dez E2E únicos desktop/mobile aprovados: criação, confirmação/cancelamento, arquivamento, consulta e regressões de organização. Dois seletores de reabertura do menu foram corrigidos; apenas esses cenários foram repetidos.
- Dois PWA desktop/mobile de exclusão offline e recarga aprovados.
- Tipos sem erros/avisos, lint direcionado e build aprovados. Celular emulado, sem teste físico.

Prévia isolada na porta 5189. Capturas externas ao repositório, com dados sintéticos. Sem push, PR, merge ou publicação desta frente. Mundo e ícones por área não entram neste diff.
