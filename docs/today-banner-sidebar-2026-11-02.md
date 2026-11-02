# Hoje — banner e navegação lateral

O pacote de produtividade aprovado foi integrado pelo PR #51 no commit `5a6d3453987cafb0f6a3b5b4b84b8f2d81ecb0f0`. Os dois checks obrigatórios passaram em Node 22/24: 395 testes de serviços, 24 de publicação/sincronização, 334 jornadas E2E e 46 cenários PWA/offline; dois cenários exclusivos de desktop foram pulados no mobile. A publicação local pelo sincronizador existente foi confirmada na versão `61f50027bc318692`.

Os ajustes adicionais de Hoje foram desenvolvidos depois desse merge, na branch `fix/today-banner-sidebar`, para avaliação na prévia isolada.

- **Banner:** reaproveita a mesma pintura de Vèdria utilizada em Missões e a estrutura `journey-heading`. Saudação, data e acesso ao personagem continuam presentes. Texto e degradê mantêm contraste; o conteúdo pode crescer com texto ampliado. Nas capturas comparáveis, a altura passou de 240 para aproximadamente 151 px no desktop e de 280 para 156 px no mobile. A próxima missão aparece mais cedo.
- **Causa da sidebar:** o AppShell atribuía a classe decorativa `rpg-frame` à sidebar somente em Hoje. Sua regra `position: relative` substituía o `sticky` compartilhado. A medição anterior mostrou o topo da sidebar em -588 px após rolar a página; nas outras telas, a posição já era `sticky`.
- **Correção compartilhada:** retirada essa decoração condicional do AppShell. A sidebar usa altura limitada à janela, alinhamento superior e rolagem vertical independente, com navegação por teclado e contenção de rolagem. A correção atende Hoje e as demais páginas; não há regra especial para fixar somente Hoje. No mobile, a sidebar continua oculta e permanecem Hoje, Missões, Mundo e Mais.

Validação: tipos/Svelte sem erros ou avisos, lint dos arquivos alterados e build aprovados. Foram executados 42 cenários direcionados; a cobertura final tem 40 aprovações e dois pulos condicionais do teste de sidebar em projetos mobile. As expectativas novas de imagem e medição aguardaram o carregamento da lista, distinguiram a pintura do ícone do calendário e toleraram arredondamento inferior a um pixel. Os testes antigos de Hoje passaram, incluindo criação, pausas, conclusão, perfil, equipamentos, companheiros, múltiplas resoluções e texto ampliado. Não houve alteração de persistência, economia, serviços ou dados pessoais.

Capturas antes/depois em 1440, 390 e 320 px, rolagem da página e janela desktop de 400 px de altura estão na galeria: <http://127.0.0.1:5294/#hoje>. Prévia funcional: <http://127.0.0.1:5295/__demo>. Os testes e as capturas usam bancos descartáveis com dados sintéticos. As medições da sidebar após a rolagem mantêm seu topo em zero no desktop.

Arquivos de interface alterados: `AppShell.svelte`, `Home.svelte` e `visual.css`. A branch adicional não modifica a instalação pessoal e permanece separada do pacote já integrado.
