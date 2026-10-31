# E3 — Sistema visual e piloto navegável

Prévia em `/laboratorio`. Componentes e estados em `/laboratorio?view=componentes`.

## Produto desta etapa

A primeira ação aparece antes dos gráficos: retomar uma missão. A tela de execução expõe passos reais e permite pausar. A conclusão reconhece o trabalho, oferece saída imediata e desfazimento. O ambiente e o companheiro dão contexto ao progresso sem disputar atenção com a tarefa.

Hoje, Missões, Projetos e Refúgio têm navegação equivalente no desktop e no celular. São telas de demonstração nesta etapa: valores e missões são exemplos; alterações duram somente enquanto a página estiver aberta. A prévia não abre nem grava o banco pessoal. A integração com os dados reais e a substituição da navegação atual pertencem a E4–E7.

## Fonte visual única

`src/lib/design-system.css` define tokens sob `.lmu-design`, para adotar o sistema gradualmente. As telas antigas ainda preservam seu estilo até a migração por fluxo.

| Papel                                | Token / decisão                                       |
| ------------------------------------ | ----------------------------------------------------- |
| Fundo                                | `--lmu-bg: #121B20`                                   |
| Superfície / elevada                 | `#1C292E` / `#24343A`                                 |
| Texto / contexto                     | `#F1EDE2` / `#AAC2B3`                                 |
| Ação / texto sobre ação              | `#E8AD57` / `#172024`                                 |
| Progresso / descoberta               | `#7BC4B1` / `#C0AFD9`                                 |
| Erro / foco                          | `#FFB4A9` / `#B8E5DC`                                 |
| Borda de controle / linha decorativa | `#70868B` / `#35494F`                                 |
| Leitura                              | Segoe UI, system-ui; base 1rem, entrelinha 1,55       |
| Títulos                              | Georgia; uso restrito a títulos curtos                |
| Espaços                              | 4, 8, 12, 16, 24 e 32px equivalentes em rem           |
| Controles / cartão                   | mínimo 48px no tamanho de texto padrão / raio 16px    |
| Movimento                            | 160ms; sem animação obrigatória para concluir ou sair |

Sem downloads de fontes e sem uma segunda biblioteca de ícones. Ícones em SVG com traço consistente; imagens ficam reservadas ao conteúdo ilustrado.

O texto principal sobre a superfície tem contraste calculado de 12,77:1; secundário, 7,88:1; texto escuro sobre ação, 8,31:1. São verificações dessas combinações, não certificação de conformidade do produto inteiro. A referência para contraste, reflow, foco e alvos é a [WCAG 2.2](https://www.w3.org/TR/WCAG22/).

## Componentes e contratos

| Componente | Comportamento                                                                                           |
| ---------- | ------------------------------------------------------------------------------------------------------- |
| Button     | primary, secondary, quiet, danger; disabled; loading com texto e aria-busy                              |
| Field      | label associado, hint, erro conectado por aria-describedby e aria-invalid                               |
| Card       | superfície comum, destaque e superfície discreta; sem interação implícita                               |
| MissionRow | lista semântica; ação inteira clicável, descrição e progresso legíveis                                  |
| Dialog     | diálogo nativo modal, foco inicial, Escape, contenção de foco, retorno ao disparador e conteúdo rolável |
| Artwork    | alternativa visual e descrição quando a imagem falha; cena com srcset 600/1200                          |
| Icon       | ícone decorativo; nome da ação vem do texto ou aria-label do controle                                   |

O diálogo segue o comportamento descrito no [padrão de diálogo modal da WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) e usa [HTML dialog](https://www.w3.org/WAI/WCAG22/Techniques/html/H102) para a modalidade nativa. A aplicação deverá continuar sendo avaliada com tecnologias assistivas reais.

## Conteúdo sem acoplamento às regras

`src/lib/content/world.ts` reúne nomes, textos e caminhos de arte. Chaves como `wolf` e IDs de estágio 1–4 continuam estáveis; custos, limiares e bônus permanecem nos serviços. Perfil inicial, evolução e configuração do Santuário consultam esse catálogo. Nomes já personalizados no banco não são sobrescritos.

“Refúgio”, os textos e a ambientação desta exploração são provisórios. A personalidade do autor pode substituir esse conteúdo sem migrar saldos ou renomear eventos. A organização dos itens da loja e das demais telas será migrada nas etapas correspondentes, sem afirmar que todo texto antigo já foi centralizado.

## Piloto de arte e exportação

Criado com a ferramenta integrada `image_gen`; prompts finais em [E3-prompts.json](E3-prompts.json). Os originais PNG ficam no pacote de evidências da entrega, fora do bundle. Nenhuma arte anterior foi sobrescrita.

| Uso                             | Exportação              | Peso aproximado | Orçamento   |
| ------------------------------- | ----------------------- | --------------- | ----------- |
| Companheiro                     | WebP com alpha, 512×614 | 56 KiB          | até 80 KiB  |
| Coleção de objetos              | WebP com alpha, 512×341 | 39 KiB          | até 60 KiB  |
| Ambiente, cada estágio          | WebP 1200×800           | 136–177 KiB     | até 200 KiB |
| Ambiente compacto, cada estágio | WebP 600×400            | 41–55 KiB       | até 65 KiB  |

Quatro estágios mantêm enquadramento, terraço, vale e iluminação. A mudança principal é a planta. A composição é comparável, mas as imagens geradas não são camadas perfeitamente registradas: futuras transições devem usar troca simples, sem depender de interpolação geométrica.

O lobo preserva uma silhueta reconhecível, marcas de jade e olhos verdes; a cápsula, o caderno e o mineral exploram materiais da mesma coleção. A leitura dos objetos funciona como conjunto; ícones individuais de inventário ainda exigirão peças próprias em E6.

Carregar somente a cena selecionada; srcset permite escolher a versão compacta. Companheiro e objetos são carregados conforme entram na tela. Nenhum texto operacional é incorporado à ilustração. Se as imagens falharem, o componente mantém espaço, descrição e símbolo alternativo. Modo foco pode ocultar a arte sem ocultar ícones funcionais.

## Validação e limites

Testar desktop, 390×844, 320×568, fonte de 200%, retorno ao passo, conclusão/desfazer, busca vazia, teclado, foco, diálogo rolável, movimento reduzido, falha de imagem e navegação dos quatro ambientes. Conferir também todas as rotas e regras existentes após a extração do catálogo.

Não foi realizada pesquisa com participantes nesta etapa. A prévia não implementa persistência, economia, planejamento real de hoje, evolução do pet ou loja. Sua função é validar estrutura, linguagem visual, interação e orçamento das artes antes da integração.

Verificação local: lint aprovado, zero erros de tipos, os 51 testes de serviços existentes aprovados e build estático gerado. A suíte de produção passou em 38 cenários, incluindo 10 novos cenários de design em desktop e móvel. Depois da revisão visual, esses 10 foram repetidos com sucesso, incluindo a ação principal acima da navegação em 320×568. Permanecem os cinco avisos de captura inicial de propriedades já existentes. Não há certificação com leitor de tela ou aparelhos físicos nesta etapa.
