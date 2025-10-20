import prisma from "@/prisma/prisma";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const dataToUpdate: any = {};

    if (body.aluno !== undefined) dataToUpdate.alunoNome = String(body.aluno);
    if (body.turma !== undefined) dataToUpdate.turma = String(body.turma);
    if (body.motivo !== undefined) dataToUpdate.motivo = String(body.motivo);
    if (body.data !== undefined) dataToUpdate.data = String(body.data);
    if (body.professor !== undefined) dataToUpdate.professor = String(body.professor);
    if (body.assinaturas?.professor !== undefined) dataToUpdate.assinatura = body.assinaturas.professor;

    const existing = await prisma.advertencias.findUnique({ where: { id } });
    let existingExtras: any = {};
    try {
      existingExtras = existing?.detalhes ? JSON.parse(existing.detalhes) : {};
    } catch {
      existingExtras = {};
    }
    const newExtras = {
      ...existingExtras,
      detalhes: body.detalhes ?? existingExtras.detalhes ?? null,
      status: body.status ?? existingExtras.status ?? existing?.status ?? "Pendente",
      gravidade: body.gravidade ?? existingExtras.gravidade ?? null,
      assinaturas: body.assinaturas ?? existingExtras.assinaturas ?? null,
    };

    dataToUpdate.detalhes = JSON.stringify(newExtras);
    // atualizar também a coluna status para refletir pendente/assinada
    dataToUpdate.status = newExtras.status ?? "Pendente";

    const updated = await prisma.advertencias.update({ where: { id }, data: dataToUpdate });
    return new Response(JSON.stringify({ ok: true, id: updated.id }), { status: 200 });
  } catch (error) {
    console.error("Erro PUT /api/advertencias/[id]:", error);
    return new Response(JSON.stringify({ message: "Erro ao atualizar" }), { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    await prisma.advertencias.delete({ where: { id } });
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (error) {
    console.error("Erro DELETE /api/advertencias/[id]:", error);
    return new Response(JSON.stringify({ message: "Erro ao excluir" }), { status: 500 });
  }
}