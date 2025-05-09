"use client"

import { useState } from "react"
import { Download, Eye, FileText, Filter, Plus, RefreshCw, Trash, UserRound } from "lucide-react"
import dynamic from "next/dynamic"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { SignaturePad } from "@/components/signature-pad"

// Importação dinâmica do componente PDFViewerDialog
const PDFViewerDialog = dynamic(() => import("@/components/pdf/pdf-viewer").then((mod) => mod.PDFViewerDialog), {
  ssr: false,
  loading: () => <div className="p-4 text-center">Carregando visualizador de PDF...</div>,
})

// Dados simulados para advertências
const advertenciasData = [
  {
    id: 1,
    aluno: "João Silva",
    turma: "9º Ano A",
    data: "15/05/2023",
    motivo: "Uso de celular em sala",
    status: "Pendente",
    professor: "Maria Oliveira",
    detalhes:
      "O aluno foi advertido por utilizar o celular durante a explicação da matéria, mesmo após ser solicitado que guardasse o aparelho.",
  },
  {
    id: 2,
    aluno: "Ana Souza",
    turma: "7º Ano B",
    data: "12/05/2023",
    motivo: "Conversa excessiva",
    status: "Assinada",
    professor: "Carlos Santos",
    detalhes:
      "A aluna estava conversando excessivamente durante a aula, atrapalhando o andamento das atividades e a concentração dos colegas.",
  },
  {
    id: 3,
    aluno: "Pedro Almeida",
    turma: "8º Ano C",
    data: "10/05/2023",
    motivo: "Atraso constante",
    status: "Pendente",
    professor: "Juliana Costa",
    detalhes:
      "O aluno tem chegado atrasado repetidamente nas aulas, prejudicando seu aprendizado e interrompendo a dinâmica da classe.",
  },
  {
    id: 4,
    aluno: "Mariana Lima",
    turma: "6º Ano A",
    data: "08/05/2023",
    motivo: "Não realizou atividade",
    status: "Assinada",
    professor: "Roberto Ferreira",
    detalhes:
      "A aluna não entregou a atividade solicitada pela terceira vez consecutiva, mesmo após conversas anteriores.",
  },
  {
    id: 5,
    aluno: "Lucas Mendes",
    turma: "9º Ano B",
    data: "05/05/2023",
    motivo: "Comportamento inadequado",
    status: "Pendente",
    professor: "Fernanda Alves",
    detalhes:
      "O aluno apresentou comportamento desrespeitoso com os colegas durante o intervalo, resultando em conflito.",
  },
]

export default function DirecaoAdvertenciasPage() {
  const [openAdvertenciaDialog, setOpenAdvertenciaDialog] = useState(false)
  const [openPerfilDialog, setOpenPerfilDialog] = useState(false)
  const [selectedAluno, setSelectedAluno] = useState<any>(null)
  const { toast } = useToast()

  // Estado para controlar a visualização do PDF
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false)
  const [selectedAdvertencia, setSelectedAdvertencia] = useState<any>(null)

  // Estados para assinaturas
  const [assinaturas, setAssinaturas] = useState<{
    professor?: string
    direcao?: string
    aluno?: string
    responsavel?: string
  }>({})

  // Estado para o diálogo de assinatura
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false)
  const [signatureType, setSignatureType] = useState<"professor" | "direcao" | "aluno" | "responsavel">("direcao")

  const handleDownloadPDF = (advertencia: any) => {
    setSelectedAdvertencia(advertencia)
    setPdfViewerOpen(true)
  }

  const handleNovaAdvertencia = () => {
    setOpenAdvertenciaDialog(false)
    toast({
      title: "Advertência registrada",
      description: "A nova advertência foi registrada com sucesso",
    })
  }

  const verPerfil = (aluno: any) => {
    setSelectedAluno(aluno)
    setOpenPerfilDialog(true)
  }

  const openSignatureDialog = (type: "professor" | "direcao" | "aluno" | "responsavel", advertencia: any) => {
    setSignatureType(type)
    setSelectedAdvertencia(advertencia)
    setSignatureDialogOpen(true)
  }

  const handleSaveSignature = (dataUrl: string) => {
    setAssinaturas({
      ...assinaturas,
      [signatureType]: dataUrl,
    })
    setSignatureDialogOpen(false)

    toast({
      title: "Assinatura salva",
      description: `A assinatura foi salva com sucesso.`,
    })
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestão de Advertências</h1>
          <p className="text-muted-foreground">
            Gerencie as advertências dos alunos e gere documentos para assinatura.
          </p>
        </div>
        <Dialog open={openAdvertenciaDialog} onOpenChange={setOpenAdvertenciaDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Advertência
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Registrar Nova Advertência</DialogTitle>
              <DialogDescription>Preencha os dados da advertência do aluno.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="aluno">Aluno</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o aluno" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="joao">João Silva</SelectItem>
                      <SelectItem value="ana">Ana Souza</SelectItem>
                      <SelectItem value="pedro">Pedro Almeida</SelectItem>
                      <SelectItem value="mariana">Mariana Lima</SelectItem>
                      <SelectItem value="lucas">Lucas Mendes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="turma">Turma</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a turma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6a">6º Ano A</SelectItem>
                      <SelectItem value="7b">7º Ano B</SelectItem>
                      <SelectItem value="8c">8º Ano C</SelectItem>
                      <SelectItem value="9a">9º Ano A</SelectItem>
                      <SelectItem value="9b">9º Ano B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="motivo">Motivo da Advertência</Label>
                <Textarea id="motivo" placeholder="Descreva o motivo da advertência" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="data">Data</Label>
                  <Input id="data" type="date" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="professor">Professor</Label>
                  <Input id="professor" placeholder="Nome do professor" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenAdvertenciaDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleNovaAdvertencia}>Registrar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Advertências</CardTitle>
            <FileText className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">152</div>
            <p className="text-xs text-slate-500">+6% em relação ao mês anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Advertências Pendentes</CardTitle>
            <FileText className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">38</div>
            <p className="text-xs text-slate-500">12 novas esta semana</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Advertências Assinadas</CardTitle>
            <FileText className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">114</div>
            <p className="text-xs text-slate-500">+12% em relação ao mês anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alunos com Advertências</CardTitle>
            <UserRound className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87</div>
            <p className="text-xs text-slate-500">23% dos alunos da escola</p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-lg border bg-white shadow-sm">
        <div className="p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Advertências Recentes</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filtrar
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Aluno</TableHead>
              <TableHead>Turma</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Motivo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {advertenciasData.map((advertencia) => (
              <TableRow key={advertencia.id}>
                <TableCell className="font-medium">{advertencia.id}</TableCell>
                <TableCell>{advertencia.aluno}</TableCell>
                <TableCell>{advertencia.turma}</TableCell>
                <TableCell>{advertencia.data}</TableCell>
                <TableCell className="max-w-[200px] truncate">{advertencia.motivo}</TableCell>
                <TableCell>
                  <Badge variant={advertencia.status === "Pendente" ? "outline" : "default"}>
                    {advertencia.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => verPerfil(advertencia)}>
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">Ver perfil</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDownloadPDF(advertencia)}>
                      <Download className="h-4 w-4" />
                      <span className="sr-only">Baixar PDF</span>
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash className="h-4 w-4" />
                      <span className="sr-only">Excluir</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialog para perfil do aluno */}
      <Dialog open={openPerfilDialog} onOpenChange={setOpenPerfilDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Perfil do Aluno</DialogTitle>
            <DialogDescription>Histórico de advertências e informações do aluno.</DialogDescription>
          </DialogHeader>
          {selectedAluno && (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-full bg-slate-200 flex items-center justify-center">
                  <UserRound className="h-8 w-8 text-slate-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedAluno.aluno}</h3>
                  <p className="text-sm text-slate-500">{selectedAluno.turma}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">5 advertências</Badge>
                    <Badge variant="outline">2 suspensões</Badge>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h4 className="font-medium mb-2">Informações Pessoais</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-slate-500">Matrícula</p>
                    <p>2023{Math.floor(Math.random() * 10000)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Data de Nascimento</p>
                    <p>12/08/2008</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Responsável</p>
                    <p>Maria Silva</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Contato</p>
                    <p>(11) 98765-4321</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Histórico de Advertências</h4>
                <div className="space-y-3">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="rounded-lg border p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium">{selectedAluno.motivo}</h5>
                          <p className="text-sm text-slate-500">
                            Professor: {selectedAluno.professor} • {selectedAluno.data}
                          </p>
                        </div>
                        <Badge variant={index === 0 ? "outline" : "default"}>
                          {index === 0 ? "Pendente" : "Assinada"}
                        </Badge>
                      </div>
                      <p className="text-sm mt-2">
                        {index === 0
                          ? selectedAluno.motivo + " durante a aula de matemática."
                          : "O aluno apresentou comportamento inadequado durante a aula, atrapalhando os colegas."}
                      </p>
                      <div className="flex justify-end mt-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openSignatureDialog("direcao", selectedAluno)}
                        >
                          Assinar
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDownloadPDF(selectedAluno)}>
                          <Download className="mr-2 h-3 w-3" />
                          Baixar PDF
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Componente de visualização do PDF */}
      {selectedAdvertencia && pdfViewerOpen && (
        <PDFViewerDialog
          isOpen={pdfViewerOpen}
          onClose={() => setPdfViewerOpen(false)}
          advertencia={selectedAdvertencia}
          assinaturas={assinaturas}
          fileName={`advertencia_${selectedAdvertencia.id}_${selectedAdvertencia.aluno.replace(/\s+/g, "_").toLowerCase()}.pdf`}
        />
      )}

      {/* Diálogo para captura de assinatura */}
      <Dialog open={signatureDialogOpen} onOpenChange={setSignatureDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assinatura Digital</DialogTitle>
            <DialogDescription>
              {signatureType === "professor" && "Assinatura do Professor"}
              {signatureType === "direcao" && "Assinatura da Direção"}
              {signatureType === "aluno" && "Assinatura do Aluno"}
              {signatureType === "responsavel" && "Assinatura do Responsável"}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <SignaturePad onSave={handleSaveSignature} width={400} height={200} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSignatureDialogOpen(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
