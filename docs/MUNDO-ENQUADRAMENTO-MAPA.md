# Enquadramento de Lucan e mapa simplificado

Ajuste na mesma branch feat/world-cinematic, sem integração, PR ou publicação principal.

- O recorte em telas baixas vinha de object-fit: cover e da centralização vertical. A arte horizontal original agora cabe inteira na área disponível, alinhada pelo topo, sem zoom adicional no celular. O personagem permanece ancorado enquanto o texto rola, e a máscara acompanha a largura real da imagem para não deixar um limite retangular visível.
- Mapa regional fixo e integral. Removidos +, −, Enquadrar, arraste/zoom e lista de localidades duplicada. Os próprios marcadores mantêm seus nomes acessíveis, seleção por clique/toque, Tab/Enter e deslocamento de foco pelas setas. No celular o nome também aparece ao focar ou selecionar o ponto.
- Nenhuma alteração em narrativa, arte original, estados, economia, banco ou backups. Os controles de enquadramento da cena explorável não foram confundidos com os controles removidos do mapa regional.

Verificações: tipos sem erros/avisos, lint dos arquivos alterados e build; quatro E2E dirigidos desktop/mobile de seleção, ausência dos controles/lista e enquadramento da imagem; um cenário PWA mobile de investigação completa offline e retomada. Conferência de jornadas/capturas em 1366 × 642, 1536 × 900, 1024 × 768, 390 × 844 e 320 × 844; após suavizar a máscara, repetida a conferência em 1366 × 642 e 390 × 844, sem erros ou transbordamento externo. Mobile emulado, sem aparelho físico.

Build final: 262 recursos essenciais, 19.888.804 bytes, versão de65ca75c543e3a1. A validação dirigida não substitui a CI obrigatória de integração, que continua aguardando aprovação.

Prévia atual: http://127.0.0.1:5192/mundo; capturas: http://127.0.0.1:5192/correcoes.html. Artefato preservado em .review-previews.local/world-framing, ignorado pelo Git. Servidor local iniciado em segundo plano, sem janela e com logs nessa pasta. A instalação 5174 permanece fora desta rodada.
