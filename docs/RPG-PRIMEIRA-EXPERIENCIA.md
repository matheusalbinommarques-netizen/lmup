# LMUP — piloto de capítulos RPG (não canônico)

**Base:** `codex/beta-redesign`. Desenvolvimento isolado em `feat/rpg-first-experience`.

## Objetivo

Validar se capítulos narrativos curtos e completos são um incentivo adicional a realizar atividades reais. A produtividade continua funcionando sem a aventura.

## Como funciona nesta versão

1. **Capítulo 1 — O outro lado da ponte:** seis cenas e uma escolha; sem qualquer interrupção por tarefas.
2. Ao terminar, o aplicativo salva a escolha e a quantidade de XP já acumulada naquele momento.
3. **Capítulo 2 — Ecos da passagem:** pequena continuação experimental desbloqueada quando o jogador ganhar **150 XP novos após concluir o Capítulo 1**. Esse XP não é gasto.
4. A pessoa decide quando iniciar o próximo capítulo. Não há prazo, punição por ausência, obrigação de criar uma missão específica nem autoplay.
5. O capítulo seguinte tem três cenas curtas para testar navegação e progressão, não para apresentar uma campanha definitiva.
6. Existe a opção de **rever o Capítulo 1** sem mudar a escolha original nem reiniciar o progresso.
7. Em navegadores compatíveis, há um botão para **ouvir o texto com a voz do próprio dispositivo**. É voz sintética do navegador, não dublagem produzida ou IA em nuvem. Não toca automaticamente.

## Compatibilidade com quem terminou o piloto anterior

Na primeira versão experimental, o jogador precisava concluir uma missão no meio de uma cena. Quem já concluiu essa versão mantém `scene: 6` e a escolha. Ao reabrir a aventura, vê o desfecho salvo e pode rever todas as cenas sem interrupção.

Para não contar XP antigo como novidade, existe um botão **Começar a contar XP para o próximo capítulo**. Ele marca o XP daquele momento como ponto de partida. A ação é explícita e não altera o saldo, compras, tarefas ou resultados prévios.

## Arquitetura, economia e dados

- O catálogo de cenas vive em `src/lib/content/pilot.ts`. O fluxo do capítulo e suas decisões vivem em `src/services/rpgPilotService.ts`. A tela fica em `src/routes/aventura/+page.svelte`.
- O progresso tem armazenamento opcional no perfil: `scene`, `choice`, `chapterOneEndXp`, `chapterTwoUnlocked`, `chapterTwoScene`. Não foi preciso adicionar tabelas ou migrar o schema v5.
- `totalXpEarned` é a medida já registrada pela economia existente. O desbloqueio não cria eventos, não concede XP e não gasta ouro nem comida.
- Se o XP recebido depois do capítulo for estornado **antes de liberar a continuação**, deixa de contribuir para o limiar. Depois do desbloqueio, a história permanece acessível.
- O backup existente transporta os campos do perfil, e a validação rejeita estados de capítulo malformados.
- Conteúdo e cenas são provisórios; o sistema não depende de nomes definitivos da lore.
- A rota /aventura está incluída no fallback offline do PWA.

## Critérios a avaliar

- O capítulo pode ser concluído sem abrir uma tarefa.
- Uma conclusão antiga não acelera imediatamente o Capítulo 2.
- Uma atividade real nova aumenta o progresso, independentemente do tipo de atividade.
- Desfazer uma conclusão antes de destravar o capítulo reduz o progresso correspondente.
- O jogador pode fechar, voltar, recarregar e rever a aventura sem perder escolha.
- Diálogos ficam legíveis sem som. Botões de voz são opcionais e não interferem com o avanço manual.
- A experiência ainda funciona mesmo que a pessoa ignore totalmente o RPG.
- A avaliação mede envolvimento e clareza; testes automatizados não demonstram melhoria de retenção.

## Fora de escopo

Roteiro e personagens definitivos, ilustrações originais por cena, dublagem humana, trilha sonora licenciada, sistema geral de capítulos, customização completa do protagonista, combate, mapas exploráveis, oito pets narrativos, múltiplas origens e live service. Essas coisas só avançam após validar a interação central.

## Testes

`src/services/rpgPilotService.test.ts` verifica a continuidade do capítulo 1, o desbloqueio por XP recente, estorno, compatibilidade com a versão anterior, idempotência e backup.

Conferir via `npm run verify`, `npm run test:e2e` e `npm run test:pwa` na branch. Também testar manualmente voz disponível/indisponível, 320px e texto ampliado. Os testes de navegador existentes não são evidência de avaliação com usuários.
