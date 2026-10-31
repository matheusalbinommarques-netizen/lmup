# LMUP — Home 2.0

Data: 30/10/2026. Branch: `feat/home-2-world`.
Base: `89ee0c2`, referência atualizada de `feat/rpg-first-experience` no início da sprint.

## Auditoria e decisão de escopo

A cópia `implementacao-e2` estava limpa. O remoto público se chama `github`;
`origin` aponta para a cópia local `implementacao-lmu`. A referência RPG foi
buscada no GitHub antes da criação da branch exclusiva. Main e beta não foram
alteradas.

A rota `/` já utiliza `src/lib/journey/Home.svelte`, dentro de `AppShell.svelte`.
A consulta reativa `journeyQuery` fornece perfil, tarefas, projetos, companheiro
selecionado, equipamentos, recompensas calculadas e registros. Isso permite
redesenhar a apresentação sem acrescentar consultas concorrentes ou outro banco.

| Informação                                              | Fonte reutilizada                              |
| ------------------------------------------------------- | ---------------------------------------------- |
| Nome, título, avatar, nível, XP e Gold                  | Perfil de `journeyQuery`                       |
| Equipamentos reais, com resolução de espaços duplicados | `equippedItemsForOwned`                        |
| Contagem de conquistas alcançadas                       | `collectionStats` e `ALL_ACHIEVEMENTS`         |
| Próxima missão, retomada e passos                       | `selectNext`, `isAvailable` e `taskSteps`      |
| Criação e sugestões editáveis                           | `QuickCreate` e `missionStarters`              |
| Plano, revisões e atividades concluídas                 | Tarefas existentes e `reviewDueDate`           |
| Projetos em curso                                       | Projetos existentes, com suas rotas de detalhe |
| Paisagem e próximo marco do mundo                       | `sanctuaryContent` e `ecoConfig`               |
| Companheiro e sua evolução                              | Seleção do perfil e `companionArtwork`         |
| Estado e liberação da aventura                          | `sanitizePilot` e `chapterTwoProgress`         |

Os assets `art/pilot/scene-1.webp` a `scene-4.webp` têm 1200 × 800 px,
com versões responsivas de 600 px. A composição usa essas paisagens nas
dimensões adequadas. `Artwork` mantém as alternativas para imagens ausentes.
A estratégia PWA existente também oferece a versão compacta das paisagens offline.

## Implementação

- A Home abre com personagem e evolução do santuário integrados à paisagem do
  estágio efetivamente alcançado. Nome, XP, Gold, conquistas e equipamentos vêm
  dos dados locais, sem progresso ou itens simulados.
- `HeroIdentity.svelte` concentra avatar, nível, experiência, conquistas e itens
  equipados. Na ausência de avatar, apresenta um emblema vetorial provisório
  identificado como tal; não inventa um personagem personalizado.
- `WorldProgress.svelte` apresenta o estágio, o progresso dentro dele e o XP
  restante até o próximo marco, pelas regras existentes.
- A próxima atividade preserva a seleção anterior, os passos e a prévia de XP.
  Criar uma missão continua disponível diretamente no cabeçalho. Acesso a
  planejamento, projetos e execução permanece nas rotas existentes.
- O estado vazio é compacto e distingue primeiro acesso, conclusão, arquivamento
  e revisão futura. Nenhuma missão é criada automaticamente. Atividades
  concluídas ficam consultáveis em uma seção recolhível e no histórico completo.
- Aventura e companhia ocupam uma área secundária. O estado do capítulo reflete
  cenas salvas, liberação por XP e término da demonstração existente.
- `home.css` afeta apenas a composição da Home. O mobile compacta o mundo e
  mantém a ação de continuar acima da navegação inferior no cenário testado.

Nenhuma dependência, migração, tabela, economia, regra de concessão de XP ou
serviço de backup foi alterado. Não há chamadas externas novas ou IA online.

## Validação

| Verificação                                                    | Resultado                                                                               |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `npm run verify`                                               | Lint aprovado; Svelte com 0 erros e 0 avisos; 155 testes aprovados; build e PWA gerados |
| `npm run test:e2e -- --workers=2`                              | 162 testes aprovados em desktop e mobile                                                |
| `npm run test:e2e -- tests/e2e/home-world.spec.ts --workers=2` | 6 cenários aprovados; capturas atualizadas após os ajustes de responsividade            |
| `npm run test:pwa`                                             | 20 testes aprovados                                                                     |

A primeira execução PWA teve um `ECONNRESET` no `beforeEach`, ao preparar o
servidor de teste, antes de exercitar a interface. A execução completa separada
passou nos 20 cenários, sem mudança no código PWA.

Os cenários adicionais em `tests/e2e/home-world.spec.ts` cobrem primeiro acesso,
duas tarefas pendentes, retomada, conclusão de todas, recarga, perfil acumulado,
equipamento, projeto, progresso do ambiente e capítulo salvo. Os contextos de
teste são descartáveis; a aplicação não contém fixtures de demonstração.

As dimensões verificadas são desktop 1440 × 900, mobile 390 × 844, tablet
820 × 1180 e largura de 320 px com texto a 200%. Há verificações de ausência de
rolagem horizontal, acionamento por teclado, retorno de foco, movimento reduzido
e imagem ausente. Os testes existentes também exercitam backups, saldos,
concorrência entre abas e modos de conforto.

A inspeção visual também encontrou quebra excessiva de texto em 320 px a 200%,
apesar de não haver rolagem horizontal. Retrato, nome, companhia e informações
do mundo agora podem ocupar linhas separadas. Um teste adicional impede que o
nome inicial volte a quebrar letra por letra. O espaçamento dos botões se reduz
nessa largura, preservando o tamanho ampliado do texto.

### Investigação da retomada mobile do capítulo 2

Antes de alterar a Home, os dois testes mobile da aventura passaram contra a
compilação da base. Na primeira suíte completa, a falha conhecida reapareceu:
o teste clicava em avançar e recarregava imediatamente, enquanto o salvamento
assíncrono ainda podia estar em andamento. A aventura só troca o título da cena
depois que `advanceChapterTwo` conclui a transação.

O teste agora aguarda o título da nova cena antes de recarregar, mantendo a
asserção de persistência após a recarga. Não foram alterados a aventura nem seu
serviço de salvamento. O arquivo de teste de produção também foi atualizado
para conferir o novo título da Home.

### Capturas e limites

As capturas reais ficam em [`home-2-capturas`](home-2-capturas/): primeiro acesso,
pendências, todas concluídas, progresso acumulado e 320 px com texto ampliado.
Desktop usa captura da página completa a partir da janela 1440 × 900; mobile usa
a janela 390 × 844. As capturas foram inspecionadas visualmente e orientaram a
redução da altura do mundo no mobile.

A conexão do navegador integrado falhou na inicialização nesta sessão. A
validação visual foi feita pelo Chromium do Playwright do projeto. Não houve
validação em dispositivo físico, Safari ou Firefox, nem auditoria completa com
leitor de tela. O personagem completo e a renderização corporal dos equipamentos
permanecem fora do escopo: a Home usa avatar/emblema e os ícones reais dos itens.

Para gerar novamente as capturas no PowerShell:

```powershell
npm run verify
$env:LMU_HOME_CAPTURE_DIR = Join-Path (Get-Location) 'docs/home-2-capturas'
npm run test:e2e -- tests/e2e/home-world.spec.ts --workers=2
```
