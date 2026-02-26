"use client";

// Magic UI — Ripple
// Source: https://magicui.design/docs/components/ripple

interface RippleProps {
  mainCircleSize?: number;
  mainCircleOpacity?: number;
  numCircles?: number;
  color?: string;
  reversed?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export default function Ripple({
  mainCircleSize = 210,
  mainCircleOpacity = 0.24,
  numCircles = 8,
  color = "#ffffff",
  reversed = false,
  style,
  className,
}: RippleProps) {
  return (
    <div
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background: "#000",
        ...style,
      }}
    >
      {Array.from({ length: numCircles }, (_, i) => {
        const size = mainCircleSize + i * 70;
        const opacity = Math.max(mainCircleOpacity - i * 0.03, 0);
        const delay = i * 0.06;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              borderRadius: "50%",
              border: `1px solid ${color}`,
              width: `${size}px`,
              height: `${size}px`,
              opacity,
              animationName: "ripple",
              animationDuration: "3.5s",
              animationTimingFunction: "cubic-bezier(0, 0, 0.2, 1)",
              animationIterationCount: "infinite",
              animationDirection: reversed ? "reverse" : "normal",
              animationDelay: `${delay}s`,
            }}
          />
        );
      })}
    </div>
  );
}
