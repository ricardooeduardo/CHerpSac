# Cherp ERP — Estoque, agenda, contratos e campanhas

Pergunta: Como vejo o estoque dos produtos?
Resposta: Em Estoque > Posição de Estoque. A tela mostra o saldo de cada produto controlado, o estoque mínimo e o alerta "Abaixo do mínimo". Só aparecem produtos com "Controlar estoque" ligado no cadastro.

Pergunta: Como dou entrada ou saída de estoque?
Resposta: Em Estoque > Posição de Estoque, use os botões da linha do produto: "+ Entrada", "− Saída" ou "Ajustar". Também é possível usar Estoque > Movimentações > "+ Nova movimentação". As vendas dão saída automaticamente.

Pergunta: Onde vejo o histórico do estoque?
Resposta: Em Estoque > Movimentações, com data, produto, origem (por exemplo, Venda), documento e quantidade. Entradas por nota fiscal também aparecem ali.

Pergunta: O que são centros de estoque?
Resposta: São os depósitos ou almoxarifados da filial, cadastrados em Estoque > Centros de Estoque > "+ Novo centro". Você vincula produtos a um centro e define a localização (ex.: A12-06).

Pergunta: Como configuro a agenda?
Resposta: Em Agenda > Config. da Agenda, cadastre os profissionais ou recursos ("Novo profissional"), seus horários e os serviços agendáveis. Depois, em Agenda > Agenda, veja os agendamentos do dia por profissional e clique em "Novo agendamento".

Pergunta: Como crio um contrato?
Resposta: Em Contratos > Contratos, clique em "Novo contrato". Escolha o cliente (busca por nome ou CPF), o modelo (opcional; sem modelo, você anexa o documento depois), a assinatura ou plano vinculado, referência, data, dia de vencimento, valor mensal, forma de pagamento e observação. Clique em "Criar contrato". A aba "Anexos" guarda documentos.

Pergunta: Quais são as situações de um contrato?
Resposta: Pendente, Visualizado, Em Análise e Assinado. A lista de contratos pode ser exportada.

Pergunta: Como crio um modelo de contrato?
Resposta: Em Contratos > Modelos de Documentos, clique em "Novo documento". Os modelos podem ser de contrato, cláusula, orçamento ou ordem de serviço, com texto fixo, variáveis e tabelas, com ou sem assinatura digital. Use o menu "Inserir variável" para incluir dados automáticos, como {CONTRATO-DATA_INICIO}, {CONTRATO-VALOR_ADESAO}, {CONTRATO-VENDEDOR}, {CONTRATO-FORMA_PAGAMENTO}, {PLANO-DEPENDENTES_GRATIS} e {PLANO-MAX_DEPENDENTES}. Para organizar os modelos, crie rótulos em Contratos > Categorias de Documentos.

Pergunta: Como envio uma campanha para os clientes?
Resposta: Em Relacionamento > Campanhas, clique em "Nova campanha" e siga as cinco etapas: Identificação (nome e objetivo), Público, Mensagem, Agendamento e Revisão. O sistema dispara sozinho na data marcada e registra os envios e cliques.

Pergunta: Quais canais posso usar nas campanhas?
Resposta: Push no app (chega na tela de bloqueio, só para quem instalou o app), WhatsApp (alcança quase todos e usa a instância de WhatsApp conectada) e E-mail (bom para texto longo; depende do SMTP configurado em Configurações > Integrações).

Pergunta: Como envio mensagens automáticas, como aviso de parcela vencendo ou aniversário?
Resposta: Em Administração > Configurações > Avisos e Campanhas, em "Avisos automáticos", crie uma regra ("Nova regra"). As mensagens saem sozinhas quando algo acontece: link de pagamento gerado, parcela vencendo, contrato assinado, plano cancelado ou aniversário. O sistema confere de hora em hora; "Prévia de hoje" mostra o que vai sair e "Enviar agora" dispara na hora.
