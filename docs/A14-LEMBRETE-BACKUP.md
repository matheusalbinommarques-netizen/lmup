# A14 — lembrete opcional de backup

O aviso aparece em Hoje e Configurações após 14 dias completos sem uma exportação iniciada ou um adiamento. Não bloqueia a navegação, não usa contagem de atraso e não exporta arquivos automaticamente.

- Reaproveita `lmup:last-export`; exportações anteriores continuam valendo.
- Sem exportação válida anterior, a primeira visita a Hoje ou Configurações com conteúdo inicia uma carência de 14 dias. Abrir as telas novamente não reinicia o prazo.
- Uma instalação sem missões, projetos, eventos, XP acumulado ou investigação ativa/concluída não inicia a carência e não mostra o aviso. O perfil e os companheiros padrão não contam como conteúdo.
- “Lembrar em 14 dias” dispensa o aviso nas duas telas, inclusive em outra aba da mesma origem, e persiste ao recarregar.
- Em Hoje, “Fazer backup” abre a seção existente de Configurações. “Exportar backup” usa a mesma função de “Exportar dados”. A data só é atualizada depois de iniciar o download; uma falha anterior mantém o aviso e a data antiga.
- A exportação registrada não comprova que o usuário guardou o arquivo. O texto já existente em Configurações continua explicando esse limite.
- Datas inválidas/futuras são ignoradas; sem referência válida, há nova carência. Preferências indisponíveis não impedem a exportação nem a dispensa na visita atual.

As chaves locais `lmup:backup-reminder-started` e `lmup:backup-reminder-dismissed` guardam apenas datas. A regra não lê tabelas adicionais, não altera schema, saldos, recorrência, backups ou recuperações. A15 (cópia em pasta) continua fora do escopo.

## Validação

- Regra com datas simuladas: instalação vazia, conteúdo, fronteira dos 14 dias, exportação antiga, adiamento, exportação posterior, datas inválidas e indisponibilidade de preferências.
- E2E desktop/mobile: instalação vazia e primeira carência, arquivo exportado, dispensa entre abas e falha no download.
- Capturas reais de Hoje e Configurações antes/depois em desktop 1440 e mobile 390/320, com dados sintéticos. A escolha visual continua dependendo da revisão do autor.
- Reversão por revert; nenhuma migração necessária. As duas preferências extras ficam inertes se o código for revertido.
