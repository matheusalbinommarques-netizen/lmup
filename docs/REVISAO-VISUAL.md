# Revisão visual sob demanda (Playwright)

## Objetivo
Produzir **evidências visuais**, não confundir "CI verde" com aprovação de aparência. A execução gera PNGs por tela e largura, metadados JSON, `manifest.json` e `index.html` (galeria local). Um humano ou assistente precisa abrir e **analisar as imagens**; o job não substitui o julgamento visual.

## Segurança e isolamento
- Usa `npm run build` + `npm run serve:build` na CI, endereço fixo `127.0.0.1:4174`. **Nunca** a instalação local `127.0.0.1:5174`.
- Cada teste do Playwright usa novo contexto do navegador e banco IndexedDB descartável. Quando preenchido, é **apenas com dados sintéticos**. Não importa backup, storageState nem cookie pessoal.
- Bloqueia solicitações HTTP(S) para hosts que não sejam `localhost` ou `127.0.0.1` e bloqueia Service Workers durante a captura. Os testes PWA do pipeline obrigatório continuam separados.
- Os resultados são ignorados pelo Git, disponibilizados como artefatos do Actions por **14 dias**. Não incluir credenciais ou dados reais nos testes.

## Executar
Depois que `.github/workflows/visual-review.yml` entrar na `main`:

1. GitHub → **Actions** → **Revisão visual LMUP** → **Run workflow**.
2. Selecionar a branch que contém as alterações a avaliar (precisa ter o workflow; atualizar a branch se ela for anterior à instalação).
3. Selecionar **world**, **core** ou **all**.
4. Ao concluir, abrir a execução → **Artifacts** → baixar `visual-review-...`.
5. Descompactar o ZIP e abrir **`index.html`** num navegador. Imagens em diretórios `desktop-1440`, `mobile-390` e `mobile-320`; metadados individuais, `manifest.json` e eventuais traces do Playwright também ficam no artefato.

Na primeira PR que adiciona/edita estas ferramentas, a CI de revisão visual roda automaticamente para validá-las. Nos demais PRs o job é **sob demanda** e não altera os checks obrigatórios `verify (22)`/`verify (24)`.

## Escopos atuais
- **world**: mapa, atlas, diário do Mundo, campanha/objetivos do Oásis, cena de exploração.
- **core**: Hoje vazio, formulário e Hoje com missão sintética; Missões, Herói, Acampamento.
- **all**: ambos.

O teste navega para a campanha usando o link real `Campanha e objetivos`; isso permite capturar a campanha antiga antes da retirada do piloto e a `/mundo/campanha` após o PR correspondente. Os metadados registram o caminho real aberto. Se a navegação estiver quebrada, o teste falha.

## Revisão e comparações
- Conferir **aspecto visual**, legibilidade, consistência dos controles, alinhamento, quebras, cortes e imagens. O JSON registra transbordo horizontal e imagens que já falharam ao carregar.
- Para **antes/depois**, gerar artefatos separados para `main` e branch proposta (mesmo escopo); confrontar PNGs de mesma largura e cena. A ferramenta não afirma calcular automaticamente um diff visual.
- O upload é `always()`: em caso de falha funcional, as capturas obtidas antes da falha continuam disponíveis.
- Se o assistente não conseguir abrir os bytes dos artefatos pelo conector, o ZIP pode ser anexado na conversa para inspeção. Não declarar inspeção visual sem **ver as imagens**.

## Limitações
- Imagens de telas não capturadas não são analisadas. Estados dependentes de ações devem ser adicionados de forma reprodutível aos testes conforme o PR.
- Capturas em Chromium/Linux podem diferir do Chrome/Windows do usuário (fontes/renderização).
- Uma captura pode mostrar problemas que os testes não reconhecem; a aprovação visual é uma decisão separada da aprovação funcional.
