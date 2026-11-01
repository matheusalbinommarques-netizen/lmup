# Validação do piloto do santuário — PR #41

Validado em 31/10/2026 (America/Sao_Paulo), na branch existente `feat/sanctuary-scene-pilot`, em `http://127.0.0.1:5175/laboratorio/santuario`.

## Resultado

- A correção `27b0ebec` usa `buildingState` e preserva a rune `$state`; ESLint direcionado e `npm run check` passaram, sem erros ou avisos do Svelte.
- Contextos descartáveis Chromium em 1440×1000, 390×844 e 320×740: seleção/deseleção por clique ou toque, painel contextual, estados vazio/em construção/concluído, reinício e quatro cenários funcionaram.
- Teclado: espaço seleciona o terreno; Tab chega à ação; Enter avança a construção; Tab chega ao seletor; Home troca o cenário. O foco permanece visível.
- Sem rolagem horizontal; o marcador fica dentro da cena e não se sobrepõe à legenda inferior.
- Nenhum erro de console ou de página durante o fluxo final. Chamadas `indexedDB.open` e `deleteDatabase` foram bloqueadas e monitoradas pelo teste: **zero chamadas** nos três contextos. Nenhum acesso à porta 5174 ou ao perfil pessoal.
- A recarga volta à demonstração inicial: dados só em memória, conforme o escopo.

## Correção adicional

Em 320 px o marcador em construção se sobrepunha à legenda. A menor correção foi definir `min-height: 260px` e `width: 100%` na cena mobile. Desktop e 390 px mantêm a composição anterior. Nenhuma alteração em dependências, CI, sincronização ou banco.

## Evidências

- [Desktop, forja concluída](sanctuary-scene-capturas/desktop.png)
- [Mobile 320 px, forja concluída](sanctuary-scene-capturas/mobile-320.png)
- [Métricas e resultados dos três contextos](sanctuary-scene-capturas/results.json)

## Limitações

- Validação em navegador com emulação de toque; aparelhos físicos e leitores de tela não foram testados.
- O marcador e a arte são provisórios; não há edifício composto por camadas, persistência, economia ou benefícios reais.
- O Browser integrado não inicializou neste ambiente (`failed to write kernel assets`); foi usado o Playwright já instalado. O primeiro acesso ao Vite coincidiu com a otimização inicial de dependências; o fluxo foi refeito após esse preparo.
- CI obrigatória será registrada na descrição do PR após conclusão no commit final. **PR #41 permanece em rascunho, sem merge, aguardando aprovação visual do usuário.**

## Medições

A execução automatizada final dos três contextos durou 2,88 s, registrada no JSON. Esse número não inclui inspeção humana das capturas, compilação, tentativas de diagnóstico nem espera por CI; não houve cronometragem exclusiva confiável para separar todas essas fases.
