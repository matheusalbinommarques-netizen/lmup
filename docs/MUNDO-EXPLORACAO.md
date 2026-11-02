# Mundo: exploração dos Ermos Centrais

Implementação independente de ícones por área e remoção de missões, baseada em origin/main bbcaf277. Não integra o Acampamento experimental nem converte Védria.

## Experiência entregue

- `/mundo` sempre abre o mapa. Selecionar um local mostra contexto; a retomada da última cena/objeto/conversa é explícita.
- Pintura substituível, coordenadas relativas, rotas SVG separadas, zoom, arraste, seleção por teclado/toque e lista alternativa. Atual, conhecido, não descoberto e acesso indisponível são identificados.
- Oásis em construção e arredores são as duas cenas jogáveis. Os outros quatro pontos são referências geográficas com disponibilidade explícita, sem telas de viagem vazias.
- Lucan conduz A Caravana Perdida: aceitar, investigar três evidências verificáveis, voltar, revisar e escolher um encaminhamento. Duas conclusões locais, relações descritivas e alteração da mesa de provisões. Diário registra o resultado sem reaplicar efeitos.
- Atlas apresenta as quatro artes oficiais e identidades públicas. Segredos dos fundadores e da guilda não são expostos.
- Aventura nos Ermos (`/aventura?campanha=ermos`) compartilha o mesmo estado de Mundo. `/aventura` mantém o piloto anterior e seus critérios de XP.
- Mapa é um atalho para Mundo. Meu progresso mantém `/progresso` e seus relatórios. Aposentos reaproveita o Refúgio com aviso de transição, preservando benefícios, equipamentos e conquistas; `/refugio` permanece válido. Acampamento e laboratório ficam separados, sem integrar economia experimental.

## Persistência e segurança dos dados

`content.ts` define arte, geografia, personagens e pistas; `WorldExperience` e `RegionalMap` cuidam da apresentação. `worldService` é a única entrada para comandos narrativos. O estado versionado fica em `profile.world`, opcional, sem nova tabela ou alteração do schema 6/formato de backup 4.

Transações Dexie validam condições, revisão e época; comandos possuem recibos limitados e idempotência. Ações atrasadas de outra aba e escolhas irreversíveis conflitantes são recusadas. Falhas de escrita revertem a transação. Restauração valida antes de substituir dados e renova a época para invalidar ações anteriores. Backups antigos sem Mundo continuam aceitos.

Mundo não chama serviços econômicos, não concede XP/ouro/comida e não altera eventos, tarefas, rpgPilot ou Acampamento. Expansões com recursos devem passar pelos serviços econômicos existentes e novos testes, sem gravar saldos diretamente.

## Artes, offline e limites

Sete WebP fornecidos pelo usuário, sem alterações de aparência, totalizando 1.481.060 bytes. `static/art/world/manifest.json` registra origem e hashes; não atribui uma licença nova. Pinturas não contêm a interface interativa. Mockups de referência não entram no produto.

As sete artes e as rotas novas entram no cache essencial para primeira visita offline, após instalação/carregamento inicial com conexão. Build isolado: 260 arquivos essenciais, cerca de 17,22 MB. Não há IA online, API paga, relógio mundial ou punição por ausência.

Transições respeitam movimento reduzido. Narração opcional usa somente voz portuguesa marcada como local pelo navegador, com volume/pular, e fica indisponível quando não existe voz adequada. Não há ainda música, efeitos, expressões alternativas ou dublagem de personagens: dependem de arquivos revisados futuros. Não há movimento livre de personagem ou visitas aos demais pontos regionais nesta etapa. Mobile validado em Chrome emulado; aparelho físico e vozes de cada sistema ainda dependem de avaliação.

## Verificações locais

- 29 testes de serviço: investigação, ambas as decisões, repetição, concorrência, rollback, backups e preservação do piloto/economia.
- 12 E2E dirigidos em desktop/mobile: fluxo completo, retomada, atlas, teclado/zoom, 320 px, Home e navegação existente; mais 4 casos do piloto de capítulos preservado.
- 4 PWA dirigidos em desktop/mobile: primeira exploração inteiramente offline, imagens, conclusão e recarga; Home/atlas offline.
- 4 testes do mecanismo de precache; tipos Svelte sem erros/avisos, lint dos arquivos alterados e build de produção.

Essas verificações não substituem `verify (22)` e `verify (24)` obrigatórios antes da integração. Nenhuma publicação na porta 5174 faz parte desta entrega de prévia.
