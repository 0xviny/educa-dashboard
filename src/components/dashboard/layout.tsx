import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-tl from-neutral-900 to-blue-500">
      <div className="flex flex-col justify-center bg-black/50 text-white p-10 rounded-2xl shadow-lg w-full max-w-2xl h-[700px] relative">
        <h1 className="text-center text-3xl font-bold mb-9">EDUCA DASHBOARD</h1>
        <p className="text-center text-xl mb-10">Olá👋, Seja Bem-vindo!</p>
        <p className="text-center text-2xl mb-6">Escolha um dos sistemas abaixo:</p>

        <div className="flex gap-6">
          <button
            className="w-1/2 bg-blue-500 hover:bg-blue-500/75 text-white font-bold py-7 rounded-lg text-lg transition cursor-pointer"
            onClick={() => console.log('Sistema de Ocorrências')}
          >
            Sistema de Ocorrências
          </button>
          <button
            className="w-1/2 bg-blue-500 hover:bg-blue-500/75 text-white font-bold py-7 rounded-lg text-lg transition cursor-pointer"
            onClick={() => router.push('/dash/loan')}
          >
            Sistema de Empréstimo
          </button>
        </div>
      </div>
    </div>
  );
}
