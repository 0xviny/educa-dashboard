import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function createUser(
    nome: string,
    turma: string,
    periodo: string,
) {
    return await prisma.turmas.create({
        data: { nome, turma, periodo },
    });
}

async function main() {
    await createUser("3° Ano DS", "3° Ano", "Manhã")
    await createUser("3° Ano A", "3° Ano", "Manhã")
    await createUser("3° Ano B", "3° Ano", "Manhã")
    await createUser("3° Ano C", "3° Ano", "Manhã")
    console.log("Turma criada");
}

main()