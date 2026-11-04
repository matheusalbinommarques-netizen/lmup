# Produtividade e Hoje — Lote 1

Branch: `feat/productivity-lote1-20261103`.
Base: `0e5eead` (main local, PR #53).
Prévia: http://127.0.0.1:5196, separada da instalação pessoal na porta 5174.

## Entrega

- M01: botão secundário reconhecível “Encerrar sessão”, com foco, hover,
  desabilitado e processamento pelo componente Button existente. Encerramento
  direto reutiliza o serviço transacional, preservando progresso e recompensas.
  Bloqueios existentes de edição não salva continuam respeitados. Substitui o
  diálogo sem risco de perda por EndSessionButton, compartilhado entre execução
  e lista de sessões. Falhas ficam visíveis e permitem tentar novamente.
- M05: horários da rotina e do editor de planejamento usam texto HH:mm, com
  limite de cinco caracteres e validação de 00:00 a 23:59. Campo vazio continua
  significando sem horário. Teclado não aciona seletor nativo. Os serviços e a
  sincronização entre missão e rotina permanecem os mesmos.
- M09: Nome e Descrição usam a mesma largura nos formulários de criação e
  edição. Descrição tem 72px de altura, rolagem interna e limite existente de
  4.000 caracteres; não pode expandir o formulário por redimensionamento.
- M11: Geral usa o seletor existente. Sua preferência opcional fica em
  `profile.generalAreaIconKey`, com transação, auditoria e proteção contra
  sobrescrita concorrente. O resolvedor compartilhado aplica o ícone às missões
  sem área, sem criar outra área Geral nem copiar ícones para missões.
- H01: removidos os dois textos antigos; frase aprovada aplicada literalmente.
  Saudação, nome, personagem, data e arte existentes preservados.
- H02: botão dourado “Começar missão”, sem ícone de reprodução; ação preservada.
- H03: título, círculo centralizado, contagem embaixo e XP/Ouro/Comida em três
  colunas, cada recurso com ícone, quantidade e nome. Removidos textos redundantes.
- H04: mantidas as duas colunas no desktop e empilhamento responsivo. Plano do
  dia deixa de esticar seu card para preencher a altura dos indicadores.

## Persistência e limites do lote

Banco continua em esquema 6; backup continua no formato 4. A preferência de Geral
é opcional, exportada/restaurada e validada. Backups anteriores sem o campo usam
o ícone padrão. Não há transformação destrutiva ou recálculo econômico.

O círculo ainda usa o cálculo anterior de execuções planejadas concluídas.
Esta é uma entrega de apresentação: contagem por missões distintas e pendências
válidas entram no Lote 2; exclusão de pulos entra no Lote 3. A legenda “missões”
não deve ser interpretada como entrega antecipada dessas regras. Recursos
mantêm a soma líquida dos eventos de produtividade do dia.

Não foram alterados os módulos Mundo, Herói, Acampamento, Aposentos,
Companheiros ou Projetos. O campo opcional no perfil é somente a preferência da
área Geral. Nenhum banco pessoal foi aberto ou usado como fixture.

## Plano aprovado para os próximos lotes

2. Pontuais continuam pendentes e oferecem continuidade ou reinício com correção
   econômica. Recorrentes são substituídas às 00h locais da próxima data do seu
   calendário, independentemente de horário. Conservar parciais confirmadas e
   recompensas históricas; bloquear novas execuções/recompensas da substituída,
   inclusive em abas antigas. Remover suas reservas e ajustar filas sem afetar
   outras missões. Atualizar filtros, Histórico, contagem, remover recuperação e
   Revisões ativas; manter leitura e integridade dos registros antigos.
3. Pulo reversível enquanto vigente, sem nova recompensa, fora do denominador;
   estados distintos nas estatísticas. Dias herdados por padrão e sobrescrita
   individual opcional, também usados para determinar a substituição de ciclos.
4. Mesclar rotinas preservando dias efetivos da origem e configurações do
   destino. Mesclar áreas com herança do ícone do destino e preservação histórica
   e de metadados da origem, arquivada fora da lista comum. Prévia, conflitos,
   IDs preservados e confirmação transacional.

Cada lote usa branch, prévia e testes proporcionais; integração à main depende
de aprovação explícita do usuário.

## Verificação

- Vitest: **32 testes aprovados em quatro arquivos**, cobrindo área/ícones,
  gestão de áreas, edição de horários e sessões ativas.
- Svelte/TypeScript: **zero erros e avisos**; ESLint dos arquivos alterados aprovado.
- Build de produção e geração PWA aprovados.
- Playwright/Chrome, perfis descartáveis: produtividade Lote 1, sessões ativas,
  home-final e home-polish, desktop e mobile. Geometria verificada em
  320, 390, 1366, 1440 e 1920px, incluindo centralização e ausência de overflow.
- Capturas com dados sintéticos em `lote1-capturas/`.

Resultado final do navegador: **28 testes aprovados**, sem retries.

Problemas encontrados e resolvidos: o vínculo de dependências entre unidades
C: e D: impediu o primeiro build; dependências foram copiadas para este checkout.
Os testes novos precisaram corrigir a rota esperada e limitar um seletor ao
formulário visível. A execução simultânea de `check` e `build` produziu saída
inconsistente de inicialização, corrigida com build isolado e nova validação.
Executar esses dois comandos sequencialmente: ambos geram arquivos em
`.svelte-kit`. A inicialização da prévia foi reconferida após a correção.

O navegador integrado não inicializou neste ambiente; a validação foi feita com
o Playwright/Chrome do projeto, usando contextos descartáveis. Não foi executada
a suíte completa nem a CI remota nesta rodada.

Para reiniciar a prévia neste checkout, no PowerShell:

```powershell
$env:LMU_PREVIEW_PORT = '5196'
node scripts/serve-static.mjs
```

Uma prévia aberta antes de um novo build deve ser recarregada.

## Ajustes após revisão das capturas

- Horário: ao digitar os dois dígitos da hora, o campo insere `:` e posiciona
  imediatamente o cursor nos minutos (`13` → `13:` → `13:00`). Não é necessário
  digitar o separador. O mesmo comportamento atende o editor de missão e as
  entradas de rotina, com teclado numérico em dispositivos móveis.
- A formatação preserva substituição de horas/minutos, Backspace, colagem de
  `1930` como `19:30`, limpeza e validação de horários inválidos. Não normaliza
  silenciosamente valores fora de 00:00 a 23:59.
- Passos: removido o recuo de 28px do botão e a coluna visual de numeração.
  Campos dos passos e botão agora se alinham à margem dos demais campos.
  Ordem, nomes acessíveis, mover e remover continuam funcionando.
- Verificação: oito cenários de navegador desktop/mobile aprovados na seleção
  do Lote 1 (o caso novo do editor foi repetido após corrigir seu seletor de
  Projeto). Conferidas posição do cursor, edição dos segmentos, alinhamento,
  ordenação/exclusão e persistência do horário e dos passos. Tipos sem erros ou
  avisos, lint e build aprovados. Capturas adicionais `passos-alinhados-*`.
