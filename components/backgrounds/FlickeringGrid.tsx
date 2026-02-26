"use client";

// Magic UI — Flickering Grid
// Source: https://magicui.design/docs/components/flickering-grid

import { useCallback, useEffect, useMemo, useRef } from "react";

interface FlickeringGridProps {
  squareSize?: number;
  gridGap?: number;
  flickerChance?: number;
  color?: string;
  maxOpacity?: number;
  reversed?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export default function FlickeringGrid({
  squareSize = 4,
  gridGap = 6,
  flickerChance = 0.3,
  color = "rgb(255, 255, 255)",
  maxOpacity = 0.3,
  reversed = false,
  style,
  className,
}: FlickeringGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const memoizedColor = useMemo(() => {
    if (typeof window === "undefined") return "rgba(255, 255, 255,";
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "rgba(255, 255, 255,";
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = Array.from(ctx.getImageData(0, 0, 1, 1).data);
    return `rgba(${r}, ${g}, ${b},`;
  }, [color]);

  const setupCanvas = useCallback(
    (canvas: HTMLCanvasElement, width: number, height: number) => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      const cols = Math.floor(width / (squareSize + gridGap));
      const rows = Math.floor(height / (squareSize + gridGap));
      const squares = new Float32Array(cols * rows).map(() => Math.random() * maxOpacity);
      return { cols, rows, squares, dpr };
    },
    [squareSize, gridGap, maxOpacity],
  );

  const updateSquares = useCallback(
    (squares: Float32Array, deltaTime: number) => {
      for (let i = 0; i < squares.length; i++) {
        if (Math.random() < flickerChance * deltaTime) {
          squares[i] = Math.random() * maxOpacity;
        }
      }
    },
    [flickerChance, maxOpacity],
  );

  const drawGrid = useCallback(
    (ctx: CanvasRenderingContext2D, cols: number, rows: number, squares: Float32Array, dpr: number) => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const opacity = squares[i * rows + j];
          ctx.fillStyle = `${memoizedColor}${opacity})`;
          ctx.fillRect(
            i * (squareSize + gridGap) * dpr,
            j * (squareSize + gridGap) * dpr,
            squareSize * dpr,
            squareSize * dpr,
          );
        }
      }
    },
    [memoizedColor, squareSize, gridGap],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let gridParams: ReturnType<typeof setupCanvas>;

    const updateCanvasSize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      gridParams = setupCanvas(canvas, w, h);
    };

    updateCanvasSize();

    let lastTime = 0;
    const animate = (time: number) => {
      if (!gridParams) return;
      const deltaTime = (time - lastTime) / 1000;
      lastTime = time;
      updateSquares(gridParams.squares, deltaTime);
      drawGrid(ctx, gridParams.cols, gridParams.rows, gridParams.squares, gridParams.dpr);
      animationFrameId = requestAnimationFrame(animate);
    };
    animationFrameId = requestAnimationFrame(animate);

    const ro = new ResizeObserver(() => updateCanvasSize());
    ro.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      ro.disconnect();
    };
  }, [setupCanvas, updateSquares, drawGrid]);

  // reversed is accepted for API consistency; flickering is inherently non-directional
  void reversed;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: "100%", height: "100%", ...style }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
