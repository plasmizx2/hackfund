export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export async function chatOpenAI(
  apiKey: string,
  messages: ChatMessage[],
  options?: { jsonMode?: boolean; model?: string; maxTokens?: number },
): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: options?.model ?? process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      messages,
      temperature: 0.35,
      max_tokens: options?.maxTokens ?? 1024,
      ...(options?.jsonMode ? { response_format: { type: "json_object" as const } } : {}),
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const out = data.choices?.[0]?.message?.content?.trim();
  if (!out) throw new Error("Empty OpenAI response");
  return out;
}

export async function chatOllamaChat(
  baseUrl: string,
  model: string,
  messages: ChatMessage[],
  options?: { numPredict?: number },
): Promise<string> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 120_000);

  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: controller.signal,
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      options: { temperature: 0.35, num_predict: options?.numPredict ?? 1024 },
    }),
  }).finally(() => clearTimeout(t));

  if (!res.ok) {
    const errText = await res.text();
    let message = errText.slice(0, 500) || `HTTP ${res.status}`;
    try {
      const j = JSON.parse(errText) as { error?: string };
      if (typeof j.error === "string" && j.error.trim()) {
        message = j.error.trim();
      }
    } catch {
      /* keep raw snippet */
    }
    throw new Error(message);
  }

  const data = (await res.json()) as { message?: { content?: string } };
  const out = data.message?.content?.trim();
  if (!out) throw new Error("Empty Ollama response");
  return out;
}

export function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = (fenced ? fenced[1] : trimmed).trim();
  return JSON.parse(raw);
}

export function getAiEnv() {
  const openaiKey = process.env.OPENAI_API_KEY;
  const ollamaUrl = (process.env.OLLAMA_URL ?? "http://127.0.0.1:11434").replace(/\/$/, "");
  /** Default matches `ollama pull llama3.2` (avoid :1b tags that may be missing locally). */
  const ollamaModel = process.env.OLLAMA_MODEL ?? "llama3.2";
  return { openaiKey, ollamaUrl, ollamaModel };
}

export async function runChat(messages: ChatMessage[], jsonMode?: boolean): Promise<string> {
  const { openaiKey, ollamaUrl, ollamaModel } = getAiEnv();
  if (openaiKey) {
    return chatOpenAI(openaiKey, messages, { jsonMode, maxTokens: jsonMode ? 512 : 1024 });
  }
  return chatOllamaChat(ollamaUrl, ollamaModel, messages, {
    numPredict: jsonMode ? 400 : 900,
  });
}
