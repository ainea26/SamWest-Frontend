"use client";

import { useEffect } from "react";

type GlobalErrorProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

export default function GlobalError({
  error,
  reset,
}: GlobalErrorProps) {
  useEffect(() => {
    console.error(
      "SamWest root error:",
      error,
    );
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: "#020617",
          color: "#ffffff",
          fontFamily:
            "Arial, Helvetica, sans-serif",
        }}
      >
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            boxSizing: "border-box",
          }}
        >
          <section
            style={{
              width: "100%",
              maxWidth: "520px",
              padding: "28px",
              border: "1px solid #334155",
              borderRadius: "24px",
              background: "#0f172a",
              textAlign: "center",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                width: "52px",
                height: "52px",
                margin: "0 auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "16px",
                background: "#d97706",
                fontSize: "16px",
                fontWeight: 900,
              }}
            >
              SW
            </div>

            <p
              style={{
                margin: "20px 0 0",
                color: "#f59e0b",
                fontSize: "10px",
                fontWeight: 800,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}
            >
              SamWest system error
            </p>

            <h1
              style={{
                margin: "8px 0 0",
                fontSize: "28px",
                lineHeight: 1.15,
              }}
            >
              We could not load SamWest
            </h1>

            <p
              style={{
                margin: "14px auto 0",
                maxWidth: "420px",
                color: "#cbd5e1",
                fontSize: "14px",
                lineHeight: 1.7,
              }}
            >
              A temporary application error occurred. Please try loading the
              application again.
            </p>

            <button
              type="button"
              onClick={reset}
              style={{
                width: "100%",
                height: "48px",
                marginTop: "24px",
                border: 0,
                borderRadius: "12px",
                background: "#d97706",
                color: "#ffffff",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 800,
              }}
            >
              Try again
            </button>

            <a
              href="/"
              style={{
                display: "inline-block",
                marginTop: "18px",
                color: "#fbbf24",
                fontSize: "13px",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Return to homepage
            </a>
          </section>
        </main>
      </body>
    </html>
  );
}
