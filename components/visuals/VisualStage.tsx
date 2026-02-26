"use client";

import dynamic from "next/dynamic";
import {
  Layer, BackgroundLayer, ImageLayer,
  IridescenceParams, AuroraParams, RetroGridParams,
  FlickeringGridParams, RippleParams, MorphingTextParams,
  SpinningTextParams, TypingAnimationParams,
} from "./scenes";
import Iridescence from "@/components/backgrounds/Iridescence";
import Aurora from "@/components/backgrounds/Aurora";
import RetroGrid from "@/components/backgrounds/RetroGrid";
import FlickeringGrid from "@/components/backgrounds/FlickeringGrid";
import Ripple from "@/components/backgrounds/Ripple";
import MorphingText from "@/components/backgrounds/MorphingText";
import SpinningText from "@/components/backgrounds/SpinningText";
import TypingAnimation from "@/components/backgrounds/TypingAnimation";
import ImageOverlay from "@/components/backgrounds/ImageOverlay";

const Spline = dynamic(() => import("@splinetool/react-spline"), {
  ssr: false,
  loading: () => null,
});

export type LayerFadeMap = Record<string, { opacity: number; transition: string }>;

interface VisualStageProps {
  layers: Layer[];
  reversed?: boolean;
  layerFades?: LayerFadeMap;
}

const fill = { style: { position: "absolute" as const, inset: 0 } };

function Background({ layer, reversed }: { layer: BackgroundLayer; reversed: boolean }) {
  const { backgroundId: id, params } = layer;
  if (id === "iridescence") {
    const p = params as IridescenceParams;
    return <Iridescence {...fill} color={p.color} speed={p.speed} amplitude={p.amplitude} reversed={reversed} />;
  }
  if (id === "aurora") {
    const p = params as AuroraParams;
    return <Aurora {...fill} colorStops={p.colorStops} speed={p.speed} amplitude={p.amplitude} blend={p.blend} reversed={reversed} />;
  }
  if (id === "retrogrid") {
    const p = params as RetroGridParams;
    return <RetroGrid {...fill} angle={p.angle} cellSize={p.cellSize} opacity={p.opacity} lineColor={p.lineColor} speed={p.speed} reversed={reversed} />;
  }
  if (id === "flickeringgrid") {
    const p = params as FlickeringGridParams;
    return <FlickeringGrid {...fill} squareSize={p.squareSize} gridGap={p.gridGap} flickerChance={p.flickerChance} color={p.color} maxOpacity={p.maxOpacity} reversed={reversed} />;
  }
  if (id === "ripple") {
    const p = params as RippleParams;
    return <Ripple {...fill} mainCircleSize={p.mainCircleSize} mainCircleOpacity={p.mainCircleOpacity} numCircles={p.numCircles} color={p.color} reversed={reversed} />;
  }
  if (id === "morphingtext") {
    const p = params as MorphingTextParams;
    return <MorphingText {...fill} texts={p.texts} morphTime={p.morphTime} cooldownTime={p.cooldownTime} reversed={reversed} />;
  }
  if (id === "spinningtext") {
    const p = params as SpinningTextParams;
    return <SpinningText {...fill} text={p.text} duration={p.duration} radius={p.radius} reversed={reversed} />;
  }
  if (id === "typinganimation") {
    const p = params as TypingAnimationParams;
    return <TypingAnimation {...fill} words={p.words} typeSpeed={p.typeSpeed} deleteSpeed={p.deleteSpeed} reversed={reversed} />;
  }
  return null;
}

export default function VisualStage({ layers, reversed = false, layerFades }: VisualStageProps) {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", background: "#000", overflow: "hidden" }}>
      {layers.map((layer, i) => {
        const fade = layerFades?.[layer.id];
        const finalOpacity = layer.opacity * (fade?.opacity ?? 1);
        return (
        <div
          key={layer.id}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: i,
            opacity: finalOpacity,
            transition: fade?.transition,
            mixBlendMode: (layer.type === "background" || layer.type === "image")
              ? (layer.blendMode as React.CSSProperties["mixBlendMode"])
              : "normal",
          }}
        >
          {layer.type === "background" && (
            <Background layer={layer} reversed={reversed} />
          )}
          {layer.type === "spline" && layer.splineUrl && (
            <Spline
              scene={layer.splineUrl}
              style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "transparent" }}
            />
          )}
          {layer.type === "image" && (
            <ImageOverlay
              src={(layer as ImageLayer).src}
              size={(layer as ImageLayer).size}
              x={(layer as ImageLayer).x}
              y={(layer as ImageLayer).y}
              animations={(layer as ImageLayer).animations}
            />
          )}
        </div>
        );
      })}
    </div>
  );
}
