"use client";

import React, { useState } from "react";

interface LoanRecord {
  id: number;
  student: string;
  deviceType: string;
  deviceId: string;
  borrowDate: Date;
}

export default function LoanDashboard() {
  const [totalTablets, setTotalTablets] = useState<number>(40);
  const [totalNotebooks, setTotalNotebooks] = useState<number>(30);
  const [loanRecords, setLoanRecords] = useState<LoanRecord[]>([]);
  const [newStudent, setNewStudent] = useState<string>("");
  const [newDeviceType, setNewDeviceType] = useState<string>("Tablet");
  const [newDeviceId, setNewDeviceId] = useState<string>("");

  const handleAddLoan = () => {
    if (newStudent && newDeviceId) {
      const newLoan: LoanRecord = {
        id: Date.now(),
        student: newStudent,
        deviceType: newDeviceType,
        deviceId: newDeviceId,
        borrowDate: new Date(),
      };
      setLoanRecords([...loanRecords, newLoan]);
      setNewStudent("");
      setNewDeviceId("");
      setNewDeviceType("Tablet");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tl from-neutral-600 to-blue-900 p-8 py-16 text-white">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">📋 Sistema de Empréstimos</h1>
        <div className="bg-neutral-800 p-6 rounded-lg shadow-lg">
          <div>
            <h2 className="text-2xl font-semibold mb-2">⚙ Configurar Totais</h2>
            <div className="flex flex-col md:flex-row md:space-x-6">
              <div className="mb-4 md:mb-0">
                <label className="block text-sm mb-1">Total de Tablets</label>
                <input
                  type="number"
                  value={totalTablets}
                  onChange={(e) => setTotalTablets(Number(e.target.value))}
                  className="p-2 rounded-lg bg-neutral-700 border border-neutral-600 focus:outline-none focus:border-blue-400 w-32"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Total de Notebooks</label>
                <input
                  type="number"
                  value={totalNotebooks}
                  onChange={(e) => setTotalNotebooks(Number(e.target.value))}
                  className="p-2 rounded-lg bg-neutral-700 border border-neutral-600 focus:outline-none focus:border-blue-400 w-32"
                />
              </div>
            </div>
            <p className="mt-2">
              Tablets disponíveis: {totalTablets} | Notebooks disponíveis: {totalNotebooks}
            </p>
          </div>

          <hr className="my-6 border-gray-700" />

          <div>
            <h2 className="text-2xl font-semibold mb-4">Adicionar Empréstimo</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm mb-1">Nome do Professor</label>
                <input
                  type="text"
                  value={newStudent}
                  onChange={(e) => setNewStudent(e.target.value)}
                  placeholder="Nome do Professor"
                  className="w-full p-2 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Tipo de Dispositivo</label>
                <div className="relative">
                  <select
                    value={newDeviceType}
                    onChange={(e) => setNewDeviceType(e.target.value)}
                    className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-400 appearance-none pr-10"
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Notebook">Notebook</option>
                  </select>
                  {/* Ícone da seta */}
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm mb-1">Número do Dispositivo</label>
                <input
                  type="text"
                  value={newDeviceId}
                  onChange={(e) => setNewDeviceId(e.target.value)}
                  placeholder="Número do dispositivo"
                  className="w-full p-2 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-400"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleAddLoan}
                  className="w-full bg-blue-600 hover:bg-blue-700 font-bold py-2 rounded-lg transition"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>

          <hr className="my-6 border-gray-700" />

          {/* Registros de Empréstimos */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Registros de Empréstimos</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-700 text-left">
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Aluno</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">ID do Dispositivo</th>
                    <th className="px-4 py-3">Data/Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {loanRecords.length > 0 ? (
                    loanRecords.map((record) => (
                      <tr key={record.id} className="border-b border-gray-600">
                        <td className="px-4 py-3">{record.id}</td>
                        <td className="px-4 py-3">{record.student}</td>
                        <td className="px-4 py-3">{record.deviceType}</td>
                        <td className="px-4 py-3">{record.deviceId}</td>
                        <td className="px-4 py-3">{record.borrowDate.toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-gray-400">
                        Nenhum registro de empréstimo encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
