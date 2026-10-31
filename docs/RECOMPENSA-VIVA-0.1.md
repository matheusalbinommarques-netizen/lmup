# Recompensa Viva 0.1

A conclusão real em `Execution.svelte` apresenta um único painel: atividade, XP, ouro, comida quando recebida e progresso do personagem e do Refúgio. Continuar e voltar à Home não aguardam os efeitos.

## Marcos e apresentação

- Conclusão comum: selo, recursos e barras, sem telas intermediárias.
- Nível: somente quando o XP registrado atravessa um limite, com emblemas anterior/novo e brilho mais forte.
- Refúgio: somente quando muda de estágio, com comparação das duas artes já existentes e acesso ao Refúgio atualizado.
- Marcos simultâneos: os dois destaques aparecem dentro do mesmo painel.
- Efeitos entre 0,7 e 1,1 segundo; botão para pular; respeito ao movimento reduzido do sistema e às preferências de conforto do aplicativo. Sem áudio automático.

As referências orientaram molduras discretas, materiais escuros, dourado, tipografia e hierarquia. As imagens reais de Semente/Brotinho e dos demais estágios foram mantidas: as cabanas dos conceitos não substituem os cenários atuais.

## Dados e compatibilidade

`rewardService` guarda, na mesma transação da recompensa, o XP total anterior e posterior no campo opcional `ActivityEvent.progress`. As barras consultam as regras existentes de `progression.ts` e `ecoConfig.ts`. O bônus real de projeto permanece separado nos recursos e participa da progressão final.

Nenhum multiplicador, recurso, valor de recompensa ou limite foi alterado. Não houve criação de moedas ou pontos de construção. Consultar ou recarregar um recibo não chama a concessão de recompensa.

Conclusões antigas mantêm seus recursos registrados. Quando não existe snapshot, o painel informa a ausência do antes/depois; não reconstrói barras a partir do saldo atual. O campo é opcional e não exige migração nem limpeza do banco. A validação de backups confere inteiros não negativos e a diferença exata de XP. Os recibos originais permanecem no histórico após estorno, sem celebração; a execução volta a ficar disponível com aviso dos recursos devolvidos.

As quatro imagens de estágio entram no cache essencial da PWA, inclusive quando a comparação ainda não foi visitada online. Todos os testes usam dados sintéticos e origens separadas da instância pessoal.

## Capturas reais

| Estado                        | Desktop                                                    | Celular                                                   |
| ----------------------------- | ---------------------------------------------------------- | --------------------------------------------------------- |
| A — Comum                     | [Recompensa](recompensa-viva-capturas/desktop-comum.png)   | [Recompensa](recompensa-viva-capturas/mobile-comum.png)   |
| B — Novo nível                | [Recompensa](recompensa-viva-capturas/desktop-nivel.png)   | [Recompensa](recompensa-viva-capturas/mobile-nivel.png)   |
| C — Novo estágio              | [Recompensa](recompensa-viva-capturas/desktop-refugio.png) | [Recompensa](recompensa-viva-capturas/mobile-refugio.png) |
| D — Home após conclusão comum | [Home](recompensa-viva-capturas/desktop-comum-home.png)    | [Home](recompensa-viva-capturas/mobile-comum-home.png)    |
| D — Home após novo nível      | [Home](recompensa-viva-capturas/desktop-nivel-home.png)    | [Home](recompensa-viva-capturas/mobile-nivel-home.png)    |
| D — Home após novo estágio    | [Home](recompensa-viva-capturas/desktop-refugio-home.png)  | [Home](recompensa-viva-capturas/mobile-refugio-home.png)  |

## Validação

Resultados em 30/10/2026, com Chrome instalado e contextos descartáveis:

- `npm run verify`: lint aprovado, Svelte sem erros ou avisos, 157 testes de serviço aprovados e build de produção gerado.
- Suíte completa da interface: 178 testes aprovados em desktop e celular.
- Suíte completa da PWA: 24 testes aprovados.
- Após o último ajuste de CSS para movimento reduzido: build regenerado, 10 testes da Recompensa Viva e 2 testes da recompensa offline repetidos e aprovados. As 12 capturas correspondem a esse build.
- `git diff --check`: sem erros de espaços em branco.

Os testes representam navegadores com dimensões móveis; não certificam aparelhos físicos.

Os testes de `living-reward.spec.ts` verificam concessão real, marcos condicionais, barras, artes, retorno à Home, navegação por teclado, recarga sem nova recompensa, ausência de repetição dos efeitos, estorno, movimento reduzido, marcos simultâneos, bônus de projeto e recibos antigos.

O teste adicional da PWA conclui uma missão sem rede, carrega as duas paisagens do cache, recarrega o recibo sem repetir os efeitos e estorna a conclusão offline. Os testes de serviço conferem snapshots e rejeição de progresso adulterado no backup. As verificações anteriores foram atualizadas para o título “Missão concluída!” e a nova organização dos recursos; o laboratório mantém seu texto original.
