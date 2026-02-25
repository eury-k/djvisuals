"use client";

import { useScenes } from "@/components/remote/useScenes";
import { SCENES } from "@/components/visuals/scenes";

export default function RemotePage() {
  const { scene, switchScene } = useScenes();

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        padding: "24px",
        fontFamily: "monospace",
      }}
    >
      <p style={{ color: "#555", fontSize: "12px", letterSpacing: "0.1em", marginBottom: "8px" }}>
        DJ VISUALS REMOTE
      </p>

      {SCENES.map((s) => {
        const isActive = s.id === scene.id;
        return (
          <button
            key={s.id}
            onClick={() => switchScene(s.id)}
            style={{
              width: "100%",
              maxWidth: "320px",
              padding: "20px",
              background: isActive ? "#fff" : "#1a1a1a",
              color: isActive ? "#000" : "#888",
              border: `1px solid ${isActive ? "#fff" : "#333"}`,
              borderRadius: "12px",
              fontSize: "16px",
              fontFamily: "monospace",
              cursor: "pointer",
              letterSpacing: "0.05em",
              transition: "all 0.15s ease",
            }}
          >
            {s.label}
          </button>
        );
      })}
    </div>
  );
}
