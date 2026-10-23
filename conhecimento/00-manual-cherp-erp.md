# Manual do Cherp ERP

O Cherp ERP (versão 0.0.9) reúne cadastros, planos de assinatura, vendas, financeiro, estoque, contratos e campanhas em um só painel, com várias empresas e filiais.

## Mapa do sistema

Os cadastros (clientes, fornecedores, funcionários e cargos, produtos e serviços) alimentam os planos e as vendas. Um plano gera contrato e parcelas a receber; uma venda gera conta a receber e baixa o estoque. As Configurações ligam os bancos (Pix, boleto, cartão), o fiscal, o WhatsApp, o e-mail e o portal do cliente, que fazem cobranças e campanhas funcionarem.

## 1. Primeiros passos

Tudo começa pela tela de login e pela escolha da empresa ativa: cada tela mostra apenas os dados da empresa selecionada.

1. Acesse o endereço do sistema, informe e-mail e senha e clique em "Entrar". Marque "Lembrar de mim por 30 dias" para não precisar entrar de novo.
2. No topo do menu lateral, confira a "Empresa" ativa. Clique nela para trocar de empresa (por exemplo, entre a matriz e uma filial).
3. O sininho no topo mostra as notificações; o selo de versão no rodapé do menu abre as Novidades.
4. O ícone de três linhas no topo recolhe ou abre o menu lateral.

Dashboard — visão geral da empresa. Escolha o período (Hoje, Ontem, 7 dias, 1, 3, 6 ou 12 meses, ou datas específicas) e veja:
- Resumo do período: faturamento e número de vendas, receita, despesa e novos clientes, com a variação em relação ao período anterior.
- Situação atual: clientes ativos e inativos, valores a receber (em dia e vencido), saldo em caixa, valores a pagar, planos por situação, contratos, produtos com estoque baixo e agenda do dia.

Dashboard analítico — uso do sistema: quem está online agora, tempo médio no app, aberturas por dia, horários de pico, acessos por estado (quando a geolocalização por IP está ligada) e quem mais usou no período.

## 2. Cadastros

Os cadastros ficam no grupo Cadastros do menu. Todas as listas têm busca, filtro, ordenação por coluna e um botão "+ Novo" no topo.

- Clientes: pessoas e empresas atendidas. Campos: nome, tipo (pessoa física ou jurídica), CPF, telefone, e-mail, data de nascimento (obrigatória), referência, RG, estado civil, sexo, naturalidade, profissão, nome da mãe e do pai, endereço com CEP, observações.
- Fornecedores: empresas de quem você compra. Campos: nome, referência, CNPJ, telefone, cidade, situação.
- Funcionários: equipe; cada um recebe um login. Campos: nome, CPF, cargo, e-mail (login de acesso), telefone, admissão, referência, permissões.
- Cargos: funções e o que cada uma pode acessar. Campos: nome do cargo, descrição, permissões por módulo.
- Produtos: catálogo de itens vendidos. Abas Básico (nome, unidade, SKU, categoria, controlar estoque), Comercial (custo, markup, preço de venda), Fiscal e Logística.
- Serviços: serviços com cobrança por unidade ou faixa (ex.: km, quilo). Abas Dados (nome, categoria, código, descrição, imagens), Cobrança e Fiscal.

Cadastrar um cliente:
1. Vá em Clientes e clique em "+ Novo cliente".
2. Preencha os dados. Sem CPF o cadastro fica marcado como incompleto.
3. Clique em "Continuar para o plano" para já contratar um plano, ou em "Voltar" para sair.

Quando a opção "Cadastro de cliente guiado" está ligada (Configurações → Funcionamento), o cadastro vira um passo a passo: dados do cliente, plano, dependentes e revisão, já contratando o plano no fim.

Dar acesso a um funcionário:
1. Crie o cargo em Cargos → Novo cargo e marque as permissões de cada módulo.
2. Em Funcionários → + Novo funcionário, escolha o cargo e informe o e-mail, que será o login.

Gestores (em Administração) têm acesso total; funcionários veem só o que o cargo permite.

## 3. Planos e assinaturas

Um plano é a assinatura recorrente de um cliente, criada a partir de um modelo de plano que define preço, vigência, dependentes e benefícios. A ordem de configuração é: benefícios → modelos de planos → planos dos clientes.

Benefícios (Planos → Benefícios) — serviços reaproveitados nos planos, como translado, cobertura funeral ou funções do app do Clube da Hora (Telemedicina, Telepet, ChTV, Clube de Descontos).

Modelos de Planos — clique em "+ Novo modelo" e preencha as abas:
- Dados: nome, cor, descrição, tipo (Individual, por CPF, ou Empresarial, por CNPJ), vigência, ciclo de cobrança e dia de vencimento.
- Preço: valor fixo por mês ou por faixa de idade, taxa de adesão (cobrada na 1ª parcela) e taxa de cancelamento.
- Produtos, Serviços, Benefícios Titular e Benefícios Dependente: o que o plano inclui.
- Regras (dependentes, limites) e Contrato (modelo de contrato vinculado).

Contratar um plano para um cliente:
1. Em Planos, clique em "Novo plano".
2. Busque o cliente titular por nome ou CPF e escolha o plano.
3. Clique em "Revisar e criar".

Consultar e ajustar um plano:
- Na lista de Planos, filtre por situação (Ativa, Pausada, Inativa, Isenta, Inadimplente, Cancelada) ou por filtro jurídico (Justiça, Procon).
- Clique na linha para ver as cobranças (adesão e parcelas, com vencimento).
- Use "Configurar plano" para dar desconto ou acréscimo só para aquele titular, mudar o número de parcelas, alterar valor ou vencimento das parcelas em aberto, e gerenciar dependentes e benefícios. Alterar uma parcela com guia já emitida cancela a guia e gera outra com os dados novos.
- "Ver cliente" abre a ficha do titular.

Operações em lote — ações sobre muitos planos de uma vez, com resultado pessoa por pessoa em Operações em lote:
- Renovações em Lote: lista quem está com o carnê acabando e emite as parcelas do próximo período, mantendo ou atualizando o preço.
- Migrar Planos em Lote: troca o plano de um grupo de clientes, preservando adesão, dependentes, contrato e carnê.
- Vencimentos em Lote: remarca datas de um bloco de parcelas que começou no mês errado ou corrige cobranças duplicadas.
- Reajuste em Lote: aplica reajuste percentual ou valor fixo sobre o que cada cliente paga hoje, conferindo linha por linha.
- Carnês em Lote: emite o carnê de muitos titulares em segundo plano, com lista de falhas para reprocessar e renovação automática opcional.

## 4. Vendas

Há dois caminhos: o PDV para venda rápida no balcão e Vendas & Serviços para orçamentos, pedidos e ordens de serviço. Nos dois, produtos baixam estoque e a venda gera conta a receber.

Vender pelo PDV:
1. Abra Vendas → PDV.
2. Escaneie o código de barras ou busque produtos e serviços para montar o carrinho.
3. Opcional: escolha o cliente (padrão: Consumidor) e o vendedor, e aplique desconto.
4. Escolha a forma de pagamento: dinheiro, Pix, cartão de crédito ou débito na maquininha, ou pagamento online por link.
5. Escolha a conta do caixa onde o valor entra (ou "Sem lançar no caixa"), informe o valor recebido e clique em "Finalizar venda".

No pagamento por link, o sistema gera um checkout que pode ser enviado ao cliente; o acompanhamento fica em Financeiro → Links de Pagamento.

Orçamentos, pedidos e ordens de serviço:
1. Em Vendas & Serviços, clique em "+ Novo documento".
2. Escolha o tipo: Orçamento, Pedido ou Ordem de Serviço.
3. Informe cliente, vendedor e comissão (opcionais), data, itens, desconto e observações, e clique em "Criar".
4. Faturar o documento baixa o estoque e gera a conta a receber.

A lista tem abas por tipo e mostra número, cliente, data, total e situação (por exemplo, Faturado).

## 5. Financeiro

O financeiro gira em torno de títulos (contas a pagar e a receber): vendas, parcelas de planos e lançamentos manuais viram títulos, e a baixa de um título vira movimentação no caixa.

- Contas a Pagar/Receber: títulos com vencimento e baixa. Mostra totais a receber e a pagar (em dia e vencido) e filtra por Todos, A receber ou A pagar. Situações: Pago, Vencido, Cancelado e em aberto.
- Fluxo de Caixa: contas financeiras (caixa, banco, gateway), saldo total, sessão de caixa e movimentações, incluindo recebimentos automáticos do gateway.
- DRE: demonstrativo simplificado: receitas, despesas e resultado do período (por vencimento), saldo em caixa e totais por categoria.
- Plano de Contas: contas de receita, custo e despesa em grupos e subgrupos, usadas no fluxo de caixa e na DRE. Permite importar e exportar.
- Links de Pagamento: checkouts gerados e o funil de conversão: abertos, pagos, abandonados e taxa de conversão. Permite copiar o link e ver o funil de cada um.

Lançar uma conta manualmente:
1. Em Contas a Pagar/Receber, clique em "+ Novo título".
2. Escolha "Conta a receber" ou "Conta a pagar".
3. Preencha descrição, valor e vencimento; emissão, categoria, cliente e observações são opcionais.
4. Clique em "Criar título".

Lançar um movimento no caixa — em Fluxo de Caixa, clique em "+ Movimento". Para cadastrar outro banco ou caixa, use "+ Nova conta".

Os recebimentos por Pix, boleto e cartão dependem de um banco ou gateway conectado em Configurações → Bancos.

## 6. Estoque, agenda, contratos e campanhas

Estoque — só vale para produtos com "Controlar estoque" ligado.
- Posição de Estoque: saldo de cada produto, estoque mínimo e alerta de "Abaixo do mínimo". Em cada linha há "+ Entrada", "− Saída", "Ajustar" e "Centros".
- Movimentações: histórico de entradas (inclusive por nota fiscal), saídas e ajustes. As vendas geram saídas automaticamente.
- Centros de Estoque: depósitos ou almoxarifados da filial, com localização do produto (ex.: A12-06).

Agenda:
1. Em Config. da Agenda, cadastre os profissionais ou recursos, seus horários e os serviços agendáveis.
2. Em Agenda, veja os agendamentos do dia por profissional e clique em "Novo agendamento".

Contratos:
1. Crie categorias em Categorias de Documentos (ex.: Plano de Benefícios).
2. Em Modelos de Documentos, crie modelos de contrato, cláusula, orçamento ou ordem de serviço com texto fixo, variáveis (ex.: {CONTRATO-DATA_INICIO}, {CONTRATO-VALOR_ADESAO}) e tabelas, com ou sem assinatura digital.
3. Em Contratos → Novo contrato, escolha cliente, modelo (opcional), assinatura ou plano, referência, data, dia de vencimento, valor mensal e forma de pagamento. Contratos sem modelo aceitam anexos.

Situações de um contrato: Pendente, Visualizado, Em Análise e Assinado.

Campanhas (Relacionamento) — mensagens em massa com público filtrado e disparo agendado. Clique em "Nova campanha" e siga as cinco etapas: Identificação, Público, Mensagem, Agendamento e Revisão. Canais:
- Push no app: chega na tela de bloqueio; só para quem instalou o app.
- WhatsApp: alcança quase todos; usa a instância de WhatsApp conectada.
- E-mail: bom para texto longo; depende do SMTP configurado.

A lista mostra situação, data do disparo, progresso e cliques. Mensagens automáticas (parcela vencendo, contrato assinado, aniversário) ficam em Configurações → Avisos e Campanhas.

## 7. Suporte, administração, configurações e API

Suporte:
- Chamados: clique em "Novo chamado", informe título e categoria (ex.: Dúvida), descreva o problema no editor e clique em "Abrir chamado". A lista mostra situação, responsável, abertura e prazo.
- Base de Conhecimento e Videoaulas: ainda marcadas como "Em breve".
- Novidades: notas de cada versão, com novidades, melhorias e correções.

Administração:
- Gestores: usuários com acesso total à empresa ("+ Novo gestor").
- Minhas Empresas: alterne entre empresas, cadastre novas, organize matrizes e filiais em grupos (visão consolidada) e compartilhe cadastros entre elas.

Configurações — liga a empresa aos serviços externos e define a aparência do portal do cliente:
- Bancos: gateways e bancos para Pix, boleto, carnê e cartão: Asaas, Banco do Brasil, Bradesco, Efí, Sicoob.
- Fiscal: emissão de NF-e (produtos) e NFS-e (serviços).
- Integrações: WhatsApp (WhatsMeow por QR Code, Z-API ou API oficial da Meta), e-mail por SMTP e o clube de benefícios Clube da Hora.
- Avisos e Campanhas: mensagens automáticas por evento (link de pagamento gerado, parcela vencendo, contrato assinado, plano cancelado, aniversário), conferidas de hora em hora.
- Funcionamento: regras do sistema, como o cadastro de cliente guiado.
- Empresa: logo, favicon, cores, nome fantasia, razão social, CNPJ, contato e endereço.
- Portal do Cliente: logo, cores e banners da área do cliente, com prévia.
- Login do Cliente: endereço de acesso, logo, imagem de fundo e cores da tela de login do cliente.
- Cartão: frente, verso e cor do texto do cartão do associado exibido no app.
- Carnê: layout do carnê/boleto, com prévia, importação e exportação.

API para desenvolvedores (Desenvolvedores → Aplicações) — crie uma aplicação (sandbox ou produção) para outro sistema consultar dados do ERP. A chave aparece uma única vez; chaves extras podem ter validade de 90 dias, 180 dias, 1 ano ou sem expiração, e podem ser revogadas na hora. A primeira rota disponível consulta os planos, somente leitura. Documentação: https://docs.cherp.com.br
