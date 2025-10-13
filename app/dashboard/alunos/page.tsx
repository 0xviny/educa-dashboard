"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Search, Edit, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Header } from "@/components/header"
import { useToast } from "@/hooks/use-toast"
import {
  type Professor,
  deleteProfessor,
  getProfessores,
  saveProfessor,
  updateProfessor,
} from "@/lib/storage-service"

export default function ProfessoresPage() {
  const [professores, setProfessores] = useState<Professor[]>([])
  const [filteredProfessores, setFilteredProfessores] = useState<Professor[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(null)
  const [formData, setFormData] = useState({
    nome: "",
    escola: "",
    telefone: "",
    email: "",
    dataNascimento: "",
  })
  const { toast } = useToast()

  // Carregar professores
  useEffect(() => {
    const load = () => {
      const data = getProfessores()
      setProfessores(data)
      setFilteredProfessores(data)
    }
    load()
  }, [])

  // Filtrar
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredProfessores(professores)
    } else {
      const q = searchQuery.toLowerCase()
      setFilteredProfessores(
        professores.filter(
          (p) =>
            p.nome.toLowerCase().includes(q) ||
            (p.escola ?? "").toLowerCase().includes(q) ||
            (p.telefone ?? "").toLowerCase().includes(q),
        ),
      )
    }
  }, [searchQuery, professores])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddProfessor = () => {
    setSelectedProfessor(null)
    setFormData({ nome: "", escola: "", telefone: "", email: "", dataNascimento: "" })
    setIsDialogOpen(true)
  }

  const handleEditProfessor = (p: Professor) => {
    setSelectedProfessor(p)
    setFormData({
      nome: p.nome,
      escola: p.escola ?? "",
      telefone: p.telefone ?? "",
      email: (p as any).email ?? "",
      dataNascimento: p.dataNascimento ?? "",
    })
    setIsDialogOpen(true)
  }

  const handleDeleteProfessor = (p: Professor) => {
    setSelectedProfessor(p)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (!selectedProfessor) return

    // remover do storage (atualiza UI imediatamente)
    deleteProfessor(selectedProfessor.id)
    const updated = getProfessores()
    setProfessores(updated)
    setFilteredProfessores((prev) => {
      if (searchQuery.trim() === "") return updated
      const q = searchQuery.toLowerCase()
      return updated.filter(
        (p) =>
          p.nome.toLowerCase().includes(q) ||
          (p.escola ?? "").toLowerCase().includes(q) ||
          (p.telefone ?? "").toLowerCase().includes(q)
      )
    })

    // limpar seleção e fechar diálogo (UI responsiva)
    const deletedId = selectedProfessor.id
    setSelectedProfessor(null)
    setIsDeleteDialogOpen(false)

    toast({
      title: "Professor excluído",
      description: "O professor foi excluído localmente.",
    })

    // Deletar no banco em background. Se falhar, notifica (mantemos remoção local).
    void (async () => {
      try {
        const res = await fetch("/api/usuarios/config", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ professores: [deletedId] }),
        })
        if (!res.ok) {
          console.warn("Falha ao deletar no servidor:", await res.text())
          toast({
            title: "Aviso",
            description: "Não foi possível deletar o professor no servidor.",
            variant: "destructive",
          })
        }
      } catch (err) {
        console.warn("Erro ao chamar DELETE /api/usuarios/config:", err)
        toast({
          title: "Erro de rede",
          description: "Erro ao comunicar o servidor para deletar o professor.",
          variant: "destructive",
        })
      }
    })()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // salvar local (otimista) e fechar diálogo imediatamente para não travar UI
      if (selectedProfessor) {
        updateProfessor({
          id: selectedProfessor.id,
          nome: formData.nome,
          escola: formData.escola,
          telefone: formData.telefone,
          email: formData.email,
          dataNascimento: formData.dataNascimento,
        } as any)
        toast({ title: "Professor atualizado", description: "Dados atualizados com sucesso" })
      } else {
        saveProfessor({
          nome: formData.nome,
          escola: formData.escola,
          telefone: formData.telefone,
          email: formData.email,
          dataNascimento: formData.dataNascimento,
        } as any)
        toast({ title: "Professor adicionado", description: "Professor salvo com sucesso" })
      }

      // atualizar UI local e fechar diálogo imediatamente
      setProfessores(getProfessores())
      setIsDialogOpen(false)

      // Persistir no servidor em background (não bloqueia fechamento do modal)
      const payload = {
        professores: [
          {
            ...(selectedProfessor ? { id: selectedProfessor.id } : {}),
            nome: formData.nome,
            telefone: formData.telefone ?? "",
            escola: formData.escola ?? "",
            email: formData.email ?? undefined,
            dataNascimento: formData.dataNascimento ?? undefined,
          } as any,
        ],
      }

      void (async () => {
        try {
          const res = await fetch("/api/usuarios/config", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
          if (!res.ok) {
            console.warn("Erro ao persistir professor no servidor", await res.text())
            toast({ title: "Atenção", description: "Falha ao persistir no servidor", variant: "destructive" })
          } else {
            toast({ title: "Servidor", description: "Professor persistido no servidor" })
          }
        } catch (err) {
          console.warn("Erro fetch /api/usuarios/config:", err)
          toast({ title: "Erro de rede", description: "Erro ao comunicar servidor", variant: "destructive" })
        }
      })()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar os dados do professor",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-primary">Gestão de Professores</h1>
            <p className="text-slate-600">Cadastre e gerencie os professores da escola</p>
          </div>
          <Button onClick={handleAddProfessor}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Professor
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="relative w-full max-w-md mb-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              type="search"
              placeholder="Buscar professores..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Escola</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Data Nasc.</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfessores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-slate-500">
                      Nenhum professor encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProfessores.map((p) => {
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.nome}</TableCell>
                        <TableCell>{p.escola ?? ""}</TableCell>
                        <TableCell>{p.telefone ?? ""}</TableCell>
                        <TableCell>{p.dataNascimento ?? ""}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditProfessor(p)}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteProfessor(p)}>
                              <Trash className="h-4 w-4" />
                              <span className="sr-only">Excluir</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{selectedProfessor ? "Editar Professor" : "Adicionar Novo Professor"}</DialogTitle>
            <DialogDescription>
              {selectedProfessor ? "Edite as informações do professor nos campos abaixo." : "Preencha os dados do novo professor."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input id="nome" name="nome" value={formData.nome} onChange={handleInputChange} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="escola">Escola</Label>
                  <Input id="escola" name="escola" value={formData.escola} onChange={handleInputChange} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input id="telefone" name="telefone" value={formData.telefone} onChange={handleInputChange} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                  <Input
                    id="dataNascimento"
                    name="dataNascimento"
                    type="date"
                    value={formData.dataNascimento}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">{selectedProfessor ? "Salvar Alterações" : "Adicionar Professor"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o professor {selectedProfessor?.nome}? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
