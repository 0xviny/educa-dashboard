import prisma from "@/prisma/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const usuarios = await prisma.users.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        senha: true,
        perfil: true,
      },
    });

    return NextResponse.json(usuarios);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return NextResponse.json({ error: "Erro ao buscar usuários" }, { status: 500 });
  }
}
