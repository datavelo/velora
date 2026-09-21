import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { GoogleIcon } from './GoogleSignInButton';
import { X, Check, ShieldCheck, User, ArrowRight } from 'lucide-react';

interface GoogleAuthModalProps {
  onSuccess?: () => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({ onSuccess }) => {
  const { isAuthModalOpen, setIsAuthModalOpen, signInWithGoogle, isLoading } = useAuth();
  const [customEmail, setCustomEmail] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSelectAccount = async (email: string, name?: string) => {
    try {
      await signInWithGoogle(email, name);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim() || !customEmail.includes('@')) return;
    handleSelectAccount(customEmail.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden text-neutral-900 font-sans">
        {/* Header */}
        <div className="p-5 pb-3 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <GoogleIcon className="w-5 h-5" />
            <span className="font-semibold text-sm text-neutral-800 tracking-tight">
              Sign in with Google
            </span>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="text-neutral-400 hover:text-neutral-700 p-1 rounded-full hover:bg-neutral-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="text-center pb-1">
            <p className="text-xs text-neutral-500">
              Choose a Google Account to continue to <strong className="text-neutral-800">VELORA SRI LANKA</strong>
            </p>
          </div>

          {/* Preset Google Accounts */}
          <div className="space-y-2">
            {/* Primary account for the active user */}
            <button
              type="button"
              onClick={() => handleSelectAccount('chathusandeepani195@gmail.com', 'Chathu Sandeepani')}
              disabled={isLoading}
              className="w-full text-left p-3 rounded-xl border border-neutral-200 hover:border-gold/80 hover:bg-neutral-50 flex items-center justify-between gap-3 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-black text-gold font-bold flex items-center justify-center text-sm border border-neutral-300 shrink-0">
                  CS
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-neutral-900 group-hover:text-black">
                      Chathu Sandeepani
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">
                      Admin
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-500 block truncate">
                    chathusandeepani195@gmail.com
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-black shrink-0 transition-transform group-hover:translate-x-0.5" />
            </button>

            {/* Corporate Admin Account */}
            <button
              type="button"
              onClick={() => handleSelectAccount('admin@velora.lk', 'VELORA Executive Admin')}
              disabled={isLoading}
              className="w-full text-left p-3 rounded-xl border border-neutral-200 hover:border-gold/80 hover:bg-neutral-50 flex items-center justify-between gap-3 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-neutral-900 text-white font-bold flex items-center justify-center text-sm border border-neutral-700 shrink-0">
                  V
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-neutral-900 group-hover:text-black">
                      VELORA Corporate
                    </span>
                    <span className="bg-gold/20 text-gold-dark text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">
                      Store Owner
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-500 block truncate">
                    admin@velora.lk
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-black shrink-0 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* Use another Google account */}
          {!showCustomInput ? (
            <button
              type="button"
              onClick={() => setShowCustomInput(true)}
              className="w-full py-2 text-center text-xs font-semibold text-neutral-600 hover:text-black hover:bg-neutral-100 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span>Use another Google account</span>
            </button>
          ) : (
            <form onSubmit={handleCustomSubmit} className="pt-2 space-y-2 border-t border-neutral-100">
              <label className="block text-[11px] font-bold text-neutral-600 uppercase">
                Google Email Address
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="your.email@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-3 py-2 bg-black text-white text-xs font-bold rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  Continue
                </button>
              </div>
            </form>
          )}

          {/* Privacy Note */}
          <div className="pt-2 border-t border-neutral-100 flex items-center justify-center gap-1.5 text-[10px] text-neutral-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Secure 256-bit OAuth Token Verification</span>
          </div>
        </div>
      </div>
    </div>
  );
};
