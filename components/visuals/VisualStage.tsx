"use client";

import dynamic from "next/dynamic";
import { Scene } from "./scenes";
import Iridescence from "@/components/backgrounds/Iridescence";
import Aurora from "@/components/backgrounds/Aurora";
import RetroGrid from "@/components/backgrounds/RetroGrid";

// Spline must be dynamic (no SSR) — it requires the browser canvas API
const Spline = dynamic(() => import("@splinetool/react-spline"), {
  ssr: false,
  loading: () => null,
});

interface VisualStageProps {
  scene: Scene;
}

function Background({ id }: { id: Scene["background"] }) {
  const shared = { style: { position: "absolute" as const, inset: 0 } };
  if (id === "iridescence") return <Iridescence {...shared} />;
  if (id === "aurora") return <Aurora {...shared} />;
  if (id === "retrogrid") return <RetroGrid {...shared} />;
  return null;
}

export default function VisualStage({ scene }: VisualStageProps) {
  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", background: "#000", overflow: "hidden" }}>
      {/* Background layer */}
      <Background id={scene.background} />

      {/* Spline overlay — transparent, no mouse events */}
      {scene.splineUrl && (
        <Spline
          scene={scene.splineUrl}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 10,
            pointerEvents: "none",
            background: "transparent",
          }}
        />
      )}
    </div>
  );
}
