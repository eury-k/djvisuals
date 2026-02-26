"use client";

// Magic UI — Typing Animation
// Source: https://magicui.design/docs/components/typing-animation

import { useEffect, useRef, useState } from "react";

interface TypingAnimationProps {
  words?: string[];
  typeSpeed?: number;
  deleteSpeed?: number;
  loop?: boolean;
  showCursor?: boolean;
  reversed?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export default function TypingAnimation({
  words = ["DJ Visuals", "Live Set", "Aurora", "Retro Grid"],
  typeSpeed = 80,
  deleteSpeed = 40,
  loop = true,
  showCursor = true,
  reversed = false,
  style,
  className,
}: TypingAnimationProps) {
  const [displayed, setDisplayed] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const wordsRef = useRef(words);
  wordsRef.current = words;
  const reversedRef = useRef(reversed);
  reversedRef.current = reversed;

  useEffect(() => {
    const tick = () => {
      const currentWords = wordsRef.current;
      const currentWord = currentWords[wordIndex % currentWords.length];
      const target = reversedRef.current
        ? currentWord.split("").reverse().join("")
        : currentWord;

      if (isDeleting) {
        setDisplayed((prev) => {
          const next = prev.slice(0, -1);
          if (next.length === 0) {
            setIsDeleting(false);
            setWordIndex((i) => (i + 1) % currentWords.length);
          }
          return next;
        });
        timeoutRef.current = setTimeout(tick, deleteSpeed);
      } else {
        setDisplayed((prev) => {
          if (prev === target) {
            if (loop) {
              timeoutRef.current = setTimeout(() => setIsDeleting(true), 1200);
            }
            return prev;
          }
          return target.slice(0, prev.length + 1);
        });
        if (displayed !== target) {
          timeoutRef.current = setTimeout(tick, typeSpeed);
        }
      }
    };

    timeoutRef.current = setTimeout(tick, typeSpeed);
    return () => clearTimeout(timeoutRef.current);
  }, [wordIndex, isDeleting, typeSpeed, deleteSpeed, loop, displayed]);

  return (
    <div
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#000",
        ...style,
      }}
    >
      <span
        style={{
          fontSize: "clamp(1.5rem, 5vw, 4rem)",
          fontFamily: "monospace",
          color: "#fff",
          letterSpacing: "0.05em",
        }}
      >
        {displayed}
        {showCursor && (
          <span
            style={{
              display: "inline-block",
              width: "3px",
              height: "1em",
              background: "#fff",
              marginLeft: "4px",
              verticalAlign: "middle",
              animationName: "blink-cursor",
              animationDuration: "1s",
              animationTimingFunction: "step-end",
              animationIterationCount: "infinite",
            }}
          />
        )}
      </span>
    </div>
  );
}
