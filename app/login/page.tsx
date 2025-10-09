"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { School } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { initializeData } from "@/lib/storage-service";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { login, user } = useAuth();

  // Inicializar dados de exemplo
  useEffect(() => {
    initializeData();
  }, []);

    // LoginPage.tsx
    useEffect(() => {
      if (!isLoading && user) {
        router.push("/dashboard/selecao");
      }
    }, [user, isLoading, router]);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password);

      if (success) {
        toast({
          title: "Login realizado com sucesso",
          description: "Bem-vindo ao Educa Dashboard",
        });
        router.push("/dashboard/selecao");
      } else {
        toast({
          title: "Erro ao fazer login",
          description: "Email ou senha incorretos",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao fazer login",
        description: "Ocorreu um erro ao tentar fazer login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-slate-100 p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
        <div className="hidden md:flex flex-col items-center justify-center p-6">
          <div className="relative w-full flex items-center justify-center h-80">
            <Image alt="Educa Dashboard" src="/logoo.jpeg" width={300} height={300} className="rounded-full" />
          </div>
          <h1 className="text-3xl font-bold text-primary mt-6 text-center">Educa Dashboard</h1>
          <p className="text-slate-600 mt-2 text-center max-w-md">
            Sistema de gerenciamento de advertências e equipamentos para sua instituição de ensino
          </p>
        </div>

        <Card className="w-full max-w-md mx-auto shadow-lg border-slate-200">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                <School className="h-6 w-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Bem-vindo</CardTitle>
            <CardDescription className="text-center">
              Faça login para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Senha</Label>
                    <a href="#" className="text-sm text-secondary hover:underline">
                      Esqueceu a senha?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col">
            <p className="text-center text-sm text-slate-600 mt-2">
              Use um dos seguintes para testar:
            </p>
            <ul className="text-center text-xs text-slate-500 mt-1">
              <li>administrador@escola.com / senha123 (Administrador)</li>
              <li>professor@escola.com / senha123 (Professor)</li>
              <li>direcao@escola.com / senha123 (Direção)</li>
            </ul>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
