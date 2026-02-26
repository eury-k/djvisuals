"use client";

// Magic UI — Spinning Text
// Source: https://magicui.design/docs/components/spinning-text

import { motion } from "motion/react";

interface SpinningTextProps {
  text?: string;
  duration?: number;
  radius?: number;
  reversed?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export default function SpinningText({
  text = "DJ VISUALS • LIVE SET • ",
  duration = 10,
  radius = 80,
  reversed = false,
  style,
  className,
}: SpinningTextProps) {
  const characters = text.split("");
  const angleStep = 360 / characters.length;

  return (
    <div
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
    >
      <motion.div
        animate={{ rotate: reversed ? -360 : 360 }}
        transition={{ repeat: Infinity, duration, ease: "linear" }}
        style={{
          position: "relative",
          width: `${radius * 2}px`,
          height: `${radius * 2}px`,
        }}
      >
        {characters.map((char, i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              fontSize: "13px",
              fontFamily: "monospace",
              letterSpacing: "0.1em",
              color: "#fff",
              transformOrigin: `0 ${radius}px`,
              transform: `rotate(${i * angleStep}deg) translateX(-50%) translateY(-${radius}px)`,
            }}
          >
            {char}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
