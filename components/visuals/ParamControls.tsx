"use client";

import { useState, useRef, useEffect } from "react";
import {
  IridescenceParams, AuroraParams, RetroGridParams,
  FlickeringGridParams, RippleParams, MorphingTextParams,
  SpinningTextParams, TypingAnimationParams,
} from "./scenes";

export type ParamOnChange = (key: string, value: number | string | [number, number, number]) => void;

// ─── Utility components ───────────────────────────────────────────────────────

export function Slider({
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

export function ColorChip({ color, active, onClick }: { color: string; active: boolean; onClick: () => void }) {
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

export function PresetBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "3px 8px", fontSize: "10px", fontFamily: "monospace", cursor: "pointer",
        border: `1px solid ${active ? "#fff" : "#333"}`,
        color: active ? "#fff" : "#555",
        background: "none", borderRadius: "4px", letterSpacing: "0.05em",
      }}
    >
      {label}
    </button>
  );
}

// ─── Per-background param controls ────────────────────────────────────────────

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

const GRID_COLORS    = ["#00ff88", "#ff0080", "#00aaff", "#ffcc00", "#ffffff"];
const FLICKER_COLORS = ["#ffffff", "#00ff88", "#ff0080", "#00aaff", "#ffcc00"];
const RIPPLE_COLORS  = ["#ffffff", "#00ff88", "#ff0080", "#7700ff", "#00aaff"];

const MORPH_PRESETS: Array<{ label: string; texts: string[] }> = [
  { label: "Default", texts: ["DJ", "Visuals", "Live", "Set"] },
  { label: "Vibes",   texts: ["Groove", "Bounce", "Flow", "Wave"] },
  { label: "Tech",    texts: ["Beats", "Bass", "Drop", "Rise"] },
];

const TYPING_PRESETS: Array<{ label: string; words: string[] }> = [
  { label: "Default", words: ["DJ Visuals", "Live Set", "Aurora", "Retro Grid"] },
  { label: "Hype",    words: ["Let's Go", "Drop It", "Feel It", "Move It"] },
  { label: "Minimal", words: ["Groove", "Bass", "Vibe"] },
];

const textareaStyle: React.CSSProperties = {
  width: "100%", background: "#0a0a0a", border: "1px solid #2a2a2a",
  borderRadius: "4px", color: "#888", fontSize: "10px", fontFamily: "monospace",
  padding: "6px 8px", resize: "vertical", minHeight: "56px", lineHeight: "1.5",
};

const textInputStyle: React.CSSProperties = {
  width: "100%", background: "#0a0a0a", border: "1px solid #2a2a2a",
  borderRadius: "4px", color: "#888", fontSize: "10px", fontFamily: "monospace",
  padding: "5px 8px",
};

export function IridescenceControls({ p, onChange }: { p: IridescenceParams; onChange: ParamOnChange }) {
  return (
    <>
      <Slider label="SPEED"     value={p.speed}     min={0.1} max={5}   step={0.1}  onChange={(v) => onChange("speed", v)} />
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

export function AuroraControls({ p, onChange }: { p: AuroraParams; onChange: ParamOnChange }) {
  const activePreset = AURORA_PALETTES.find((x) => x.stops.join() === p.colorStops.join());
  return (
    <>
      <Slider label="SPEED"     value={p.speed}     min={0.1} max={5}  step={0.1}  onChange={(v) => onChange("speed", v)} />
      <Slider label="AMPLITUDE" value={p.amplitude} min={0.5} max={3}  step={0.1}  onChange={(v) => onChange("amplitude", v)} />
      <Slider label="BLEND"     value={p.blend}     min={0.1} max={1}  step={0.05} onChange={(v) => onChange("blend", v)} />
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        <span style={{ color: "#555", fontSize: "10px", letterSpacing: "0.08em", width: "72px" }}>PALETTE</span>
        {AURORA_PALETTES.map((palette) => (
          <PresetBtn
            key={palette.label} label={palette.label}
            active={activePreset?.label === palette.label}
            onClick={() => onChange("colorStops", palette.stops.join(",") as unknown as string)}
          />
        ))}
      </div>
    </>
  );
}

export function RetroGridControls({ p, onChange }: { p: RetroGridParams; onChange: ParamOnChange }) {
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

export function FlickeringGridControls({ p, onChange }: { p: FlickeringGridParams; onChange: ParamOnChange }) {
  return (
    <>
      <Slider label="SQ SIZE"   value={p.squareSize}    min={2}    max={16}  step={1}    onChange={(v) => onChange("squareSize", v)}    display={`${p.squareSize}px`} />
      <Slider label="GAP"       value={p.gridGap}       min={2}    max={20}  step={1}    onChange={(v) => onChange("gridGap", v)}       display={`${p.gridGap}px`} />
      <Slider label="FLICKER"   value={p.flickerChance} min={0.01} max={1}   step={0.01} onChange={(v) => onChange("flickerChance", v)} />
      <Slider label="OPACITY"   value={p.maxOpacity}    min={0.1}  max={1}   step={0.05} onChange={(v) => onChange("maxOpacity", v)} />
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ color: "#555", fontSize: "10px", letterSpacing: "0.08em", width: "72px" }}>COLOR</span>
        {FLICKER_COLORS.map((c) => (
          <ColorChip key={c} color={c} active={p.color === c} onClick={() => onChange("color", c)} />
        ))}
      </div>
    </>
  );
}

export function RippleControls({ p, onChange }: { p: RippleParams; onChange: ParamOnChange }) {
  return (
    <>
      <Slider label="SIZE"    value={p.mainCircleSize}    min={50}   max={400}  step={10}   onChange={(v) => onChange("mainCircleSize", v)}    display={`${p.mainCircleSize}px`} />
      <Slider label="OPACITY" value={p.mainCircleOpacity} min={0.05} max={0.5}  step={0.01} onChange={(v) => onChange("mainCircleOpacity", v)} />
      <Slider label="CIRCLES" value={p.numCircles}        min={3}    max={12}   step={1}    onChange={(v) => onChange("numCircles", v)}        display={`${p.numCircles}`} />
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ color: "#555", fontSize: "10px", letterSpacing: "0.08em", width: "72px" }}>COLOR</span>
        {RIPPLE_COLORS.map((c) => (
          <ColorChip key={c} color={c} active={p.color === c} onClick={() => onChange("color", c)} />
        ))}
      </div>
    </>
  );
}

export function MorphingTextControls({ p, onChange }: { p: MorphingTextParams; onChange: ParamOnChange }) {
  const [localText, setLocalText] = useState(p.texts.join("\n"));
  const focused = useRef(false);
  const activePreset = MORPH_PRESETS.find((x) => x.texts.join() === p.texts.join());

  // Sync when an external change arrives (e.g. preset click), but not while typing
  useEffect(() => {
    if (!focused.current) setLocalText(p.texts.join("\n"));
  }, [p.texts.join(",")]);  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Slider label="MORPH"    value={p.morphTime}    min={0.5} max={5}  step={0.1} onChange={(v) => onChange("morphTime", v)}    display={`${p.morphTime.toFixed(1)}s`} />
      <Slider label="COOLDOWN" value={p.cooldownTime} min={0}   max={3}  step={0.1} onChange={(v) => onChange("cooldownTime", v)} display={`${p.cooldownTime.toFixed(1)}s`} />
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <span style={{ color: "#555", fontSize: "10px", letterSpacing: "0.08em" }}>WORDS (one per line)</span>
        <textarea
          value={localText}
          onChange={(e) => {
            setLocalText(e.target.value);
            const words = e.target.value.split("\n").filter(Boolean);
            if (words.length > 0) onChange("texts", words.join(","));
          }}
          onFocus={() => { focused.current = true; }}
          onBlur={() => { focused.current = false; }}
          style={textareaStyle}
        />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        <span style={{ color: "#555", fontSize: "10px", letterSpacing: "0.08em", width: "72px" }}>PRESETS</span>
        {MORPH_PRESETS.map((preset) => (
          <PresetBtn
            key={preset.label} label={preset.label}
            active={activePreset?.label === preset.label}
            onClick={() => onChange("texts", preset.texts.join(",") as unknown as string)}
          />
        ))}
      </div>
    </>
  );
}

export function SpinningTextControls({ p, onChange }: { p: SpinningTextParams; onChange: ParamOnChange }) {
  const [localText, setLocalText] = useState(p.text);
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) setLocalText(p.text);
  }, [p.text]);

  return (
    <>
      <Slider label="SPEED"  value={p.duration} min={5}  max={30}  step={1} onChange={(v) => onChange("duration", v)} display={`${p.duration}s`} />
      <Slider label="RADIUS" value={p.radius}   min={40} max={200} step={5} onChange={(v) => onChange("radius", v)}   display={`${p.radius}px`} />
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <span style={{ color: "#555", fontSize: "10px", letterSpacing: "0.08em" }}>TEXT</span>
        <input
          type="text"
          value={localText}
          onChange={(e) => { setLocalText(e.target.value); onChange("text", e.target.value); }}
          onFocus={() => { focused.current = true; }}
          onBlur={() => { focused.current = false; }}
          style={textInputStyle}
        />
      </div>
    </>
  );
}

export function TypingAnimationControls({ p, onChange }: { p: TypingAnimationParams; onChange: ParamOnChange }) {
  const [localText, setLocalText] = useState(p.words.join("\n"));
  const focused = useRef(false);
  const activePreset = TYPING_PRESETS.find((x) => x.words.join() === p.words.join());

  useEffect(() => {
    if (!focused.current) setLocalText(p.words.join("\n"));
  }, [p.words.join(",")]);  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Slider label="TYPE SPD"   value={p.typeSpeed}   min={20}  max={200} step={5} onChange={(v) => onChange("typeSpeed", v)}   display={`${p.typeSpeed}ms`} />
      <Slider label="DEL SPD"    value={p.deleteSpeed} min={10}  max={100} step={5} onChange={(v) => onChange("deleteSpeed", v)} display={`${p.deleteSpeed}ms`} />
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <span style={{ color: "#555", fontSize: "10px", letterSpacing: "0.08em" }}>WORDS (one per line)</span>
        <textarea
          value={localText}
          onChange={(e) => {
            setLocalText(e.target.value);
            const words = e.target.value.split("\n").filter(Boolean);
            if (words.length > 0) onChange("words", words.join(","));
          }}
          onFocus={() => { focused.current = true; }}
          onBlur={() => { focused.current = false; }}
          style={textareaStyle}
        />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        <span style={{ color: "#555", fontSize: "10px", letterSpacing: "0.08em", width: "72px" }}>PRESETS</span>
        {TYPING_PRESETS.map((preset) => (
          <PresetBtn
            key={preset.label} label={preset.label}
            active={activePreset?.label === preset.label}
            onClick={() => onChange("words", preset.words.join(",") as unknown as string)}
          />
        ))}
      </div>
    </>
  );
}
