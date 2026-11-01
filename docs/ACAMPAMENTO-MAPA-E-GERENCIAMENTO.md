# Mapa integral e gerenciamento — PR #43

## Como avaliar

Prévia: `http://127.0.0.1:5176/laboratorio/acampamento`, branch `feat/sanctuary-pan-zoom-lab`. O PID 10672, iniciado anteriormente por `scripts/preview-lab.ps1 -Port 5176`, continua servindo este checkout. O JSON do inicializador registra o commit no início do processo; o commit atual é informado na descrição do PR após a validação da URL. A porta 5175 foi preservada; nenhuma alteração na instalação 5174, main ou dados pessoais.

1. Explore arrastando, use zoom e **Locais** para Praça, Forjas, Lago ou Clareira sul.
2. Abra **Construir → Forja**, escolha um ponto no solo e confirme. Verde indica posição livre, vermelho indica colisão/limite. Arraste só move a câmera. Setas, Enter e Esc funcionam com foco no terreno.
3. A nova forja aparece **em construção**, com base tracejada, sprite atenuado e marcador de obra. Selecione diretamente a base e use **Concluir construção** para passar a **concluído**.
4. Use **Mover**, escolha outra posição e confirme. A instância original fica atenuada até confirmar; cancelar preserva sua posição e estado. A colisão exclui apenas a instância movida, mantendo as outras bases como obstáculos.
5. **Remover → Confirmar remoção** retira apenas a instância selecionada. **Manter construção** cancela. Marcador de terreno vazio desaparece enquanto sua base estiver ocupada e retorna quando liberada.

Tudo fica em memória; recarregar restaura o cenário inicial.

## Mapa e arquivos

- `campRegion.ts`: mapa 1850×1400, células dimétricas 2:1, percursos, quatro materiais, 24 árvores e quatro locais fixos. Vegetação concentrada nas bordas; áreas centrais/sul continuam livres. Sem árvores circulares, estradas planas CSS ou ilha detalhada isolada.
- `TerrainRegion.svelte`: compõe grama, terra, solo de bosque e areia a partir de atlas reutilizáveis. Máscaras suaves integram estradas e regiões. Lago com contorno irregular, margem texturizada e água procedural determinística. As células são pintadas uma vez em canvas 2D; árvores, sombras e edifícios continuam elementos separados, ordenados pelo contato no solo e movidos pela câmera existente. Não é uma imagem pronta do mapa inteiro e não há engine nova.
- `campSprites.ts` e `SceneSprite.svelte`: salão/armazém CSS substituídos por duas casas da mesma coleção da forja; estados de obra/pronto preservam pivô, escala e área ocupada. O marcador de obra é indicação de estado, não um sprite definitivo de construção.
- `campConstruction.ts`: catálogo com apenas forja, instâncias e operações imutáveis de mover, concluir e remover. Nome, finalidade e sprite do novo item vêm do catálogo. `campPlacement.ts` mantém colisão por polígonos; mensagem agora usa “construção”, pois mover também serve ao salão/armazém.
- Rota: catálogo, posicionamento, painel contextual e remoção com confirmação. A lista crescente de nomes foi retirada. **Locais** tem quatro entradas fixas, fecha após navegar e não substitui a seleção direta. Painel tem altura limitada/rolagem no celular; confirmar/cancelar mantêm a correção de linha da entrega anterior.

[Licenças e hashes dos edifícios](../static/art/lab/camp/LICENSE.md) · [Terrenos e árvores](../static/art/lab/camp/region/LICENSE.md). Recursos novos: duas casas CC0 de feudalwars e dois atlas CC0 do mesmo pack de rubberduck já usado. PNGs originais preservados, resolução/alfa/perspectiva revisados antes da integração.

## Validação executada

- ESLint direcionado aprovado. Svelte check: zero erros e zero avisos.
- Sete testes Vitest aprovados, **1,02 s**: geometria/limites e operações de estado, movimentação sem mutar origem, remoção individual, catálogo de terreno e clareira livre.
- Um build local aprovado; oito testes do acampamento no build aprovados em **16,5 s**. Sem suítes completas locais repetidas. Ajustes posteriores apenas em mensagem genérica/nome de catálogo foram verificados na prévia; CI valida o commit final.
- Mesmo arquivo Playwright executado na URL efetiva: oito cenários aprovados em **21,1 s**, com desktop 1440×1000, toque emulado 390×844/DPR 2 e 320×740 e mouse em 320 px. Capturas em diferentes locais/zoom; solo opaco amostrado até as bordas, árvores carregadas/ordenadas, seis recursos de ambiente carregados uma vez por contexto. Sprite das duas forjas compartilhado.
- Jornada: catálogo, duas novas forjas, base válida/inválida, nascimento em obra, conclusão, seleção direta de antigas/novas, mover com confirmação e cancelamento, colisão contra outra construção, remover/manter, terreno vazio ocupado/liberado, cancelar colocação, teclado e limite. Arraste sem confirmação/reposicionamento acidental, zoom 0,45–1,5, centralização e câmera mantidos. Sem lista crescente, rolagem horizontal, erros de console/página ou chamadas ao IndexedDB, bloqueado e monitorado em contextos descartáveis.
- Browser integrado já incompatível nesta sessão; utilizado Playwright instalado, sem bibliotecas novas. Aparelhos físicos/pinça não certificados. Resultado obrigatório da CI do commit final registrado no PR, que permanece em rascunho sem merge.

[Mapa desktop](acampamento-integral-capturas/desktop-mapa.png) · [Lago](acampamento-integral-capturas/desktop-lago.png) · [Obra no celular](acampamento-integral-capturas/mobile-construcao.png) · [Mover em 320 px](acampamento-integral-capturas/mobile-320-mover.png) · [Mover desktop](acampamento-integral-capturas/desktop-mover.png) · [Após remoção](acampamento-integral-capturas/desktop-removida.png).

## Gargalos e melhorias

A primeira revisão mostrou degraus evidentes nos caminhos e margem do lago ao extrapolar a classificação por célula. Substituídos por máscaras suaves sobre os mesmos atlas texturizados, sem criar uma nova imagem gigante nem redesenhar cada região. Um único canvas de chão evita multiplicar os elementos DOM por todas as células; uma superfície temporária é reutilizada para os três materiais adicionais. A câmera não repinta esse chão durante os gestos. Não foi medido nem alegado ganho de FPS.

A barra de atalhos crescia a cada instância; o painel de ações e os quatro locais fixos eliminam esse crescimento. Colisão usa o footprint do catálogo também nos edifícios antes feitos em CSS. Estados e operações reutilizam o mesmo renderizador e são testados separadamente. Testes existentes foram adaptados às novas jornadas e reutilizados na prévia, evitando um segundo roteiro manual divergente. Tempos acima são de testes, não de desenvolvimento total; não há medições exclusivas das fases de investigação/implementação/espera de CI.

## Limitações

Aprovação visual/funcional permanece com o usuário. Artes ainda são de avaliação; casas representam provisoriamente os papéis de salão/armazém. Fontes pequenas suavizam no zoom máximo/DPR 2. Água e marcador de obra são composição procedural, sem animação ou estágios artísticos definitivos. Colisão considera bases de edifícios e limites, sem regras de ocupação de água/vegetação. Footprints são calibrações lógicas, não medição automática da arte; telhados/sombras podem passar da borda. Sem economia, XP, recompensa, produção, NPC, persistência ou integração ao Santuário real.
