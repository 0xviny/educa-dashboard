"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Laptop,
  Plus,
  RefreshCw,
  Download,
  Search,
  Trash,
  School,
  User,
  LogOut,
} from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { SignaturePad } from "@/components/signature-pad";
import {
  type Equipamento,
  getEquipamentos,
  getTurmas,
  saveEquipamento,
  updateEquipamento,
  deleteEquipamento,
} from "@/lib/storage-service";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";

export default function EquipamentosPage() {
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [filteredEquipamentos, setFilteredEquipamentos] = useState<Equipamento[]>([]);
  const [turmas, setTurmas] = useState<string[]>([]);
  const [openEquipamentoDialog, setOpenEquipamentoDialog] = useState(false);
  const [isDevolvendo, setIsDevolvendo] = useState(false);
  const [selectedEquipamento, setSelectedEquipamento] = useState<Equipamento | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user, logout } = useAuth();

  // Estado para assinatura
  const [assinatura, setAssinatura] = useState<string | null>(null);
  const [assinaturaConfirmada, setAssinaturaConfirmada] = useState(false);

  // Estado para o formulário de equipamento
  const [formData, setFormData] = useState({
    tipo: "Tablet",
    quantidade: 1,
    numerosSerie: "",
    professor: user?.nome || "",
    turma: "",
    dataRetirada: new Date().toISOString().split("T")[0],
    horaRetirada: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    observacoes: "",
  });

  // Carregar dados
  useEffect(() => {
    const loadData = () => {
      setIsLoading(true);
      try {
        const equipamentosData = getEquipamentos();
        const turmasData = getTurmas().map((turma) => turma.nome);

        setEquipamentos(equipamentosData);
        setFilteredEquipamentos(equipamentosData);
        setTurmas(turmasData);

        toast({
          title: "Dados carregados",
          description: "Os dados de equipamentos foram carregados com sucesso",
        });
      } catch (error) {
        toast({
          title: "Erro ao carregar dados",
          description: "Ocorreu um erro ao carregar os dados de equipamentos",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [toast]);

  // Filtrar equipamentos quando o termo de busca mudar
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredEquipamentos(equipamentos);
    } else {
      const filtered = equipamentos.filter(
        (equip) =>
          equip.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          equip.professor.toLowerCase().includes(searchTerm.toLowerCase()) ||
          equip.turma.toLowerCase().includes(searchTerm.toLowerCase()) ||
          equip.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEquipamentos(filtered);
    }
  }, [searchTerm, equipamentos]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAssinaturaConfirmada = (dataUrl: string) => {
    setAssinatura(dataUrl);
    setAssinaturaConfirmada(true);
    toast({
      title: "Assinatura confirmada",
      description: "Sua assinatura foi salva com sucesso",
    });
  };

  const resetForm = () => {
    setFormData({
      tipo: "Tablet",
      quantidade: 1,
      numerosSerie: "",
      professor: user?.nome || "",
      turma: "",
      dataRetirada: new Date().toISOString().split("T")[0],
      horaRetirada: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      observacoes: "",
    });
    setAssinatura(null);
    setAssinaturaConfirmada(false);
  };

  const handleNovoEmprestimo = () => {
    if (!formData.turma) {
      toast({
        title: "Erro ao registrar",
        description: "Selecione uma turma para o empréstimo",
        variant: "destructive",
      });
      return;
    }

    if (!assinaturaConfirmada || !assinatura) {
      toast({
        title: "Erro ao registrar",
        description: "É necessário confirmar a assinatura para registrar o empréstimo",
        variant: "destructive",
      });
      return;
    }

    try {
      const numerosSerie = formData.numerosSerie
        .split(",")
        .map((num) => num.trim())
        .filter((num) => num !== "");

      const novoEquipamento: Omit<Equipamento, "id"> = {
        tipo: formData.tipo,
        quantidade: Number(formData.quantidade),
        numerosSerie,
        professor: formData.professor,
        turma: formData.turma,
        dataRetirada: formData.dataRetirada,
        horaRetirada: formData.horaRetirada,
        status: "Em uso",
        observacoes: formData.observacoes,
        assinatura,
      };

      saveEquipamento(novoEquipamento);

      // Recarregar equipamentos
      setEquipamentos(getEquipamentos());
      setOpenEquipamentoDialog(false);

      toast({
        title: "Empréstimo registrado",
        description: "O empréstimo de equipamentos foi registrado com sucesso",
      });

      // Limpar formulário
      resetForm();
    } catch (error) {
      toast({
        title: "Erro ao registrar",
        description: "Ocorreu um erro ao registrar o empréstimo",
        variant: "destructive",
      });
    }
  };

  const handleDevolucao = () => {
    if (!selectedEquipamento) return;

    if (!assinaturaConfirmada || !assinatura) {
      toast({
        title: "Erro ao registrar",
        description: "É necessário confirmar a assinatura para registrar a devolução",
        variant: "destructive",
      });
      return;
    }

    try {
      const equipamentoAtualizado: Equipamento = {
        ...selectedEquipamento,
        status: "Devolvido",
        dataDevolucao: new Date().toISOString().split("T")[0],
        horaDevolucao: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        observacoes: formData.observacoes,
        assinatura,
      };

      updateEquipamento(equipamentoAtualizado);

      // Recarregar equipamentos
      setEquipamentos(getEquipamentos());
      setIsDevolvendo(false);

      toast({
        title: "Devolução registrada",
        description: "Os equipamentos foram devolvidos com sucesso",
      });

      // Limpar dados
      setSelectedEquipamento(null);
      setAssinatura(null);
      setAssinaturaConfirmada(false);
      setFormData((prev) => ({ ...prev, observacoes: "" }));
    } catch (error) {
      toast({
        title: "Erro ao registrar",
        description: "Ocorreu um erro ao registrar a devolução",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEquipamento = (id: string) => {
    try {
      deleteEquipamento(id);
      setEquipamentos(getEquipamentos());
      toast({
        title: "Equipamento excluído",
        description: "O registro de equipamento foi excluído com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir o registro de equipamento",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setEquipamentos(getEquipamentos());
      setIsLoading(false);
      toast({
        title: "Dados atualizados",
        description: "Os equipamentos foram atualizados",
      });
    }, 500);
  };

  const exportToCSV = () => {
    try {
      const headers = [
        "ID",
        "Tipo",
        "Quantidade",
        "Professor",
        "Turma",
        "Data Retirada",
        "Hora Retirada",
        "Status",
        "Data Devolução",
        "Hora Devolução",
      ];

      const csvData = filteredEquipamentos.map((equip) => [
        equip.id,
        equip.tipo,
        equip.quantidade.toString(),
        equip.professor,
        equip.turma,
        equip.dataRetirada,
        equip.horaRetirada,
        equip.status,
        equip.dataDevolucao || "",
        equip.horaDevolucao || "",
      ]);

      const csvContent = [headers.join(","), ...csvData.map((row) => row.join(","))].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `equipamentos_${new Date().toISOString().split("T")[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Exportação concluída",
        description: "Os dados foram exportados com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Ocorreu um erro ao exportar os dados",
        variant: "destructive",
      });
    }
  };

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
      <div className="space-y-6 p-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-purple-600">Gestão de Equipamentos</h1>
            <p className="text-slate-600">
              Controle o empréstimo e devolução de equipamentos da escola.
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Dialog open={openEquipamentoDialog} onOpenChange={setOpenEquipamentoDialog}>
              <DialogTrigger asChild>
                <Button variant="default" className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Empréstimo
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Registrar Empréstimo de Equipamentos</DialogTitle>
                  <DialogDescription>
                    Preencha os dados do empréstimo de equipamentos.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="tipo">Tipo de Equipamento</Label>
                      <Select
                        value={formData.tipo}
                        onValueChange={(value) => handleSelectChange("tipo", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem className="cursor-pointer" value="Tablet">Tablet</SelectItem>
                          <SelectItem  className= "cursor-pointer" value="Notebook Lenovo">Notebook Lenovo</SelectItem>
                          <SelectItem className="cursor-pointer" value="Notebook Positivo">Notebook Positivo</SelectItem>
                          <SelectItem className= "cursor-pointer" value="Notebook Multilaser">Notebook Multilaser</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="quantidade">Quantidade</Label>
                      <Input
                        id="quantidade"
                        name="quantidade"
                        type="number"
                        min="1"
                        value={formData.quantidade}
                        onChange={handleInputChange}
                        placeholder="Quantidade"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
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
                    <div className="grid gap-2">
                      <Label htmlFor="turma">Turma</Label>
                      <Select onValueChange={(value) => handleSelectChange("turma", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a turma" />
                        </SelectTrigger>
                        <SelectContent>
                          {turmas.map((turma) => (
                            <SelectItem className="cursor-pointer" key={turma} value={turma}>
                              {turma}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="dataRetirada">Data</Label>
                      <Input
                        id="dataRetirada"
                        name="dataRetirada"
                        type="date"
                        value={formData.dataRetirada}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="horaRetirada">Hora</Label>
                      <Input
                        id="horaRetirada"
                        name="horaRetirada"
                        type="time"
                        value={formData.horaRetirada}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="numerosSerie">Números dos Equipamentos</Label>
                    <Textarea
                      id="numerosSerie"
                      name="numerosSerie"
                      value={formData.numerosSerie}
                      onChange={handleInputChange}
                      placeholder="Liste os números dos equipamentos separados por vírgula"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      name="observacoes"
                      value={formData.observacoes}
                      onChange={handleInputChange}
                      placeholder="Observações sobre o empréstimo"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="assinatura">Assinatura Digital</Label>
                    <SignaturePad
                      onSave={handleAssinaturaConfirmada}
                      height={150}
                      isConfirmed={assinaturaConfirmada}
                    />
                  </div>
                </div>
                <DialogFooter className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setOpenEquipamentoDialog(false);
                      resetForm();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="default"
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={handleNovoEmprestimo}
                  >
                    Registrar Empréstimo
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 mb-4">
          {/* Total de Tablets */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5">
              <CardTitle className="text-sm font-medium">Total de Tablets</CardTitle>
              <Laptop className="h-3.5 w-3.5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {22 - equipamentos
                  .filter((equip) => equip.tipo === "Tablet" && equip.status === "Em uso")
                  .reduce((acc, equip) => acc + equip.quantidade, 0)}
              </div>
              <p className="text-xs text-slate-500">
                {equipamentos
                  .filter((equip) => equip.tipo === "Tablet" && equip.status === "Em uso")
                  .reduce((acc, equip) => acc + equip.quantidade, 0)}{" "}
                em uso atualmente
              </p>
            </CardContent>
          </Card>

          {/* Total de Notebook Lenovo */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5">
              <CardTitle className="text-sm font-medium">Total de Notebook Lenovo</CardTitle>
              <Laptop className="h-3.5 w-3.5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {20 - equipamentos
                  .filter((equip) => equip.tipo === "Notebook Lenovo" && equip.status === "Em uso")
                  .reduce((acc, equip) => acc + equip.quantidade, 0)}
              </div>
              <p className="text-xs text-slate-500">
                {equipamentos
                  .filter((equip) => equip.tipo === "Notebook Lenovo" && equip.status === "Em uso")
                  .reduce((acc, equip) => acc + equip.quantidade, 0)}{" "}
                em uso atualmente
              </p>
            </CardContent>
          </Card>

          {/* Total de Notebook Positivo */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5">
              <CardTitle className="text-sm font-medium">Total de Notebook Positivo</CardTitle>
              <Laptop className="h-3.5 w-3.5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {30 - equipamentos
                  .filter((equip) => equip.tipo === "Notebook Positivo" && equip.status === "Em uso")
                  .reduce((acc, equip) => acc + equip.quantidade, 0)}
              </div>
              <p className="text-xs text-slate-500">
                {equipamentos
                  .filter((equip) => equip.tipo === "Notebook Positivo" && equip.status === "Em uso")
                  .reduce((acc, equip) => acc + equip.quantidade, 0)}{" "}
                em uso atualmente
              </p>
            </CardContent>
          </Card>

          {/* Total de Notebook Multilaser */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5">
              <CardTitle className="text-sm font-medium">Total de Notebook Multilaser</CardTitle>
              <Laptop className="h-3.5 w-3.5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {40 - equipamentos
                  .filter((equip) => equip.tipo === "Notebook Multilaser" && equip.status === "Em uso")
                  .reduce((acc, equip) => acc + equip.quantidade, 0)}
              </div>
              <p className="text-xs text-slate-500">
                {equipamentos
                  .filter((equip) => equip.tipo === "Notebook Multilaser" && equip.status === "Em uso")
                  .reduce((acc, equip) => acc + equip.quantidade, 0)}{" "}
                em uso atualmente
              </p>
            </CardContent>
          </Card>

          {/* Equipamentos em Uso */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5">
              <CardTitle className="text-sm font-medium">Equipamentos em Uso</CardTitle>
              <Laptop className="h-3.5 w-3.5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {equipamentos
                  .filter((equip) => equip.status === "Em uso")
                  .reduce((acc, equip) => acc + equip.quantidade, 0)}
              </div>
              <p className="text-xs text-slate-500">
                {Math.round(
                  (equipamentos
                    .filter((equip) => equip.status === "Em uso")
                    .reduce((acc, equip) => acc + equip.quantidade, 0) /
                    (22 + 20 + 30 + 40)) *
                    100
                )}
                % do total
              </p>
            </CardContent>
          </Card>

          {/* Equipamentos Disponíveis */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5">
              <CardTitle className="text-sm font-medium">Equipamentos Disponíveis</CardTitle>
              <Laptop className="h-3.5 w-3.5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {(22 + 20 + 30 + 40) -
                  equipamentos
                    .filter((equip) => equip.status === "Em uso")
                    .reduce((acc, equip) => acc + equip.quantidade, 0)}
              </div>
              <p className="text-xs text-slate-500">
                {Math.round(
                  (((22 + 20 + 30 + 40) -
                    equipamentos
                      .filter((equip) => equip.status === "Em uso")
                      .reduce((acc, equip) => acc + equip.quantidade, 0)) /
                    (22 + 20 + 30 + 40)) *
                    100
                )}
                % do total
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="rounded-lg border bg-white shadow-sm">
          <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">Empréstimos de Equipamentos</h2>
            <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  type="search"
                  placeholder="Buscar equipamentos..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button variant="outline" size="sm" onClick={exportToCSV}>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
                <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
                  <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                  {isLoading ? "Atualizando..." : "Atualizar"}
                </Button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Qtd</TableHead>
                  <TableHead className="hidden md:table-cell">Professor</TableHead>
                  <TableHead className="hidden md:table-cell">Turma</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center">
                        <RefreshCw className="h-8 w-8 animate-spin text-purple-600 mb-2" />
                        <p className="text-slate-500">Carregando equipamentos...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredEquipamentos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                      {searchTerm
                        ? "Nenhum equipamento encontrado para esta busca"
                        : "Nenhum equipamento registrado"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEquipamentos.map((equipamento) => (
                    <TableRow key={equipamento.id}>
                      <TableCell className="font-medium">
                        {equipamento.id.substring(0, 6)}
                      </TableCell>
                      <TableCell>{equipamento.tipo}</TableCell>
                      <TableCell>{equipamento.quantidade}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {equipamento.professor}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{equipamento.turma}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{equipamento.dataRetirada}</div>
                          <div className="text-slate-500">{equipamento.horaRetirada}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={equipamento.status === "Em uso" ? "outline" : "default"}
                          className={
                            equipamento.status === "Em uso"
                              ? "border-orange-500 text-orange-500"
                              : "bg-green-100 text-green-800 hover:bg-green-100"
                          }
                        >
                          {equipamento.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {equipamento.status === "Em uso" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedEquipamento(equipamento);
                                setIsDevolvendo(true);
                                setAssinatura(null);
                                setAssinaturaConfirmada(false);
                              }}
                            >
                              Devolver
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500 border-red-200 hover:bg-red-50"
                              onClick={() => handleDeleteEquipamento(equipamento.id)}
                            >
                              <Trash className="h-4 w-4" />
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

        {/* Dialog para devolução de equipamentos */}
        <Dialog open={isDevolvendo} onOpenChange={setIsDevolvendo}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Devolução de Equipamentos</DialogTitle>
              <DialogDescription>Confirme a devolução dos equipamentos.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {selectedEquipamento && (
                <div className="rounded-lg border p-4 bg-slate-50">
                  <h4 className="font-medium mb-2">Detalhes do Empréstimo</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-slate-500">Tipo</p>
                      <p>{selectedEquipamento.tipo}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Quantidade</p>
                      <p>{selectedEquipamento.quantidade}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Professor</p>
                      <p>{selectedEquipamento.professor}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Turma</p>
                      <p>{selectedEquipamento.turma}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Data de Retirada</p>
                      <p>
                        {selectedEquipamento.dataRetirada} às {selectedEquipamento.horaRetirada}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={handleInputChange}
                  placeholder="Alguma observação sobre a devolução?"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="assinatura">Assinatura Digital</Label>
                <SignaturePad
                  onSave={handleAssinaturaConfirmada}
                  height={150}
                  isConfirmed={assinaturaConfirmada}
                />
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDevolvendo(false);
                  setAssinatura(null);
                  setAssinaturaConfirmada(false);
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="default"
                className="bg-purple-600 hover:bg-purple-700"
                onClick={handleDevolucao}
              >
                Confirmar Devolução
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
