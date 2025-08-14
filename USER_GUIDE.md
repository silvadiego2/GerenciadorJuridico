# Guia do Usuário - Sistema Jurídico

## 🚀 Primeiros Passos

### Fazendo Login
1. Acesse o sistema através do link fornecido
2. Digite seu e-mail e senha
3. Clique em "Entrar"

### Contas de Demonstração
Para testar o sistema, use uma das contas abaixo:

- **Advogado**: `joao@escritorio.com` / `demo123`
- **Estagiário**: `maria@escritorio.com` / `demo123`
- **Administrador**: `admin@escritorio.com` / `demo123`
- **Cliente**: `cliente@teste.com` / `demo123`

## 🏠 Dashboard Principal

### Visão Geral
O dashboard mostra um resumo completo do escritório:
- **Processos ativos** e total
- **Clientes cadastrados**
- **Tarefas vencidas**
- **Receita mensal**
- **Publicações pendentes**

### Gráficos e Estatísticas
- **Processos por status**: Distribuição visual dos processos
- **Atividades recentes**: Últimas ações no sistema
- **Evolução mensal**: Tendências de crescimento

## 👥 Gestão de Clientes

### Cadastrando Clientes
1. Acesse "Clientes" no menu lateral
2. Clique em "Novo Cliente"
3. Preencha os dados:
   - **Nome completo** (obrigatório)
   - **E-mail** (obrigatório)
   - **Telefone**
   - **CPF/CNPJ**
   - **Tipo**: Pessoa física ou jurídica
   - **Endereço completo**

### Buscando Clientes
- Use a barra de busca para encontrar por nome, e-mail ou documento
- Filtre por tipo (pessoa física/jurídica)
- Filtre por status (ativo/inativo)

### Editando Clientes
1. Na lista de clientes, clique no ícone de edição
2. Modifique os dados necessários
3. Salve as alterações

## ⚖️ Gestão de Processos

### Cadastrando Processos
1. Acesse "Processos" no menu lateral
2. Clique em "Novo Processo"
3. Preencha as informações:
   - **Número do processo** (formato CNJ)
   - **Cliente** (selecione da lista)
   - **Assunto/matéria**
   - **Classe processual**
   - **Vara/tribunal**
   - **Comarca**
   - **Fase atual**
   - **Valor da causa** (opcional)

### Importando Processos
1. Acesse "Integrações" → "Busca de Processos"
2. Selecione a fonte (DataJud, TJ-BA, PJe)
3. Digite o número do processo, OAB ou CPF
4. Clique em "Buscar"
5. Nos resultados, clique em "Importar"

### Acompanhando Processos
- **Status**: Ativo, suspenso, arquivado, baixado
- **Andamentos**: Histórico completo de movimentações
- **Documentos**: Arquivos vinculados ao processo
- **Tarefas**: Prazos e atividades relacionadas

## ✅ Gestão de Tarefas

### Criando Tarefas
1. Acesse "Tarefas" no menu lateral
2. Clique em "Nova Tarefa"
3. Preencha:
   - **Título** (obrigatório)
   - **Descrição**
   - **Processo** (opcional)
   - **Cliente** (opcional)
   - **Responsável**
   - **Prioridade**: Baixa, média, alta, urgente
   - **Data de vencimento**

### Priorizando Tarefas
- **Urgente**: Vermelho - Ação imediata
- **Alta**: Laranja - Próximos dias
- **Média**: Amarelo - Próxima semana
- **Baixa**: Verde - Sem pressa

### Controlando Prazos
- **Vencidas**: Tarefas com prazo ultrapassado
- **Vence em breve**: Próximos 3 dias
- **No prazo**: Mais de 3 dias para vencer

### Concluindo Tarefas
1. Na lista de tarefas, clique em "Concluir"
2. A tarefa será marcada como concluída
3. Histórico é preservado para auditoria

## 📁 Gestão de Documentos

### Organizando Documentos
- **Por processo**: Documentos específicos de cada processo
- **Por cliente**: Documentos gerais do cliente
- **Por pasta**: Organização personalizada

### Fazendo Upload
1. Acesse "Documentos" no menu lateral
2. Clique em "Upload"
3. Selecione os arquivos
4. Adicione tags para facilitar a busca
5. Vincule a processo ou cliente (opcional)

### Tipos de Arquivo Suportados
- **PDF**: Petições, contratos, decisões
- **Word**: Documentos editáveis
- **Imagens**: JPG, PNG para documentos digitalizados
- **Excel**: Planilhas e relatórios

### Versionamento
- Cada upload cria uma nova versão
- Histórico completo de alterações
- Possibilidade de restaurar versões anteriores

## 💰 Módulo Financeiro

### Tipos de Lançamento
- **Honorários**: Contratuais, avulsos, êxito
- **Despesas**: Custas, diligências, perícias
- **Receitas**: Pagamentos recebidos
- **Reembolsos**: Valores a receber

### Cadastrando Lançamentos
1. Acesse "Financeiro" no menu lateral
2. Clique em "Nova Entrada"
3. Selecione o tipo
4. Preencha:
   - **Descrição**
   - **Valor**
   - **Data de vencimento**
   - **Cliente**
   - **Processo** (opcional)
   - **Forma de pagamento**

### Controle de Recebimentos
- **Pendente**: Aguardando pagamento
- **Pago**: Valor recebido
- **Vencido**: Prazo ultrapassado
- **Cancelado**: Lançamento cancelado

### Relatórios Financeiros
- **Receitas x Despesas**: Comparativo mensal
- **Inadimplência**: Clientes em atraso
- **Fluxo de caixa**: Previsão de entradas e saídas

## 📰 Módulo de Publicações

### Monitoramento Automático
O sistema monitora automaticamente:
- **DJE-BA**: Diário de Justiça Eletrônico da Bahia
- **DOU**: Diário Oficial da União
- **DJE-TRT**: Diários trabalhistas
- **DJE-TRF**: Diários federais

### Tipos de Publicação
- **Intimação**: Comunicação oficial para cumprimento
- **Citação**: Chamamento para resposta
- **Publicação**: Divulgação de atos processuais
- **Edital**: Comunicação por edital
- **Despacho**: Decisões judiciais

### Controle de Ciência
1. Publicações aparecem como "Não lidas"
2. Clique em "Dar Ciência" após ler
3. Sistema registra data e responsável
4. Histórico completo para auditoria

### Alertas e Prazos
- **Notificações em tempo real** para novas publicações
- **Cálculo automático** de prazos
- **Alertas de vencimento** por e-mail
- **Dashboard** com publicações pendentes

## 📊 Módulo de Relatórios

### Tipos de Relatório

#### Visão Geral
- Métricas principais do escritório
- Gráficos de processos por status
- Evolução mensal de atividades

#### Produtividade
- Performance por advogado
- Processos por responsável
- Tarefas concluídas vs pendentes

#### Financeiro
- Receitas vs despesas
- Inadimplência por cliente
- Projeções de recebimento

#### Processos
- Distribuição por comarca
- Processos por matéria
- Tempo médio de tramitação

### Exportando Relatórios
1. Selecione o tipo de relatório
2. Defina o período
3. Aplique filtros necessários
4. Clique em "Exportar PDF"
5. Arquivo será baixado automaticamente

### Agendamento (Futuro)
- Relatórios automáticos por e-mail
- Frequência configurável
- Destinatários personalizados

## 🔗 Módulo de Integrações

### Buscando Processos
1. Acesse "Integrações" no menu lateral
2. Aba "Busca de Processos"
3. Selecione a integração:
   - **DataJud CNJ**: Base nacional pública
   - **TJ-BA Transparência**: Dados públicos da Bahia
   - **PJe SOAP**: Processos eletrônicos oficiais

### Parâmetros de Busca
- **Número do processo**: Formato CNJ completo
- **OAB**: Número da carteira (ex: BA 12345)
- **CPF/CNPJ**: Documento da parte

### Importando Dados
1. Após a busca, analise os resultados
2. Clique em "Importar" no processo desejado
3. Sistema criará automaticamente:
   - Cadastro do processo
   - Vinculação com cliente (se existir)
   - Histórico de andamentos
   - Documentos disponíveis

### Dashboard de Transparência
- **Indicadores do TJ-BA**: Performance do tribunal
- **Metas do CNJ**: Cumprimento de objetivos
- **Estatísticas públicas**: Dados para análise

## 🔧 Dicas de Uso

### Navegação Rápida
- Use **Ctrl+K** para busca global (futuro)
- Favoritos na barra lateral
- Histórico de páginas visitadas

### Filtros Inteligentes
- Combine múltiplos filtros
- Salve filtros frequentes
- Use busca por texto em qualquer campo

### Produtividade
- Configure notificações por e-mail
- Use tags para organizar documentos
- Crie templates de tarefas recorrentes

### Segurança
- Faça logout ao sair
- Não compartilhe credenciais
- Reporte problemas imediatamente

## ❓ Perguntas Frequentes

### Como alterar minha senha?
1. Clique no seu nome no canto superior direito
2. Selecione "Perfil"
3. Clique em "Alterar Senha"
4. Digite a senha atual e a nova senha

### Posso acessar de qualquer lugar?
Sim, o sistema é baseado na web e pode ser acessado de qualquer dispositivo com internet.

### Os dados são seguros?
Sim, utilizamos criptografia SSL e backup automático diário.

### Como reportar um problema?
Entre em contato através do e-mail suporte@legaltech.com.br ou telefone (71) 3333-4444.

### Posso usar no celular?
Sim, o sistema é responsivo e funciona perfeitamente em smartphones e tablets.

## 📞 Suporte

### Canais de Atendimento
- **E-mail**: suporte@legaltech.com.br
- **Telefone**: (71) 3333-4444
- **WhatsApp**: (71) 99999-9999
- **Chat online**: Disponível no sistema

### Horário de Atendimento
- **Segunda a sexta**: 8h às 18h
- **Sábado**: 8h às 12h
- **Emergências**: 24h via WhatsApp

### Recursos de Ajuda
- Tutoriais em vídeo
- Base de conhecimento
- Webinars mensais
- Treinamento personalizado