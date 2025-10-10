// app/api/usuarios/config/route.ts
import prisma from "@/prisma/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const user = await prisma.users.findUnique({
      where: { id },
      include: { escola: true, sistema: true },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json(user);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return NextResponse.json({ error: "Erro ao buscar usuário" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, perfil, nome, email, telefone, escola, sistema } = body;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const data: any = {};
    if (nome !== undefined) data.nome = nome;
    if (email !== undefined) data.email = email;
    if (telefone !== undefined) data.telefone = telefone;
    if (perfil !== undefined) data.perfil = perfil;

    if (escola !== undefined) {
      data.escola = {
        upsert: {
          create: {
            nome: escola.nome ?? "",
            endereco: escola.endereco ?? "",
            cidade: escola.cidade ?? "",
            estado: escola.estado ?? "",
            cep: escola.cep ?? "",
            telefone: escola.telefone ?? "",
            email: escola.email ?? "",
            diretor: escola.diretor ?? "",
            viceDiretor: escola.viceDiretor ?? "",
          },
          update: {
            nome: escola.nome ?? undefined,
            endereco: escola.endereco ?? undefined,
            cidade: escola.cidade ?? undefined,
            estado: escola.estado ?? undefined,
            cep: escola.cep ?? undefined,
            telefone: escola.telefone ?? undefined,
            email: escola.email ?? undefined,
            diretor: escola.diretor ?? undefined,
            viceDiretor: escola.viceDiretor ?? undefined,
          },
        },
      };
    }

    if (sistema !== undefined) {
      data.sistema = {
        upsert: {
          create: {
            notificacoesEmail: sistema.notificacoesEmail ?? false,
            notificacoesApp: sistema.notificacoesApp ?? false,
            backupAutomatico: sistema.backupAutomatico ?? false,
            intervaloBackup: sistema.intervaloBackup ?? "7",
            logAcesso: sistema.logAcesso ?? false,
          },
          update: {
            notificacoesEmail: sistema.notificacoesEmail ?? undefined,
            notificacoesApp: sistema.notificacoesApp ?? undefined,
            backupAutomatico: sistema.backupAutomatico ?? undefined,
            intervaloBackup: sistema.intervaloBackup ?? undefined,
            logAcesso: sistema.logAcesso ?? undefined,
          },
        },
      };
    }

    const updatedUser = await prisma.users.update({
      where: { id },
      data,
      include: { escola: true, sistema: true },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return NextResponse.json({ error: "Erro ao atualizar usuário" }, { status: 500 });
  }
}
