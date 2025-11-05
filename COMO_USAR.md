# Como Usar - LegalTech

## 🚀 Iniciar o Sistema

### Terminal 1 - Backend
```bash
cd backend
npm install
npm start
```
Verá: "🚀 Backend LegalTech rodando em http://localhost:3001"

### Terminal 2 - Frontend
```bash
npm install
npm run dev
```
Verá: "VITE v5.4.8 ready in XXX ms" e acesse http://localhost:5173

---

## 🔐 Login com Contas Demo

Na tela de login, você verá **dois botões no topo**:
- **Login** (selecionado por padrão)
- **Criar Conta** (para registrar novos usuários)

### Opção 1: Clique Rápido
Abaixo do formulário, você encontrará os **botões de contas demo**:

**Clique em qualquer conta de demo** para preencher automaticamente:

| Conta | Email | Papel |
|-------|-------|-------|
| **Administrador** | admin@escritorio.com | Acesso total |
| **Advogado** | joao@escritorio.com | Gestão completa |
| **Estagiário** | maria@escritorio.com | Acesso limitado |
| **Cliente** | cliente@teste.com | Apenas seus dados |

Todos usam senha: **demo123**

### Opção 2: Digite Manualmente
1. Email: `joao@escritorio.com`
2. Senha: `demo123`
3. Clique em **Entrar**

---

## 👤 Criar Nova Conta

1. Na tela de login, clique no botão **"Criar Conta"** (topo direito)
2. Preencha os campos:
   - **Nome Completo**: Seu nome
   - **E-mail**: Seu email
   - **Senha**: Uma senha segura
   - **Perfil**: Escolha entre:
     - Estagiário (sem acesso financeiro)
     - Advogado (acesso completo)
     - Administrador (gerencia usuários)
     - Cliente (apenas seus processos)

3. Se escolher **Advogado ou Admin**, aparecerá:
   - **OAB** (opcional): Ex: BA 12345
   - **Telefone** (opcional): Ex: (71) 99999-9999

4. Clique em **"Criar Conta"**
5. Se sucesso, verá: "Conta criada com sucesso! Faça login para continuar."
6. Volte para **Login** e entre com suas credenciais

---

## ✨ Funcionalidades Principais

Após fazer login, você terá acesso a:

### 📊 Dashboard
- Métricas principais
- Gráficos de processos
- Atividades recentes

### 👥 Clientes
- Ver lista de clientes
- Criar novo cliente
- Editar informações
- Vincular com processos

### ⚖️ Processos
- Acompanhar processos judiciais
- Adicionar movimentações
- Vincular documentos
- Relacionar com tarefas

### ✅ Tarefas
- Gerenciar prazos
- Atribuir responsáveis
- Definir prioridades
- Marcar como concluídas

### 📄 Documentos
- Upload de arquivos
- Organizar por pasta
- Compartilhar
- Versionar

### 💰 Financeiro
- Controlar honorários
- Registrar despesas
- Acompanhar pagamentos
- Gerar relatórios

### 📢 Publicações
- Monitorar DJE/DOU
- Marcar como lidas
- Alertas de publicações
- Histórico de documentos

### 📈 Relatórios
- Visão geral do escritório
- Análise de processos
- Relatórios financeiros
- Produtividade por usuário
- Exportar em PDF

### 👨‍💼 Usuários (Admin)
- Gerenciar usuários do sistema
- Alterar permissões
- Desativar contas

---

## 🛑 Problemas Comuns

### "Credenciais inválidas"
- Verifique se digitou certo: `joao@escritorio.com`
- Senha é: `demo123`
- Tente clique rápido em uma conta demo

### Backend não inicia
- Verifique se porta 3001 está livre
- Instale dependências: `cd backend && npm install`
- Verifique arquivo `.env` existe

### Frontend não conecta ao backend
- Verifique se backend está rodando na porta 3001
- Verifique variável: `VITE_BACKEND_URL=http://localhost:3001`
- Abra console (F12) para ver erros

### "Usuário já existe com este email"
- O email já foi registrado
- Tente com outro email

### Erro ao criar conta
- Preencha todos os campos obrigatórios (nome, email, senha)
- Use um email único
- Senha deve ter pelo menos 6 caracteres

---

## 📝 Dados de Teste

O sistema vem com dados de demonstração:

- **3 Clientes** (pessoas físicas e jurídicas)
- **3 Processos** (com valores e status)
- **3 Tarefas** (diferentes prioridades)
- **3 Lançamentos Financeiros** (honorários e despesas)

Todos estão vinculados e prontos para exploração.

---

## 🔄 Logout

No canto superior direito, clique no seu **nome/avatar** e selecione **"Logout"**.

---

## 📚 Documentação Adicional

- `CREDENCIAIS.md` - Mais detalhes sobre contas
- `GUIA_COMPLETO.md` - Documentação técnica completa
- `CHECKLIST_TESTE.md` - Lista de verificação de funcionalidades

---

## 💡 Dicas Rápidas

1. **Clique rápido em contas demo** é a forma mais fácil de testar
2. **Use diferentes perfis** para ver funcionalidades diferentes
3. **Explore o Dashboard** para entender a estrutura
4. **Crie seus próprios dados** após entender o sistema
5. **Experimente criar tarefas com diferentes prioridades**

---

## ✅ Próximo Passo

1. Inicie o backend
2. Inicie o frontend
3. Na tela de login, **clique em "Advogado"**
4. Explore o sistema!

Bom uso! 🎉
