"use client"

import { useRouter } from "next/navigation"
import { ClipboardList, Laptop, Settings, Users, BarChart3, School, LogOut } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { Badge } from "@/components/ui/badge"

export default function SelecaoPage() {
  const router = useRouter()
  const { user, logout } = useAuth()

  const navigateTo = (path: string) => {
    router.push(`/dashboard/${path}`)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header simplificado */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
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
          <Button variant="ghost" size="sm" onClick={logout} className="flex items-center gap-1">
            <LogOut className="h-4 w-4" />
            <span>Sair</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-primary mb-2">Bem-vindo ao Sistema</h2>
            <p className="text-slate-600">Selecione o módulo que deseja acessar</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card
              className="hover:shadow-md transition-shadow cursor-pointer border-t-4 border-t-primary"
              onClick={() => navigateTo("advertencias")}
            >
              <CardHeader className="pb-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <ClipboardList className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Gestão de Advertências</CardTitle>
                <CardDescription>Registre e gerencie advertências dos alunos</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                  <li>Registrar novas advertências</li>
                  <li>Visualizar histórico de alunos</li>
                  <li>Gerar documentos para assinatura</li>
                  <li>Acompanhar situação disciplinar</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Acessar Advertências</Button>
              </CardFooter>
            </Card>

            <Card
              className="hover:shadow-md transition-shadow cursor-pointer border-t-4 border-t-secondary"
              onClick={() => navigateTo("equipamentos")}
            >
              <CardHeader className="pb-3">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-2">
                  <Laptop className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle>Gestão de Equipamentos</CardTitle>
                <CardDescription>Controle de empréstimo e devolução de equipamentos</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                  <li>Registrar empréstimos de tablets e notebooks</li>
                  <li>Controlar devoluções</li>
                  <li>Verificar disponibilidade de equipamentos</li>
                  <li>Histórico de uso por professor</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="secondary">
                  Acessar Equipamentos
                </Button>
              </CardFooter>
            </Card>
          </div>

          {(user?.perfil === "direcao" || user?.perfil === "admin") && (
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigateTo("alunos")}>
                <CardHeader className="pb-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Alunos</CardTitle>
                  <CardDescription className="text-sm">Gerenciar cadastro de alunos</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button className="w-full" variant="outline">
                    Acessar
                  </Button>
                </CardFooter>
              </Card>

              <Card
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigateTo("relatorios")}
              >
                <CardHeader className="pb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                    <BarChart3 className="h-5 w-5 text-secondary" />
                  </div>
                  <CardTitle className="text-lg">Relatórios</CardTitle>
                  <CardDescription className="text-sm">Visualizar estatísticas e relatórios</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button className="w-full" variant="outline">
                    Acessar
                  </Button>
                </CardFooter>
              </Card>

              <Card
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigateTo("configuracoes")}
              >
                <CardHeader className="pb-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                    <Settings className="h-5 w-5 text-slate-600" />
                  </div>
                  <CardTitle className="text-lg">Configurações</CardTitle>
                  <CardDescription className="text-sm">Configurar parâmetros do sistema</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button className="w-full" variant="outline">
                    Acessar
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white border-t py-4 text-center text-sm text-slate-500">
        Educa Dashboard &copy; {new Date().getFullYear()} - Sistema de Gestão Escolar
      </footer>
    </div>
  )
}
