# Sprite de avaliação da forja

- Obra: **Medieval Blacksmith (Isometric 2.5D)**.
- Autor/publicador: **feudalwars**; originalmente criado para Feudal Wars.
- Página de origem: https://opengameart.org/content/medieval-blacksmith-isometric-25d
- Arquivo original: https://opengameart.org/sites/default/files/blacksmith_0.png
- Licença declarada pelo autor: **CC0 1.0 Universal**.
- Licença: https://creativecommons.org/publicdomain/zero/1.0/
- Código legal: https://creativecommons.org/publicdomain/zero/1.0/legalcode
- Obtido em 01/11/2026. Arquivo preservado sem edição, recorte, conversão ou aumento de resolução; apenas renomeado para `forge-feudalwars.png`.
- SHA-256: `bfb845d5c31c3f90b0fe13478a988b582797e12b0c2f9d1fae38a18704dfad2b`.
- 305 × 259 px, PNG RGBA, 135.040 bytes. Transparência e sombra originais preservadas.

O crédito é mantido para rastreabilidade, sem sugerir aprovação ou vínculo do autor com o LMUP. Esta integração é uma avaliação gráfica, não a definição da direção de arte final.

O pivô e a área ocupada em `src/lib/lab/campSprites.ts` foram calibrados para esta integração; não são metadados fornecidos pelo autor. A base lógica usa losango 192 × 96 (2:1); o PNG não foi deformado para impor essa proporção à ilustração.

Limitação conhecida: largura de 200 unidades do mundo, renderizada a 144 px no zoom inicial e até 300 px no zoom máximo. A fonte de 305 px atende aproximadamente a esse máximo em DPR 1, mas não cobre os 600 pixels necessários em DPR 2. A suavização em zoom alto/alta densidade exige uma futura arte de maior resolução, com o mesmo pivô e perspectiva. Não ampliar artificialmente este arquivo nem declarar a nitidez final aprovada.
