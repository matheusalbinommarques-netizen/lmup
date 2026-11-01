# Assets da pequena região da forja

Obtidos em 01/11/2026. Autor: **rubberduck**. Nenhuma imagem foi recortada, repintada, redimensionada ou convertida; o atlas e os PNGs selecionados permanecem intactos. As transformações de escala, transição de borda e sombra são feitas na composição da cena.

## Terreno — CC0 1.0 Universal

- Origem: https://opengameart.org/content/isometric-ground-tiles
- Download: https://opengameart.org/sites/default/files/ground_tiles_sheets.zip
- Licença declarada na página: https://creativecommons.org/publicdomain/zero/1.0/
- `grass_medium_128x64.png`: 1024×448 RGBA, 486.631 bytes; SHA-256 `a5820eaacde5885688c7f8ae8b0e28a619412a893f1a9d99def017de6e40e205`.
- `dirt_128x64.png`: 1024×448 RGBA, 472.513 bytes; SHA-256 `a591bca902803f44c2a03329e42806b20a6ed5ce69769d4cc080a1820e188255`.
- Folhas com células nativas 128×64 (2:1), 20 variações cheias e bordas de transição com alfa. Renderizadas a 64×32 unidades de mundo. Pixels externos transparentes verificados.

## Árvores selecionadas — CC0 conforme licença por arquivo do autor

- Origem: https://opengameart.org/content/isometric-trees-0
- Download: https://opengameart.org/sites/default/files/isometric_trees_pack.zip
- Arquivos exatos: `single/trees_128x64_no_shadow/trees_128x64_no_shadow-30.png` e `trees_128x64_no_shadow-36.png`.
- O pack agrega materiais sob licenças diferentes. A página informa essa distinção e remete à licença interna. A cópia integral está em [trees-pack-license.txt](trees-pack-license.txt): os índices **30–69** e **76–84** são identificados pelo autor como criação própria **CC0**. Somente os índices **30 e 36** foram incluídos. As árvores mortas 70–75 sob CC-BY-SA 3.0 **não foram incluídas**.
- `tree-30.png`: 384×768 RGBA, 121.535 bytes; SHA-256 `46156dd8e13b2d5027526c7d48fa7c3e34274589db4af33f4985787f7ef9d358`.
- `tree-36.png`: 384×768 RGBA, 88.071 bytes; SHA-256 `c626a322b727abb21558cb304a9241095d4e43dd8c0e3ea732f105a907438fcc`.
- Arquivos renomeados, com bytes preservados. Variante sem sombra para permitir sombra separada, projetada sobre o solo e ordenada abaixo dos objetos. Alfa externo verificado.

## Compatibilidade avaliada

O terreno e a vegetação vêm do mesmo autor e da mesma família isométrica para Flare, usando base 128×64 e aparência texturizada. A compatibilidade com a forja 2,5D de feudalwars foi revisada na composição, sem usar pacotes cartoon/pixel art diferentes só para ocupar espaço. Isso é uma avaliação visual, não aprovação estética definitiva nem alegação de que todos os autores usaram a mesma câmera ou luz original.

Os arquivos de ambiente somam **1.168.750 bytes**. Há quatro arquivos gráficos, reutilizados nas células, nas três árvores e em suas sombras. Os arquivos ZIP completos ficaram fora do repositório. A origem/licença da forja permanece em [../LICENSE.md](../LICENSE.md).
