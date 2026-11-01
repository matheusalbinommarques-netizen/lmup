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

## Casas de avaliação para salão e armazém — mapa integral

Autor: **feudalwars**, mesma coleção visual da forja. Fonte: https://opengameart.org/content/western-european-medieval-houses-isometric-25d . Licença declarada na página: **CC0 1.0 Universal** (https://creativecommons.org/publicdomain/zero/1.0/). Obtidos em 01/11/2026, sem recorte, edição, conversão ou ampliação do arquivo. Os nomes de uso no LMUP são contextuais; o autor os publicou como casas, não como um salão/armazém específico.

- `hall-feudalwars.png`: fonte https://opengameart.org/sites/default/files/house1_1.png; PNG RGBA 178×141, 51587 bytes, SHA-256 `0a8a8244b2b6a60083d7f7fea77d9ad19d2baa4a032a90eb8888dc818671342f`.
- `store-feudalwars.png`: fonte https://opengameart.org/sites/default/files/house1b.png; PNG RGBA 175×140, 49700 bytes, SHA-256 `08905b02276e3e14342039ce9641b0afe8717fa3324c53083646f42540aec6bb`.

Pivôs e footprints são calibrados na cena, não metadados do autor: salão 176×88 com contato (89,133) no PNG; armazém 152×76 com contato (87,5;132). Escalas de avaliação mantêm proporção original e sombra embutida. A resolução pequena limita nitidez em zoom alto/DPR 2; aprovação estética continua pendente.
