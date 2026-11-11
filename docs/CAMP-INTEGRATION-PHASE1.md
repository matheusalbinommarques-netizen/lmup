# Acampamento integrado ao Refúgio — fase 1 local

## Estado e escopo

- Base verificada no GitHub: `bbcaf277c0b65938b36b38e081d91f9d99250147` (main após PR #46).
- Branch: `integration/camp-persistent-20261102`.
- Checkout independente: `D:\Projetos\LMUP-integracao-acampamento-20261102`.
- Prévia: http://127.0.0.1:5198/refugio — entrar por **Entrar no acampamento**.
- Alterações locais para avaliação, sem push, PR, merge ou publicação. CI completa não executada.
- Origem recuperada: árvore local `implementacao-e2`, HEAD `9b47d79f458e33235f4188300d1e1091d18c7284`, incluindo alterações rastreadas e arquivos novos não commitados. Não foi feito merge dos PRs #41/#43.
- Originais, backup verificado e instalação/sincronizador da porta 5174 não foram modificados.
- Após a orientação posterior do usuário, o fechamento passou a priorizar exclusivamente desktop. Mobile permanece pendente.

## 1. Código e arte reaproveitados

`src/lib/camp/Camp.svelte` deriva da última página local de laboratório. Foram reutilizados SceneSprite, TerrainRegion, os três componentes de ícones e os modelos campRegion, campSprites, campPlacement, campConstruction, campEconomy, campProduction e campWorkshop. Os cinco arquivos de testes dos modelos também foram recuperados.

Mantidos: mapa 1850×1400, terrenos texturizados, caminhos, lago procedural, 24 árvores com profundidade por Y, câmera arrastável e zoom, seleção de edifícios, prévia de posicionamento, arraste de bases, espelhamento, confirmação/cancelamento, construção/conclusão manual e destruição. Salão, duas forjas e armazém iniciais conservam as posições originais; serraria, pedreira, mina e melhorias usam o catálogo recuperado.

Em `static/art/camp` estavam 13 PNGs usados pelo renderizador e quatro arquivos de licença/procedência da origem. **Removidos em 11/11/2026** com a tela antiga (o Acampamento cinematográfico a substituiu); os dados de `profile.camp` e sua validação no backup continuam. Os 17 arquivos foram comparados por SHA-256 com a origem e permanecem byte a byte iguais. `preservation-manifest.json` registra arquivos, tamanhos e hashes. Os PNGs somam 10.077.971 bytes. Não foram redesenhados ou convertidos. A documentação distingue recursos CC0 de terceiros e imagens geradas para o protótipo, sem atribuir estas últimas aos autores CC0.

O campSession em memória foi substituído pelo armazenamento real. Os modelos demonstrativos permanecem como referência/testes; a interface integrada não chama concessões de XP/ouro demonstrativos, não importa estados acumulados do laboratório e não cria missões fictícias no organizador.

## 2. Adaptações e contratos

A entrada foi adicionada ao Refúgio existente, que também atende ao Santuário. O endpoint é subordinado: `/refugio/acampamento`. Home e destinos principais continuam intactos. Evolução do ambiente, companheiros, equipamentos e marcos existentes continuam disponíveis no Refúgio.

### Economia

- Ouro e XP mostrados são lidos do Profile real. `Profile.camp.inventory` proíbe campos gold, xp, badges e completedMissions.
- Madeira, pedra e ferro são materiais exclusivos de construção, separados de XP/ouro/comida. Os custos atuais recuperados usam apenas esses materiais.
- A provisão inicial é única por acampamento: 12 madeira, 8 pedra e 9 ferro. Não há provisão de ouro, XP ou comida. É registrada na auditoria e não se repete ao recarregar.
- Os saldos fictícios e missões demonstrativas não foram importados. O painel de missões leva aos sistemas reais de missões, projetos e progresso, sem conceder recursos por exemplos.
- Forjas fabricam a espada de treino recuperada, persistida no inventário do acampamento. Ela não é criada como equipamento do herói e não concede atributos ou recompensa real.
- Recompensas e correções da jornada permanecem nos serviços originais. Foi testada também a política atual de estorno por dívida/compensação, sem substituí-la por subtração direta.

### Adaptações necessárias à persistência

A remessa fictícia de exploração e o reset por recarga escondiam a possibilidade de gastar os materiais que permitem iniciar a produção. A versão persistente recusa uma operação que eliminaria essa rota. Enquanto não houver serraria, reserva 8 madeira; enquanto não houver serraria/pedreira, preserva a pedra necessária a elas; sem mina, preserva o ferro necessário à mina e à pedreira ainda ausente. Construções já iniciadas contam como produtores recuperáveis porque a conclusão manual não tem novo custo. O guard é aplicado na transação; fabricação mostra a mesma verificação antes de confirmar. Esta regra precisa da avaliação funcional do usuário.

O salão principal fica protegido porque não existe opção de reconstruí-lo no catálogo recuperado. Remover armazém é bloqueado se o estoque ultrapassaria a capacidade resultante; não há descarte silencioso por demolição. Construções destruídas não reembolsam materiais. Cancelar uma prévia não grava nem cobra; a produção temporal é independente do cancelamento.

## 3. Persistência, concorrência e backup

A solução segue o padrão já existente de estado opcional no perfil: `Profile.camp`, com `format: 1`. Não há tabela, índice ou migração nova. **Dexie permanece no schema 6; backup permanece no formato 4.**

O agregado inclui edifícios/posições/orientações, fases, níveis, trabalhadores, estoque, espadas, origens de produção, custos/fabricações, contador de construções, relógio de liquidação, revisão e identificadores de acampamento/geração. O formato 1 fixa as regras/receita recuperadas; futuras mudanças de custo/receita exigem versionamento e tratamento do histórico, não alteração retroativa da fórmula.

`campService` usa `progressTransaction` e a tabela `productivityAudit` existentes. Alteração de estado e recibo são gravados juntos. IDs de operação ficam sob namespace camp e possuem assinatura do comando. Repetir o mesmo pedido não repete custo/fabricação; reutilizar ID com outros dados é recusado. Uma revisão antiga não sobrescreve trabalho de outra aba. O serviço atualiza somente o campo camp, preservando saldos e progressão concorrentes.

Produção usa os modelos recuperados: 360 madeira/h, 180 pedra/h e 90 ferro/h na base; trabalhador dobra a taxa; níveis usam os multiplicadores existentes. O tempo é liquidado antes de alterar trabalhadores, nível, capacidade ou remover produtores. O relógio persistido não retrocede; frações são conservadas por produtor; excedente ao atingir a capacidade é descartado, não guardado para uma melhoria futura. Reabrir liquida o intervalo real uma vez. Abas concorrentes são serializadas por IndexedDB.

O liveQuery atualiza outras abas e acompanha mudanças reais no ouro/XP. Gravações são reconhecidas pelo mecanismo de segurança de atualização existente. Construção em prévia, confirmação de destruição e operação pendente bloqueiam uma troca de versão até serem resolvidas.

Backups incluem automaticamente o agregado e os recibos. A validação recusa saldos inválidos, saldo paralelo de ouro, inconsistência de materiais/custos, níveis/posições/colisões inválidos e trabalhador inválido/duplicado. Dados já corrompidos não são normalizados silenciosamente pela produção. A restauração mantém worldId/recibos e renova epoch para invalidar intenções de abas anteriores. O objeto de backup de entrada também é preservado. Backups anteriores sem camp continuam válidos; abrir a funcionalidade cria um estado novo, sem importar experiências do laboratório. As cópias de recuperação anteriores à importação continuam no mecanismo original.

## 4. Offline, pacote e navegação

O worker recebeu somente a nova rota explícita no fallback offline. Protocolo 1, schema 6 e barreira de atualização entre abas permanecem iguais. A lista de precache usa os 13 PNGs do manifesto preservado, sem incluir automaticamente laboratórios ou PNGs não revisados. Limite anterior de 3 MiB por arquivo mantido.

Build de referência do candidato: 263 entradas, 25.882.448 bytes de precache (aproximadamente 25,88 MB). Cerca de 10,08 MB são os sprites/atlas preservados do acampamento. Esse custo foi mantido para a primeira visita offline: os maiores PNGs excedem o limite do cache sob demanda existente. Não se reduziu qualidade ou resolução de arte aprovada para esconder o tamanho. Peso, instalação e quota ainda precisam da bateria final em dispositivos reais.

A adaptação móvel de legibilidade foi iniciada, mas sua continuação e verificações adicionais foram suspensas por orientação do usuário. Não foi redesenhado o mapa. Permanecem ajustes de painel/toque para uma rodada futura autorizada.

## 5. Verificações efetivamente realizadas

| Verificação                   | Resultado e limite                                                                                                                                                                                                                     |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Modelos recuperados           | 43 unitários em cinco arquivos aprovados.                                                                                                                                                                                              |
| Serviço e regressões de dados | 24 unitários novos de campService; 50 unitários existentes selecionados de backup/produtividade/Refúgio. Total de 117 unitários distintos aprovados ao longo das rodadas direcionadas.                                                 |
| Precache                      | Cinco testes Node aprovados, incluindo seleção explícita de artes e exclusão de laboratórios/arquivos não revisados.                                                                                                                   |
| Tipos e lint                  | Checagem de tipos sem erros/avisos; lint direcionado aprovado.                                                                                                                                                                         |
| Build                         | Produção e worker gerados, mantendo schema/protocolo.                                                                                                                                                                                  |
| Desktop final                 | Nove E2E aprovados: câmera/zoom, terreno, destruição confirmada, arraste/espelhamento/cancelamento, produção/trabalhadores/fabricação/recarga/outra aba/exportação/restauração, projetos e marcos do Refúgio.                          |
| PWA desktop final             | Dois casos aprovados: primeira visita offline com terreno/fabricação/recarga; prévia noutra aba impede atualização e cancelar libera sem cobrar. A regressão existente de notas não salvas também passou em rodada direcionada.        |
| Integridade gráfica           | Os 17 arquivos copiados conferem por SHA-256 com a origem.                                                                                                                                                                             |
| Mobile                        | Rodada encerrada a pedido: três casos passaram; permanece uma falha de seleção/câmera com painel cobrindo o alvo. Dois casos especializados de gesto/destruição eram somente desktop. Não foi ocultada a falha nem enfraquecido teste. |

Foram usados exclusivamente fake-indexeddb ou contextos descartáveis do Chrome com dados sintéticos. Nenhum perfil pessoal foi aberto. Portas temporárias de teste 4174/4274 e, após constatar outra atividade usando a porta padrão, 4188/4288 com configurações externas ao checkout. O outro servidor foi preservado. A prévia permanece em 5198.

Capturas externas ao Git registram mapa, praça, forjas, lago, clareira e estado restaurado/fabricado. A prévia e o relatório de entrega indicam o local da galeria.

## 6. Roteiro da prévia desktop

1. Abrir a origem isolada e entrar no acampamento pelo Refúgio. Não importar backup pessoal nessa prévia.
2. Explorar mapa com arraste, zoom e locais de referência.
3. Escolher Construir → Serraria, posicionar em área livre, confirmar e concluir. Escolher um trabalhador.
4. Observar madeira sendo produzida. Um trabalhador na serraria permite aproximadamente uma unidade a cada cinco segundos.
5. Criar pedreira e mina em áreas livres, concluir e distribuir trabalhadores exclusivos. O avanço usa apenas os custos e taxas recuperados.
6. Selecionar uma forja e fabricar uma espada quando o estoque e as reservas de partida permitirem. Conferir inventário e detalhes de materiais.
7. Mover/espelhar com confirmação, cancelar uma proposta e experimentar destruição confirmada de edifício removível. O salão é protegido.
8. Recarregar ou reabrir: encontrar edifícios, posições, trabalhadores, itens e estoque preservados. Para testar restauração, exportar e importar somente o backup sintético da própria prévia.
9. Voltar ao Refúgio e conferir que ambiente, companheiros, equipamentos e progressão existentes continuam disponíveis.

## 7. Limites e problemas conhecidos

- Este é um candidato local de fase 1, sem CI completa ou avaliação física. Não é uma entrega publicada.
- Mobile está suspenso; a falha registrada de painel/toque precisa ser retomada quando o usuário autorizar. Não excluir esse teste para fechar CI.
- Colisões mantêm as regras do protótipo: bases de edifícios e limites do mapa. Não foram introduzidas regras adicionais de bloqueio por vegetação/lago.
- O relógio é local, sem autoridade remota. Retrocesso é tratado; avanço artificial não é autenticado. A capacidade limita crédito e materiais não viram XP/ouro fictícios.
- O agregado no perfil e os históricos crescem com construções/fabricações. Sessões longas, volume, quota e custo de observação entre abas precisam de teste de carga antes de decidir se há necessidade real de outra tabela/schema.
- Espada de treino é item do acampamento, sem equipar o herói ou conceder bônus. Não foi inventada recompensa por missão/projeto nem uma categoria obrigatória nova.

## 8. Próximos passos, após avaliação

Primeiro avaliar mapa/mecânicas desktop e os contratos de materiais, provisão, reservas, proteção do salão e inventário. Depois corrigir defeitos objetivos apontados nessa avaliação. Mobile só retorna ao escopo por nova orientação do usuário.

Antes de PR/publicação, completar unitários e E2E gerais, migração de bancos antigos seguida de entrada no acampamento, restauração/recuperação, economia/idempotência e falhas com dados maiores. Executar a suíte PWA completa, incluindo cliente antigo, falta de espaço, troca de versão e múltiplas abas. Verificar desempenho, tamanho de pacote, integridade, auditoria de segurança e Node 22/24. Rodar uma bateria consolidada sobre o candidato estabilizado, sem ciclos desnecessários durante ajustes pequenos.

Não houve push, PR, CI remota, merge ou publicação nesta execução. Nenhuma regra de sincronização/proteção/publicação foi alterada.
