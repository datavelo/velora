import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  provider: 'google' | 'password';
  isAdmin: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  signInWithGoogle: (customEmail?: string, customName?: string) => Promise<AuthUser>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'velora_user_session';
const ADMIN_EMAILS = [
  'chathusandeepani195@gmail.com',
  'admin@velora.lk',
  'admin@velora.com',
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load user session', e);
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        if (user.isAdmin) {
          sessionStorage.setItem('velora_admin_session', 'authenticated');
        }
      } catch (e) {
        console.error('Failed to save session', e);
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const signInWithGoogle = async (
    customEmail?: string,
    customName?: string
  ): Promise<AuthUser> => {
    setIsLoading(true);

    return new Promise((resolve) => {
      setTimeout(() => {
        const targetEmail = customEmail || 'chathusandeepani195@gmail.com';
        const targetName =
          customName ||
          (targetEmail.includes('chathu')
            ? 'Chathu Sandeepani'
            : targetEmail.split('@')[0].replace('.', ' ').toUpperCase());

        const isAdmin =
          ADMIN_EMAILS.includes(targetEmail.toLowerCase()) ||
          targetEmail.toLowerCase().includes('admin') ||
          targetEmail.toLowerCase().includes('chathu');

        const newUser: AuthUser = {
          id: `goog_${Date.now()}`,
          email: targetEmail,
          displayName: targetName,
          photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
            targetName
          )}&backgroundColor=0a0a0a&textColor=d4af37`,
          provider: 'google',
          isAdmin,
        };

        setUser(newUser);
        if (isAdmin) {
          sessionStorage.setItem('velora_admin_session', 'authenticated');
        }
        setIsLoading(false);
        setIsAuthModalOpen(false);
        resolve(newUser);
      }, 500);
    });
  };

  const signOut = () => {
    setUser(null);
    sessionStorage.removeItem('velora_admin_session');
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: !!user?.isAdmin,
        isLoading,
        isAuthModalOpen,
        setIsAuthModalOpen,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
