import type { Hackathon } from "@/types/database";
import Link from "next/link";

function formatRange(starts: string, ends: string, tz: string) {
  try {
    const s = new Date(starts);
    const e = new Date(ends);
    const opts: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: tz || "UTC",
    };
    return `${s.toLocaleString(undefined, opts)} → ${e.toLocaleString(undefined, { ...opts, hour: "2-digit", minute: "2-digit" })}`;
  } catch {
    return `${starts} → ${ends}`;
  }
}

function locationLine(h: Hackathon) {
  const parts = [h.city, h.region, h.country].filter(Boolean);
  return parts.length ? parts.join(", ") : "Location TBA";
}

export function HackathonCards({ hackathons }: { hackathons: Hackathon[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {hackathons.map((h) => (
        <li key={h.id}>
          <Link
            href={`/hackathons/${h.slug}`}
            className="group block h-full rounded-2xl border border-border/80 bg-gradient-to-br from-[#5484A4]/[0.1] via-[#121d2c] to-[#D396A6]/[0.07] p-5 shadow-md shadow-black/30 ring-1 ring-[#ACC0D3]/10 transition hover:border-highlight/45 hover:from-[#5484A4]/[0.14] hover:shadow-lg hover:shadow-highlight/15"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-foreground transition group-hover:text-accent">
                {h.title}
              </h3>
              <span className="shrink-0 rounded-full border border-border bg-background/80 px-2 py-0.5 text-xs capitalize text-muted-foreground">
                {h.status}
              </span>
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
              {h.description || "Details coming soon."}
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              {formatRange(h.starts_at, h.ends_at, h.timezone)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground/90">
              <span className="text-muted-foreground/60">Location · </span>
              {locationLine(h)}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function HackathonGrid({
  hackathons,
  empty,
}: {
  hackathons: Hackathon[];
  empty: boolean;
}) {
  if (empty) {
    return (
      <div className="hf-card border-dashed px-8 py-16 text-center">
        <p className="text-lg font-medium text-foreground">No published hackathons yet</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Be the first to list an event — deposits and payouts will tie in here as we
          ship escrow.
        </p>
        <Link href="/hackathons/new" className="hf-btn-primary mt-8 inline-flex">
          Create a hackathon
        </Link>
      </div>
    );
  }

  return <HackathonCards hackathons={hackathons} />;
}
