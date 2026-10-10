import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(circle at 50% 30%, #1e293b 0%, #020617 100%)",
          color: "white",
          fontFamily: "sans-serif",
          position: "relative",
          padding: 60,
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "rgba(59, 130, 246, 0.15)",
            filter: "blur(100px)",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 24,
            padding: "10px 24px",
            borderRadius: 9999,
            background: "rgba(30, 58, 138, 0.4)",
            border: "1px solid rgba(59, 130, 246, 0.4)",
          }}
        >
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "0.05em",
              color: "#93c5fd",
            }}
          >
            MYPG • POSTGRESQL BACKEND AS A SERVICE
          </span>
        </div>

        <h1
          style={{
            fontSize: 68,
            fontWeight: 900,
            textAlign: "center",
            maxWidth: 1000,
            lineHeight: 1.1,
            margin: "0 0 24px 0",
            background: "linear-gradient(135deg, #ffffff 40%, #60a5fa 100%)",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          Turn PostgreSQL into your complete backend.
        </h1>

        <p
          style={{
            fontSize: 28,
            color: "#94a3b8",
            textAlign: "center",
            maxWidth: 900,
            lineHeight: 1.4,
            margin: 0,
          }}
        >
          Instant REST APIs • Realtime SSE • JWT &amp; RBAC Auth • S3 Storage • Web Studio
        </p>

        <div
          style={{
            display: "flex",
            gap: 20,
            marginTop: 48,
          }}
        >
          <div
            style={{
              padding: "12px 24px",
              borderRadius: 12,
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              fontSize: 20,
              fontWeight: 600,
              color: "#e2e8f0",
            }}
          >
            Postgres 16
          </div>
          <div
            style={{
              padding: "12px 24px",
              borderRadius: 12,
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              fontSize: 20,
              fontWeight: 600,
              color: "#e2e8f0",
            }}
          >
            Hono API
          </div>
          <div
            style={{
              padding: "12px 24px",
              borderRadius: 12,
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              fontSize: 20,
              fontWeight: 600,
              color: "#e2e8f0",
            }}
          >
            Docker Self-Host
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
