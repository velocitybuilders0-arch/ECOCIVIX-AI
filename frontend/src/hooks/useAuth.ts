import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import type { User, AuthState, LoginCredentials, SignupCredentials } from '../types/auth';
import { authService } from '../services/api/auth';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      setAuthState({
        user: null,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      const session = await authService.login(credentials);
      localStorage.setItem('auth_token', session.token);
      setAuthState({
        user: session.user,
        token: session.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const signup = async (credentials: SignupCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      const session = await authService.signup(credentials);
      localStorage.setItem('auth_token', session.token);
      setAuthState({
        user: session.user,
        token: session.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, signup, logout } as AuthContextType}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
