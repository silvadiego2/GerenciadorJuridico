import React, { useState } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { Scale, Eye, EyeOff, UserPlus, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';
import { supabase } from '../../lib/supabaseClient';

const LoginForm: React.FC = () => {
  const { login } = useAuthContext();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('estagiario');
  const [oab, setOab] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      if (isRegisterMode) {
        // 1. Cadastra o usuário no Supabase Auth com metadados
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              role,
              oab: oab || null,
              phone: phone || null,
            },
          },
        });

        if (authError) throw authError;

        // 2. Insere o registro correspondente na tabela public.users
        if (authData.user) {
          const { error: dbError } = await supabase.from('users').insert([
            {
              id: authData.user.id,
              name,
              email,
              role,
              oab: oab || null,
              phone: phone || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ]);

          if (dbError) {
            console.warn('Aviso: falha ao espelhar em public.users:', dbError.message);
          }
        }

        setSuccessMessage('Conta criada com sucesso! Faça login para continuar.');
        setIsRegisterMode(false);
        setName('');
        setEmail('');
        setPassword('');
        setOab('');
        setPhone('');
        setRole('estagiario');
      } else {
        // Autentica via AuthContext (Supabase signInWithPassword)
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message || (isRegisterMode ? 'Erro ao criar conta' : 'Credenciais inválidas'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-lg">
            <Scale className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            LegalTech
          </h2>
          <p className="mt-2 text-sm text-blue-200">
            Sistema de Gestão Jurídica Integrada
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-2xl p-8">
          <div className="mb-6 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(false);
                setError('');
                setSuccessMessage('');
              }}
              className={clsx(
                'flex-1 py-2 px-4 rounded-lg font-medium transition-all text-sm',
                !isRegisterMode
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(true);
                setError('');
                setSuccessMessage('');
              }}
              className={clsx(
                'flex-1 py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-sm',
                isRegisterMode
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              <UserPlus className="h-4 w-4" />
              Criar Conta
            </button>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {isRegisterMode && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nome Completo
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Seu nome completo"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Sua senha"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {isRegisterMode && (
              <>
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Perfil
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="estagiario">Estagiário</option>
                    <option value="advogado">Advogado</option>
                    <option value="admin">Administrador</option>
                    <option value="cliente">Cliente</option>
                  </select>
                </div>

                {(role === 'advogado' || role === 'admin') && (
                  <div>
                    <label htmlFor="oab" className="block text-sm font-medium text-gray-700">
                      OAB (opcional)
                    </label>
                    <input
                      id="oab"
                      name="oab"
                      type="text"
                      value={oab}
                      onChange={(e) => setOab(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="BA 12345"
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Telefone (opcional)
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="(71) 99999-9999"
                  />
                </div>
              </>
            )}

            {successMessage && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={clsx(
                'w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors',
                loading && 'opacity-60 cursor-not-allowed'
              )}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isRegisterMode ? (
                'Criar Conta'
              ) : (
                'Entrar'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
