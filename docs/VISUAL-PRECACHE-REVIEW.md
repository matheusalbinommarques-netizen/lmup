# Recursos visuais e orçamento offline

Referência: build de validação com 246 entradas e 15.690.714 bytes (15,69 MB decimais). O total de código compilado pode variar alguns bytes entre revisões.

| Grupo                                   |     Bytes | Necessidade offline / decisão neste lote                                                                                             |
| --------------------------------------- | --------: | ------------------------------------------------------------------------------------------------------------------------------------ |
| Código, fontes e recursos preexistentes | 2.661.199 | Funcionamento, navegação e experiência offline existentes; preservar.                                                                |
| 114 PNGs de ícones e navegação          | 1.684.477 | Controles e biblioteca completa de 53 escolhas em 64/128, inclusive primeira abertura sem rede; preservar.                           |
| Panorama de Hoje                        | 1.879.710 | Identidade aprovada da primeira tela offline; preservar.                                                                             |
| Pintura do mapa                         | 2.418.834 | Mapa existente e primeira visita offline, já verificados; preservar.                                                                 |
| Pinturas Aventura, Refúgio e Projetos   | 7.046.494 | Decorativas; candidatas futuras a carregamento sob demanda, mas atualmente integram a experiência offline aprovada; preservar agora. |

Os 119 arquivos gráficos aprovados somam 13.029.515 bytes. A distribuição contém somente o subconjunto utilizado, e não os 295 PNGs recebidos nem variantes 256/512, chips, originais duplicados ou artes do acampamento. As cinco pinturas WebP mantêm dimensões e pixels RGBA dos PNGs fornecidos. Não se reduziu resolução nem qualidade.

O cache runtime de arte já existente aceita no máximo 1 MiB por resposta e 60 entradas; cada pintura supera esse limite. Simplesmente retirá-las do precache não garante seu armazenamento nem após uma visita online. Também deixa a primeira navegação offline sem essas imagens. Portanto, este lote mantém os recursos explicitamente precacheados e o limite anterior de 3 MiB por arquivo. Não se deve chamar todo esse volume de essencial à lógica do aplicativo: cerca de 7,05 MB são pinturas decorativas identificadas como oportunidade de otimização.

Uma futura redução exige decisão separada sobre a fidelidade offline: derivados menores com comparação visual ou uma política explícita de armazenamento e disponibilidade. Ela deve validar instalação nova, todas as seis telas, ícones ainda não usados, mapa, atualização entre abas e falta de espaço. Nenhuma dessas mudanças de política foi introduzida nesta integração.

O manifesto `static/art/approved/manifest.json` registra caminhos de procedência e SHA-256. O README registra a autorização de uso das artes fornecidas no LMUP; não inventa autor ou licença de redistribuição ampla. A comprovação documental de autoria/licença individual permanece uma limitação para distribuição além desse contexto.
