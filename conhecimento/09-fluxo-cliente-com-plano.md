# Cherp ERP — Fluxo completo: criar o modelo de plano, cadastrar o cliente e vincular o plano

Este documento explica, em detalhes, o caminho completo para colocar um cliente com plano ativo no Cherp ERP: primeiro se cria o modelo de plano (por exemplo, Plano Bronze, Prata ou Ouro), depois se cadastra o cliente e, por fim, se vincula o plano a ele, com data de vencimento, adesão, valores, dependentes e benefícios.

## Visão geral do fluxo

Ordem obrigatória do processo:
1. Cadastrar os benefícios que os planos vão oferecer (Planos > Benefícios). Este passo é necessário apenas se os benefícios ainda não existirem.
2. Criar o modelo de plano (Planos > Modelos de Planos > "+ Novo modelo"), preenchendo as subabas Dados, Produtos, Serviços, Benefícios Titular, Benefícios Dependente, Regras e Contrato.
3. Cadastrar o cliente (Cadastros > Clientes > "+ Novo cliente").
4. Vincular o plano ao cliente, informando os dados do plano (data de vencimento, adesão e valores), os dependentes e os benefícios.
5. Conferir e ajustar o plano contratado em Planos > Planos > "Configurar plano".

Regra de negócio informada pela equipe: para cadastrar um cliente com plano, é preciso ter antes um modelo de plano ativo e cadastrado no sistema. Sem modelo de plano, não há o que vincular ao cliente. Por isso, a criação do modelo sempre vem primeiro.

## Conceitos importantes

- Modelo de plano: é o "molde" do plano (por exemplo, Plano Bronze). Define preço, vigência, ciclo de cobrança, taxa de adesão, taxa de cancelamento, dependentes, benefícios, regras e contrato. Fica em Planos > Modelos de Planos.
- Plano (assinatura): é o plano já contratado por um cliente específico (o titular), criado a partir de um modelo. Fica em Planos > Planos. Cada plano tem suas parcelas, seus dependentes e seus benefícios.
- Titular: o cliente que contrata o plano.
- Dependente: pessoa (ou pet) incluída no plano do titular.
- Benefício: serviço cadastrado uma vez e reaproveitado em vários planos, como Telemedicina, Telepet, ChTV, Clube de Descontos, translado ou cobertura funeral.
- Adesão: taxa cobrada na primeira cobrança do plano.
- Parcela: cada cobrança mensal do plano.

## Passo 1 — Cadastrar os benefícios (se ainda não existirem)

1. Acesse o menu Planos > Benefícios.
2. Clique em "Novo benefício".
3. Cadastre o benefício (nome, tipo e descrição) e salve.

Na tela Benefícios & Serviços a lista mostra benefício, tipo, descrição e situação (Ativo/Inativo), e pode ser exportada. Exemplos encontrados no ambiente de testes: ChTV, Clube de Descontos, Telemedicina e Telepet, todos do tipo "Função no app", fornecidos pelo Clube da Hora.

Os benefícios do Clube da Hora dependem da integração ativa em Administração > Configurações > Integrações > Clube da Hora.

## Passo 2 — Criar o modelo de plano

1. Acesse o menu Planos > Modelos de Planos.
2. Clique em "+ Novo modelo".
3. Preencha as subabas, nesta ordem: Dados, Produtos, Serviços, Benefícios Titular, Benefícios Dependente, Regras e Contrato.
4. Clique em "Criar plano" para salvar. O botão "Voltar" sai sem salvar.

### Subaba Dados

Campos da subaba Dados:
- Nome do plano: por exemplo, Plano Bronze, Plano Prata, Plano Ouro.
- Cor: cor de identificação do plano.
- Descrição (opcional): texto de apresentação, por exemplo "O melhor plano para você e sua família".
- Tipo do plano:
  - Individual: pessoa física (CPF). Um titular e seus dependentes.
  - Empresarial: empresa (CNPJ). Contratado por uma organização.
- Vigência: duração do plano (por exemplo, 12 meses).
- Ciclo de cobrança: de quanto em quanto tempo o plano é cobrado, com a opção "escolher dia" para definir o dia do vencimento.
- Forma de preço:
  - Valor fixo: um valor por mês igual para todos.
  - Por faixa de idade: o valor varia conforme a idade (há uma tabela de preços).
- Valor por mês: valor da mensalidade.
- Taxa de adesão (1ª cobrança): valor cobrado na primeira cobrança.
- Taxa de cancelamento: valor cobrado se o plano for cancelado.

### Subabas Produtos e Serviços

Nestas subabas você vincula ao modelo os produtos (Cadastros > Produtos) e os serviços (Cadastros > Serviços) incluídos no plano. Por isso, produtos e serviços precisam estar cadastrados antes. Exemplos de serviços do ambiente de testes: Translado (cobrado por unidade, km) e Tanatopraxia (cobrada por faixa, quilo).

### Subabas Benefícios Titular e Benefícios Dependente

- Benefícios Titular: benefícios que o titular recebe.
- Benefícios Dependente: benefícios que cada dependente recebe.

Os benefícios de titular e de dependente podem ser diferentes. Exemplo do ambiente de testes (Plano Ouro): titular com Telemedicina, Clube de Descontos, ChTV e Telepet; dependente com Clube de Descontos e Telemedicina.

Cada benefício pode ter uma cota grátis (quantidade incluída no plano sem custo) e um valor para o que passar da cota.

### Subaba Regras

Na subaba Regras ficam as regras do modelo, entre elas:
- Dependentes: quantidade máxima de dependentes (ou ilimitado), quantos entram grátis e o valor de cada dependente adicional.
- Regras de desconto ou acréscimo aplicadas aos benefícios e dependentes.
- Alteração automática do nome do plano: prefixo ou nome usado quando o cliente contrata benefícios extras (por exemplo, um Plano Bronze que passa a se chamar Bronze Plus, Pro ou Master ao receber um benefício a mais). Veja o atendimento "Alteração automática da categoria do plano".

### Subaba Contrato

Nesta subaba você escolhe o modelo de contrato vinculado ao plano. O modelo de contrato é criado antes em Contratos > Modelos de Documentos (por exemplo, "Termo Plano de Benefícios", com assinatura digital). O contrato usa variáveis que são preenchidas automaticamente com os dados do plano, como {CONTRATO-DATA_INICIO}, {CONTRATO-VALOR_ADESAO}, {CONTRATO-VENDEDOR}, {CONTRATO-FORMA_PAGAMENTO}, {PLANO-DEPENDENTES_GRATIS} e {PLANO-MAX_DEPENDENTES}.

### Exemplos de modelos de plano (ambiente de testes)

Os valores abaixo são exemplos encontrados no ambiente de testes do Cherp, para ilustrar como os modelos ficam configurados:
- Plano Ouro: R$ 30,00/mês, valor fixo; vigência de 12 meses, 12 parcelas; adesão de R$ 100,00; até 10 dependentes, R$ 10,00 cada.
- Plano Prata: R$ 49,90/mês, valor fixo; vigência de 12 meses, 12 parcelas; adesão de R$ 99,90; até 5 dependentes, R$ 9,90 cada; benefício do titular: Clube de Descontos.
- Plano BV Diamante: de R$ 69,90 a R$ 89,90/mês, por faixa de idade (com tabela de preços); vigência de 12 meses, 12 parcelas; adesão de R$ 289,90; até 30 dependentes, valor por faixa de idade; benefício do titular: Clube de Descontos.
- Plano Bronze: R$ 39,90/mês.

Na lista de Modelos de Planos, cada cartão mostra nome, descrição, valor, forma de preço, vigência, número de parcelas, adesão, regra de dependentes, benefícios do titular e do dependente e a situação (Ativo).

## Passo 3 — Cadastrar o cliente

1. Acesse Cadastros > Clientes.
2. Clique em "+ Novo cliente".
3. Preencha os dados.
4. Clique em "Continuar para o plano" para seguir para o vínculo do plano.

Campos do cadastro do cliente:
- Nome.
- Tipo: Pessoa Física ou Pessoa Jurídica.
- CPF: opcional, mas sem ele o cadastro fica marcado como incompleto.
- Telefone e Telefone 2.
- E-mail (opcional).
- Data de nascimento: obrigatória. Também é usada nos planos com preço por faixa de idade.
- Referência: número ou código interno da empresa.
- RG, estado civil, sexo, naturalidade, profissão, religião, apelido.
- Nome da mãe e nome do pai.
- Seguradora.
- Endereço: CEP, logradouro, número, complemento, bairro, cidade e UF.
- Observações (opcional).

Cadastro guiado: em Administração > Configurações > Funcionamento existe a opção "Cadastro de cliente guiado (cliente com plano)". Ligada, o botão "Novo cliente" abre um passo a passo com quatro etapas: dados do cliente → plano → dependentes → revisão, e o plano já é contratado ao concluir. Desligada, o cadastro do cliente segue o formato simples.

## Passo 4 — Vincular o plano ao cliente

Há dois caminhos para vincular o plano:
- Pelo cadastro do cliente: ao final do cadastro, clique em "Continuar para o plano" (ou siga as etapas do cadastro guiado).
- Pela tela de Planos: em Planos > Planos, clique em "Novo plano", busque o cliente titular por nome ou CPF, escolha o modelo de plano e clique em "Revisar e criar".

Ao vincular o plano, informe:
- Dados do plano: o modelo escolhido, a data de vencimento das parcelas, a adesão e os valores (valor do plano e da parcela).
- Dependentes: as pessoas ou pets que entram no plano.
- Benefícios: os benefícios contratados para o titular e para cada dependente.

### Incluir dependentes

Na inclusão de dependente (no vínculo do plano, em "Configurar plano" > Dependentes, ou em Clientes > Dependentes > "Adicionar dependente"):
- Escolha se o dependente é Pessoa ou Pet.
- Preencha os campos obrigatórios; há também "Informações adicionais".
- Veja os benefícios do plano para o dependente, com a cota grátis, o que está "Incluso", o valor do modelo do plano e a regra de desconto ou acréscimo.
- Confira o resumo com o valor da nova parcela e confirme no popup.

Avisos do sistema na inclusão de dependente:
- Plano pausado.
- Limite de pessoas do plano atingido (pets não contam no limite).
- A ocupação do plano e a parcela de hoje são exibidas.
- Se houver erro, o sistema rola até o primeiro campo com problema.

Planos cancelados não aparecem na escolha do plano do dependente. Quando há dois planos com o mesmo nome, o sistema mostra número, data de início, valor da parcela e situação para diferenciar.

## Passo 5 — Conferir e ajustar o plano contratado

1. Acesse Planos > Planos.
2. Clique na linha do cliente para ver as faturas e cobranças do plano: adesão e cada parcela (por exemplo, Parcela 1/12), com a data de vencimento.
3. Clique em "Configurar plano" para ajustar.

A tela "Configurar plano" tem três seções:
- Dados do plano (valor, ajuste e parcelas):
  - Mostra o valor do plano e o valor da parcela para aquele titular.
  - "Adicionar ajuste": desconto ou acréscimo que vale só para esse titular e não altera o modelo do plano.
  - Número de parcelas: muda até onde vão as próximas parcelas, sem mexer nas já geradas. Em branco, segue a vigência do plano. Reduzir abaixo do que já existe não apaga cobranças.
  - Parcelas em aberto: lista as pendentes e vencidas. Alterar o valor ou o vencimento de uma parcela cancela a guia (boleto) já emitida, e uma nova é gerada com os dados novos.
- Dependentes: quantos estão no plano e a gestão de cada um.
- Benefícios: quantos foram contratados e a gestão de cada um.

Depois, clique em "Salvar". O botão "Ver cliente" abre a ficha do titular.

Na lista de Planos, cada plano mostra: cliente e plano, situação (Ativa, Pausada, Inativa, Isenta, Inadimplente ou Cancelada), valor do plano por mês, valor da parcela (indicando "com adicionais" quando há dependentes ou benefícios extras), número de dependentes, carnê (Gerado ou Não gerado), data de adesão e próxima cobrança. Há filtros por situação, filtro jurídico (Justiça, Procon) e busca.

## Depois do vínculo

- Contrato: o contrato do plano aparece em Contratos > Contratos, com as situações Pendente, Visualizado, Em Análise e Assinado. Também é possível criar o contrato manualmente em "Novo contrato", escolhendo o cliente, o modelo, a assinatura ou plano, a referência, a data, o dia de vencimento, o valor mensal e a forma de pagamento.
- Cobranças: as parcelas viram contas a receber em Financeiro > Contas a Pagar/Receber.
- Carnê: emita o carnê do cliente ou use Operações em lote > Carnês em Lote para vários titulares de uma vez. A coluna "Carnê" da lista de Planos indica se já foi gerado.
- Renovação: quando o carnê está acabando, use Operações em lote > Renovações em Lote.
- Mensagens automáticas: em Administração > Configurações > Avisos e Campanhas, avisos como parcela vencendo e contrato assinado são enviados sozinhos.

## Perguntas frequentes

Pergunta: Posso cadastrar um cliente com plano sem ter um modelo de plano?
Resposta: Não. Primeiro crie o modelo de plano em Planos > Modelos de Planos > "+ Novo modelo". Só depois o plano pode ser vinculado ao cliente.

Pergunta: Qual a ordem certa para configurar planos e clientes?
Resposta: Benefícios (Planos > Benefícios), depois o modelo de plano (Planos > Modelos de Planos), depois o cliente (Cadastros > Clientes) e, por fim, o vínculo do plano ao cliente.

Pergunta: Quais são as subabas do modelo de plano?
Resposta: Dados, Produtos, Serviços, Benefícios Titular, Benefícios Dependente, Regras e Contrato.

Pergunta: Onde defino o preço, a adesão e a vigência do plano?
Resposta: Na subaba Dados do modelo de plano: valor por mês (fixo ou por faixa de idade), taxa de adesão, taxa de cancelamento, vigência e ciclo de cobrança com o dia do vencimento.

Pergunta: Qual a diferença entre plano Individual e Empresarial?
Resposta: Individual é para pessoa física (CPF), com um titular e seus dependentes. Empresarial é para empresa (CNPJ), contratado por uma organização.

Pergunta: Como faço um plano com preço diferente por idade?
Resposta: Na subaba Dados do modelo, escolha "Por faixa de idade" e preencha a tabela de preços. A data de nascimento do cliente, que é obrigatória, é usada no cálculo.

Pergunta: Onde defino quantos dependentes o plano aceita?
Resposta: Na subaba Regras do modelo de plano: número máximo de dependentes, quantos entram grátis e o valor de cada dependente adicional.

Pergunta: Como vinculo um plano a um cliente já cadastrado?
Resposta: Em Planos > Planos, clique em "Novo plano", busque o titular por nome ou CPF, escolha o modelo e clique em "Revisar e criar".

Pergunta: O que preencho ao vincular o plano ao cliente?
Resposta: Os dados do plano (modelo, data de vencimento, adesão e valores), os dependentes e os benefícios do titular e dos dependentes.

Pergunta: Como dou um desconto só para um cliente sem mudar o plano de todos?
Resposta: Em Planos > Planos, clique na linha do cliente, em "Configurar plano" e em "Adicionar ajuste". O ajuste vale só para esse titular.

Pergunta: Posso mudar o vencimento de uma parcela depois de vincular o plano?
Resposta: Sim, em "Configurar plano" > Parcelas em aberto. Atenção: se a parcela já tinha boleto emitido, ele é cancelado e um novo é gerado com os dados novos.

Pergunta: Por que a parcela do cliente está maior que o valor do plano?
Resposta: Porque a parcela inclui adicionais, como dependentes extras e benefícios além da cota grátis. Na lista de Planos, essa parcela aparece com a indicação "com adicionais".

Pergunta: O que é o cadastro de cliente guiado?
Resposta: É uma opção em Administração > Configurações > Funcionamento. Ligada, o cadastro de cliente vira um passo a passo (dados do cliente, plano, dependentes e revisão) e o plano já é contratado no final.
