"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import VisualStage from "@/components/visuals/VisualStage";
import {
  SCENES,
  BackgroundParams,
  DEFAULT_PARAMS,
  BackgroundId,
} from "@/components/visuals/scenes";

// ─── Types ───────────────────────────────────────────────────────────────────

const DURATION_PRESETS = [5, 10, 15, 20, 25, 30];

interface Clip {
  id: string;
  sceneId: string;
  duration: number; // seconds
  reversed: boolean;
  params: BackgroundParams;
}

type Mode = "idle" | "previewing" | "recording" | "done";

let _id = 0;
const uid = () => `clip-${++_id}`;

const defaultClip = (sceneId = SCENES[0].id): Clip => {
  const scene = SCENES.find((s) => s.id === sceneId) ?? SCENES[0];
  return {
    id: uid(),
    sceneId: scene.id,
    duration: 10,
    reversed: false,
    params: { ...DEFAULT_PARAMS[scene.background as BackgroundId] },
  };
};

// ─── Subcomponents ────────────────────────────────────────────────────────────

const SCENE_COLORS: Record<string, string> = {
  "scene-1": "#7c3aff",
  "scene-2": "#00c8aa",
  "scene-3": "#00ff88",
};

function ClipRow({
  clip,
  index,
  isActive,
  onSelect,
  onChange,
  onRemove,
  canRemove,
}: {
  clip: Clip;
  index: number;
  isActive: boolean;
  onSelect: () => void;
  onChange: (changes: Partial<Clip>) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const color = SCENE_COLORS[clip.sceneId] ?? "#555";

  return (
    <div
      onClick={onSelect}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        padding: "10px 12px",
        background: isActive ? "#1a1a1a" : "transparent",
        border: `1px solid ${isActive ? "#333" : "transparent"}`,
        borderRadius: "8px",
        cursor: "pointer",
        transition: "all 0.1s",
        marginBottom: "4px",
      }}
    >
      {/* Row 1: index + scene + reverse + delete */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ color: "#333", fontSize: "11px", width: "16px", textAlign: "right", flexShrink: 0 }}>
          {index + 1}
        </span>
        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: color, flexShrink: 0 }} />

        <select
          value={clip.sceneId}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            const scene = SCENES.find((s) => s.id === e.target.value)!;
            onChange({ sceneId: scene.id, params: { ...DEFAULT_PARAMS[scene.background as BackgroundId] } });
          }}
          style={{
            flex: 1,
            background: "#111",
            color: "#ccc",
            border: "1px solid #2a2a2a",
            borderRadius: "6px",
            padding: "5px 8px",
            fontSize: "12px",
            fontFamily: "monospace",
            cursor: "pointer",
          }}
        >
          {SCENES.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>

        {/* Reverse toggle */}
        <button
          title={clip.reversed ? "Playing reversed — click for forward" : "Playing forward — click for reverse"}
          onClick={(e) => { e.stopPropagation(); onChange({ reversed: !clip.reversed }); }}
          style={{
            background: clip.reversed ? "#2a1a4a" : "none",
            border: `1px solid ${clip.reversed ? "#7c3aff" : "#2a2a2a"}`,
            borderRadius: "6px",
            color: clip.reversed ? "#a366ff" : "#444",
            cursor: "pointer",
            fontSize: "11px",
            fontFamily: "monospace",
            padding: "4px 7px",
            flexShrink: 0,
            transition: "all 0.15s",
          }}
        >
          {clip.reversed ? "◀ REV" : "▶ FWD"}
        </button>

        {canRemove && (
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            style={{ background: "none", border: "none", color: "#333", cursor: "pointer", fontSize: "14px", padding: "0 2px", flexShrink: 0, lineHeight: 1 }}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#ff4444")}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "#333")}
          >×</button>
        )}
      </div>

      {/* Row 2: duration presets */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ display: "flex", gap: "4px", paddingLeft: "24px" }}
      >
        {DURATION_PRESETS.map((s) => (
          <button
            key={s}
            onClick={(e) => { e.stopPropagation(); onChange({ duration: s }); }}
            style={{
              flex: 1,
              padding: "4px 0",
              background: clip.duration === s ? "#fff" : "#111",
              color: clip.duration === s ? "#000" : "#444",
              border: `1px solid ${clip.duration === s ? "#fff" : "#1e1e1e"}`,
              borderRadius: "5px",
              fontSize: "10px",
              fontFamily: "monospace",
              cursor: "pointer",
              transition: "all 0.1s",
            }}
          >
            {s}s
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function BuilderPage() {
  const [clips, setClips] = useState<Clip[]>([
    defaultClip("scene-1"),
    defaultClip("scene-2"),
    defaultClip("scene-3"),
  ]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [mode, setMode] = useState<Mode>("idle");
  const [elapsed, setElapsed] = useState(0); // seconds into current recording
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [recordedSize, setRecordedSize] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const elapsedIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeClip = clips[activeIndex] ?? clips[0];
  const activeScene = SCENES.find((s) => s.id === activeClip.sceneId) ?? SCENES[0];
  const totalDuration = clips.reduce((s, c) => s + c.duration, 0);

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  // ── Clip management ──────────────────────────────────────────────────────

  const addClip = () => setClips((p) => [...p, defaultClip()]);

  const removeClip = (id: string) =>
    setClips((p) => {
      const next = p.filter((c) => c.id !== id);
      return next.length ? next : p;
    });

  const updateClip = (id: string, changes: Partial<Clip>) =>
    setClips((p) => p.map((c) => (c.id === id ? { ...c, ...changes } : c)));

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
          if (recording) {
            recorderRef.current?.stop();
          } else {
            setMode("idle");
            setActiveIndex(0);
          }
          return;
        }
        setActiveIndex(index);
        advanceTimeoutRef.current = setTimeout(
          () => step(index + 1),
          clips[index].duration * 1000
        );
      };

      step(startIndex);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clips, stopAll]
  );

  // ── Preview ───────────────────────────────────────────────────────────────

  const startPreview = () => {
    setActiveIndex(0);
    setMode("previewing");
    playFrom(0, false);
  };

  const stopPreview = () => {
    stopAll();
    setMode("idle");
    setActiveIndex(0);
  };

  // ── Recording ─────────────────────────────────────────────────────────────

  const startRecording = async () => {
    setError(null);
    chunksRef.current = [];
    setRecordedUrl(null);
    setRecordedSize(0);
    setElapsed(0);

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 60 } as MediaTrackConstraints,
        audio: false,
      });
    } catch {
      setError("Screen sharing was cancelled or denied.");
      return;
    }

    const mimeType = ["video/webm;codecs=vp9", "video/webm"].find((t) =>
      MediaRecorder.isTypeSupported(t)
    ) ?? "video/webm";

    const recorder = new MediaRecorder(stream, { mimeType });
    recorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      stopAll();
      stream.getTracks().forEach((t) => t.stop());
      if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      setRecordedUrl(URL.createObjectURL(blob));
      setRecordedSize(Math.round(blob.size / 1024 / 1024 * 10) / 10);
      setMode("done");
      setActiveIndex(0);
    };

    recorder.start(500); // collect data every 500ms
    setMode("recording");
    setActiveIndex(0);
    setElapsed(0);

    // Track elapsed time
    const startTime = Date.now();
    elapsedIntervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 500);

    playFrom(0, true);
  };

  const stopRecording = () => {
    stopAll();
    recorderRef.current?.stop();
  };

  const download = () => {
    if (!recordedUrl) return;
    const a = document.createElement("a");
    a.href = recordedUrl;
    a.download = `djvisuals-${Date.now()}.webm`;
    a.click();
  };

  // Cleanup on unmount
  useEffect(() => () => stopAll(), [stopAll]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Recording fullscreen overlay ── */}
      {(mode === "recording" || mode === "previewing") && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "#000",
          }}
        >
          <div style={{ width: "100vw", height: "100vh" }}>
            <VisualStage scene={activeScene} params={activeClip.params} reversed={activeClip.reversed} />
          </div>

          {/* HUD */}
          <div
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "8px",
              fontFamily: "monospace",
            }}
          >
            {mode === "recording" && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(0,0,0,0.7)",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px solid #ff2222",
                }}
              >
                <span style={{ color: "#ff2222", fontSize: "10px" }}>●</span>
                <span style={{ color: "#fff", fontSize: "12px" }}>
                  REC {fmt(elapsed)} / {fmt(totalDuration)}
                </span>
              </div>
            )}
            <div
              style={{
                background: "rgba(0,0,0,0.7)",
                padding: "4px 10px",
                borderRadius: "6px",
                color: "#666",
                fontSize: "11px",
                border: "1px solid #222",
              }}
            >
              Clip {activeIndex + 1}/{clips.length} — {activeScene.label}
            </div>
            <button
              onClick={mode === "recording" ? stopRecording : stopPreview}
              style={{
                background: mode === "recording" ? "#ff2222" : "#333",
                border: "none",
                borderRadius: "6px",
                color: "#fff",
                cursor: "pointer",
                fontSize: "12px",
                fontFamily: "monospace",
                padding: "8px 16px",
              }}
            >
              {mode === "recording" ? "Stop Recording" : "Stop Preview"}
            </button>
          </div>
        </div>
      )}

      {/* ── Builder UI ── */}
      <div
        style={{
          width: "100vw",
          height: "100vh",
          background: "#080808",
          display: "flex",
          flexDirection: "column",
          fontFamily: "monospace",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 24px",
            borderBottom: "1px solid #141414",
            flexShrink: 0,
          }}
        >
          <span style={{ color: "#fff", fontSize: "13px", letterSpacing: "0.1em" }}>
            DJ VISUALS · BUILDER
          </span>
          <Link
            href="/"
            style={{ color: "#444", fontSize: "11px", textDecoration: "none", letterSpacing: "0.08em" }}
          >
            ← Display
          </Link>
        </div>

        {/* Main */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

          {/* ── Left: Timeline ── */}
          <div
            style={{
              width: "280px",
              flexShrink: 0,
              borderRight: "1px solid #141414",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "16px 16px 8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 0,
              }}
            >
              <span style={{ color: "#555", fontSize: "10px", letterSpacing: "0.1em" }}>
                TIMELINE
              </span>
              <span style={{ color: "#333", fontSize: "10px" }}>
                {fmt(totalDuration)} total
              </span>
            </div>

            {/* Clip list */}
            <div style={{ flex: 1, overflowY: "auto", padding: "0 8px" }}>
              {clips.map((clip, i) => (
                <ClipRow
                  key={clip.id}
                  clip={clip}
                  index={i}
                  isActive={i === activeIndex}
                  onSelect={() => setActiveIndex(i)}
                  onChange={(changes) => updateClip(clip.id, changes)}
                  onRemove={() => removeClip(clip.id)}
                  canRemove={clips.length > 1}
                />
              ))}
            </div>

            {/* Add clip */}
            <div style={{ padding: "12px 16px", borderTop: "1px solid #141414", flexShrink: 0 }}>
              <button
                onClick={addClip}
                style={{
                  width: "100%",
                  padding: "10px",
                  background: "none",
                  border: "1px dashed #2a2a2a",
                  borderRadius: "8px",
                  color: "#444",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontFamily: "monospace",
                  letterSpacing: "0.05em",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.borderColor = "#555";
                  (e.target as HTMLElement).style.color = "#888";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.borderColor = "#2a2a2a";
                  (e.target as HTMLElement).style.color = "#444";
                }}
              >
                + Add Clip
              </button>
            </div>
          </div>

          {/* ── Center: Preview ── */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
              padding: "24px",
              overflow: "hidden",
            }}
          >
            <span style={{ color: "#333", fontSize: "10px", letterSpacing: "0.1em" }}>
              PREVIEW — {activeScene.label} · Clip {activeIndex + 1}/{clips.length}
            </span>

            {/* 16:9 preview box */}
            <div
              style={{
                width: "100%",
                maxWidth: "640px",
                aspectRatio: "16/9",
                position: "relative",
                borderRadius: "8px",
                overflow: "hidden",
                border: "1px solid #1a1a1a",
                flexShrink: 0,
              }}
            >
              <VisualStage scene={activeScene} params={activeClip.params} reversed={activeClip.reversed} />
            </div>

            {/* Preview playback controls */}
            <div style={{ display: "flex", gap: "10px" }}>
              {mode === "idle" || mode === "done" ? (
                <button
                  onClick={startPreview}
                  style={btnStyle("#1a1a1a", "#888")}
                >
                  ▶ Preview All
                </button>
              ) : mode === "previewing" ? (
                <button onClick={stopPreview} style={btnStyle("#333", "#ccc")}>
                  ■ Stop
                </button>
              ) : null}
            </div>
          </div>

          {/* ── Right: Export ── */}
          <div
            style={{
              width: "240px",
              flexShrink: 0,
              borderLeft: "1px solid #141414",
              display: "flex",
              flexDirection: "column",
              padding: "20px 16px",
              gap: "16px",
            }}
          >
            <span style={{ color: "#555", fontSize: "10px", letterSpacing: "0.1em" }}>
              EXPORT
            </span>

            {/* Info */}
            <div
              style={{
                background: "#0f0f0f",
                border: "1px solid #1a1a1a",
                borderRadius: "8px",
                padding: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <Row label="Clips" value={String(clips.length)} />
              <Row label="Duration" value={fmt(totalDuration)} />
              <Row label="Format" value="WebM" />
              <Row label="Frame rate" value="60fps" />
            </div>

            {/* Record button */}
            {(mode === "idle" || mode === "done") && (
              <button
                onClick={startRecording}
                style={{
                  ...btnStyle("#ff2222", "#fff"),
                  border: "1px solid #ff2222",
                  padding: "14px",
                  fontSize: "13px",
                  letterSpacing: "0.08em",
                }}
              >
                {mode === "done" ? "Record Again" : "● Start Recording"}
              </button>
            )}

            {mode === "recording" && (
              <button onClick={stopRecording} style={btnStyle("#222", "#ff4444")}>
                ■ Stop Recording
              </button>
            )}

            {/* Progress */}
            {mode === "recording" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div
                  style={{
                    height: "3px",
                    background: "#1a1a1a",
                    borderRadius: "2px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.min(100, (elapsed / totalDuration) * 100)}%`,
                      background: "#ff2222",
                      transition: "width 0.5s linear",
                    }}
                  />
                </div>
                <span style={{ color: "#555", fontSize: "11px" }}>
                  {fmt(elapsed)} / {fmt(totalDuration)}
                </span>
              </div>
            )}

            {/* Download */}
            {mode === "done" && recordedUrl && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <button
                  onClick={download}
                  style={{
                    ...btnStyle("#0f0f0f", "#00ff88"),
                    border: "1px solid #00ff88",
                    padding: "12px",
                  }}
                >
                  ↓ Download WebM
                </button>
                <span style={{ color: "#333", fontSize: "10px", textAlign: "center" }}>
                  {recordedSize} MB · convert to MP4 with<br />HandBrake or ffmpeg
                </span>
              </div>
            )}

            {/* Error */}
            {error && (
              <span style={{ color: "#ff4444", fontSize: "11px" }}>{error}</span>
            )}

            {/* Recording tip */}
            {mode === "idle" && (
              <div
                style={{
                  marginTop: "auto",
                  padding: "12px",
                  background: "#0a0a0a",
                  border: "1px solid #141414",
                  borderRadius: "8px",
                  color: "#333",
                  fontSize: "10px",
                  lineHeight: "1.6",
                }}
              >
                When you click Record, your browser will ask which tab to share. Select this tab, then the
                visuals will play through automatically.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function btnStyle(bg: string, color: string): React.CSSProperties {
  return {
    background: bg,
    border: "1px solid #2a2a2a",
    borderRadius: "8px",
    color,
    cursor: "pointer",
    fontSize: "12px",
    fontFamily: "monospace",
    padding: "10px 16px",
    letterSpacing: "0.05em",
    transition: "all 0.15s",
  };
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span style={{ color: "#333", fontSize: "10px" }}>{label}</span>
      <span style={{ color: "#666", fontSize: "10px" }}>{value}</span>
    </div>
  );
}
