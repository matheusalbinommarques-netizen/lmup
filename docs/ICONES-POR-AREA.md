# Ícones por área — prévia para avaliação

## Comportamento

A área é a fonte do ícone. Hoje, Lista, Agenda (dia/semana), Recuperação, sequência de rotinas e seleção de atividades usam o mesmo resolvedor. Onde uma sessão reutiliza a execução existente, essa composição permanece preservada. O formulário de missão apresenta o ícone herdado e acesso ao editor de áreas; não permite escolher um ícone individual.

Gerenciar áreas permanece visível junto ao filtro de área na Lista. O editor cria áreas com ícone opcional e permite alterar nome e símbolo, usando a biblioteca visual aprovada. Missões sem área ou com área sem símbolo usam o ícone padrão de Missões; os nomes permanecem visíveis.

## Compatibilidade e adoção

- Campos opcionais `Area.iconKey` e `Area.iconConflict`; Dexie permanece no schema 6 e backup no formato 4.
- Na inicialização e restauração de backup, áreas antigas sem `iconKey` adotam o único ícone explícito válido de suas missões, incluindo arquivadas.
- Conflitos recebem `null` e uma indicação no editor. Áreas sem ícones anteriores recebem `null` sem aviso de conflito.
- Uma escolha explícita, inclusive neutra, não é substituída em inicializações futuras. Operação transacional e idempotente entre abas.
- `Task.iconKey`, versões de planejamento, execuções e recibos legados permanecem intactos. Os ícones individuais deixam de controlar a interface.
- Alterar o ícone da área não regrava suas missões. Reatribuição/exclusão de área resolve o ícone pela área atual de destino, sem reescrever classificação econômica histórica.
- Chaves inválidas de ícone em áreas são recusadas na gravação e antes da importação. Backups antigos continuam aceitos.

## Validação realizada

- 45 testes unitários direcionados: adoção, conflitos, escolha neutra, idempotência/concorrência, reatribuição/exclusão de área, backup antigo/novo, ícones inválidos e preservação de saldos/recibos.
- 18 cenários E2E únicos desktop/mobile: quatro novos de herança/conflitos/propagação entre abas e 14 existentes de organização e integração visual, aprovados no build final. Falhas iniciais dos novos testes vieram do acesso recolhido em Mais filtros e de seletores; acesso foi tornado visível e seletores corrigidos, preservando as verificações funcionais. Somente os casos ainda afetados foram repetidos depois da correção dos seletores.
- Quatro cenários PWA únicos desktop/mobile: criação e recarga offline com ícones por área e primeira navegação pelas seis telas/biblioteca visual. Os novos casos foram repetidos após corrigir o seletor do campo Área.
- Svelte/TypeScript: zero erros e avisos. ESLint direcionado aprovado. Build de produção aprovado; 246 entradas no precache, aproximadamente 15,69 MB, sem novas artes.
- Prévia de desenvolvimento em `http://127.0.0.1:5188/missoes`, separada da instalação pessoal. Conferência adicional com duas missões sintéticas, alteração de área e recarga nas larguras 1440, 390 e 320 px; capturas fora do repositório. Resultado detalhado dessa conferência acompanha a entrega.
- Navegador integrado não conectou; automação realizada com Chrome em contextos descartáveis. Sem certificação em aparelho físico.

Os testes existentes de seleção individual de ícones foram adaptados ao comportamento aprovado de herança por área, mantendo verificações de rascunhos, rotinas, sessões, navegação, ausência de transbordamento, recompensas e imagens offline.

## Isolamento e revisão

Branch `feat/area-icons`, baseada em `origin/main` no commit `bbcaf277c0b65938b36b38e081d91f9d99250147`, após atualizar as referências. A branch anterior `codex/beta-redesign` foi preservada; as outras cópias com alterações locais, incluindo o acampamento, não foram modificadas. Nenhuma mudança em Mundo, exclusão de missões, economia ou publicação. Porta 5174 e dados pessoais não foram acessados nos testes.

Aguardar avaliação do usuário antes de integrar e antes de iniciar a próxima frente. PR e verificações obrigatórias de integração permanecem pendentes; não houve push, CI ou publicação nesta prototipagem.

## Verificação de integração iniciada e suspensa

O PR #47 permanece em rascunho, sem merge, por decisão do usuário de avaliar as três frentes juntas. A primeira CI aprovou Node 22 e os testes funcionais de Node 24, mas identificou dois seletores antigos de Renomear no teste offline de áreas. O seletor foi atualizado para Editar, preservando todas as verificações; os dois cenários desktop/mobile passaram localmente contra a prévia preservada. A correção fica local até a aprovação conjunta, sem nova execução de CI durante a prototipagem.
