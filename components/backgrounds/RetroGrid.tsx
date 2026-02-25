"use client";

// Magic UI Retro Grid — CSS-based, no WebGL conflict with Spline

interface RetroGridProps {
  style?: React.CSSProperties;
  className?: string;
  speed?: number; // seconds per scroll cycle
  color?: string;
}

export default function RetroGrid({
  style,
  className,
  speed = 8,
  color = "#00ff88",
}: RetroGridProps) {
  return (
    <div
      className={className}
      style={{
        width: "100%",
        height: "100%",
        background: "#000",
        overflow: "hidden",
        perspective: "400px",
        ...style,
      }}
    >
      <style>{`
        @keyframes retro-scroll {
          from { backgroundPositionY: 0px; }
          to { backgroundPositionY: 80px; }
        }
      `}</style>
      <div
        style={{
          width: "100%",
          height: "150%",
          backgroundImage: `
            linear-gradient(${color}33 1px, transparent 1px),
            linear-gradient(90deg, ${color}33 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
          transform: "rotateX(45deg)",
          transformOrigin: "top center",
          animation: `retro-scroll ${speed}s linear infinite`,
        }}
      />
      {/* Horizon fade */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "50%",
          background: "linear-gradient(to bottom, #000 0%, transparent 100%)",
        }}
      />
      {/* Glow line at horizon */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 0,
          right: 0,
          height: "2px",
          background: color,
          boxShadow: `0 0 20px 4px ${color}`,
          opacity: 0.7,
        }}
      />
    </div>
  );
}
