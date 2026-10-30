# E9 — marcos e exploração do Refúgio

A rota /santuario já reutilizava o Refúgio atual. Esta rodada aperfeiçoa essa experiência compartilhada; não cria uma segunda tela nem define nova lore. As paisagens e os nomes do catálogo permanecem provisórios e substituíveis.

## Paisagem e recompensa são informações diferentes

A paisagem deriva do XP atual. O recebimento de Gold deriva da marcação no perfil e dos recibos de atividade. A interface separa início, recompensa registrada, recebimento marcado nos dados anteriores, registro estornado, XP alcançado sem prêmio marcado e marco ainda não alcançado.

Se o XP cair abaixo de um marco cujo prêmio continua marcado como recebido, a próxima transformação não promete Gold repetido. Se um recibo for estornado, ele continua acessível e é identificado como inativo. Um marco legado não ganha data ou recibo inventados. Um limiar de XP atingido sem marcação de prêmio não é anunciado como recompensa já recebida. Visitar a tela nunca concede Gold.

O registro expandido apresenta a recompensa total da ação de origem, com a indicação de que ela pode conter outros ganhos além do marco. O valor de Gold exibido como regra do marco é a configuração atual, não uma reconstituição inventada de parcelas antigas do recibo. Divergência entre recibo ativo e marcação de prêmio é identificada; a consulta não regrava a jornada para corrigir valores por conta própria.

## Exploração visual

Cada marco tem uma miniatura compacta e um botão Ver paisagem. A prévia abre em diálogo, informa que não muda ambiente, XP ou Gold, conserva o estado real da jornada e devolve o foco ao disparador ao fechar. Explicações ficam disponíveis sob demanda. No celular, a legenda do ambiente passa para o fluxo da página, para não ser cortada sobre a imagem quando o texto aumenta. As imagens maiores são pedidas para o ambiente em uso ou a prévia escolhida; as variantes compactas integram o cache essencial já existente para uso offline.

Uma resposta HTTP de erro para arte opcional também pode usar a cena compacta em cache. Antes, essa alternativa era consultada apenas quando a requisição falhava como erro de rede. A verificação offline exige imagem decodificada na prévia, não apenas texto de fallback. Quando a arte não está disponível, nomes, regras, estados e navegação continuam legíveis.

## Dados e validação

refugeQuery consulta perfil, companheiros, posse e eventos na mesma leitura consistente. Reutiliza a fotografia de identidade do perfil, sem calcular recompensa fictícia para montar o Refúgio e sem percorrer todas as missões e logs. Equipamentos seguem a mesma resolução por espaço do cálculo real. Anéis alterados em outra aba não dependem mais de um resumo carregado só na montagem de um componente.

A importação recusa um backup que contenha prêmio de marco em recibo ativo mas um contador de recebimento inferior a esse marco. O cálculo atual usa esse contador para evitar nova emissão; aceitar sua perda permitiria repetir um ganho. Backups de legado sem recibo ativo e estornos válidos continuam aceitos. Arquivo incoerente é rejeitado antes da substituição e da criação de recuperação local; os dados de destino são preservados. Isso não é reparo automático nem nova economia.

O componente EcoPanel antigo, sem importadores, foi retirado. A rota /santuario continua apontando para Refúgio e os quatro estágios mantêm IDs, custos, limiares e recompensas existentes. O schema do banco permanece 5.

## Verificação e limites

Testes cobrem consulta sem gravação, recibo ativo, estorno, legado, XP sem prêmio registrado, divergência de contador, rejeição sem escrita, carteira no limite e a exploração das paisagens sem mudar a jornada. Os testes de navegador incluem recursos e ambiente após estorno, importação incoerente, foco, Escape e 320px com texto de 200%. A suíte PWA abre Refúgio/Santuário e decodifica uma paisagem futura offline, inclusive com o servidor recusando requisições.

As evidências, capturas e candidato ficam em entregas/E9-refugio. As sessões com participantes seguem adiadas; a rodada não encerra a validação da Beta/V1, comprova engajamento ou certifica aparelhos Android/iOS físicos.
