# Plano de execução atualizado (11/11/2026)

Junta as pendências da auditoria de 04/11 (`AUDITORIA-20261104-EXECUCAO.md`) com o plano de Economia 2.0 do autor (07/11) e o contrato técnico da Fase 0 (`ECONOMIA-2-0-FASE-0.md`). **Não é autorização de implementação:** cada lote continua precisando de pedido do autor, prévia quando houver interface e merge autorizado por PR.

## 1. O que a Economia 2.0 muda na auditoria

| Lote da auditoria                                          | Efeito                           | Motivo                                                                                                               |
| ---------------------------------------------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| E02 (protótipo E0)                                         | **Cancelado**                    | A direção do RPG foi decidida no plano: produtividade com progressão; Mundo por ilustrações e escolhas               |
| E04 (mapa do grupo B)                                      | **Absorvido** pela Fase 0        | Feito em `ECONOMIA-2-0-FASE-0.md`                                                                                    |
| E06–E09 (fatia, Oásis, capítulo, 6 semanas)                | **Substituídos** pelas Fases 3–8 | O plano define a sequência da economia e do Mundo                                                                    |
| E03 (sessões com pessoas)                                  | Mantido, adiado                  | Vira a validação do critério 9 do plano, depois das Fases 1–3                                                        |
| E05 (o mundo comenta sua semana)                           | Mantido, depois da Fase 5        | Fica melhor com domínios; continua opcional e somente leitura                                                        |
| A12 (fuzz permanente)                                      | **Promovido**                    | Pré-requisito das caixas e do razão único: protege saldos antes de mexer neles                                       |
| C08 (grupo B no pré-cache)                                 | **Vira remoção**                 | O autor decidiu remover a arte do acampamento antigo (etapa 1 abaixo)                                                |
| D07 (layout da Loja)                                       | **Pausado**                      | A loja vira comerciantes regionais e forja (plano 7); preços serão revistos. Refazer o layout agora seria retrabalho |
| D09 (layout dos companheiros), D14 (arte dos companheiros) | **Pausados**                     | Pets serão reformulados (plano 6.3)                                                                                  |
| D17 (mapa de nomes)                                        | Em parte resolvido               | Domínios e trilhas têm nomes definitivos no plano; o resto continua provisório                                       |
| D10 (conquistas)                                           | Mantido                          | Layout serve às conquistas futuras de trilha; recibos intactos                                                       |

Sem efeito da economia: A06, A07, A15, A17, B04–B11, C06, C09, D03–D06, D08, D11–D13, D15–D20.

## 2. Decisões do autor já tomadas (11/11)

A07 cancelar não cria nada · A15 cópia em pasta sobrescrevendo a anterior · A17 Ouro · D05 amenizar o dourado, com prévia · D08 imagem enviada ou silhueta padrão, `heroi.png` sai · D12 um estilo, luz do bioma (PR #84) · acampamento antigo removido em duas etapas.

## 3. Ondas

Cada linha é um PR. Dentro de uma onda, lotes que não tocam os mesmos arquivos podem andar em paralelo.

### Onda A — pequenos e decididos ✅ integrada (#84–#90, 11/11)

| Lote                        | Entrega                                                                                   | Proteções                                                                                    |
| --------------------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| D12                         | Bíblia de arte (PR #84 aberto)                                                            | —                                                                                            |
| A07                         | Missões do editor de rotina só nascem ao salvar                                           | Cenário de cancelar; nenhuma recompensa ou histórico alterado                                |
| A17                         | "Gold" → "Ouro" nos textos visíveis                                                       | Backups iguais                                                                               |
| D08                         | Silhueta como padrão; remover `heroi.png` e a estrela                                     | `profile-identity`, `profile-view`                                                           |
| Acampamento antigo, etapa 1 | Remover arte isométrica (`static/art/camp/`), `Camp.svelte` e componentes visuais sem uso | `profile.camp`, validação no backup e recibos `camp:*` ficam; pré-cache e offline conferidos |
| A06                         | Esc com texto digitado pede confirmação                                                   | Teclado e toque                                                                              |

### Onda B — fundação da economia (PRs #91 A12, #92 R1, #93 S1 com proposta V0.2)

| Lote                         | Entrega                                                                                                                                                                                                           | Proteções                                                         |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| R1 — razão único de recursos | Uma função grava todo gasto e crédito de ouro, comida e materiais com evento, `requestId` e saldo na mesma transação. Loja, cuidado de companheiro e residência passam a usá-la; histórico antigo não é reescrito | Consistência, duplicação, duas abas, backup/restauração, reversão |
| A12 — fuzz da economia       | Sequências aleatórias com semente fixa sobre concluir, estornar, comprar e restaurar; nenhum saldo negativo ou duplicado                                                                                          | Tempo do Vitest registrado                                        |
| S1 — simulador               | Script que roda os números-hipótese do plano (caixa a cada 400 XP, 100/75/50%, preços V0.1) para perfis 1–5, 6–10 e 10+ missões/dia e esforços diferentes; gera tabela para o autor aprovar                       | Só script e documento; nada muda no app                           |

### Onda C — primeiras mudanças visíveis

| Lote                      | Entrega                                                                                                                                                                                                                                                                | Depende de      |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| Fase 1 — objetivo visível | Escolher um investimento e ver distância em ouro e pré-requisitos em Hoje e após concluir. **Progresso de verdade:** a barra conta o ouro e os materiais que já se tem; a primeira obra vem com materiais iniciais entregues pelo caseiro (nada de progresso fictício) | R1              |
| Por que ganhei isso?      | Toda recompensa mostra a conta (esforço, bônus, caixa n de 5) no aviso ao concluir e no histórico                                                                                                                                                                      | Fase 1          |
| D03, D04, depois D05      | Botões, abas e dourado mais escasso                                                                                                                                                                                                                                    | Prévia aprovada |
| A15                       | Cópia automática em pasta, sobrescrevendo                                                                                                                                                                                                                              | —               |

### Onda D — caixas de suprimentos (Fase 2)

Teto de 5 por dia, retorno decrescente, escolha do material. **Decidido em 11/11:** depois da 5ª caixa não há mais caixas naquele dia; o XP excedente não acumula para caixas (o XP da missão continua normal). **Depende de:** R1, A12 e números aprovados pelo autor a partir do S1. Estorno de missão estorna progresso de caixa. **Números de base:** a proposta V0.2 de `ECONOMIA-2-0-SIMULACAO.md`, **aprovada pelo autor em 12/11/2026**.

**Implementação (12/11):** materiais (`profile.materials`, `profile.materialDebt`) no razão único, com crédito, gasto e estorno por recibo; o backup recusa saldo que não fecha com os recibos. As caixas são derivadas dos recibos de missão (`activityEvents`), sem contador próprio: desfazer ou corrigir uma missão reduz as caixas do dia, e caixa já aberta que deixa de valer é estornada (débito se o material já foi gasto). Abrir uma caixa grava `supply-box:<data>:<caixa>:<tentativa>`. Cartão em Hoje com progresso até a próxima caixa, estoque e escolha do material. Os materiais só passam a ter uso nas construções da Onda E.

### Onda E — primeiro circuito do acampamento (Fase 3)

Serraria, caseiro indica profissional, trabalhador, produção offline até o estoque e uma segunda construção que consome madeira. Inclui **etapa 2 do acampamento antigo:** o perfil pessoal não tem estoque antigo (autor, 11/11), então não há migração de materiais. A lógica antiga sai; backups antigos com `profile.camp` continuam sendo aceitos e o campo é preservado sem uso, para não falhar a restauração. Preços e produção partem da V0.2 (3 níveis por construção, estoque limitado pelo armazém).

**Primeiro lote (12/11, lógica primeiro por decisão do autor; arte depois):** serraria (10 madeira/dia no nível 1, 15 no 2) e campo de caça (4 comida/dia, 6 no 2; pede a serraria e 12 madeira), com preços da V0.2. O nível 3 fica fechado até existir ferro (fundição). Construir e melhorar gastam pelo razão com recibo `camp-building:<id>:<nível>`; coletar credita com `camp-production:<id>:<início>`. A produção acumula offline até 60 por material esperando coleta (sem armazém); a comida limita só o pendente. Estado em `profile.campBuildings`, validado no backup contra os recibos. Painel "Construções" no acampamento, sem mudar a cena. **Pendente:** arte da serraria e do campo de caça, ícones de madeira, pedra e minério, e a etapa 2 do acampamento antigo (lote próprio).

### Onda F — crônica mínima do acampamento

O app registra sozinho os marcos (construções, projetos concluídos, retomadas) e mostra um resumo do mês, com poucos textos fixos. Só leitura do histórico; nenhuma tarefa pedida pelo jogo. Depende da Onda E.

### Depois

Fase 4 (projetos), Fase 5 (domínios e Roda da Vida), Fase 6 (economia ampliada), Fase 7 (progressão especial), Fase 8 (longevidade), na ordem do plano. **A Fase 5 pode subir** para depois da Onda C: não mexe em saldos e não depende das caixas. Revisitar D07, D09, D14, E03 e E05 quando as fases correspondentes estiverem definidas.

**Princípio de ritmo (11/11):** encomendas, anexos e a primeira grande obra se abrem pelo progresso, perto de quando todas as construções chegam ao nível 1 (dia ~24 no perfil de referência da V0.2), para o segundo mês trazer mecânica nova e não só preços maiores. **Reconhecimento por domínio:** nas trilhas (Fases 5 e 7), o mundo reconhece o que já foi feito; nunca pede ações de um domínio.

## 4. Achados e manutenção que continuam

- Instáveis: `alpha:165`, `living-reward:119` (causa provável: lê imagens sem esperar), `area-icons:107/171`, `camp-integrated`, `rpg-rules:131` (desktop; reproduzido na `main` em 11/11, 3 falhas em 16, timeout em `page.evaluate`). `routine-editor-ux:49` resolvido no #83.
- Ideias avaliadas e deixadas de fora por ora (11/11): ferramentas de oficina (só se o perfil leve se mostrar problema no uso), conselho da semana (a revisão existente cobre), estações reais (custo de arte), social/cartão para compartilhar (fora da direção); expansão regional já é a Fase 8.
- Teclado nas demais listas reordenáveis não verificado.
- `plannedOccurrences` com custo quadrático possível em históricos com muitos dias sem ocorrência gravada; reconciliação diária ainda lê todas as ocorrências. C04 só volta se a instalação real ficar lenta.
- Ferramentas (B04, B05, B07, B08, B10, B11) e C06, C09, D06, D10, D11, D13 seguem como candidatos sem urgência.

## 5. Respostas e pendências do autor

1. Estoque do acampamento antigo no perfil pessoal: **não há** (11/11).
2. Caixas: **5 por dia; depois da 5ª, nenhuma outra caixa no dia** (11/11). Os números de cada caixa saem do S1.
3. Reclassificação por domínio (11/11, revisado): **vale daqui para frente, sem transferência.** O que já foi conquistado no domínio antigo (conquistas, itens, receitas, marcos, trilha) fica onde está; o que for feito depois da mudança conta no domínio novo. Assim não dá para levar receitas e vantagens de um domínio para outro quando for conveniente. Pontos para a especificação da Fase 5:
   - cada conclusão guarda o domínio que tinha no momento, e o progresso de trilha soma essas conclusões; mudar a classificação não recalcula o passado;
   - recibos de desbloqueio por `(domínio, marco)`, concedidos uma vez e nunca revogados por reclassificação;
   - painéis e Roda da Vida mostram o passado com o domínio da época;
   - recompensas de trilha **não são gastáveis** (decidido em 11/11): títulos, receitas, exibições, espaços de Legado; nada de ouro ou material;
   - XP e ouro básicos das missões não dependem de domínio;
   - histórico anterior aos domínios fica não classificado.
