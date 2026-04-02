import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  const hasEnv =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!hasEnv) {
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(253,90,109,0.12),transparent)]" />
        <div className="hf-card relative max-w-lg p-8 shadow-2xl shadow-black/40">
          <h1 className="text-xl font-semibold text-foreground">Configure Supabase</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Copy{" "}
            <code className="rounded-md bg-card px-1.5 py-0.5 font-mono text-xs text-accent">
              .env.local.example
            </code>{" "}
            to{" "}
            <code className="rounded-md bg-card px-1.5 py-0.5 font-mono text-xs text-accent">
              .env.local
            </code>{" "}
            and add your project URL and anon key from the Supabase dashboard.
            Then restart{" "}
            <code className="rounded-md bg-card px-1.5 py-0.5 font-mono text-xs">npm run dev</code>
            .
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(253,90,109,0.14),transparent)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_60%,rgba(9,161,161,0.08),transparent)]" />

      <div className="relative w-full max-w-md">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent">
            HackFund
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Hackathons, escrowed prizes, and builds in one place.
          </p>
        </div>

        <div className="hf-card p-8 shadow-2xl shadow-black/50">
          <LoginForm />
          <p className="mt-6 text-center text-xs text-muted-foreground">
            OAuth only — no password. Enable Google or GitHub in Supabase →
            Authentication → Providers.
          </p>
        </div>
      </div>
    </main>
  );
}
