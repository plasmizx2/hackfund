"use client";

import { HackathonCards } from "@/components/hackathon-grid";
import type { Hackathon } from "@/types/database";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

function matchesQuery(h: Hackathon, q: string) {
  const t = q.trim().toLowerCase();
  if (!t) return true;
  const blob = [
    h.title,
    h.description,
    h.city,
    h.region,
    h.country,
    h.slug,
    h.venue_name,
    h.address_line,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return blob.includes(t);
}

function matchesLocation(h: Hackathon, city: string, region: string) {
  if (region && h.region !== region) return false;
  if (city && h.city !== city) return false;
  return true;
}

export function MyHackathonsClient({
  posted,
  joinedUpcoming,
  joinedPast,
}: {
  posted: Hackathon[];
  joinedUpcoming: Hackathon[];
  joinedPast: Hackathon[];
}) {
  const [query, setQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");

  const hasAny =
    posted.length + joinedUpcoming.length + joinedPast.length > 0;

  const allHackathons = useMemo(
    () => [...posted, ...joinedUpcoming, ...joinedPast],
    [posted, joinedUpcoming, joinedPast],
  );

  const regionOptions = useMemo(() => {
    const set = new Set<string>();
    for (const h of allHackathons) {
      if (h.region) set.add(h.region);
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [allHackathons]);

  const cityOptions = useMemo(() => {
    const pool = regionFilter
      ? allHackathons.filter((h) => h.region === regionFilter)
      : allHackathons;
    const set = new Set<string>();
    for (const h of pool) {
      if (h.city) set.add(h.city);
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [allHackathons, regionFilter]);

  useEffect(() => {
    if (!cityFilter) return;
    const valid = new Set(cityOptions);
    if (!valid.has(cityFilter)) setCityFilter("");
  }, [cityOptions, cityFilter]);

  const filteredPosted = useMemo(
    () =>
      posted.filter(
        (h) =>
          matchesQuery(h, query) &&
          matchesLocation(h, cityFilter, regionFilter),
      ),
    [posted, query, cityFilter, regionFilter],
  );
  const filteredUpcoming = useMemo(
    () =>
      joinedUpcoming.filter(
        (h) =>
          matchesQuery(h, query) &&
          matchesLocation(h, cityFilter, regionFilter),
      ),
    [joinedUpcoming, query, cityFilter, regionFilter],
  );
  const filteredPast = useMemo(
    () =>
      joinedPast.filter(
        (h) =>
          matchesQuery(h, query) &&
          matchesLocation(h, cityFilter, regionFilter),
      ),
    [joinedPast, query, cityFilter, regionFilter],
  );

  const qActive = query.trim().length > 0;
  const locationActive = Boolean(cityFilter || regionFilter);
  const filtersActive = qActive || locationActive;

  const selectClass =
    "w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-accent/55 focus:outline-none focus:ring-2 focus:ring-focus-ring";

  function clearLocation() {
    setRegionFilter("");
    setCityFilter("");
  }

  const joinedCount = joinedUpcoming.length + joinedPast.length;

  return (
    <div className="space-y-14">
      {hasAny ? (
        <div className="space-y-4">
          <div className="relative max-w-xl">
            <label htmlFor="my-hackathons-search" className="sr-only">
              Search your hackathons
            </label>
            <span
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </span>
            <input
              id="my-hackathons-search"
              type="search"
              autoComplete="off"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, location, or description…"
              className="hf-input py-3 pl-10 pr-4"
            />
          </div>

          {(regionOptions.length > 0 || cityOptions.length > 0) && (
            <div className="flex flex-col gap-4 sm:max-w-2xl sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1 space-y-1.5">
                <label
                  htmlFor="my-hackathons-region"
                  className="text-xs font-medium text-muted-foreground"
                >
                  State / region
                </label>
                <select
                  id="my-hackathons-region"
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                  className={selectClass}
                >
                  <option value="">All states / regions</option>
                  {regionOptions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <label
                  htmlFor="my-hackathons-city"
                  className="text-xs font-medium text-muted-foreground"
                >
                  City
                </label>
                <select
                  id="my-hackathons-city"
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  disabled={cityOptions.length === 0}
                  className={`${selectClass} disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <option value="">
                    {cityOptions.length === 0
                      ? "No cities in this list"
                      : "All cities"}
                  </option>
                  {cityOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              {locationActive ? (
                <button
                  type="button"
                  onClick={clearLocation}
                  className="shrink-0 rounded-lg px-3 py-2 text-sm text-muted-foreground underline-offset-2 hover:text-accent hover:underline sm:pb-2.5"
                >
                  Clear location
                </button>
              ) : null}
            </div>
          )}
        </div>
      ) : null}

      <section>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Hackathons you posted</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Listings where you are the organizer.
            </p>
          </div>
          <Link href="/hackathons/new" className="hf-link text-sm font-medium">
            + New listing
          </Link>
        </div>
        {posted.length === 0 ? (
          <div className="hf-card border-dashed px-8 py-12 text-center">
            <p className="text-muted-foreground">You have not posted a hackathon yet.</p>
            <Link href="/hackathons/new" className="hf-btn-primary mt-4 inline-flex">
              List an event
            </Link>
          </div>
        ) : filteredPosted.length === 0 && filtersActive ? (
          <p className="rounded-2xl border border-border bg-card/50 px-4 py-6 text-sm text-muted-foreground">
            No posted events match your search or location filters.
          </p>
        ) : (
          <HackathonCards hackathons={filteredPosted} />
        )}
      </section>

      <section className="space-y-10">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Hackathons you joined</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Saved from each event page with “I’m participating.” Past and upcoming are
            grouped below.
          </p>
        </div>

        {joinedCount === 0 ? (
          <div className="hf-card border-dashed px-8 py-12 text-center">
            <p className="text-muted-foreground">
              No joined hackathons yet. Open any event and tap{" "}
              <span className="text-foreground">I’m participating</span>.
            </p>
            <Link href="/discover" className="hf-link mt-4 inline-flex text-sm font-medium">
              Browse hackathons →
            </Link>
          </div>
        ) : (
          <>
            <div>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Upcoming
              </h3>
              {joinedUpcoming.length === 0 ? (
                <p className="rounded-2xl border border-border bg-card/50 px-4 py-6 text-sm text-muted-foreground">
                  No upcoming joined events.
                </p>
              ) : filteredUpcoming.length === 0 && filtersActive ? (
                <p className="rounded-2xl border border-border bg-card/50 px-4 py-6 text-sm text-muted-foreground">
                  No upcoming joined events match your search or location filters.
                </p>
              ) : (
                <HackathonCards hackathons={filteredUpcoming} />
              )}
            </div>
            <div>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Past
              </h3>
              {joinedPast.length === 0 ? (
                <p className="rounded-2xl border border-border bg-card/50 px-4 py-6 text-sm text-muted-foreground">
                  No past joined events yet.
                </p>
              ) : filteredPast.length === 0 && filtersActive ? (
                <p className="rounded-2xl border border-border bg-card/50 px-4 py-6 text-sm text-muted-foreground">
                  No past joined events match your search or location filters.
                </p>
              ) : (
                <HackathonCards hackathons={filteredPast} />
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
