# LMUP — Instruções para agentes de programação

Este arquivo complementa o [README](README.md); não substitui as regras de segurança nele descritas.

## Antes de implementar
- Leia apenas o contexto necessário à tarefa: arquivos afetados, interfaces e testes correspondentes. Amplie a investigação se houver evidência de dependências.
- Preserve SvelteKit, TypeScript, Dexie/IndexedDB e a arquitetura existente; não faça refatorações ou upgrades fora do escopo.
- Prefira uma alteração pequena, com comportamento observável e critérios de aceite explícitos. Se a tarefa for grande, implemente um incremento funcional por vez.
- Não trate nomes, artes e lore provisórios como decisões definitivas.

## Ciclo de feedback
- Durante a implementação, execute primeiro o teste de serviço pertinente: `npx vitest run caminho/do/teste.test.ts`; quando apropriado, `npx vitest run --changed origin/main`.
- Execute `npm run check` para alterações Svelte/TypeScript e `npx eslint caminho/do/arquivo` para os arquivos alterados. Amplie a cobertura se a mudança afetar várias áreas.
- Durante a prototipagem no laboratório, priorize a interface desktop e verifique localmente apenas os fluxos alterados. Adie ajustes e testes específicos de mobile; preserve a responsividade já existente. Na integração, execute e respeite também os testes mobile obrigatórios da CI. Use filtros de Playwright quando apropriado; E2E de produção depende de build prévio, conforme README.
- Não alegue que testes ou experiência visual passaram sem executá-los. Os testes selecionados não substituem as verificações obrigatórias do PR.
- Não execute `npm run verify` e as suítes completas repetidamente por rotina a cada edição; rode-as quando o risco pedir e mantenha a CI obrigatória na integração.

## Dois ritmos: prototipagem e integração
- **Laboratório / prototipagem:** priorize desktop e ciclos curtos de alteração → prévia local funcional → avaliação do usuário. Agrupe mudanças relacionadas na mesma branch de trabalho local, sem push, novo PR, suíte completa ou publicação a cada detalhe. Antes de fornecer URL, confira rota/commit e interação no navegador.
- **Verificação local:** rode o menor conjunto útil de testes e checagens ligados à alteração. Não ignore erros já observados; mudanças em persistência, recompensas, migrações ou dados exigem validação imediata proporcional ao risco.
- **Fechamento de um lote aprovado:** faça os testes completos apropriados e então envie os commits e abra/atualize PR para CI obrigatória, revisão e merge na `main`. Se já existir PR aberto, novos pushes podem disparar CI automaticamente; prefira iteração local até o lote estar pronto. Não mude gatilhos nem contorne políticas da branch para evitar checks.
- **Mobile temporariamente adiado durante a prototipagem:** não investir em polimento ou rodadas de teste móvel a cada pequena interação; preserve o comportamento existente e valide mobile no fechamento da entrega se exigido pela CI ou pelo risco da mudança.
- **Rapidez significa tempo até a primeira prévia usável**, separado de testes completos, espera por CI e publicação. Documente gargalos concretos e melhorias reutilizáveis, sem burocracia extra.

## Melhoria contínua da velocidade
- Enquanto implementa, identifique gargalos observáveis (leitura de código, testes, build, ferramentas, retrabalho). Priorize concluir o comportamento pedido.
- Se uma melhoria for pequena, segura, diretamente relacionada e reduzir trabalho repetido, implemente-a na tarefa; mantenha o diff mínimo e valide o comportamento.
- Para gargalos recorrentes, prefira mecanismos reutilizáveis (componentes, funções, scripts ou orientação curta) a soluções copiadas. Não antecipe abstrações sem segundo caso de uso ou necessidade clara.
- Não interrompa a entrega para refatorações extensas, mudanças arriscadas ou otimizações sem evidência; registre-as separadamente com custo e benefício esperados.
- Evite gastar mais tempo otimizando o processo do que o benefício plausível para as próximas entregas. Se a otimização aumentar o escopo, finalize primeiro a tarefa principal.
- Quando houver medidas reais, registre tempo de investigação, implementação, testes e CI separadamente. Não confunda tempo de execução de um teste com duração total da tarefa nem invente economia futura.
- Documente apenas aprendizados reutilizáveis e relevantes, sem repetir regras existentes. Proteções e testes obrigatórios permanecem inalterados.

## Proteções inegociáveis
- Trabalhe em branch própria; não faça push direto na `main` nem modifique a origem instalada `http://127.0.0.1:5174`.
- Use dados sintéticos nos testes. Não importe, reinicie ou manipule o banco pessoal do navegador.
- Toda mudança em saldos, recompensa, persistência ou migração exige testes de consistência, duplicação, atualização e reversão relevantes.
- Não enfraqueça CI, testes PWA, auditoria de segurança ou proteção de branch para acelerar uma entrega.

## Relatório final enxuto
Informe: comportamento entregue, arquivos modificados, testes efetivamente executados, resultados/limitações e pendências. Separe tempo de investigação, implementação, testes locais e espera por CI/publicação **se essas medições estiverem disponíveis**; não invente durações.
