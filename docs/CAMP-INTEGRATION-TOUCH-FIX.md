# Acampamento — correção dos dois bloqueios de toque

Após a aprovação desktop, o usuário autorizou retomar somente os dois bloqueios mobile que impediam a CI. Esta rodada não amplia o desenvolvimento mobile nem redesenha a Home, mapa ou sprites.

## Causa e correção

O painel do edifício cobria o ponto de início do arraste do terreno. No celular ele agora tem altura limitada para deixar essa área do mapa disponível.

As ações de concluir/mover/remover ficavam em um segundo painel abaixo do painel de detalhes. No celular elas agora aparecem no próprio painel do edifício, e o painel contextual redundante fica oculto enquanto os detalhes estão abertos. Posicionamento, catálogo e confirmação de remoção continuam usando os controles existentes. As regras de produção, economia e persistência não mudaram.

A alteração é restrita a `src/lib/camp/Camp.svelte`, ao reforço do teste em `tests/e2e/camp-integrated.spec.ts` e a este registro. No teste de câmera, o arraste com edifício selecionado agora precisa mudar efetivamente a transformação do mapa. Não foram removidas verificações, usados cliques forçados ou alteradas configurações de CI.

## Validação direcionada

- ESLint dos dois arquivos de código: aprovado.
- Checagem Svelte/TypeScript: zero erros e avisos.
- Build de produção: aprovado; 263 entradas e 25.883.145 bytes de precache, protocolo 1 e schema 6. As mesmas artes continuam selecionadas, sem arquivos gráficos adicionais.
- Acampamento E2E desktop e mobile: dez aprovados, dois skips originais de gestos/destruição exclusivos de desktop. Inclui câmera/seleção/zoom, produção, conclusão, trabalhadores, fabricação, recarga, outra aba, exportação/restauração e controles em 320 px.
- Acampamento PWA desktop e mobile: quatro aprovados, cobrindo primeira visita offline, fabricação/estoque/recarga e atualização bloqueada por prévia em outra aba.
- Capturas e logs ficam fora do repositório; dados sintéticos e contextos descartáveis.

A bateria consolidada anterior continua registrada no PR: 307 unitários, 24 testes dos scripts, 127 casos desktop validados, 19 PWA desktop e cinco verificações de pacote. A CI obrigatória Node 22/24 do novo candidato deve confirmar novamente o conjunto completo; o resultado fica no PR #48.

## Limites preservados

A falha original do Node 24 no primeiro candidato está preservada no histórico da CI. Não foi contornada com exclusões ou alterações de workflow. Demais melhorias mobile e testes em aparelhos físicos ficam fora deste ajuste.

Não houve alteração de schema, serviços econômicos, regras de produtividade, dependências, artes/licenças, sincronizador, publicação, instalação 5174, backup ou fontes recuperadas. A entrega continua em branch própria, sem merge ou publicação.
