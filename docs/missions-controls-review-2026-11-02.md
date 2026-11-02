# LMUP — ajustes pontuais de controles

Correções aplicadas à branch `feat/missions-ux-round1`, sobre o pacote consolidado `6dc57ba`. Sem redesenho amplo, mudança de economia ou integração à main.

- Agenda: os agrupamentos de horário usam rótulos com borda, ícone, contraste e contagem, alinhados à linha do tempo. Grupos vazios não deixam títulos soltos.
- Formulário: “Gerenciar áreas” usa o botão secundário existente, alinhado à seleção de área. Passos têm espaçamento próprio para adicionar, alinhamento pela coluna dos campos e controles de ordenação/remoção consistentes.
- Horários: a superfície inteira do input ativa o seletor nativo; Enter e Alt + seta para baixo também abrem o seletor. Tab e edição direta continuam disponíveis. Há foco visível, cursor e indicador com contraste. Navegadores sem seletor nativo disponível mantêm a entrada direta.
- Rotinas: uma missão nova pode receber horário já no formulário; esse valor é levado à sequência e continua editável nela. O horário de missões já vinculadas também pode ser editado pelo formulário na Lista, na Agenda ou na missão aberta. O salvamento sincroniza o horário correspondente na rotina de forma atômica e auditada, com proteção contra sobrescrita entre abas. Os dias continuam definidos pela rotina; execuções iniciadas permanecem congeladas.
- Menus contextuais: os controles de abrir, retirar de hoje, fixar, desfazer, arquivar e excluir têm fundo, borda e espaçamento; exclusão conserva identificação destrutiva e confirmação explícita.
- Missão aberta: arquivar e excluir saíram do topo e ficam na seção “Gestão da missão”, após a execução e as ações de acompanhamento. A confirmação e as regras de proteção narrativa não foram alteradas.

Validação: TypeScript/Svelte sem erros ou avisos; lint dos arquivos alterados aprovado; build aprovado. Foram aprovados 66 testes E2E direcionados em desktop, 390 px e 320 px. Uma confirmação adicional dos nove cenários novos verificou o retorno bem-sucedido do seletor nativo, sem substituir sua implementação, e atualizou as capturas. Não foram repetidas as suítes completas de serviços, PWA ou E2E, pois não houve alteração dos serviços econômicos, esquema de persistência ou mecanismo offline.

As jornadas verificaram também contexto da página, confirmações de exclusão, histórico, ausência de recompensa duplicada, rascunhos, edição aninhada, herança de áreas, recorrência e configuração congelada da sessão. O horário novo foi salvo, fechado, recarregado e reaberto na rotina.

Prévia funcional: <http://127.0.0.1:5295/missoes?demo=1>. Capturas atualizadas e referências enviadas pelo usuário: <http://127.0.0.1:5294/#controles>. As capturas novas usam somente dados sintéticos em navegadores descartáveis. A instalação pessoal permanece intacta.

## Revisão adicional — espaço do formulário e horário fora da rotina

A instrução “Como as alterações são aplicadas” foi removida. O editor ganhou área útil e termina com um intervalo de 8 a 24 px antes dos botões, verificado nas três larguras. Campos, validações e proteções continuam disponíveis.

Ao alterar o horário de uma missão vinculada, somente o horário correspondente na rotina é atualizado, preservando suas demais entradas e o planejamento anterior ao vínculo. O rascunho de uma rotina aberta é preservado durante a edição aninhada. Edições concorrentes mantêm a comparação de versões e não sobrescrevem silenciosamente dados.

Validação desta revisão: 42 testes direcionados de serviços aprovados, incluindo quatro novos cenários de sincronização, concorrência, retirada de horário e backup; 39 jornadas E2E aprovadas em desktop, 390 px e 320 px; tipos sem erros ou avisos, lint dos arquivos alterados e build aprovados. Foram preservados saldos, recibos, progresso e sessões em andamento. Não foram repetidas as suítes completas.
