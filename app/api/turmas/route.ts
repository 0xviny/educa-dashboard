import prisma from "@/prisma/prisma";

export async function GET() {
  try {
    const turmas = await prisma.turmas.findMany();
    return new Response(JSON.stringify(turmas), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify([]), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
