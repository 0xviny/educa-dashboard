"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { School, LogOut, User } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  // Não renderizar o header na página de seleção
  const isSelectionPage = pathname === "/dashboard/selecao"

  if (isSelectionPage) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/selecao" className="flex items-center gap-2 font-semibold">
            <School className="h-6 w-6 text-primary" />
            <span className="hidden md:inline-block">Educa Dashboard</span>
          </Link>
          {user?.perfil === "direcao" && (
            <Badge variant="secondary" className="ml-2">
              Direção
            </Badge>
          )}
          {user?.perfil === "professor" && (
            <Badge variant="secondary" className="ml-2">
              Professor
            </Badge>
          )}
          {user?.perfil === "admin" && (
            <Badge variant="secondary" className="ml-2">
              Admin
            </Badge>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
                <span className="sr-only">Perfil</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user?.nome || "Usuário"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/configuracoes">
                  <span>Configurações</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header> */}

      <main className="flex-1">{children}</main>

      <footer className="bg-white border-t py-4 text-center text-sm text-slate-500">
        Educa Dashboard &copy; {new Date().getFullYear()} - Sistema de Gestão Escolar
      </footer>
    </div>
  )
}
