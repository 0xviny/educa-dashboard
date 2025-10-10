interface User {
  id?: string;
  nome: string;
  email: string;
  telefone?: string;
  senha?: string;
  perfil: string;

  escolaId?: string;
  escola?: Escola;

  sistemaId?: string;
  sistema?: Sistema;
}

interface Escola {
  id?: string;
  nome: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  telefone: string;
  email: string;
  diretor: string;
  viceDiretor: string;
}

interface Sistema {
  id?: string;
  notificacoesEmail: boolean;
  notificacoesApp: boolean;
  backupAutomatico: boolean;
  intervaloBackup: string;
  logAcesso: boolean;
}

interface Turma {
  id: string;
  nome: string;
  turma: string;
  periodo: string;
}

interface Equipamento {
  id: string;
  tipo: string;
  quantidade: number;
  numerosSerie: string[];
  professor: string;
  turma: string;
  dataRetirada: string;
  horaRetirada: string;
  status: string;
  dataDevolucao: string;
  horaDevolucao: string;
  observacoes: string;
  assinatura: string;
}

export type { User, Escola, Sistema, Turma, Equipamento };
