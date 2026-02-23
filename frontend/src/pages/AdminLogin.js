import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { Lock, Mail, User } from 'lucide-react';
import { motion } from 'framer-motion';

export const AdminLogin = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegister) {
        await register(formData.name, formData.email, formData.password);
        toast.success('Conta criada com sucesso!');
      } else {
        await login(formData.email, formData.password);
        toast.success('Login efetuado com sucesso!');
      }
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao autenticar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-heading font-bold text-white uppercase mb-2">
              {isRegister ? 'Criar Conta' : 'Admin Login'}
            </h1>
            <p className="text-[#94a3b8] text-sm">Sistema de Gestão de Restaurante</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <Label htmlFor="name" className="text-[#f8fafc] mb-2 block">Nome</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-5 w-5 text-[#64748b]" />
                  <Input
                    id="name"
                    data-testid="register-name-input"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-12 pl-10 bg-[#0f172a] border-[#334155] text-white"
                    placeholder="Seu nome"
                  />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-[#f8fafc] mb-2 block">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-[#64748b]" />
                <Input
                  id="email"
                  data-testid="login-email-input"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-12 pl-10 bg-[#0f172a] border-[#334155] text-white"
                  placeholder="admin@restaurante.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-[#f8fafc] mb-2 block">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-[#64748b]" />
                <Input
                  id="password"
                  data-testid="login-password-input"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="h-12 pl-10 bg-[#0f172a] border-[#334155] text-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button
              data-testid="login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white h-12 text-lg font-medium shadow-[0_4px_14px_0_rgba(59,130,246,0.39)]"
            >
              {loading ? 'A processar...' : isRegister ? 'Criar Conta' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              data-testid="toggle-register-btn"
              onClick={() => setIsRegister(!isRegister)}
              className="text-[#3b82f6] hover:text-[#2563eb] text-sm transition-colors"
            >
              {isRegister ? 'Já tem conta? Faça login' : 'Primeira vez? Crie uma conta'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};