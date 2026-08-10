"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "hsl(220 13% 8%)",
          color: "hsl(210 20% 95%)",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "0 1.5rem",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>
          Something went wrong
        </h1>
        <p
          style={{
            marginTop: "0.75rem",
            maxWidth: "28rem",
            fontSize: "0.875rem",
            color: "hsl(215 14% 55%)",
          }}
        >
          Don&apos;t worry — your work is autosaved locally and will be
          restored when the editor reloads.
        </p>
        <div style={{ marginTop: "2rem", display: "flex", gap: "0.75rem" }}>
          <button
            onClick={reset}
            style={{
              borderRadius: "0.375rem",
              border: "none",
              background: "hsl(210 20% 95%)",
              color: "hsl(220 13% 8%)",
              padding: "0.625rem 1.25rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Reload editor
          </button>
          {/* Plain anchor on purpose: global-error renders without the app
              router context, so next/link is not reliable here. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/"
            style={{
              borderRadius: "0.375rem",
              border: "1px solid hsl(220 13% 20%)",
              color: "inherit",
              padding: "0.625rem 1.25rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Back home
          </a>
        </div>
      </body>
    </html>
  );
}
