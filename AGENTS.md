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
- Para interface, teste a jornada afetada em desktop e mobile; use filtros por arquivo/projeto do Playwright. Testes E2E de produção dependem de build prévio, conforme README.
- Não alegue que testes ou experiência visual passaram sem executá-los. Os testes selecionados não substituem as verificações obrigatórias do PR.
- Não execute `npm run verify` e as suítes completas repetidamente por rotina a cada edição; rode-as quando o risco pedir e mantenha a CI obrigatória na integração.

## Proteções inegociáveis
- Trabalhe em branch própria; não faça push direto na `main` nem modifique a origem instalada `http://127.0.0.1:5174`.
- Use dados sintéticos nos testes. Não importe, reinicie ou manipule o banco pessoal do navegador.
- Toda mudança em saldos, recompensa, persistência ou migração exige testes de consistência, duplicação, atualização e reversão relevantes.
- Não enfraqueça CI, testes PWA, auditoria de segurança ou proteção de branch para acelerar uma entrega.

## Relatório final enxuto
Informe: comportamento entregue, arquivos modificados, testes efetivamente executados, resultados/limitações e pendências. Separe tempo de investigação, implementação, testes locais e espera por CI/publicação **se essas medições estiverem disponíveis**; não invente durações.
