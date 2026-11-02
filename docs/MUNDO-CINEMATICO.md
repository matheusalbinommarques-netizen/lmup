# Acabamento cinematográfico de Mundo

Branch `feat/world-cinematic`, baseada exclusivamente em `feat/world-exploration` (d520df2). Preserva as branches independentes de Missões e a prévia conjunta anterior. Sem PR, push, merge ou publicação nesta rodada; aprovação parcial da direção visual não autoriza integração.

## Auditoria e escopo

`WorldExperience.svelte` já centraliza os textos/opções, o serviço de comandos e a assinatura do perfil. `content.ts` mantém as coordenadas, artes e objetos; `worldService` continua validando todas as condições, revisão, recibos e consequências. `OasisCinematic.svelte` recebe esses dados e callbacks, sem gravar no banco. Um cache apenas visual conserva a fala durante a transição de saída, sem criar estado narrativo concorrente.

O acabamento é ativado somente no assentamento do Oásis. Mapa, Atlas, campanha e arredores continuam com a apresentação anterior. O modo imersivo usa um diálogo nativo para conter o foco e manter a navegação do aplicativo atrás da cena, sem alterar o AppShell. Ao sair, o bloqueio de rolagem é removido; voltar ao mapa coloca o foco na retomada explícita.

Não houve alteração nos serviços, geografia, textos narrativos, escolhas, recompensas, banco, backups, Missões, Acampamento, Aposentos ou arquivos de arte. Sete artes existentes continuam no mesmo cache; bundles novos são incluídos pelo build normal.

## Ajustes visuais e de uso

- Indicadores com símbolos distintos, base escura e contorno claro, sem números. Hover/foco/seleção acrescentam nome, realce e escala discreta. Revelar pontos e lista acessível permanecem disponíveis. Contraste não depende somente da cor.
- Identificação de local e objetivo em degradês leves com borda lateral fina, sem caixas fechadas. Elementos superiores são atenuados durante a conversa.
- Controles agrupados por função no desktop; no mobile, duas linhas compactas de ações visíveis, sem menu obrigatório para Diário, Mapa, Áudio, Revelar ou Sair. Durante a conversa, a volta à exploração fica sempre acessível. Alvos visíveis conferidos com altura e largura de pelo menos 44 px.
- Retrato oficial amplo à esquerda, composição com máscaras de borda, ajuste leve de iluminação e cenário ao fundo. Nome, fala e respostas têm hierarquia própria. No celular, retrato superior e texto abaixo, sem reduzir a tela desktop.
- Panorama mobile desliza horizontalmente; Ver cena inteira oferece enquadramento integral. A centralização inicial que deixava um hotspot fora da área alcançável foi corrigida. Teclado/lista continuam alcançando os quatro pontos.
- Entrada suave, aproximação discreta de câmera, fade de saída e feedback de descoberta. Movimento reduzido desativa as animações, incluindo o fade de saída.

## Análise da arte de Lucan

O retrato oficial existente (1086 × 1448) é suficiente para uma composição convincente de busto/figura em primeiro plano, sem miniatura em cartão. A versão atual mantém o rosto, cabelos, capa e armadura originais; o arquivo não foi alterado. A referência horizontal anexada orientou enquadramento, presença e iluminação; não foi aplicada como uma interface pronta ou fundo com controles incorporados.

Limite: máscaras e enquadramento não criam a pose sentada nem as mãos presentes na referência. O fundo do retrato original também restringe a fusão perfeita com qualquer ambiente. Nenhuma nova arte é obrigatória para esta prévia.

Se for desejada uma aproximação ainda maior da pose da referência, o recurso preferível é um recorte oficial de Lucan em três quartos, sentado ou com busto/ombros/mãos completos, voltado levemente para a direita. Preservar identidade, cabelo, barba, armadura, capa e adornos aprovados; luz quente lateral coerente com o Oásis. Master sugerido de 1536 × 2048 ou maior, PNG com transparência real e bordas limpas, sem texto, moldura ou fundo opaco. Para uso no jogo, exportar WebP com alpha e qualidade revisada, idealmente até 350–500 KB. Uma alternativa de composição completa seria arte limpa 16:9, ao menos 1920 × 1080, personagem à esquerda e espaço calmo à direita para texto funcional; ela teria menos flexibilidade no celular. Não gerar ou substituir essa arte automaticamente.

## Áudio e limitações

Não foram encontrados recursos sonoros adequados no projeto. Não foram adicionados música, efeitos de procedência desconhecida, bibliotecas pesadas ou serviços externos. Narração portuguesa opcional, volume e pular usam a infraestrutura local existente e dependem de voz local disponível. O componente oferece pontos opcionais `onSound` para entrada, interação, descoberta e diálogo, a conectar somente quando houver arquivos revisados; eles não produzem som nesta prévia.

Falhas de recurso ou ausência de voz não impedem a exploração. Falas longas, texto ampliado ou janelas muito baixas podem exigir rolagem na conversa; o diálogo de abertura cabe sem rolagem extra nas quatro larguras conferidas. Mobile foi validado por emulação Chrome, não em aparelho físico. Outras localidades não receberam o acabamento nesta entrega.

## Testes e conferência

- 11 testes de serviço do motor de Mundo passaram, cobrindo condições, duas conclusões, repetição, concorrência, rollback, backup/restauração e preservação econômica.
- 10 E2E únicos de Mundo e acabamento passaram em desktop/mobile: hotspots por mouse/toque/teclado, diário sem efeitos, retomada de conversa, mapa, consequências, campanha, relatórios, Atlas e saída sem prender a rolagem. O caso mobile foi ampliado e reexecutado com gesto de arraste real via entrada de toque do Chrome; o retorno de foco ao mapa também foi conferido nos dois projetos. Reexecuções não são cenários adicionais.
- 2 PWA desktop/mobile passaram: primeira visita à exploração offline, investigação completa, retrato carregado, conclusão persistente, recarga e Atlas.
- Tipos Svelte sem erros/avisos, lint dirigido e build de produção aprovados. Build final: 261 recursos essenciais, 17.256.266 bytes, versão a36e32da23267654.
- Prévia congelada conferida em 1536 × 900, 1024 × 768, 390 × 844 e 320 × 844: sem erro de execução ou transbordamento externo; imagem/retrato carregados, alvos de ao menos 44 px, fala de abertura e respostas cabendo no diálogo. Capturas comparativas incluem 1024 × 900, mantendo o tamanho anterior para comparação.

Prévia: http://127.0.0.1:5192/mundo. Comparações: http://127.0.0.1:5192/comparacao.html. Artefatos ignorados pelo Git ficam em `.review-previews.local/world-cinematic/`; capturas externas ao código em cinematic-refined, no diretório de visualizações desta conversa.

A instalação 5174 não foi acessada nem publicada por esta rodada. Durante o trabalho, seu apontamento foi observado evoluindo por publicação externa ao commit 3017a1a; não foi revertido ou alterado. A branch cinematográfica mantém a base aprovada para esta revisão, e a conciliação com a main atual deve ocorrer somente no fluxo de integração após a aprovação visual. CI completa e verificações obrigatórias permanecem para esse momento.
