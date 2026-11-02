# Consolidação visual — candidato local para avaliação

Base conferida por API e fetch no GitHub: `425ec7f51cb19309f8ab7e1732be1f25cf510ae4`. Branch local: `integration/visual-approved-20261102`. Checkout independente em `D:\Projetos\LMUP-integracao-visual-20261102`. Candidato preparado para PR, sem merge ou publicação no aplicativo principal.

## Conteúdo

Hoje, Lista, Rotinas, Dia, Semana e Recuperação usam a árvore final de `feat/visual-integration` em `missoes-produtividade`, incluindo a rodada da galeria `correcoes-integradas`. Foram transportados componentes compartilhados, estilos, testes e artes selecionadas. Nenhuma rota de laboratório, código de acampamento, configuração local, dado pessoal, log, cache ou build foi transportado para o lote de código.

A adaptação mantém criação disponível também com missões sem data, seleção manual entre ocorrências flexíveis e um único botão principal de criação quando o plano está vazio ou concluído. Missões legadas abrem a execução anterior, conservando notas e sem criar uma ocorrência. O componente existente HeroIdentity foi mantido no bloco inferior de Hoje, preservando perfil, equipamento, XP, ouro e comida. Serviços de recompensa, ocorrência, rotina, projeto e sessão permanecem equivalentes à main.

## Dados e ícones

`Task.iconKey` é opcional e não indexado. Dexie permanece no schema 6 e o backup no formato 4. Backups antigos sem o campo continuam aceitos. Campo omitido em edição preserva a escolha; null restaura o padrão. Criação e importação usam a mesma lista de chaves permitidas. Caminhos arbitrários, objetos e chaves de protótipo são recusados antes de qualquer restauração. A interface usa o livro aprovado quando não há ícone ou a leitura encontra uma chave desconhecida. Nenhum saldo ou histórico é recalculado para incluir ícones.

## Pacote gráfico e offline

Foram selecionados 53 símbolos em PNG 64/128, quatro símbolos de navegação aprovados nas mesmas resoluções e cinco pinturas WebP sem perda: 119 arquivos, 13.029.515 bytes. Os PNGs mantêm seus bytes. Todas as pinturas foram comparadas em RGBA: dimensões e pixels idênticos aos PNGs fornecidos, sem perfil de cor adicional nas entradas. Originais, variantes 256/512 e chips não selecionáveis permanecem na fonte/backup e não entram neste lote.

O manifesto em `static/art/approved/manifest.json` registra hashes e procedência. A autorização registrada é o uso das artes fornecidas no LMUP; não foi atribuída nova licença individual.

Os 119 gráficos entram explicitamente no precache. O limite anterior de 3 MiB por arquivo foi mantido. Build final: 246 entradas, 15.690.714 bytes no build de validação (a identificação muda com o código); protocolo 1 e schema 6. O código de sincronização, proteção de branch e protocolo de atualização entre abas não foi alterado.

## Validação realizada

- 68 testes direcionados de ícones, backup, produtividade e prioridade aprovados após preparar os metadados do checkout.
- Rodada consolidada: 235 testes unitários em 20 arquivos aprovados; quatro testes de precache aprovados; lint e tipos aprovados; build de produção aprovado.
- 102 cenários E2E únicos selecionados, desktop/mobile, aprovados ao final. Cobrem coleção, sessões, projetos, produtividade, migração real v5→v6, perfil, progresso, marcos do Refúgio e os novos fluxos visuais.
- 34 cenários PWA únicos, desktop/mobile, aprovados ao final: offline, backup, notas, atualização entre abas, formulário aberto, cache indisponível, cliente legado e primeira navegação pelas seis telas/biblioteca de ícones sem rede.
- A primeira rodada detectou duplicação de criação após concluir o plano e seletores antigos de testes. A duplicação foi corrigida; os testes passaram a usar os controles aprovados de rotina, recuperação e mapa, mantendo as mesmas verificações de dados e economia. Foram repetidos apenas os cenários afetados e concluídos os casos interrompidos; seis cenários de compatibilidade/captura acompanharam a correção funcional. Na inspeção das capturas, o componente de personagem precisou de encaixe local no rodapé de Hoje; após esse ajuste de CSS, dois cenários visuais e quatro offline afetados passaram novamente no build final. A página de perfil não foi alterada.
- Dados sintéticos, contextos descartáveis do Chrome e portas 4174/4274. O navegador integrado não conseguiu iniciar; a automação e as capturas usaram Chrome descartável. Nenhum perfil pessoal foi usado.

## Finalização da validação

A rodada consolidada final `npm run verify` passou: lint, tipos (zero erros/avisos), 240 testes unitários em 20 arquivos, 23 testes de infraestrutura/precache com diretórios temporários e build. Os 42 casos legados de Home/alpha/personalidade/organização foram concluídos com sucesso nos dois perfis; somente falhas e casos interrompidos foram repetidos após as correções. A espera pela URL no teste de áreas foi corrigida antes de guardar o endereço de retorno. Não se alterou o serviço de áreas.

## Avaliação e limites

Prévia: http://127.0.0.1:5199/. O armazenamento pertence a essa origem isolada; não foi importado o banco do aplicativo pessoal. A galeria usa seus próprios contextos descartáveis e dados sintéticos, sem preencher o navegador do usuário.

Os testes legados da Home foram revisados nesta finalização: nomes, composição, limite de sugestões, exemplos iniciais e controles intencionalmente substituídos passaram a usar a interface aprovada. Permanecem as verificações de notas, etapas obrigatórias no modo etapas, recompensa, desfazer, backup, prioridade, recorrência, identidade, teclado, contraste e ausência de transbordamento. As verificações de projetos e capítulos são feitas também nos destinos reais. Foram corrigidas regressões reais da Home: retomada da execução existente, limpeza de prioridade indisponível, contabilização visual de conclusões legadas e inclusão de revisões disponíveis. A normalização é somente de leitura; não migra nem recompensa registros. Cinco testes unitários adicionais cobrem esses casos.

A matriz obrigatória Node 22/24 será acompanhada no PR; seus resultados finais constam no relatório de entrega. Node local: 24.18.0. Aparelhos físicos e aprovação visual/funcional do usuário continuam pendentes antes de merge ou atualização do aplicativo. Não houve execução de publicação.

A instalação em 5174, seu sincronizador, a main, a fonte local e o backup de preservação não foram alterados.

Galeria final: 12 capturas, desktop 1536×1024 e mobile 390×844/DPR 2, com duas missões e uma rotina sintéticas e Recuperação vazia. Sem erros de página, imagens quebradas ou transbordamento horizontal. A recuperação preenchida e reagendada é coberta pelos E2E.

## Revisão do precache

Veja [análise do orçamento offline](VISUAL-PRECACHE-REVIEW.md). Não houve alteração do worker, protocolo de atualização, limites do cache ou regras de sincronização.

## Correções identificadas na primeira CI

A primeira matriz aprovou Node 22 e identificou oito falhas em Node 24, com 224 E2E aprovados: quatro expectativas obsoletas de títulos nas rotas de produção, duas expectativas de navegação em SVG (substituído pelos PNGs aprovados) e uma regressão real de espaçamento da aventura nos dois perfis. As expectativas mantêm recarga, ausência de erros e preferências entre abas; o teste dos ícones verifica agora também visibilidade e imagem carregada. O layout imersivo existente da aventura foi preservado contra os estilos compartilhados, sem mudar seu conteúdo. A verificação original de largura/altura foi mantida, acrescentando ausência das barras móveis.

Após essas correções, lint direcionado, build e os oito cenários afetados passaram localmente. Não se repetiu a suíte local completa. O precache passou a 15.690.963 bytes, mantendo as mesmas 246 entradas.

## Acabamento final da Home — avaliação visual de 02/11/2026

Ajustes restritos à apresentação em `Home.svelte` e `visual.css`: logotipo e Companheiros sem quebra excessiva, estado vazio de Próxima missão compacto, proporções mais adequadas ao personagem em O caminho adiante e dourado secundário mais discreto. Imagens, ícones, navegação, recursos, equipamentos e indicadores foram preservados. Em 320 px, o título Aventura permanece inteiro e a seta ocupa o canto inferior do cartão, evitando colisão com o texto. Nenhuma regra de economia, produtividade, persistência ou schema foi alterada.

O novo `tests/e2e/home-polish.spec.ts` cobre seis estados em contextos descartáveis: perfil novo, prioridade manual, cinco missões planejadas, duas conclusões com recompensas reais, rotina com horários e personagem com progresso/recursos/conquistas. Cada estado é avaliado em 1536, 1024, 390 e 320 px. Os testes verificam texto integral, indicadores, recompensas, horários, ausência de transbordamento/rolagem interna e as ações de criar/começar. As capturas e a galeria comparativa ficam fora do repositório: 24 antes e 24 depois, com dados sintéticos. A referência anterior é o commit e086862.

Medidas do perfil novo, em pixels CSS:

| Largura | Próxima missão antes → depois | O caminho adiante antes → depois |
| ------- | ----------------------------- | -------------------------------- |
| 1536    | 162 → 107                     | 208 → 174                        |
| 390     | 246 → 230                     | 603 → 550                        |
| 320     | 271 → 230                     | 629 → 576                        |

Validação local: lint direcionado aprovado; tipos sem erros/avisos; build aprovado. Uma rodada direcionada de 52 E2E passou, incluindo os testes existentes de Home, notas, etapas, recompensas, desfazer, backup, duplicação entre abas, contraste mínimo 4,5:1, texto ampliado, preferências, aventura e compatibilidade das seis telas. Os dois testes de primeira visita offline passaram. Após o último ajuste de título em 320 px, somente os 12 novos casos foram repetidos, com as 24 capturas finais e verificação de títulos em uma linha. Nenhum teste existente foi alterado ou enfraquecido. O candidato final segue para uma única matriz obrigatória Node 22/24; resultados finais são registrados no PR.

Prévia isolada em http://127.0.0.1:5199/. Instalação 5174, sincronizador, backup e acampamento preservados. A aprovação visual do usuário permanece necessária antes de merge/publicação.
