"use client";

import React, { useEffect, useState } from "react";
import Modal from "@/components/common/modal";
import Toast from "@/components/common/toast";
import { useNotifications } from "@/hooks/useNotifications";

interface LoanRecord {
  id: number;
  student: string;
  deviceType: string;
  deviceId: string[];
  borrowDate: Date;
}

export default function Dashboard() {
  const [userName, setUserName] = useState("Professor(a)");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [totalTablets, setTotalTablets] = useState<number>(40);
  const [totalNotebooks, setTotalNotebooks] = useState<number>(30);
  const [loanRecords, setLoanRecords] = useState<LoanRecord[]>([]);
  const [newStudent, setNewStudent] = useState<string>("");
  const [newDeviceType, setNewDeviceType] = useState<string>("Tablet");
  const [newDeviceId, setNewDeviceId] = useState<string>("");
  const { notifications, addNotification, hideNotification } = useNotifications();

  useEffect(() => {
    setUserName(localStorage.getItem("userName") || "Professor(a)");
    setTotalTablets(Number(localStorage.getItem("totalTablets")) || 40);
    setTotalNotebooks(Number(localStorage.getItem("totalNotebooks")) || 30);
    setLoanRecords(JSON.parse(localStorage.getItem("loanRecords") || "[]"));
  }, []);

  useEffect(() => {
    localStorage.setItem("loanRecords", JSON.stringify(loanRecords));
    localStorage.setItem("totalTablets", totalTablets.toString());
    localStorage.setItem("totalNotebooks", totalNotebooks.toString());
  }, [loanRecords, totalTablets, totalNotebooks]);

  const handleAddLoan = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newStudent || !newDeviceId) {
      return addNotification("Preencha todos os campos!", "error");
    }

    const deviceIdsArray = newDeviceId.split(",").map((id) => id.trim());
    if (!deviceIdsArray.every((id) => /^\d+$/.test(id))) {
      return addNotification(
        "Formato inválido! Use apenas números separados por vírgula.",
        "error"
      );
    }

    if (loanRecords.some((record) => record.deviceId.some((id) => deviceIdsArray.includes(id)))) {
      return addNotification("Dispositivo já emprestado!", "error");
    }

    if (
      (newDeviceType === "Tablet" && deviceIdsArray.length > totalTablets) ||
      (newDeviceType === "Notebook" && deviceIdsArray.length > totalNotebooks)
    ) {
      return addNotification("Quantidade insuficiente!", "error");
    }

    setLoanRecords([
      ...loanRecords,
      {
        id: Date.now(),
        student: newStudent,
        deviceType: newDeviceType,
        deviceId: deviceIdsArray,
        borrowDate: new Date(),
      },
    ]);
    newDeviceType === "Tablet"
      ? setTotalTablets((prev) => prev - deviceIdsArray.length)
      : setTotalNotebooks((prev) => prev - deviceIdsArray.length);
    addNotification("Empréstimo adicionado!", "success");
    setNewStudent("");
    setNewDeviceId("");
    setIsModalOpen(false);
  };

  return (
    <main className="p-8 max-w-7xl mx-auto">
      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-2">Bem-vindo(a), {userName}!</h2>
        <p className="text-gray-200">Gerencie os empréstimos de dispositivos da escola.</p>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <button
          onClick={() => setIsModalOpen(true)}
          className="block bg-neutral-800 rounded-lg shadow p-6 hover:bg-neutral-700 transition"
        >
          <h3 className="text-xl font-bold mb-2">Empréstimos</h3>
          <p className="text-sm text-gray-300">Controle de notebooks e tablets.</p>
        </button>

        {/* Outros cards (exemplo: Advertências, Relatórios) */}
        <div className="bg-neutral-800 rounded-lg shadow p-6 opacity-50 cursor-not-allowed">
          <h3 className="text-xl font-bold mb-2">Advertências</h3>
          <p className="text-sm text-gray-300">
            (Em breve) Módulo para registrar e acompanhar advertências de alunos.
          </p>
        </div>

        <div className="bg-neutral-800 rounded-lg shadow p-6 opacity-50 cursor-not-allowed">
          <h3 className="text-xl font-bold mb-2">Relatórios</h3>
          <p className="text-sm text-gray-300">
            (Em breve) Gere relatórios de uso, estatísticas de advertências e mais.
          </p>
        </div>
      </section>

      {notifications
        .filter((notif) => notif.visible)
        .map((notif) => (
          <Toast
            key={notif.id}
            message={notif.message}
            type={notif.type}
            onHide={() => hideNotification(notif.id)}
          />
        ))}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2 className="text-3xl font-semibold mb-4">Adicionar Empréstimo</h2>
        <p className="mb-4">
          Pegue um dispositivo empréstado da escola e adicione-o ao sistema. Se o dispositivo já
          estiver emprestado, ele será devolvido automaticamente.
        </p>
        <form onSubmit={handleAddLoan}>
          <label className="block mb-2">Nome do Professor</label>
          <input
            type="text"
            value={newStudent}
            onChange={(e) => setNewStudent(e.target.value)}
            className="w-full p-2 rounded border border-gray-600 focus:outline-none focus:border-blue-400"
            placeholder="Nome"
          />

          <label className="block mt-4 mb-2">Tipo de Dispositivo</label>
          <select
            value={newDeviceType}
            onChange={(e) => setNewDeviceType(e.target.value)}
            className="w-full p-2 rounded border border-gray-600 focus:outline-none focus:border-blue-400"
          >
            <option className="bg-zinc-950" value="Tablet">
              Tablet
            </option>
            <option className="bg-zinc-950" value="Notebook">
              Notebook
            </option>
          </select>

          <label className="block mt-4 mb-2">Número(s) do Dispositivo</label>
          <input
            type="text"
            value={newDeviceId}
            onChange={(e) => setNewDeviceId(e.target.value)}
            className="w-full p-2 rounded border border-gray-600 focus:outline-none focus:border-blue-400"
            placeholder="Ex: 1,2,3"
          />

          <button
            type="submit"
            className="w-full bg-gray-700 hover:bg-gray-700/75 font-bold py-2 mt-4 rounded transition"
          >
            Adicionar
          </button>
        </form>
      </Modal>
    </main>
  );
}
