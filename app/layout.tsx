import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { ToastProvider } from "@radix-ui/react-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Educa Dashboard",
  description: "Sistema de gestão escolar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <ToastProvider>
          <AuthProvider>{children}</AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
