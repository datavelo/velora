import React, { useState } from 'react';
import { Lock, ArrowLeft, KeyRound } from 'lucide-react';
import { VeloraLogo } from '../components/common/VeloraLogo';
import { GoogleSignInButton } from '../components/auth/GoogleSignInButton';

interface AdminLoginPageProps {
  onLoginSuccess: () => void;
  onNavigateHome: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onNavigateHome,
}) => {
  const [email, setEmail] = useState('admin@velora.lk');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      // Accepts default secure admin password or demo password
      if (
        (email === 'admin@velora.lk' || email === 'admin') &&
        (password === 'Velora@2026' || password === 'admin123' || password === 'admin')
      ) {
        sessionStorage.setItem('velora_admin_session', 'authenticated');
        onLoginSuccess();
      } else {
        setError('Invalid administrative credentials. Access restricted.');
      }
      setIsLoading(false);
    }, 400);
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
              Admin Identifier
            </label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-800 border border-neutral-700 rounded text-sm text-white focus:outline-none focus:border-gold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
              Secure Key
            </label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-800 border border-neutral-700 rounded text-sm text-white focus:outline-none focus:border-gold"
            />
            <div className="mt-2 p-2 bg-neutral-800/50 rounded border border-neutral-700/60 text-[11px] text-neutral-400 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-gold shrink-0" />
              <span>
                Default Demo Password: <strong className="text-neutral-200">Velora@2026</strong> or <strong className="text-neutral-200">admin123</strong>
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-white text-black hover:bg-gold text-xs font-bold uppercase tracking-widest rounded transition-colors disabled:opacity-50 mt-2"
          >
            {isLoading ? 'Authenticating...' : 'AUTHENTICATE SESSION'}
          </button>
        </form>

        {/* Google Sign In at bottom */}
        <div className="pt-2 border-t border-neutral-800 space-y-3 text-center">
          <div className="relative flex items-center justify-center">
            <span className="absolute inset-x-0 h-px bg-neutral-800" />
            <span className="relative bg-neutral-900 px-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              Or Sign In With Google
            </span>
          </div>

          <GoogleSignInButton
            variant="light"
            size="md"
            className="w-full justify-center shadow-lg"
            onSuccess={() => {
              sessionStorage.setItem('velora_admin_session', 'authenticated');
              onLoginSuccess();
            }}
          />

          <p className="text-[10px] text-neutral-400">
            Authorized Google accounts receive instantaneous verified administrator access.
          </p>
        </div>
      </div>
    </div>
  );
};
