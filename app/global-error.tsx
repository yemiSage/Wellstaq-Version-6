"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main style={{ display: "grid", minHeight: "100vh", placeItems: "center", padding: 24, fontFamily: "Arial, sans-serif" }}>
          <div role="alert" style={{ maxWidth: 420, textAlign: "center" }}>
            <h1 style={{ marginBottom: 8, fontSize: 24 }}>Wellstaq couldn&apos;t start</h1>
            <p style={{ marginBottom: 20, color: "#5f6368", lineHeight: 1.5 }}>Refresh the app. If the problem continues, try again shortly.</p>
            <button
              type="button"
              onClick={reset}
              style={{ border: 0, borderRadius: 8, background: "#EA6A05", color: "white", cursor: "pointer", padding: "10px 18px", fontWeight: 600 }}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
