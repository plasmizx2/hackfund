"use client";

import { LocationPicker } from "@/components/location-picker";
import { createHackathonForm } from "@/app/(main)/hackathons/new/actions";
import { slugify } from "@/lib/slugify";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

const STEPS = [
  {
    field: "title" as const,
    question: "What should we call this hackathon?",
    hint: "Say it casually — we’ll clean it up.",
  },
  {
    field: "description" as const,
    question: "What should people know?",
    hint: "Theme, vibe, prizes, who it’s for — rough notes are fine.",
  },
  {
    field: "schedule" as const,
    question: "When does it run?",
    hint: "e.g. “May 10–11 2026” or “next weekend from Saturday 9am”.",
  },
  {
    field: "place" as const,
    question: "Where is it?",
    hint: "City and country are enough to start.",
  },
  {
    field: "website" as const,
    question: "Official website?",
    hint: "Optional — paste a URL or type “none”.",
  },
];


/** ISO string → value for datetime-local input (browser local). */
function isoToDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function HackathonFormClient({ error }: { error: string | null }) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [timezone, setTimezone] = useState("America/New_York");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [status, setStatus] = useState("published");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const step = STEPS[stepIndex];
  const isLastStep = stepIndex >= STEPS.length - 1;

  const applyTitle = useCallback((t: string) => {
    const clean = t.trim();
    setTitle(clean);
    setSlug(slugify(clean));
  }, []);

  const polishAndFill = useCallback(async () => {
    const raw = draft.trim();
    if (!raw) {
      setBanner({ kind: "err", text: "Type something first." });
      return;
    }
    if (!step) return;
    setLoading(true);
    setBanner(null);
    try {
      const res = await fetch("/api/ai/enhance-field", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field: step.field, raw }),
      });
      const data = (await res.json()) as Record<string, unknown>;

      if (!res.ok) {
        let errText =
          typeof data.error === "string" ? data.error : "Request failed.";
        if (errText.startsWith("{")) {
          try {
            const j = JSON.parse(errText) as { error?: string };
            if (j.error) errText = j.error;
          } catch {
            /* keep */
          }
        }
        const hint = typeof data.hint === "string" ? data.hint : "";
        setBanner({
          kind: "err",
          text: hint ? `${errText} — ${hint}` : errText,
        });
        return;
      }

      switch (step.field) {
        case "title":
          applyTitle(String(data.title ?? ""));
          setBanner({ kind: "ok", text: "Title updated." });
          break;
        case "description":
          setDescription(String(data.description ?? ""));
          setBanner({ kind: "ok", text: "Description updated." });
          break;
        case "schedule": {
          const s = data.starts_at ? isoToDatetimeLocal(String(data.starts_at)) : "";
          const e = data.ends_at ? isoToDatetimeLocal(String(data.ends_at)) : "";
          if (s) setStartsAt(s);
          if (e) setEndsAt(e);
          if (data.timezone) setTimezone(String(data.timezone));
          setBanner({
            kind: "ok",
            text: s && e ? "Dates filled — review them on the left." : "Partially filled — check dates.",
          });
          break;
        }
        case "place":
          if (data.city) setCity(String(data.city));
          if (data.country) setCountry(String(data.country));
          setBanner({ kind: "ok", text: "Location updated." });
          break;
        case "website":
          setWebsiteUrl(String(data.website_url ?? ""));
          setBanner({ kind: "ok", text: "Website field updated." });
          break;
      }
      setDraft("");
      if (!isLastStep) setStepIndex((i) => i + 1);
    } catch {
      setBanner({ kind: "err", text: "Network error." });
    } finally {
      setLoading(false);
    }
  }, [draft, step, isLastStep, applyTitle]);

  const skipStep = useCallback(() => {
    setDraft("");
    setBanner(null);
    if (!isLastStep) setStepIndex((i) => i + 1);
  }, [isLastStep]);

  const progress = useMemo(
    () => STEPS.map((_, i) => (i < stepIndex ? "done" : i === stepIndex ? "current" : "todo")),
    [stepIndex],
  );

  return (
    <div className="mx-auto max-w-6xl">
      <Link
        href="/discover"
        className="text-sm text-muted-foreground transition hover:text-accent"
      >
        ← Back to discover
      </Link>
      <h1 className="mt-6 text-2xl font-semibold text-foreground">List a hackathon</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Use the assistant on the right to answer in plain language — one topic at a time — or fill
        the form directly.
      </p>

      {error ? (
        <div className="mt-6 rounded-xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {decodeURIComponent(error)}
        </div>
      ) : null}

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_minmax(280px,340px)] lg:items-start">
        <form action={createHackathonForm} className="min-w-0 space-y-5">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-foreground/90">
              Title
            </label>
            <input
              id="title"
              name="title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="hf-input mt-1.5"
              placeholder="Spring AI Hack 2026"
            />
          </div>
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-foreground/90">
              URL slug <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <input
              id="slug"
              name="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="hf-input mt-1.5 font-mono text-sm"
              placeholder="spring-ai-hack-2026"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-foreground/90">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="hf-input mt-1.5 resize-y"
              placeholder="What builders should expect…"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="starts_at" className="block text-sm font-medium text-foreground/90">
                Starts
              </label>
              <input
                id="starts_at"
                name="starts_at"
                type="datetime-local"
                required
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="hf-input mt-1.5"
              />
            </div>
            <div>
              <label htmlFor="ends_at" className="block text-sm font-medium text-foreground/90">
                Ends
              </label>
              <input
                id="ends_at"
                name="ends_at"
                type="datetime-local"
                required
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="hf-input mt-1.5"
              />
            </div>
          </div>
          <div>
            <label htmlFor="timezone" className="block text-sm font-medium text-foreground/90">
              Timezone
            </label>
            <input
              id="timezone"
              name="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="hf-input mt-1.5 font-mono text-sm"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-foreground/90">
                City
              </label>
              <input
                id="city"
                name="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="hf-input mt-1.5"
                placeholder="San Francisco"
              />
            </div>
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-foreground/90">
                Country
              </label>
              <input
                id="country"
                name="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="hf-input mt-1.5"
                placeholder="USA"
              />
            </div>
          </div>
          <LocationPickerBridge lat={lat} lng={lng} onLatLngChange={(la, lo) => { setLat(la); setLng(lo); }} />
          <div>
            <label htmlFor="website_url" className="block text-sm font-medium text-foreground/90">
              Website
            </label>
            <input
              id="website_url"
              name="website_url"
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="hf-input mt-1.5"
              placeholder="https://"
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-foreground/90">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="hf-input mt-1.5"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <button type="submit" className="hf-btn-primary w-full py-3">
            Create hackathon
          </button>
        </form>

        <aside className="lg:sticky lg:top-28">
          <div className="rounded-2xl border border-secondary/30 bg-secondary-muted p-5 shadow-xl shadow-black/25 ring-1 ring-white/[0.04]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
              Assistant
            </p>
            <p className="mt-3 text-sm font-medium text-foreground">
              {step ? step.question : "Done"}
            </p>
            {step ? (
              <p className="mt-1 text-xs text-muted-foreground">{step.hint}</p>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">Review the form and submit.</p>
            )}

            <div className="mt-4 flex gap-1.5">
              {progress.map((p, i) => (
                <span
                  key={STEPS[i].field}
                  className={
                    p === "done"
                      ? "h-1.5 flex-1 rounded-full bg-accent"
                      : p === "current"
                        ? "h-1.5 flex-1 rounded-full bg-secondary"
                        : "h-1.5 flex-1 rounded-full bg-border"
                  }
                  title={STEPS[i].field}
                />
              ))}
            </div>

            {step ? (
              <>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={4}
                  className="mt-4 w-full resize-y rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-secondary/50 focus:ring-2 focus:ring-secondary/25"
                  placeholder="Type your answer here…"
                  disabled={loading}
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={polishAndFill}
                    disabled={loading}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-secondary/20 transition hover:brightness-110 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Working…
                      </>
                    ) : (
                      "Polish & fill"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={skipStep}
                    disabled={loading}
                    className="rounded-xl border border-border px-4 py-2.5 text-sm text-muted-foreground transition hover:bg-card disabled:opacity-50"
                  >
                    Skip
                  </button>
                </div>
              </>
            ) : null}

            {banner ? (
              <p
                className={
                  banner.kind === "ok"
                    ? "mt-4 text-xs text-accent"
                    : "mt-4 text-xs text-amber-200/90"
                }
              >
                {banner.text}
              </p>
            ) : (
              <p className="mt-4 text-xs text-muted-foreground/80">
                Small models work well — one short answer per step. Ollama locally, or{" "}
                <code className="rounded bg-background/80 px-1 font-mono text-[0.8rem] text-muted-foreground">
                  OPENAI_API_KEY
                </code>{" "}
                in{" "}
                <code className="rounded bg-background/80 px-1 font-mono text-[0.8rem] text-muted-foreground">
                  .env.local
                </code>
                .
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

/** Wraps LocationPicker with synced lat/lng for controlled form. */
function LocationPickerBridge({
  lat,
  lng,
  onLatLngChange,
}: {
  lat: string;
  lng: string;
  onLatLngChange: (lat: string, lng: string) => void;
}) {
  return <LocationPicker controlledLat={lat} controlledLng={lng} onLatLngChange={onLatLngChange} />;
}
