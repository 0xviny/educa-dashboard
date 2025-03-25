"use client";
/* eslint-disable */

import React, { useEffect, useState } from "react";
import Modal from "@/components/common/modal";
import Toast from "@/components/common/toast";
import { useNotifications } from "@/hooks/useNotifications";
import DefaultTabs from "../mixed/tabs";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

/** Representa uma única ocorrência dentro de uma ficha */
interface WarningOccurrence {
  id: number; // ID único da ocorrência
  subject: string; // Assunto da ocorrência
  signature: string; // Assinatura do professor
  createdAt: Date; // Data/hora em que foi criada
}

/** Representa uma ficha que pode ter até 3 ocorrências */
interface WarningRecord {
  id: number; // ID único da ficha
  studentName: string; // Nome do aluno
  number: string; // Número (chamada)
  series: string; // Série (ex: 3DS)
  occurrences: WarningOccurrence[]; // Até 3 ocorrências
  pdfUrl?: string; // URL do PDF gerado
}

/** Representa um empréstimo de dispositivo */
interface LoanRecord {
  id: number;
  student: string;
  deviceType: string;
  deviceId: string[];
  borrowDate: Date;
}

// Função auxiliar para quebrar o texto em várias linhas no PDF
function wrapText(text: string, font: any, fontSize: number, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";
  words.forEach((word) => {
    const testLine = currentLine ? currentLine + " " + word : word;
    const testLineWidth = font.widthOfTextAtSize(testLine, fontSize);
    if (testLineWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });
  if (currentLine) lines.push(currentLine);
  return lines;
}

// Função auxiliar para truncar textos longos na tabela
function truncateText(text: string, maxLength: number): string {
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}

export default function Dashboard() {
  // -------------------------------------------------
  //                Estados gerais
  // -------------------------------------------------
  const [userName, setUserName] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("userName") || "Professor(a)";
    }
    return "Professor(a)";
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

  // -------------------------------------------------
  //       Estados relacionados às ocorrências
  // -------------------------------------------------
  const [warningRecords, setWarningRecords] = useState<WarningRecord[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("warningRecords");
      const records = stored ? JSON.parse(stored) : [];
      // Garante que cada registro tenha a propriedade occurrences definida
      return records.map((record: WarningRecord) => ({
        ...record,
        occurrences: record.occurrences || [],
      }));
    }
    return [];
  });

  // Modal de empréstimo e ocorrência
  const [isModalOpen, setIsModalOpen] = useState(false); // Empréstimo
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false); // Adicionar ocorrência

  // Modal para exibir detalhes completos de uma ocorrência truncada
  const [selectedOccurrence, setSelectedOccurrence] = useState<{
    occurrence: WarningOccurrence;
    record: WarningRecord;
  } | null>(null);

  // Campos do form de Empréstimo
  const [newStudent, setNewStudent] = useState<string>("");
  const [newDeviceType, setNewDeviceType] = useState<string>("Tablet");
  const [newDeviceId, setNewDeviceId] = useState<string>("");

  // Campos do form de Ocorrência
  const [newStudentName, setNewStudentName] = useState<string>("");
  const [newNumber, setNewNumber] = useState<string>("");
  const [newSeries, setNewSeries] = useState<string>("");
  const [newSubject, setNewSubject] = useState<string>(""); // assunto
  const [newSignature, setNewSignature] = useState<string>(""); // assinatura

  // Barras de pesquisa
  const [loanSearchQuery, setLoanSearchQuery] = useState<string>("");
  const [warningSearchQuery, setWarningSearchQuery] = useState<string>("");

  const { notifications, addNotification, hideNotification } = useNotifications();

  const tabs = [
    { id: "loans", label: "Empréstimos" },
    { id: "warnings", label: "Ocorrência" },
  ];
  const [activeTab, setActiveTab] = useState<"loans" | "warnings">("loans");

  // Atualiza localStorage sempre que mudar
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("userName", userName);
      localStorage.setItem("totalTablets", totalTablets.toString());
      localStorage.setItem("totalNotebooks", totalNotebooks.toString());
      localStorage.setItem("loanRecords", JSON.stringify(loanRecords));
      localStorage.setItem("warningRecords", JSON.stringify(warningRecords));
    }
  }, [userName, totalTablets, totalNotebooks, loanRecords, warningRecords]);

  // -------------------------------------------------
  //   Filtragem de registros (empréstimos e fichas)
  // -------------------------------------------------
  const filteredLoanRecords = loanRecords.filter((record) =>
    record.student.toLowerCase().includes(loanSearchQuery.toLowerCase())
  );

  const filteredWarningRecords = warningRecords.filter(
    (record) =>
      record.studentName.toLowerCase().includes(warningSearchQuery.toLowerCase()) ||
      record.number.toString().includes(warningSearchQuery)
  );

  // -------------------------------------------------
  //             Lógica de Empréstimo
  // -------------------------------------------------
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

    // Verifica se algum dispositivo já está emprestado
    const alreadyLoaned = loanRecords.some((record) =>
      record.deviceId.some((id) => deviceIdsArray.includes(id))
    );
    if (alreadyLoaned) {
      return addNotification("Dispositivo já emprestado!", "error");
    }

    // Verifica se há estoque suficiente
    if (
      (newDeviceType === "Tablet" && deviceIdsArray.length > totalTablets) ||
      (newDeviceType === "Notebook" && deviceIdsArray.length > totalNotebooks)
    ) {
      return addNotification("Quantidade insuficiente!", "error");
    }

    // Cria o novo registro de empréstimo
    const newLoan: LoanRecord = {
      id: Date.now(),
      student: newStudent,
      deviceType: newDeviceType,
      deviceId: deviceIdsArray,
      borrowDate: new Date(),
    };

    setLoanRecords([...loanRecords, newLoan]);

    // Ajusta o total de dispositivos
    if (newDeviceType === "Tablet") {
      setTotalTablets((prev) => prev - deviceIdsArray.length);
    } else {
      setTotalNotebooks((prev) => prev - deviceIdsArray.length);
    }

    addNotification("Empréstimo adicionado!", "success");
    setNewStudent("");
    setNewDeviceId("");
    setIsModalOpen(false);
  };

  const handleReturnLoan = (id: number) => {
    const recordToReturn = loanRecords.find((record) => record.id === id);
    if (recordToReturn) {
      setLoanRecords(loanRecords.filter((record) => record.id !== id));

      // Devolve ao estoque
      if (recordToReturn.deviceType === "Tablet") {
        setTotalTablets((prev) => prev + recordToReturn.deviceId.length);
      } else {
        setTotalNotebooks((prev) => prev + recordToReturn.deviceId.length);
      }
      addNotification("Empréstimo devolvido com sucesso!", "success");
    }
  };

  // -------------------------------------------------
  //     Função para gerar PDF de uma ficha (até 3)
  // -------------------------------------------------
  // Função para gerar PDF da ocorrência, ajustando o posicionamento dos campos
  async function generateWarningPDF(record: WarningRecord): Promise<string> {
    // Carrega o PDF de layout
    const pdfBytes = await fetch("/layout.pdf").then((res) => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Obtém a página (caso seja só 1 página)
    const [page] = pdfDoc.getPages();
    const { width, height } = page.getSize();

    // Configurações de fonte e cor
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;
    const textColor = rgb(0, 0, 0);

    // Data/hora atual
    const now = new Date();
    const dateStr = `${now.toLocaleDateString()}  ${now.toLocaleTimeString()}`;

    // ------------------------------------------------------------------
    // Exemplo de posicionamento dos campos de cabeçalho no PDF:
    // Ajuste x, y conforme a necessidade, usando height - algo ou valores fixos.
    // ------------------------------------------------------------------
    page.drawText(`${record.studentName}`, {
      x: 263, // Ajuste conforme seu layout
      y: 457, // Ajuste conforme seu layout
      size: fontSize,
      font,
      color: textColor,
    });

    page.drawText(`${record.number}`, {
      x: 935,
      y: 463,
      size: fontSize,
      font,
      color: textColor,
    });

    page.drawText(`Série: ${record.series}`, {
      x: 300,
      y: height - 140,
      size: fontSize,
      font,
      color: textColor,
    });

    page.drawText(`Data: ${dateStr}`, {
      x: 300,
      y: height - 120,
      size: fontSize,
      font,
      color: textColor,
    });

    // ------------------------------------------------------------------
    // Agora, vamos desenhar as ocorrências (1ª, 2ª, 3ª) nos locais corretos.
    // Você pode definir coordenadas fixas para cada “linha” do formulário.
    // ------------------------------------------------------------------
    // Por exemplo, se no seu PDF a primeira ocorrência deve ficar em (x=105, y=height-180),
    // a segunda em (x=105, y=height-240), etc., ajuste como achar melhor.
    //
    // Lembre-se: no pdf-lib, o ponto (0,0) é o canto inferior esquerdo da página.
    // Então "height - algo" costuma ser usado para partir do topo.
    // ------------------------------------------------------------------

    // Espaçamento vertical inicial (após o cabeçalho)
    let baseY = height - 200;

    // Vamos iterar sobre as ocorrências (máx 3).
    record.occurrences.forEach((occ, index) => {
      // Exemplo de label: 1ª, 2ª, 3ª
      const label = ["1ª", "2ª", "3ª"][index] || `${index + 1}ª`;

      // Desenha o texto da ocorrência
      page.drawText(`${label} Ocorrência: ${occ.subject}`, {
        x: 189,
        y: 555,
        size: fontSize,
        font,
        color: textColor,
      });

      // Desenha a assinatura do professor
      page.drawText(`Assinatura: ${occ.signature}`, {
        x: 499,
        y: 785,
        size: fontSize,
        font,
        color: textColor,
      });

      // Decrementa o Y para a próxima ocorrência
      baseY -= 60; // Ajuste esse valor para dar o espaço correto entre as linhas
    });

    // Salva o PDF em memória
    const modifiedPdfBytes = await pdfDoc.save();

    // Cria um Blob e gera uma URL para download/visualização
    const blob = new Blob([modifiedPdfBytes], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);

    return blobUrl;
  }

  // -------------------------------------------------
  //     Adicionar ocorrência (até 3 por ficha)
  // -------------------------------------------------
  const handleAddWarning = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newStudentName || !newNumber || !newSeries || !newSubject || !newSignature) {
      return addNotification("Preencha todos os campos da ocorrência!", "error");
    }

    // Cria a nova ocorrência
    const newOccurrence: WarningOccurrence = {
      id: Date.now(),
      subject: newSubject,
      signature: newSignature,
      createdAt: new Date(),
    };

    // Procura se existe alguma ficha (WarningRecord) para este aluno que ainda não tenha 3 ocorrências.
    const existingRecordIndex = warningRecords.findIndex(
      (wr) =>
        wr.studentName.toLowerCase() === newStudentName.toLowerCase() && wr.occurrences.length < 3
    );

    let recordToUpdate: WarningRecord | null = null;
    let newWarnings: WarningRecord[] = [...warningRecords];

    if (existingRecordIndex !== -1) {
      // Se encontrou uma ficha com < 3 ocorrências, adiciona nela
      recordToUpdate = { ...newWarnings[existingRecordIndex] };
      recordToUpdate.occurrences = [...recordToUpdate.occurrences, newOccurrence];
      newWarnings[existingRecordIndex] = recordToUpdate;
    } else {
      // Se não encontrou, cria uma nova ficha com occurrences inicializado
      recordToUpdate = {
        id: Date.now(),
        studentName: newStudentName,
        number: newNumber,
        series: newSeries,
        occurrences: [newOccurrence],
      };
      newWarnings = [...newWarnings, recordToUpdate];
    }

    // Gera o PDF para essa ficha
    if (recordToUpdate) {
      const pdfUrl = await generateWarningPDF(recordToUpdate);
      recordToUpdate.pdfUrl = pdfUrl;
    }

    // Atualiza o estado e salva no localStorage
    setWarningRecords(newWarnings);
    addNotification("Ocorrência adicionada/atualizada!", "success");

    // Limpa o form
    setNewStudentName("");
    setNewNumber("");
    setNewSeries("");
    setNewSubject("");
    setNewSignature("");
    setIsWarningModalOpen(false);
  };

  // -------------------------------------------------
  //     Renderização do Componente
  // -------------------------------------------------
  return (
    <main className="p-8 max-w-7xl mx-auto">
      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-2">Bem-vindo(a), {userName}!</h2>
        <p className="text-gray-200">
          Gerencie os empréstimos e as ocorrências dos alunos da escola.
        </p>
      </section>

      <section className="my-8 bg-zinc-950 w-min py-2 px-2 rounded-lg">
        <DefaultTabs
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={(tabId) => setActiveTab(tabId as "loans" | "warnings")}
          cursor="bg-zinc-900"
        />
      </section>

      {/* -------------------- Aba Empréstimos -------------------- */}
      {activeTab === "loans" && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Registros de Empréstimos</h2>
          <p>Total de Tablet: {totalTablets}</p>
          <p>Total de Notebook: {totalNotebooks}</p>

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
                      <td className="px-4 py-3">{record.deviceId.join(", ")}</td>
                      <td className="px-4 py-3">{new Date(record.borrowDate).toLocaleString()}</td>
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

      {/* -------------------- Aba Ocorrências -------------------- */}
      {activeTab === "warnings" && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Registro de Ocorrência</h2>
          <p className="mb-4 text-sm text-gray-300">
            Obs: Após a terceira ocorrência em uma ficha, será gerada automaticamente uma nova ficha
            para o mesmo aluno.
          </p>

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
              Adicionar Ocorrência
            </button>
          </div>

          <div className="overflow-x-auto overflow-y-auto max-h-80 mb-4">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-neutral-800/75 text-left">
                  <th className="px-4 py-3">ID da Ficha</th>
                  <th className="px-4 py-3">Aluno</th>
                  <th className="px-4 py-3">Número</th>
                  <th className="px-4 py-3">Série</th>
                  <th className="px-4 py-3">Ocorrências (até 3)</th>
                  <th className="px-4 py-3">PDF</th>
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

                      {/* Exibe as ocorrências com truncamento e quebra de linha */}
                      <td className="px-4 py-3 whitespace-normal">
                        {(record.occurrences || []).map((occ, i) => (
                          <div
                            key={occ.id}
                            className="mb-2 cursor-pointer hover:underline"
                            onClick={() => setSelectedOccurrence({ occurrence: occ, record })}
                          >
                            <strong>{i + 1}ª</strong> – {truncateText(occ.subject, 50)} <br />
                            <em>Assinatura:</em> {truncateText(occ.signature, 50)}
                          </div>
                        ))}
                      </td>

                      <td className="px-4 py-3">
                        {record.pdfUrl ? (
                          <a href={record.pdfUrl} download={`Ocorrencia_${record.studentName}.pdf`}>
                            <button className="bg-blue-500 hover:bg-blue-500/75 py-1 px-3 rounded-md text-white">
                              Baixar PDF
                            </button>
                          </a>
                        ) : (
                          "Sem PDF"
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-gray-400">
                      Nenhuma ocorrência encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Modal para detalhes completos da ocorrência truncada */}
      {/* Modal para detalhes completos da ocorrência truncada */}
      {selectedOccurrence && (
        <Modal isOpen={true} onClose={() => setSelectedOccurrence(null)}>
          <h2 className="text-3xl font-semibold mb-4">Detalhes da Ocorrência</h2>
          <p>
            <strong>Aluno:</strong> {selectedOccurrence.record.studentName}
          </p>
          <p>
            <strong>Número:</strong> {selectedOccurrence.record.number}
          </p>
          <p>
            <strong>Série:</strong> {selectedOccurrence.record.series}
          </p>
          <div className="mt-4">
            <p className="font-semibold">Assunto:</p>
            {/* Contêiner com rolagem e quebra de palavras */}
            <div className="mt-2 max-h-[50vh] overflow-y-auto break-words p-2 border rounded bg-zinc-800">
              {selectedOccurrence.occurrence.subject}
            </div>
          </div>
          <div className="mt-4">
            <p className="font-semibold">Assinatura:</p>
            <div className="mt-2 max-h-[30vh] overflow-y-auto break-words p-2 border rounded bg-zinc-800">
              {selectedOccurrence.occurrence.signature}
            </div>
          </div>
          <button
            className="mt-6 bg-gray-700 hover:bg-gray-700/75 py-2 px-5 rounded-md cursor-pointer"
            onClick={() => setSelectedOccurrence(null)}
          >
            Fechar
          </button>
        </Modal>
      )}

      {/* Notificações */}
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

      {/* Modal de Empréstimo */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2 className="text-3xl font-semibold mb-4">Adicionar Empréstimo</h2>
        <p className="mb-4">
          Pegue um dispositivo emprestado da escola e adicione-o ao sistema. Se o dispositivo já
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
            className="w-full bg-gray-700 hover:bg-gray-700/75 font-bold py-2 mt-4 rounded transition cursor-pointer"
          >
            Adicionar
          </button>
        </form>
      </Modal>

      {/* Modal de Ocorrência */}
      <Modal isOpen={isWarningModalOpen} onClose={() => setIsWarningModalOpen(false)}>
        <h2 className="text-3xl font-semibold mb-4">Adicionar Ocorrência</h2>
        <p className="mb-4">
          Preencha a ficha do aluno. Se ele já tiver uma ficha com menos de 3 ocorrências, a nova
          será adicionada. Se já tiver 3, cria-se uma nova ficha.
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

            <label className="block mt-4 mb-2">Número (Número de chamada)</label>
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
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              className="w-full p-2 rounded border border-gray-600 focus:outline-none focus:border-blue-400"
              placeholder="Assunto"
            />

            <label className="block mt-4 mb-2">Assinatura do Professor</label>
            <input
              type="text"
              value={newSignature}
              onChange={(e) => setNewSignature(e.target.value)}
              className="w-full p-2 rounded border border-gray-600 focus:outline-none focus:border-blue-400"
              placeholder="Assinatura"
            />

            <button
              type="submit"
              className="w-full bg-gray-700 hover:bg-gray-700/75 font-bold py-2 mt-4 rounded transition cursor-pointer"
            >
              Adicionar Ocorrência
            </button>
          </form>
        </div>
      </Modal>
    </main>
  );
}
