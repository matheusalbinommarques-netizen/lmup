# E2 — Dados e progresso confiáveis

## Contratos e políticas

- Cada execução tem um evento estável, com XP, Gold e comida efetivos, origem e modificadores. Tarefa, perfil, log e bônus do projeto são gravados na mesma transação.
- Estornar referencia o evento original. Trocar pet, equipamento ou editar a missão não altera o valor do estorno.
- Se os recursos concedidos já tiverem sido gastos, o estorno é recusado sem alterar qualquer dado. Não criamos saldo negativo nem devolvemos itens comprados silenciosamente.
- Uma conclusão antiga sem evento é preservada como legado. Não prometemos reconstruir bônus que nunca foram registrados; o aplicativo explica por que o estorno exato não está disponível.
- Eventos de revisão têm identidade por sessão e não concedem nova recompensa antes da próxima data. Cliques duplicados são idempotentes.
- Bônus de projeto é um evento associado. Reabrir uma missão que sustentou a conclusão estorna também esse bônus, se houver saldo disponível. Recompensa legada desconhecida impede estorno automático.
- Sequência é reconstruída a partir do estado anterior ao primeiro evento registrado e das execuções não estornadas. Proteção usada em cada execução é registrada.
- Prêmios únicos do Santuário são contabilizados pelos eventos que os concederam. Um estorno não permite duplicar um prêmio ainda mantido no histórico ativo.
- A migração v4→v5 não reescreve saldos nem inventa histórico. Guarda uma cópia de recuperação do estado anterior no próprio banco, na transação da atualização.
- Importações são validadas antes da escrita. Antes de substituir ou reiniciar, salvamos uma cópia de recuperação. Falha na operação preserva o estado anterior.
- Recuperações são locais e não substituem backup externo. Trocar a origem/navegador ou apagar os dados do site também remove essas cópias locais.

## Limites

Esta etapa mantém a curva e a direção visual atuais. O redesenho e a experiência completa de execução por passos pertencem às próximas etapas. Dados pessoais não são usados nos testes.

## Verificação local

- `npm run verify`: lint aprovado, nenhum erro de tipos/Svelte, 51 testes aprovados e build estático gerado.
- Permanecem cinco avisos já documentados em E1, sobre captura inicial de propriedades em componentes existentes.
- `LMU_BROWSER_CHANNEL=chrome npm run test:e2e -- --workers=2`: 28 cenários aprovados em desktop e viewport móvel. Incluem duas abas na mesma origem, recarga, desfazimento persistido e importação inválida sem substituir dados.
- Banco em memória cobre migração v4, idempotência, reversão exata, bônus de projeto, revisões, recursos gastos, falha de gravação e rollback, importação/exportação, reset e retenção de recuperação.
- A lista de missões usa o mesmo cálculo da concessão para a prévia; conclusões novas exibem o valor registrado. Uma mudança de bônus ou saldo antes de concluir pode atualizar a estimativa.

As recuperações não são sincronizadas e os testes não certificam atualização offline da PWA, que pertence a E8. Aparelhos físicos não foram testados nesta etapa. Nenhuma publicação ou envio ao GitHub faz parte desta entrega local.
