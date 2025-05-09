"use client";

import { useState, useEffect } from "react";
import { Download, Save } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Header } from "@/components/header";
import { useToast } from "@/hooks/use-toast";
import { getAdvertencias, getEquipamentos } from "@/lib/storage-service";

export default function RelatoriosPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("advertencias");
  const [periodoFiltro, setPeriodoFiltro] = useState("mes");
  const [advertencias, setAdvertencias] = useState<any[]>([]);
  const [equipamentos, setEquipamentos] = useState<any[]>([]);

  useEffect(() => {
    // Carregar dados
    const advertenciasData = getAdvertencias();
    const equipamentosData = getEquipamentos();

    setAdvertencias(advertenciasData);
    setEquipamentos(equipamentosData);
  }, []);

  // Função para exportar dados como CSV
  const exportarCSV = (dados: any[], nomeArquivo: string) => {
    if (dados.length === 0) {
      toast({
        title: "Erro ao exportar",
        description: "Não há dados para exportar",
        variant: "destructive",
      });
      return;
    }

    // Obter cabeçalhos (chaves do primeiro objeto)
    const headers = Object.keys(dados[0]);

    // Criar linhas de dados
    const csvRows = [
      // Cabeçalho
      headers.join(","),
      // Dados
      ...dados.map((row) =>
        headers
          .map((header) => {
            // Tratar valores que podem conter vírgulas
            let value = row[header];
            if (typeof value === "string" && value.includes(",")) {
              value = `"${value}"`;
            }
            return value;
          })
          .join(",")
      ),
    ];

    // Criar blob e link para download
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${nomeArquivo}_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Exportação concluída",
      description: `Os dados foram exportados para ${nomeArquivo}.csv`,
    });
  };

  // Função para calcular estatísticas de advertências
  const calcularEstatisticasAdvertencias = () => {
    const total = advertencias.length;
    const pendentes = advertencias.filter((adv) => adv.status === "Pendente").length;
    const assinadas = advertencias.filter((adv) => adv.status === "Assinada").length;

    // Agrupar por turma
    const porTurma: Record<string, number> = {};
    advertencias.forEach((adv) => {
      const turma = adv.turma || "Não especificada";
      porTurma[turma] = (porTurma[turma] || 0) + 1;
    });

    // Agrupar por mês
    const porMes: Record<string, number> = {};
    advertencias.forEach((adv) => {
      const data = new Date(adv.data);
      const mes = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;
      porMes[mes] = (porMes[mes] || 0) + 1;
    });

    return {
      total,
      pendentes,
      assinadas,
      porTurma,
      porMes,
    };
  };

  // Função para calcular estatísticas de equipamentos
  const calcularEstatisticasEquipamentos = () => {
    const total = equipamentos.length;
    const emUso = equipamentos.filter((eq) => eq.status === "Em uso").length;
    const devolvidos = equipamentos.filter((eq) => eq.status === "Devolvido").length;

    // Agrupar por tipo
    const porTipo: Record<string, number> = {};
    equipamentos.forEach((eq) => {
      const tipo = eq.tipo || "Não especificado";
      porTipo[tipo] = (porTipo[tipo] || 0) + 1;
    });

    // Agrupar por turma
    const porTurma: Record<string, number> = {};
    equipamentos.forEach((eq) => {
      const turma = eq.turma || "Não especificada";
      porTurma[turma] = (porTurma[turma] || 0) + 1;
    });

    return {
      total,
      emUso,
      devolvidos,
      porTipo,
      porTurma,
    };
  };

  // Renderizar gráficos (simulados com divs coloridos)
  const renderizarGraficoBarras = (dados: Record<string, number>, titulo: string) => {
    const entries = Object.entries(dados);
    const max = Math.max(...Object.values(dados));

    return (
      <div className="mt-4">
        <h3 className="text-sm font-medium mb-2">{titulo}</h3>
        <div className="space-y-2">
          {entries.map(([chave, valor]) => (
            <div key={chave} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>{chave}</span>
                <span>{valor}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full"
                  style={{ width: `${(valor / max) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderizarGraficoPizza = (
    dados: Record<string, number>,
    titulo: string,
    cores: string[]
  ) => {
    const entries = Object.entries(dados);
    const total = Object.values(dados).reduce((a, b) => a + b, 0);

    return (
      <div className="mt-4">
        <h3 className="text-sm font-medium mb-2">{titulo}</h3>
        <div className="flex items-center justify-center">
          <div className="relative w-32 h-32">
            {/* Simulação de gráfico de pizza com divs */}
            <div className="absolute inset-0 rounded-full bg-slate-100 flex items-center justify-center">
              <span className="text-xs font-medium">{total}</span>
            </div>
            {entries.map(([chave, valor], index) => {
              const porcentagem = (valor / total) * 100;
              return (
                <div
                  key={chave}
                  className="absolute top-0 left-0 w-full h-full"
                  style={{
                    clipPath: `polygon(50% 50%, 50% 0%, ${
                      50 + 50 * Math.cos(2 * Math.PI * (porcentagem / 100))
                    }% ${50 - 50 * Math.sin(2 * Math.PI * (porcentagem / 100))}%, 50% 50%)`,
                  }}
                >
                  <div
                    className="w-full h-full rounded-full"
                    style={{ backgroundColor: cores[index % cores.length] }}
                  ></div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {entries.map(([chave, valor], index) => (
            <div key={chave} className="flex items-center text-xs">
              <div
                className="w-3 h-3 mr-1 rounded-sm"
                style={{ backgroundColor: cores[index % cores.length] }}
              ></div>
              <span>
                {chave}: {valor} ({((valor / total) * 100).toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Estatísticas calculadas
  const estatisticasAdvertencias = calcularEstatisticasAdvertencias();
  const estatisticasEquipamentos = calcularEstatisticasEquipamentos();

  // Cores para gráficos
  const cores = ["#7c3aed", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-primary">Relatórios e Estatísticas</h1>
            <p className="text-slate-600">Visualize dados e tendências do sistema.</p>
          </div>
          <div className="flex gap-2">
            <Select value={periodoFiltro} onValueChange={setPeriodoFiltro}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semana">Última semana</SelectItem>
                <SelectItem value="mes">Último mês</SelectItem>
                <SelectItem value="trimestre">Último trimestre</SelectItem>
                <SelectItem value="ano">Último ano</SelectItem>
                <SelectItem value="todos">Todos os dados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="advertencias">Advertências</TabsTrigger>
            <TabsTrigger value="equipamentos">Equipamentos</TabsTrigger>
          </TabsList>

          <TabsContent value="advertencias" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total de Advertências</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{estatisticasAdvertencias.total}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{estatisticasAdvertencias.pendentes}</div>
                  <p className="text-xs text-slate-500">
                    {(
                      (estatisticasAdvertencias.pendentes / estatisticasAdvertencias.total) * 100 ||
                      0
                    ).toFixed(1)}
                    % do total
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Assinadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{estatisticasAdvertencias.assinadas}</div>
                  <p className="text-xs text-slate-500">
                    {(
                      (estatisticasAdvertencias.assinadas / estatisticasAdvertencias.total) * 100 ||
                      0
                    ).toFixed(1)}
                    % do total
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Advertências por Turma</CardTitle>
                  <CardDescription>Distribuição de advertências por turma</CardDescription>
                </CardHeader>
                <CardContent>
                  {renderizarGraficoBarras(
                    estatisticasAdvertencias.porTurma,
                    "Quantidade por turma"
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const dados = Object.entries(estatisticasAdvertencias.porTurma).map(
                        ([turma, quantidade]) => ({
                          turma,
                          quantidade,
                        })
                      );
                      exportarCSV(dados, "advertencias_por_turma");
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Exportar dados
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status das Advertências</CardTitle>
                  <CardDescription>Proporção de advertências por status</CardDescription>
                </CardHeader>
                <CardContent>
                  {renderizarGraficoPizza(
                    {
                      Pendentes: estatisticasAdvertencias.pendentes,
                      Assinadas: estatisticasAdvertencias.assinadas,
                    },
                    "Distribuição por status",
                    cores
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportarCSV(advertencias, "advertencias_completo")}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Exportar todas as advertências
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="equipamentos" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total de Empréstimos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{estatisticasEquipamentos.total}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Em Uso</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{estatisticasEquipamentos.emUso}</div>
                  <p className="text-xs text-slate-500">
                    {(
                      (estatisticasEquipamentos.emUso / estatisticasEquipamentos.total) * 100 || 0
                    ).toFixed(1)}
                    % do total
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Devolvidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{estatisticasEquipamentos.devolvidos}</div>
                  <p className="text-xs text-slate-500">
                    {(
                      (estatisticasEquipamentos.devolvidos / estatisticasEquipamentos.total) *
                        100 || 0
                    ).toFixed(1)}
                    % do total
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Equipamentos por Tipo</CardTitle>
                  <CardDescription>Distribuição de equipamentos por tipo</CardDescription>
                </CardHeader>
                <CardContent>
                  {renderizarGraficoPizza(
                    estatisticasEquipamentos.porTipo,
                    "Distribuição por tipo",
                    cores
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const dados = Object.entries(estatisticasEquipamentos.porTipo).map(
                        ([tipo, quantidade]) => ({
                          tipo,
                          quantidade,
                        })
                      );
                      exportarCSV(dados, "equipamentos_por_tipo");
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Exportar dados
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Equipamentos por Turma</CardTitle>
                  <CardDescription>Distribuição de equipamentos por turma</CardDescription>
                </CardHeader>
                <CardContent>
                  {renderizarGraficoBarras(
                    estatisticasEquipamentos.porTurma,
                    "Quantidade por turma"
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportarCSV(equipamentos, "equipamentos_completo")}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Exportar todos os equipamentos
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Backup e Exportação de Dados</CardTitle>
              <CardDescription>
                Faça backup dos dados do sistema ou exporte-os para análise externa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium mb-2">Backup Completo</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Faça backup de todos os dados do sistema em um único arquivo JSON.
                  </p>
                  <Button
                    onClick={() => {
                      // Obter todos os dados do localStorage
                      const backup: Record<string, any> = {};
                      for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        if (key && key.startsWith("educa_dashboard_")) {
                          try {
                            backup[key] = JSON.parse(localStorage.getItem(key) || "[]");
                          } catch (e) {
                            backup[key] = localStorage.getItem(key);
                          }
                        }
                      }

                      // Criar blob e link para download
                      const blob = new Blob([JSON.stringify(backup, null, 2)], {
                        type: "application/json",
                      });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.setAttribute("href", url);
                      link.setAttribute(
                        "download",
                        `educa_dashboard_backup_${new Date().toISOString().split("T")[0]}.json`
                      );
                      link.style.visibility = "hidden";
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);

                      toast({
                        title: "Backup concluído",
                        description: "O backup completo foi gerado com sucesso",
                      });
                    }}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Gerar Backup Completo
                  </Button>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Restaurar Backup</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Restaure um backup previamente salvo. Isso substituirá todos os dados atuais.
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      id="backup-file"
                      accept=".json"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        const reader = new FileReader();
                        reader.onload = (event) => {
                          try {
                            const backup = JSON.parse(event.target?.result as string);

                            // Restaurar dados
                            Object.entries(backup).forEach(([key, value]) => {
                              localStorage.setItem(key, JSON.stringify(value));
                            });

                            toast({
                              title: "Backup restaurado",
                              description:
                                "Os dados foram restaurados com sucesso. Recarregue a página para ver as alterações.",
                            });
                          } catch (error) {
                            toast({
                              title: "Erro ao restaurar",
                              description: "O arquivo de backup é inválido",
                              variant: "destructive",
                            });
                          }
                        };
                        reader.readAsText(file);
                      }}
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById("backup-file")?.click()}
                    >
                      Selecionar Arquivo
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        const inputElement = document.getElementById(
                          "backup-file"
                        ) as HTMLInputElement;
                        if (inputElement?.files?.length) {
                          // Trigger the onChange event
                          const event = new Event("change", { bubbles: true });
                          inputElement.dispatchEvent(event);
                        } else {
                          toast({
                            title: "Nenhum arquivo selecionado",
                            description: "Selecione um arquivo de backup para restaurar",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      Restaurar Backup
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
