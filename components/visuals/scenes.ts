// Registry of all visual scenes
// Add your Spline scene URLs and background pairings here

export type BackgroundId = "iridescence" | "aurora" | "retrogrid";

export interface Scene {
  id: string;
  label: string;
  background: BackgroundId;
  splineUrl: string | null; // null = no Spline overlay
}

export const SCENES: Scene[] = [
  {
    id: "scene-1",
    label: "Iridescence",
    background: "iridescence",
    splineUrl: null, // replace with your Spline URL
  },
  {
    id: "scene-2",
    label: "Aurora",
    background: "aurora",
    splineUrl: null,
  },
  {
    id: "scene-3",
    label: "Retro Grid",
    background: "retrogrid",
    splineUrl: null,
  },
];
