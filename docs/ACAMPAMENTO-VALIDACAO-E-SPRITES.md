# Acampamento: validação e próximo incremento visual

## Entrega técnica do PR #43

Branch existente `feat/sanctuary-pan-zoom-lab`; prévia em `http://127.0.0.1:5175/laboratorio/acampamento`, no checkout `implementacao-e2`. Sem merge e sem alterações na origem instalada 5174, economia ou persistência.

- O commit inicial `e767462` tinha `verify (22)` e `verify (24)` aprovados. Após as correções abaixo, conferir a CI do novo commit; a descrição do PR registra o resultado final.
- Falha reproduzida: a flag `moved` continuava verdadeira após arrastar e bloqueava a próxima seleção. Removida a flag residual; a captura do ponteiro já direciona a soltura do arraste à viewport, evitando seleção acidental. Novo teste cobre soltura sem seleção, clique/toque seguinte e seleção por teclado, em desktop/mobile.
- ESLint direcionado, `npm run check`, um build e teste E2E direcionado aprovados. Não foram executadas suítes completas localmente.
- Chromium descartável: 1440×1000, 390×844 e 320×740. HTTP 200, arraste, seleção direta após arraste, quatro atalhos, zoom por botões (limites 0,45–1,5), roda em desktop e centralização aprovados. Conferidos enquadramento horizontal/vertical e centralização quando o mapa fica menor que a viewport. Sem rolagem horizontal ou erros de console/página. IndexedDB bloqueado e monitorado: zero chamadas.
- Toque emulado, sem aparelhos físicos. Zoom móvel por botões; pinça não implementada. Não há benchmark de FPS ou memória que justifique trocar o renderizador.
- [Captura desktop](acampamento-capturas/desktop.png) e [métricas dos três tamanhos](acampamento-capturas/results.json). Execução final dos três contextos: 6,85 s; E2E direcionado: 2,9 s. Estes números não incluem investigação, correções nem CI e não demonstram ganho de desempenho.

## Prévia confiável: causa e correção

No início da correção de acesso não havia processo escutando em 5175. A rota existia no checkout correto. Não há evidência suficiente para atribuir o 404 anterior a um PID/checkout específico: o processo já não existia. O link anterior foi entregue sem uma garantia durável de servidor ativo e de rota validada no checkout anunciado.

Durante esta validação foi observada outra falha concreta: o Vite encerrou com `EBUSY` ao observar `build/art/items/reliquia-do-cofre-infinito.png` enquanto o build escrevia os arquivos de saída. `build/` agora é excluído da observação do servidor de desenvolvimento. Evitar build e Vite concorrentes no mesmo checkout quando houver disputa de arquivos gerados; não foi executado outro build só para tentar provocar novamente a falha.

Inicialização permanente no Windows, a partir deste repositório:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/preview-lab.ps1
```

O comando verifica branch e existência da rota, recusa 5174 e portas ocupadas (mostrando o processo, sem encerrá-lo), inicia o servidor oculto, aguarda HTTP 200 e registra diretório, branch, commit, estado sujo, PID e URL em `%TEMP%/lmup-preview-5175/preview.json`. Logs ficam na mesma pasta. Pode-se escolher outra porta com `-Port 5176`; não há troca automática de branch nem descarte de alterações locais. Inicialização positiva e recusas de 5174/5175 ocupada foram verificadas.

HTTP 200 de um shell não comprova a renderização Svelte: antes de entregar uma prévia, abrir a rota exata no navegador, confirmar o título esperado, testar uma interação, verificar o console e anexar uma captura. Não divulgar apenas a URL-base nem reutilizar a confirmação de outro protótipo. O Browser integrado falhou por incompatibilidade do ambiente; nesta tarefa foi utilizado o Playwright já instalado.

## Recomendação: Svelte com sprites em camadas

Manter a câmera atual como transformação única do mundo. O catálogo atual já centraliza identidade, posição e seleção; o próximo incremento deve trocar apenas a apresentação do edifício por imagem transparente, mantendo HUD e botões semânticos em Svelte. A qualidade visual depende da coerência das artes, independentemente do renderizador.

| Tema                   | Svelte + imagens                                                                   | PixiJS                                                                                               |
| ---------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Câmera                 | Reutiliza `translate`/`scale` do mundo e limites atuais                            | Um `Container` do mundo recebe posição/escala equivalentes; requer adaptar o renderizador            |
| Posição e profundidade | Coordenadas projetadas, pivô de base e ordenação por profundidade no catálogo      | Mesmo modelo de posição/pivô e ordenação; o motor não resolve sozinho a oclusão isométrica           |
| Interação              | Botões, foco e painel existentes                                                   | Hit areas/eventos no canvas; preservar painel e acesso por teclado no DOM                            |
| Desempenho             | Poucos objetos e uma transformação; medir imagens decodificadas e custo de pintura | Batching de sprites e atlas, grupos de renderização e culling podem ajudar em cenas maiores/animadas |
| Novo edifício          | Um registro de catálogo e um asset conforme contrato                               | Um registro e textura, mais gerenciamento de carregamento/ciclo de vida                              |

Não há gargalo medido de renderização nesta cena com quatro espaços e vinte árvores. Portanto, não instalar PixiJS agora. Reavaliar se uma cena representativa, com os mesmos assets e densidade esperada, exceder o orçamento de frames no aparelho-alvo ou exigir muitas animações/partículas. Definir antes a meta (por exemplo 60 Hz/16,7 ms por frame), medir percentis, frames longos, memória e carga; comparar implementações equivalentes. Contagem de objetos isolada não decide a migração.

A documentação oficial do PixiJS descreve [containers e transformações](https://pixijs.com/8.x/guides/components/scene-objects/container), [sprites e âncoras](https://pixijs.com/8.x/guides/components/scene-objects/sprite) e [batching, atlas e compromissos do culling](https://pixijs.com/8.x/guides/concepts/performance-tips). CSS transformado cria contexto de empilhamento; organizar elementos que precisam se intercalar como irmãos da mesma camada de objetos ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Positioned_layout/Stacking_context)).

## Contrato técnico antes de produzir artes

Proposta para aprovar antes da primeira arte de avaliação, ainda sem gerar assets definitivos:

- Projeção dimétrica 2:1, orientação e iluminação únicas; referência do terreno em losangos de 128×64 unidades de mundo. Se necessário usar grade lógica `(u,v)`, projetar para `(x,y)=((u-v)×64,(u+v)×32)` mais a origem do mapa. Não misturar projeção real e imagens com perspectiva incompatível.
- Catálogo por tipo: imagem, dimensões lógicas, pivô de contato com o solo, footprint, polígono de clique e escala. Instâncias guardam apenas ID, tipo, posição e estado em memória. O mesmo contrato deve servir a um futuro adaptador PixiJS.
- Pivô comum na base do footprint; sombra alinhada ao solo. Não usar o centro da imagem nem a borda do telhado para posicionar/ordenar. Estados de uma construção compartilham pivô e footprint para evitar saltos.
- Terreno/caminhos abaixo; sombras abaixo dos objetos; árvores e edifícios na mesma camada, ordenados pelo contato frontal com o solo em Y e desempate estável. HUD fora do mundo transformado. Objetos muito extensos, paredes ou pontes podem exigir sprites divididos e ordenação mais rica; registrar como evolução posterior.
- Arquivos PNG ou WebP com alfa, sem fundo, texto ou UI incorporados. Sprite visual com `pointer-events: none` e área de seleção explícita no footprint para não capturar cliques no retângulo transparente.
- Resolução de exportação calculada por largura lógica × zoom máximo × DPR-alvo. Exemplo: 256 unidades × 1,5 × DPR 2 = 768 pixels; avaliar uma fonte de 1024 px, sem ampliar artificialmente um original menor. Validar nitidez e memória em celular antes de replicar o padrão.

## Menor próximo incremento

Uma única forja pronta, com sprite de avaliação bem acabado, sombra e base coerentes sobre um pequeno trecho de terreno compatível. Manter as interações já aprovadas. Reutilizar o mesmo sprite numa segunda instância apenas para comprovar o catálogo, sem produzir outra arte; testar sobreposição com um elemento de referência, seleção, zoom mínimo/máximo e celular. Aprovar escala, perspectiva, iluminação, nitidez e contato com o chão antes de criar estágios, outros edifícios ou arte definitiva. Não iniciar economia, persistência, migração gráfica ou dezenas de construções.

## Próximas economias de trabalho

1. Executar a prévia pelo comando verificado e entregar sempre URL + branch/commit + captura após interação.
2. Rodar `camp.spec.ts` para regressões da câmera; deixar a suíte completa para a CI obrigatória ou mudanças que justifiquem cobertura maior.
3. No teste móvel, manter uma modalidade de entrada: usar toque em controles e mapa; misturar mouse com toque no mesmo gesto suprimiu o clique de compatibilidade no ambiente emulado e consumiu diagnóstico desnecessário.
4. Aprovar o contrato de assets e uma única construção antes da produção de uma coleção. Não confundir melhoria de arte com troca de motor.
5. Registrar separadamente qualquer proposta maior: pinch zoom, zoom ancorado no cursor, culling, atlas, sprites divididos ou PixiJS. Implementar somente quando critérios/medições justificarem.
