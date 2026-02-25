// Registry of all visual scenes

export type BackgroundId = "iridescence" | "aurora" | "retrogrid";

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

export type BackgroundParams = IridescenceParams | AuroraParams | RetroGridParams;

// --- Default params ---

export const DEFAULT_PARAMS: Record<BackgroundId, BackgroundParams> = {
  iridescence: { speed: 1.0, amplitude: 0.1, color: [1, 1, 1] } as IridescenceParams,
  aurora:      { speed: 1.0, amplitude: 1.0, blend: 0.5, colorStops: ["#5227FF", "#7cff67", "#5227FF"] } as AuroraParams,
  retrogrid:   { angle: 65, cellSize: 60, opacity: 0.6, lineColor: "#00ff88", speed: 15 } as RetroGridParams,
};

// --- Scene definition ---

export interface Scene {
  id: string;
  label: string;
  background: BackgroundId;
  splineUrl: string | null;
}

export const SCENES: Scene[] = [
  { id: "scene-1", label: "Iridescence", background: "iridescence", splineUrl: null },
  { id: "scene-2", label: "Aurora",      background: "aurora",      splineUrl: null },
  { id: "scene-3", label: "Retro Grid",  background: "retrogrid",   splineUrl: null },
];
