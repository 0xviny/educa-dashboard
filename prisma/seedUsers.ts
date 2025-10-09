import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function createUser(
    nome: string,
    email: string,
    senha: string,
    perfil: string
) {
    return await prisma.users.create({
        data: { nome, email, senha, perfil },
    });
}

async function main() {
    await createUser("direção", "direcao@gmail.com", "senha123", "direcao")
    await createUser("professor", "professor@gmail.com", "senha123", "professor")
    await createUser("Administrador", "administrador@gmail.com", "senha123", "professor")
    console.log("usuário criado");
}

main()