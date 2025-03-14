"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/layout";

import { v4 as uuidv4 } from "uuid";

export default function Page() {
  const [isLogged, setIsLogged] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setIsLogged(true);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (isLogged) {
    return <DashboardLayout />;
  }

  const handleLogin = () => {
    const token = uuidv4();

    setIsLogged(true);
    localStorage.setItem("authToken", token);
  };

  return (
    <>
      <main className="flex items-center justify-center">
        <div className="flex flex-col justify-center bg-zinc-950 text-white p-8 rounded-2xl shadow-lg w-full max-w-lg h-[600px] relative">
          <h1 className="text-center text-2xl font-bold bg-gradient-to-tl from-purple-600 to-blue-600 text-transparent bg-clip-text mb-7">
            EDUCA DASHBOARD
          </h1>
          <p className="text-center text-lg mb-6">Olá, Seja Bem-vindo ao Dashboard!</p>
          <p className="text-center text-sm mb-4">Por favor, preencha os campos abaixo:</p>

          <div className="mb-4">
            <label className="block text-sm mb-1">RG - Registro do Professor</label>
            <input
              type="text"
              placeholder="Por favor, insira o seu RG do professor"
              className="w-full p-3 bg-zinc-950 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-400"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm mb-1">Senha</label>
            <input
              type="password"
              placeholder="Por favor, insira sua senha"
              className="w-full p-3 bg-zinc-950 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-400"
            />
          </div>

          <button
            onClick={handleLogin}
            className="w-full bg-gray-700 hover:bg-gray-700/75 text-white font-bold py-3 rounded-lg transition cursor-pointer"
          >
            Entrar
          </button>

          <p className="text-center text-xs text-gray-400 mt-5">
            Este é um projeto fictício para demonstrar um sistema para ajudar a escola em sua gestão
            de Controle de Advertências e Controle de Notebooks e Tablets da escola. Projeto criado
            por:{" "}
            <span className="bg-gradient-to-bl to-blue-600 from-purple-600 text-transparent bg-clip-text cursor-pointer">
              3° DS @ 2025
            </span>
          </p>
        </div>
      </main>
    </>
  );
}
