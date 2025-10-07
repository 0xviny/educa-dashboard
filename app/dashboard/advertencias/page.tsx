"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Download,
  Eye,
  FileText,
  Filter,
  Plus,
  RefreshCw,
  Trash,
  UserRound,
  BarChart3,
  Search,
  School,
  User,
  LogOut,
} from "lucide-react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { SignaturePad, type SignaturePadRef } from "@/components/signature-pad";
import {
  type Advertencia,
  type Aluno,
  deleteAdvertencia,
  getAdvertencias,
  getAluno,
  getAlunos,
  saveAdvertencia,
  updateAdvertencia,
  generateId,
} from "@/lib/storage-service";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";

const PDFViewerDialog = dynamic(
  () => import("@/components/pdf/pdf-viewer").then((mod) => mod.PDFViewerDialog),
  {
    ssr: false,
    loading: () => <div className="p-4 text-center">Carregando visualizador de PDF...</div>,
  }
);

export default function AdvertenciasPage() {
  const [advertencias, setAdvertencias] = useState<Advertencia[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [openAdvertenciaDialog, setOpenAdvertenciaDialog] = useState(false);
  const [openPerfilDialog, setOpenPerfilDialog] = useState(false);
  const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);
  const [selectedAdvertencia, setSelectedAdvertencia] = useState<Advertencia | null>(null);
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [padWidth, setPadWidth] = useState(400);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [assinaturas, setAssinaturas] = useState<{
    professor?: string;
    direcao?: string;
    aluno?: string;
    responsavel?: string;
  }>({});
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);
  const [signatureType, setSignatureType] = useState<
    "professor" | "direcao" | "aluno" | "responsavel"
  >("professor");
  const [gravityMap, setGravityMap] = useState<
    Record<string, { label: string; color: string; joyColor?: string }>
  >({});
  const [detectedGravidade, setDetectedGravidade] = useState<"leve" | "moderado" | "grave" | null>(
    null
  );
  const [formData, setFormData] = useState({
    nomeAluno: "",
    turmaAluno: "",
    data: new Date().toISOString().split("T")[0],
    motivo: "",
    detalhes: "",
    professor: user?.nome || "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadGravity() {
      try {
        const res = await fetch("/api/adv/gravity");
        if (res.ok) {
          const data = await res.json();
          setGravityMap(data);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadGravity();
  }, []);

  const handleEnviar = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/groq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: formData.motivo, autoClassify: true }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.resposta) {
          setFormData((prev) => ({ ...prev, motivo: data.resposta }));
        }
        if (data?.gravityMap) setGravityMap(data.gravityMap);
        if (data?.gravidadeDetectada) setDetectedGravidade(data.gravidadeDetectada);
      } else {
        setError("Erro ao aprimorar o texto");
      }
    } catch (err) {
      setError("Erro ao enviar o motivo. Tente novamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const signaturePadRef = useRef<SignaturePadRef>(null);
  const signatureDialogPadRef = useRef<SignaturePadRef>(null);

  useEffect(() => {
    function updateWidth() {
      setPadWidth(Math.min(400, window.innerWidth - 80));
    }
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    try {
      const advertenciasData = getAdvertencias();
      const alunosData = getAlunos();
      const advertenciasComAlunos = advertenciasData.map((adv) => {
        if (adv.alunoId) {
          const aluno = alunosData.find((a) => a.id === adv.alunoId);
          return {
            ...adv,
            aluno: aluno?.nome || adv.aluno || "Aluno não encontrado",
            turma: aluno?.turma || adv.turma || "Turma não encontrada",
          };
        }
        return adv;
      });
      setAdvertencias(advertenciasComAlunos);
      setAlunos(alunosData);
      toast({
        title: "Dados carregados",
        description: `${advertenciasComAlunos.length} advertências encontradas.`,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Erro ao carregar dados",
        description: "Ocorreu um erro ao carregar as advertências.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nomeAluno.trim()) {
      newErrors.nomeAluno = "O nome do aluno é obrigatório.";
    }
    if (!formData.turmaAluno.trim()) {
      newErrors.turmaAluno = "A turma do aluno é obrigatória.";
    }
    if (!formData.motivo.trim()) {
      newErrors.motivo = "O motivo da advertência é obrigatório.";
    }
    if (!assinaturas.professor) {
      newErrors.assinatura = "A assinatura do professor é obrigatória.";
    }
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDownloadPDF = (advertencia: Advertencia) => {
    setSelectedAdvertencia(advertencia);
    if (advertencia.assinaturas) setAssinaturas(advertencia.assinaturas);
    else setAssinaturas({});
    setPdfViewerOpen(true);
    toast({ title: "Gerando PDF", description: "O PDF está sendo gerado, aguarde um momento." });
  };

  const handleNovaAdvertencia = () => {
    if (!validateForm()) {
      toast({
        title: "Campos obrigatórios pendentes",
        description: "Por favor, preencha todos os campos indicados com erro.",
        variant: "destructive",
      });
      return;
    }
    let gravidadeToSave: "leve" | "moderado" | "grave" = "leve";
    if (detectedGravidade) {
      gravidadeToSave = detectedGravidade;
    }
    try {
      saveAdvertencia({
        alunoId: "",
        aluno: formData.nomeAluno,
        turma: formData.turmaAluno,
        data: formData.data,
        motivo: formData.motivo,
        detalhes: formData.detalhes,
        status: "Pendente",
        professor: formData.professor,
        gravidade: gravidadeToSave,
        assinaturas: { professor: assinaturas.professor },
      } as any);
      const advertenciasData = getAdvertencias();
      const alunosData = getAlunos();
      const advertenciasComAlunos = advertenciasData.map((adv) => {
        if (adv.alunoId) {
          const aluno = alunosData.find((a) => a.id === adv.alunoId);
          return {
            ...adv,
            aluno: aluno?.nome || adv.aluno || "Aluno não encontrado",
            turma: aluno?.turma || adv.turma || "Turma não encontrada",
          };
        }
        return adv;
      });
      setAdvertencias(advertenciasComAlunos);
      setOpenAdvertenciaDialog(false);
      toast({
        title: "Advertência registrada",
        description: `Gravidade: ${gravityMap?.[gravidadeToSave]?.label || gravidadeToSave}`,
      });
      setFormData({
        nomeAluno: "",
        turmaAluno: "",
        data: new Date().toISOString().split("T")[0],
        motivo: "",
        detalhes: "",
        professor: user?.nome || "",
      });
      setAssinaturas({});
      setDetectedGravidade(null);
      setFormErrors({});
    } catch (err) {
      console.error(err);
      toast({
        title: "Erro ao registrar",
        description: "Ocorreu um erro ao registrar a advertência",
        variant: "destructive",
      });
    }
  };

  const verPerfil = (advertencia: Advertencia) => {
    if (advertencia.alunoId) {
      const aluno = getAluno(advertencia.alunoId);
      if (aluno) setSelectedAluno(aluno);
      else
        setSelectedAluno({
          id: generateId(),
          nome: advertencia.aluno || "Aluno",
          turma: advertencia.turma || "Turma não especificada",
          matricula: "N/A",
          dataNascimento: "",
          responsavel: "N/A",
          contato: "N/A",
        });
    } else {
      setSelectedAluno({
        id: generateId(),
        nome: advertencia.aluno || "Aluno",
        turma: advertencia.turma || "Turma não especificada",
        matricula: "N/A",
        dataNascimento: "",
        responsavel: "N/A",
        contato: "N/A",
      });
    }
    setSelectedAdvertencia(advertencia);
    setOpenPerfilDialog(true);
  };

  const openSignatureDialog = (
    type: "professor" | "direcao" | "aluno" | "responsavel",
    advertencia: Advertencia
  ) => {
    setSignatureType(type);
    setSelectedAdvertencia(advertencia);
    setSignatureDialogOpen(true);
    toast({
      title: "Assinatura digital",
      description: `Faça sua assinatura ${
        type === "professor"
          ? "como professor"
          : type === "direcao"
          ? "como direção"
          : type === "aluno"
          ? "como aluno"
          : "como responsável"
      }.`,
    });
  };

  const handleSaveSignature = () => {
    if (!selectedAdvertencia) return;
    const dataUrl = signatureDialogPadRef.current?.getDataURL();
    if (!dataUrl) {
      toast({
        title: "Assinatura vazia",
        description: "Por favor, faça uma assinatura antes de confirmar",
        variant: "destructive",
      });
      return;
    }
    const novasAssinaturas = { ...selectedAdvertencia.assinaturas, [signatureType]: dataUrl };
    setAssinaturas(novasAssinaturas);
    const advertenciaAtualizada: Advertencia = {
      ...selectedAdvertencia,
      assinaturas: novasAssinaturas,
      status: "Assinada",
    };
    updateAdvertencia(advertenciaAtualizada);
    const advertenciasData = getAdvertencias();
    const alunosData = getAlunos();
    const advertenciasComAlunos = advertenciasData.map((adv) => {
      if (adv.alunoId) {
        const aluno = alunosData.find((a) => a.id === adv.alunoId);
        return {
          ...adv,
          aluno: aluno?.nome || adv.aluno || "Aluno não encontrado",
          turma: aluno?.turma || adv.turma || "Turma não encontrada",
        };
      }
      return adv;
    });
    setAdvertencias(advertenciasComAlunos);
    setSignatureDialogOpen(false);
    toast({ title: "Assinatura salva", description: `A assinatura foi salva com sucesso.` });
  };

  const filteredAdvertencias = advertencias.filter((adv) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      adv.aluno?.toLowerCase().includes(searchLower) ||
      adv.turma?.toLowerCase().includes(searchLower) ||
      adv.motivo?.toLowerCase().includes(searchLower) ||
      adv.professor?.toLowerCase().includes(searchLower)
    );
  });

  const hasErrors = Object.values(formErrors).some((err) => err !== "");

  return (
    <>
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
      </header>

      <div className="space-y-6 pb-10 p-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">Gestão de Advertências</h1>
            <p className="text-slate-600">
              Gerencie as advertências dos alunos e gere documentos para assinatura.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/dashboard/relatorios")}
              className="w-full sm:w-auto"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Relatórios
            </Button>
            <Dialog open={openAdvertenciaDialog} onOpenChange={setOpenAdvertenciaDialog}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Advertência
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px] w-[95vw] max-w-[95vw] sm:w-auto">
                <DialogHeader>
                  <DialogTitle>Registrar Nova Advertência</DialogTitle>
                  <DialogDescription>Preencha os dados da advertência do aluno.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="nomeAluno">Nome do Aluno</Label>
                      <Input
                        id="nomeAluno"
                        name="nomeAluno"
                        value={formData.nomeAluno}
                        onChange={handleInputChange}
                        placeholder="Nome completo do aluno"
                        className={formErrors.nomeAluno ? "border-red-500" : ""}
                        required
                      />
                      {formErrors.nomeAluno && (
                        <p className="text-red-500 text-sm">{formErrors.nomeAluno}</p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="turmaAluno">Turma</Label>
                      <Input
                        id="turmaAluno"
                        name="turmaAluno"
                        value={formData.turmaAluno}
                        onChange={handleInputChange}
                        placeholder="Ex: 3º Ano DS"
                        className={formErrors.turmaAluno ? "border-red-500" : ""}
                        required
                      />
                      {formErrors.turmaAluno && (
                        <p className="text-red-500 text-sm">{formErrors.turmaAluno}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="motivo">Motivo da Advertência</Label>
                    <Textarea
                      id="motivo"
                      name="motivo"
                      value={formData.motivo}
                      onChange={handleInputChange}
                      placeholder="Descreva o motivo da advertência"
                      className={formErrors.motivo ? "border-red-500" : ""}
                      required
                    />
                    {formErrors.motivo && (
                      <p className="text-red-500 text-sm">{formErrors.motivo}</p>
                    )}
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={handleEnviar}
                        disabled={loading || !formData.motivo.trim()}
                      >
                        {loading ? "Gerando..." : "Melhorar texto"}
                      </Button>
                      {detectedGravidade && gravityMap?.[detectedGravidade] && (
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium"
                          style={{
                            backgroundColor: gravityMap[detectedGravidade].color,
                            color: "#fff",
                          }}
                        >
                          {gravityMap[detectedGravidade].label}
                        </span>
                      )}
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="detalhes">Detalhes (opcional)</Label>
                    <Textarea
                      id="detalhes"
                      name="detalhes"
                      value={formData.detalhes}
                      onChange={handleInputChange}
                      placeholder="Forneça detalhes adicionais se necessário"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="data">Data</Label>
                      <Input
                        id="data"
                        name="data"
                        type="date"
                        value={formData.data}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="professor">Professor</Label>
                      <Input
                        id="professor"
                        name="professor"
                        value={formData.professor}
                        onChange={handleInputChange}
                        placeholder="Nome do professor"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="assinatura">Sua Assinatura</Label>
                    <SignaturePad
                      ref={signaturePadRef}
                      onSave={(dataUrl) => {
                        setAssinaturas((prev) => ({ ...prev, professor: dataUrl }));
                        setFormErrors((prev) => ({ ...prev, assinatura: "" }));
                        toast({
                          title: "Assinatura confirmada",
                          description:
                            "Sua assinatura foi salva. Você pode prosseguir com o registro da advertência.",
                        });
                      }}
                      height={150}
                      width={padWidth}
                    />
                    {formErrors.assinatura && (
                      <p className="text-red-500 text-sm">{formErrors.assinatura}</p>
                    )}
                  </div>
                </div>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setOpenAdvertenciaDialog(false);
                      setFormErrors({});
                    }}
                    className="w-full sm:w-auto"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    onClick={handleNovaAdvertencia}
                    disabled={loading || hasErrors}
                    className="w-full sm:w-auto"
                  >
                    Registrar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Advertências</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{advertencias.length}</div>
              <p className="text-xs text-slate-500">Advertências registradas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Advertências Pendentes</CardTitle>
              <FileText className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {advertencias.filter((adv) => adv.status === "Pendente").length}
              </div>
              <p className="text-xs text-slate-500">Aguardando assinatura</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Advertências Assinadas</CardTitle>
              <FileText className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {advertencias.filter((adv) => adv.status === "Assinada").length}
              </div>
              <p className="text-xs text-slate-500">Completas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alunos Advertidos</CardTitle>
              <UserRound className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(advertencias.map((adv) => adv.alunoId || adv.aluno)).size}
              </div>
              <p className="text-xs text-slate-500">Alunos advertidos</p>
            </CardContent>
          </Card>
        </div>

        <div className="rounded-lg border bg-white shadow-sm">
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">Advertências Recentes</h2>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  type="search"
                  placeholder="Pesquisar..."
                  className="w-full pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtrar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    setIsLoading(true);
                    try {
                      const advertenciasData = getAdvertencias();
                      const alunosData = getAlunos();
                      const advertenciasComAlunos = advertenciasData.map((adv) => {
                        if (adv.alunoId) {
                          const aluno = alunosData.find((a) => a.id === adv.alunoId);
                          return {
                            ...adv,
                            aluno: aluno?.nome || adv.aluno || "Aluno não encontrado",
                            turma: aluno?.turma || adv.turma || "Turma não encontrada",
                          };
                        }
                        return adv;
                      });
                      setAdvertencias(advertenciasComAlunos);
                      setSearchQuery("");
                      toast({
                        title: "Dados atualizados",
                        description: "As advertências foram atualizadas",
                      });
                    } catch (err) {
                      toast({
                        title: "Erro ao atualizar",
                        description: "Ocorreu um erro ao atualizar os dados",
                        variant: "destructive",
                      });
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                  Atualizar
                </Button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Aluno</TableHead>
                  <TableHead className="hidden sm:table-cell">Turma</TableHead>
                  <TableHead className="hidden md:table-cell">Data</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                      <p>Carregando advertências...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredAdvertencias.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-slate-500">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Nenhuma advertência encontrada</p>
                      {searchQuery && (
                        <Button variant="link" onClick={() => setSearchQuery("")} className="mt-2">
                          Limpar pesquisa
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAdvertencias.map((advertencia) => (
                    <TableRow key={advertencia.id}>
                      <TableCell className="font-medium">
                        {advertencia.id.substring(0, 6)}
                      </TableCell>
                      <TableCell>{advertencia.aluno}</TableCell>
                      <TableCell className="hidden sm:table-cell">{advertencia.turma}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {new Date(advertencia.data).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{advertencia.motivo}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={advertencia.status === "Pendente" ? "outline" : "default"}
                          >
                            {advertencia.status}
                          </Badge>
                          {advertencia.gravidade ? (
                            <span
                              className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium"
                              style={{
                                backgroundColor:
                                  gravityMap?.[advertencia.gravidade]?.color || "#6b7280",
                                color: "#ffffff",
                              }}
                            >
                              {gravityMap?.[advertencia.gravidade]?.label || advertencia.gravidade}
                            </span>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => verPerfil(advertencia)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Ver perfil</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownloadPDF(advertencia)}
                          >
                            <Download className="h-4 w-4" />
                            <span className="sr-only">Baixar PDF</span>
                          </Button>
                          {(user?.perfil === "direcao" || user?.perfil === "admin") && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                if (confirm("Tem certeza que deseja excluir esta advertência?")) {
                                  deleteAdvertencia(advertencia.id);
                                  const newAdvertenciasData = getAdvertencias();
                                  const newAlunosData = getAlunos();
                                  const mapped = newAdvertenciasData.map((adv) => {
                                    if (adv.alunoId) {
                                      const aluno = newAlunosData.find((a) => a.id === adv.alunoId);
                                      return {
                                        ...adv,
                                        aluno: aluno?.nome || adv.aluno || "Aluno não encontrado",
                                        turma: aluno?.turma || adv.turma || "Turma não encontrada",
                                      };
                                    }
                                    return adv;
                                  });
                                  setAdvertencias(mapped);
                                  toast({
                                    title: "Advertência excluída",
                                    description: "A advertência foi excluída com sucesso",
                                  });
                                }
                              }}
                            >
                              <Trash className="h-4 w-4" />
                              <span className="sr-only">Excluir</span>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <Dialog open={openPerfilDialog} onOpenChange={setOpenPerfilDialog}>
          <DialogContent className="sm:max-w-[600px] w-[95vw] max-w-[95vw] sm:w-auto">
            <DialogHeader>
              <DialogTitle>Perfil do Aluno</DialogTitle>
              <DialogDescription>
                Histórico de advertências e informações do aluno.
              </DialogDescription>
            </DialogHeader>
            {selectedAluno && (
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserRound className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{selectedAluno.nome}</h3>
                    <p className="text-sm text-slate-500">{selectedAluno.turma}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">
                        {
                          advertencias.filter(
                            (adv) =>
                              adv.alunoId === selectedAluno.id || adv.aluno === selectedAluno.nome
                          ).length
                        }{" "}
                        advertências
                      </Badge>
                    </div>
                  </div>
                </div>

                {selectedAluno.matricula !== "N/A" && (
                  <div className="rounded-lg border p-4">
                    <h4 className="font-medium mb-2">Informações Pessoais</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-slate-500">Matrícula</p>
                        <p>{selectedAluno.matricula}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Data de Nascimento</p>
                        <p>
                          {selectedAluno.dataNascimento
                            ? new Date(selectedAluno.dataNascimento).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Responsável</p>
                        <p>{selectedAluno.responsavel}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Contato</p>
                        <p>{selectedAluno.contato}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-medium mb-2">Histórico de Advertências</h4>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {advertencias
                      .filter(
                        (adv) =>
                          adv.alunoId === selectedAluno.id || adv.aluno === selectedAluno.nome
                      )
                      .map((advertencia) => (
                        <div key={advertencia.id} className="rounded-lg border p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="font-medium">{advertencia.motivo}</h5>
                              <p className="text-sm text-slate-500">
                                Professor: {advertencia.professor} •{" "}
                                {new Date(advertencia.data).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={advertencia.status === "Pendente" ? "outline" : "default"}
                              >
                                {advertencia.status}
                              </Badge>
                              {advertencia.gravidade ? (
                                <span
                                  className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium"
                                  style={{
                                    backgroundColor:
                                      gravityMap?.[advertencia.gravidade]?.color || "#e5e7eb",
                                    color: "#ffffff",
                                  }}
                                >
                                  {gravityMap?.[advertencia.gravidade]?.label ||
                                    advertencia.gravidade}
                                </span>
                              ) : null}
                            </div>
                          </div>
                          {advertencia.detalhes && (
                            <p className="text-sm mt-2">{advertencia.detalhes}</p>
                          )}
                          <div
                            className={
                              user?.perfil === "professor"
                                ? "hidden"
                                : `flex flex-wrap justify-end mt-2 gap-2`
                            }
                          >
                            {advertencia.status === "Pendente" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setOpenPerfilDialog(false);
                                  setTimeout(() => {
                                    if (user?.perfil === "professor") {
                                      return;
                                    } else if (
                                      user?.perfil === "direcao" ||
                                      user?.perfil === "admin"
                                    ) {
                                      openSignatureDialog("direcao", advertencia);
                                    }
                                  }, 300);
                                }}
                              >
                                Assinar
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setOpenPerfilDialog(false);
                                setTimeout(() => handleDownloadPDF(advertencia), 300);
                              }}
                            >
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

        {selectedAdvertencia && pdfViewerOpen && (
          <PDFViewerDialog
            isOpen={pdfViewerOpen}
            onClose={() => setPdfViewerOpen(false)}
            advertencia={selectedAdvertencia}
            assinaturas={assinaturas}
            fileName={`advertencia_${selectedAdvertencia.id.substring(0, 6)}_${(
              selectedAdvertencia.aluno || "aluno"
            )
              .replace(/\s+/g, "_")
              .toLowerCase()}.pdf`}
          />
        )}

        <Dialog open={signatureDialogOpen} onOpenChange={setSignatureDialogOpen}>
          <DialogContent className="sm:max-w-[500px] w-[95vw] max-w-[95vw] sm:w-auto">
            <DialogHeader>
              <DialogTitle>Assinatura Digital</DialogTitle>
              <DialogDescription>
                {signatureType === "professor" && "Sua Assinatura como Professor"}
                {signatureType === "direcao" && "Assinatura da Direção"}
                {signatureType === "aluno" && "Assinatura do Aluno"}
                {signatureType === "responsavel" && "Assinatura do Responsável"}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <SignaturePad
                ref={signatureDialogPadRef}
                onSave={() => {}}
                width={padWidth}
                height={200}
              />
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setSignatureDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button onClick={handleSaveSignature} className="w-full sm:w-auto">
                Confirmar Assinatura
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
