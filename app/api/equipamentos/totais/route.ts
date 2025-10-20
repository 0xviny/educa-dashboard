import prisma from "@/prisma/prisma";

const STOCK: Record<string, number> = {
  Tablet: 22,
  "Notebook Lenovo": 20,
  "Notebook Positivo": 30,
  "Notebook Multilaser": 40
};
export async function GET() {
  try {
    const groups = await prisma.equipamento.groupBy({ by: ["tipo", "status"], _sum: { quantidade: true } });
    const inUseByType: Record<string, number> = {};
    for (const g of groups) {
      if (g.status === "Em uso") {
        inUseByType[g.tipo] = (inUseByType[g.tipo] || 0) + (g._sum.quantidade ?? 0);
      }
    }
    const totalByType = Object.keys(STOCK).map((tipo) => {
      const stock = STOCK[tipo] ?? 0;
      const inUse = inUseByType[tipo] ?? 0;
      const available = Math.max(0, stock - inUse);
      return { tipo, stock, inUse, available };
    });
    const totalStock = Object.values(STOCK).reduce((acc, v) => acc + v, 0);
    const totalInUse = totalByType.reduce((acc, t) => acc + t.inUse, 0);
    const totalAvailable = Math.max(0, totalStock - totalInUse);
    const percentageInUse = totalStock === 0 ? 0 : Math.round((totalInUse / totalStock) * 100);
    return new Response(JSON.stringify({ totalByType, totalStock, totalInUse, totalAvailable, percentageInUse }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Erro interno ao calcular totais" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
