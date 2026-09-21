import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import type { User, AuthState, LoginCredentials, SignupCredentials } from '../types/auth';

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
    const role = localStorage.getItem('user_role') as 'citizen' | 'staff' | 'admin' | null;
    
    if (token) {
      const mockUser: User = {
        id: 'mock-user-id',
        email: 'user@ecocivix.local',
        name: 'User',
        role: role || 'citizen',
        createdAt: new Date().toISOString(),
      };
      
      setAuthState({
        user: mockUser,
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
      // TODO: Integrate with actual auth service
      // For now, simulate successful login
      const mockToken = 'mock-token-' + Date.now();
      const mockRole = 'citizen';
      
      localStorage.setItem('auth_token', mockToken);
      localStorage.setItem('user_role', mockRole);
      
      const mockUser: User = {
        id: 'mock-user-id',
        email: credentials.email,
        name: 'User',
        role: mockRole,
        createdAt: new Date().toISOString(),
      };
      
      setAuthState({
        user: mockUser,
        token: mockToken,
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
      // TODO: Integrate with actual auth service
      // For now, simulate successful signup
      const mockToken = 'mock-token-' + Date.now();
      const mockRole = 'citizen';
      
      localStorage.setItem('auth_token', mockToken);
      localStorage.setItem('user_role', mockRole);
      
      const mockUser: User = {
        id: 'mock-user-id',
        email: credentials.email,
        name: credentials.name,
        role: mockRole,
        createdAt: new Date().toISOString(),
      };
      
      setAuthState({
        user: mockUser,
        token: mockToken,
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
      // TODO: Integrate with actual auth service
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_role');
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
