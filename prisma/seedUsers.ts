import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function createUser(
    nome: string,
    email: string,
    senha: string,
    perfil: string,
    telefone: string
) {
    return await prisma.users.create({
        data: { nome, email, telefone, senha, perfil },
    });
}

async function main() {
    await createUser("direção", "direcao@gmail.com", "senha123", "direcao", "000000000")
    await createUser("professor", "professor@gmail.com", "senha123", "professor", "111111111")
    await createUser("Administrador", "administrador@escola.com", "senha123", "admin", "222222222")
    console.log("usuário criado");
}

main()