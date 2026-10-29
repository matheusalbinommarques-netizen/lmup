# Level Me Up

Aplicativo pessoal para organizar missões e projetos, acompanhar progresso e evoluir um herói e seus companheiros. Feito com SvelteKit, TypeScript e Dexie/IndexedDB.

O produto está sendo evoluído por etapas. A base reproduzível está descrita em [E1](docs/E1-base-reproduzivel.md), os contratos de progresso e recuperação em [E2](docs/E2-progresso-confiavel.md), a jornada diária com dados reais em [E4](docs/E4-jornada-real.md), projetos, revisões e esforço em [E5](docs/E5-projetos-revisoes.md), Refúgio, companheiros e coleção em [E6](docs/E6-refugio-colecao.md), e histórico, conforto global e backup em [E7](docs/E7-progresso-configuracoes.md).

O aplicativo abre em Hoje, com Missões, Projetos e Refúgio na navegação principal. Criação rápida, passos, notas, pausa, retomada, conclusão e desfazimento usam os dados reais do navegador. O organizador anterior está em `/arquivo/missoes`; o antigo início, com perfil e equipamentos, em `/perfil`. Projetos têm objetivo e etapas; revisões têm sessões e histórico em `/revisoes`. O esforço escolhido define o XP base, independentemente da quantidade de passos. O Refúgio reúne ambiente, companheiros, coleção, loja e conquistas. Compra e cuidado têm prévia e confirmação; equipamentos são exclusivos por espaço. Meu progresso (`/progresso`) separa missões, revisões, bônus, estornos, compras e cuidados pelos registros reais. Configurações (`/config`) aplica conforto global e reúne backup, recuperação e reinício com confirmação. As demais funções continuam acessíveis por Perfil e mais.

O sistema visual e o piloto original estão em [E3](docs/E3-sistema-visual.md). `/laboratorio` e `/laboratorio?view=componentes` continuam sendo prévias com dados de exemplo em memória; não substituem a jornada real e não abrem o banco pessoal.

## Requisitos e instalação

Node.js 22.12+ ou 24.x. O desenvolvimento local desta entrega foi verificado com Node 24 e npm 11. A integração contínua está configurada para Node 22/24.

```sh
npm ci
```

Usar o lockfile versionado. `npm ci` executa a preparação do Husky para os hooks locais; em ambientes de verificação sem hooks é possível usar `npm ci --ignore-scripts` e depois executar explicitamente as verificações abaixo.

## Desenvolvimento

```sh
npm run dev -- --host 127.0.0.1 --port 5175 --strictPort
```

Abrir `http://127.0.0.1:5175` para desenvolvimento. A instância acompanhada pelo usuário serve o build de produção em `http://127.0.0.1:5174`; não use Vite nessa origem depois de ativar o cache PWA. Manter a origem estável para cada finalidade: navegador, protocolo, host e porta definem onde os dados locais são armazenados.

Antes de trocar de navegador, origem ou computador, exporte um backup pelo aplicativo. O LMU atual não sincroniza os dados com a nuvem. Não use o perfil pessoal do navegador nos testes automatizados.

## Verificações

```sh
npm run verify
npm run audit:security
```

`verify` executa lint, checagem de tipos/Svelte, testes sem modo de observação e build. Para rodar separadamente:

```sh
npm run lint
npm run check
npm run test:run
npm run build
```

Os testes de serviço usam IndexedDB em memória e não acessam o banco do usuário. `npm test` mantém o modo de observação para desenvolvimento.

## Testes da versão de produção

Depois de `npm run build`:

```sh
npx playwright install chromium
npm run test:e2e
```

Os testes iniciam e encerram um servidor de arquivos na porta 4174, servindo somente `build/`, sem o runtime do SvelteKit. A instância do usuário na porta 5174 permanece separada. São usados contextos descartáveis e dados sintéticos, sem sincronização ou limpeza do perfil pessoal.

No Windows, para usar o Chrome já instalado em vez de baixar o Chromium:

```powershell
$env:LMU_BROWSER_CHANNEL = 'chrome'
npm run test:e2e
```

Os testes verificam as rotas principais, projetos com etapas, criação/edição/recarga, conclusão simultânea em duas abas, estorno, notas, revisões em dias distintos, datas em três fusos, esforço, coleção, compra concorrente, equipamento, cuidado, evolução e recusa de backup inválido em desktop e viewport móvel. A suíte separada `npm run test:pwa` usa service workers reais na porta 4274 e confere offline e atualização entre abas. Não certifica aparelhos físicos ou instalação nativa no sistema operacional.

## Build e hospedagem estática

```sh
npm run build
npm run preview -- --host 127.0.0.1 --port 4174 --strictPort
```

A saída está em `build/`. As rotas fixas têm shell pré-renderizado. Projetos são criados no navegador; seus IDs não existem durante o build. O host precisa servir `200.html` para caminhos que não correspondem a arquivos, preservando a URL solicitada.

Para verificar exclusivamente os arquivos estáticos com o fallback previsto, use `npm run serve:build` em vez do preview. Esse servidor de teste escuta apenas em `127.0.0.1:4174` e não é destinado à exposição pública. Não devolve HTML para assets inexistentes.

Exemplo de regra para hosts que suportam arquivo `_redirects`: `/* /200.html 200`. Configure a regra equivalente no host escolhido; não publique sem testar um acesso direto a `/projetos/1` e sua recarga.

JavaScript é necessário para acessar o progresso local. `npm run preview` é para verificação, não um servidor de produção público. Nenhum instalador `.exe` é produzido por esses comandos.

## Estrutura

- `src/routes`: telas e carregamento de rotas.
- `src/lib`: componentes de interface.
- `src/services`: banco e regras de progresso, equipamentos, projetos e backup.
- `src/test`: preparação do banco em memória.
- `tests/e2e`: verificações de produção com Playwright.
- `static`: artes e ícones de instalação.
- `docs`: decisões, evidências resumidas e limitações por etapa.

`.svelte-kit/`, `build/`, relatórios e dependências são gerados localmente e não devem ser versionados.

## Dados e segurança

O banco atual se chama `LevelMeUpDB`, versão 5. A migração preserva os dados v4 e guarda uma cópia local de recuperação. Conclusões novas registram recompensas efetivas; conclusões anteriores sem evento não permitem estorno exato. Importações são validadas antes da substituição e guardam o estado anterior. Reiniciar limpa toda a jornada e preserva somente nome e avatar. Configurações permite exportar a recuperação mais recente.

As cinco recuperações recentes e a cópia da migração ficam no próprio navegador. Apagar dados do site remove essas cópias; exporte um backup externo. Exportações podem conter nomes, notas e histórico pessoal; mantenha seus backups em local confiável.

Os avisos de dependências restantes e seu alcance estão documentados em [E1](docs/E1-base-reproduzivel.md). Não use `npm audit fix --force` sem revisar as migrações propostas e repetir as verificações pertinentes.

## Offline e instalação

A [entrega E8](docs/E8-offline-producao.md) descreve cache, atualização e limitações. `npm run build` gera também `sw.js`, manifesto e `release.json`. Configurações mostra preparação offline, atualização, instalação quando oferecida pelo navegador e proteção opcional do armazenamento. A primeira preparação precisa de rede. Instalar não sincroniza nem substitui backup externo.
