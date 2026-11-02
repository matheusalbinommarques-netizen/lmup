# LMUP — ajustes pontuais de controles

Correções aplicadas à branch `feat/missions-ux-round1`, sobre o pacote consolidado `6dc57ba`. Sem redesenho amplo, mudança de economia ou integração à main.

- Agenda: os agrupamentos de horário usam rótulos com borda, ícone, contraste e contagem, alinhados à linha do tempo. Grupos vazios não deixam títulos soltos.
- Formulário: “Gerenciar áreas” usa o botão secundário existente, alinhado à seleção de área. Passos têm espaçamento próprio para adicionar, alinhamento pela coluna dos campos e controles de ordenação/remoção consistentes.
- Horários: a superfície inteira do input ativa o seletor nativo; Enter e Alt + seta para baixo também abrem o seletor. Tab e edição direta continuam disponíveis. Há foco visível, cursor e indicador com contraste. Navegadores sem seletor nativo disponível mantêm a entrada direta.
- Rotinas: uma missão nova pode receber horário já no formulário; esse valor é levado à sequência e continua editável nela. Missões já vinculadas mantêm o horário sob controle da rotina, com o aviso existente; execuções iniciadas continuam congeladas.
- Menus contextuais: os controles de abrir, retirar de hoje, fixar, desfazer, arquivar e excluir têm fundo, borda e espaçamento; exclusão conserva identificação destrutiva e confirmação explícita.
- Missão aberta: arquivar e excluir saíram do topo e ficam na seção “Gestão da missão”, após a execução e as ações de acompanhamento. A confirmação e as regras de proteção narrativa não foram alteradas.

Validação: TypeScript/Svelte sem erros ou avisos; lint dos arquivos alterados aprovado; build aprovado. Foram aprovados 66 testes E2E direcionados em desktop, 390 px e 320 px. Uma confirmação adicional dos nove cenários novos verificou o retorno bem-sucedido do seletor nativo, sem substituir sua implementação, e atualizou as capturas. Não foram repetidas as suítes completas de serviços, PWA ou E2E, pois não houve alteração dos serviços econômicos, esquema de persistência ou mecanismo offline.

As jornadas verificaram também contexto da página, confirmações de exclusão, histórico, ausência de recompensa duplicada, rascunhos, edição aninhada, herança de áreas, recorrência e configuração congelada da sessão. O horário novo foi salvo, fechado, recarregado e reaberto na rotina.

Prévia funcional: <http://127.0.0.1:5295/missoes?demo=1>. Capturas atualizadas e referências enviadas pelo usuário: <http://127.0.0.1:5294/#controles>. As capturas novas usam somente dados sintéticos em navegadores descartáveis. A instalação pessoal permanece intacta.
