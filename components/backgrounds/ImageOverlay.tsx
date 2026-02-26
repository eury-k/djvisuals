"use client";

import { ImageAnimationConfig } from "@/components/visuals/scenes";

interface ImageOverlayProps {
  src: string;
  size: number;      // % of container width
  x: number;         // % from left
  y: number;         // % from top
  animations: ImageAnimationConfig[];
}

const ANIM_NAMES: Record<string, string> = {
  spin:   "img-spin",
  bounce: "img-bounce",
  zoom:   "img-zoom",
  pulse:  "img-pulse",
  sway:   "img-sway",
};

// Wrap order: spin → sway → bounce → zoom, pulse on <img>
const WRAP_ORDER = ["spin", "sway", "bounce", "zoom"] as const;

export default function ImageOverlay({ src, size, x, y, animations }: ImageOverlayProps) {
  if (!src) return null;

  const animMap = Object.fromEntries(animations.map((a) => [a.type, a]));

  // Build innermost element — the <img> with optional pulse animation
  const pulseAnim = animMap["pulse"];
  const imgStyle: React.CSSProperties & Record<string, string | number> = {
    display: "block",
    width: "100%",
    height: "100%",
    objectFit: "contain",
    ...(pulseAnim
      ? {
          animation: `img-pulse ${pulseAnim.speed}s ease-in-out infinite`,
          "--img-intensity": pulseAnim.intensity,
        }
      : {}),
  };

  let inner: React.ReactNode = <img src={src} alt="" style={imgStyle} />;

  // Wrap in reverse order (zoom first, then bounce, sway, spin — outermost)
  for (let i = WRAP_ORDER.length - 1; i >= 0; i--) {
    const key = WRAP_ORDER[i];
    const anim = animMap[key];
    if (!anim) {
      // No animation — just a passthrough wrapper
      inner = <div style={{ width: "100%", height: "100%" }}>{inner}</div>;
    } else {
      const wrapStyle: React.CSSProperties & Record<string, string | number> = {
        width: "100%",
        height: "100%",
        animation: `${ANIM_NAMES[key]} ${anim.speed}s ${key === "spin" ? "linear" : "ease-in-out"} infinite`,
        "--img-intensity": anim.intensity,
      };
      inner = <div style={wrapStyle}>{inner}</div>;
    }
  }

  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%, -50%)",
        width: `${size}%`,
        aspectRatio: "1 / 1",
        pointerEvents: "none",
      }}
    >
      {inner}
    </div>
  );
}
