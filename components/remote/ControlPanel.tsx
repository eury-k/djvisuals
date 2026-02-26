"use client";

import {
  SCENES, Scene, BackgroundParams,
  IridescenceParams, AuroraParams, RetroGridParams,
  FlickeringGridParams, RippleParams, MorphingTextParams,
  SpinningTextParams, TypingAnimationParams,
} from "@/components/visuals/scenes";
import {
  IridescenceControls, AuroraControls, RetroGridControls,
  FlickeringGridControls, RippleControls, MorphingTextControls,
  SpinningTextControls, TypingAnimationControls,
  ParamOnChange,
} from "@/components/visuals/ParamControls";

interface ControlPanelProps {
  activeScene: Scene;
  params: BackgroundParams;
  onSwitch: (sceneId: string) => void;
  onParamChange: ParamOnChange;
  onFullscreen: () => void;
}

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
        {activeScene.background === "iridescence"    && <IridescenceControls    p={params as IridescenceParams}    onChange={onParamChange} />}
        {activeScene.background === "aurora"         && <AuroraControls         p={params as AuroraParams}         onChange={onParamChange} />}
        {activeScene.background === "retrogrid"      && <RetroGridControls      p={params as RetroGridParams}      onChange={onParamChange} />}
        {activeScene.background === "flickeringgrid" && <FlickeringGridControls p={params as FlickeringGridParams} onChange={onParamChange} />}
        {activeScene.background === "ripple"         && <RippleControls         p={params as RippleParams}         onChange={onParamChange} />}
        {activeScene.background === "morphingtext"   && <MorphingTextControls   p={params as MorphingTextParams}   onChange={onParamChange} />}
        {activeScene.background === "spinningtext"   && <SpinningTextControls   p={params as SpinningTextParams}   onChange={onParamChange} />}
        {activeScene.background === "typinganimation" && <TypingAnimationControls p={params as TypingAnimationParams} onChange={onParamChange} />}
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
                flex: "1 1 0", minWidth: "80px", padding: "14px 16px",
                background: isActive ? "#fff" : "#111",
                color: isActive ? "#000" : "#777",
                border: `1px solid ${isActive ? "#fff" : "#2a2a2a"}`,
                borderRadius: "10px", fontSize: "12px", fontFamily: "monospace",
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
