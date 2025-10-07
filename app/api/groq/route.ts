import { NextResponse } from "next/server";

const API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";
const MAX_RETRIES = 3;
const RATE_LIMIT_DELAY = 2000;
const GROQ_API_KEY = process.env.GROQ_API_KEY!;

async function groq(message: string, retryCount = 0): Promise<string> {
  const systemPrompt = `
Você é Joy, uma assistente especializada em redigir motivos de advertência escolar de forma formal, clara e objetiva.

Sua tarefa é reescrever o texto enviado pelo usuário, mantendo o mesmo sentido, mas ampliando-o de modo que fique mais completo e explicativo, com até 300 caracteres.

Regras:
- Responda apenas com o texto aprimorado do motivo.
- Não adicione introduções, explicações ou formatações (sem markdown, aspas ou listas).
- Use linguagem formal e impessoal, adequada a registros escolares.
- Não invente fatos novos; apenas torne o motivo mais claro e detalhado.
- O texto final deve parecer um motivo de advertência pronto para registro.

Exemplo:
Usuário: "O aluno arrumou briga e bateu no outro."
Resposta: "O aluno envolveu-se em uma briga durante o horário escolar, demonstrando comportamento agressivo ao agredir um colega, contrariando as normas de convivência e respeito da instituição."
`;

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      temperature: 0,
      max_tokens: 300,
    }),
  });

  if (response.status === 429 && retryCount < MAX_RETRIES) {
    await new Promise((r) => setTimeout(r, RATE_LIMIT_DELAY));
    return groq(message, retryCount + 1);
  }

  if (!response.ok) {
    const errText = await response.text();
    console.error("Erro Groq API:", errText);
    throw new Error(errText);
  }

  const result = await response.json();
  return result.choices?.[0]?.message?.content?.trim() || "";
}

export async function POST(req: Request) {
  try {
    const body = await req.text();

    const { message } = JSON.parse(body);
    const resposta = await groq(message);
    return NextResponse.json({ resposta });
  } catch (err: any) {
    console.error("Erro no endpoint /api/groq:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
