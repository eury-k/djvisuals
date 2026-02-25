"use client";

import { SCENES, Scene } from "@/components/visuals/scenes";

interface ControlPanelProps {
  activeScene: Scene;
  onSwitch: (sceneId: string) => void;
  onFullscreen: () => void;
}

export default function ControlPanel({ activeScene, onSwitch, onFullscreen }: ControlPanelProps) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        padding: "20px 24px",
        background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.6) 80%, transparent 100%)",
        backdropFilter: "blur(2px)",
        fontFamily: "monospace",
      }}
    >
      {/* Label row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ color: "#444", fontSize: "11px", letterSpacing: "0.12em" }}>
          DJ VISUALS · EDIT MODE
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ color: "#444", fontSize: "11px", letterSpacing: "0.08em" }}>
            F — fullscreen
          </span>
          <button
            onClick={onFullscreen}
            title="Go fullscreen (F)"
            style={{
              background: "none",
              border: "1px solid #333",
              borderRadius: "6px",
              color: "#666",
              cursor: "pointer",
              fontSize: "13px",
              padding: "4px 10px",
              fontFamily: "monospace",
              letterSpacing: "0.05em",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.borderColor = "#fff";
              (e.target as HTMLButtonElement).style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.borderColor = "#333";
              (e.target as HTMLButtonElement).style.color = "#666";
            }}
          >
            ⛶
          </button>
        </div>
      </div>

      {/* Scene buttons */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        {SCENES.map((scene) => {
          const isActive = scene.id === activeScene.id;
          return (
            <button
              key={scene.id}
              onClick={() => onSwitch(scene.id)}
              style={{
                flex: "1 1 0",
                minWidth: "100px",
                padding: "14px 16px",
                background: isActive ? "#fff" : "#111",
                color: isActive ? "#000" : "#777",
                border: `1px solid ${isActive ? "#fff" : "#2a2a2a"}`,
                borderRadius: "10px",
                fontSize: "13px",
                fontFamily: "monospace",
                cursor: "pointer",
                letterSpacing: "0.05em",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.target as HTMLButtonElement).style.borderColor = "#555";
                  (e.target as HTMLButtonElement).style.color = "#bbb";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.target as HTMLButtonElement).style.borderColor = "#2a2a2a";
                  (e.target as HTMLButtonElement).style.color = "#777";
                }
              }}
            >
              {scene.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
