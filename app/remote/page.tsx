"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { SCENES } from "@/components/visuals/scenes";

let socket: Socket;

export default function RemotePage() {
  const [activeId, setActiveId] = useState(SCENES[0].id);

  useEffect(() => {
    socket = io();
    socket.on("scene-changed", ({ sceneId }: { sceneId: string }) => {
      setActiveId(sceneId);
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  const switchScene = (sceneId: string) => {
    setActiveId(sceneId);
    socket.emit("switch-scene", { sceneId });
  };

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

      {SCENES.map((scene) => {
        const isActive = scene.id === activeId;
        return (
          <button
            key={scene.id}
            onClick={() => switchScene(scene.id)}
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
            {scene.label}
          </button>
        );
      })}
    </div>
  );
}
