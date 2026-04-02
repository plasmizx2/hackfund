import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function HomePage() {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("hackathons")
    .select("*", { count: "exact", head: true })
    .eq("status", "published");

  const publishedCount = error ? null : (count ?? 0);

  const pillars: {
    title: string;
    body: string;
    bar: "coral" | "teal" | "rose";
  }[] = [
    {
      title: "Discover",
      body: "Browse published hackathons, dates, and locations in one feed.",
      bar: "coral",
    },
    {
      title: "Participate",
      body: "Mark events you join; track them under My hackathons with search and filters.",
      bar: "teal",
    },
    {
      title: "Showcase",
      body: "Prize totals and team projects surface on each event as data fills in.",
      bar: "rose",
    },
  ];

  const barClass = {
    coral: "from-accent/90 to-accent/40",
    teal: "from-highlight to-highlight/50",
    rose: "from-secondary to-secondary/50",
  } as const;

  return (
    <div className="space-y-16 pb-8">
      <section className="hf-card relative overflow-hidden px-8 py-14 sm:px-12 sm:py-20">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gradient-to-br from-accent/25 to-transparent blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-64 w-64 rounded-full bg-gradient-to-tr from-highlight/20 to-transparent blur-3xl" />
        <div className="pointer-events-none absolute right-1/4 top-1/2 h-48 w-48 rounded-full bg-[#F6C992]/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-8 right-8 h-32 w-32 rounded-full bg-secondary/15 blur-2xl" />

        <div className="relative mx-auto max-w-2xl text-center">
          <p className="bg-gradient-to-r from-accent via-warm to-highlight bg-clip-text text-xs font-semibold uppercase tracking-[0.22em] text-transparent">
            HackFund
          </p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl sm:leading-[1.1]">
            Hackathons, prizes, and builds in one place
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">
            Discover events near you. List your own. We&apos;re building toward escrowed
            prize pools and a showcase for what teams ship.
          </p>
          {publishedCount !== null ? (
            <p className="mt-4 text-sm text-dusty/95">
              <span className="tabular-nums font-medium text-warm">{publishedCount}</span>{" "}
              published {publishedCount === 1 ? "event" : "events"} live
            </p>
          ) : null}

          <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link href="/discover" className="hf-btn-primary px-8 py-3.5 text-base">
              Browse hackathons
            </Link>
            <Link href="/hackathons/new" className="hf-btn-secondary px-8 py-3.5 text-base">
              List an event
            </Link>
          </div>
        </div>
      </section>

      <section className="hf-band-rose-teal rounded-3xl border border-border/60 px-4 py-10 sm:px-8">
        <div className="grid gap-6 sm:grid-cols-3">
          {pillars.map((item) => (
            <div
              key={item.title}
              className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/50 px-5 py-6 shadow-lg shadow-black/20 ring-1 ring-white/[0.04]"
            >
              <div
                className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b ${barClass[item.bar]}`}
                aria-hidden
              />
              <h2 className="pl-3 text-sm font-semibold uppercase tracking-[0.14em]">
                <span
                  className={
                    item.bar === "coral"
                      ? "text-accent"
                      : item.bar === "teal"
                        ? "text-highlight"
                        : "text-secondary"
                  }
                >
                  {item.title}
                </span>
              </h2>
              <p className="mt-3 pl-3 text-sm leading-relaxed text-muted-foreground">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
