import prisma from "@/prisma/prisma";

export async function GET() {
  try {
    const rows = await prisma.advertencias.findMany({ orderBy: { data: "desc" } });
    const mapped = rows.map((r) => {
      let extras: any = {};
      try {
        extras = r.detalhes ? JSON.parse(r.detalhes) : {};
      } catch {
        extras = {};
      }
      return {
        id: r.id,
        aluno: r.alunoNome,
        turma: r.turma,
        data: r.data,
        motivo: r.motivo,
        detalhes: extras.detalhes ?? null,
        // preferir coluna status do DB; fallback para JSON em 'detalhes' e por último "Pendente"
        status: extras.status ?? "Pendente",
        gravidade: extras.gravidade ?? null,
        professor: r.professor,
        assinaturas: extras.assinaturas ?? (r.assinatura ? { professor: r.assinatura } : {}),
      };
    });
    return new Response(JSON.stringify(mapped), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Erro GET /api/advertencias:", error);
    return new Response(JSON.stringify({ message: "Erro interno" }), { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const aluno = String(body.aluno ?? body.nomeAluno ?? "").trim();
    const turma = String(body.turma ?? "").trim();
    const motivo = String(body.motivo ?? "").trim();
    const data = String(body.data ?? new Date().toISOString().split("T")[0]);
    const professor = String(body.professor ?? "").trim();
    if (!aluno || !turma || !motivo) {
      return new Response(JSON.stringify({ message: "Campos obrigatórios ausentes" }), { status: 400 });
    }

    const extras = {
      detalhes: body.detalhes ?? null,
      status: body.status ?? "Pendente",
      gravidade: body.gravidade ?? null,
      assinaturas: body.assinaturas ?? null,
    };

    const created = await prisma.advertencias.create({
      data: {
        alunoNome: aluno,
        turma,
        motivo,
        // persistir JSON com extras (status será mantido dentro de 'detalhes')
        detalhes: JSON.stringify(extras),
        data,
        professor,
        status: extras.status ?? "Pendente",
        assinatura: body.assinaturas?.professor ?? null,
      },
    });

    return new Response(
      JSON.stringify({
        id: created.id,
        aluno: created.alunoNome,
        turma: created.turma,
        data: created.data,
        motivo: created.motivo,
        detalhes: extras.detalhes,
        status: extras.status ?? "Pendente",
        gravidade: extras.gravidade,
        professor: created.professor,
        assinaturas: extras.assinaturas ?? (created.assinatura ? { professor: created.assinatura } : {}),
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Erro POST /api/advertencias:", error);
    return new Response(JSON.stringify({ message: "Erro ao salvar" }), { status: 500 });
  }
}