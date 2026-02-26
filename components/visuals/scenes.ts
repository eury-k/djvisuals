// Registry of all visual scenes

export type BackgroundId =
  | "iridescence"
  | "aurora"
  | "retrogrid"
  | "flickeringgrid"
  | "ripple"
  | "morphingtext"
  | "spinningtext"
  | "typinganimation";

// --- Param types per background ---

export interface IridescenceParams {
  speed: number;      // 0.1–5
  amplitude: number;  // 0–2
  color: [number, number, number]; // RGB 0–1
}

export interface AuroraParams {
  speed: number;      // 0.1–5
  amplitude: number;  // 0.5–3
  blend: number;      // 0.1–1
  colorStops: string[];
}

export interface RetroGridParams {
  angle: number;      // 30–80
  cellSize: number;   // 20–120
  opacity: number;    // 0.1–1
  lineColor: string;  // hex
  speed: number;      // animation duration in seconds (3–30)
}

export interface FlickeringGridParams {
  squareSize: number;   // 2–16
  gridGap: number;      // 2–20
  flickerChance: number; // 0.01–1
  color: string;        // hex
  maxOpacity: number;   // 0.1–1
}

export interface RippleParams {
  mainCircleSize: number;    // 50–400
  mainCircleOpacity: number; // 0.05–0.5
  numCircles: number;        // 3–12
  color: string;             // hex
}

export interface MorphingTextParams {
  texts: string[];   // words to cycle
  morphTime: number; // 0.5–5s
  cooldownTime: number; // 0.1–3s
}

export interface SpinningTextParams {
  text: string;     // text to spin
  duration: number; // 5–30s
  radius: number;   // 40–200px
}

export interface TypingAnimationParams {
  words: string[];    // words to type
  typeSpeed: number;  // 20–200ms per char
  deleteSpeed: number; // 10–100ms per char
}

export type BackgroundParams =
  | IridescenceParams
  | AuroraParams
  | RetroGridParams
  | FlickeringGridParams
  | RippleParams
  | MorphingTextParams
  | SpinningTextParams
  | TypingAnimationParams;

// --- Default params ---

export const DEFAULT_PARAMS: Record<BackgroundId, BackgroundParams> = {
  iridescence:    { speed: 1.0, amplitude: 0.1, color: [1, 1, 1] } as IridescenceParams,
  aurora:         { speed: 1.0, amplitude: 1.0, blend: 0.5, colorStops: ["#5227FF", "#7cff67", "#5227FF"] } as AuroraParams,
  retrogrid:      { angle: 65, cellSize: 60, opacity: 0.6, lineColor: "#00ff88", speed: 15 } as RetroGridParams,
  flickeringgrid: { squareSize: 4, gridGap: 6, flickerChance: 0.3, color: "#ffffff", maxOpacity: 0.3 } as FlickeringGridParams,
  ripple:         { mainCircleSize: 210, mainCircleOpacity: 0.24, numCircles: 8, color: "#ffffff" } as RippleParams,
  morphingtext:   { texts: ["DJ", "Visuals", "Live", "Set"], morphTime: 1.5, cooldownTime: 0 } as MorphingTextParams,
  spinningtext:   { text: "DJ VISUALS • LIVE SET • ", duration: 10, radius: 80 } as SpinningTextParams,
  typinganimation: { words: ["DJ Visuals", "Live Set", "Aurora", "Retro Grid"], typeSpeed: 80, deleteSpeed: 40 } as TypingAnimationParams,
};

// --- Layer types (for composited clips in builder) ---

export type BlendMode = "normal" | "screen" | "overlay" | "multiply" | "lighter";

export interface BackgroundLayer {
  id: string;
  type: "background";
  backgroundId: BackgroundId;
  params: BackgroundParams;
  opacity: number;
  blendMode: BlendMode;
  fadeIn: number;   // seconds
  fadeOut: number;  // seconds
}

export interface SplineLayer {
  id: string;
  type: "spline";
  splineUrl: string;
  opacity: number;
  fadeIn: number;
  fadeOut: number;
}

export type ImageAnimationType = "spin" | "bounce" | "zoom" | "pulse" | "sway";

export interface ImageAnimationConfig {
  type: ImageAnimationType;
  speed: number;     // seconds per cycle
  intensity: number; // 0–1 (amplitude scale)
}

export interface ImageLayer {
  id: string;
  type: "image";
  src: string;       // base64 dataURL or https:// URL
  opacity: number;
  blendMode: BlendMode;
  size: number;      // % of container width (10–100)
  x: number;         // % position from left (0–100, default 50)
  y: number;         // % position from top (0–100, default 50)
  animations: ImageAnimationConfig[];
  fadeIn: number;
  fadeOut: number;
}

export type Layer = BackgroundLayer | SplineLayer | ImageLayer;

// --- Scene definition ---

export interface Scene {
  id: string;
  label: string;
  background: BackgroundId;
  splineUrl: string | null;
}

export const SCENES: Scene[] = [
  { id: "scene-1", label: "Iridescence",  background: "iridescence",    splineUrl: null },
  { id: "scene-2", label: "Aurora",       background: "aurora",          splineUrl: null },
  { id: "scene-3", label: "Retro Grid",   background: "retrogrid",       splineUrl: null },
  { id: "scene-4", label: "Flicker",      background: "flickeringgrid",  splineUrl: null },
  { id: "scene-5", label: "Ripple",       background: "ripple",          splineUrl: null },
  { id: "scene-6", label: "Morph Text",   background: "morphingtext",    splineUrl: null },
  { id: "scene-7", label: "Spin Text",    background: "spinningtext",    splineUrl: null },
  { id: "scene-8", label: "Typing",       background: "typinganimation", splineUrl: null },
];
