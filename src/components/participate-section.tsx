"use client";

import { setParticipation } from "@/app/(main)/hackathons/[slug]/actions";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function ParticipateSection({
  hackathonId,
  slug,
  initialJoined,
  isOrganizer,
}: {
  hackathonId: string;
  slug: string;
  initialJoined: boolean;
  isOrganizer: boolean;
}) {
  const router = useRouter();
  const [joined, setJoined] = useState(initialJoined);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggle() {
    setError(null);
    const next = !joined;
    startTransition(async () => {
      const res = await setParticipation(hackathonId, slug, next);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setJoined(next);
      router.refresh();
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-card/80 px-5 py-4 shadow-sm shadow-black/15 ring-1 ring-white/[0.03]">
      <p className="text-sm font-medium text-foreground">Your participation</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {isOrganizer
          ? "You listed this event. You can still mark yourself as a participant for your history."
          : "Save this hackathon to your profile so it appears under “Hackathons you joined.”"}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={toggle}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            joined
              ? "border border-accent/45 bg-accent-muted text-accent hover:bg-accent/20"
              : "border border-border bg-background-elevated text-foreground hover:border-border-strong hover:bg-card"
          } disabled:opacity-60`}
        >
          {pending ? "Saving…" : joined ? "✓ On my list" : "I’m participating"}
        </button>
        {error ? <span className="text-xs text-red-300">{error}</span> : null}
      </div>
    </div>
  );
}
