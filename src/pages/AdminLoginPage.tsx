import React, { useState } from 'react';
import { Lock, ArrowLeft } from 'lucide-react';
import { VeloraLogo } from '../components/common/VeloraLogo';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AdminLoginPageProps {
  onLoginSuccess: () => void;
  onNavigateHome: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onNavigateHome,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isSupabaseConfigured || !supabase) {
      setError('Admin authentication is not configured. Set the Supabase environment variables first.');
      return;
    }

    setIsLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) throw new Error('Invalid administrative credentials.');

      const { data: isAdmin, error: roleError } = await supabase.rpc('is_admin');
      if (roleError || !isAdmin) {
        await supabase.auth.signOut();
        throw new Error('This account is not authorized for the admin portal.');
      }

      onLoginSuccess();
    } catch (err: any) {
      setError(err?.message || 'Unable to authenticate the admin account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-lg p-8 shadow-2xl space-y-6">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Public Store</span>
        </button>

        <div className="text-center space-y-3">
          <VeloraLogo variant="brand" theme="dark" height={54} />
          <div className="pt-1">
            <h1 className="font-heading text-lg font-bold tracking-widest text-white uppercase flex items-center justify-center gap-2">
              <Lock className="w-4 h-4 text-gold" />
              <span>CONTROL SUITE ACCESS</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Administrative portal for inventory, orders, and invoice dispatch.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-950/60 border border-red-800/80 rounded text-xs text-red-200 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
              Username / Admin Email
            </label>
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-800 border border-neutral-700 rounded text-sm text-white focus:outline-none focus:border-gold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-800 border border-neutral-700 rounded text-sm text-white focus:outline-none focus:border-gold"
            />
          </div>

          <p className="text-[11px] leading-relaxed text-neutral-500">
            Enter the administrator account credentials configured in Supabase.
          </p>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-white text-black hover:bg-gold text-xs font-bold uppercase tracking-widest rounded transition-colors disabled:opacity-50 mt-2"
          >
            {isLoading ? 'Authenticating...' : 'AUTHENTICATE SESSION'}
          </button>
        </form>
      </div>
    </div>
  );
};
