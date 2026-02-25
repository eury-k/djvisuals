"use client";

import dynamic from "next/dynamic";
import { Scene, BackgroundParams, IridescenceParams, AuroraParams, RetroGridParams } from "./scenes";
import Iridescence from "@/components/backgrounds/Iridescence";
import Aurora from "@/components/backgrounds/Aurora";
import RetroGrid from "@/components/backgrounds/RetroGrid";

const Spline = dynamic(() => import("@splinetool/react-spline"), {
  ssr: false,
  loading: () => null,
});

interface VisualStageProps {
  scene: Scene;
  params: BackgroundParams;
  reversed?: boolean;
}

const shared = { style: { position: "absolute" as const, inset: 0 } };

function Background({ id, params, reversed }: { id: Scene["background"]; params: BackgroundParams; reversed: boolean }) {
  if (id === "iridescence") {
    const p = params as IridescenceParams;
    return <Iridescence {...shared} color={p.color} speed={p.speed} amplitude={p.amplitude} reversed={reversed} />;
  }
  if (id === "aurora") {
    const p = params as AuroraParams;
    return <Aurora {...shared} colorStops={p.colorStops} speed={p.speed} amplitude={p.amplitude} blend={p.blend} reversed={reversed} />;
  }
  if (id === "retrogrid") {
    const p = params as RetroGridParams;
    return <RetroGrid {...shared} angle={p.angle} cellSize={p.cellSize} opacity={p.opacity} lineColor={p.lineColor} speed={p.speed} reversed={reversed} />;
  }
  return null;
}

export default function VisualStage({ scene, params, reversed = false }: VisualStageProps) {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", background: "#000", overflow: "hidden" }}>
      <Background id={scene.background} params={params} reversed={reversed} />
      {scene.splineUrl && (
        <Spline
          scene={scene.splineUrl}
          style={{ position: "absolute", inset: 0, zIndex: 10, pointerEvents: "none", background: "transparent" }}
        />
      )}
    </div>
  );
}
