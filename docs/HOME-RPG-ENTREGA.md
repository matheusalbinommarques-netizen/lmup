# LMUP — Home RPG a partir da referência

Data: 30/10/2026. Branch: `feat/home-rpg-reference`.
Base preservada: `1397c03`, entrega anterior da Home 2.0.

## Resultado e comparação visual

A Home passa a usar a estrutura da referência: uma faixa superior com personagem
e cenário à esquerda e missões reais à direita; a faixa seguinte contém Aventura,
Refúgio, Projetos e Mapa. A saudação fica sobre a paisagem no desktop. Uma barra
integrada apresenta identidade, nível, XP, Gold, comida, conquistas e equipamentos.
O companheiro selecionado aparece no cenário e abre o bestiário.

Os dois painéis superiores são filhos do mesmo CSS Grid e ocupam a mesma linha.
Os quatro destinos formam outro grid, imediatamente abaixo, com intervalo de
14 px. A altura das tarefas é limitada pela primeira faixa; sua lista possui
rolagem interna, inclusive por teclado. A inspeção detectou e corrigiu um
vazamento de elementos de acessibilidade da lista que aumentava a altura do
documento. O teste também confere que isso não deixa uma área vazia após a Home.

| Elemento da referência                 | Implementação funcional                                                                         |
| -------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Personagem dentro de um grande cenário | Arte original de um viajante desarmado diante de Védria; indicação visível de visual provisório |
| Personagem e companheiro               | Avatar real no status; companhia selecionada e sua arte evoluída sobre o cenário                |
| Barra de identidade e recursos         | Dados do perfil, nível e XP atuais, Gold, comida, conquistas e itens equipados                  |
| Missões à direita                      | Filtros Todas/Hoje/Concluídas, próximo passo, estados, recompensas reais e criação direta       |
| Quatro áreas na segunda faixa          | Aventura, Refúgio, Projetos e Mapa, com ilustrações próprias e links reais                      |
| Próximas conquistas                    | Próximo estágio do mundo, próximo nível do personagem e conquistas já alcançadas                |
| Navegação lateral                      | Atalhos para Hoje, Missões, Projetos, Aventura, Refúgio, Personagem, Companheiros e área Mapa   |

A referência orientou composição, atmosfera, contraste e tratamento de bordas.
O aplicativo mantém seus próprios sistemas: o Refúgio segue os quatro estágios
reais do santuário; os recursos são Gold e comida; o atlas informa que o mapa
explorável está em preparação e oferece acesso às paisagens já existentes.

## Componentes e integração

- `Home.svelte`: consulta reativa existente, filtros locais, saudação pelo horário
  do navegador, composição dos painéis, missão sugerida e marcos reais.
- `HomeScene.svelte`: concentra a arte provisória, sua alternativa quando falha e
  a companhia selecionada. Isola essa apresentação para futura substituição por
  uma representação personalizável.
- `HeroIdentity.svelte`: acrescenta a variante compacta do status, preservando o
  avatar escolhido e a resolução real dos equipamentos.
- `WorldDestination.svelte`: componente reutilizável para cada destino ilustrado,
  com conteúdo contextual e ação de navegação.
- `WorldProgress.svelte`: reutilizado para a progressão do ambiente.
- `AppShell.svelte` e `home.css`: a aparência e os atalhos adicionais se aplicam à
  Home; as rotas e ferramentas existentes continuam acessíveis.
- `Icon.svelte`: quatro ícones seguindo o mesmo sistema vetorial já existente.
- `build-pwa.mjs`: inclui os novos WebP no cache essencial para uso offline.

Cada tarefa abre sua execução existente. Passos, anotações, conclusão, estorno,
revisões e recompensas continuam sob os mesmos serviços. Nenhum esquema de banco,
saldo, fórmula de XP, fluxo de backup ou capítulo da campanha foi reescrito.
Não foram adicionadas dependências nem chamadas externas durante o uso.

## Artes locais

A vista do viajante e o atlas foram gerados como ilustrações independentes pela
ferramenta integrada ImageGen e comprimidos em WebP. Os painéis, textos, barras e
controles são elementos HTML/Svelte. A captura de referência não é utilizada como
imagem de fundo.

Os seis assets finais estão em `static/art/home-rpg/`. O documento
[`HOME-RPG-ARTES.md`](HOME-RPG-ARTES.md) registra caminhos, versões, origem das
imagens reutilizadas e os prompts completos das duas artes originais. O cache
essencial gerado nesta entrega contém 99 arquivos, aproximadamente 2,14 MB.

## Validação

| Verificação                       | Resultado final                                                                               |
| --------------------------------- | --------------------------------------------------------------------------------------------- |
| `npm run verify`                  | Lint aprovado; Svelte com 0 erros e 0 avisos; 155 testes aprovados; build e cache PWA gerados |
| `npm run test:e2e -- --workers=2` | 164 testes aprovados em desktop e mobile                                                      |
| `npm run test:pwa`                | 22 testes aprovados, incluindo as artes da Home sem conexão                                   |

A suíte completa também aprovou novamente a retomada do capítulo 2 no mobile.
O ajuste de sincronização desse teste, feito na sprint anterior, foi preservado.

Os testes específicos verificam primeiro uso, tarefas pendentes, retomada,
conclusão, perfil com progresso acumulado, equipamento, projeto, estados da
aventura, filtros com 32 tarefas e rolagem por teclado. A geometria dos painéis e
o intervalo de 12 a 16 px até os cards são medidos no navegador.

As verificações cobrem desktop 1440 × 900 e 1536 × 1024, mobile 390 × 844,
tablet 820 × 1180 e largura de 320 px com texto a 200%, ausência de arte, teclado
e movimento reduzido. A ação de iniciar ou continuar a próxima missão fica
acima da navegação inferior nos cenários mobile testados.

Há um teste PWA adicional que desliga a conexão, recarrega a Home, verifica o
carregamento real da cena e do atlas pelo cache e abre o Refúgio offline.

As capturas reais ficam em [`home-rpg-capturas/`](home-rpg-capturas/), separadas
das capturas do redesign anterior. Os dados de demonstração usados nas capturas
de progresso e muitas missões existem apenas em contextos descartáveis dos
testes; não são adicionados à Home do usuário.

## Limites da entrega

O corpo do viajante é provisório; não veste automaticamente o equipamento do
perfil. Os ícones de itens e o avatar mostram as escolhas reais. O mapa é um
estado de preparação com navegação para o Refúgio. Não foram criados sistemas de
cristais, oficina, viagem, combate ou personalização corporal.

A conexão do navegador integrado falhou ao inicializar nesta sessão. A validação
visual usou o Chromium do Playwright do projeto, com capturas inspecionadas e
comparadas à referência. Não houve teste em aparelho físico, Safari, Firefox
ou auditoria completa com leitor de tela.

Para reproduzir a validação e as capturas no PowerShell:

```powershell
npm run verify
$env:LMU_HOME_CAPTURE_DIR = Join-Path (Get-Location) 'docs/home-rpg-capturas'
npm run test:e2e -- --workers=2
npm run test:pwa
```
