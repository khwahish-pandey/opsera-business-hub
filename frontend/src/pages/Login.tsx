import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Lock, Mail, Building2, ShieldCheck } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password', 'error');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      showToast('Login successful! Welcome to OPSERA.', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      showToast(err.message || 'Login failed. Please check credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Graphic Accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-sky-400 text-white font-black text-3xl shadow-xl shadow-sky-500/30 mb-4">
          N
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">OPSERA</h2>
        <p className="mt-1 text-sm text-slate-400 font-medium">
          operations-focused & Customer Management Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="admin@nexora.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-4 h-4" />}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-4 h-4" />}
                required
              />
            </div>

            <Button type="submit" variant="primary" className="w-full py-3" isLoading={loading}>
              Sign In to Portal
            </Button>
          </form>

          {/* Demo Persona Quick Fill */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">
              One-Click Demo Personas
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@nexora.com', 'Admin@123')}
                className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-left border border-slate-700/60 transition-all text-xs"
              >
                <span className="font-bold text-purple-400 block">ADMIN</span>
                <span className="text-[11px] text-slate-400">admin@nexora.com</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('sales@nexora.com', 'Sales@123')}
                className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-left border border-slate-700/60 transition-all text-xs"
              >
                <span className="font-bold text-sky-400 block">SALES</span>
                <span className="text-[11px] text-slate-400">sales@nexora.com</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('warehouse@nexora.com', 'Warehouse@123')}
                className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-left border border-slate-700/60 transition-all text-xs"
              >
                <span className="font-bold text-amber-400 block">WAREHOUSE</span>
                <span className="text-[11px] text-slate-400">warehouse@nexora.com</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('accounts@nexora.com', 'Accounts@123')}
                className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-left border border-slate-700/60 transition-all text-xs"
              >
                <span className="font-bold text-emerald-400 block">ACCOUNTS</span>
                <span className="text-[11px] text-slate-400">accounts@nexora.com</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
