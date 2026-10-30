# LMUP — primeira experiência RPG (experimento não canônico)

**Base:** branch `codex/beta-redesign`, congelada para avaliação. Esta implementação vive numa branch própria.

## Hipótese

O usuário deve conseguir realizar uma tarefa real e, em seguida, perceber que seu progresso também abriu espaço para uma aventura. Isso deve acontecer sem interromper o planejamento, sem narrativas automáticas e sem cobrar presença diária.

## Fluxo de demonstração

1. O usuário entra em **Aventura** pela página Hoje ou por Perfil e mais.
2. Vê uma cena curta situada provisoriamente em Védria, com avanço **somente por botão**.
3. Encontra uma pausa natural: a próxima cena só fica disponível se houver ao menos um evento ativo de conclusão de missão ou revisão real.
4. Pode sair, cadastrar e concluir qualquer missão de sua escolha e voltar; o capítulo aguarda.
5. Uma cena apresenta duas decisões. A decisão é salva no perfil e altera o encerramento do piloto.
6. A tela final oferece retorno à jornada de produtividade, sem criar recompensa adicional.

## Regras de produto

- **Não é cânone definitivo.** Personagens, incidente e diálogos são material experimental, fácil de substituir.
- **Sem IA, rede externa nem dependências novas.** Reutiliza SvelteKit, Dexie e artes já disponíveis.
- **Sem autoplay.** Progresso e escolhas apenas por ações explícitas.
- **Sem bloqueio da produtividade.** O usuário pode ignorar Aventura, fechar a tela ou retornar a qualquer momento.
- **Sem exploração de XP.** A aventura só consulta eventos reais não estornados; não recalcula recompensas nem cria novas.
- **Persistência:** estado de um único piloto em campo opcional do perfil, incluído nos backups existentes; sem migração de banco. Este é um contrato temporário para validar a experiência, não o motor completo de campanhas.
- **Sem punição por ausência.** Tempo real não afeta história ou companheiros.
- **Acessibilidade:** cena legível sem som, controles de avanço manuais, animação decorativa suave e respeito a movimento reduzido.

## O que não está implementado

- Seleção de três origens, avatar completo, cena ilustrada específica, roteiro final, narração ou trilha licenciada.
- Combate, exploração geográfica, eventos e condições narrativas gerais, relações de NPCs, companheiros com histórias e evolução por decisões.
- Conteúdo gerado automaticamente, sistema de capítulos completos, temporadas ou desbloqueio de mundo por XP.
- Validação com usuários e medição real de engajamento.

## Critérios de aceite do piloto

- Uma instalação sem missões chega à pausa narrativa sem sofrer bloqueio para cadastrar tarefas.
- Concluir uma missão real libera a continuação; apenas criar, iniciar, pausar ou preencher passos não libera.
- Um evento estornado não conta para destravar a cena, se ainda não tiver sido destravada.
- Reabrir a rota e atualizar a página preserva a cena e a decisão.
- Cliques repetidos ou abas simultâneas não pulam múltiplos passos.
- O backup preserva o campo de piloto sem afetar os saldos.
- A navegação principal mantém Hoje, Missões, Projetos e Refúgio como caminhos prioritários.
- Rota /aventura abre no build e offline após cache inicial.

## Próximo corte

Primeiro avaliar esta experiência com a pessoa autora. Só depois autorizar uma narrativa canônica e um motor de storylets em tabela própria, com migração e testes de backup/recovery.