# Home — refinamento final de UX/UI

Sprint de 30/10/2026, na branch de desenvolvimento existente `feat/home-rpg-reference`. Direção artística, arquitetura, dados e sistemas de jogo preservados. Este registro complementa a [auditoria visual anterior](HOME-RPG-RECURSOS-E-POLIMENTO.md); os números e capturas abaixo correspondem ao refinamento de usabilidade.

## Melhorias entregues

- **Navegação:** coluna de 232px no desktop, rótulos de 19,2px em uma linha, itens com altura mínima de 44px e espaçamento vertical menor. Ícones, seleção dourada e moldura preservados. A barra continua podendo rolar em condições extremas de altura ou texto ampliado, mas não rola nas três resoluções desktop solicitadas. Entre 761 e 1180px, usa uma faixa de 80px com ícones, nomes acessíveis e dicas nativas; no mobile, mantém os controles de navegação existentes.
- **Missões:** sugestão e lista agora compartilham uma única área de rolagem. A criação permanece fora dessa área. Duas tarefas comuns cabem sem rolagem interna nas cinco resoluções; muitas tarefas continuam roláveis por teclado e ponteiro. A página pode rolar para mostrar o restante da Home.
- **Leitura:** títulos das tarefas em 18px, estados e recompensas em 13px, com contraste e nomes de estado explícitos. As recompensas mantêm a distinção entre prévia e registro efetivo.
- **Prioridade:** a Home abre em “Pendentes”. “Todas”, “Hoje” e “Concluídas” continuam acessíveis. O filtro não altera tarefas, critérios de revisão, seleção da próxima atividade ou recompensas. Ao filtrar Hoje, a sugestão só aparece se também pertencer ao dia.
- **Estado em dia:** texto curto, ícone e acesso ao progresso, sem repetir mensagens de encerramento. Concluídas ficam em seu filtro. O painel mantém a altura alinhada ao cenário no desktop, mas o conteúdo do estado vazio ocupa menos de 150px nas condições verificadas.
- **Hierarquia:** cenário, missões e navegação mantêm o acabamento principal. Destinos e próximos marcos usam a variante reutilizável `rpg-frame--secondary`: sombra menor, gravura mais discreta e somente os cantos superiores. Nenhum efeito novo foi acrescentado.
- **Companheiro:** retrato provisório preservado. Nome e legenda do cenário passam a ocupar colunas em fluxo, sem coordenadas individuais por espécie. Retrato não encolhe e o nome pode quebrar naturalmente. Verificados nomes longos, quatro espécies, três estágios e imagem indisponível. Nenhum companheiro foi adicionado ao catálogo.

## Resoluções verificadas

Capturas do Chromium, com escala de viewport 1 (100%) e dados descartáveis de teste. A captura de página inteira é identificada separadamente; não foi usada para fingir que todo o conteúdo cabe no viewport.

| Resolução | Navegação                             | Duas missões        | Painéis superiores                           |
| --------- | ------------------------------------- | ------------------- | -------------------------------------------- |
| 1366×768  | Rótulos inteiros, sem rolagem interna | Sem rolagem interna | Bases alinhadas; faixa de 448px              |
| 1440×900  | Rótulos inteiros, sem rolagem interna | Sem rolagem interna | Bases alinhadas; faixa de 496px              |
| 1920×1080 | Rótulos inteiros, sem rolagem interna | Sem rolagem interna | Bases alinhadas; conteúdo com largura máxima |
| 390×844   | Navegação móvel existente             | Sem rolagem interna | Painéis empilhados; página rolável           |
| 320×568   | Navegação móvel existente             | Sem rolagem interna | Painéis empilhados; página rolável           |

Sem rolagem horizontal nas cinco resoluções. No desktop, diferença medida entre as bases do cenário e das missões: **0px**. Os rótulos da sidebar ocupam uma linha, e “Companheiros” e “Perfil e mais” permanecem dentro da janela. Medidas completas em [desktop-medidas.json](home-refinamento-final-capturas/desktop-medidas.json) e [mobile-medidas.json](home-refinamento-final-capturas/mobile-medidas.json).

Em 320×568, o painel de missões é alcançado pela rolagem normal da página; o cenário não foi achatado para forçar a ação inteira na primeira tela. A barra móvel permanece fixa, e o espaçamento inferior preserva o acesso aos controles ao rolar. Com texto ampliado, a prioridade continua sendo leitura e acesso, mesmo quando isso exige mais altura.

## Capturas revisadas

| Estado                     | Imagem                                                                                                                                                                 |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Duas pendentes, 1366×768   | [Captura](home-refinamento-final-capturas/1366x768-pendentes.png)                                                                                                      |
| Duas pendentes, 1440×900   | [Captura](home-refinamento-final-capturas/1440x900-pendentes.png)                                                                                                      |
| Duas pendentes, 1920×1080  | [Captura](home-refinamento-final-capturas/1920x1080-pendentes.png)                                                                                                     |
| Duas pendentes, 390×844    | [Viewport](home-refinamento-final-capturas/390x844-pendentes.png), [página inteira](home-refinamento-final-capturas/390x844-completa.png)                              |
| Duas pendentes, 320×568    | [Captura](home-refinamento-final-capturas/320x568-pendentes.png)                                                                                                       |
| Perfil novo                | [1440×900](home-refinamento-final-capturas/1440x900-inicial.png), [320×568](home-refinamento-final-capturas/320x568-inicial.png)                                       |
| Em dia                     | [1366×768](home-refinamento-final-capturas/1366x768-em-dia.png), [390×844](home-refinamento-final-capturas/390x844-em-dia.png)                                         |
| Companheiro com nome longo | [Navegação compacta](home-refinamento-final-capturas/desktop-companheiro-nome-longo.png), [320×568](home-refinamento-final-capturas/mobile-companheiro-nome-longo.png) |

Comparadas com as [capturas da sprint anterior](home-rpg-polimento-capturas/desktop-1366x768.png): rótulos laterais têm mais espaço, recompensas são maiores, tarefas concluídas deixam de ocupar a lista inicial, e os cards inferiores têm gravuras mais leves. A composição artística e as artes existentes permanecem reconhecíveis. A [produção artística pendente](HOME-RPG-PRODUCAO-ARTISTICA.md) continua separada desta sprint.

## Validação e limites

`home-final.spec.ts` cobre as cinco resoluções, perfil vazio, duas tarefas, estado em dia, filtro de concluídas, abertura da tarefa por teclado, navegação compacta, espécies/estágios e retrato ausente. Os testes existentes continuam cobrindo muitas tarefas, criação, execução, pausa, conclusão, reversão, dados acumulados, texto a 200%, alternativas de fonte/arte, foco e navegação.

Na primeira rodada deste refinamento, o teste novo identificou **9px de rolagem desnecessária** com duas tarefas em 1366×768. Corrigido reduzindo apenas o espaçamento interno da sugestão; títulos e recompensas mantiveram os tamanhos maiores. Outra falha inicial era da preparação do teste: gravações diretas no IndexedDB não notificam o observador do aplicativo; os cenários de companheiros passaram a recarregar a página após preparar os dados. Isso não alterou o mecanismo real de atualização entre abas. A matriz final passou 4/4. Na primeira execução da regressão completa, duas verificações (desktop e mobile) ainda exigiam a frase redundante removida do estado vazio. O teste foi atualizado para a descrição mantida, preservando as verificações posteriores de backup e reversão. Trata-se de atualização da expectativa de texto após a mudança intencional de UX, não de uma falha preexistente nem de uma alteração nas regras de conclusão.

Resultados finais:

| Verificação                                  | Resultado                                                                                                    |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `npm run verify`                             | Aprovado: lint, Svelte com zero erros/avisos, 155 testes unitários, compilação estática e pacote PWA.        |
| `npm run test:e2e -- --workers=1`            | **168/168 aprovados**, desktop e mobile, incluindo os novos cenários desta sprint.                           |
| `npm run test:pwa`                           | **22/22 aprovados**, incluindo fontes e imagens sem conexão, persistência e atualização segura.              |
| Matriz específica de resoluções/companheiros | **4/4 aprovados**, também incluídos nos 168 testes de fluxo.                                                 |
| Inspeção visual                              | Capturas reais revisadas nas cinco resoluções, além do estado em dia, página completa mobile e nomes longos. |

Os testes de navegador foram executados sequencialmente. O pacote essencial tem 102 arquivos e 2.222.474 bytes (aproximadamente 2,22 MB). Não foi realizada uma auditoria completa com leitor de tela nem teste de Safari/Firefox nesta sprint.

Prévia disponível em http://127.0.0.1:5175/, com resposta HTTP 200 confirmada. Alterações mantidas no checkout da branch atual para revisão; nenhum envio ao remoto foi realizado.

Não foram feitas mudanças na beta estável, novas mecânicas, histórias, regras de recompensa, persistência ou personalização. Nenhuma biblioteca nova foi instalada.
