# Prévia: dados sintéticos e capturas

## Capturas

O painel do navegador costuma ficar oculto e aí `screenshot` falha. Use o script desta pasta, que roda o Chromium do Playwright sem janela:

```bash
node .claude/skills/lote-lmup/capturar.mjs <porta> <pasta-de-saida> [rota ...]
# rotas sem barra inicial (o Git Bash converte "/x" em caminho do Windows)
# ex.: node .claude/skills/lote-lmup/capturar.mjs 5180 "<scratchpad>/capturas" hoje missoes roda
```

Ele abre cada rota em desktop (1440×900) e mobile (390×844), semeia a persona abaixo numa origem nova e salva `desktop-<rota>.png` e `mobile-<rota>.png`. Rode da raiz da worktree (resolve `@playwright/test` do `node_modules`). Para capturas de estados (depois de um clique, por exemplo), copie o script para `.claude/` da worktree e ajuste.

## Persona sintética

"Veterano travado": áreas ligadas a domínios da Roda, focos em Casa e Relações, rotinas diárias com e sem hora fixa, pendências avulsas paradas há 18–30 dias (duas com importância alta) e uma recente. Serve para ver selos, paradas, foco e hora fixa. Datas são relativas a hoje.

Regras:

- Sempre numa origem própria (porta 5180+ ou `127.0.0.1` vs `localhost`); nunca na 5174.
- Saldos do perfil não são recalculados pelo script: não trate nível/ouro da prévia como achado.
- Testes E2E semeiam do mesmo jeito (`page.evaluate` no IndexedDB `LevelMeUpDB`); exemplo completo em `tests/e2e/day-row.spec.ts`.
