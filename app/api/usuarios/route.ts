import { NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma"; // caminho do seu client gerado

const prisma = new PrismaClient();

export async function GET() {
  try {
    const usuarios = await prisma.users.findMany(); // tabela Users
    return NextResponse.json(usuarios);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao buscar usuários" }, { status: 500 });
  }
}
