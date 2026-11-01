# Construção em memória — validação do PR #43

## Comportamento entregue

A implementação existente em `c0514e1` foi atualizada por fast-forward na branch `feat/sanctuary-pan-zoom-lab`, sem trabalho local pendente. O botão **Construir forja** abre uma prévia: toque/clique escolhe o contato frontal com o solo numa grade de 16 unidades; confirmar cria uma instância selecionável em memória; cancelar não altera o mapa. Setas movem a prévia com foco no terreno, Enter confirma e Esc cancela. As duas forjas iniciais, câmera, zoom e assets continuam existentes.

## Correções

- A regra anterior rejeitava posições por distância entre centros e margens fixas. `campPlacement.ts` agora compara os polígonos ocupados por eixos separadores e testa todos os vértices contra os limites do mundo. A forja reutiliza o footprint 192×96 e o contato frontal do catálogo/renderizador. Salão e armazém CSS têm uma base provisória 104×52, com contato 47 unidades abaixo da posição do botão, representando o solo das paredes. Telhados e retângulos transparentes não são colisão; bases podem compartilhar uma borda sem sobreposição.
- Toque sobre a base de edifícios existentes agora propõe uma posição inválida, em vez de ignorar o posicionamento ou trocar a seleção. Cancelar um gesto não modifica a proposta. Arrastar move só a câmera, sem confirmar ou reposicionar.
- Losango verde/vermelho e texto de posição livre/indisponível; mensagem distingue sobreposição de saída do mapa. Confirmação desabilitada quando inválida. Sprite e edifício final têm a mesma imagem, escala e pivô.
- Atalhos são ocultados durante posicionamento, liberando espaço no celular; depois têm altura limitada e rolagem para não cobrir todo o mapa ao adicionar edifícios. Botões confirmar/cancelar têm alvos de pelo menos 44 px. Botão construir separado do cabeçalho do mapa, inclusive em 320 px.

## Testes executados

- ESLint direcionado aos quatro arquivos de código/teste, aprovado. Svelte check: zero erros e zero avisos. A tentativa inicial restrita falhou em iniciar esbuild com `spawn EPERM`; a execução com os processos permitidos concluiu normalmente. Diagnósticos intermediários de ordem das constantes e acessibilidade foram corrigidos antes da entrega.
- Vitest: três testes de geometria aprovados; cobrem contato no solo, posição diagonal livre rejeitada pela regra antiga, colisão, bases de tamanhos diferentes, contenção, borda compartilhada e quatro limites do mapa. Execução aprovada: **345 ms**.
- Build local aprovado após correções. Dez testes direcionados do acampamento aprovados em **10,7 s**, sem rodar a suíte completa localmente. Houve nova execução direcionada após corrigir os diagnósticos; a primeira versão do teste confundia o contêiner de âncora 0×0 com a imagem visível e foi corrigida para inspecionar o sprite.
- Prévia real testada com Playwright instalado, contextos descartáveis e IndexedDB bloqueado/monitorado: desktop 1440×1000, toque emulado em 390×844/DPR 2 e 320×740, além de mouse em 320 px. Mesmo fluxo de regressão usado no build, sem duplicar uma implementação de testes. HTTP 200 e botão visível; duas forjas criadas, seleção direta independente das quatro forjas, cancelamento, colisão com forja inicial, salão CSS e forja nova, limite inferior no navegador, quatro limites nos testes unitários, gesto cancelado, arraste, zoom e centralização. Sem rolagem horizontal, erros de console/página ou chamadas ao IndexedDB.
- As capturas são opcionais por `LMU_CAMP_CAPTURES` no teste existente; sem esse parâmetro a CI não grava capturas extras de sucesso. Configuração temporária de validação da prévia ficou fora do repositório. As suítes completas obrigatórias permanecem na CI; resultado final na descrição do PR.

[Desktop: prévia](construcao-acampamento-capturas/desktop-padrao-previa.png) · [Desktop: duas criadas](construcao-acampamento-capturas/desktop-padrao-construidas.png) · [Mobile: prévia](construcao-acampamento-capturas/mobile-padrao-previa.png) · [Mobile: duas criadas](construcao-acampamento-capturas/mobile-padrao-construidas.png) · [320 px](construcao-acampamento-capturas/mobile-320-previa.png)

## Prévia e processo

URL efetiva: `http://127.0.0.1:5176/laboratorio/acampamento`. `scripts/preview-lab.ps1` identificou o Vite conhecido PID 28264 na porta 5175 e recusou interrompê-lo. A prévia nova foi iniciada pelo mesmo script com `-Port 5176`, PID 10672, neste checkout. Registros de inicialização e logs em `%TEMP%/lmup-preview-5176`; o commit de inicialização no JSON é c0514e1 e não é um monitor de alterações posteriores. O commit final efetivamente servido está na descrição do PR e na entrega, após teste no navegador. Nenhuma ação na porta 5174, main, sincronização ou banco pessoal.

Gargalos observados: geometria por centros exigia correções caso a caso; a função isolada usa o contrato visual já existente e aceita footprints de dimensões diferentes. Testes manuais separados do servidor real criariam retrabalho: o mesmo arquivo Playwright foi reutilizado com configuração temporária apontando à prévia e capturas opcionais. Limitação de espaço móvel resolvida só nos controles afetados. Não foram instaladas bibliotecas ou introduzidas abstrações de engine, economia ou persistência. Tempos informados são de execução dos testes, sem estimativa de duração total ou ganho de desempenho.

## Limitações

Tudo é demonstração em memória: recarregar descarta as forjas construídas. Colisão valida edifícios e mapa, não árvores, água ou regras futuras de terreno. Bases dos dois edifícios CSS são aproximações explícitas, a substituir pelos metadados de seus futuros sprites. Recorte do telhado/sombra junto à borda não é impedido: o limite aplica-se ao footprint no solo. Toque é emulado, sem certificação de aparelho físico; pinça continua fora de escopo. Assets e qualidade visual continuam os de avaliação. PR #43 deve permanecer em rascunho e sem merge até aprovação visual e funcional.
