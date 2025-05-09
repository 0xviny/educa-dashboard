// Tipos para os dados armazenados
export interface Aluno {
  id: string
  nome: string
  turma: string
  matricula: string
  dataNascimento: string
  responsavel: string
  contato: string
}

export interface Turma {
  id: string
  nome: string
  serie: string
  periodo: string
  professor: string
}

export interface Advertencia {
  id: string
  alunoId: string
  aluno?: string // Nome do aluno (para exibição)
  turma?: string // Nome da turma (para exibição)
  data: string
  motivo: string
  detalhes?: string
  status: "Pendente" | "Assinada"
  professor: string
  assinaturas?: {
    professor?: string
    direcao?: string
    aluno?: string
    responsavel?: string
  }
}

export interface Equipamento {
  id: string
  tipo: string
  quantidade: number
  numerosSerie: string[]
  professor: string
  turma: string
  dataRetirada: string
  horaRetirada: string
  status: "Em uso" | "Devolvido"
  dataDevolucao?: string
  horaDevolucao?: string
  observacoes?: string
  assinatura?: string
}

export interface Usuario {
  id: string
  nome: string
  email: string
  senha: string
  perfil: "professor" | "direcao" | "admin"
  foto?: string
}

// Chaves para o localStorage
const STORAGE_KEYS = {
  ALUNOS: "educa_dashboard_alunos",
  TURMAS: "educa_dashboard_turmas",
  ADVERTENCIAS: "educa_dashboard_advertencias",
  EQUIPAMENTOS: "educa_dashboard_equipamentos",
  USUARIOS: "educa_dashboard_usuarios",
  USUARIO_ATUAL: "educa_dashboard_usuario_atual",
}

// Função para gerar IDs únicos
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

// Funções para manipular alunos
export const getAlunos = (): Aluno[] => {
  if (typeof window === "undefined") return []
  const alunos = localStorage.getItem(STORAGE_KEYS.ALUNOS)
  return alunos ? JSON.parse(alunos) : []
}

export const getAluno = (id: string): Aluno | undefined => {
  const alunos = getAlunos()
  return alunos.find((aluno) => aluno.id === id)
}

export const saveAluno = (aluno: Omit<Aluno, "id">): Aluno => {
  const alunos = getAlunos()
  const novoAluno = { ...aluno, id: generateId() }
  localStorage.setItem(STORAGE_KEYS.ALUNOS, JSON.stringify([...alunos, novoAluno]))
  return novoAluno
}

export const updateAluno = (aluno: Aluno): Aluno => {
  const alunos = getAlunos()
  const index = alunos.findIndex((a) => a.id === aluno.id)
  if (index !== -1) {
    alunos[index] = aluno
    localStorage.setItem(STORAGE_KEYS.ALUNOS, JSON.stringify(alunos))
  }
  return aluno
}

export const deleteAluno = (id: string): void => {
  const alunos = getAlunos()
  localStorage.setItem(STORAGE_KEYS.ALUNOS, JSON.stringify(alunos.filter((a) => a.id !== id)))
}

// Funções para manipular turmas
export const getTurmas = (): Turma[] => {
  if (typeof window === "undefined") return []
  const turmas = localStorage.getItem(STORAGE_KEYS.TURMAS)
  return turmas ? JSON.parse(turmas) : []
}

export const getTurma = (id: string): Turma | undefined => {
  const turmas = getTurmas()
  return turmas.find((turma) => turma.id === id)
}

export const saveTurma = (turma: Omit<Turma, "id">): Turma => {
  const turmas = getTurmas()
  const novaTurma = { ...turma, id: generateId() }
  localStorage.setItem(STORAGE_KEYS.TURMAS, JSON.stringify([...turmas, novaTurma]))
  return novaTurma
}

export const updateTurma = (turma: Turma): Turma => {
  const turmas = getTurmas()
  const index = turmas.findIndex((t) => t.id === turma.id)
  if (index !== -1) {
    turmas[index] = turma
    localStorage.setItem(STORAGE_KEYS.TURMAS, JSON.stringify(turmas))
  }
  return turma
}

export const deleteTurma = (id: string): void => {
  const turmas = getTurmas()
  localStorage.setItem(STORAGE_KEYS.TURMAS, JSON.stringify(turmas.filter((t) => t.id !== id)))
}

// Funções para manipular advertências
export const getAdvertencias = (): Advertencia[] => {
  if (typeof window === "undefined") return []
  const advertencias = localStorage.getItem(STORAGE_KEYS.ADVERTENCIAS)
  return advertencias ? JSON.parse(advertencias) : []
}

export const getAdvertencia = (id: string): Advertencia | undefined => {
  const advertencias = getAdvertencias()
  return advertencias.find((adv) => adv.id === id)
}

export const saveAdvertencia = (advertencia: Omit<Advertencia, "id">): Advertencia => {
  const advertencias = getAdvertencias()
  const novaAdvertencia = { ...advertencia, id: generateId() }
  localStorage.setItem(STORAGE_KEYS.ADVERTENCIAS, JSON.stringify([...advertencias, novaAdvertencia]))
  return novaAdvertencia
}

export const updateAdvertencia = (advertencia: Advertencia): Advertencia => {
  const advertencias = getAdvertencias()
  const index = advertencias.findIndex((a) => a.id === advertencia.id)
  if (index !== -1) {
    advertencias[index] = advertencia
    localStorage.setItem(STORAGE_KEYS.ADVERTENCIAS, JSON.stringify(advertencias))
  }
  return advertencia
}

export const deleteAdvertencia = (id: string): void => {
  const advertencias = getAdvertencias()
  localStorage.setItem(STORAGE_KEYS.ADVERTENCIAS, JSON.stringify(advertencias.filter((a) => a.id !== id)))
}

// Funções para manipular equipamentos
export const getEquipamentos = (): Equipamento[] => {
  if (typeof window === "undefined") return []
  const equipamentos = localStorage.getItem(STORAGE_KEYS.EQUIPAMENTOS)
  return equipamentos ? JSON.parse(equipamentos) : []
}

export const getEquipamento = (id: string): Equipamento | undefined => {
  const equipamentos = getEquipamentos()
  return equipamentos.find((equip) => equip.id === id)
}

export const saveEquipamento = (equipamento: Omit<Equipamento, "id">): Equipamento => {
  const equipamentos = getEquipamentos()
  const novoEquipamento = { ...equipamento, id: generateId() }
  localStorage.setItem(STORAGE_KEYS.EQUIPAMENTOS, JSON.stringify([...equipamentos, novoEquipamento]))
  return novoEquipamento
}

export const updateEquipamento = (equipamento: Equipamento): Equipamento => {
  const equipamentos = getEquipamentos()
  const index = equipamentos.findIndex((e) => e.id === equipamento.id)
  if (index !== -1) {
    equipamentos[index] = equipamento
    localStorage.setItem(STORAGE_KEYS.EQUIPAMENTOS, JSON.stringify(equipamentos))
  }
  return equipamento
}

export const deleteEquipamento = (id: string): void => {
  const equipamentos = getEquipamentos()
  localStorage.setItem(STORAGE_KEYS.EQUIPAMENTOS, JSON.stringify(equipamentos.filter((e) => e.id !== id)))
}

// Funções para manipular usuários
export const getUsuarios = (): Usuario[] => {
  if (typeof window === "undefined") return []
  const usuarios = localStorage.getItem(STORAGE_KEYS.USUARIOS)
  return usuarios ? JSON.parse(usuarios) : []
}

export const getUsuario = (id: string): Usuario | undefined => {
  const usuarios = getUsuarios()
  return usuarios.find((user) => user.id === id)
}

export const getUsuarioByEmail = (email: string): Usuario | undefined => {
  const usuarios = getUsuarios()
  return usuarios.find((user) => user.email === email)
}

export const saveUsuario = (usuario: Omit<Usuario, "id">): Usuario => {
  const usuarios = getUsuarios()
  const novoUsuario = { ...usuario, id: generateId() }
  localStorage.setItem(STORAGE_KEYS.USUARIOS, JSON.stringify([...usuarios, novoUsuario]))
  return novoUsuario
}

export const updateUsuario = (usuario: Usuario): Usuario => {
  const usuarios = getUsuarios()
  const index = usuarios.findIndex((u) => u.id === usuario.id)
  if (index !== -1) {
    usuarios[index] = usuario
    localStorage.setItem(STORAGE_KEYS.USUARIOS, JSON.stringify(usuarios))
  }
  return usuario
}

export const deleteUsuario = (id: string): void => {
  const usuarios = getUsuarios()
  localStorage.setItem(STORAGE_KEYS.USUARIOS, JSON.stringify(usuarios.filter((u) => u.id !== id)))
}

// Funções para autenticação
export const setUsuarioAtual = (usuario: Usuario): void => {
  localStorage.setItem(STORAGE_KEYS.USUARIO_ATUAL, JSON.stringify(usuario))
}

export const getUsuarioAtual = (): Usuario | null => {
  if (typeof window === "undefined") return null
  const usuario = localStorage.getItem(STORAGE_KEYS.USUARIO_ATUAL)
  return usuario ? JSON.parse(usuario) : null
}

export const logout = (): void => {
  localStorage.removeItem(STORAGE_KEYS.USUARIO_ATUAL)
}

// Função para inicializar dados de exemplo
export const initializeData = (): void => {
  // Verificar se já existem dados
  if (getUsuarios().length > 0) return

  // Criar usuários de exemplo
  const usuarios: Omit<Usuario, "id">[] = [
    {
      nome: "Administrador",
      email: "admin@escola.com",
      senha: "senha123",
      perfil: "admin",
    },
    {
      nome: "Diretor Silva",
      email: "direcao@escola.com",
      senha: "senha123",
      perfil: "direcao",
    },
    {
      nome: "Professor João",
      email: "professor@escola.com",
      senha: "senha123",
      perfil: "professor",
    },
  ]

  usuarios.forEach((usuario) => saveUsuario(usuario))

  // Criar turmas de exemplo
  const turmas: Omit<Turma, "id">[] = [
    {
      nome: "6º Ano A",
      serie: "6º Ano",
      periodo: "Manhã",
      professor: "Professor João",
    },
    {
      nome: "7º Ano B",
      serie: "7º Ano",
      periodo: "Manhã",
      professor: "Professora Maria",
    },
    {
      nome: "8º Ano C",
      serie: "8º Ano",
      periodo: "Tarde",
      professor: "Professor Carlos",
    },
    {
      nome: "9º Ano A",
      serie: "9º Ano",
      periodo: "Tarde",
      professor: "Professora Ana",
    },
  ]

  turmas.forEach((turma) => saveTurma(turma))

  // Criar alunos de exemplo
  const alunos: Omit<Aluno, "id">[] = [
    {
      nome: "João Silva",
      turma: "9º Ano A",
      matricula: "20230001",
      dataNascimento: "2008-05-15",
      responsavel: "Maria Silva",
      contato: "(11) 98765-4321",
    },
    {
      nome: "Ana Souza",
      turma: "7º Ano B",
      matricula: "20230002",
      dataNascimento: "2010-03-22",
      responsavel: "Carlos Souza",
      contato: "(11) 98765-4322",
    },
    {
      nome: "Pedro Almeida",
      turma: "8º Ano C",
      matricula: "20230003",
      dataNascimento: "2009-07-10",
      responsavel: "Joana Almeida",
      contato: "(11) 98765-4323",
    },
    {
      nome: "Mariana Lima",
      turma: "6º Ano A",
      matricula: "20230004",
      dataNascimento: "2011-11-05",
      responsavel: "Roberto Lima",
      contato: "(11) 98765-4324",
    },
    {
      nome: "Lucas Mendes",
      turma: "9º Ano B",
      matricula: "20230005",
      dataNascimento: "2008-02-18",
      responsavel: "Fernanda Mendes",
      contato: "(11) 98765-4325",
    },
  ]

  alunos.forEach((aluno) => saveAluno(aluno))
}
