import { NextResponse } from "next/server";

const API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";
const MAX_RETRIES = 3;
const RATE_LIMIT_DELAY = 2000;
const GROQ_API_KEY = process.env.GROQ_API_KEY!;

const gravityMap = {
  leve: { key: "leve", label: "Leve", color: "#22c55e", joyColor: "success" },
  moderado: { key: "moderado", label: "Moderado", color: "#f59e0b", joyColor: "warning" },
  grave: { key: "grave", label: "Grave", color: "#ef4444", joyColor: "danger" },
};

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
    throw new Error(errText);
  }
  const result = await response.json();
  return result.choices?.[0]?.message?.content?.trim() || "";
}

async function classifySeverity(
  message: string,
  retryCount = 0
): Promise<"leve" | "moderado" | "grave" | null> {
  const systemPrompt = `
Você é um classificador que, dada uma descrição do motivo de advertência escolar, deve devolver APENAS UMA DAS PALAVRAS:
"leve", "moderado" ou "grave"
Escolha o nível que mais condiz com a gravidade do comportamento descrito. Responda somente a palavra (sem pontuação).
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
      max_tokens: 10,
    }),
  });
  if (response.status === 429 && retryCount < MAX_RETRIES) {
    await new Promise((r) => setTimeout(r, RATE_LIMIT_DELAY));
    return classifySeverity(message, retryCount + 1);
  }
  if (!response.ok) {
    return null;
  }
  try {
    const result = await response.json();
    const txt = (result.choices?.[0]?.message?.content || "").trim().toLowerCase();
    if (txt.includes("leve")) return "leve";
    if (txt.includes("moderado")) return "moderado";
    if (txt.includes("grave")) return "grave";
    return null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const { message, autoClassify } = JSON.parse(body || "{}");
    const resposta = await groq(message);
    let gravidadeDetectada: "leve" | "moderado" | "grave" | null = null;
    if (autoClassify) {
      try {
        gravidadeDetectada = await classifySeverity(message);
      } catch {
        gravidadeDetectada = null;
      }
    }
    return NextResponse.json({
      resposta,
      gravityMap,
      gravidadeDetectada,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
