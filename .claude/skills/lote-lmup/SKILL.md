---
name: lote-lmup
description: Conduzir um lote de implementação do LMUP do início ao PR — worktree a partir de origin/main, prévia em porta própria com dados sintéticos, capturas desktop/mobile, testes por camada e PR no modelo. Use ao começar, retomar ou fechar qualquer lote (ex.: lotes do plano Dia único).
---

# Lote do LMUP

Regras de fundo: `AGENTS.md` (camadas L0–L4, proteções) e `docs/ESTADO.md` (seção **Agora** diz o lote atual). Merge só com autorização explícita do autor por PR; prévia aprovada antes de commit/PR.

## 1. Começar

```bash
git fetch origin
git worktree add .claude/worktrees/<lote> -b <tipo>/<lote-curto> origin/main
cd .claude/worktrees/<lote>
npm ci
npx svelte-kit sync   # sem isso o vitest falha com "Cannot find module ./.svelte-kit/tsconfig.json"
```

O checkout principal fica numa branch antiga: nunca desenvolva nele e leia docs de `origin/main` ou da worktree.

## 2. Implementar e testar (camadas)

- L0 a cada ajuste: `npx eslint <arquivo>`, `npx vitest run <teste>`.
- L1 antes da prévia: `npm run check`, `npx vitest run`.
- L2/L3: `npm run build`, depois `npx playwright test <specs afetadas>` nos dois projetos (desktop e mobile). Os E2E servem o build na porta 4174 (`playwright.config.ts`).
- Mudança em saldo, recompensa ou persistência: teste de consistência, duplicidade e estorno. O estorno do app (`undoTask`) vira `rewardDebt`, não devolve saldo.
- Correção de bug: rode o teste novo contra o código antigo e confirme que **falha**. Para trocar arquivos temporariamente use commit WIP ou `git stash push -u -m <tag>`, nunca cópias avulsas (no Git Bash `/tmp` e o scratchpad são lugares diferentes).
- Corridas de UI: dispare a ação e a digitação na mesma tarefa (`page.evaluate`), senão o teste passa no código quebrado.

## 3. Prévia

1. Wrapper fora do Git, em `.claude/serve-preview.mjs` da worktree:
   ```js
   process.env.LMU_PREVIEW_PORT = '5180'; // 5180+, nunca 5174
   await import('../scripts/serve-static.mjs');
   ```
2. Entrada em `.claude/launch.json` do **checkout principal** (o painel lê esse arquivo), apontando para o wrapper; depois `preview_start` pelo nome.
3. Dados sintéticos e capturas: veja [previa.md](previa.md). Nunca use a origem 5174 nem o banco pessoal.

## 4. Fechar

- Atualize `docs/ESTADO.md`: seção **Agora** e, se houver lição reutilizável, uma linha em "Entregas recentes" (linhas curtas para o Prettier não realinhar a tabela inteira).
- Commit só dos arquivos do lote (nada de `.claude/` auxiliar), mensagem no estilo `feat(area): …` com a linha de coautoria.
- `git push -u origin <branch>` e `gh pr create` com o modelo `.github/pull_request_template.md`: só testes que rodaram; tempos "não medido" quando não medidos.
- Vincule o PR (`ccd_pr`); Auto-fix corrige só falha causada pelo lote, em no máximo uma rodada, sem enfraquecer testes.
- O hook de pré-commit (lint-staged) usa a pilha de stash compartilhada entre worktrees: não deixe stashes próprios pendentes ao commitar.
- Ao terminar: atualize a memória `lmup-plano-implementacao` e a seção **Agora**.
