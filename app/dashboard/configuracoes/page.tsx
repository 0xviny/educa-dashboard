// components/pages/configuracoes/ConfiguracoesPage.tsx
"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  Save,
  User,
  Lock,
  School,
  Mail,
  Phone,
  MapPin,
  Download,
  Upload,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Escola, Sistema, User as UserTypes } from "@/types";

export default function ConfiguracoesPage() {
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("perfil");
  const [isLoading, setIsLoading] = useState(true);

  const [perfilForm, setPerfilForm] = useState<UserTypes>({
    nome: user?.nome ?? "Administrador",
    email: user?.email ?? "admin@escola.com",
    telefone: user?.telefone ?? "(12) 98765-4321",
    perfil:
      user?.perfil === "direcao"
        ? "Diretor"
        : user?.perfil === "professor"
        ? "Professor"
        : "Administrador",
  });

  const [escolaForm, setEscolaForm] = useState<Escola>({
    nome: user?.escola?.nome ?? "E.E. PROFESSOR ÁLVARO ORTIZ",
    endereco: user?.escola?.endereco ?? "Rua André Cursino dos Santos s/n - Bairro do São Gonçalo",
    cidade: user?.escola?.cidade ?? "Taubaté",
    estado: user?.escola?.estado ?? "SP",
    cep: user?.escola?.cep ?? "12092-090",
    telefone: user?.escola?.telefone ?? "(12) 3621-1011",
    email: user?.escola?.email ?? "e011908a@educacao.sp.gov.br",
    diretor: user?.escola?.diretor ?? "João Silva",
    viceDiretor: user?.escola?.viceDiretor ?? "Maria Oliveira",
  });

  const [sistemaForm, setSystemForm] = useState<Sistema>({
    notificacoesEmail: user?.sistema?.notificacoesEmail ?? false,
    notificacoesApp: user?.sistema?.notificacoesApp ?? false,
    backupAutomatico: user?.sistema?.backupAutomatico ?? false,
    intervaloBackup: user?.sistema?.intervaloBackup ?? "0",
    logAcesso: user?.sistema?.logAcesso ?? false,
  });

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    (async () => {
      try {
        const localPerfil = localStorage.getItem(`config_perfil_${user.id}`);
        if (localPerfil) {
          setPerfilForm(JSON.parse(localPerfil));
        } else {
          setPerfilForm({
            nome: user.nome,
            email: user.email,
            telefone: user.telefone ?? "(12) 98765-4321",
            perfil:
              user.perfil === "direcao"
                ? "Diretor"
                : user.perfil === "professor"
                ? "Professor"
                : "Administrador",
          });
        }

        const localEscola = localStorage.getItem(`config_escola_${user.id}`);
        if (localEscola) {
          setEscolaForm(JSON.parse(localEscola));
        }

        const localSistema = localStorage.getItem(`config_sistema_${user.id}`);
        if (localSistema) {
          setSystemForm(JSON.parse(localSistema));
        }

        const res = await fetch(`/api/usuarios/config?id=${encodeURIComponent(user.id!)}`);
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setPerfilForm((prev) => ({
              nome: data.nome ?? prev.nome,
              email: data.email ?? prev.email,
              telefone: data.telefone ?? prev.telefone,
              perfil:
                data.perfil === "direcao"
                  ? "Diretor"
                  : data.perfil === "professor"
                  ? "Professor"
                  : "Administrador",
            }));
            if (data.escola) {
              setEscolaForm({
                nome: data.escola.nome ?? escolaForm.nome,
                endereco: data.escola.endereco ?? escolaForm.endereco,
                cidade: data.escola.cidade ?? escolaForm.cidade,
                estado: data.escola.estado ?? escolaForm.estado,
                cep: data.escola.cep ?? escolaForm.cep,
                telefone: data.escola.telefone ?? escolaForm.telefone,
                email: data.escola.email ?? escolaForm.email,
                diretor: data.escola.diretor ?? escolaForm.diretor,
                viceDiretor: data.escola.viceDiretor ?? escolaForm.viceDiretor,
              });
            }
            if (data.sistema) {
              setSystemForm({
                notificacoesEmail: data.sistema.notificacoesEmail ?? sistemaForm.notificacoesEmail,
                notificacoesApp: data.sistema.notificacoesApp ?? sistemaForm.notificacoesApp,
                backupAutomatico: data.sistema.backupAutomatico ?? sistemaForm.backupAutomatico,
                intervaloBackup: data.sistema.intervaloBackup ?? sistemaForm.intervaloBackup,
                logAcesso: data.sistema.logAcesso ?? sistemaForm.logAcesso,
              });
            }
          }
        }
      } catch (error) {
        toast({
          title: "Erro ao carregar configurações",
          description: "Ocorreu um erro ao carregar suas configurações",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    })();
  }, [user]);

  const handlePerfilChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPerfilForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEscolaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEscolaForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSistemaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSystemForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setSystemForm((prev) => ({ ...prev, [name]: checked }));
  };

  const saveToServer = async (payload: any) => {
    if (!user) return { ok: false };
    try {
      const res = await fetch("/api/usuarios/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        return { ok: false, status: res.status };
      }
      const data = await res.json();
      return { ok: true, data };
    } catch (error) {
      return { ok: false };
    }
  };

  const savePerfilConfig = async () => {
    if (!user) return;
    try {
      localStorage.setItem(`config_perfil_${user.id}`, JSON.stringify(perfilForm));
      const payload = {
        id: user.id,
        nome: perfilForm.nome,
        email: perfilForm.email,
        telefone: perfilForm.telefone,
        perfil:
          perfilForm.perfil === "Diretor"
            ? "direcao"
            : perfilForm.perfil === "Professor"
            ? "professor"
            : "admin",
      };
      const result = await saveToServer(payload);
      if (result.ok) {
        toast({
          title: "Perfil atualizado",
          description: "Suas informações de perfil foram atualizadas com sucesso.",
        });
      } else {
        toast({
          title: "Erro ao salvar",
          description: "Ocorreu um erro ao salvar suas informações de perfil",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar suas informações de perfil",
        variant: "destructive",
      });
    }
  };

  const saveEscolaConfig = async () => {
    if (!user) return;
    try {
      localStorage.setItem(`config_escola_${user.id}`, JSON.stringify(escolaForm));
      const payload = {
        id: user.id,
        escola: {
          nome: escolaForm.nome,
          endereco: escolaForm.endereco,
          cidade: escolaForm.cidade,
          estado: escolaForm.estado,
          cep: escolaForm.cep,
          telefone: escolaForm.telefone,
          email: escolaForm.email,
          diretor: escolaForm.diretor,
          viceDiretor: escolaForm.viceDiretor,
        },
      };
      const result = await saveToServer(payload);
      if (result.ok) {
        toast({
          title: "Dados da escola atualizados",
          description: "As informações da escola foram atualizadas com sucesso.",
        });
      } else {
        toast({
          title: "Erro ao salvar",
          description: "Ocorreu um erro ao salvar as informações da escola",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar as informações da escola",
        variant: "destructive",
      });
    }
  };

  const saveSistemaConfig = async () => {
    if (!user) return;
    try {
      localStorage.setItem(`config_sistema_${user.id}`, JSON.stringify(sistemaForm));
      const payload = {
        id: user.id,
        sistema: {
          notificacoesEmail: sistemaForm.notificacoesEmail,
          notificacoesApp: sistemaForm.notificacoesApp,
          backupAutomatico: sistemaForm.backupAutomatico,
          intervaloBackup: sistemaForm.intervaloBackup,
          logAcesso: sistemaForm.logAcesso,
        },
      };
      const result = await saveToServer(payload);
      if (result.ok) {
        toast({
          title: "Configurações do sistema atualizadas",
          description: "As configurações do sistema foram atualizadas com sucesso.",
        });
      } else {
        toast({
          title: "Erro ao salvar",
          description: "Ocorreu um erro ao salvar as configurações do sistema",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar as configurações do sistema",
        variant: "destructive",
      });
    }
  };

  const exportarConfiguracoes = () => {
    if (!user) return;
    try {
      const configuracoes = {
        perfil: perfilForm,
        escola: escolaForm,
        sistema: sistemaForm,
      };
      const blob = new Blob([JSON.stringify(configuracoes, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `configuracoes_${perfilForm.nome.replace(/\s+/g, "_").toLowerCase()}.json`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({
        title: "Configurações exportadas",
        description: "Suas configurações foram exportadas com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Ocorreu um erro ao exportar suas configurações",
        variant: "destructive",
      });
    }
  };

  const importarConfiguracoes = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        if (!event.target || typeof event.target.result !== "string") return;
        const configuracoes = JSON.parse(event.target.result);
        if (configuracoes.perfil) {
          setPerfilForm(configuracoes.perfil);
          localStorage.setItem(`config_perfil_${user.id}`, JSON.stringify(configuracoes.perfil));
        }
        if (configuracoes.escola) {
          setEscolaForm(configuracoes.escola);
          localStorage.setItem(`config_escola_${user.id}`, JSON.stringify(configuracoes.escola));
        }
        if (configuracoes.sistema) {
          setSystemForm(configuracoes.sistema);
          localStorage.setItem(`config_sistema_${user.id}`, JSON.stringify(configuracoes.sistema));
        }
        toast({
          title: "Configurações importadas",
          description: "Suas configurações foram importadas com sucesso",
        });
      } catch (error) {
        toast({
          title: "Erro na importação",
          description: "O arquivo selecionado não é válido",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-slate-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-purple-600">Configurações</h1>
            <p className="text-slate-600">Gerencie as configurações do sistema e do seu perfil.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
            <Button variant="outline" size="sm" onClick={exportarConfiguracoes}>
              <Download className="mr-2 h-4 w-4" />
              Exportar Configurações
            </Button>
            <div className="relative">
              <input
                type="file"
                id="importConfig"
                className="sr-only"
                accept=".json"
                onChange={importarConfiguracoes}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("importConfig")?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Importar Configurações
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="perfil">Perfil</TabsTrigger>
            <TabsTrigger value="escola">Escola</TabsTrigger>
            <TabsTrigger value="sistema">Sistema</TabsTrigger>
          </TabsList>

          <TabsContent value="perfil">
            <Card>
              <CardHeader>
                <CardTitle>Informações de Perfil</CardTitle>
                <CardDescription>Atualize suas informações pessoais e de contato.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <div className="flex">
                    <User className="mr-2 h-4 w-4 mt-3 text-slate-500" />
                    <Input
                      id="nome"
                      name="nome"
                      value={perfilForm.nome}
                      onChange={handlePerfilChange}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <div className="flex">
                    <Mail className="mr-2 h-4 w-4 mt-3 text-slate-500" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={perfilForm.email}
                      onChange={handlePerfilChange}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="telefone">Telefone</Label>
                  <div className="flex">
                    <Phone className="mr-2 h-4 w-4 mt-3 text-slate-500" />
                    <Input
                      id="telefone"
                      name="telefone"
                      value={perfilForm.telefone}
                      onChange={handlePerfilChange}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="cargo">Cargo</Label>
                  <div className="flex">
                    <School className="mr-2 h-4 w-4 mt-3 text-slate-500" />
                    <Input
                      id="cargo"
                      name="perfil"
                      value={perfilForm.perfil}
                      onChange={handlePerfilChange}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="senha">Alterar Senha</Label>
                  <div className="flex">
                    <Lock className="mr-2 h-4 w-4 mt-3 text-slate-500" />
                    <Input id="senha" name="senha" type="password" placeholder="Nova senha" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
                  <div className="flex">
                    <Lock className="mr-2 h-4 w-4 mt-3 text-slate-500" />
                    <Input
                      id="confirmarSenha"
                      name="confirmarSenha"
                      type="password"
                      placeholder="Confirme a nova senha"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={savePerfilConfig} className="bg-purple-600 hover:bg-purple-700">
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="escola">
            <Card>
              <CardHeader>
                <CardTitle>Informações da Escola</CardTitle>
                <CardDescription>Atualize as informações da instituição de ensino.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="nomeEscola">Nome da Escola</Label>
                  <div className="flex">
                    <School className="mr-2 h-4 w-4 mt-3 text-slate-500" />
                    <Input
                      id="nome"
                      name="nome"
                      value={escolaForm.nome}
                      onChange={handleEscolaChange}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="endereco">Endereço</Label>
                  <div className="flex">
                    <MapPin className="mr-2 h-4 w-4 mt-3 text-slate-500" />
                    <Textarea
                      id="endereco"
                      name="endereco"
                      value={escolaForm.endereco}
                      onChange={handleEscolaChange}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                      id="cidade"
                      name="cidade"
                      value={escolaForm.cidade}
                      onChange={handleEscolaChange}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="estado">Estado</Label>
                    <Input
                      id="estado"
                      name="estado"
                      value={escolaForm.estado}
                      onChange={handleEscolaChange}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="cep">CEP</Label>
                    <Input
                      id="cep"
                      name="cep"
                      value={escolaForm.cep}
                      onChange={handleEscolaChange}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="telefoneEscola">Telefone</Label>
                    <Input
                      id="telefone"
                      name="telefone"
                      value={escolaForm.telefone}
                      onChange={handleEscolaChange}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="emailEscola">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={escolaForm.email}
                    onChange={handleEscolaChange}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="diretor">Diretor</Label>
                    <Input
                      id="diretor"
                      name="diretor"
                      value={escolaForm.diretor}
                      onChange={handleEscolaChange}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="viceDiretor">Vice-Diretor</Label>
                    <Input
                      id="viceDiretor"
                      name="viceDiretor"
                      value={escolaForm.viceDiretor}
                      onChange={handleEscolaChange}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={saveEscolaConfig} className="bg-purple-600 hover:bg-purple-700">
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="sistema">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Sistema</CardTitle>
                <CardDescription>
                  Personalize as configurações do sistema de acordo com suas preferências.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Notificações</h3>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="notificacoesEmail">Notificações por Email</Label>
                      <p className="text-sm text-slate-500">
                        Receba notificações por email sobre novas advertências e empréstimos.
                      </p>
                    </div>
                    <Switch
                      id="notificacoesEmail"
                      checked={sistemaForm.notificacoesEmail}
                      onCheckedChange={(checked) =>
                        handleSwitchChange("notificacoesEmail", checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="notificacoesApp">Notificações no Aplicativo</Label>
                      <p className="text-sm text-slate-500">
                        Receba notificações no aplicativo sobre novas advertências e empréstimos.
                      </p>
                    </div>
                    <Switch
                      id="notificacoesApp"
                      checked={sistemaForm.notificacoesApp}
                      onCheckedChange={(checked) => handleSwitchChange("notificacoesApp", checked)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Backup e Segurança</h3>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="backupAutomatico">Backup Automático</Label>
                      <p className="text-sm text-slate-500">
                        Realize backups automáticos dos dados do sistema.
                      </p>
                    </div>
                    <Switch
                      id="backupAutomatico"
                      checked={sistemaForm.backupAutomatico}
                      onCheckedChange={(checked) => handleSwitchChange("backupAutomatico", checked)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="intervaloBackup">Intervalo de Backup (dias)</Label>
                    <Input
                      id="intervaloBackup"
                      name="intervaloBackup"
                      type="number"
                      min="1"
                      value={sistemaForm.intervaloBackup}
                      onChange={handleSistemaChange}
                      disabled={!sistemaForm.backupAutomatico}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="logAcesso">Registrar Log de Acesso</Label>
                      <p className="text-sm text-slate-500">
                        Mantenha um registro de todos os acessos ao sistema.
                      </p>
                    </div>
                    <Switch
                      id="logAcesso"
                      checked={sistemaForm.logAcesso}
                      onCheckedChange={(checked) => handleSwitchChange("logAcesso", checked)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={saveSistemaConfig} className="bg-purple-600 hover:bg-purple-700">
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Configurações
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
