# E6 — Refúgio, companheiros e coleção

Entrega local de 29/10/2026, sobre E5. Linha de trabalho: codex/e6-refugio-colecao. O Refúgio deixa de ser um atalho para telas independentes: ambiente, companheiros, inventário, loja e conquistas compartilham navegação, controles e dados reais. A rota /santuario é mantida como acesso compatível à nova visão do Refúgio.

## Experiência

A paisagem mostra o estágio do ambiente e o próximo marco, com XP necessário e prêmio de entrada. Abaixo ficam a companhia ativa, recursos, equipamentos por espaço e os registros das transformações. Toda ação tem caminho textual; as ilustrações não são necessárias para navegar. As quatro paisagens do piloto E3, as artes dos companheiros e os ícones existentes cobrem os estados desta etapa. Não foi necessário produzir um catálogo novo de imagens. Identidade, lore e substituições de arte continuam abertas à revisão do autor em E9.

Companheiros mostram nível necessário, evolução, investimento e bônus. Cuidar é opcional: não há fome, manutenção obrigatória ou punição por ausência. Alimentar +10 e completar a próxima evolução abrem uma prévia com custo, investimento resultante e bônus. Só a confirmação grava o gasto. O investimento é permanente; as sessões de cuidado posteriores a esta entrega têm recibos individuais. Evoluções antigas conservam seus registros, sem inventar cuidados passados.

Loja e Minha coleção usam a mesma apresentação. A pessoa vê preço, efeito, espaço, item substituído e uma simulação de missão com 100 XP base. A simulação usa o cálculo de recompensa real e os bônus atuais; não inclui bônus separados de projeto. Comprar adiciona posse e não equipa automaticamente. Equipar e guardar são escolhas independentes; recibos de recompensas anteriores continuam iguais. Confirmações explicam que compra e comida não têm reembolso nesta versão.

Conquistas passam a reunir próximas, conquistadas e futuras, com busca e critérios visíveis. Cinco critérios de economia agora usam posse e saldo reais: primeira compra, dez equipamentos diferentes, saldo de 5.000 Gold, saldo de 50.000 Gold e posse de um item para cada um dos seis espaços. As descrições foram alinhadas a esses critérios. Os critérios representam o estado atual; não se apresenta uma data de desbloqueio que nunca foi registrada. Social, interações sem contagem implementada e níveis futuros continuam identificados como futuros.

## Contratos e compatibilidade

- Compra resolve o item e o preço pelo catálogo canônico, dentro de uma transação com saldo e posse. Um objeto de interface com preço diferente não reduz o custo. Repetir ou confirmar a mesma compra em duas abas não duplica item nem gasto. Falha na gravação da posse reverte o débito.
- Um equipamento ativo por espaço. A troca guarda o anterior, mantém sua posse e ocorre em uma transação. A inicialização e a restauração corrigem flags legadas conflitantes, mantendo ativo o item conhecido com maior ID em cada espaço e preservando todos os itens e metadados. O cálculo também se protege contra efeitos duplicados no mesmo espaço.
- Capacidade: 20 itens entre equipamentos e visuais possuídos; mochila equipada acrescenta 10. A mochila pode ser comprada mesmo com a coleção cheia para permitir a ampliação. Guardar a mochila não apaga os itens que excedam a capacidade reduzida; novas compras ficam limitadas até haver espaço. Nenhum objeto é vendido ou removido automaticamente.
- Registros de equipamentos desconhecidos e visuais legados permanecem na coleção. Visuais continuam selecionáveis por tipo; o novo catálogo de gameplay não oferece compras de funções indisponíveis. O antigo catálogo de gear sem uso foi removido para evitar outra fonte de preços e efeitos.
- Cuidado usa a mesma função de prévia e gravação. A quantidade é limitada ao investimento de 300 Comida da evolução final; o máximo não aceita gasto adicional. Pedido repetido com o mesmo identificador não gasta de novo. Uma prévia de outra aba, com investimento desatualizado, é recusada. Falha na gravação do companheiro reverte o débito.
- Seleção e bônus respeitam o nível atual sem depender de visita ao Bestiário. Se um estorno reduzir o nível abaixo do necessário para o companheiro ativo, seu bônus fica inativo; a evolução adquirida é preservada. Os textos da seleção antiga e do painel de perfil também consultam a regra central.
- Transformações usam os eventos de recompensa existentes e seus estágios concedidos. O ambiente acompanha o XP atual. O evento de origem permanece identificável mesmo depois de estornado. Um marco legado sem evento aparece como anterior ao histórico detalhado e não recebe outro prêmio ao abrir a tela.
- O banco permanece na versão 5. O campo opcional careHistory registra identificador, data, quantidade e evolução antes/depois; o backup valida IDs, datas, estágios e investimento compatível. Exportação e restauração preservam posse, equipamento, investimento e recibos.

Os componentes de compra e cuidado impedem sair pela navegação enquanto uma gravação está pendente. Não há atualização otimista de saldo nem confirmação por alerta nativo nesses fluxos.

## Fontes e validação

Os diálogos usam o componente nativo já estabelecido, com retenção e retorno de foco, cancelamento e estado de gravação. A referência é o [padrão de diálogo modal do W3C](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/). Os limites de transações e a espera pela confirmação de gravação seguem a [documentação de transações do Dexie](https://dexie.org/docs/Dexie/Dexie.transaction%28%29). Essas fontes orientam a implementação; não certificam, por si, a acessibilidade ou a experiência do produto.

Verificação final: lint e tipos aprovados, 103 testes de serviços e 88 cenários de produção no navegador. Cobertura inclui falha entre débito e gravação, duas abas, exclusividade de espaço, preço canônico, capacidade, prévia obsoleta, evolução final, backup, marco/estorno e missões com os novos bônus. As telas são exercitadas também em 320×568, texto ampliado a 200% e artes bloqueadas. Contextos descartáveis e dados sintéticos não acessam o perfil pessoal.

Permanecem três avisos legados em EditProfileModal e ShopItemCard. Não houve teste com participantes, leitor de tela ou aparelhos físicos, publicação ou envio ao GitHub. Engajamento ainda é hipótese a validar com usuários. E7 reúne histórico e estatísticas pelos eventos, configurações e conforto global; E8 trata offline e atualização da PWA. Evidências visuais e logs ficam em entregas/E6 do workspace.
