import prisma from "@/prisma/prisma";

export async function GET() {
  try {
    const equipamentos = await prisma.equipamento.findMany();
    return new Response(JSON.stringify(equipamentos), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Erro interno ao listar equipamentos" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tipo = String(body.tipo ?? "").trim();
    const quantidade = Number(body.quantidade ?? 0);
    const professor = String(body.professor ?? "").trim();
    const turma = String(body.turma ?? "").trim();
    const dataRetirada = String(body.dataRetirada ?? "").trim();
    const horaRetirada = String(body.horaRetirada ?? "").trim();
    const observacoes = body.observacoes ?? null;
    const assinatura = body.assinatura ?? null;
    if (!tipo || !professor || !turma || !dataRetirada || !horaRetirada || quantidade <= 0) {
      return new Response(
        JSON.stringify({ message: "Dados inválidos. Campos obrigatórios ausentes." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    let numerosSerie: string[] = [];
    if (Array.isArray(body.numerosSerie)) {
      numerosSerie = body.numerosSerie.map((s: any) => String(s).trim()).filter(Boolean);
    } else if (typeof body.numerosSerie === "string") {
      numerosSerie = body.numerosSerie
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);
    }
    const equipamento = await prisma.equipamento.create({
      data: {
        tipo,
        quantidade,
        numerosSerie,
        professor,
        turma,
        dataRetirada,
        horaRetirada,
        status: "Em uso",
        observacoes,
        assinatura,
        dataDevolucao: null,
        horaDevolucao: null,
      },
    });
    return new Response(JSON.stringify(equipamento), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Erro interno ao salvar equipamento." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
