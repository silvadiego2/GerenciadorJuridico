# Guia do Administrador - Sistema Jurídico

## 🔐 Acesso Administrativo

### Login Inicial
- **Email**: `admin@escritorio.com`
- **Senha**: `demo123`

### Primeiro Acesso
1. Faça login com as credenciais padrão
2. Acesse "Configurações" → "Geral"
3. Atualize informações do escritório
4. Configure integrações necessárias
5. Crie usuários para a equipe

## 👥 Gestão de Usuários

### Criando Usuários
1. Acesse "Usuários" no menu lateral
2. Clique em "Novo Usuário"
3. Preencha os dados obrigatórios:
   - Nome completo
   - E-mail único
   - Perfil (Admin, Advogado, Estagiário, Cliente)
   - OAB (obrigatória para advogados)
   - Telefone (opcional)

### Perfis de Usuário

#### 🛡️ Administrador
- **Acesso total** ao sistema
- Gestão de usuários e configurações
- Relatórios completos
- Configuração de integrações
- Auditoria e logs

#### ⚖️ Advogado
- Gestão completa de clientes e processos
- Acesso ao módulo financeiro
- Criação de tarefas e documentos
- Relatórios de produtividade
- Portal de publicações

#### 📚 Estagiário
- Cadastro e edição de clientes
- Acompanhamento de processos
- Gestão de tarefas
- Upload de documentos
- **Sem acesso** ao financeiro

#### 👤 Cliente
- Acesso apenas aos próprios processos
- Visualização de documentos
- Histórico de atendimentos
- **Acesso restrito** via portal

### Editando Usuários
1. Na lista de usuários, clique no ícone de edição
2. Modifique os dados necessários
3. Salve as alterações
4. O usuário será notificado por e-mail (futuro)

### Desativando Usuários
1. Clique no ícone de exclusão
2. Confirme a ação
3. O usuário será desativado (não excluído)
4. Dados históricos são preservados

## 🔗 Configuração de Integrações

### API DataJud CNJ
1. Acesse "Integrações" → "Configurações"
2. Seção "DataJud CNJ"
3. Insira sua API Key obtida em [datajud-wiki.cnj.jus.br](https://datajud-wiki.cnj.jus.br)
4. Teste a conexão
5. Salve as configurações

**Obtenção da API Key:**
1. Acesse o portal DataJud
2. Faça cadastro institucional
3. Solicite chave de API
4. Aguarde aprovação (24-48h)

### PJe SOAP
1. Acesse "Integrações" → "Configurações"
2. Seção "PJe SOAP"
3. Configure:
   - Usuário do sistema PJe
   - Senha do sistema PJe
   - Upload do certificado digital (.pfx)
   - Senha do certificado

**Requisitos:**
- Certificado digital A1 ou A3 válido
- Credenciais fornecidas pelo tribunal
- Acesso liberado para web services

### API Transparência TJ-BA
- **Configuração automática** (API pública)
- Sem necessidade de credenciais
- Dados atualizados automaticamente

## ⚙️ Configurações do Sistema

### Informações do Escritório
```
Configurações → Geral
```
- Nome do escritório
- CNPJ
- OAB principal
- Endereço completo
- Telefone e e-mail
- Website

### Notificações
```
Configurações → Notificações
```
- E-mail: Ativar/desativar notificações por e-mail
- SMS: Configurar notificações por SMS (futuro)
- Push: Notificações no navegador
- Tipos: Processos, tarefas, publicações, financeiro

### Segurança
```
Configurações → Segurança
```
- **Timeout de sessão**: 30 minutos (padrão)
- **Expiração de senha**: 90 dias
- **Autenticação 2FA**: Ativar para admins
- **Log de auditoria**: Registrar todas as ações
- **Restrição por IP**: Limitar acesso por localização

### Integrações Externas
```
Configurações → Integrações
```
- **TJ-BA**: Status da conexão
- **PJe**: Configuração de tribunais
- **DataJud**: Gerenciamento de API Keys
- **DJE**: Monitoramento automático (futuro)

## 📊 Monitoramento e Auditoria

### Dashboard Administrativo
- Total de usuários ativos
- Processos cadastrados por período
- Uso das integrações
- Erros e alertas do sistema

### Logs de Auditoria
```
Configurações → Auditoria
```
- Login/logout de usuários
- Alterações em dados críticos
- Acessos a informações sensíveis
- Tentativas de acesso negado

### Relatórios de Sistema
- Uso por usuário
- Performance das integrações
- Estatísticas de acesso
- Relatórios de erro

## 🛠️ Manutenção

### Backup de Dados
1. **Automático**: Backup diário às 02:00
2. **Manual**: Configurações → Backup → "Gerar Backup"
3. **Restauração**: Contatar suporte técnico

### Atualizações do Sistema
- Notificações automáticas de novas versões
- Changelog detalhado
- Backup automático antes da atualização
- Rollback em caso de problemas

### Limpeza de Dados
```
Configurações → Manutenção
```
- Logs antigos (> 1 ano)
- Sessões expiradas
- Cache de integrações
- Arquivos temporários

## 🚨 Solução de Problemas

### Problemas Comuns

#### Usuário não consegue fazer login
1. Verificar se o usuário está ativo
2. Confirmar e-mail correto
3. Resetar senha se necessário
4. Verificar logs de auditoria

#### Integração não funciona
1. Verificar status da API externa
2. Confirmar credenciais válidas
3. Testar conectividade
4. Consultar logs de erro

#### Performance lenta
1. Verificar conexão com internet
2. Limpar cache do navegador
3. Verificar uso de memória
4. Contatar suporte se persistir

### Contato de Suporte
- **E-mail**: suporte@legaltech.com.br
- **Telefone**: (71) 3333-4444
- **WhatsApp**: (71) 99999-9999
- **Horário**: Segunda a sexta, 8h às 18h

## 📋 Checklist de Configuração Inicial

### ✅ Configuração Básica
- [ ] Alterar senha padrão do admin
- [ ] Configurar informações do escritório
- [ ] Criar usuários da equipe
- [ ] Definir permissões por perfil
- [ ] Testar login de todos os usuários

### ✅ Integrações
- [ ] Obter API Key do DataJud
- [ ] Configurar certificado PJe (se aplicável)
- [ ] Testar busca de processos
- [ ] Verificar captura de publicações
- [ ] Configurar notificações

### ✅ Segurança
- [ ] Ativar 2FA para admins
- [ ] Configurar timeout de sessão
- [ ] Ativar logs de auditoria
- [ ] Definir política de senhas
- [ ] Configurar backup automático

### ✅ Personalização
- [ ] Configurar notificações por e-mail
- [ ] Personalizar dashboard
- [ ] Configurar relatórios automáticos
- [ ] Definir fluxos de trabalho
- [ ] Treinar equipe no sistema

## 📚 Recursos Adicionais

### Documentação Técnica
- Manual do desenvolvedor
- API de integrações
- Guia de troubleshooting
- Changelog de versões

### Treinamento
- Vídeos tutoriais
- Webinars mensais
- Suporte por chat
- Consultoria especializada

### Comunidade
- Fórum de usuários
- Grupo no WhatsApp
- Newsletter mensal
- Eventos e workshops