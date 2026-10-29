# E1 — Base reproduzível

28/10/2026. Ponto de partida: `0e890f78b4e440bf1a42171a2020906766192437`.

## Escopo

Primeira entrega do roadmap: instalar, verificar e gerar a aplicação atual de forma reproduzível. O redesenho visual e a correção da economia de progresso são etapas posteriores. Esta entrega não migra o banco do usuário.

## Antes e depois

| Verificação              | Antes                                                  | Depois das correções                                                        |
| ------------------------ | ------------------------------------------------------ | --------------------------------------------------------------------------- |
| Lint                     | Passava                                                | Passa                                                                       |
| Tipos/Svelte             | 2 erros                                                | 0 erros; 5 avisos de valores iniciais de props                              |
| Testes unitários/serviço | 2 suítes falhavam na coleta                            | 25 testes usando regras atuais e IndexedDB em memória                       |
| Build                    | `Encountered dynamic routes`                           | Build estático com shell pré-renderizado e fallback                         |
| Navegador em produção    | Sem verificação automatizada                           | 24 verificações: rotas, projeto local e asset ausente, em desktop e celular |
| Dependências             | 39 avisos: 8 baixos, 10 moderados, 20 altos, 1 crítico | 9 baixos; sem moderados, altos ou críticos na consulta registrada           |

O teste de produção usa um servidor que serve somente `build/`, cria um projeto sintético e abre/recarrega sua URL diretamente. Ele bloqueia service workers para verificar a saída estática sem cache anterior e confere que assets ausentes não recebem HTML. Isso não certifica instalação, atualização ou funcionamento offline da PWA, previstos em E8.

## Decisões técnicas

- SvelteKit 2, Svelte 5 e Vite 7 mantidos; sem migração de versão principal do framework.
- SSR desativado para o aplicativo pessoal baseado em IndexedDB. Shell das rotas fixas pré-renderizado; IDs de projeto são resolvidos no cliente por `200.html`.
- O host de produção precisa reescrever caminhos inexistentes para `200.html`, preservando a URL. Apenas servir arquivos com um servidor que retorna 404 não basta.
- Vitest configura aliases explícitos e IndexedDB em memória. Removidos mocks globais de gráfico e testes legados de uma curva/função que não existe mais.
- Testes de serviço exercitam o banco real do Dexie em memória, bônus de companheiro, mudança de nível, logs e recompensa de estágio.
- Dependências sem uso na configuração atual removidas: adaptador automático, `@types/dexie`, `@eslint/compat`, `svelte-preprocess` e `ts-loader`.
- `picomatch@2.3.1` substituído pontualmente pelo patch `2.3.2` via override. Não altera as cópias 4.x usadas por outras ferramentas.
- `.svelte-kit` e `build` deixam de ser fonte versionada. São recriados pelas ferramentas, sem necessidade de manter builds antigos no Git.
- CI proposta para Node 22/24 com permissões de leitura. A configuração só executará no GitHub quando esta alteração for enviada; não foi publicada nesta entrega.

## Avisos de segurança restantes

São 9 entradas de severidade baixa, várias propagadas a partir das mesmas dependências. O número não representa nove explorações independentes demonstradas no LMU.

| Origem                          | Alcance nesta arquitetura                                                                                                | Decisão                                                                                               |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `cookie` e avisos de SvelteKit  | Código de servidor/enhanced actions não integra o host estático distribuído; formulários atuais usam handlers no cliente | Manter Kit 2 nesta etapa. Reavaliar antes de adicionar SSR, ações de servidor ou autenticação         |
| `deepmerge`                     | Dependência de ferramentas de build/configuração; não é usada pelo aplicativo para mesclar entradas do usuário           | Não aceitar configuração de terceiros não confiáveis. Reavaliar nas atualizações do conjunto de build |
| Plugins, adaptador, Workbox/PWA | Entradas propagadas pelas dependências acima                                                                             | Não forçar downgrade/migração principal sugerido genericamente pelo audit                             |

Não há alegação de risco zero. Uma mudança de arquitetura ou novo aviso exige nova avaliação. `npm run audit:security` falha se aparecer aviso moderado, alto ou crítico. A auditoria consulta a base atual do npm e seu resultado pode mudar sem alteração no lockfile.

Referências: [redirecionamento em enhanced forms](https://github.com/advisories/GHSA-pfhg-q3qv-9q6r), [cache-control em prerender](https://github.com/advisories/GHSA-27mw-82g8-phjj), [cookie](https://github.com/advisories/GHSA-pxg6-pf52-xh8x), [deepmerge](https://github.com/advisories/GHSA-gcqx-w48m-w2h4).

## Limitações conhecidas mantidas para as próximas etapas

- E2 ainda precisa corrigir estorno de comida/bônus, atomicidade, inicialização, importação e reset. Os testes desta etapa não afirmam que esses fluxos estejam resolvidos.
- Os 5 avisos de Svelte tratam captura de valores iniciais em modais, cartão de loja e detalhe de projeto. São explícitos no check; a revisão dos ciclos de estado pertence aos fluxos correspondentes.
- Testes móveis desta etapa comprovam abertura/recarga, não acessibilidade completa, layout sem cortes ou interação por teclado virtual.
- Pipeline remota configurada, mas ainda não executada no GitHub. Node 24 foi o ambiente local; a matriz inclui Node 22 para verificação remota.
- Nenhum executável Windows foi gerado ou substituído. O resultado é uma aplicação web estática/PWA.

## Verificação e retorno

Executar `npm ci`, `npm run verify` e os testes de produção conforme o README. O banco fica no navegador e não é limpo por esses comandos; os testes abrem contextos isolados.

Esta etapa não altera schema do banco. O ponto de partida continua no histórico Git. Não executar reset/limpeza de banco como forma de voltar ao código anterior. Antes de futuras migrações de E2, definir backup e compatibilidade de retorno separadamente.
