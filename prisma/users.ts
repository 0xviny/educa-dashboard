import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export interface Usuario {
    id: string;
    name: string;
    email: string;
    password: string;
    perfil: string;
}

export const getUsuarios = async () => {
  return await prisma.users.findMany();
}

export const getUsuario = async (id: string) => {
  return await prisma.users.findUnique({ where: { id } });
}

export const getUsuarioByEmail = async (email: string) => {
  return await prisma.users.findUnique({ where: { email } });
}

export const saveUsuario = async (usuario: Omit<Usuario, "id">) => {
  return await prisma.users.create({ data: usuario });
}

export const updateUsuario = async (usuario: Usuario) => {
  return await prisma.users.update({ where: { id: usuario.id }, data: usuario });
}

export const deleteUsuario = async (id: string) => {
  return await prisma.users.delete({ where: { id } });
}

