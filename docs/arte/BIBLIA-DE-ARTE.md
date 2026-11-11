# Bíblia de arte do LMUP

Rascunho de 11/11/2026, para revisão do autor. Vale para toda arte **nova**, seja ela feita à mão, encomendada ou gerada. Não muda nenhuma arte existente. Nomes, lugares e lore continuam provisórios.

## 1. Direção em uma frase

**Pintura digital de fantasia épica, madura e acolhedora, com luz quente contra sombras frias.** É um estilo só, ancorado nas telas de produtividade (Hoje, Missões, Progresso). No Mundo e no Acampamento a técnica não muda. O que muda é a luz e a paleta de cada lugar do mapa.

Referências do certo, já aprovadas:

- `static/art/approved/paintings/01_Hoje_Vedria_panorama.webp`: luz de cobre do pôr do sol, sombras azul-noite e verde-escuro, textura de pedra e tecido;
- `static/art/approved/paintings/03_Cartao_Refugio.webp` e `05_Cartao_Mapa.webp`: a mesma luz em acampamento e paisagem;
- `static/art/companions-v2/wolf-*.webp`: personagem isolado, pintado, de leitura clara.

## 2. O que é fixo e o que varia por lugar

| Fixo em todo o app                                                     | Varia conforme o lugar do mapa                          |
| ---------------------------------------------------------------------- | ------------------------------------------------------- |
| Técnica pintada, pinceladas suaves, detalhe contido                    | Hora do dia e direção da luz                            |
| Contorno pelo valor (claro/escuro), sem traço preto de desenho animado | Paleta dominante (areia, neve, floresta, pântano)       |
| Proporções humanas naturais; rosto do herói nunca definido             | Clima e atmosfera (poeira, névoa, chuva)                |
| Fundo de cena com profundidade atmosférica                             | Arquitetura e vegetação locais                          |
| Sem texto, letras, números ou interface pintados na arte               | Quanto da cena é escura: o deserto é claro e ensolarado |

Regra prática: **o lugar decide a luz; a técnica e as regras de personagem nunca mudam.** Um deserto ao meio-dia pode ser claro e saturado, desde que continue pintado do mesmo jeito que o panorama de Hoje.

## 3. Paleta

**Interface (produtividade), já definida em `src/lib/design-system.css`:** fundo `#121b20`, superfícies `#1c292e`/`#24343a`, texto `#f1ede2`, ação dourada `#e8ad57`, positivo `#7bc4b1`, descoberta `#c0afd9`.

- Arte que fica atrás da interface deve ter sombras próximas de `#121b20`, para o texto continuar legível, e evitar regiões claras onde há texto por cima.
- **Dourado é escasso:** reservado a ação principal, recompensa e conquista (decisão DP7). Molduras e ornamentos novos usam metal envelhecido ou pedra; nada de dourado brilhante por padrão.

**Cenas do mapa, um ponto de partida por bioma** (a confirmar quando houver arte):

| Bioma                  | Luz                          | Dominantes                         |
| ---------------------- | ---------------------------- | ---------------------------------- |
| Vale e cidade (padrão) | Pôr do sol, cobre            | Azul-noite, verde-escuro, cobre    |
| Deserto                | Meio-dia ou tarde, sol forte | Areia, ocre, céu turquesa pálido   |
| Floresta               | Luz filtrada                 | Verdes, musgo, feixes dourados     |
| Montanha e neve        | Manhã fria                   | Branco-azulado, cinza, lilás       |
| Pântano e ruínas       | Crepúsculo, névoa            | Verde-oliva, roxo, luz de lanterna |

## 4. Personagens

- **Herói:** a imagem do herói é a que o usuário enviar. Sem imagem enviada, aparece a silhueta encapuzada (`static/art/approved/icons/heroi/`), que é só o padrão. O app não oferece galeria de retratos (decisão DP3). Em cenas, o herói ou viajante é anônimo, de capuz ou visto de costas, com rosto oculto.
- **Viajante de cena:** capa de lã cinza-carvão, sem armadura nem arma, adulto, cerca de 1/3 da altura da imagem (como no panorama de Hoje).
- **Companheiros:** corpo inteiro, três quartos voltado à direita, fundo transparente. Cada estágio é mais maduro que o anterior, com a mesma identidade (cor, marca e olhos).
- **Evitar:** personagens ou arquitetura que lembrem jogos e marcas existentes; violência gráfica; sexualização; humor de desenho animado.

## 5. Formatos técnicos

| Tipo                   | Origem              | Entregue no app                     | Fundo        |
| ---------------------- | ------------------- | ----------------------------------- | ------------ |
| Cena / pintura         | 1536×1024 (3:2)     | WebP, variantes por largura de tela | Opaco        |
| Fundo de tela          | Até 1920 de largura | WebP, ≤ 400 KB por variante [meta]  | Opaco        |
| Personagem/companheiro | 1024 px             | WebP 160, 320 e original            | Transparente |
| Ícone                  | 512 px              | PNG 64 e 128                        | Transparente |

- Gerar todos os tamanhos a partir de uma única arte-fonte, nunca ampliando (regra de `docs/arte/MARCA.md`).
- Ícones não levam texto dentro: o rótulo vem da interface. Os ícones aprovados que já têm rótulo pintado ficam como estão.
- Deixar área calma onde a interface põe título e faixa de status.
- Arte nova que precisa funcionar offline entra no pré-cache com o peso medido.
- Originais em alta resolução ficam com o autor, fora do repositório; o repositório guarda só as versões reduzidas.
- Registrar a procedência ao lado da arte: ferramenta ou autor, data e licença. Antes de distribuir a terceiros, verificar direitos (AUD-020).

## 6. O que preservar

Não refazer sem decisão do autor:

- marca e ícones do app (`docs/arte/MARCA.md`);
- pinturas aprovadas (`static/art/approved/paintings/`);
- ícones aprovados de navegação e de áreas (`static/art/approved/`);
- Acampamento integrado no #54 (`static/art/camp-modular/`);
- companheiros v2.

**Fora da direção:** o Acampamento isométrico antigo (prédios de terceiros em `static/art/camp/`, CC0, feudalwars) foi substituído pelo Acampamento cinematográfico e será removido (decisão do autor em 11/11/2026). Não usar como referência.

## 7. Como pedir arte nova

Todo pedido (para pessoa ou gerador) diz, nesta ordem: tipo e tamanho (seção 5), lugar e bioma (seção 3), personagens (seção 4), o que evitar, e uma ou duas referências da seção 1. Guardar o pedido final junto da procedência, como já se faz em `docs/HOME-RPG-ARTES.md` e `docs/arte/companheiros-prompts.json`.
