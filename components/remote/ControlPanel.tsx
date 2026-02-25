"use client";

import {
  SCENES, Scene, BackgroundParams,
  IridescenceParams, AuroraParams, RetroGridParams,
} from "@/components/visuals/scenes";

interface ControlPanelProps {
  activeScene: Scene;
  params: BackgroundParams;
  onSwitch: (sceneId: string) => void;
  onParamChange: (key: string, value: number | string | [number, number, number]) => void;
  onFullscreen: () => void;
}

// --- Reusable slider row ---
function Slider({
  label, value, min, max, step = 0.01,
  onChange, display,
}: {
  label: string; value: number; min: number; max: number; step?: number;
  onChange: (v: number) => void; display?: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: "180px" }}>
      <span style={{ color: "#555", fontSize: "10px", letterSpacing: "0.08em", width: "72px", flexShrink: 0 }}>
        {label}
      </span>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ flex: 1, accentColor: "#fff", cursor: "pointer", height: "2px" }}
      />
      <span style={{ color: "#666", fontSize: "10px", width: "32px", textAlign: "right", flexShrink: 0 }}>
        {display ?? value.toFixed(2)}
      </span>
    </div>
  );
}

// --- Color preset button ---
function ColorChip({ color, active, onClick }: { color: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "22px", height: "22px", borderRadius: "50%",
        background: color, border: active ? "2px solid #fff" : "2px solid transparent",
        cursor: "pointer", flexShrink: 0,
      }}
    />
  );
}

// --- Per-background param controls ---
const IRIDESCENCE_COLORS: Array<{ label: string; value: [number, number, number] }> = [
  { label: "White",  value: [1, 1, 1] },
  { label: "Purple", value: [0.6, 0.2, 1] },
  { label: "Cyan",   value: [0.2, 1, 0.9] },
  { label: "Gold",   value: [1, 0.8, 0.2] },
];

const AURORA_PALETTES: Array<{ label: string; stops: string[] }> = [
  { label: "Default", stops: ["#5227FF", "#7cff67", "#5227FF"] },
  { label: "Fire",    stops: ["#ff4400", "#ffaa00", "#ff4400"] },
  { label: "Ocean",   stops: ["#0044ff", "#00ccff", "#0044ff"] },
  { label: "Sunset",  stops: ["#ff0080", "#ff6600", "#7700ff"] },
];

const GRID_COLORS = ["#00ff88", "#ff0080", "#00aaff", "#ffcc00", "#ffffff"];

function IridescenceControls({ p, onChange }: { p: IridescenceParams; onChange: ControlPanelProps["onParamChange"] }) {
  return (
    <>
      <Slider label="SPEED"     value={p.speed}     min={0.1} max={5}   step={0.1} onChange={(v) => onChange("speed", v)} />
      <Slider label="AMPLITUDE" value={p.amplitude} min={0}   max={2}   step={0.05} onChange={(v) => onChange("amplitude", v)} />
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ color: "#555", fontSize: "10px", letterSpacing: "0.08em", width: "72px" }}>COLOR</span>
        {IRIDESCENCE_COLORS.map((c) => (
          <ColorChip
            key={c.label} color={`rgb(${c.value.map((x) => Math.round(x * 255)).join(",")})`}
            active={p.color.join() === c.value.join()}
            onClick={() => onChange("color", c.value)}
          />
        ))}
      </div>
    </>
  );
}

function AuroraControls({ p, onChange }: { p: AuroraParams; onChange: ControlPanelProps["onParamChange"] }) {
  const activePreset = AURORA_PALETTES.find((x) => x.stops.join() === p.colorStops.join());
  return (
    <>
      <Slider label="SPEED"     value={p.speed}     min={0.1} max={5}  step={0.1}  onChange={(v) => onChange("speed", v)} />
      <Slider label="AMPLITUDE" value={p.amplitude} min={0.5} max={3}  step={0.1}  onChange={(v) => onChange("amplitude", v)} />
      <Slider label="BLEND"     value={p.blend}     min={0.1} max={1}  step={0.05} onChange={(v) => onChange("blend", v)} />
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        <span style={{ color: "#555", fontSize: "10px", letterSpacing: "0.08em", width: "72px" }}>PALETTE</span>
        {AURORA_PALETTES.map((palette) => (
          <button
            key={palette.label}
            onClick={() => onChange("colorStops", palette.stops.join(",") as unknown as string)}
            style={{
              padding: "3px 8px", fontSize: "10px", fontFamily: "monospace", cursor: "pointer",
              border: `1px solid ${activePreset?.label === palette.label ? "#fff" : "#333"}`,
              color: activePreset?.label === palette.label ? "#fff" : "#555",
              background: "none", borderRadius: "4px", letterSpacing: "0.05em",
            }}
          >
            {palette.label}
          </button>
        ))}
      </div>
    </>
  );
}

function RetroGridControls({ p, onChange }: { p: RetroGridParams; onChange: ControlPanelProps["onParamChange"] }) {
  return (
    <>
      <Slider label="ANGLE"     value={p.angle}    min={30}  max={80}  step={1}    onChange={(v) => onChange("angle", v)}    display={`${p.angle}°`} />
      <Slider label="CELL SIZE" value={p.cellSize} min={20}  max={120} step={5}    onChange={(v) => onChange("cellSize", v)} display={`${p.cellSize}px`} />
      <Slider label="OPACITY"   value={p.opacity}  min={0.1} max={1}   step={0.05} onChange={(v) => onChange("opacity", v)} />
      <Slider label="SPEED"     value={p.speed}    min={3}   max={30}  step={1}    onChange={(v) => onChange("speed", v)}    display={`${p.speed}s`} />
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ color: "#555", fontSize: "10px", letterSpacing: "0.08em", width: "72px" }}>COLOR</span>
        {GRID_COLORS.map((c) => (
          <ColorChip key={c} color={c} active={p.lineColor === c} onClick={() => onChange("lineColor", c)} />
        ))}
      </div>
    </>
  );
}

// --- Main panel ---
export default function ControlPanel({ activeScene, params, onSwitch, onParamChange, onFullscreen }: ControlPanelProps) {
  return (
    <div
      style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", flexDirection: "column", gap: "12px",
        padding: "20px 24px",
        background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 85%, transparent 100%)",
        backdropFilter: "blur(2px)",
        fontFamily: "monospace",
      }}
    >
      {/* Param controls for active scene */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "14px 24px", paddingBottom: "4px" }}>
        {activeScene.background === "iridescence" &&
          <IridescenceControls p={params as IridescenceParams} onChange={onParamChange} />}
        {activeScene.background === "aurora" &&
          <AuroraControls p={params as AuroraParams} onChange={onParamChange} />}
        {activeScene.background === "retrogrid" &&
          <RetroGridControls p={params as RetroGridParams} onChange={onParamChange} />}
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid #1a1a1a" }} />

      {/* Label + fullscreen row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ color: "#444", fontSize: "11px", letterSpacing: "0.12em" }}>
          DJ VISUALS · EDIT MODE
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ color: "#444", fontSize: "11px", letterSpacing: "0.08em" }}>F — fullscreen</span>
          <button
            onClick={onFullscreen}
            style={{
              background: "none", border: "1px solid #333", borderRadius: "6px",
              color: "#666", cursor: "pointer", fontSize: "13px", padding: "4px 10px",
              fontFamily: "monospace", transition: "all 0.15s ease",
            }}
          >⛶</button>
        </div>
      </div>

      {/* Scene buttons */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        {SCENES.map((scene) => {
          const isActive = scene.id === activeScene.id;
          return (
            <button
              key={scene.id}
              onClick={() => onSwitch(scene.id)}
              style={{
                flex: "1 1 0", minWidth: "100px", padding: "14px 16px",
                background: isActive ? "#fff" : "#111",
                color: isActive ? "#000" : "#777",
                border: `1px solid ${isActive ? "#fff" : "#2a2a2a"}`,
                borderRadius: "10px", fontSize: "13px", fontFamily: "monospace",
                cursor: "pointer", letterSpacing: "0.05em", transition: "all 0.15s ease",
              }}
            >
              {scene.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
