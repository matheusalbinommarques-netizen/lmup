# E9 — companheiros, evolução e cuidados

A tela de companheiros explicita a companhia ativa, o progresso até a próxima evolução e quanto falta no saldo para investir de uma vez. O progresso visual passa a medir o intervalo entre o estágio atual e o seguinte; não altera os limiares 0/100/300 nem os bônus de 5/10/15% e a exceção existente da Aberração.

Ver evoluções abre uma galeria dos três estágios, incluindo companheiros ainda bloqueados. A exploração não seleciona, não evolui e não gasta Comida. As imagens reaproveitam o catálogo existente em variantes compactas; são solicitadas ao abrir o diálogo. Sem arte, as regras e os controles permanecem disponíveis. Esta entrega não define nova narrativa.

A confirmação de cuidado informa saldo atual e saldo após o gasto. A leitura continua acompanhando outras abas; mudança no investimento/estágio, perda de disponibilidade ou saldo insuficiente bloqueiam a confirmação da prévia antiga. Atualizar prévia recalcula a intenção original: alimentar dez ou alcançar a próxima evolução. Nenhum conflito resolve o gasto automaticamente. A validação transacional e a idempotência do serviço continuam sendo a última proteção contra operações concorrentes; alterações após a checagem da interface ainda são conferidas no serviço.

Cuidar de uma companhia inativa não a seleciona. A confirmação explica que o bônus exige seleção e disponibilidade no nível atual. Companhia selecionada mas indisponível não é anunciada como bônus em uso. Cuidado continua opcional, sem fome, cobrança por ausência ou perda de evolução. O investimento confirmado não oferece estorno.

companionsQuery lê somente perfil e companheiros em uma transação consistente. Não percorre missões, inventário ou logs, nem simula recompensas para montar a tela. Perfil ausente gera erro sem recriar dados. Não há migração: schema 5, IDs, economia e históricos são mantidos.

Os diálogos reutilizam o componente nativo já existente: foco inicial em explicação, Escape, fechamento visível e retorno ao acionador. Referência consultada: [W3C — Dialog (Modal) Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/). A escolha de apresentar estágios e custos é uma decisão deste produto, sem alegação de aumento de engajamento validado.

Testes cobrem consulta sem escrita, carteira no limite, perfil ausente, prévia de companhia bloqueada sem alteração dos dados, cancelamento, passagem de estágio, cuidado sem troca de seleção, mudança de saldo/investimento entre abas, evolução máxima, 320px/texto a 200% e arte indisponível. A suíte PWA exige as três imagens da prévia decodificadas com rede desligada. Evidências e candidato: entregas/E9-companheiros.

A avaliação com participantes continua adiada. Esta entrega não encerra E9-02/03/04/05 ou valida aparelhos físicos Android/iOS.
