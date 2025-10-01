const API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MAX_RETRIES = 3;
const RATE_LIMIT_DELAY = 2000;
const MODEL = "llama3-70b-8192";
const GROQ_API_KEY = process.env.GROQ_API_KEY;

export default async function groq(message: string, retryCount = 0) {
  const systemPrompt = `Você é Joy, uma assistente especializada em apoiar professores e coordenadores na elaboração de textos formais para advertências escolares, garantindo clareza, objetividade e tom adequado.`;

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
    }),
  });

  if (response.status === 429 && retryCount < MAX_RETRIES) {
    await new Promise((r) => setTimeout(r, RATE_LIMIT_DELAY));
    return groq(message, retryCount + 1);
  }

  if (!response.ok) throw new Error(await response.text());
  const result = await response.json();
  const text = result.choices[0]?.message?.content?.trim().toLowerCase();

  return text;
}
