"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import VisualStage, { LayerFadeMap } from "@/components/visuals/VisualStage";
import {
  DEFAULT_PARAMS, BackgroundId,
  Layer, BackgroundLayer, SplineLayer, ImageLayer,
  ImageAnimationType, ImageAnimationConfig, BlendMode,
  IridescenceParams, AuroraParams, RetroGridParams,
  FlickeringGridParams, RippleParams, MorphingTextParams,
  SpinningTextParams, TypingAnimationParams, BackgroundParams,
} from "@/components/visuals/scenes";
import {
  Slider, ColorChip,
  IridescenceControls, AuroraControls, RetroGridControls,
  FlickeringGridControls, RippleControls, MorphingTextControls,
  SpinningTextControls, TypingAnimationControls,
  ParamOnChange,
} from "@/components/visuals/ParamControls";

// ─── Constants ────────────────────────────────────────────────────────────────

const DURATION_PRESETS = [5, 10, 15, 20, 25, 30];

const BLEND_MODES: BlendMode[] = ["normal", "screen", "overlay", "multiply", "lighter"];

const BG_LABELS: Record<BackgroundId, string> = {
  iridescence:     "Iridescence",
  aurora:          "Aurora",
  retrogrid:       "Retro Grid",
  flickeringgrid:  "Flicker",
  ripple:          "Ripple",
  morphingtext:    "Morph Text",
  spinningtext:    "Spin Text",
  typinganimation: "Typing",
};

const BG_COLORS: Record<BackgroundId, string> = {
  iridescence:     "#a855f7",
  aurora:          "#00c8aa",
  retrogrid:       "#00ff88",
  flickeringgrid:  "#60a5fa",
  ripple:          "#e879f9",
  morphingtext:    "#fb923c",
  spinningtext:    "#facc15",
  typinganimation: "#4ade80",
};

const ANIM_LABELS: Record<ImageAnimationType, string> = {
  spin:   "Spin",
  bounce: "Bounce",
  zoom:   "Zoom",
  pulse:  "Pulse",
  sway:   "Sway",
};

const ALL_ANIM_TYPES: ImageAnimationType[] = ["spin", "bounce", "zoom", "pulse", "sway"];

// ─── Types ────────────────────────────────────────────────────────────────────

interface Clip {
  id: string;
  layers: Layer[];
  duration: number;
  reversed: boolean;
}

type Mode = "idle" | "previewing" | "recording" | "done";
type RightView = "export" | "layer";

let _id = 0;
const uid = () => `item-${++_id}`;

const makeBackgroundLayer = (backgroundId: BackgroundId): BackgroundLayer => ({
  id: uid(),
  type: "background",
  backgroundId,
  params: { ...DEFAULT_PARAMS[backgroundId] },
  opacity: 1,
  blendMode: "normal",
  fadeIn: 0,
  fadeOut: 0,
});

const makeSplineLayer = (): SplineLayer => ({
  id: uid(),
  type: "spline",
  splineUrl: "",
  opacity: 1,
  fadeIn: 0,
  fadeOut: 0,
});

const makeImageLayer = (): ImageLayer => ({
  id: uid(),
  type: "image",
  src: "",
  opacity: 1,
  blendMode: "normal",
  size: 40,
  x: 50,
  y: 50,
  animations: [],
  fadeIn: 0,
  fadeOut: 0,
});

const defaultClip = (backgroundId: BackgroundId = "iridescence"): Clip => ({
  id: uid(),
  layers: [makeBackgroundLayer(backgroundId)],
  duration: 10,
  reversed: false,
});

// ─── LayerRow ─────────────────────────────────────────────────────────────────

function LayerRow({
  layer, canRemove, canMoveUp, canMoveDown,
  isSelected,
  onSelect,
  onUpdate, onRemove, onMoveUp, onMoveDown,
}: {
  layer: Layer;
  canRemove: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (changes: Partial<Layer>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();
  const iconBtn: React.CSSProperties = {
    background: "none", border: "none", color: "#444", cursor: "pointer",
    fontSize: "11px", padding: "0 3px", lineHeight: 1, flexShrink: 0,
  };

  const rowStyle: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: "6px",
    borderLeft: isSelected ? "2px solid #7c3aff" : "2px solid transparent",
    paddingLeft: isSelected ? "4px" : "4px",
    cursor: "pointer",
    borderRadius: "2px",
  };

  if (layer.type === "spline") {
    return (
      <div style={rowStyle} onClick={(e) => { stop(e); onSelect(); }}>
        <span style={{ color: "#7c3aff", fontSize: "10px", fontFamily: "monospace", flexShrink: 0, width: "16px" }}>3D</span>
        <input
          value={layer.splineUrl}
          onChange={(e) => onUpdate({ splineUrl: e.target.value } as Partial<SplineLayer>)}
          onClick={stop}
          placeholder="https://prod.spline.design/..."
          style={{
            flex: 1, minWidth: 0, background: "#111", border: "1px solid #2a2a2a",
            color: "#888", fontSize: "10px", padding: "3px 6px", borderRadius: "4px",
            fontFamily: "monospace",
          }}
        />
        <input
          type="range" min="0" max="1" step="0.05" value={layer.opacity}
          onChange={(e) => onUpdate({ opacity: parseFloat(e.target.value) } as Partial<SplineLayer>)}
          onClick={stop}
          style={{ width: "44px", accentColor: "#7c3aff", cursor: "pointer" }}
        />
        <button style={iconBtn} onClick={(e) => { stop(e); onMoveUp(); }} disabled={!canMoveUp} title="Move up">↑</button>
        <button style={iconBtn} onClick={(e) => { stop(e); onMoveDown(); }} disabled={!canMoveDown} title="Move down">↓</button>
        {canRemove && (
          <button
            style={iconBtn}
            onClick={(e) => { stop(e); onRemove(); }}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#ff4444")}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "#444")}
          >×</button>
        )}
      </div>
    );
  }

  if (layer.type === "image") {
    return (
      <div style={rowStyle} onClick={(e) => { stop(e); onSelect(); }}>
        <span style={{ color: "#f59e0b", fontSize: "10px", fontFamily: "monospace", flexShrink: 0, width: "16px" }}>IMG</span>
        <span style={{
          flex: 1, minWidth: 0, color: "#555", fontSize: "10px", fontFamily: "monospace",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {layer.src ? "image loaded" : "no image"}
        </span>
        <button style={iconBtn} onClick={(e) => { stop(e); onMoveUp(); }} disabled={!canMoveUp} title="Move up">↑</button>
        <button style={iconBtn} onClick={(e) => { stop(e); onMoveDown(); }} disabled={!canMoveDown} title="Move down">↓</button>
        {canRemove && (
          <button
            style={iconBtn}
            onClick={(e) => { stop(e); onRemove(); }}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#ff4444")}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "#444")}
          >×</button>
        )}
      </div>
    );
  }

  const bg = layer as BackgroundLayer;
  return (
    <div style={rowStyle} onClick={(e) => { stop(e); onSelect(); }}>
      <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: BG_COLORS[bg.backgroundId], flexShrink: 0 }} />
      <select
        value={bg.backgroundId}
        onClick={stop}
        onChange={(e) => {
          const id = e.target.value as BackgroundId;
          onUpdate({ backgroundId: id, params: { ...DEFAULT_PARAMS[id] } } as Partial<BackgroundLayer>);
        }}
        style={{
          flex: 1, minWidth: 0, background: "#111", border: "1px solid #2a2a2a",
          color: "#aaa", fontSize: "10px", padding: "3px 4px", borderRadius: "4px",
          fontFamily: "monospace",
        }}
      >
        {(Object.keys(DEFAULT_PARAMS) as BackgroundId[]).map((id) => (
          <option key={id} value={id}>{BG_LABELS[id]}</option>
        ))}
      </select>
      <select
        value={bg.blendMode}
        onClick={stop}
        onChange={(e) => onUpdate({ blendMode: e.target.value as BlendMode } as Partial<BackgroundLayer>)}
        style={{
          background: "#111", border: "1px solid #2a2a2a", color: "#666",
          fontSize: "10px", padding: "3px 4px", borderRadius: "4px",
          fontFamily: "monospace", width: "66px", flexShrink: 0,
        }}
      >
        {BLEND_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
      </select>
      <input
        type="range" min="0" max="1" step="0.05" value={bg.opacity}
        onClick={stop}
        onChange={(e) => onUpdate({ opacity: parseFloat(e.target.value) } as Partial<BackgroundLayer>)}
        style={{ width: "44px", accentColor: "#fff", cursor: "pointer", flexShrink: 0 }}
      />
      <button style={iconBtn} onClick={(e) => { stop(e); onMoveUp(); }} disabled={!canMoveUp} title="Move up">↑</button>
      <button style={iconBtn} onClick={(e) => { stop(e); onMoveDown(); }} disabled={!canMoveDown} title="Move down">↓</button>
      {canRemove && (
        <button
          style={iconBtn}
          onClick={(e) => { stop(e); onRemove(); }}
          onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#ff4444")}
          onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "#444")}
        >×</button>
      )}
    </div>
  );
}

// ─── DragHandle ───────────────────────────────────────────────────────────────

function DragHandle() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 3px)", gap: "2px", padding: "2px", cursor: "grab", flexShrink: 0 }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{ width: 3, height: 3, borderRadius: "50%", background: "#3a3a3a" }} />
      ))}
    </div>
  );
}

// ─── ClipRow ──────────────────────────────────────────────────────────────────

function ClipRow({
  clip, index, isActive, isDragging, isDropTarget,
  selectedLayerIndex,
  onSelect, onChange, onRemove, canRemove,
  onDragStart, onDragOver, onDrop, onDragEnd,
  onLayerSelect,
}: {
  clip: Clip; index: number; isActive: boolean; isDragging: boolean; isDropTarget: boolean;
  selectedLayerIndex: number | null;
  onSelect: () => void; onChange: (changes: Partial<Clip>) => void;
  onRemove: () => void; canRemove: boolean;
  onDragStart: () => void; onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void; onDragEnd: () => void;
  onLayerSelect: (clipIndex: number, layerIndex: number) => void;
}) {
  const firstBg = clip.layers.find((l) => l.type === "background") as BackgroundLayer | undefined;
  const dotColor = firstBg ? BG_COLORS[firstBg.backgroundId] : "#555";
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  const updateLayer = (layerIndex: number, changes: Partial<Layer>) => {
    const next = [...clip.layers];
    next[layerIndex] = { ...next[layerIndex], ...changes } as Layer;
    onChange({ layers: next });
  };

  const removeLayer = (layerIndex: number) => {
    onChange({ layers: clip.layers.filter((_, i) => i !== layerIndex) });
  };

  const moveLayer = (from: number, to: number) => {
    const next = [...clip.layers];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange({ layers: next });
  };

  const addBgLayer = (e: React.MouseEvent) => {
    stop(e);
    onChange({ layers: [...clip.layers, makeBackgroundLayer("aurora")] });
  };

  const addSplineLayer = (e: React.MouseEvent) => {
    stop(e);
    onChange({ layers: [...clip.layers, makeSplineLayer()] });
  };

  const addImageLayer = (e: React.MouseEvent) => {
    stop(e);
    onChange({ layers: [...clip.layers, makeImageLayer()] });
  };

  return (
    <div
      draggable
      onClick={onSelect}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      style={{
        display: "flex", flexDirection: "column", gap: "6px",
        padding: "10px 10px 10px 8px",
        background: isDropTarget ? "#16102a" : isActive ? "#1a1a1a" : "transparent",
        border: `1px solid ${isDropTarget ? "#7c3aff55" : isActive ? "#2a2a2a" : "transparent"}`,
        borderRadius: "8px", marginBottom: "4px",
        opacity: isDragging ? 0.4 : 1,
        userSelect: "none", transition: "background 0.1s, border 0.1s",
      }}
    >
      {/* ── Header: drag + index + dot + delete ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <DragHandle />
        <span style={{ color: "#333", fontSize: "11px", width: "14px", textAlign: "right", flexShrink: 0 }}>{index + 1}</span>
        <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: dotColor, flexShrink: 0 }} />
        <span style={{ flex: 1 }} />
        {canRemove && (
          <button
            onClick={(e) => { stop(e); onRemove(); }}
            style={{ background: "none", border: "none", color: "#2a2a2a", cursor: "pointer", fontSize: "14px", padding: "0", lineHeight: 1 }}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#ff4444")}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "#2a2a2a")}
          >×</button>
        )}
      </div>

      {/* ── Layer stack ── */}
      <div onClick={stop} style={{ display: "flex", flexDirection: "column", gap: "4px", paddingLeft: "22px" }}>
        {clip.layers.map((layer, li) => (
          <LayerRow
            key={layer.id}
            layer={layer}
            canRemove={clip.layers.length > 1}
            canMoveUp={li > 0}
            canMoveDown={li < clip.layers.length - 1}
            isSelected={selectedLayerIndex === li}
            onSelect={() => onLayerSelect(index, li)}
            onUpdate={(changes) => updateLayer(li, changes)}
            onRemove={() => removeLayer(li)}
            onMoveUp={() => moveLayer(li, li - 1)}
            onMoveDown={() => moveLayer(li, li + 1)}
          />
        ))}

        {/* Add layer buttons */}
        <div style={{ display: "flex", gap: "4px", marginTop: "2px" }}>
          {([["+ BG", addBgLayer], ["+ 3D", addSplineLayer], ["+ IMG", addImageLayer]] as const).map(([label, handler]) => (
            <button
              key={label}
              onClick={handler}
              style={{
                background: "none", border: "1px dashed #222", borderRadius: "4px",
                color: "#333", cursor: "pointer", fontSize: "10px",
                fontFamily: "monospace", padding: "3px 8px", letterSpacing: "0.05em",
                transition: "all 0.1s",
              }}
              onMouseEnter={(e) => { (e.target as HTMLElement).style.borderColor = "#555"; (e.target as HTMLElement).style.color = "#666"; }}
              onMouseLeave={(e) => { (e.target as HTMLElement).style.borderColor = "#222"; (e.target as HTMLElement).style.color = "#333"; }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Duration + reverse ── */}
      <div onClick={stop} style={{ display: "flex", gap: "4px", paddingLeft: "22px", alignItems: "center" }}>
        {DURATION_PRESETS.map((s) => (
          <button
            key={s}
            onClick={() => onChange({ duration: s })}
            style={{
              flex: 1, padding: "4px 0",
              background: clip.duration === s ? "#fff" : "#111",
              color: clip.duration === s ? "#000" : "#444",
              border: `1px solid ${clip.duration === s ? "#fff" : "#1e1e1e"}`,
              borderRadius: "5px", fontSize: "10px", fontFamily: "monospace",
              cursor: "pointer", transition: "all 0.1s",
            }}
          >{s}s</button>
        ))}
        <button
          onClick={() => onChange({ reversed: !clip.reversed })}
          style={{
            background: clip.reversed ? "#2a1a4a" : "none",
            border: `1px solid ${clip.reversed ? "#7c3aff" : "#2a2a2a"}`,
            borderRadius: "5px", color: clip.reversed ? "#a366ff" : "#444",
            cursor: "pointer", fontSize: "10px", fontFamily: "monospace",
            padding: "4px 6px", flexShrink: 0, transition: "all 0.15s",
          }}
        >{clip.reversed ? "◀" : "▶"}</button>
      </div>

    </div>
  );
}

// ─── ImageLayerPanel ──────────────────────────────────────────────────────────

function ImageLayerPanel({
  layer, onChange,
}: {
  layer: ImageLayer;
  onChange: (changes: Partial<ImageLayer>) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => onChange({ src: e.target?.result as string });
    reader.readAsDataURL(file);
  };

  const toggleAnim = (type: ImageAnimationType) => {
    const existing = layer.animations.find((a) => a.type === type);
    if (existing) {
      onChange({ animations: layer.animations.filter((a) => a.type !== type) });
    } else {
      onChange({ animations: [...layer.animations, { type, speed: 2, intensity: 0.5 }] });
    }
  };

  const updateAnim = (type: ImageAnimationType, key: "speed" | "intensity", value: number) => {
    onChange({
      animations: layer.animations.map((a) =>
        a.type === type ? { ...a, [key]: value } : a
      ),
    });
  };

  const chipStyle = (active: boolean): React.CSSProperties => ({
    padding: "3px 8px", fontSize: "10px", fontFamily: "monospace", cursor: "pointer",
    border: `1px solid ${active ? "#f59e0b" : "#333"}`,
    color: active ? "#f59e0b" : "#555",
    background: active ? "#1a1400" : "none",
    borderRadius: "4px", letterSpacing: "0.05em",
    transition: "all 0.1s",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* Source */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <span style={{ color: "#555", fontSize: "10px", letterSpacing: "0.08em" }}>SOURCE</span>
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            background: "#111", border: "1px dashed #333", borderRadius: "6px",
            color: "#888", cursor: "pointer", fontSize: "10px", fontFamily: "monospace",
            padding: "8px", textAlign: "center", transition: "all 0.1s",
          }}
          onMouseEnter={(e) => (e.target as HTMLElement).style.borderColor = "#f59e0b"}
          onMouseLeave={(e) => (e.target as HTMLElement).style.borderColor = "#333"}
        >
          {layer.src ? "Replace Image" : "Upload Image"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
        <input
          type="text"
          value={layer.src.startsWith("data:") ? "" : layer.src}
          onChange={(e) => onChange({ src: e.target.value })}
          placeholder="or paste https:// URL"
          style={{
            background: "#0a0a0a", border: "1px solid #2a2a2a", borderRadius: "4px",
            color: "#666", fontSize: "10px", fontFamily: "monospace", padding: "5px 8px",
          }}
        />
        {layer.src && (
          <div style={{ width: "100%", maxHeight: "80px", overflow: "hidden", borderRadius: "4px", border: "1px solid #2a2a2a" }}>
            <img src={layer.src} alt="" style={{ width: "100%", height: "80px", objectFit: "cover" }} />
          </div>
        )}
      </div>

      {/* Position + size */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <span style={{ color: "#555", fontSize: "10px", letterSpacing: "0.08em" }}>LAYOUT</span>
        <Slider label="SIZE"    value={layer.size} min={10}  max={100} step={1}  onChange={(v) => onChange({ size: v })}    display={`${layer.size}%`} />
        <Slider label="X"       value={layer.x}    min={0}   max={100} step={1}  onChange={(v) => onChange({ x: v })}       display={`${layer.x}%`} />
        <Slider label="Y"       value={layer.y}    min={0}   max={100} step={1}  onChange={(v) => onChange({ y: v })}       display={`${layer.y}%`} />
        <Slider label="OPACITY" value={layer.opacity} min={0} max={1} step={0.05} onChange={(v) => onChange({ opacity: v })} />
      </div>

      {/* Blend mode */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ color: "#555", fontSize: "10px", letterSpacing: "0.08em", width: "72px", flexShrink: 0 }}>BLEND</span>
        <select
          value={layer.blendMode}
          onChange={(e) => onChange({ blendMode: e.target.value as BlendMode })}
          style={{
            flex: 1, background: "#111", border: "1px solid #2a2a2a", borderRadius: "4px",
            color: "#888", fontSize: "10px", fontFamily: "monospace", padding: "4px 6px",
          }}
        >
          {BLEND_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {/* Animations */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <span style={{ color: "#555", fontSize: "10px", letterSpacing: "0.08em" }}>ANIMATIONS</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
          {ALL_ANIM_TYPES.map((type) => {
            const active = layer.animations.some((a) => a.type === type);
            return (
              <button key={type} onClick={() => toggleAnim(type)} style={chipStyle(active)}>
                {ANIM_LABELS[type]}
              </button>
            );
          })}
        </div>
        {layer.animations.map((anim) => (
          <div key={anim.type} style={{ display: "flex", flexDirection: "column", gap: "4px", paddingLeft: "8px", borderLeft: "1px solid #2a2a2a" }}>
            <span style={{ color: "#f59e0b", fontSize: "10px", letterSpacing: "0.06em" }}>{ANIM_LABELS[anim.type]}</span>
            <Slider label="SPEED"     value={anim.speed}     min={0.5} max={20}  step={0.5} onChange={(v) => updateAnim(anim.type, "speed", v)}     display={`${anim.speed}s`} />
            {anim.type !== "spin" && (
              <Slider label="INTENSITY" value={anim.intensity} min={0}   max={1}   step={0.05} onChange={(v) => updateAnim(anim.type, "intensity", v)} />
            )}
          </div>
        ))}
      </div>

      {/* Fade */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <span style={{ color: "#555", fontSize: "10px", letterSpacing: "0.08em" }}>FADE</span>
        <FadeControls
          fadeIn={layer.fadeIn} fadeOut={layer.fadeOut}
          onFadeIn={(v) => onChange({ fadeIn: v })}
          onFadeOut={(v) => onChange({ fadeOut: v })}
        />
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function BuilderPage() {
  const [clips, setClips] = useState<Clip[]>([
    defaultClip("iridescence"),
    defaultClip("aurora"),
    defaultClip("retrogrid"),
  ]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [mode, setMode] = useState<Mode>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [recordedSize, setRecordedSize] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  // Right panel state
  const [rightView, setRightView] = useState<RightView>("export");
  const [selectedLayer, setSelectedLayer] = useState<{ clipIndex: number; layerIndex: number } | null>(null);

  // Per-layer fade state
  const [layerFades, setLayerFades] = useState<LayerFadeMap>({});
  const fadeTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const elapsedIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeClip = clips[activeIndex] ?? clips[0];
  const totalDuration = clips.reduce((s, c) => s + c.duration, 0);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  // ── Layer selection ────────────────────────────────────────────────────────

  const handleLayerSelect = useCallback((clipIndex: number, layerIndex: number) => {
    setSelectedLayer({ clipIndex, layerIndex });
    setRightView("layer");
  }, []);

  // Derive selected layer object
  const selectedLayerObj = selectedLayer
    ? clips[selectedLayer.clipIndex]?.layers[selectedLayer.layerIndex] ?? null
    : null;

  // ── Per-layer fade animation ───────────────────────────────────────────────

  useEffect(() => {
    fadeTimersRef.current.forEach(clearTimeout);
    fadeTimersRef.current = [];

    if (mode !== "previewing" && mode !== "recording") {
      setLayerFades({});
      return;
    }

    const clip = clips[activeIndex];
    if (!clip) return;

    // Initialise: layers with fadeIn start invisible, others fully visible
    const initial: LayerFadeMap = {};
    clip.layers.forEach((layer) => {
      initial[layer.id] = { opacity: layer.fadeIn > 0 ? 0 : 1, transition: "none" };
    });
    setLayerFades(initial);

    // Trigger fade-ins on next paint
    let raf: number;
    if (clip.layers.some((l) => l.fadeIn > 0)) {
      raf = requestAnimationFrame(() => {
        setLayerFades((prev) => {
          const next = { ...prev };
          clip.layers.forEach((layer) => {
            if (layer.fadeIn > 0) {
              next[layer.id] = { opacity: 1, transition: `opacity ${layer.fadeIn}s linear` };
            }
          });
          return next;
        });
      });
    }

    // Schedule fade-outs
    clip.layers.forEach((layer) => {
      if (layer.fadeOut > 0) {
        const delay = Math.max(0, (clip.duration - layer.fadeOut) * 1000);
        const t = setTimeout(() => {
          setLayerFades((prev) => ({
            ...prev,
            [layer.id]: { opacity: 0, transition: `opacity ${layer.fadeOut}s linear` },
          }));
        }, delay);
        fadeTimersRef.current.push(t);
      }
    });

    return () => {
      if (raf !== undefined) cancelAnimationFrame(raf);
      fadeTimersRef.current.forEach(clearTimeout);
    };
  }, [activeIndex, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Clip management ──────────────────────────────────────────────────────

  const addClip = () => setClips((p) => [...p, defaultClip()]);

  const removeClip = (id: string) =>
    setClips((p) => { const n = p.filter((c) => c.id !== id); return n.length ? n : p; });

  const updateClip = (id: string, changes: Partial<Clip>) =>
    setClips((p) => p.map((c) => (c.id === id ? { ...c, ...changes } : c)));

  const reorderClips = useCallback((from: number, to: number) => {
    if (from === to) return;
    setClips((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    setActiveIndex((prev) => {
      if (prev === from) return to;
      if (from < to && prev > from && prev <= to) return prev - 1;
      if (from > to && prev >= to && prev < from) return prev + 1;
      return prev;
    });
  }, []);

  // ── Update selected layer (from right panel) ───────────────────────────────

  const updateSelectedLayer = useCallback((changes: Partial<Layer>) => {
    if (!selectedLayer) return;
    const clip = clips[selectedLayer.clipIndex];
    if (!clip) return;
    const next = [...clip.layers];
    next[selectedLayer.layerIndex] = { ...next[selectedLayer.layerIndex], ...changes } as Layer;
    updateClip(clip.id, { layers: next });
  }, [selectedLayer, clips]);

  // Param change handler for BackgroundLayer params
  const handleBgParamChange: ParamOnChange = useCallback((key, value) => {
    if (!selectedLayerObj || selectedLayerObj.type !== "background") return;
    const bg = selectedLayerObj as BackgroundLayer;
    const params = { ...bg.params } as Record<string, unknown>;
    if (typeof value === "string" && (key === "colorStops" || key === "texts" || key === "words")) {
      params[key] = value.split(",").filter(Boolean);
    } else {
      params[key] = value;
    }
    updateSelectedLayer({ params: params as unknown as BackgroundParams } as Partial<BackgroundLayer>);
  }, [selectedLayerObj, updateSelectedLayer]);

  // ── Playback engine ───────────────────────────────────────────────────────

  const stopAll = useCallback(() => {
    if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
    if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
  }, []);

  const playFrom = useCallback(
    (startIndex: number, recording: boolean) => {
      stopAll();
      const step = (index: number) => {
        if (index >= clips.length) {
          recording ? recorderRef.current?.stop() : (setMode("idle"), setActiveIndex(0));
          return;
        }
        setActiveIndex(index);
        advanceTimeoutRef.current = setTimeout(() => step(index + 1), clips[index].duration * 1000);
      };
      step(startIndex);
    },
    [clips, stopAll],
  );

  // ── Preview ───────────────────────────────────────────────────────────────

  const startPreview = () => { setActiveIndex(0); setMode("previewing"); playFrom(0, false); };
  const stopPreview = () => { stopAll(); setMode("idle"); setActiveIndex(0); };

  // ── Recording ─────────────────────────────────────────────────────────────

  const startRecording = async () => {
    setError(null); chunksRef.current = []; setRecordedUrl(null); setRecordedSize(0); setElapsed(0);
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 60 } as MediaTrackConstraints, audio: false });
    } catch { setError("Screen sharing was cancelled or denied."); return; }

    const mimeType = ["video/webm;codecs=vp9", "video/webm"].find((t) => MediaRecorder.isTypeSupported(t)) ?? "video/webm";
    const recorder = new MediaRecorder(stream, { mimeType });
    recorderRef.current = recorder;
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.onstop = () => {
      stopAll(); stream.getTracks().forEach((t) => t.stop());
      if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      setRecordedUrl(URL.createObjectURL(blob));
      setRecordedSize(Math.round(blob.size / 1024 / 1024 * 10) / 10);
      setMode("done"); setActiveIndex(0);
    };
    recorder.start(500);
    setMode("recording"); setActiveIndex(0); setElapsed(0);
    const startTime = Date.now();
    elapsedIntervalRef.current = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 500);
    playFrom(0, true);
  };

  const stopRecording = () => { stopAll(); recorderRef.current?.stop(); };
  const download = () => {
    if (!recordedUrl) return;
    const a = document.createElement("a");
    a.href = recordedUrl; a.download = `djvisuals-${Date.now()}.webm`; a.click();
  };

  useEffect(() => () => stopAll(), [stopAll]);

  // ── Right panel content ───────────────────────────────────────────────────

  const layerTypeLabel = (layer: Layer): string => {
    if (layer.type === "background") return BG_LABELS[(layer as BackgroundLayer).backgroundId];
    if (layer.type === "spline") return "3D (Spline)";
    if (layer.type === "image") return "Image";
    return "Layer";
  };

  const renderLayerPanel = () => {
    if (!selectedLayerObj) {
      return <span style={{ color: "#333", fontSize: "10px" }}>Select a layer to edit</span>;
    }

    if (selectedLayerObj.type === "image") {
      const img = selectedLayerObj as ImageLayer;
      return (
        <ImageLayerPanel
          layer={img}
          onChange={(changes) => updateSelectedLayer(changes as Partial<Layer>)}
        />
      );
    }

    if (selectedLayerObj.type === "background") {
      const bg = selectedLayerObj as BackgroundLayer;
      const id = bg.backgroundId;
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {id === "iridescence"    && <IridescenceControls    p={bg.params as IridescenceParams}    onChange={handleBgParamChange} />}
          {id === "aurora"         && <AuroraControls         p={bg.params as AuroraParams}         onChange={handleBgParamChange} />}
          {id === "retrogrid"      && <RetroGridControls      p={bg.params as RetroGridParams}      onChange={handleBgParamChange} />}
          {id === "flickeringgrid" && <FlickeringGridControls p={bg.params as FlickeringGridParams} onChange={handleBgParamChange} />}
          {id === "ripple"         && <RippleControls         p={bg.params as RippleParams}         onChange={handleBgParamChange} />}
          {id === "morphingtext"   && <MorphingTextControls   p={bg.params as MorphingTextParams}   onChange={handleBgParamChange} />}
          {id === "spinningtext"   && <SpinningTextControls   p={bg.params as SpinningTextParams}   onChange={handleBgParamChange} />}
          {id === "typinganimation" && <TypingAnimationControls p={bg.params as TypingAnimationParams} onChange={handleBgParamChange} />}
          <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#555", fontSize: "10px", letterSpacing: "0.08em", width: "72px", flexShrink: 0 }}>BLEND</span>
              <select
                value={bg.blendMode}
                onChange={(e) => updateSelectedLayer({ blendMode: e.target.value as BlendMode } as Partial<BackgroundLayer>)}
                style={{ flex: 1, background: "#111", border: "1px solid #2a2a2a", borderRadius: "4px", color: "#888", fontSize: "10px", fontFamily: "monospace", padding: "4px 6px" }}
              >
                {BLEND_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <Slider label="OPACITY" value={bg.opacity} min={0} max={1} step={0.05} onChange={(v) => updateSelectedLayer({ opacity: v } as Partial<BackgroundLayer>)} />
          </div>
          <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: "8px" }}>
            <span style={{ color: "#555", fontSize: "10px", letterSpacing: "0.08em", display: "block", marginBottom: "6px" }}>FADE</span>
            <FadeControls
              fadeIn={bg.fadeIn} fadeOut={bg.fadeOut}
              onFadeIn={(v) => updateSelectedLayer({ fadeIn: v } as Partial<BackgroundLayer>)}
              onFadeOut={(v) => updateSelectedLayer({ fadeOut: v } as Partial<BackgroundLayer>)}
            />
          </div>
        </div>
      );
    }

    // Spline layer — just fade controls
    const sp = selectedLayerObj as SplineLayer;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <span style={{ color: "#555", fontSize: "10px" }}>Edit the Spline URL in the timeline row.</span>
        <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: "8px" }}>
          <span style={{ color: "#555", fontSize: "10px", letterSpacing: "0.08em", display: "block", marginBottom: "6px" }}>FADE</span>
          <FadeControls
            fadeIn={sp.fadeIn} fadeOut={sp.fadeOut}
            onFadeIn={(v) => updateSelectedLayer({ fadeIn: v } as Partial<SplineLayer>)}
            onFadeOut={(v) => updateSelectedLayer({ fadeOut: v } as Partial<SplineLayer>)}
          />
        </div>
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Recording / preview fullscreen overlay ── */}
      {(mode === "recording" || mode === "previewing") && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "#000" }}>
          <div style={{ width: "100vw", height: "100vh" }}>
            <VisualStage layers={activeClip.layers} reversed={activeClip.reversed} layerFades={layerFades} />
          </div>
          <div style={{ position: "absolute", top: 20, right: 20, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px", fontFamily: "monospace" }}>
            {mode === "recording" && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(0,0,0,0.7)", padding: "6px 12px", borderRadius: "6px", border: "1px solid #ff2222" }}>
                <span style={{ color: "#ff2222", fontSize: "10px" }}>●</span>
                <span style={{ color: "#fff", fontSize: "12px" }}>REC {fmt(elapsed)} / {fmt(totalDuration)}</span>
              </div>
            )}
            <div style={{ background: "rgba(0,0,0,0.7)", padding: "4px 10px", borderRadius: "6px", color: "#666", fontSize: "11px", border: "1px solid #222" }}>
              Clip {activeIndex + 1}/{clips.length} · {activeClip.layers.length} layer{activeClip.layers.length !== 1 ? "s" : ""}
            </div>
            <button
              onClick={mode === "recording" ? stopRecording : stopPreview}
              style={{ background: mode === "recording" ? "#ff2222" : "#333", border: "none", borderRadius: "6px", color: "#fff", cursor: "pointer", fontSize: "12px", fontFamily: "monospace", padding: "8px 16px" }}
            >{mode === "recording" ? "Stop Recording" : "Stop Preview"}</button>
          </div>
        </div>
      )}

      {/* ── Builder UI ── */}
      <div style={{ width: "100vw", height: "100vh", background: "#080808", display: "flex", flexDirection: "column", fontFamily: "monospace", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", borderBottom: "1px solid #141414", flexShrink: 0 }}>
          <span style={{ color: "#fff", fontSize: "13px", letterSpacing: "0.1em" }}>DJ VISUALS · BUILDER</span>
          <Link href="/" style={{ color: "#444", fontSize: "11px", textDecoration: "none", letterSpacing: "0.08em" }}>← Display</Link>
        </div>

        {/* Main */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

          {/* ── Left: Timeline ── */}
          <div style={{ width: "300px", flexShrink: 0, borderRight: "1px solid #141414", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "16px 16px 8px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <span style={{ color: "#555", fontSize: "10px", letterSpacing: "0.1em" }}>TIMELINE</span>
              <span style={{ color: "#333", fontSize: "10px" }}>{fmt(totalDuration)} total</span>
            </div>

            {/* Clip list */}
            <div style={{ flex: 1, overflowY: "auto", padding: "0 8px" }}>
              {clips.map((clip, i) => (
                <ClipRow
                  key={clip.id}
                  clip={clip}
                  index={i}
                  isActive={i === activeIndex}
                  isDragging={dragIndex === i}
                  isDropTarget={dropIndex === i && dragIndex !== i}
                  selectedLayerIndex={selectedLayer?.clipIndex === i ? selectedLayer.layerIndex : null}
                  onSelect={() => setActiveIndex(i)}
                  onChange={(changes) => updateClip(clip.id, changes)}
                  onRemove={() => removeClip(clip.id)}
                  canRemove={clips.length > 1}
                  onDragStart={() => setDragIndex(i)}
                  onDragOver={(e) => { e.preventDefault(); setDropIndex(i); }}
                  onDrop={() => { if (dragIndex !== null) reorderClips(dragIndex, i); setDragIndex(null); setDropIndex(null); }}
                  onDragEnd={() => { setDragIndex(null); setDropIndex(null); }}
                  onLayerSelect={handleLayerSelect}
                />
              ))}
            </div>

            {/* Add clip */}
            <div style={{ padding: "12px 16px", borderTop: "1px solid #141414", flexShrink: 0 }}>
              <button
                onClick={addClip}
                style={{ width: "100%", padding: "10px", background: "none", border: "1px dashed #2a2a2a", borderRadius: "8px", color: "#444", cursor: "pointer", fontSize: "12px", fontFamily: "monospace", letterSpacing: "0.05em", transition: "all 0.15s" }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.borderColor = "#555"; (e.target as HTMLElement).style.color = "#888"; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.borderColor = "#2a2a2a"; (e.target as HTMLElement).style.color = "#444"; }}
              >+ Add Clip</button>
            </div>
          </div>

          {/* ── Center: Preview ── */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", padding: "24px", overflow: "hidden" }}>
            <span style={{ color: "#333", fontSize: "10px", letterSpacing: "0.1em" }}>
              PREVIEW — Clip {activeIndex + 1}/{clips.length} · {activeClip.layers.length} layer{activeClip.layers.length !== 1 ? "s" : ""}
            </span>
            <div style={{ width: "100%", maxWidth: "640px", aspectRatio: "16/9", position: "relative", borderRadius: "8px", overflow: "hidden", border: "1px solid #1a1a1a", flexShrink: 0 }}>
              <VisualStage layers={activeClip.layers} reversed={activeClip.reversed} layerFades={layerFades} />
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              {(mode === "idle" || mode === "done") && (
                <button onClick={startPreview} style={btnStyle("#1a1a1a", "#888")}>▶ Preview All</button>
              )}
              {mode === "previewing" && (
                <button onClick={stopPreview} style={btnStyle("#333", "#ccc")}>■ Stop</button>
              )}
            </div>
          </div>

          {/* ── Right: Layer / Export panel ── */}
          <div style={{ width: "260px", flexShrink: 0, borderLeft: "1px solid #141414", display: "flex", flexDirection: "column", overflow: "hidden" }}>

            {/* Panel header with Export button */}
            <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid #141414", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <span style={{ color: "#555", fontSize: "10px", letterSpacing: "0.1em" }}>
                {rightView === "layer" && selectedLayerObj
                  ? layerTypeLabel(selectedLayerObj).toUpperCase()
                  : "EXPORT"}
              </span>
              <button
                onClick={() => setRightView("export")}
                style={{
                  background: rightView === "export" ? "#fff" : "none",
                  border: `1px solid ${rightView === "export" ? "#fff" : "#333"}`,
                  borderRadius: "4px", color: rightView === "export" ? "#000" : "#555",
                  cursor: "pointer", fontSize: "10px", fontFamily: "monospace",
                  padding: "3px 8px", letterSpacing: "0.05em", transition: "all 0.1s",
                }}
              >Export</button>
            </div>

            {/* Panel body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
              {rightView === "layer" ? (
                renderLayerPanel()
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: "8px", padding: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <Row label="Clips"      value={String(clips.length)} />
                    <Row label="Layers"     value={String(clips.reduce((s, c) => s + c.layers.length, 0))} />
                    <Row label="Duration"   value={fmt(totalDuration)} />
                    <Row label="Format"     value="WebM" />
                    <Row label="Frame rate" value="60fps" />
                  </div>

                  {(mode === "idle" || mode === "done") && (
                    <button
                      onClick={startRecording}
                      style={{ ...btnStyle("#ff2222", "#fff"), border: "1px solid #ff2222", padding: "14px", fontSize: "13px", letterSpacing: "0.08em" }}
                    >{mode === "done" ? "Record Again" : "● Start Recording"}</button>
                  )}
                  {mode === "recording" && (
                    <button onClick={stopRecording} style={btnStyle("#222", "#ff4444")}>■ Stop Recording</button>
                  )}
                  {mode === "recording" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <div style={{ height: "3px", background: "#1a1a1a", borderRadius: "2px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${Math.min(100, (elapsed / totalDuration) * 100)}%`, background: "#ff2222", transition: "width 0.5s linear" }} />
                      </div>
                      <span style={{ color: "#555", fontSize: "11px" }}>{fmt(elapsed)} / {fmt(totalDuration)}</span>
                    </div>
                  )}
                  {mode === "done" && recordedUrl && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <button onClick={download} style={{ ...btnStyle("#0f0f0f", "#00ff88"), border: "1px solid #00ff88", padding: "12px" }}>↓ Download WebM</button>
                      <span style={{ color: "#333", fontSize: "10px", textAlign: "center" }}>{recordedSize} MB · convert to MP4 with<br />HandBrake or ffmpeg</span>
                    </div>
                  )}
                  {error && <span style={{ color: "#ff4444", fontSize: "11px" }}>{error}</span>}
                  {mode === "idle" && (
                    <div style={{ marginTop: "auto", padding: "12px", background: "#0a0a0a", border: "1px solid #141414", borderRadius: "8px", color: "#333", fontSize: "10px", lineHeight: "1.6" }}>
                      When you click Record, your browser will ask which tab to share. Select this tab, then the visuals will play through automatically.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const FADE_PRESETS = [0, 0.5, 1, 2];

function FadeControls({ fadeIn, fadeOut, onFadeIn, onFadeOut }: {
  fadeIn: number; fadeOut: number;
  onFadeIn: (v: number) => void; onFadeOut: (v: number) => void;
}) {
  const chip = (active: boolean, color: string): React.CSSProperties => ({
    flex: 1, padding: "3px 0", background: active ? `${color}22` : "none",
    color: active ? color : "#444", border: `1px solid ${active ? `${color}55` : "#1a1a1a"}`,
    borderRadius: "4px", fontSize: "9px", fontFamily: "monospace",
    cursor: "pointer", transition: "all 0.1s",
  });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
        <span style={{ color: "#333", fontSize: "9px", fontFamily: "monospace", width: "30px", flexShrink: 0 }}>▶╌ IN</span>
        {FADE_PRESETS.map((s) => (
          <button key={s} onClick={() => onFadeIn(s)} style={chip(fadeIn === s, "#00aaff")}>
            {s === 0 ? "—" : `${s}s`}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
        <span style={{ color: "#333", fontSize: "9px", fontFamily: "monospace", width: "30px", flexShrink: 0 }}>╌▶ OUT</span>
        {FADE_PRESETS.map((s) => (
          <button key={s} onClick={() => onFadeOut(s)} style={chip(fadeOut === s, "#ff8833")}>
            {s === 0 ? "—" : `${s}s`}
          </button>
        ))}
      </div>
    </div>
  );
}

function btnStyle(bg: string, color: string): React.CSSProperties {
  return { background: bg, border: "1px solid #2a2a2a", borderRadius: "8px", color, cursor: "pointer", fontSize: "12px", fontFamily: "monospace", padding: "10px 16px", letterSpacing: "0.05em", transition: "all 0.15s" };
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span style={{ color: "#333", fontSize: "10px" }}>{label}</span>
      <span style={{ color: "#666", fontSize: "10px" }}>{value}</span>
    </div>
  );
}
