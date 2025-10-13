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
    const { id, perfil, nome, email, telefone, escola, sistema, professores } = body;
    if (!id && !professores) return NextResponse.json({ error: "Missing id or payload" }, { status: 400 });

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

    let updatedUser = null;
    if (id) {
      updatedUser = await prisma.users.update({
        where: { id },
        data,
        include: { escola: true, sistema: true },
      });
    }

    const processedProfessores: any[] = [];
    if (Array.isArray(professores)) {
      for (const p of professores) {
        try {
          if (p.id) {
            const updated = await prisma.professores.update({
              where: { id: p.id },
              data: {
                nome: p.nome ?? undefined,
                telefone: p.telefone ?? undefined,
                escola: p.escola ?? undefined,
                email: p.email ?? undefined,
                dataNascimento: p.dataNascimento ?? undefined,
              },
            });
            processedProfessores.push(updated);
          } else {
            const created = await prisma.professores.create({
              data: {
                nome: p.nome ?? "",
                telefone: p.telefone ?? "",
                escola: p.escola ?? "",
                email: p.email ?? undefined,
                dataNascimento: p.dataNascimento ?? undefined,
              },
            });
            processedProfessores.push(created);
          }
        } catch (profErr) {
          console.error("Erro ao processar professor:", p, profErr);
        }
      }
    }

    return NextResponse.json({ user: updatedUser, professores: processedProfessores });
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return NextResponse.json({ error: "Erro ao atualizar usuário" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    // aceita também ?id=... na query (caso algum cliente não envie body em DELETE)
    const url = new URL(req.url);
    const queryId = url.searchParams.get("id");

    let body: any = {};
    try {
      body = await req.json();
    } catch (e) {
      // body vazio ou inválido — vamos lidar abaixo
    }

    let ids: string[] = [];

    if (queryId) {
      ids = [queryId];
    } else if (Array.isArray(body?.professores)) {
      // pode ser array de ids ou array de objetos { id }
      ids = body.professores.map((p: any) => (typeof p === "string" ? p : p?.id)).filter(Boolean);
    } else if (typeof body?.professores === "string") {
      ids = [body.professores];
    }

    if (ids.length === 0) {
      return NextResponse.json({ error: "Missing professores ids" }, { status: 400 });
    }

    // Deleta todos os professores cujos ids foram informados
    const result = await prisma.professores.deleteMany({
      where: { id: { in: ids } },
    });

    return NextResponse.json({ deletedCount: result.count });
  } catch (error) {
    console.error("Erro ao deletar professores:", error);
    return NextResponse.json({ error: "Erro ao deletar professores" }, { status: 500 });
  }
}
