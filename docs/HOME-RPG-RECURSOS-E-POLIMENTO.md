# Home RPG — auditoria e polimento visual

Data: 30/10/2026. Escopo: acabamento da composição existente, sem novos sistemas, alteração de persistência, economia ou fluxo de execução das missões.

## Diagnóstico

Os recursos atuais permitem construir a linguagem de interface da referência: molduras, botões com relevo, iluminação discreta, hierarquia tipográfica e HUD. Eles **não permitem reproduzir a composição artística com personagem e companheiro independentes**. O viajante está pintado dentro da paisagem; as ilustrações de companheiros foram preparadas para a coleção. O lobo auditado já tem transparência verdadeira, mas sua pose frontal e iluminação não combinam com a câmera do viajante. Transparência sozinha não resolve a composição. As pendências de arte estão separadas em [HOME-RPG-PRODUCAO-ARTISTICA.md](HOME-RPG-PRODUCAO-ARTISTICA.md).

| Recurso auditado  | Situação e decisão                                                                                                                                                                                                                                                                                                                                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fontes            | Georgia/Times nos títulos e Segoe UI/system no corpo. Georgia é uma boa alternativa de segurança, mas seu desenho e métricas variam conforme o sistema. Foi adicionada Cormorant Garamond variável 400–700, apenas para títulos, navegação e ações. Textos de apoio continuam sem serifa. Cinzel foi considerada para títulos curtos; sua aparência monumental aumentaria a densidade do menu, por isso não foi incluída. |
| Licença e offline | Cormorant sob SIL OFL 1.1, licença integral em `static/fonts/cormorant-garamond/OFL.txt`. Dois WOFF2 locais: Latin 37.640 bytes e Latin Extended 33.736 bytes. O navegador escolhe os subconjuntos necessários; ambos entram no pacote offline. Sem Google Fonts em tempo de execução; `font-display: swap` e Georgia como alternativa.                                                                                   |
| Cenário           | WebP 1536×1024, 412.520 bytes; variante 768×512, 115.552 bytes. Resolução suficiente para o painel nas duas larguras solicitadas, sem ampliar a imagem pequena artificialmente. A fonte é uma ilustração original gerada na sprint anterior, não a captura da referência.                                                                                                                                                 |
| Companheiros      | Exemplo lobo: original WebP 512×512, 38.774 bytes, variante 160×160, 7.256 bytes. O lobo possui canal alfa (sRGBA, imagem não opaca), confirmado na inspeção do arquivo. Adequado para retrato; sua pose frontal não foi composta para esta cena. A Home agora usa um retrato enquadrado junto à identificação do mundo. Nome e estágio vêm do companheiro realmente selecionado.                                         |
| Avatar            | Arte `heroi.png` 1024×1024, aproximadamente 1,50 MiB, é um retrato e não um corpo equipado. Não foi usada para fingir a aparência do personagem. Avatar escolhido pelo usuário e emblema provisório continuam válidos na HUD.                                                                                                                                                                                             |
| Cards             | Aventura e Projetos têm variantes 640×640, respectivamente 27.088 e 63.600 bytes. Atlas 768×512, 131.450 bytes. Refúgio usa as artes existentes de estágio, com variantes 600×400. Resolução suficiente para os cards; autoria visual heterogênea permanece uma limitação.                                                                                                                                                |
| Ícones            | SVGs nativos leves, sem biblioteca. Adicionados moeda e alimento; símbolos continuam auxiliares a rótulos legíveis. Detalhe metálico por cor, luz e sombra, sem filtros SVG pesados.                                                                                                                                                                                                                                      |
| Layout            | A grade permite o polimento sem reescrita. Painel de missões mantém rolagem interna e alturas alinhadas. Em janelas desktop baixas, a primeira faixa fica mais compacta. A página pode rolar para revelar os marcos; não foram comprimidos todos os textos para forçar uma tela única.                                                                                                                                    |

Fontes primárias para a fonte: [repositório Google Fonts](https://github.com/google/fonts/tree/main/ofl/cormorantgaramond), [licença OFL da família](https://github.com/google/fonts/blob/main/ofl/cormorantgaramond/OFL.txt). Downloads obtidos do serviço oficial Google Fonts; os arquivos ficam hospedados no próprio LMUP.

## Identidade reutilizável implementada

`src/lib/rpg-theme.css` concentra os materiais e estados. A classe optativa `rpg-theme` habilita a linguagem; as outras telas mantêm seu acabamento atual. Para uma próxima tela, basta importar a folha, aplicar a classe ao contêiner e usar os mesmos componentes/classes, sem copiar estilos da Home.

| Primitiva         | Contrato de uso                                                                                                                                                                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Moldura           | Elemento semântico com `rpg-frame` e `<RpgTrim />` dentro. Contorno externo bronze, linha interna, relevo, sombra de contato e quatro cantos SVG de tamanho fixo. Ornamentação não captura eventos nem entra na árvore acessível.          |
| Botão primário    | `Button` existente, variante `primary`, recebe o material em qualquer contêiner `rpg-theme`. Para um link reutilizável, usar `rpg-button`. Textura em gradiente, contorno iluminado, texto claro com sombra discreta, hover e pressionado. |
| Botão secundário  | `Button` existente, variante `secondary`, em um contêiner `rpg-theme`; fundo escuro com relevo leve. Estados selecionados continuam usando `aria-pressed` ou `aria-current`, além da diferença visual.                                     |
| XP e progresso    | Elementos `progress` nativos, com valor/máximo e nome acessível. Material dourado compartilhado, trilho escuro e relevo. Não são divs simulando barras.                                                                                    |
| HUD               | `HeroIdentity` preserva perfil, XP, recursos, conquistas e equipamentos reais; moldura do emblema e recursos recebem o novo material.                                                                                                      |
| Recursos          | `RpgResource.svelte`: valor, rótulo e ícone do catálogo. Moeda e alimento têm símbolos próprios; números tabulares. Recompensas nas missões continuam distinguindo prévia e registro.                                                      |
| Ornamentos/ícones | `RpgTrim.svelte` e `Icon.svelte`. Cantos não se esticam com a largura do painel. A mesma gravura aparece na sidebar, mundo, missões, destinos e marcos.                                                                                    |

Tokens principais: `--rpg-gold`, `--rpg-gold-bright`, `--rpg-line`, `--rpg-engraving`, `--rpg-panel`, `--rpg-radius`, `--rpg-depth`, `--rpg-bevel`, `--rpg-button-fill`, `--rpg-selected`, `--rpg-xp`. Os detalhes de composição ficam em `home.css`; os materiais ficam na folha compartilhada.

## Comparação com a referência

- Contornos: substituída a linha simples por contorno duplo e cantos gravados; brilho concentrado em ações, seleção e XP.
- Profundidade: painéis com sombra de contato, luz superior e interior escuro. Sidebar com seleção iluminada e ícones maiores, preservando os oito destinos.
- Tipografia: títulos mais elegantes e leves; corpo e metadados continuam legíveis. Rótulos das missões passam a usar a família de títulos em tamanho maior.
- Mundo/HUD: a transição para a faixa do personagem ganhou sombra e luz de contato. O companheiro deixa de simular um corpo colocado sobre o cenário e aparece como retrato assumido.
- Missões: cabeçalho mais expressivo, filtros com seleção em bronze, missão seguinte com iluminação lateral e marcadores enquadrados. Nenhum checkbox fictício foi criado.
- Destinos: mesma grade, acentos por destino, tratamento de imagem e ícones próprios. Aventura recebe imagem com topo arqueado; atlas recebe contorno mais quente; Refúgio conserva o estágio real. A unidade entre as artes ainda exige produção artística.
- Fidelidade: o acabamento de interface se aproxima da referência; a cena continua provisória, com viajante incorporado. Não se reivindica equivalência artística ou fidelidade pixel a pixel.

## Capturas e verificação

Capturas em `docs/home-rpg-polimento-capturas/`. Os arquivos `desktop-1440x900.png` e `desktop-1366x768.png` têm exatamente essas dimensões, escala de viewport 1 e fonte raiz 16px. As versões `-completa.png` mostram a continuação vertical. Dados das capturas são de uma base descartável de teste (32 missões), não da base pessoal.

A geração usa o Chromium dos testes do projeto porque a conexão do navegador integrado falhou antes de abrir uma página. Nenhum resultado de inspeção no navegador integrado é alegado.

Verificações: lint aprovado, Svelte com zero erros e zero avisos, 155 testes unitários aprovados, compilação estática/PWA aprovada e 164 testes de fluxo aprovados. A rodada focada de Home passou 8/8, com capturas em desktop/mobile, teclado, texto ampliado e alternativas de arte/fonte. A primeira tentativa com dois navegadores simultâneos excedeu o tempo de carregamento; o diagnóstico isolado abriu a Home sem erro de execução, e a execução sequencial passou. Não foi atribuída uma causa definitiva à lentidão inicial. A checagem PWA final passou **22/22**, incluindo carregamento explícito da fonte com acentos após recarregar sem conexão. Na primeira rodada, um teste de troca de versão excedeu 15 segundos; a rodada final completa passou sem mudar a lógica de atualização. O pacote essencial final tem 102 arquivos e 2.220.939 bytes (aproximadamente 2,22 MB), incluindo as duas fontes locais. O teste em 320px bloqueia fontes e artes para verificar alternativas, texto 200% e teclado.

Acessibilidade: foco visível preservado; nomes e semântica dos controles mantidos; ornamentos decorativos ocultos para leitores de tela. Modos de foco e baixo estímulo retiram sombras, filtros e ornamentos; movimento reduzido desabilita transições; cores forçadas mantêm contornos de sistema. Sem novas bibliotecas, animações permanentes ou chamadas externas em uso.

### Observação das capturas

| Aspecto          | 1440×900, 100%                                                                            | 1366×768, 100%                                                                                        |
| ---------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Primeira faixa   | Mundo e missões com a mesma base; altura de 496px.                                        | Mesma base; altura compacta de 432px.                                                                 |
| Destinos         | Quatro cards alinhados, espaço de 14px após a primeira faixa; ações visíveis.             | Quatro cards alinhados, mesmo espaço; ações visíveis no fim do viewport.                              |
| Continuação      | Cabeçalho dos marcos aparece na parte inferior; conteúdo completo por rolagem.            | Marcos abaixo da dobra; página continua rolável.                                                      |
| Tipo e contraste | Título em Cormorant, textos claros sobre painéis escuros, luz dourada nas ações e bordas. | Tamanhos de texto preservados; compactação incide principalmente sobre a cena e as imagens dos cards. |
| Arte             | Viajante incorporado à paisagem; companheiro em retrato enquadrado.                       | Mesmo tratamento, sem deslocamentos individuais para simular contato com o chão.                      |

As capturas completas também foram geradas para revelar os marcos fora do viewport. O documento não confunde viewport com captura de página inteira. Não foram executados testes de Safari, Firefox ou uma auditoria completa com leitor de tela nesta sprint.

Prévia local: http://127.0.0.1:5175/ (resposta HTTP 200 confirmada após a compilação final). Alterações disponíveis no checkout atual para revisão; nenhum envio ao repositório remoto foi realizado.
