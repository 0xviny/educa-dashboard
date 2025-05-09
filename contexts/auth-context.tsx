"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getUsuarioAtual, getUsuarioByEmail, logout, setUsuarioAtual, type Usuario } from "@/lib/storage-service"

interface AuthContextType {
  user: Usuario | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  logout: () => {},
  isLoading: true,
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Verificar se o usuário está logado
    const currentUser = getUsuarioAtual()
    setUser(currentUser)
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const usuario = getUsuarioByEmail(email)

    if (usuario && usuario.senha === password) {
      setUsuarioAtual(usuario)
      setUser(usuario)
      return true
    }

    return false
  }

  const handleLogout = () => {
    logout()
    setUser(null)
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ user, login, logout: handleLogout, isLoading }}>{children}</AuthContext.Provider>
  )
}
