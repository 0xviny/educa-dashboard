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
  const [totalTablets, setTotalTablets] = useState<number>(0);
  const [totalNotebooks, setTotalNotebooks] = useState<number>(0);
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
    <div className="min-h-screen bg-gradient-to-r from-slate-950 to-indigo-950/75 backdrop-blur-xl p-8 py-16 text-white">
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
                <label className="block text-sm mb-1">Nome do Aluno</label>
                <input
                  type="text"
                  value={newStudent}
                  onChange={(e) => setNewStudent(e.target.value)}
                  placeholder="Nome do aluno"
                  className="w-full p-2 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Tipo de Dispositivo</label>
                <select
                  value={newDeviceType}
                  onChange={(e) => setNewDeviceType(e.target.value)}
                  className="w-full p-2 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-400"
                >
                  <option value="Tablet">Tablet</option>
                  <option value="Notebook">Notebook</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">ID do Dispositivo</label>
                <input
                  type="text"
                  value={newDeviceId}
                  onChange={(e) => setNewDeviceId(e.target.value)}
                  placeholder="ID do dispositivo"
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
                  <tr className="bg-gray-700">
                    <th className="px-4 py-2">ID</th>
                    <th className="px-4 py-2">Aluno</th>
                    <th className="px-4 py-2">Tipo</th>
                    <th className="px-4 py-2">ID do Dispositivo</th>
                    <th className="px-4 py-2">Data/Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {loanRecords.length > 0 ? (
                    loanRecords.map((record) => (
                      <tr key={record.id} className="border-b border-gray-600">
                        <td className="px-4 py-2">{record.id}</td>
                        <td className="px-4 py-2">{record.student}</td>
                        <td className="px-4 py-2">{record.deviceType}</td>
                        <td className="px-4 py-2">{record.deviceId}</td>
                        <td className="px-4 py-2">{record.borrowDate.toLocaleString()}</td>
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
