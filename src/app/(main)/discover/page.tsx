import { HackathonGrid } from "@/components/hackathon-grid";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function DiscoverPage() {
  const supabase = await createClient();
  const { data: hackathons, error } = await supabase
    .from("hackathons")
    .select("*")
    .eq("status", "published")
    .order("starts_at", { ascending: true });

  if (error) {
    return (
      <div className="rounded-2xl border border-amber-500/35 bg-amber-500/[0.07] p-6 text-amber-100 shadow-lg shadow-black/20">
        <p className="font-medium">Database not ready</p>
        <p className="mt-2 text-sm text-amber-100/85">
          Run the SQL in{" "}
          <code className="rounded-md bg-black/35 px-1.5 py-0.5 font-mono text-xs text-amber-200/90">
            supabase/migrations/001_initial_schema.sql
          </code>{" "}
          in the Supabase SQL Editor, then refresh.
        </p>
        <p className="mt-2 font-mono text-xs text-amber-200/55">{error.message}</p>
      </div>
    );
  }

  const list = hackathons ?? [];

  return (
    <div className="space-y-10">
      <div className="hf-card border-border/70 px-6 py-7 sm:px-8">
        <Link href="/" className="text-sm text-muted-foreground transition hover:text-highlight">
          ← Home
        </Link>
        <h1 className="mt-4 bg-gradient-to-r from-foreground via-dusty to-highlight/90 bg-clip-text text-3xl font-semibold tracking-tight text-transparent sm:text-4xl">
          Discover hackathons
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Published events open to builders. Save ones you join from each event page — they
          show up under My hackathons.
        </p>
      </div>

      <section className="rounded-3xl border border-border/50 bg-gradient-to-b from-secondary-muted/25 via-transparent to-highlight-muted/20 px-1 py-8 sm:px-4">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Upcoming &amp; open
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {list.length} published {list.length === 1 ? "event" : "events"}
            </p>
          </div>
        </div>
        <HackathonGrid hackathons={list} empty={list.length === 0} />
      </section>
    </div>
  );
}
