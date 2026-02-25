"use client";

// Magic UI — Retro Grid background
// Source: https://magicui.design/docs/components/retro-grid

interface RetroGridProps {
  angle?: number;
  cellSize?: number;
  opacity?: number;
  lineColor?: string;
  speed?: number; // animation duration in seconds
  style?: React.CSSProperties;
  className?: string;
}

export default function RetroGrid({
  angle = 65,
  cellSize = 60,
  opacity = 0.6,
  lineColor = "#00ff88",
  speed = 15,
  style,
  className,
}: RetroGridProps) {
  return (
    <div
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        perspective: "200px",
        opacity,
        ...style,
      }}
    >
      {/* Grid plane */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `rotateX(${angle}deg)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "0px",
            marginLeft: "-200%",
            height: "300vh",
            width: "600vw",
            transformOrigin: "100% 0 0",
            backgroundImage: `
              linear-gradient(to right, ${lineColor} 1px, transparent 0),
              linear-gradient(to bottom, ${lineColor} 1px, transparent 0)
            `,
            backgroundSize: `${cellSize}px ${cellSize}px`,
            backgroundRepeat: "repeat",
            animationName: "retro-grid-scroll",
            animationDuration: `${speed}s`,
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
          }}
        />
      </div>

      {/* Magic UI fade — black at bottom, transparent toward top (90%) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, #000 0%, transparent 90%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
