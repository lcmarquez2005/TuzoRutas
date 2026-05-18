import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUsuario } from '../services/api';

interface AuthContextData {
  token: string | null;
  usuario: any | null;
  loading: boolean;
  signIn(usuario: string, password: string): Promise<void>;
  signOut(): Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStorageData() {
      const storageToken = await AsyncStorage.getItem('@TuzoRutas:token');
      const storageUsuario = await AsyncStorage.getItem('@TuzoRutas:usuario');

      if (storageToken && storageUsuario) {
        setToken(storageToken);
        setUsuario(JSON.parse(storageUsuario));
      }
      setLoading(false);
    }

    loadStorageData();
  }, []);

  async function signIn(usuario: string, password: string) {
    const response = await loginUsuario(usuario, password);

    setToken(response.token);
    setUsuario(response.usuario);

    await AsyncStorage.setItem('@TuzoRutas:token', response.token);
    await AsyncStorage.setItem('@TuzoRutas:usuario', JSON.stringify(response.usuario));
  }

  async function signOut() {
    await AsyncStorage.removeItem('@TuzoRutas:token');
    await AsyncStorage.removeItem('@TuzoRutas:usuario');
    setToken(null);
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ token, usuario, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}
