import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function createUser(
    name: string,
    email: string,
    password: string,
    perfil: string
) {
    return await prisma.users.create({
        data: { name, email, password, perfil },
    });
}

async function main() {
    await createUser("direção", "direcao@gmail.com", "direcao@direcao", "professor")
    console.log("usuário criado");
}

main()