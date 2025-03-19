"use client";

import React, { useEffect, useState } from "react";
import Modal from "@/components/common/modal";
import Toast from "@/components/common/toast";
import { useNotifications } from "@/hooks/useNotifications";
import DefaultTabs from "../mixed/tabs";

interface LoanRecord {
  id: number;
  student: string;
  deviceType: string;
  deviceId: string[];
  borrowDate: Date;
}

interface WarningRecord {
  id: number;
  studentName: string;
  number: string;
  series: string;
  subject1: string;
  signature1: string;
}

export default function Dashboard() {
  // Inicializa os estados lendo os dados do localStorage, se existirem.
  const [userName, setUserName] = useState<string>(() => {
    return typeof window !== "undefined"
      ? localStorage.getItem("userName") || "Professor(a)"
      : "Professor(a)";
  });

  const [totalTablets, setTotalTablets] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("totalTablets");
      return stored ? Number(stored) : 40;
    }
    return 40;
  });

  const [totalNotebooks, setTotalNotebooks] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("totalNotebooks");
      return stored ? Number(stored) : 30;
    }
    return 30;
  });

  const [loanRecords, setLoanRecords] = useState<LoanRecord[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("loanRecords");
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  const [warningRecords, setWarningRecords] = useState<WarningRecord[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("warningRecords");
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  // Outras variáveis de estado
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState<string>("");
  const [newDeviceType, setNewDeviceType] = useState<string>("Tablet");
  const [newDeviceId, setNewDeviceId] = useState<string>("");
  const { notifications, addNotification, hideNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState<"loans" | "warnings">("loans");

  // Estados e variáveis para advertências
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState<string>("");
  const [newNumber, setNewNumber] = useState<string>("");
  const [newSeries, setNewSeries] = useState<string>("");
  const [newSubject1, setNewSubject1] = useState<string>("");
  const [newSignature1, setNewSignature1] = useState<string>("");

  // Estados para as barras de pesquisa
  const [loanSearchQuery, setLoanSearchQuery] = useState<string>("");
  const [warningSearchQuery, setWarningSearchQuery] = useState<string>("");

  const tabs = [
    { id: "loans", label: "Empréstimos" },
    { id: "warnings", label: "Advertências" },
  ];

  // Sempre que os estados relevantes mudarem, atualiza o localStorage.
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("userName", userName);
      localStorage.setItem("totalTablets", totalTablets.toString());
      localStorage.setItem("totalNotebooks", totalNotebooks.toString());
      localStorage.setItem("loanRecords", JSON.stringify(loanRecords));
      localStorage.setItem("warningRecords", JSON.stringify(warningRecords));
    }
  }, [userName, totalTablets, totalNotebooks, loanRecords, warningRecords]);

  // Filtra os registros de empréstimos de acordo com a pesquisa
  const filteredLoanRecords = loanRecords.filter((record) =>
    record.student.toLowerCase().includes(loanSearchQuery.toLowerCase())
  );

  // Filtra os registros de advertências de acordo com a pesquisa
  const filteredWarningRecords = warningRecords.filter((record) =>
    record.studentName.toLowerCase().includes(warningSearchQuery.toLowerCase()) ||
    record.number.toString().includes(warningSearchQuery)
  );

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

    if (
      loanRecords.some((record) =>
        record.deviceId.some((id) => deviceIdsArray.includes(id))
      )
    ) {
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

  const handleReturnLoan = (id: number) => {
    const recordToReturn = loanRecords.find((record) => record.id === id);
    if (recordToReturn) {
      setLoanRecords(loanRecords.filter((record) => record.id !== id));

      if (recordToReturn.deviceType === "Tablet") {
        setTotalTablets((prev) => prev + recordToReturn.deviceId.length);
      } else if (recordToReturn.deviceType === "Notebook") {
        setTotalNotebooks((prev) => prev + recordToReturn.deviceId.length);
      }
      addNotification("Empréstimo devolvido com sucesso!", "success");
    }
  };

  // Função para adicionar advertência
  const handleAddWarning = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !newStudentName ||
      !newNumber ||
      !newSeries ||
      !newSubject1 ||
      !newSignature1
    ) {
      return addNotification("Preencha todos os campos da reclamação!", "error");
    }

    setWarningRecords([
      ...warningRecords,
      {
        id: Date.now(),
        studentName: newStudentName,
        number: newNumber,
        series: newSeries,
        subject1: newSubject1,
        signature1: newSignature1,
      },
    ]);

    addNotification("Reclamação adicionada!", "success");
    // Limpar campos
    setNewStudentName("");
    setNewNumber("");
    setNewSeries("");
    setNewSubject1("");
    setNewSignature1("");
    setIsWarningModalOpen(false);
  };

  return (
    <main className="p-8 max-w-7xl mx-auto">
      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-2">
          Bem-vindo(a), {userName}!
        </h2>
        <p className="text-gray-200">
          Gerencie os empréstimos e as advertências dos alunos da escola.
        </p>
      </section>

      <section className="my-8 bg-zinc-950 w-min py-2 px-2 rounded-lg">
        <DefaultTabs
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={(tabId) =>
            setActiveTab(tabId as "loans" | "warnings")
          }
          cursor="bg-zinc-900"
        />
      </section>

      {activeTab === "loans" && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">
            Registros de Empréstimos
          </h2>
          <p>Total de Tablet: {totalTablets}</p>
          <p>Total de Notebook: {totalNotebooks}</p>
          {/* Barra de pesquisa para empréstimos */}
          <div className="flex my-4 gap-2">
            <input
              type="text"
              value={loanSearchQuery}
              onChange={(e) => setLoanSearchQuery(e.target.value)}
              placeholder="Pesquisar por nome do professor"
              className="p-2 border rounded w-[600px]"
            />

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-green-500 hover:bg-green-500/75 py-2 px-5 rounded-md cursor-pointer"
            >
              Adicionar Empréstimo
            </button>
          </div>
          <div className="overflow-x-auto overflow-y-auto max-h-80">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-neutral-800/75 text-left">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Professor</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Número do Dispositivo</th>
                  <th className="px-4 py-3">Data/Hora</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filteredLoanRecords.length > 0 ? (
                  filteredLoanRecords.map((record) => (
                    <tr key={record.id} className="border-b border-gray-600">
                      <td className="px-4 py-3">{record.id}</td>
                      <td className="px-4 py-3">{record.student}</td>
                      <td className="px-4 py-3">{record.deviceType}</td>
                      <td className="px-4 py-3">
                        {record.deviceId.join(", ")}
                      </td>
                      <td className="px-4 py-3">
                        {new Date(record.borrowDate).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleReturnLoan(record.id)}
                          className="bg-red-500 py-2 px-5 rounded-md cursor-pointer"
                        >
                          Devolver
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-gray-400">
                      Nenhum registro de empréstimo encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === "warnings" && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">
            Registro de Advertência
          </h2>
          <p className="mb-4 text-sm text-gray-300">
            Obs: Após a terceira reclamação, o aluno será informado que só virá para a escola acompanhado do pai ou responsável.
          </p>
          {/* Barra de pesquisa para advertências */}
          <div className="flex mb-4 gap-2">
            <input
              type="text"
              value={warningSearchQuery}
              onChange={(e) => setWarningSearchQuery(e.target.value)}
              placeholder="Pesquisar por nome do aluno ou número"
              className="p-2 border rounded w-[600px]"
            />

            <button
              onClick={() => setIsWarningModalOpen(true)}
              className="bg-green-500 hover:bg-green-500/75 py-2 px-5 rounded-md cursor-pointer"
            >
              Adicionar Advertência
            </button>
          </div>
          <div className="overflow-x-auto overflow-y-auto max-h-80 mb-4">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-neutral-800/75 text-left">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Nome do Aluno</th>
                  <th className="px-4 py-3">Número</th>
                  <th className="px-4 py-3">Série</th>
                  <th className="px-4 py-3">Assunto</th>
                  <th className="px-4 py-3">Assinatura do Professor</th>
                </tr>
              </thead>
              <tbody>
                {filteredWarningRecords.length > 0 ? (
                  filteredWarningRecords.map((record) => (
                    <tr key={record.id} className="border-b border-gray-600">
                      <td className="px-4 py-3">{record.id}</td>
                      <td className="px-4 py-3">{record.studentName}</td>
                      <td className="px-4 py-3">{record.number}</td>
                      <td className="px-4 py-3">{record.series}</td>
                      <td className="px-4 py-3 break-words">
                        {record.subject1}
                      </td>
                      <td className="px-4 py-3">{record.signature1}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-gray-400">
                      Nenhuma reclamação encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

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
          Pegue um dispositivo emprestado da escola e adicione-o ao sistema. Se o dispositivo já estiver emprestado, ele será devolvido automaticamente.
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

          <label className="block mt-4 mb-2">
            Número(s) do Dispositivo
          </label>
          <input
            type="text"
            value={newDeviceId}
            onChange={(e) => setNewDeviceId(e.target.value)}
            className="w-full p-2 rounded border border-gray-600 focus:outline-none focus:border-blue-400"
            placeholder="Ex: 1,2,3"
          />

          <button
            type="submit"
            className="w-full bg-gray-700 hover:bg-gray-700/75 font-bold py-2 mt-4 rounded transition cursor-pointer"
          >
            Adicionar
          </button>
        </form>
      </Modal>

      <Modal isOpen={isWarningModalOpen} onClose={() => setIsWarningModalOpen(false)}>
        <h2 className="text-3xl font-semibold mb-4">Adicionar Advertência</h2>
        <p className="mb-4">
          Preencha a ficha individual do aluno para registrar a reclamação. Se houver mais campos do que cabem na tela, role para visualizar tudo.
        </p>

        <div className="max-h-[70vh] overflow-y-auto pr-4">
          <form onSubmit={handleAddWarning}>
            <label className="block mb-2">Nome do Aluno</label>
            <input
              type="text"
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              className="w-full p-2 rounded border border-gray-600 focus:outline-none focus:border-blue-400"
              placeholder="Nome do Aluno"
            />

            <label className="block mt-4 mb-2">
              Número (Número de chamada)
            </label>
            <input
              type="number"
              value={newNumber}
              onChange={(e) => setNewNumber(e.target.value)}
              className="w-full p-2 rounded border border-gray-600 focus:outline-none focus:border-blue-400"
              placeholder="Número"
            />

            <label className="block mt-4 mb-2">Série do Aluno</label>
            <input
              type="text"
              value={newSeries}
              onChange={(e) => setNewSeries(e.target.value)}
              className="w-full p-2 rounded border border-gray-600 focus:outline-none focus:border-blue-400"
              placeholder="Série (Ex: 3DS)"
            />

            <label className="block mt-4 mb-2">Assunto</label>
            <input
              type="text"
              value={newSubject1}
              onChange={(e) => setNewSubject1(e.target.value)}
              className="w-full p-2 rounded border border-gray-600 focus:outline-none focus:border-blue-400"
              placeholder="Assunto"
            />

            <label className="block mt-4 mb-2">
              Assinatura do Professor
            </label>
            <input
              type="text"
              value={newSignature1}
              onChange={(e) => setNewSignature1(e.target.value)}
              className="w-full p-2 rounded border border-gray-600 focus:outline-none focus:border-blue-400"
              placeholder="Assinatura"
            />

            <button
              type="submit"
              className="w-full bg-gray-700 hover:bg-gray-700/75 font-bold py-2 mt-4 rounded transition cursor-pointer"
            >
              Adicionar Reclamação
            </button>
          </form>
        </div>
      </Modal>
    </main>
  );
}
