# Cherp ERP — Suporte, administração, configurações e API

Pergunta: Como abro um chamado com o suporte da Cherp?
Resposta: Em Suporte > Chamados, clique em "Novo chamado". Informe o título (obrigatório) e a categoria (por exemplo, Dúvida), descreva o problema no editor e clique em "Abrir chamado". A lista mostra a situação, o responsável, a data de abertura e o prazo de cada chamado.

Pergunta: O sistema tem base de conhecimento ou videoaulas?
Resposta: As telas Suporte > Base de Conhecimento e Suporte > Videoaulas existem, mas ainda estão marcadas como "Em breve". Enquanto isso, as novidades de cada versão ficam em Suporte > Novidades.

Pergunta: Como cadastro uma nova empresa ou filial?
Resposta: Em Administração > Minhas Empresas, clique em "Nova empresa". Nessa tela você também alterna entre empresas, organiza matrizes e filiais em grupos (com visão consolidada), anexa uma empresa como matriz ou filial e configura o compartilhamento de cadastros entre elas.

Pergunta: Como adiciono outro gestor?
Resposta: Em Administração > Gestores, clique em "+ Novo gestor". Gestores têm acesso total à empresa.

Pergunta: Como conecto o banco para receber por Pix, boleto e cartão?
Resposta: Em Administração > Configurações > Bancos. Estão disponíveis Asaas, Banco do Brasil, Bradesco, Efí (Gerencianet) e Sicoob, cada um com os meios que suporta. Clique em "Configurar credenciais" (ou "Editar credenciais") no banco desejado. Para cada meio (Pix, boleto, cartão) você escolhe por qual banco a cobrança sai.

Pergunta: Como configuro a emissão de nota fiscal?
Resposta: Em Administração > Configurações > Fiscal, clique em "Configurar credenciais". O módulo emite NF-e (produtos) e NFS-e (serviços).

Pergunta: Como conecto o WhatsApp?
Resposta: Em Administração > Configurações > Integrações. Há três opções: WhatsMeow (conecta um número lendo o QR Code, como o WhatsApp Web), Z-API (instância + token, conecta por QR) e WhatsApp Cloud API oficial da Meta. Na mesma aba ficam o e-mail por SMTP e o clube de benefícios Clube da Hora.

Pergunta: Como mudo o logo e as cores da empresa?
Resposta: Em Administração > Configurações > Empresa: logo, favicon, cor primária e secundária, prefixo do título das abas, nome fantasia, razão social, CNPJ, telefone, e-mail e endereço.

Pergunta: Como personalizo o portal e o app do cliente?
Resposta: Em Administração > Configurações: a aba "Portal do Cliente" define logo, cores, botões e banners rotativos da tela inicial (com prévia); a aba "Login do Cliente" mostra o endereço de acesso do cliente e define logo, imagem de fundo e cores da tela de login; a aba "Cartão" define frente, verso e cor do texto do cartão do associado exibido no app.

Pergunta: Como altero o layout do carnê?
Resposta: Em Administração > Configurações > Carnê. A tela mostra uma prévia do boleto/carnê e permite ajustar o layout, importar, exportar, restaurar o padrão e salvar.

Pergunta: Como integro outro sistema com o Cherp (API)?
Resposta: Em Desenvolvedores > Aplicações, clique em "Nova aplicação" e escolha o ambiente (sandbox para testar ou produção). A primeira chave de acesso é gerada junto e aparece uma única vez; copie e guarde. Você pode criar chaves extras com validade de 90 dias, 180 dias, 1 ano ou sem expiração, e revogar uma chave na hora. A primeira rota disponível consulta os planos da empresa, somente leitura. A documentação para desenvolvedores fica em docs.cherp.com.br, com exemplos em cURL, JavaScript, PHP e Python.
