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
import { type Turma, deleteTurma, getTurmas, saveTurma, updateTurma } from "@/lib/storage-service"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function TurmasPage() {
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [filteredTurmas, setFilteredTurmas] = useState<Turma[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedTurma, setSelectedTurma] = useState<Turma | null>(null)
  const [formData, setFormData] = useState({
    nome: "",
    serie: "",
    periodo: "Manhã",
    professor: "",
  })
  const { toast } = useToast()

  // Carregar turmas
  useEffect(() => {
    const loadTurmas = () => {
      const turmasData = getTurmas()
      setTurmas(turmasData)
      setFilteredTurmas(turmasData)
    }

    loadTurmas()
  }, [])

  // Filtrar turmas
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredTurmas(turmas)
    } else {
      const filtered = turmas.filter(
        (turma) =>
          turma.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
          turma.serie.toLowerCase().includes(searchQuery.toLowerCase()) ||
          turma.professor.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredTurmas(filtered)
    }
  }, [searchQuery, turmas])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddTurma = () => {
    setSelectedTurma(null)
    setFormData({
      nome: "",
      serie: "",
      periodo: "Manhã",
      professor: "",
    })
    setIsDialogOpen(true)
  }

  const handleEditTurma = (turma: Turma) => {
    setSelectedTurma(turma)
    setFormData({
      nome: turma.nome,
      serie: turma.serie,
      periodo: turma.periodo,
      professor: turma.professor,
    })
    setIsDialogOpen(true)
  }

  const handleDeleteTurma = (turma: Turma) => {
    setSelectedTurma(turma)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (selectedTurma) {
      deleteTurma(selectedTurma.id)
      setTurmas(getTurmas())
      setIsDeleteDialogOpen(false)
      toast({
        title: "Turma excluída",
        description: "A turma foi excluída com sucesso",
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (selectedTurma) {
        // Atualizar turma existente
        updateTurma({
          id: selectedTurma.id,
          ...formData,
        })
        toast({
          title: "Turma atualizada",
          description: "Os dados da turma foram atualizados com sucesso",
        })
      } else {
        // Adicionar nova turma
        saveTurma(formData)
        toast({
          title: "Turma adicionada",
          description: "A nova turma foi adicionada com sucesso",
        })
      }

      setTurmas(getTurmas())
      setIsDialogOpen(false)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar os dados da turma",
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
            <h1 className="text-2xl font-bold text-primary">Gestão de Turmas</h1>
            <p className="text-slate-600">Cadastre e gerencie as turmas da escola</p>
          </div>
          <Button onClick={handleAddTurma}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Turma
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="relative w-full max-w-md mb-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              type="search"
              placeholder="Buscar turmas..."
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
                  <TableHead>Série</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Professor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTurmas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-slate-500">
                      Nenhuma turma encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTurmas.map((turma) => (
                    <TableRow key={turma.id}>
                      <TableCell className="font-medium">{turma.nome}</TableCell>
                      <TableCell>{turma.serie}</TableCell>
                      <TableCell>{turma.periodo}</TableCell>
                      <TableCell>{turma.professor}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditTurma(turma)}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteTurma(turma)}>
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Excluir</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>

      {/* Diálogo para adicionar/editar turma */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{selectedTurma ? "Editar Turma" : "Adicionar Nova Turma"}</DialogTitle>
            <DialogDescription>
              {selectedTurma ? "Edite as informações da turma nos campos abaixo." : "Preencha os dados da nova turma."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="nome">Nome da Turma</Label>
                  <Input id="nome" name="nome" value={formData.nome} onChange={handleInputChange} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="serie">Série</Label>
                  <Input id="serie" name="serie" value={formData.serie} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="periodo">Período</Label>
                  <Select value={formData.periodo} onValueChange={(value) => handleSelectChange("periodo", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Manhã">Manhã</SelectItem>
                      <SelectItem value="Tarde">Tarde</SelectItem>
                      <SelectItem value="Noite">Noite</SelectItem>
                      <SelectItem value="Integral">Integral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="professor">Professor Responsável</Label>
                  <Input
                    id="professor"
                    name="professor"
                    value={formData.professor}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">{selectedTurma ? "Salvar Alterações" : "Adicionar Turma"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmação de exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a turma {selectedTurma?.nome}? Esta ação não pode ser desfeita.
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
