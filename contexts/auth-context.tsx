"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Serviço para buscar usuários no banco
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha: string;
  perfil?: string;
}

const getUsuarioByEmail = async (email: string): Promise<Usuario | undefined> => {
  const res = await fetch("/api/usuarios");
  if (!res.ok) throw new Error("Erro ao buscar usuários");
  const usuarios: Usuario[] = await res.json();
  return usuarios.find(u => u.email === email);
};

// Chaves para localStorage
const STORAGE_KEY = "EDUCA_USER";

interface AuthContextType {
  user: Usuario | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  logout: () => {},
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEY);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false); // <-- garante que o efeito no LoginPage rode
  }, []);

  // Login
  const login = async (email: string, password: string) => {
    try {
      const usuario = await getUsuarioByEmail(email);

      if (usuario && usuario.senha === password) {
        setUser(usuario);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(usuario));
        return true;
      }

      return false;
    } catch (error) {
      console.error("Erro no login:", error);
      return false;
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
