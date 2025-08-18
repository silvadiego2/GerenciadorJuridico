const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

// Inicializar cliente Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Função para gerar JWT
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email e senha são obrigatórios'
      });
    }

    // Buscar usuário no banco
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !user) {
      return res.status(401).json({
        error: 'Credenciais inválidas'
      });
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Credenciais inválidas'
      });
    }

    // Gerar token JWT
    const token = generateToken(user);

    // Remover senha do objeto de resposta
    const { password_hash, ...userWithoutPassword } = user;

    // Atualizar último login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    res.json({
      user: {
        id: userWithoutPassword.id,
        name: userWithoutPassword.name,
        email: userWithoutPassword.email,
        role: userWithoutPassword.role,
        oab: userWithoutPassword.oab,
        phone: userWithoutPassword.phone,
        avatar: userWithoutPassword.avatar,
        createdAt: userWithoutPassword.created_at,
        updatedAt: userWithoutPassword.updated_at
      },
      token
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'estagiario', oab, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Nome, email e senha são obrigatórios'
      });
    }

    // Verificar se usuário já existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return res.status(409).json({
        error: 'Usuário já existe com este email'
      });
    }

    // Hash da senha
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Criar usuário
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([
        {
          name,
          email: email.toLowerCase(),
          password_hash: passwordHash,
          role,
          oab,
          phone,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select('*')
      .single();

    if (error) {
      console.error('Erro ao criar usuário:', error);
      return res.status(500).json({
        error: 'Erro ao criar usuário'
      });
    }

    // Gerar token
    const token = generateToken(newUser);

    // Remover senha do objeto de resposta
    const { password_hash, ...userWithoutPassword } = newUser;

    res.status(201).json({
      user: {
        id: userWithoutPassword.id,
        name: userWithoutPassword.name,
        email: userWithoutPassword.email,
        role: userWithoutPassword.role,
        oab: userWithoutPassword.oab,
        phone: userWithoutPassword.phone,
        avatar: userWithoutPassword.avatar,
        createdAt: userWithoutPassword.created_at,
        updatedAt: userWithoutPassword.updated_at
      },
      token
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// POST /api/auth/verify-token
router.post('/verify-token', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'Token é obrigatório'
      });
    }

    // Verificar token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar usuário atualizado no banco
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, oab, phone, avatar, created_at, updated_at')
      .eq('id', decoded.id)
      .single();

    if (error || !user) {
      return res.status(401).json({
        error: 'Token inválido'
      });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        oab: user.oab,
        phone: user.phone,
        avatar: user.avatar,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token inválido ou expirado'
      });
    }

    console.error('Erro na verificação do token:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  // Com JWT, o logout é feito no frontend removendo o token
  // Aqui podemos implementar uma blacklist de tokens se necessário
  res.json({
    message: 'Logout realizado com sucesso'
  });
});

module.exports = router;