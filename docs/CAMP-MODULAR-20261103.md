# Acampamento cinematográfico — continuação da prova aprovada

03/11/2026 · branch `feat/camp-modular-continuation` · checkout `D:/Projetos/Level Me Up`.

Prévia navegável: http://127.0.0.1:5308/refugio/acampamento.
Galeria comparativa: `D:/Codex-artifacts/camp-modular-20261103/GALERIA.html`.
Evidências, logs e inventário completo: `D:/Codex-artifacts/camp-modular-20261103/`.

## Resultado entregue

A prova aprovada do Jardim foi reutilizada no Centro. Árvore, vegetação, sombra de contato, primeiro plano e runas são camadas independentes; o fundo permanece fixo durante a evolução. Centro e Jardim usam os mesmos quatro arquivos de árvore e a mesma fonte de estágio, pelos limiares existentes de 0, 2.500, 7.500 e 12.000 XP.

O Centro começa vazio. A conversa com o caseiro confirma uma única compra de 50 ouro e habilita simultaneamente Aposentos, Bestiário e Jardim. A operação usa transação e o recibo original `camp-preview:residence:built`: repetição da confirmação e duas abas não cobram novamente. Links de áreas ainda não construídas retornam ao Centro.

Aposentos abre diretamente o interior original anexado. Equipamentos e Coleção reutilizam o componente de inventário existente; Troféus e Registros reutilizam Conquistas e Progresso. Os painéis permanecem sobre o interior. Equipamentos e Coleção compartilham a consulta atual do inventário; esta entrega não cria um sistema adicional de equipamento. Não existe uma segunda área externa da casa.

O cavalo foi removido das pinturas do Centro e do Bestiário. No Bestiário, o painel lista somente companheiros descobertos; disponibilidade por nível e seleção antiga, isoladamente, não contam como descoberta. O cenário não adiciona criaturas decorativas fictícias. A exibição física dos companheiros na paisagem fica para um incremento visual futuro; o painel reaproveita consulta, seleção, cuidado e evolução existentes. Uma companhia conhecida foi alimentada offline nos testes sintéticos.

Outras áreas abre apenas “Região em preparação”, com retorno ao Centro. Os serviços, estado e recibos da economia antiga permanecem internamente, sem sua interface nesse fluxo.

Os rótulos da pintura do Centro foram removidos e substituídos por controles HTML acessíveis, sempre presentes e posicionados em coordenadas proporcionais. Foram eliminados os controles antigos de mostrar cena/ocultar indicações e as setas de navegação lateral. No celular, a cena pode ser deslizada horizontalmente; todos os acessos também aparecem abaixo, com alvos de pelo menos 44 px. Teclado e preferência por movimento reduzido foram verificados.

## Persistência e isolamento

- Demonstração em `http://127.0.0.1:5308`, banco `LevelMeUpCampCinematicPreview`, mantendo nome e schema 6 do protótipo anterior.
- O estado existente e seu saldo não são reprovisionados. Foi testada uma instalação sintética antiga com 37 ouro, 88 comida e construção já paga, conservada sem alteração de versão, época ou saldo.
- Uma demonstração nova começa com 50 ouro, 120 comida, nenhum companheiro descoberto e Centro vazio.
- As ferramentas de teste simulam o estágio imediatamente e persistem uma substituição visual compartilhada. Não modificam `totalXpEarned`, nível, saldo, bônus ou recibos de recompensa. “Usar XP atual da demonstração” remove essa substituição.
- “Reiniciar demonstração” exige confirmação. Cria um snapshot sintético de recuperação e reinicia a demonstração atomicamente; preserva o estado opaco e os recibos da economia antiga. Confirmações abertas antes do reinício/restauração são recusadas.
- Os comandos do protótipo verificam a flag de compilação e o nome do banco antes de operar. A compilação normal continua utilizando o banco normal e as telas anteriores.
- Testes executados em origens próprias 5318, 4174 e 4274 e perfis novos, sem abrir o perfil pessoal do navegador. O teste que verifica isolamento usa um banco pessoal artificial criado no próprio contexto descartável.
- Nenhum reset automatizado foi executado na origem 5308 do usuário. A instalação real `http://127.0.0.1:5174` não foi modificada.
- Sem commit, push, merge em `main` ou publicação na instalação real.

## Preparação das camadas

### Jardim

Reutiliza a prova aprovada: imagem E como fundo de 836 × 470, reparo local da região antes ocupada pela árvore, quatro sprites transparentes e vegetação independente. Máscaras recuperam as pedras e o primeiro plano da imagem original para a oclusão. A raiz fica em 51,2% / 64,7%. Os prompts e as referências da primeira prova estão em `prototypes/garden-layers/ASSET-PROMPTS.md` e `D:/Codex-artifacts/garden-layer-proof-20261103/source-art/`.

A limpeza do alpha é feita pelo filtro SVG durante a renderização. Não foram empilhadas pinturas antigas diferentes como se fossem alinhadas. A versão WebP do reparo foi convertida sem perdas com ImageMagick; não houve nova pintura do Jardim nesta continuação.

### Centro

O ImageGen integrado preparou uma base construída sem texto, árvore ou cavalo, a partir da referência avançada. Uma segunda edição preparou o terreno sem edificações. Para evitar que duas pinturas editadas introduzissem movimento no horizonte, o Centro vazio utiliza a base construída fixa com uma máscara limitada às áreas da casa, Bestiário e canteiro, preenchidas pela edição vazia. A troca estrutural não depende de alinhamento perfeito de toda a imagem.

Após a construção, os quatro estágios usam a mesma base construída de 1.620 × 970. A raiz permanece em 79,3% / 65,1%. Árvore e vegetação usam as mesmas imagens do Jardim, com escalas adequadas à perspectiva mais distante. A borda frontal do canteiro oclui a base dos recortes; as runas são uma camada SVG. O caseiro continua pintado na base, sem introdução de novos moradores. A estrutura aceita novos elementos independentes quando houver uma segunda necessidade concreta.

### Bestiário e Aposentos

O Bestiário recebeu edição localizada para remover o cavalo, preservando o abrigo e a luz geral. Os Aposentos utilizam a imagem interior anexada, sem recriar o exterior. Os textos e controles são elementos reais da aplicação.

As três imagens originais geradas nesta continuação foram movidas do C para `D:/Codex-artifacts/camp-modular-20261103/source-art/`. Os arquivos servidos pelo aplicativo estão em `static/art/camp-modular/`. `asset-manifest.json` registra tamanho e SHA-256 dos assets. Conversão de formato foi feita com ImageMagick; Python/Pillow/NumPy apenas leram capturas para comparação, sem editar as pinturas.

## Avaliação visual e diferenças identificadas

| Aspecto                      | Resultado e limite                                                                                                                                                                                                                                                                                                                   |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Geografia entre estágios     | Fundo, câmera, caminhos e primeiro plano são os mesmos em cada cena. A raiz e os hotspots seguem coordenadas proporcionais fixas.                                                                                                                                                                                                    |
| Comparação estrita do Jardim | Zero pixels diferentes fora da área dinâmica na comparação dos estágios 1 e 4; diferença máxima por canal igual a zero.                                                                                                                                                                                                              |
| Comparação estrita do Centro | 451 de 735.642 pixels fixos ultrapassaram a tolerância de 2/255 por canal, aproximadamente 0,0613%; diferença máxima 11/255 e média máxima por pixel 0,005864/255. O teste estrito NÃO passou para o Centro. Não se afirma identidade pixel a pixel. A diferença observada é pequena e dispersa; a origem exata não foi demonstrada. |
| Fidelidade à pintura anexada | A limpeza generativa reinterpreta pequenos detalhes de pedras, cercas, solo e vegetação. As cenas não são cópias pixel a pixel das capturas originais. A estabilidade dos estágios vem de uma base compartilhada.                                                                                                                    |
| Árvore adulta                | Reutiliza o sprite aprovado no Jardim. A extração assistida já aprovada reinterpreta galhos e parte da silhueta; no Centro a copa aparenta tamanho e densidade diferentes da montagem de referência, pela escala e perspectiva adotadas.                                                                                             |
| Recortes                     | Alpha tratado reduz névoa de borda, podendo remover folhas muito finas. Inspeção visual sem halo amplo evidente nas capturas finais; continua sendo uma composição de pintura 2D.                                                                                                                                                    |
| Sombras                      | Elipse suave de contato, dimensionada por estágio. Não há sombra física projetada por cada galho/copa ou relighting do solo.                                                                                                                                                                                                         |
| Iluminação                   | Paleta dourada fixa de pôr do sol; sem iluminação dinâmica. Não foram adicionadas animações contínuas de água, fogo ou folhas nesta rodada. Há apenas uma breve transição de construção, desativada com movimento reduzido.                                                                                                          |
| Resolução                    | Jardim/interior partem de referências de 836 × 470. A ampliação no desktop pode evidenciar suavidade e diferenças de detalhe entre fundo e sprite.                                                                                                                                                                                   |
| Celular                      | Validação em Chromium com viewport 390 × 844; não substitui ensaio em aparelho físico. O deslocamento horizontal mantém a escala da pintura e exige deslizar para ver as extremidades; acessos alternativos ficam no fluxo da página.                                                                                                |

As capturas foram normalizadas para o topo da página antes de salvar, evitando um artefato de captura de elemento fixo quando o navegador fotografava páginas longas deslocadas. O link acessível para pular conteúdo foi preservado.

## Offline

A primeira abertura completa online prepara o cache necessário. Depois disso foram verificados navegação, abertura de painéis, imagens das companhias conhecidas, alimentação, troca de estágio, recarga e reinício sem internet. Um perfil persistente exclusivamente de teste foi fechado e reaberto com a rede desligada, conservando construção, 0 ouro, 120 comida, XP efetivo zero e estágio visual 4, sem erros de página.

O cache da demonstração contém 477 arquivos essenciais e 51.844.714 bytes, release `1eeeae0d952ef26b`. O limite de 3 MiB por arquivo foi mantido. Somente os assets revisados do protótipo e dos painéis existentes entram nessa lista adicional. A compilação normal não adiciona os assets modulares ao precache: 282 arquivos, 30.096.569 bytes. O funcionamento offline depende de concluir essa preparação inicial; não se promete primeiro acesso sem qualquer download anterior.

## Testes executados

| Verificação                             | Resultado                                                                                                                                                              |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run verify`                        | Passou após corrigir atribuições redundantes apontadas pelo lint. Sem supressão das regras. Inclui lint, tipos, testes unitários, testes de publicação e build normal. |
| Svelte/TypeScript                       | 0 erros e 0 avisos. Checagem repetida somente após as últimas mudanças nos testes.                                                                                     |
| Vitest completo                         | 34 arquivos, 378 testes passaram. Inclui consistência, duplicação, rollback, restauração, isolamento e sincronização do protótipo.                                     |
| Publicação/cache                        | 25 testes passaram.                                                                                                                                                    |
| Navegação completa do aplicativo normal | 276 passaram; 2 omitidos pelas condições preexistentes que reservam dois casos a desktop. Nenhuma falha. 6,2 min de execução.                                          |
| PWA completo do aplicativo normal       | 46 passaram, desktop e celular. 3,6 min de execução.                                                                                                                   |
| Jornada direcionada do protótipo        | 16 casos passaram em desktop/celular, com 1,1 min na rodada final.                                                                                                     |
| Cuidado offline direcionado             | Dois casos da jornada foram ampliados para alimentar a companhia descoberta e conferiram saldo e investimento persistidos. Ambos passaram na repetição direcionada.    |
| Fechar/reabrir offline                  | Passou com perfil persistente novo, fora do perfil pessoal.                                                                                                            |
| Comparação de pixels                    | Jardim passou; Centro apresentou a diferença pequena descrita acima. Mantido o critério estrito e registrado o resultado sem declará-lo aprovado.                      |
| Diff                                    | `git diff --check` sem erros de espaços.                                                                                                                               |

A ferramenta do navegador integrado estava indisponível neste ambiente; foi usado Chromium/Playwright já instalado, sem baixar dependências. Tempos acima são apenas execução dos testes, não duração de implementação. Não houve execução de CI remota.

Logs: `full-verify.log`, `normal-e2e.log`, `normal-pwa.log`, `directed-browser.log`, `offline-care.log`, `offline-restart.log`, `final-check.log`, `pixel-comparison.log`. Resultados estruturados: `offline-restart.json`, `pixel-comparison.json` e `asset-manifest.json`.

## Arquivos alterados

Inventário com caminhos completos: `D:/Codex-artifacts/camp-modular-20261103/arquivos-alterados.txt`.

- `src/lib/camp/cinematic/`: composição, navegação, interface, projeção e validação do estado sintético e testes das cenas.
- `src/lib/scenes/`: renderizador compartilhado e prova do Jardim, adaptados para os dois usos sem quebrar a prova original.
- `src/services/campPreviewService.ts`, testes de serviço e isolamento; adaptações pequenas em `db.ts`, `backupDataService.ts`, `companionService.ts`.
- `src/lib/journey/`: suporte a painéis embutidos em Coleção, Companheiros, Conquistas e Progresso; navegação e apresentação da demonstração no AppShell.
- `src/lib/ui/Dialog.svelte`, `Icon.svelte`: diálogo largo opcional e ícones reaproveitáveis.
- Rotas de Acampamento, Refúgio, Aposentos, Bestiário, Santuário e layout: nova experiência somente na compilação isolada.
- `static/art/camp-modular/`: imagens e máscaras revisadas.
- `scripts/camp-preview.mjs`, `camp-offline-restart.mjs`, `compare-camp-scenes.py`; configuração e helpers em `tests/camp-modular/` e `playwright.camp-modular.config.ts`.
- `scripts/local-precache.mjs`, teste correspondente, `build-pwa.mjs`, `svelte.config.js`, `package.json`, `.gitignore`, `eslint.config.js`: saída separada, cache explícito e comandos da prévia. O ignore `**/dist/**` cobre apenas distribuições geradas da prova, sem excluir testes ou código-fonte.
- `prototypes/garden-layers/`: prova anterior preservada; README atualizado para registrar a aprovação e apontar esta continuação.
- Este relatório em `docs/CAMP-MODULAR-20261103.md`.

## Reabrir a prévia depois de encerrar o servidor

A versão compilada já está em `D:/Codex-artifacts/camp-modular-20261103/build`.

```powershell
Set-Location 'D:\Projetos\Level Me Up'
$env:TEMP = 'D:\Codex-storage\tmp'
$env:TMP = $env:TEMP
$env:LMU_CAMP_PREVIEW_ROOT = 'D:\Codex-artifacts\camp-modular-20261103'
$env:LMU_PREVIEW_PORT = '5308'
node scripts/camp-preview.mjs serve
```

Para reconstruir apenas a demonstração, com as mesmas variáveis: `node scripts/camp-preview.mjs build`. Não usar os comandos de publicação da instalação real para essa prévia.
