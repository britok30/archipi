"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center text-foreground">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        Don&apos;t worry — your work is autosaved locally and will be restored
        when the editor reloads.
      </p>
      <div className="mt-8 flex gap-3">
        <button
          onClick={reset}
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Reload editor
        </button>
        <Link
          href="/"
          className="rounded-md border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
        >
          Back home
        </Link>
      </div>
    </main>
  );
}
