import { ImageResponse } from "next/og";
export const alt = "Evergreen — AI & Full-stack · Projects & Writing";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        background: "#090d16",
        color: "#ecedf5",
        padding: "72px",
        fontFamily: "sans-serif",
        border: "1px solid #273147",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 22,
          color: "#a4aec2",
        }}
      >
        <span>PERSONAL SPACE / EVERGREEN</span>
        <span style={{ color: "#67e8f9" }}>IDEAS → EXPERIENCES</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: 100, fontWeight: 600, letterSpacing: -5 }}>
          Evergreen<span style={{ color: "#a78bfa" }}>.</span>
        </span>
        <span style={{ fontSize: 34, color: "#a78bfa", marginTop: 12 }}>
          AI applications & Full-stack development
        </span>
      </div>
      <div style={{ display: "flex", fontSize: 20, color: "#a4aec2" }}>
        PROJECTS / WRITING / EXPLORATIONS
      </div>
    </div>,
    size,
  );
}
