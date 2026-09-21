import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle2, LogOut, ShieldCheck, User } from 'lucide-react';

interface GoogleSignInButtonProps {
  variant?: 'light' | 'dark' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onSuccess?: () => void;
  showUserInfoIfSignedIn?: boolean;
}

export const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" width="100%" height="100%">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12c0 2.03.45 3.84 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  variant = 'light',
  size = 'md',
  className = '',
  onSuccess,
  showUserInfoIfSignedIn = true,
}) => {
  const { user, isAuthenticated, isLoading, signInWithGoogle, signOut, setIsAuthModalOpen } = useAuth();

  const handleSignIn = async () => {
    setIsAuthModalOpen(true);
    // Alternatively direct fast login if modal isn't clicked
    try {
      const u = await signInWithGoogle();
      if (u && onSuccess) {
        onSuccess();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (isAuthenticated && user && showUserInfoIfSignedIn) {
    return (
      <div
        className={`inline-flex items-center justify-between gap-3 px-3 py-2 rounded-lg border transition-all ${
          variant === 'dark'
            ? 'bg-neutral-900 border-neutral-700 text-white'
            : 'bg-white border-neutral-300 text-neutral-900 shadow-xs'
        } ${className}`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-7 h-7 rounded-full object-cover border border-gold/40"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-neutral-800 text-gold flex items-center justify-center text-xs font-bold">
                {user.displayName.charAt(0)}
              </div>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-neutral-900 rounded-full" />
          </div>
          <div className="text-left truncate">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold truncate">{user.displayName}</span>
              {user.isAdmin && (
                <span className="bg-gold/20 text-gold border border-gold/40 text-[9px] font-black uppercase px-1 py-0.2 rounded">
                  Admin
                </span>
              )}
            </div>
            <span className="text-[10px] text-neutral-400 block truncate">{user.email}</span>
          </div>
        </div>

        <button
          onClick={signOut}
          type="button"
          title="Sign out of Google"
          className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  const sizeClasses = {
    sm: 'py-1.5 px-3 text-xs gap-2',
    md: 'py-2.5 px-4 text-xs sm:text-sm gap-2.5',
    lg: 'py-3 px-5 text-sm font-semibold gap-3',
  }[size];

  const variantClasses = {
    light:
      'bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 hover:border-neutral-400 shadow-xs',
    dark:
      'bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 hover:border-neutral-500 shadow-md',
    minimal:
      'bg-transparent hover:bg-neutral-100 text-neutral-700 border border-neutral-200',
  }[variant];

  return (
    <button
      type="button"
      onClick={handleSignIn}
      disabled={isLoading}
      className={`inline-flex items-center justify-center font-medium rounded-lg transition-all active:scale-[0.99] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${sizeClasses} ${variantClasses} ${className}`}
    >
      <GoogleIcon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      <span>{isLoading ? 'Connecting to Google...' : 'Sign in with Google'}</span>
    </button>
  );
};
