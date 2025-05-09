"use client"

import { useState, useEffect } from "react"
import { Bell, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"

export interface Notificacao {
  id: string
  titulo: string
  mensagem: string
  data: string
  lida: boolean
  tipo: "info" | "warning" | "success" | "error"
}

// Função para obter notificações do localStorage
const getNotificacoes = (): Notificacao[] => {
  if (typeof window === "undefined") return []
  const notificacoes = localStorage.getItem("educa_dashboard_notificacoes")
  return notificacoes ? JSON.parse(notificacoes) : []
}

// Função para salvar notificações no localStorage
const saveNotificacoes = (notificacoes: Notificacao[]) => {
  localStorage.setItem("educa_dashboard_notificacoes", JSON.stringify(notificacoes))
}

// Função para adicionar uma nova notificação
export const adicionarNotificacao = (notificacao: Omit<Notificacao, "id" | "data" | "lida">) => {
  const notificacoes = getNotificacoes()
  const novaNotificacao: Notificacao = {
    id: Date.now().toString(),
    data: new Date().toISOString(),
    lida: false,
    ...notificacao,
  }
  saveNotificacoes([novaNotificacao, ...notificacoes])

  // Mostrar notificação no navegador se permitido
  if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
    new Notification(notificacao.titulo, {
      body: notificacao.mensagem,
    })
  }

  return novaNotificacao
}

export function Notificacoes() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Carregar notificações
    setNotificacoes(getNotificacoes())

    // Solicitar permissão para notificações do navegador
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission !== "granted" &&
      Notification.permission !== "denied"
    ) {
      Notification.requestPermission()
    }

    // Atualizar notificações a cada 30 segundos
    const interval = setInterval(() => {
      setNotificacoes(getNotificacoes())
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const marcarComoLida = (id: string) => {
    const novasNotificacoes = notificacoes.map((notificacao) =>
      notificacao.id === id ? { ...notificacao, lida: true } : notificacao,
    )
    setNotificacoes(novasNotificacoes)
    saveNotificacoes(novasNotificacoes)
  }

  const marcarTodasComoLidas = () => {
    const novasNotificacoes = notificacoes.map((notificacao) => ({ ...notificacao, lida: true }))
    setNotificacoes(novasNotificacoes)
    saveNotificacoes(novasNotificacoes)
    toast({
      title: "Notificações atualizadas",
      description: "Todas as notificações foram marcadas como lidas",
    })
  }

  const excluirNotificacao = (id: string) => {
    const novasNotificacoes = notificacoes.filter((notificacao) => notificacao.id !== id)
    setNotificacoes(novasNotificacoes)
    saveNotificacoes(novasNotificacoes)
  }

  const limparTodasNotificacoes = () => {
    setNotificacoes([])
    saveNotificacoes([])
    toast({
      title: "Notificações limpas",
      description: "Todas as notificações foram removidas",
    })
  }

  // Contar notificações não lidas
  const naoLidas = notificacoes.filter((n) => !n.lida).length

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notificações">
          <Bell className="h-5 w-5" />
          {naoLidas > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-white">
              {naoLidas}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Notificações</SheetTitle>
          <SheetDescription>
            {notificacoes.length === 0
              ? "Você não tem notificações."
              : `Você tem ${notificacoes.length} notificações (${naoLidas} não lidas).`}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 flex justify-between">
          <Button variant="outline" size="sm" onClick={marcarTodasComoLidas} disabled={notificacoes.length === 0}>
            Marcar todas como lidas
          </Button>
          <Button variant="outline" size="sm" onClick={limparTodasNotificacoes} disabled={notificacoes.length === 0}>
            Limpar todas
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-10rem)] mt-4 pr-4">
          <div className="space-y-4">
            {notificacoes.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-sm text-slate-500">
                Nenhuma notificação para exibir
              </div>
            ) : (
              notificacoes.map((notificacao) => (
                <div
                  key={notificacao.id}
                  className={`relative rounded-lg border p-4 ${
                    !notificacao.lida ? "bg-slate-50 border-l-4 border-l-primary" : ""
                  }`}
                  onClick={() => !notificacao.lida && marcarComoLida(notificacao.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-medium">{notificacao.titulo}</h4>
                      <p className="text-sm text-slate-500 mt-1">{notificacao.mensagem}</p>
                      <p className="text-xs text-slate-400 mt-2">{new Date(notificacao.data).toLocaleString()}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {!notificacao.lida && (
                        <Badge variant="outline" className="bg-primary/10 text-primary text-xs">
                          Nova
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation()
                          excluirNotificacao(notificacao.id)
                        }}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remover</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
