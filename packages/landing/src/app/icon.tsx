import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 16,
          background: "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          borderRadius: 8,
          fontWeight: 900,
          letterSpacing: "-0.05em",
          boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
        }}
      >
        Pg
      </div>
    ),
    {
      ...size,
    }
  );
}
