# Cherp ERP — Fluxo completo de contratos: categoria, modelo, numeração, cadastro e assinatura digital

Este documento explica, em detalhes, como criar e gerenciar contratos no Cherp ERP: os pré-requisitos (cliente cadastrado e categoria de contrato), os modelos de contrato, a numeração automática, o cadastro do contrato, o link de assinatura digital e onde consultar o contrato assinado.

## Visão geral do fluxo

Ordem do processo:
1. Ter o cliente cadastrado no sistema (Cadastros > Clientes).
2. Cadastrar a categoria de contrato (Contratos > Categorias de Documentos).
3. Criar o modelo de contrato e vinculá-lo à categoria (Contratos > Modelos de Documentos).
4. Conferir a numeração automática dos contratos (Administração > Configurações > Empresa > campo "Número inicial do contrato").
5. Cadastrar o contrato e vincular o cliente (Contratos > Contratos > "Novo contrato").
6. Gerar o link de assinatura e enviar ao cliente para ele assinar digitalmente.
7. Acompanhar a situação do contrato e baixar o arquivo, na aba Contratos ou na ficha do cliente (Clientes > cliente > subaba Contrato).

Regras de negócio informadas pela equipe:
- Para cadastrar um contrato, é preciso ter um cliente cadastrado no sistema. O contrato sempre pertence a um cliente.
- Antes de vincular um contrato, é preciso cadastrar uma categoria de contrato.

## Conceitos importantes

- Categoria de contrato (ou categoria de documento): rótulo que descreve e classifica o tipo de contrato, por exemplo "Contrato de prestação de serviço" ou "Plano de Benefícios".
- Modelo de contrato (modelo de documento): o texto-base do contrato, com texto fixo, variáveis e tabelas. Um modelo pode ser específico, por exemplo "Contrato Plano Ouro", "Contrato Plano Prata" ou "Contrato de velório".
- Contrato: o documento gerado para um cliente específico, a partir de um modelo (ou avulso, com arquivo anexado). Recebe um número automático.
- Número do contrato: gerado automaticamente em sequência pelo sistema.
- Referência do contrato: código opcional informado pela empresa (por exemplo, REF-1234). É diferente do número do contrato.
- Link de assinatura: endereço gerado pelo sistema para o cliente assinar o contrato digitalmente.

## Passo 1 — Ter o cliente cadastrado

O contrato precisa de um cliente. Se o cliente ainda não existir, cadastre-o em Cadastros > Clientes > "+ Novo cliente" (veja o documento "Fluxo completo: criar o modelo de plano, cadastrar o cliente e vincular o plano"). Quando o contrato é de um plano, o ideal é que o plano já esteja vinculado ao cliente, para o contrato puxar os dados do plano.

## Passo 2 — Cadastrar a categoria de contrato

1. Acesse Contratos > Categorias de Documentos.
2. Clique em "Nova categoria".
3. Informe o nome da categoria, que deve descrever o tipo de contrato. Exemplos: "Contrato de prestação de serviço", "Plano de Benefícios", "Contrato de velório".
4. Preencha a descrição (opcional) e salve.

A lista mostra nome, descrição, data de criação e ações. As categorias servem como rótulos para classificar os modelos e documentos (por exemplo: Locação, Termo de Plano, Orçamento). Exemplo do ambiente de testes: categoria "Plano de Benefícios".

## Passo 3 — Criar o modelo de contrato

1. Acesse Contratos > Modelos de Documentos.
2. Clique em "Novo documento".
3. Escolha o tipo do documento: contrato, cláusula, orçamento ou ordem de serviço.
4. Vincule a categoria criada no passo 2.
5. Escreva o texto do contrato. Ele pode ter texto fixo, variáveis e tabelas.
6. Defina se o documento terá assinatura digital ou não.
7. Salve.

O modelo pode ser específico para cada situação, por exemplo: "Contrato Plano Ouro", "Contrato Plano Prata" ou "Contrato de velório".

A lista de modelos mostra nome, tipo, categoria, assinatura e situação. Exemplos do ambiente de testes:
- "Termo Plano de Beneficios": tipo Contrato, categoria Plano de Benefícios, com assinatura digital, ativo.
- "Contrato Nacional": tipo Contrato, sem categoria, sem assinatura, ativo.

### Variáveis do contrato

Use o menu "Inserir variável" do editor para incluir dados que o sistema preenche sozinho ao gerar o contrato. Exemplos:
- {CONTRATO-DATA_INICIO}: data de efetivação do plano.
- {CONTRATO-VALOR_ADESAO}: valor da adesão.
- {CONTRATO-VENDEDOR}: vendedor do contrato.
- {CONTRATO-FORMA_PAGAMENTO}: forma de pagamento, impressa como "Pix / Boleto / Cartão".
- {PLANO-DEPENDENTES_GRATIS}: quantidade de dependentes grátis do plano.
- {PLANO-MAX_DEPENDENTES}: máximo de dependentes do plano ("ilimitado" quando não há limite).

Sem uma assinatura ou plano vinculado ao contrato, as variáveis do plano ficam em branco; o sistema nunca inventa valores. A prévia do editor mostra um exemplo de cada variável.

### Vincular o modelo de contrato ao modelo de plano

Na subaba Contrato do modelo de plano (Planos > Modelos de Planos > editar o modelo > Contrato), escolha o modelo de contrato que será usado nos planos daquele tipo.

## Passo 4 — Numeração automática dos contratos

Ao gerar um contrato, o número é criado automaticamente, conforme a definição em Configurações.

Onde configurar:
1. Acesse Administração > Configurações.
2. Entre na subaba Empresa.
3. Na parte inferior da página, localize o campo "Número inicial do contrato". Hoje ele está configurado como 1.

Como funciona: a numeração dos contratos é gerada automaticamente, em sequência, a partir desse número. Exemplo: se a empresa já tem 4.300 contratos vinculados aos clientes, o próximo contrato será o número 4.301.

Como continuar a numeração que a empresa já usa: altere o número inicial para o último número de contrato usado. Exemplo: se o último contrato cadastrado tem o número 501020, ajuste o campo para 501020. Ao cadastrar um novo contrato, o sistema gera automaticamente o próximo número da sequência: 501021. O mesmo vale para qualquer sequência (por exemplo, 205082 → 205083).

Atenção:
- Essa configuração vale somente para o número do contrato, não para a referência do contrato.
- Não há confirmação de um botão para ver o próximo número disponível.
- Se a empresa usa duas sequências independentes, verifique como elas estão organizadas antes de orientar a alteração; não há confirmação de que essa configuração controle duas sequências separadas.

## Passo 5 — Cadastrar o contrato e vincular o cliente

1. Acesse Contratos > Contratos.
2. Clique em "Novo contrato".
3. Preencha a aba Dados:
   - Cliente: busque por nome ou CPF (obrigatório ter o cliente cadastrado).
   - Modelo (opcional): o modelo de contrato. Se escolher "Sem modelo (anexar depois)", o contrato é avulso e o documento é anexado depois.
   - Assinatura / plano (opcional): o plano do cliente ao qual o contrato se refere.
   - Referência: o número ou código interno da empresa (diferente do número do contrato).
   - Data.
   - Dia de vencimento.
   - Valor mensal (R$).
   - Forma de pagamento.
   - Observação.
4. Use a aba Anexos para anexar documentos, quando necessário.
5. Clique em "Criar contrato".

Resultado: o contrato recebe o número automático e aparece na aba Contratos como um registro (card) com o nome do cliente e o número do contrato.

A lista de Contratos mostra: número, referência, cliente, modelo, data e hora, situação e ações. A lista pode ser exportada (botão "Exportar"). Clique no contrato para abrir, anexar documentos e conferir.

## Passo 6 — Gerar o link de assinatura digital

1. Na aba Contratos, clique no card do contrato.
2. Confira os dados do contrato: plano, data e vencimento.
3. No canto superior direito, clique no menu de três pontinhos.
4. Escolha a opção "Link de assinatura".
5. Copie o link gerado e envie ao cliente (por exemplo, por WhatsApp ou e-mail).
6. O cliente abre o link e assina o contrato de forma digital.

A assinatura digital precisa estar ligada no modelo de contrato (Contratos > Modelos de Documentos > coluna Assinatura: "Assinatura digital").

## Passo 7 — Acompanhar a situação e baixar o contrato

O contrato fica disponível em dois lugares:
- Na aba Contratos (Contratos > Contratos).
- Na ficha do cliente: Clientes > abra o cliente > subaba Contrato.

Na subaba Contrato do cliente aparecem a situação (assinado ou pendente) e o arquivo do contrato, disponível para baixar.

Situações do contrato:
- Pendente: o contrato foi gerado e ainda não foi assinado.
- Visualizado: o cliente abriu o contrato.
- Em Análise: o contrato está em conferência (por exemplo, contrato com documentos anexados para análise).
- Assinado: o cliente assinou o contrato.

Mensagens automáticas: em Administração > Configurações > Avisos e Campanhas é possível criar um aviso automático para quando o contrato for assinado.

## Perguntas frequentes

Pergunta: Posso cadastrar um contrato sem cliente?
Resposta: Não. Para cadastrar um contrato é preciso ter o cliente cadastrado no sistema. No "Novo contrato", o primeiro campo é a busca do cliente por nome ou CPF.

Pergunta: O que preciso cadastrar antes de criar um contrato?
Resposta: O cliente (Cadastros > Clientes) e a categoria de contrato (Contratos > Categorias de Documentos). Depois, crie o modelo de contrato em Contratos > Modelos de Documentos.

Pergunta: O que é a categoria de contrato?
Resposta: É uma descrição que classifica o tipo de contrato, por exemplo "Contrato de prestação de serviço". Ela é cadastrada em Contratos > Categorias de Documentos > "Nova categoria" e vinculada aos modelos de contrato.

Pergunta: Posso ter um modelo de contrato para cada plano?
Resposta: Sim. Crie modelos específicos em Contratos > Modelos de Documentos, por exemplo "Contrato Plano Ouro", "Contrato Plano Prata" ou "Contrato de velório", e vincule cada um ao modelo de plano na subaba Contrato.

Pergunta: Como o número do contrato é gerado?
Resposta: Automaticamente, em sequência, a partir do campo "Número inicial do contrato" em Administração > Configurações > Empresa (parte inferior da página). Se a empresa já tem 4.300 contratos, o próximo será o 4.301.

Pergunta: Já uso uma numeração própria. Como continuar a partir dela?
Resposta: Em Administração > Configurações > Empresa, ajuste o campo "Número inicial do contrato" para o último número usado. Exemplo: com o último contrato 501020, ajuste para 501020; o próximo contrato será o 501021.

Pergunta: A numeração muda a referência do contrato?
Resposta: Não. O campo "Número inicial do contrato" vale só para o número do contrato. A referência é um código opcional preenchido no cadastro de cada contrato.

Pergunta: Como envio o contrato para o cliente assinar?
Resposta: Em Contratos > Contratos, clique no card do contrato, abra o menu de três pontinhos no canto superior direito e escolha "Link de assinatura". Envie o link ao cliente; ele assina de forma digital.

Pergunta: Onde vejo se o cliente já assinou o contrato?
Resposta: Na coluna de situação da aba Contratos ou na ficha do cliente, em Clientes > cliente > subaba Contrato, que mostra se está assinado ou pendente.

Pergunta: Onde baixo o contrato assinado?
Resposta: Na ficha do cliente, em Clientes > cliente > subaba Contrato. O arquivo do contrato fica disponível para baixar.

Pergunta: Posso criar um contrato sem modelo?
Resposta: Sim. No "Novo contrato", escolha "Sem modelo (anexar depois)" e anexe o documento na aba Anexos.

Pergunta: Quais são as situações de um contrato?
Resposta: Pendente, Visualizado, Em Análise e Assinado.

Pergunta: Por que as informações do plano saíram em branco no contrato?
Resposta: Porque o contrato não tem assinatura ou plano vinculado. Sem plano vinculado, as variáveis do plano (como {PLANO-MAX_DEPENDENTES}) ficam em branco. Vincule o plano no campo "Assinatura / plano" do contrato.
