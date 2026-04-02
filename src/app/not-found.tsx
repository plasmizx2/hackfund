import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">404</p>
      <h1 className="mt-2 text-2xl font-semibold text-foreground">Page not found</h1>
      <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
        The page you’re looking for doesn’t exist or was moved.
      </p>
      <Link href="/" className="hf-btn-primary mt-8">
        Back home
      </Link>
    </main>
  );
}
