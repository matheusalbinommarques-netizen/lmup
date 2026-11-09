# C05 — fundo lateral comprimido, decisão de 09/11/2026

O autor escolheu **A, preservar detalhes**, após comparar com o original e com uma variante de 432×324 em 1x e 2x. A decisão substitui a proposta inicial de aproximadamente 432 px. Ele também confirmou ter backup recente fora do navegador. Isso não autoriza merge.

| Arquivo                             | Pixels    |     Bytes | Pixels RGBA, estimativa |
| ----------------------------------- | --------- | --------: | ----------------------: |
| Original aprovado                   | 1448×1086 | 2.418.834 |                6,00 MiB |
| Variante A, escolhida               | 1448×1086 |   259.754 |                6,00 MiB |
| Variante B, descartada nesta rodada | 432×324   |    61.394 |                0,53 MiB |

A variante escolhida reduz o arquivo em 89,3%; **não reduz os pixels decodificados**. Não se afirma ganho de tempo de navegação sem medição. Somente o fundo de `.journey-sidebar` muda de caminho; posição, tamanho, gradiente, arte e funcionalidades permanecem.

O original permanece no repositório e no pré-cache porque `Home.svelte` também usa `paintings.map` em um cartão. A variante acrescenta **259.754 bytes de imagem** ao pré-cache, além da pequena diferença do CSS compilado. Não se remove arte do grupo B nem se trata C08 como autorizado. O benefício é evitar baixar/decodificar o original para a barra em páginas internas; a Home ainda pode solicitá-lo pelo cartão.

## Validação e reprodução

- E2E: Missões solicita a variante e não solicita a pintura original pela barra (desktop).
- PWA: variante com resposta WebP íntegra, menor que 400.000 bytes, disponível offline.
- Teste do manifesto, publicação, `verify (22)` e `verify (24)` permanecem obrigatórios.
- Prévia: escolha A já aprovada; a integração deve aguardar o resultado dos checks.
- Regeneração opcional: `python scripts/optimize-sidebar-art.py`, com Pillow/WebP instalado. Encoders diferentes podem alterar os bytes; comparar novamente se o resultado mudar.
- Reversão: revert do PR; original intocado. Nenhum dado ou schema é alterado.
