import type { Metadata } from "next";

import "../styles/globals.css";
import Header from "@/components/common/header";

export const metadata: Metadata = {
  title: "Educa Dashboard",
  description: "Educa Dashboard é um sistema de gerenciamento de empréstimos e reclamações de alunos da escola.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className="min-h-screen bg-black text-white">
        <Header />
        {children}
      </body>
    </html>
  );
}
