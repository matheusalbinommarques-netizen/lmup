# C03 — Leitura compartilhada do snapshot (11/11/2026)

Meta do plano de desempenho: concluir uma missão com 14.600 linhas por tabela em ≤ 1,5 s. Depois do C02 continuava em 3,1–5,1 s, conforme a máquina.

## Diagnóstico

`scripts/perf/profile-complete.mjs` conta as leituras do IndexedDB e grava um perfil de CPU de uma conclusão com histórico sintético. Na `main` (`9357dc1`), com 5 anos de histórico, uma conclusão fazia 11 leituras completas de `occurrences` e 8 de `activityEvents`. O tempo ia quase todo para desserializar essas leituras, não para o cálculo. Quem lia:

- `readJourneySnapshot` relia as mesmas tabelas em `currentOccurrences`, `readAchievementStats` e `plannedOccurrences`: 4 leituras de ocorrências e 3 de eventos;
- `completeTask` montava as ocorrências atuais **de todas as missões** para achar uma só (duas vezes), e `refreshAchievementReceipts` relia tudo para a sequência e para as conquistas;
- o snapshot ficava num `$state` profundo do Svelte, e cada acesso às 14.600 linhas passava por um proxy (~400 ms por conclusão).

## O que mudou

- `readPlanningData` lê as tabelas de planejamento uma vez. Com `taskId`, lê só aquela missão pelos índices `taskId`, que já existiam. `projectPlannedOccurrences` e `projectCurrentOccurrences` são as projeções puras. As funções públicas mantêm a assinatura e ganham o `taskId` opcional.
- O snapshot e `refreshAchievementReceipts` leem cada tabela uma vez e repassam os dados às regras de conquista e à sequência (`readAchievementData`, `refreshCompletionStreak(data)`).
- `journeyQuery()` virou uma fonte única com `shareReplay` e `refCount`. Telas abertas ao mesmo tempo dividem uma leitura por mudança, e a fonte para quando ninguém assina. A virada de dia e o tratamento de erro continuam na fonte.
- Os 12 componentes que guardam o snapshot usam `$state.raw`: o snapshot é sempre substituído inteiro e nenhum componente escreve nele (verificado).
- `activityMinutes` usa um mapa no lugar de `find` por registro, com o mesmo resultado.

Sem mudança de schema, de dados, de regras de recompensa nem de conquistas.

## Medição (C01, `npm run perf:scale`, mesma máquina, mediana de 3)

| Linhas por tabela | Concluir antes | Concluir depois | Hoje antes → depois | Missões antes → depois |
| ----------------: | -------------: | --------------: | ------------------: | ---------------------: |
|                 0 |          86 ms |           85 ms |        187 → 192 ms |           265 → 175 ms |
|             2.920 |         893 ms |          344 ms |        697 → 469 ms |           801 → 509 ms |
|             8.760 |       2.629 ms |          875 ms |      1.746 → 968 ms |       1.939 → 1.036 ms |
|            14.600 |   **4.614 ms** |    **1.435 ms** |    2.815 → 1.504 ms |       3.414 → 1.742 ms |

Leituras completas numa conclusão com 5 anos (navegador): `occurrences` 11 → 3, `activityEvents` 8 → 2, `executionRecords` 3 → 2.

**Limites:** a meta de concluir (≤ 1,5 s) foi atingida nesta máquina com margem pequena (cerca de 4%). Abrir Hoje ficou em 1.504 ms, praticamente na meta de 1,5 s. Abrir Missões ficou abaixo dos 2 s. Uma rodada anterior, com testes em paralelo, deu 1.448 ms. É uma comparação de uma máquina, sem garantia para a instalação pessoal. A reconciliação diária ainda lê todas as ocorrências. Ler só as não concluídas exigiria confiar no índice `status`, que não cobre linhas antigas sem esse campo, por isso ficou de fora.

## Testes

`src/services/sharedReads.test.ts`:

- a consulta por missão devolve exatamente o recorte da consulta completa (rotinas, avulsas, arquivada, evento legado, três dias);
- conquistas e sequência são iguais com leitura própria ou compartilhada;
- o snapshot lê cada tabela grande uma vez;
- a conclusão lê ocorrências no máximo 2 vezes e eventos no máximo 1, sem duplicar conclusão nem conquista;
- dois assinantes dividem uma leitura por mudança e quem chega depois recebe o último valor.

Quatro mutantes (sem compartilhamento, releitura no snapshot, varredura completa na conclusão, eventos omitidos na leitura por missão) são detectados.

## Intermitente `routine-editor-ux.spec.ts:49`: causa encontrada

Registrado na auditoria como "causa não determinada". O formulário da rotina é inline, e "Editar rotina" continuava clicável durante o salvamento. O teste reabria logo depois de salvar, sem esperar. Resultado: ou o formulário reabria com a lista ainda antiga ("Saúde" no lugar de "Casa"), ou o fim do salvamento fechava o formulário recém-aberto. Com a leitura mais rápida a janela mudou: a branch falhava 2 de 20 repetições, contra 20 de 20 aprovadas na `main` na mesma máquina. Nem o `shareReplay` sozinho nem o `$state.raw` sozinho eliminavam a falha.

Correção:

- **produto:** "Editar rotina" é ignorado enquanto um salvamento está em curso e abre a rotina gravada (`db.routines.get`), não a cópia da lista;
- **teste:** espera o formulário fechar antes de reabrir, como o próprio teste já fazia no primeiro salvamento. Nenhuma asserção removida.

Só com a correção de produto, 19 de 20 passaram: o clique durante o salvamento é ignorado e o formulário fecha. Com as duas, o arquivo passou 80 de 80 (10 repetições, desktop e mobile).
