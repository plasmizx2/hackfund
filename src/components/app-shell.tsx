import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/sign-out-button";
import Link from "next/link";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="relative min-h-screen">
      {/* Extra depth — complements body gradients without covering them */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_35%_at_50%_-10%,rgba(253,90,109,0.09),transparent_65%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-accent/0 via-[#5484A4]/40 to-secondary/0 opacity-70" />
      </div>

      <header className="sticky top-0 z-50 border-b border-border/50 bg-[#0a121f]/55 backdrop-blur-2xl supports-[backdrop-filter]:bg-[#0a121f]/40">
        <div className="relative mx-auto flex h-[3.75rem] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-accent/25 via-highlight/35 to-secondary/25 opacity-80 sm:inset-x-6" />
          <Link
            href="/"
            className="group relative z-10 flex items-center gap-2.5 rounded-lg outline-none ring-offset-2 ring-offset-background transition hover:opacity-95 focus-visible:ring-2 focus-visible:ring-highlight"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent via-[#fd5a6d] to-highlight text-sm font-bold text-white shadow-lg shadow-accent/30 ring-1 ring-white/20 transition group-hover:shadow-highlight/25">
              H
            </span>
            <span className="bg-gradient-to-r from-foreground to-dusty bg-clip-text font-semibold tracking-tight text-transparent">
              HackFund
            </span>
          </Link>
          <nav className="relative z-10 flex flex-wrap items-center justify-end gap-1.5 text-sm sm:gap-2">
            <Link
              href="/discover"
              className="rounded-full px-3 py-1.5 text-muted-foreground transition hover:bg-highlight-muted/50 hover:text-highlight"
            >
              Discover
            </Link>
            <Link
              href="/me/hackathons"
              className="hidden rounded-full px-3 py-1.5 text-muted-foreground transition hover:bg-secondary-muted/50 hover:text-secondary sm:inline"
            >
              My hackathons
            </Link>
            <Link
              href="/hackathons/new"
              className="hf-btn-primary px-3 py-2 text-xs sm:px-4"
            >
              List event
            </Link>
            {user ? (
              <span className="max-w-[160px] truncate text-xs text-dusty/90 sm:max-w-[200px]">
                {user.email}
              </span>
            ) : null}
            <SignOutButton />
          </nav>
        </div>
      </header>
      <main className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">{children}</main>
    </div>
  );
}
