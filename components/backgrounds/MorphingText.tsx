"use client";

// Magic UI — Morphing Text
// Source: https://magicui.design/docs/components/morphing-text

import { useCallback, useEffect, useRef } from "react";

interface MorphingTextProps {
  texts?: string[];
  morphTime?: number;
  cooldownTime?: number;
  reversed?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

const DEFAULT_TEXTS = ["DJ", "Visuals", "Live", "Set"];

export default function MorphingText({
  texts = DEFAULT_TEXTS,
  morphTime = 1.5,
  cooldownTime = 0.5,
  reversed = false,
  style,
  className,
}: MorphingTextProps) {
  const text1Ref = useRef<HTMLSpanElement>(null);
  const text2Ref = useRef<HTMLSpanElement>(null);
  const indexRef = useRef(0);
  const morphRef = useRef(0);
  const cooldownRef = useRef(cooldownTime);
  const lastTimeRef = useRef<number | null>(null);
  const reversedRef = useRef(reversed);
  reversedRef.current = reversed;

  const textsRef = useRef(texts);
  textsRef.current = texts;

  const setMorph = useCallback((fraction: number) => {
    const t1 = text1Ref.current;
    const t2 = text2Ref.current;
    if (!t1 || !t2) return;
    const texts = textsRef.current;
    const len = texts.length;
    t2.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
    t2.style.opacity = `${Math.pow(fraction, 0.4)}`;
    const inv = 1 - fraction;
    t1.style.filter = `blur(${Math.min(8 / inv - 8, 100)}px)`;
    t1.style.opacity = `${Math.pow(inv, 0.4)}`;
    t1.textContent = texts[indexRef.current % len];
    t2.textContent = texts[(indexRef.current + 1) % len];
  }, []);

  const doCooldown = useCallback(() => {
    morphRef.current = 0;
    const t1 = text1Ref.current;
    const t2 = text2Ref.current;
    if (!t1 || !t2) return;
    t2.style.filter = "";
    t2.style.opacity = "1";
    t1.style.filter = "";
    t1.style.opacity = "0";
  }, []);

  useEffect(() => {
    let animFrameId: number;

    const animate = (time: number) => {
      animFrameId = requestAnimationFrame(animate);
      if (lastTimeRef.current === null) lastTimeRef.current = time;
      const dt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      if (cooldownRef.current > 0) {
        cooldownRef.current -= dt;
        doCooldown();
        return;
      }

      morphRef.current += dt / morphTime;
      if (morphRef.current >= 1) {
        cooldownRef.current = cooldownTime;
        const step = reversedRef.current ? -1 : 1;
        const len = textsRef.current.length;
        indexRef.current = ((indexRef.current + step) % len + len) % len;
        if (cooldownTime === 0) {
          // No cooldown — immediately settle so morphRef doesn't stay ≥1 forever
          doCooldown();
        } else {
          morphRef.current = 1;
        }
      }
      setMorph(morphRef.current);
    };

    animFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameId);
  }, [morphTime, cooldownTime, setMorph, doCooldown]);

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
      <svg style={{ position: "absolute", width: 0, height: 0 }}>
        <defs>
          <filter id="morphing-text-threshold">
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 255 -140"
            />
          </filter>
        </defs>
      </svg>
      <div style={{ position: "relative", width: "100%", filter: "url(#morphing-text-threshold)" }}>
        <span
          ref={text1Ref}
          style={{
            position: "absolute",
            width: "100%",
            textAlign: "center",
            fontSize: "clamp(2.5rem, 10vw, 7rem)",
            fontWeight: "bold",
            color: "#fff",
            userSelect: "none",
            left: 0,
            top: "50%",
            transform: "translateY(-50%)",
          }}
        />
        <span
          ref={text2Ref}
          style={{
            position: "absolute",
            width: "100%",
            textAlign: "center",
            fontSize: "clamp(2.5rem, 10vw, 7rem)",
            fontWeight: "bold",
            color: "#fff",
            userSelect: "none",
            left: 0,
            top: "50%",
            transform: "translateY(-50%)",
          }}
        />
        {/* spacer to give the container height */}
        <span
          style={{
            display: "block",
            visibility: "hidden",
            fontSize: "clamp(2.5rem, 10vw, 7rem)",
            fontWeight: "bold",
          }}
        >
          &nbsp;
        </span>
      </div>
    </div>
  );
}
