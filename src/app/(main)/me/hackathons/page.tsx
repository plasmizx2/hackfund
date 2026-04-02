import { MyHackathonsClient } from "./my-hackathons-client";
import { createClient } from "@/lib/supabase/server";
import type { Hackathon } from "@/types/database";
import Link from "next/link";

function splitByEnded(hackathons: Hackathon[]) {
  const now = Date.now();
  const upcoming: Hackathon[] = [];
  const past: Hackathon[] = [];
  for (const h of hackathons) {
    if (new Date(h.ends_at).getTime() >= now) upcoming.push(h);
    else past.push(h);
  }
  upcoming.sort(
    (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
  );
  past.sort(
    (a, b) => new Date(b.ends_at).getTime() - new Date(a.ends_at).getTime(),
  );
  return { upcoming, past };
}

export default async function MyHackathonsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: posted, error: postedError } = await supabase
    .from("hackathons")
    .select("*")
    .eq("organizer_id", user.id)
    .order("starts_at", { ascending: false });

  const { data: participationRows, error: partError } = await supabase
    .from("hackathon_participations")
    .select("*, hackathons(*)")
    .eq("user_id", user.id);

  const dbError = postedError ?? partError;
  if (dbError) {
    const missingTable =
      dbError.message.includes("hackathon_participations") ||
      dbError.code === "42P01";
    return (
      <div className="space-y-6">
        <div>
          <Link
            href="/"
            className="text-sm text-muted-foreground transition hover:text-accent"
          >
            ← Home
          </Link>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
            My hackathons
          </h1>
        </div>
        <div className="rounded-2xl border border-amber-500/35 bg-amber-500/[0.07] p-6 text-amber-100 shadow-lg shadow-black/20">
          <p className="font-medium">
            {missingTable ? "Participations table missing" : "Could not load data"}
          </p>
          {missingTable ? (
            <p className="mt-2 text-sm text-amber-100/85">
              Run{" "}
              <code className="rounded-md bg-black/35 px-1.5 py-0.5 font-mono text-xs">
                supabase/migrations/002_hackathon_participations.sql
              </code>{" "}
              in the Supabase SQL Editor, then refresh.
            </p>
          ) : (
            <p className="mt-2 font-mono text-xs text-amber-200/55">{dbError.message}</p>
          )}
        </div>
      </div>
    );
  }

  const postedList = (posted ?? []) as Hackathon[];

  type Row = { hackathons: Hackathon | Hackathon[] | null };
  const joinedRaw: Hackathon[] = [];
  for (const row of (participationRows ?? []) as Row[]) {
    const h = row.hackathons;
    if (!h) continue;
    joinedRaw.push(Array.isArray(h) ? h[0] : h);
  }

  const joined = joinedRaw.filter(Boolean);
  const { upcoming: joinedUpcoming, past: joinedPast } = splitByEnded(joined);

  return (
    <div className="space-y-14">
      <div>
        <Link
          href="/"
          className="text-sm text-muted-foreground transition hover:text-accent"
        >
          ← Home
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
          My hackathons
        </h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Events you listed and hackathons you marked as participating in.
        </p>
      </div>

      <MyHackathonsClient
        posted={postedList}
        joinedUpcoming={joinedUpcoming}
        joinedPast={joinedPast}
      />
    </div>
  );
}
