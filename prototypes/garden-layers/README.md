# Jardim da Árvore — prova de composição modular

Data: 03/11/2026. Branch: `feat/garden-layer-proof`. Prévia: http://127.0.0.1:5193.
Prova aprovada pelo usuário em 03/11/2026. A expansão autorizada foi implementada separadamente na branch `feat/camp-modular-continuation`; consulte [o relatório da continuação](../../docs/CAMP-MODULAR-20261103.md). Este documento registra o escopo e os resultados da prova original.

## Usar a prova

Os quatro botões simulam 0, 2.500, 7.500 e 12.000 XP. O campo “XP de teste” permite valores intermediários. Há comparação dos quatro estágios, acesso à referência original e inspeção com ocultação independente da árvore/sombra e vegetação. O hotspot abre informações sintéticas.

O XP começa em 12.000 e permanece apenas em memória. Recarregar retorna ao estágio 4. O estado da demonstração anterior e o progresso real não são consultados nem alterados.

No celular, a paisagem de 680 px permite deslocamento horizontal explicitamente indicado. O hotspot inicia visível e os controles ficam no fluxo da página. Sem animações contínuas nesta rodada; movimento reduzido respeitado.

## Como as camadas foram preparadas

As pinturas antigas tinham montanhas, cercas e caminhos diferentes. Não foram empilhadas como fundos alinhados.

1. **Fundo permanente:** imagem E original, 836 × 470 px.
2. **Reconstrução local:** o ImageGen integrado removeu a árvore. A edição completa alterava o entorno; por isso seu uso foi limitado por máscara SVG à região removida e ao interior do canteiro. O restante continua vindo da imagem aprovada.
3. **Árvores:** quatro PNGs transparentes preparados com ImageGen a partir das referências. Âncoras compensam as margens diferentes dos arquivos; a raiz permanece em 51,2% / 64,7% do cenário.
4. **Vegetação:** PNG próprio, somente plantas, crescendo em escala entre os estágios. Uma tentativa de reaproveitar uma faixa da pintura produzia solo duplicado e foi descartada.
5. **Sombra:** uma elipse suave de contato por árvore.
6. **Pedras e primeiro plano:** pixels da referência recuperados por máscaras fixas, preservando oclusão e posição. As runas originais aumentam de luminosidade.
7. **Interface:** botão HTML em 51,2% / 80,5%, acessível por teclado.

A correção do alpha acontece na renderização SVG e remove a névoa semitransparente de alguns recortes. Os PNGs gerados foram preservados. Não foi usado Python para preparar assets; Pillow/NumPy apenas leram capturas para comparar pixels.

### Referências por aparência

| Estágio        |     XP | Referência                                                                                       |
| -------------- | -----: | ------------------------------------------------------------------------------------------------ |
| Semente        |      0 | Germinação com duas folhas de `garden-seed.webp` antigo                                          |
| Brotinho       |  2.500 | Muda esparsa à direita da casa na captura anexada do Centro                                      |
| Árvore Jovem   |  7.500 | Árvore intermediária da pintura antiga chamada `garden-sprout.webp`, classificada pela aparência |
| Floresta Anciã | 12.000 | Árvore adulta da imagem E                                                                        |

As referências de apoio foram preservadas em `D:/Codex-artifacts/garden-layer-proof-20261103/source-art/`. Prompts completos: [ASSET-PROMPTS.md](ASSET-PROMPTS.md). Ferramenta: ImageGen integrado; sem CLI/API adicional.

## Avaliação e limites artísticos

- **Recortes:** a névoa foi removida; folhas residuais da árvore antiga detectadas na primeira captura foram corrigidas. O tratamento do alpha pode perder detalhes muito finos das folhas.
- **Sombras:** contato suave e único. Não há simulação física da sombra projetada pela copa.
- **Perspectiva:** raiz e hotspot seguem o mesmo referencial proporcional; pedras e primeiro plano ocluem os elementos.
- **Iluminação:** paleta dourada de pôr-do-sol pintada nos sprites, sem relighting dinâmico.
- **Fidelidade:** a extração assistida/generativa reinterpretou alguns galhos, folhagem e partes da silhueta adulta. **Não é um recorte pixel a pixel.** A distribuição das plantas também é aproximada.
- **Fundo reconstruído:** a região escondida pela árvore precisou ser inferida. O teste de continuidade não comprova a geografia originalmente oculta.
- **Resolução:** a base aprovada tem 836 × 470 px e fica mais suave que os sprites em telas grandes.
- **Peso:** 11 assets públicos, 11.124.488 bytes (10,6 MiB). PNGs mantidos para avaliação; os quatro estágios são preparados para comparação imediata e cache offline.

A técnica é viável nesta prova, com ressalvas de fidelidade artística. Não está homologada para expansão automática.

## Arquitetura e isolamento

Compositor Svelte declarativo, com fundo, camadas, máscaras, ordem de profundidade, âncoras e hotspot. Usa as dependências existentes; nenhum motor 3D ou editor foi acrescentado.

A projeção usa a função canônica `getEcoStageForTotalXp`, sem modificar faixas ou bônus. A entrada Vite é independente do layout e da inicialização do LMUP; não abre IndexedDB nem grava storage ou concede recompensas.

A porta 5193 é exclusiva da prova. A origem instalada 5174 foi preservada. O cache offline contém apenas o shell e os recursos da prova.

## Testes executados

- **12 testes unitários passaram:** limites, invariantes de cenário/âncoras, sprites distintos, ocultação, amostras inválidas e ordenação sem mutação.
- **10 verificações de navegador passaram:** estágios, XP, hotspot, inspeção, comparação/referência, teclado, movimento reduzido, isolamento/erros/recursos externos, offline/recarga e celular.
- **1 teste adicional passou:** fechar e reabrir o Chromium de teste já offline, em perfil exclusivo no D:, e trocar estágios.
- **Pixels:** cenas 1 e 4 com 1.338 × 753 px; zero pixels alterados fora da região dinâmica, com tolerância de 2 níveis por canal. Nascente, ruínas, caminho lateral e primeiro plano: zero.
- **Svelte/TypeScript:** 0 erros e 0 avisos. **ESLint:** arquivos finais passaram. **Build isolado:** passou.
- Suíte completa e build completo do LMUP não foram executados.

Pixels medem estabilidade entre estágios, não aprovação artística ou fidelidade da reconstrução à geografia oculta.

A conexão com o navegador integrado falhou. A validação usou Chromium/Playwright instalado, em contextos e perfil isolados. Celular: viewport de 390 × 844, não aparelho físico.

Resultados em `D:/Codex-artifacts/garden-layer-proof-20261103/`: `browser-tests.json`, `offline-restart.json`, `pixel-comparison.json`.

## Capturas

Pasta: `D:/Codex-artifacts/garden-layer-proof-20261103/captures/`.

- `comparacao-quatro-desktop.png`
- `stage-1-scene.png` a `stage-4-scene.png`
- `stage-1-desktop.png` a `stage-4-desktop.png`
- `mobile-390.png`
- `base-sem-arvore.png`
- `inspecao-camadas.png`
- `referencia-aprovada-desktop.png`
- `offline-apos-reabrir.png`

## Reproduzir

No checkout `D:/Projetos/Level Me Up`, com dependências já instaladas:

```powershell
$env:TEMP = 'D:\Codex-storage\tmp'
$env:TMP = $env:TEMP
node node_modules/vitest/vitest.mjs run src/lib/scenes/gardenProof.test.ts
node node_modules/vite/bin/vite.js build --config prototypes/garden-layers/vite.config.ts
node prototypes/garden-layers/serve.mjs
```

Com o servidor aberto, em outro terminal:

```powershell
node prototypes/garden-layers/validate.mjs
node prototypes/garden-layers/restart-offline.mjs
& 'C:\Users\mathe\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' -B prototypes/garden-layers/compare_pixels.py
```

## Arquivos adicionados

- `src/lib/scenes/LayeredScene.svelte`, `sceneTypes.ts`, `gardenProof.ts`, `gardenProof.test.ts`.
- `prototypes/garden-layers/App.svelte`, `main.ts`, `index.html`, `vite.config.ts`, `serve.mjs`.
- `prototypes/garden-layers/validate.mjs`, `restart-offline.mjs`, `compare_pixels.py`.
- `prototypes/garden-layers/README.md`, `ASSET-PROMPTS.md`.
- `prototypes/garden-layers/public/assets/`: sete PNGs e quatro máscaras SVG.

Sem alterações no Centro, Aposentos, regiões ou serviços de economia/persistência. Sem commit, push, merge ou publicação.
