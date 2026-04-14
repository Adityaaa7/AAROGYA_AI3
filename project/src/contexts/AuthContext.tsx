import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';
import axios from 'axios';

// ✅ User and Register Types
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
}

// ✅ Context Setup
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ✅ Hook to use Auth
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// ✅ AuthProvider Component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Load user from localStorage on app load
  useEffect(() => {
    const storedUser = localStorage.getItem('healthcareUser');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // ✅ Login with backend
  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });

      const { token,user } = response.data;

      setUser(user);
      localStorage.setItem('healthcareUser', JSON.stringify(user));
      localStorage.setItem('healthcareToken', token);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Login failed. Please try again.'
      );
    }
  };

  // ✅ Register with backend
  const register = async (userData: RegisterData) => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/register',
        userData
      );

      const { token,user } = response.data;

      setUser(user);
      localStorage.setItem('healthcareUser', JSON.stringify(user));
      localStorage.setItem('healthcareToken', token);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Registration failed. Please try again.'
      );
    }
  };

  // ✅ Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('healthcareUser');
    localStorage.removeItem('token');
  };

  // ✅ Context value
  const value = {
    user,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
