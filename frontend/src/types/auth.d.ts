declare module '../context/AuthContext' {
  export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'owner' | 'user';
  }

  export interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (userData: any) => Promise<void>;
    logout: () => void;
  }

  export function useAuth(): AuthContextType;
  export function AuthProvider({ children }: { children: React.ReactNode }): JSX.Element;
}

declare module '../../context/AuthContext' {
  export * from '../context/AuthContext';
}
