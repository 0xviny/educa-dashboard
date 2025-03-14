"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/layout";
import { v4 as uuidv4 } from "uuid";
import useLocalStorage from "@/hooks/useLocalStorage";

export default function Page() {
  const [authToken, setAuthToken] = useLocalStorage<string>("authToken", "");
  const [isLogged, setIsLogged] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fade, setFade] = useState("opacity-0");

  useEffect(() => {
    if (authToken) {
      setIsLogged(true);
    }
    setLoading(false);
    setTimeout(() => setFade("opacity-100"), 50); // Ativa o fade-in logo depois de carregar
  }, [authToken]);

  const handleLogin = () => {
    setFade("opacity-0"); // Ativa o fade-out antes de mudar de tela
    setTimeout(() => {
      const token = uuidv4();
      setAuthToken(token);
      setIsLogged(true);
    }, 300); // Muda para o Dashboard depois do fade-out
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-xl">Carregando...</div>;
  }

  if (isLogged) {
    return <DashboardLayout />;
  }

  return (
    <main className={`flex items-center justify-center transition-opacity duration-300 ${fade}`}>
      <div className="flex flex-col justify-center bg-zinc-950 text-white p-8 rounded-2xl shadow-lg w-full max-w-lg h-[600px] relative mt-20">
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
  );
}
