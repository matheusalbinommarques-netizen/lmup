# E9 — perfil integrado à jornada

Esta rodada substitui a tela legada da Taverna por Perfil e equipamentos. A rota /perfil e os dados existentes permanecem. A direção narrativa continua provisória; avaliação com participantes segue adiada e os gates finais da Beta permanecem abertos.

## Experiência

O perfil apresenta identidade, nível, XP, recursos, companhia selecionada, seis espaços de equipamento e uma prévia de recompensa. O botão de editar fica no cabeçalho. Os atalhos de progresso, coleção, loja, conquistas, companhia, Refúgio e configurações continuam disponíveis como links convencionais.

Trocar companheiro leva à tela Companheiros, onde escolha, requisitos e cuidado já usam as regras atuais. Não há um segundo formulário de seleção com regras duplicadas. Nível máximo não mostra barra 0/0 ou um próximo nível inexistente. Estado sem equipamento explica os espaços disponíveis. Seleção de companhia indisponível não recebe bônus nem é substituída silenciosamente por um lobo.

A prévia usa uma missão de 100 XP base, calculada pela mesma função das recompensas. É uma simulação sem gravação, incluindo marcos ainda disponíveis conforme as regras existentes. Percentuais têm detalhamento opcional; não são somados na interface como se fossem um multiplicador único. Custos e mecânicas não foram alterados.

O lobo inicial usa a ilustração piloto de Hoje também em Perfil, Refúgio e Companheiros. Estágios seguintes mantêm as artes existentes. Nomes personalizados, imagens legadas de companheiros e avatares enviados pelo usuário continuam nos dados. Modo foco reduz arte decorativa e mantém nomes, efeitos e ações. Nenhuma arte original foi apagada.

## Código e consistência

profileQuery consulta perfil, companheiros e posse na mesma transação de leitura. O resultado acompanha mudanças em outras abas e não percorre missões/histórico para montar o perfil. Modificadores e itens exibidos compartilham equippedItemsForOwned: a seleção por espaço é a mesma já usada no cálculo, inclusive na resolução de duplicidades legadas. Itens desconhecidos continuam nos dados e são identificados sem efeito reconhecido. A consulta não tenta reparar ou regravar esses estados.

Foram retirados GearPanel e CompanionSelectModal, que não tinham mais importadores depois da troca. Seus catálogos paralelos de itens, imagens e evolução deixaram de participar do caminho de perfil. O formulário de identidade da rodada anterior continua protegido contra conflito e quota. Ele fica montado fora do bloco de consulta: se uma atualização do banco falhar enquanto há rascunho, o texto permanece acessível.

## Verificação

138 testes de serviços passaram. A regressão ampla teve 126 cenários aprovados e dois testes novos cuja injeção de falha não atingia a leitura esperada. A injeção passou a falhar diretamente na leitura do perfil e a confirmar que ela ocorreu; a execução focalizada dos dez cenários novos passou integralmente. Os 128 cenários distintos ficam assim cobertos, sem remover expectativas de dados ou navegação. Também passaram 20 cenários PWA e cinco verificações de integridade do pacote.

Os testes novos cobrem consulta sem gravação, preview com cálculo real, equipamento guardado/equipado em outra aba, troca de companhia, companhia bloqueada, nível máximo, nome longo, foco e texto a 200% em 320px, além de erro de consulta com formulário aberto. As verificações usam dados fictícios e contextos descartáveis. Prints antes/depois e medição de bytes ficam em entregas/E9-perfil. A comparação não mede retenção ou resultado de estudo.

Esta rodada não substitui testes em Android/iOS físicos ou sessões com pessoas. O candidato é local, sem publicação no GitHub ou hospedagem pública.
