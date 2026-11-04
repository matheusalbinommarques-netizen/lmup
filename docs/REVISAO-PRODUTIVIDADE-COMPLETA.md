# Revisão de Produtividade e Hoje

Branch: `feat/productivity-revision-20261103`. Base: Lote 1 (`5a4316f`).
Prévia isolada: http://127.0.0.1:5196. Instalação pessoal na porta 5174 preservada.
Os lotes 2–4 foram reunidos a pedido do usuário, mantendo o Lote 1 já entregue.
Integração à main depende de aprovação explícita.

## Comportamento entregue

- Uma pendência operacional por missão recorrente. A próxima data do calendário
  passa a valer às 00h locais, com ou sem horário. Até essa data, a execução
  anterior permanece válida. A substituição preserva parciais confirmadas e
  recibos, impede novas recompensas antigas e libera reservas da sessão sem
  prejudicar outras missões. Inicialização, meia-noite, retorno à aba e ações
  de gravação verificam a vigência.
- Pontuais permanecem pendentes e conservam progresso. Reiniciar usa a correção
  econômica existente: prévia de compensação, confirmação e histórico preservado.
- Pendentes inclui missões reservadas, com acesso à sessão correspondente e
  bloqueio de execução duplicada. Concluídas mostra somente conclusões de hoje;
  Todas reúne pendentes e concluídas hoje. Histórico separado oferece período,
  conclusões, parciais, pulos e execuções substituídas.
- Hoje recebe automaticamente pendências válidas. Foram removidos o bloco de
  outros dias, recuperação manual e indicações cotidianas de atraso. O círculo
  conta missões distintas, somente conclusões integrais e exclui pulos. Missões
  flexíveis entram quando iniciadas ou incluídas no dia/sessão. Os recursos
  continuam somando ganhos líquidos do dia, inclusive projetos e correções.
- Pulo reversível de missão de rotina enquanto seu ciclo estiver vigente;
  sem prêmio e sem apagar ganhos parciais anteriores. Dias individuais opcionais
  persistem na rotina e nos backups; a ausência de personalização herda os dias
  padrão.
- Mesclagem de rotinas com prévia e reconhecimento dos conflitos. As missões da
  origem preservam seus dias efetivos por configuração individual. As do destino
  conservam a herança existente, horários, identidades e histórico.
- Mesclagem de áreas transfere referências atuais, herda o ícone do destino e
  arquiva metadados da origem. Recibos históricos não são reescritos. Origem
  arquivada fica fora das listas comuns. Geral é uma área implícita: não participa
  da mesclagem entre áreas cadastradas.
- Revisões espaçadas foram desativadas na experiência ativa, incluindo seus
  controles e navegação. O endereço antigo direciona ao Histórico; registros
  históricos e compatibilidade de restauração permanecem. Sessões normais
  continuam disponíveis.
- Retirado o atalho redundante Gerenciar áreas de Ferramentas. A aba Áreas e o
  gerenciamento aninhado ao cadastro continuam funcionais.

## Integridade e implementação

`operationalPlanning` define vigência por calendário; `productivityLifecycle`
normaliza referências antigas. `missionActions` reutiliza a economia de
`occurrenceService`; `mergeService` aplica prévias com detecção de alterações
concorrentes e transações. Componentes compartilhados apresentam ações e
mesclagens. `todayView` e `journeyQuery` mantêm a leitura reativa separada das
operações de escrita.

Esquema do banco continua 6 e backup continua 4. Campos novos são opcionais e
validados. Nenhuma remoção de histórico ou recálculo retroativo de recompensas.
Testes usam bancos sintéticos e contextos descartáveis, sem abrir o banco pessoal.

## Problemas encontrados e corrigidos

- A reconciliação de escrita dentro da consulta reativa do Dexie provocava
  “Não foi possível carregar sua jornada”. Foi retirada dessa consulta e movida
  para o ciclo de inicialização/atualização. Há teste explícito de regressão.
- Arrays reativos de dias personalizados não podiam ser gravados no IndexedDB;
  o serviço agora copia os valores para estruturas persistíveis.
- O menu de ações tentava focar um botão de diálogo fechado. A navegação por
  teclado considera somente controles visíveis.
- A confirmação de reinício aberta pelo menu ficava dentro de um popover
  fechado. O diálogo usa uma montagem independente para permanecer visível.
- Pular a última missão em foco ajusta o cursor para outra missão válida.
- `check` e build são executados sequencialmente, pois ambos geram `.svelte-kit`.

## Verificação

- Vitest: **422 testes aprovados em 39 arquivos**. Inclui regressão do
  carregamento reativo, substituição às 00h, aba antiga sem reconciliação prévia,
  preservação econômica, reinício, pulo, ajustes de fila, mesclagens concorrentes,
  reversão transacional e restauração de backups.
- Navegador Chrome, desktop e celular: **168 cenários distintos aprovados** nas
  seleções executadas, contando cada cenário/projeto uma vez após suas correções
  e reexecuções. A seleção ampla inicial teve 138 cenários; as verificações
  adicionais tiveram 48, dos quais 18 já faziam parte da primeira seleção.
  As falhas iniciais foram investigadas e reexecutadas. Não foi executada a
  suíte inteira de interface.
- PWA: **46 cenários aprovados**: 44 passaram na primeira rodada e os dois de
  áreas passaram após adequar o teste à aba Áreas. Inclui primeira navegação
  offline, recarga, persistência, backup, bloqueios de atualização em múltiplas
  abas e preservação dos outros módulos.
- Publicação local: **24 testes aprovados**, sem publicar na instalação pessoal.
- Svelte/TypeScript: **zero erros e avisos**. ESLint e build de produção/PWA
  aprovados. Capturas com dados sintéticos em `revision-captures/`, incluindo
  Hoje, Histórico, dias individuais, mesclagens e reinício.

CI remota e publicação na instalação pessoal não foram executadas. A prévia tem
armazenamento separado da instalação pessoal. Para conferir dados reais na
instalação, a integração/publicação ainda depende da aprovação do usuário.

Para reiniciar a prévia neste checkout:

```powershell
$env:LMU_PREVIEW_PORT='5196'
node scripts/serve-static.mjs
```
