import { extractJson, getAiEnv, runChat, type ChatMessage } from "@/lib/ai/llm";
import { NextResponse } from "next/server";

export type EnhanceFieldId =
  | "title"
  | "description"
  | "schedule"
  | "place"
  | "website";

export async function POST(request: Request) {
  let body: { field?: string; raw?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const field = body.field as EnhanceFieldId;
  const raw = (body.raw ?? "").trim();
  if (!raw) {
    return NextResponse.json({ error: "Say something first — even rough notes are fine." }, { status: 400 });
  }
  if (raw.length > 8000) {
    return NextResponse.json({ error: "Too long" }, { status: 400 });
  }

  const allowed: EnhanceFieldId[] = ["title", "description", "schedule", "place", "website"];
  if (!field || !allowed.includes(field)) {
    return NextResponse.json({ error: "Invalid field" }, { status: 400 });
  }

  const today = new Date().toISOString().slice(0, 10);

  try {
    switch (field) {
      case "title": {
        const out = await runChat(
          [
            {
              role: "system",
              content:
                "You polish hackathon event titles. Output ONLY the title text: clear, inviting, under 90 characters. No quotes, no explanation.",
            },
            { role: "user", content: raw },
          ],
          false,
        );
        return NextResponse.json({ title: out.replace(/^["']|["']$/g, "").trim() });
      }
      case "description": {
        const out = await runChat(
          [
            {
              role: "system",
              content:
                "You write short hackathon descriptions for HackFund. 2–4 short paragraphs or tight bullets. Keep facts the user gave; do not invent prize amounts or sponsors. Output only the description text.",
            },
            { role: "user", content: raw },
          ],
          false,
        );
        return NextResponse.json({ description: out });
      }
      case "schedule": {
        const messages: ChatMessage[] = [
          {
            role: "system",
            content: `Today's date is ${today} (ISO). The user says when a hackathon runs (natural language).
You must respond with JSON only (no markdown). The JSON object must have keys: starts_at, ends_at, timezone (IANA, e.g. America/New_York).
Values for starts_at and ends_at must be ISO 8601 strings. If the user omits end time, assume a 36–48 hour hackathon after start. If year missing, use the next occurrence after today.`,
          },
          { role: "user", content: `${raw}\n\nRespond with valid JSON only.` },
        ];
        const out = await runChat(messages, true);
        const parsed = extractJson(out) as {
          starts_at?: string;
          ends_at?: string;
          timezone?: string;
        };
        return NextResponse.json({
          starts_at: parsed.starts_at ?? null,
          ends_at: parsed.ends_at ?? null,
          timezone: parsed.timezone ?? "America/New_York",
        });
      }
      case "place": {
        const messages: ChatMessage[] = [
          {
            role: "system",
            content:
              'Return ONLY JSON: {"city":"...","country":"..."} using the user\'s words. Expand abbreviations (e.g. SF → San Francisco) when obvious. If country missing, guess from city or use "USA" only if clearly US.',
          },
          { role: "user", content: raw },
        ];
        const out = await runChat(messages, true);
        const parsed = extractJson(out) as { city?: string; country?: string };
        return NextResponse.json({
          city: (parsed.city ?? "").trim() || null,
          country: (parsed.country ?? "").trim() || null,
        });
      }
      case "website": {
        const lower = raw.toLowerCase();
        if (
          lower === "none" ||
          lower === "no" ||
          lower === "n/a" ||
          lower === "skip" ||
          lower === "nothing"
        ) {
          return NextResponse.json({ website_url: "" });
        }
        const out = await runChat(
          [
            {
              role: "system",
              content:
                "Output ONLY a full https:// URL for the hackathon website, or the empty string if the user did not give a usable URL. No markdown.",
            },
            { role: "user", content: raw },
          ],
          false,
        );
        const url = out.trim().replace(/^["']|["']$/g, "");
        return NextResponse.json({ website_url: url.startsWith("http") ? url : url ? `https://${url}` : "" });
      }
      default:
        return NextResponse.json({ error: "Unknown field" }, { status: 400 });
    }
  } catch (e) {
    const { openaiKey, ollamaModel } = getAiEnv();
    const msg = e instanceof Error ? e.message : "Model request failed";
    return NextResponse.json(
      {
        error: msg,
        hint: openaiKey
          ? "Check OPENAI_API_KEY and OPENAI_MODEL if set."
          : `Ollama: run \`ollama pull ${ollamaModel}\` (or set OLLAMA_MODEL to a model you have). Or set OPENAI_API_KEY to use the API instead.`,
      },
      { status: 503 },
    );
  }
}
