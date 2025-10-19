import { useState } from 'react'
import { supabase } from '../services/supabase'

export function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
        // Buscar usuário diretamente na tabela usersSpulse
        const { data: users, error } = await supabase
        .from('usersSpulse')
        .select('*')
        .eq('email', email.trim())
        .eq('senha', password) // NÃO é seguro para produção!
        .single()

        if (error) {
            setError('Acesso negado. Apenas administradores podem fazer login.')
            return
        }

        if (users) {
        // Verificar se o usuário é admin
        if (!users.admin) {
            setError('Acesso negado. Apenas administradores podem fazer login.')
            return
        }

        setMessage('Login realizado com sucesso!')
        console.log('Usuário logado:', users)
        
        // Chama a função onLogin passada pelo App
        onLogin(users)
        }
    } catch (err) {
        setError('Erro ao fazer login')
    } finally {
        setLoading(false)
    }
    }

  
 return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Spulse Login</h1>
            <p className="text-gray-600">Acesse sua conta</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
            </label>
            <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
            </label>
            <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                required
                disabled={loading}
                minLength={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            </div>

            {/* Messages */}
            {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
            </div>
            )}
            
            {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {message}
            </div>
            )}

            {/* Login Button */}
            <button 
                type="submit" 
                disabled={loading || !email || !password}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed"
                >
                {loading ? (
                    <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Carregando...
                    </div>
                ) : (
                    'Entrar'
                )}
                </button>
            </form>

            {/* Security Warning */}
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                    <div className="flex-shrink-0 text-yellow-400 mt-0.5">
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    </div>
                    <div className="ml-3">
                    <p className="text-sm font-medium text-yellow-800">
                        Acesso restrito a administradores
                    </p>
                    </div>
                </div>
            </div>

        </div>
    </div>
  );
}

export default Login