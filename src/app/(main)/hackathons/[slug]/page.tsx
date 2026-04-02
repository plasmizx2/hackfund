import { createClient } from "@/lib/supabase/server";
import { ParticipateSection } from "@/components/participate-section";
import type { Award, Hackathon, Project } from "@/types/database";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function HackathonDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: row, error } = await supabase
    .from("hackathons")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !row) {
    notFound();
  }

  const hackathon = row as Hackathon;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isParticipating = false;
  if (user) {
    const { data: part } = await supabase
      .from("hackathon_participations")
      .select("id")
      .eq("hackathon_id", hackathon.id)
      .eq("user_id", user.id)
      .maybeSingle();
    isParticipating = !!part;
  }

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("hackathon_id", hackathon.id)
    .order("created_at", { ascending: false });

  const { data: awards } = await supabase
    .from("awards")
    .select("*")
    .eq("hackathon_id", hackathon.id)
    .order("placement", { ascending: true });

  const projectList = (projects ?? []) as Project[];
  const awardList = (awards ?? []) as Award[];

  const prizeTotal = awardList.reduce(
    (acc, a) => acc + Number(a.prize_amount_cents),
    0,
  );

  return (
    <article className="space-y-12">
      <div>
        <Link
          href="/discover"
          className="text-sm text-muted-foreground transition hover:text-accent"
        >
          ← Discover
        </Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="inline-block rounded-full border border-border bg-card px-2.5 py-0.5 text-xs capitalize text-muted-foreground">
              {hackathon.status}
            </span>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {hackathon.title}
            </h1>
            <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
              {hackathon.description || "No description yet."}
            </p>
          </div>
          {hackathon.website_url ? (
            <a
              href={hackathon.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-accent/40 bg-accent/90 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-accent/20 transition hover:bg-accent hover:brightness-105"
            >
              Official site
            </a>
          ) : null}
        </div>
        <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card/90 px-4 py-3 shadow-sm shadow-black/10">
            <dt className="text-muted-foreground">When</dt>
            <dd className="font-medium text-foreground">
              {new Date(hackathon.starts_at).toLocaleString(undefined, {
                timeZone: hackathon.timezone,
              })}{" "}
              —{" "}
              {new Date(hackathon.ends_at).toLocaleString(undefined, {
                timeZone: hackathon.timezone,
              })}
            </dd>
          </div>
          <div className="rounded-2xl border border-border bg-card/90 px-4 py-3 shadow-sm shadow-black/10">
            <dt className="text-muted-foreground">Where</dt>
            <dd className="font-medium text-foreground">
              {[hackathon.city, hackathon.country].filter(Boolean).join(", ") ||
                "TBA"}
            </dd>
          </div>
        </dl>
        {user ? (
          <div className="mt-6">
            <ParticipateSection
              hackathonId={hackathon.id}
              slug={slug}
              initialJoined={isParticipating}
              isOrganizer={user.id === hackathon.organizer_id}
            />
          </div>
        ) : null}
      </div>

      <section>
        <h2 className="text-lg font-semibold text-foreground">Prize pool (tracked)</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Escrow integration comes next — totals from recorded awards for this event.
        </p>
        <p className="mt-4 text-3xl font-semibold tabular-nums text-accent">
          ${(prizeTotal / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">Winners &amp; prizes</h2>
        {awardList.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-border bg-card/50 px-4 py-8 text-center text-sm text-muted-foreground">
            No awards posted yet. Organizers can add placements once judging is done.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {awardList.map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card/80 px-4 py-3 shadow-sm shadow-black/10"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {a.label ||
                      (a.placement != null ? `#${a.placement}` : "Award")}
                    {a.category ? (
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        {a.category}
                      </span>
                    ) : null}
                  </p>
                  {a.project_id ? (
                    <p className="text-xs text-muted-foreground">
                      Linked project in database
                    </p>
                  ) : null}
                </div>
                <p className="tabular-nums text-accent">
                  ${(Number(a.prize_amount_cents) / 100).toFixed(2)}{" "}
                  {a.currency}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">Showcase — what people built</h2>
        {projectList.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-border bg-card/50 px-4 py-8 text-center text-sm text-muted-foreground">
            No projects submitted yet. Teams will appear here for the community to browse.
          </p>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {projectList.map((p) => (
              <li
                key={p.id}
                className="rounded-2xl border border-border bg-card/90 p-4 shadow-sm shadow-black/10"
              >
                <h3 className="font-medium text-foreground">{p.title}</h3>
                {p.tagline ? (
                  <p className="mt-1 text-sm text-muted-foreground">{p.tagline}</p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-3 text-xs">
                  {p.demo_url ? (
                    <a
                      href={p.demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-accent hover:underline"
                    >
                      Demo
                    </a>
                  ) : null}
                  {p.repo_url ? (
                    <a
                      href={p.repo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground hover:underline"
                    >
                      Repo
                    </a>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </article>
  );
}
