# Manutenção das dependências — 31/10/2026

## Objetivo e escopo

Remover os bloqueios **moderados** da auditoria npm sem ocultar avisos,
forçar instalações incompatíveis ou alterar o armazenamento pessoal do LMUP.
Esta manutenção foi feita em `chore/security-dependencies`, criada a partir
de `feat/home-rpg-reference`. A branch `release/lmup-local` não foi alterada.

## Antes e depois

| Métrica | Antes | Candidata de manutenção |
| --- | ---: | ---: |
| Entradas de pacotes no lockfile | 695 | 411 |
| Alertas moderados | 20 | **0** |
| Alertas baixos | 6 | **5** |
| `workbox-build` | 7.4.1 | **removido** |
| `glob` vulnerável | 11.1.0 | **ausente do lockfile** |
| `minimatch` vulnerável | 3.1.5 / 5.1.9 / 9.0.9 / 10.2.6 | **11.0.3** |
| `eslint` | 9.39.1 | 10.14.0 |

O comando original `npm run audit:security` continua executando
`npm audit --audit-level=moderate`. Não foi afrouxado, e a política local de
aprovação por commit e lockfile continua bloqueando alertas moderados novos.

## Mudanças

1. `scripts/local-precache.mjs` seleciona apenas os recursos estáticos
   explicitamente autorizados, calcula a revisão MD5 por arquivo e rejeita
   ausência do shell offline, symlinks e recursos selecionados acima de 3 MiB.
   Uma etapa temporária de CI comprovou equivalência do manifesto com o gerado
   pelo Workbox no build real antes de sua remoção.
2. `workbox-build` foi removido de `package.json` e do lockfile.
   O service worker próprio em `pwa/worker.js` e o protocolo de atualização
   não foram substituídos.
3. ESLint 10 e a família TypeScript ESLint 8 foram atualizados; a dependência
   transicional `minimatch` passou para 11.0.3 por override explícito.
4. `svelte-check` foi mantido em 4.3.3 por compatibilidade de diagnóstico
   com os componentes atuais; `svelte-eslint-parser` segue dentro da faixa
   aceita pelo plugin. O novo lint exige preservar `cause` em quatro erros
   de processos locais, ajustados sem desabilitar a regra.
5. O workflow temporário de geração do lockfile foi **removido** após uso.
   O lockfile final é versionado e obrigatório para `npm ci`.

## Alertas restantes e limites

Restam **cinco registros de severidade baixa**. `npm audit --audit-level=moderate`
retorna sucesso com esses avisos, mas eles não devem ser descritos como
corrigidos. Mantê-los acompanhados e revisar correções compatíveis em
manutenção posterior. Caso surjam novos moderados/altos/críticos, o pipeline
voltará a bloquear.

A atualização principal do ESLint e a remoção de uma ferramenta de build
exigiram testes de regressão completos; equivalência de manifesto isolada
não substitui testes PWA com cache offline, notas, recompensas e importação.

## Gate antes de promoção

- `npm ci` a partir do lockfile comprometido;
- `npm run verify`, em Node 22 e 24;
- `npm run test:e2e` e `npm run test:pwa` no Chromium;
- `npm run test:package`;
- `npm run audit:security` com saída **sem alertas moderados**;
- revisão explícita do commit final e do comportamento da versão instalada.

**Nenhuma publicação local nem promoção de branch estável faz parte desta
manutenção até que o gate esteja aprovado.**
