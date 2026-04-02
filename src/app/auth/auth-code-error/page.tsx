import Link from "next/link";

export default async function AuthCodeErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  let detail: string | undefined;
  if (reason) {
    try {
      detail = decodeURIComponent(reason);
    } catch {
      detail = reason;
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold text-foreground">Sign-in didn&apos;t finish</h1>
        <p className="mt-3 text-muted-foreground">
          Something went wrong exchanging the auth code. Try signing in again.
        </p>
        {detail ? (
          <p className="mt-4 rounded-xl border border-border bg-card px-3 py-2 font-mono text-xs text-muted-foreground">
            {detail}
          </p>
        ) : null}
        <Link href="/login" className="hf-btn-primary mt-8 inline-flex px-6">
          Back to login
        </Link>
      </div>
    </main>
  );
}
