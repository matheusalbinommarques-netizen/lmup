---
name: claude-design-lmup
description: Ler e revisar o projeto do Claude Design do LMUP ("LMUP Revisão e Proposta") gastando pouco contexto — DesignSync, github.md antes de baixar, extração de arquivos grandes e checagem contra o app e o código. Use quando o autor colar um link claude.ai/design do LMUP ou pedir revisão do design.
---

# Claude Design do LMUP

Projeto: "LMUP Revisão e Proposta", id `76785845-c534-4bc9-b4ab-efdec7ce950d`. Arquivos: `LMUP Hoje`, `Linha de Missão`, `LMUP Fluxos`, `LMUP Planejamento`, `LMUP Evolução`, `LMUP Sistema`, `LMUP Revisão` (todos `.dc.html`), mais `github.md`.

## Acesso

- Use `DesignSync` (`get_project`, `list_files`, `get_file`). Se pedir autorização, o autor precisa rodar `/design-login` uma vez num terminal com `claude` interativo (digitar só `/design-login`, não "run /design-login").
- O navegador embutido tem login separado; não é o caminho preferido.

## Ler sem desperdiçar contexto

1. Leia `github.md` primeiro. Se a data de "Last sync" e a lista "Updated in this project" não mudaram desde a última revisão, os arquivos provavelmente não mudaram: diga isso ao autor em vez de baixar tudo.
2. Baixe só o arquivo do link e os que o `github.md` diz que mudaram.
3. Arquivos acima de ~50 KB (o Hoje passa de 70 KB) vão para arquivo de resultado. Extraia por script em Python (`-I`, gravando a saída em arquivo UTF-8, porque o console do Windows quebra com "≈" e "◆"): texto visível sem estilos e o bloco `<script type="text/x-dc">`, onde ficam os dados de exemplo.
4. Para conferir se um ajuste entrou, procure termos no arquivo (contagem e contexto) em vez de reler.

## Revisar

- Compare com o app real (prévia com dados sintéticos) e com o código; confirme afirmações do design no código antes de repeti-las.
- Separe: o que está certo, o que corrigir (dados que o app não tem, conflitos com decisões fechadas, acessibilidade) e o que é detalhe de implementação.
- Decisões fechadas estão em `docs/PLANO-DIA-UNICO.md` e na seção 6 do arquivo `LMUP Revisão`.
- Quando houver ajustes, entregue um bloco pronto para o autor colar no Claude Design.
- Restrições permanentes: sem arte nova (pinturas só recortadas), ícones Lucide empacotados (pedido do autor), dourado só na ação principal, 44 px no toque, alternativa a arrastar.
