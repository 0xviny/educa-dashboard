import prisma from "@/prisma/prisma";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const dataToUpdate: any = {};
    if (body.tipo !== undefined) dataToUpdate.tipo = String(body.tipo);
    if (body.quantidade !== undefined) dataToUpdate.quantidade = Number(body.quantidade);
    if (body.numerosSerie !== undefined)
      dataToUpdate.numerosSerie = Array.isArray(body.numerosSerie)
        ? body.numerosSerie.map((s: any) => String(s))
        : String(body.numerosSerie)
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean);
    if (body.professor !== undefined) dataToUpdate.professor = String(body.professor);
    if (body.turma !== undefined) dataToUpdate.turma = String(body.turma);
    if (body.dataRetirada !== undefined) dataToUpdate.dataRetirada = String(body.dataRetirada);
    if (body.horaRetirada !== undefined) dataToUpdate.horaRetirada = String(body.horaRetirada);
    if (body.status !== undefined) dataToUpdate.status = String(body.status);
    if (body.dataDevolucao !== undefined)
      dataToUpdate.dataDevolucao = body.dataDevolucao === null ? null : String(body.dataDevolucao);
    if (body.horaDevolucao !== undefined)
      dataToUpdate.horaDevolucao = body.horaDevolucao === null ? null : String(body.horaDevolucao);
    if (body.observacoes !== undefined)
      dataToUpdate.observacoes = body.observacoes === null ? null : String(body.observacoes);
    if (body.assinatura !== undefined)
      dataToUpdate.assinatura = body.assinatura === null ? null : String(body.assinatura);
    const equipamento = await prisma.equipamento.update({ where: { id }, data: dataToUpdate });
    return new Response(JSON.stringify(equipamento), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Erro interno ao atualizar equipamento" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    await prisma.equipamento.delete({ where: { id } });
    return new Response(JSON.stringify({ message: "Excluído" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Erro interno ao excluir equipamento" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
