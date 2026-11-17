# Auditoria de segurança da CI

`npm run audit:security` (`scripts/audit-security.mjs`) roda o `npm audit --json` real e aplica a política de `scripts/audit-policy.mjs`. É obrigatório nos dois jobs da CI (Node 22 e 24).

## Regras

- Reprova qualquer advisory moderado, alto ou crítico. Alertas baixos e informativos não bloqueiam, como antes (`--audit-level=moderate`).
- A única saída é uma exceção temporária em `scripts/audit-exceptions.json`, por **identificador de advisory** (GHSA), com pacote, intervalo afetado, validade, quem aprovou, data e motivo. A contagem de entradas do relatório não é critério: uma vulnerabilidade aparece em todos os pacotes da cadeia que a trazem.
- O relatório é lido com a cadeia transitiva: cada entrada moderada ou acima precisa chegar só a advisories com exceção. Outro advisory no mesmo pacote, ou um advisory próprio de um pacote que também está na cadeia, reprova.
- A exceção só cobre o advisory se o pacote e o intervalo do relatório forem os registrados. Intervalo diferente reprova (pode indicar correção).
- Reprova quando a exceção vence (vale até a data, inclusive; data em UTC), mesmo que o advisory já não apareça.
- Reprova quando surge correção publicada, verificada em duas fontes que não dependem do relatório:
  - base de advisories do GitHub (`first_patched_version`, intervalo afetado, advisory retirado);
  - versões do pacote no registro do npm: qualquer versão acima do intervalo registrado reprova até a revisão.
- O campo `fixAvailable` do `npm audit` não é usado: ele indica outra resolução da árvore, muitas vezes um rebaixamento incompatível, e não prova que existe versão segura.
- Reprova em qualquer dúvida: `npm audit` sem relatório, código de saída inesperado, JSON inválido, contagens que não conferem, cadeia citando pacote ausente, consulta ao GitHub ou ao registro que falha ou responde incompleto.
- Quando aprova com exceção, o log diz qual advisory foi aceito, até quando e quais entradas cobre; na CI isso vira uma anotação de aviso no check. Exceção sem uso é apontada para remoção.
- Sem `npm audit fix --force`, sem rebaixar dependências e sem desligar a auditoria. As regras têm testes com relatórios sintéticos e sem rede (`npm run test:audit`, também dentro de `npm run verify`).

## Exceções vigentes

| Advisory                                                                 | Pacote e intervalo   | Válida até | Decisão                      |
| ------------------------------------------------------------------------ | -------------------- | ---------- | ---------------------------- |
| [GHSA-fc5q-39xc-vjpf](https://github.com/advisories/GHSA-fc5q-39xc-vjpf) | `picomatch` <= 4.0.7 | 17/12/2026 | Autor do projeto, 17/11/2026 |

**GHSA-fc5q-39xc-vjpf** (ReDoS por extglobs repetidos de ramo único, alta). Em 17/11/2026 não havia versão corrigida: o advisory não informa `first_patched_version` e 4.0.7 é a última versão publicada. Exposição avaliada:

- `picomatch` chega por vite, vitest, tailwindcss, typescript-eslint, svelte-check e lint-staged; é usado no build e nas ferramentas de desenvolvimento.
- O app publicado é estático (adapter-static). O bundle em `build/_app` não contém `picomatch`, e o app não processa padrões glob de terceiros. Nenhum script de `scripts/`, `pwa/` ou `src/` importa `picomatch`, `vite`, `tinyglobby`, `micromatch`, `fast-glob` ou `chokidar` em tempo de execução.
- O npm conta a cadeia como produção (`npm audit --omit=dev` ainda acusa) porque `@sveltejs/kit` está em `dependencies`; mover o pacote fica fora desta decisão.

Isso não prova ausência de risco nas ferramentas de build; justifica aceitar o risco por tempo limitado. Revisar até a validade: atualizar a dependência quando houver correção, ou pedir nova decisão do autor.

## Limite conhecido

A publicação local (`scripts/local-security-policy.mjs`, usada pela sincronização da instalação) tem regras próprias e bloqueia qualquer alerta alto, sem exceção. Ela não lê este arquivo e não foi alterada.
