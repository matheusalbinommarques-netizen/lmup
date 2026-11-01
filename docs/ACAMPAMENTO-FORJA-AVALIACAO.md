# Primeira forja: avaliação do sprite no acampamento

## Escopo

PR #43, branch `feat/sanctuary-pan-zoom-lab`, rota `/laboratorio/acampamento`. Apenas o tipo forja recebeu sprite; uma segunda instância reutiliza o mesmo asset. Salão, armazém, terreno e árvores existentes foram preservados. Nenhum novo tipo de construção, economia, persistência ou biblioteca.

Câmera, limites, zoom, arraste, seleção e painel existentes foram mantidos. Não há conversão do mundo para outro motor ou reconstrução do mapa.

## Pesquisa e origem da arte

A busca no repositório não encontrou sprite de forja. `static/art/pilot/objects.webp` foi inspecionado: contém objetos decorativos, sem edifício. As paisagens existentes são fundos completos, inadequados como recorte reutilizável de construção.

Foi escolhido o sprite **Medieval Blacksmith (Isometric 2.5D)**, publicado por **feudalwars**, sob **CC0 1.0 Universal**, no [OpenGameArt](https://opengameart.org/content/medieval-blacksmith-isometric-25d). A [licença, URL original, hash e especificações](../static/art/lab/camp/LICENSE.md) ficam junto ao PNG. O arquivo foi preservado sem edição ou aumento de resolução. Não foi gerada arte definitiva.

## Contrato aplicado

- `src/lib/lab/campSprites.ts`: catálogo com URL, tamanho nativo 305×259, largura lógica 200, pivô de solo `(152,5; 249)` em pixels da fonte e footprint 192×96 (2:1). O pivô foi calibrado na integração, não fornecido pelo autor.
- `src/lib/lab/SceneSprite.svelte`: renderiza a imagem decorativa com alfa, posicionada pelo pivô, e um botão semântico sobre a base losangular. Pixels transparentes e telhado não capturam cliques: usar a base destacada ou o atalho. Seleção/foco aparecem na base e na etiqueta; falha de carregamento mostra aviso textual, sem voltar a uma casinha CSS.
- A sombra original está embutida no PNG e é reutilizada sem uma segunda sombra CSS sobreposta. Uma sombra independente em camada inferior depende de asset separado na próxima produção de arte.
- As duas instâncias usam o mesmo objeto do catálogo e o mesmo arquivo, em `(1170,700)` e `(1290,760)`. O deslocamento `(120,60)` acompanha um eixo projetado 2:1. IDs/nomes e seleção são independentes.
- Instâncias, árvores e edifícios legados compartilham o contexto do mundo e usam a base no solo para o `z-index`; árvores usam `y+86`, edifícios CSS existentes `y+82,5`, sprites o próprio `y` do pivô. O sprite da frente tem profundidade 760 e o de trás 700. HUD continua fora do mundo transformado.
- PNG compartilhado: uma requisição do asset em cada um dos três contextos de teste, sem cópias de arquivo, nova dependência ou atlas desnecessário.

## Validação executada

- ESLint direcionado aos arquivos alterados: passou.
- `npm run check`: zero erros e avisos.
- Um `npm run build`: passou. A prévia na porta 5175 permaneceu ativa durante o build; não se repetiu a queda anterior do watcher.
- `npx playwright test tests/e2e/camp.spec.ts --workers 2`: **4 testes aprovados em 4,8 s**, desktop e mobile. Cobre regressão de arraste sem seleção acidental, clique/toque seguinte, teclado, duas instâncias, asset compartilhado, seleção independente, sobreposição, profundidade e zoom máximo.
- Prévia dev em `http://127.0.0.1:5175/laboratorio/acampamento`: HTTP 200 e título/cena renderizados. Chromium em 1440×1000, 390×844 com DPR 2 e 320×740. Arraste, quatro atalhos anteriores mais Forja 2, zoom mínimo/máximo, roda em desktop, toque, centralização e limites nos dois eixos aprovados. Sem rolagem horizontal ou erros de console/página. IndexedDB bloqueado/monitorado: zero chamadas.
- Capturas revisadas em desktop, mobile e mobile/zoom máximo. A captura móvel usa o atalho Forja para enquadrar as duas instâncias, sem alterar a câmera inicial do produto. No enquadramento inicial o par pode ficar fora da tela estreita; os atalhos existentes levam até ele.
- Fluxo automatizado final dos três tamanhos: **9,24 s**, registrado no JSON. Não é benchmark de FPS, tempo total da tarefa ou medida de ganho. Não houve cronometragem exclusiva confiável de investigação e implementação. Browser integrado incompatível neste ambiente; usado Playwright já instalado, em contextos descartáveis.
- Sem suítes completas repetidas localmente. O resultado da CI do commit final é registrado na descrição do PR.

## Evidências

- [Desktop](forja-capturas/desktop.png)
- [Mobile, duas instâncias](forja-capturas/mobile.png)
- [Mobile DPR 2, zoom máximo](forja-capturas/mobile-zoom-max.png)
- [Resultados e métricas](forja-capturas/results.json)

## Limitações e próximo asset

Esta entrega demonstra renderização, reutilização e seleção; **a qualidade gráfica final não está aprovada**. A arte de construção é mais detalhada que o terreno e os elementos CSS provisórios. Iluminação, sombra e linguagem visual do conjunto ainda precisam ser harmonizadas. A ilustração 2,5D original foi preservada; a proporção 2:1 é explícita no footprint e posicionamento, sem afirmar uma calibração de câmera documentada pelo autor.

A imagem tem 305 px de largura. No zoom inicial renderiza 144 px CSS, suficiente aproximadamente para DPR 2; no máximo renderiza 300 px CSS, que exigiriam 600 px de fonte em DPR 2. A captura de zoom alto evidencia suavização. Não aumentar artificialmente a fonte para alegar mais detalhe. Uma futura forja no mesmo enquadramento, com largura real de ao menos 600 px (por exemplo 1024), pivô equivalente, footprint 2:1, alfa e sombra separada resolveria a limitação técnica de resolução. Antes da produção definitiva, aprovar essa amostra com o terreno, escala e iluminação desejados.

Toque emulado, sem validação em aparelhos físicos. Pinça não foi acrescentada. A sombra embutida não pode ser ordenada separadamente em sobreposições mais complexas. Não houve gargalo de renderização medido que justificasse introduzir PixiJS ou refatorar a câmera.

**PR #43 permanece em rascunho, sem merge, para avaliação visual do usuário.**
