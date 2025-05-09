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
import { type Aluno, deleteAluno, getAlunos, saveAluno, updateAluno } from "@/lib/storage-service"

export default function AlunosPage() {
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [filteredAlunos, setFilteredAlunos] = useState<Aluno[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null)
  const [formData, setFormData] = useState({
    nome: "",
    turma: "",
    matricula: "",
    dataNascimento: "",
    responsavel: "",
    contato: "",
  })
  const { toast } = useToast()

  // Carregar alunos
  useEffect(() => {
    const loadAlunos = () => {
      const alunosData = getAlunos()
      setAlunos(alunosData)
      setFilteredAlunos(alunosData)
    }

    loadAlunos()
  }, [])

  // Filtrar alunos
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredAlunos(alunos)
    } else {
      const filtered = alunos.filter(
        (aluno) =>
          aluno.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
          aluno.turma.toLowerCase().includes(searchQuery.toLowerCase()) ||
          aluno.matricula.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredAlunos(filtered)
    }
  }, [searchQuery, alunos])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddAluno = () => {
    setSelectedAluno(null)
    setFormData({
      nome: "",
      turma: "",
      matricula: "",
      dataNascimento: "",
      responsavel: "",
      contato: "",
    })
    setIsDialogOpen(true)
  }

  const handleEditAluno = (aluno: Aluno) => {
    setSelectedAluno(aluno)
    setFormData({
      nome: aluno.nome,
      turma: aluno.turma,
      matricula: aluno.matricula,
      dataNascimento: aluno.dataNascimento,
      responsavel: aluno.responsavel,
      contato: aluno.contato,
    })
    setIsDialogOpen(true)
  }

  const handleDeleteAluno = (aluno: Aluno) => {
    setSelectedAluno(aluno)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (selectedAluno) {
      deleteAluno(selectedAluno.id)
      setAlunos(getAlunos())
      setIsDeleteDialogOpen(false)
      toast({
        title: "Aluno excluído",
        description: "O aluno foi excluído com sucesso",
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (selectedAluno) {
        // Atualizar aluno existente
        updateAluno({
          id: selectedAluno.id,
          ...formData,
        })
        toast({
          title: "Aluno atualizado",
          description: "Os dados do aluno foram atualizados com sucesso",
        })
      } else {
        // Adicionar novo aluno
        saveAluno(formData)
        toast({
          title: "Aluno adicionado",
          description: "O novo aluno foi adicionado com sucesso",
        })
      }

      setAlunos(getAlunos())
      setIsDialogOpen(false)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar os dados do aluno",
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
            <h1 className="text-2xl font-bold text-primary">Gestão de Alunos</h1>
            <p className="text-slate-600">Cadastre e gerencie os alunos da escola</p>
          </div>
          <Button onClick={handleAddAluno}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Aluno
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="relative w-full max-w-md mb-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              type="search"
              placeholder="Buscar alunos..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Matrícula</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Turma</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlunos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-slate-500">
                      Nenhum aluno encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAlunos.map((aluno) => (
                    <TableRow key={aluno.id}>
                      <TableCell className="font-medium">{aluno.matricula}</TableCell>
                      <TableCell>{aluno.nome}</TableCell>
                      <TableCell>{aluno.turma}</TableCell>
                      <TableCell>{aluno.responsavel}</TableCell>
                      <TableCell>{aluno.contato}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditAluno(aluno)}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteAluno(aluno)}>
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

      {/* Diálogo para adicionar/editar aluno */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{selectedAluno ? "Editar Aluno" : "Adicionar Novo Aluno"}</DialogTitle>
            <DialogDescription>
              {selectedAluno ? "Edite as informações do aluno nos campos abaixo." : "Preencha os dados do novo aluno."}
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
                  <Label htmlFor="turma">Turma</Label>
                  <Input id="turma" name="turma" value={formData.turma} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="matricula">Matrícula</Label>
                  <Input
                    id="matricula"
                    name="matricula"
                    value={formData.matricula}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                  <Input
                    id="dataNascimento"
                    name="dataNascimento"
                    type="date"
                    value={formData.dataNascimento}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="responsavel">Responsável</Label>
                  <Input
                    id="responsavel"
                    name="responsavel"
                    value={formData.responsavel}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contato">Contato</Label>
                  <Input id="contato" name="contato" value={formData.contato} onChange={handleInputChange} required />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">{selectedAluno ? "Salvar Alterações" : "Adicionar Aluno"}</Button>
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
              Tem certeza que deseja excluir o aluno {selectedAluno?.nome}? Esta ação não pode ser desfeita.
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
