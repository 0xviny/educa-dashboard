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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-tl from-white/75 to-blue-500">
      <div className="flex flex-col justify-center bg-black/50 text-white p-8 rounded-2xl shadow-lg w-full max-w-lg h-[600px] relative">
        <h1 className="text-center text-2xl font-bold mb-2">EDUCA:DASH</h1>
        <p className="text-center text-lg mb-6">Olá, 👋 Bem-vindo de volta!</p>
        <p className="text-center text-sm mb-4">Por favor, preencha os campos abaixo:</p>

        <div className="mb-4">
          <label className="block text-sm mb-1">RG - Registro do Professor</label>
          <input
            type="text"
            placeholder="Por favor, insira o seu RG do professor"
            className="w-full p-3 bg-gray-800 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-400"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm mb-1">Senha</label>
          <input
            type="password"
            placeholder="Por favor, insira sua senha"
            className="w-full p-3 bg-gray-800 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-400"
          />
        </div>

        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 hover:bg-blue-500/75 text-white font-bold py-3 rounded-lg transition cursor-pointer"
        >
          Entrar
        </button>

        <p className="text-center text-xs text-gray-400 mt-4">
          Este é um projeto fictício para demonstrar um sistema para ajudar a escola em sua gestão
          de Controle de Advertências e Controle de Notebooks e Tablets da escola. Projeto criado
          por: <span className="text-blue-400 cursor-pointer">3° DS @ 2025</span>
        </p>
      </div>
    </div>
  );
}
