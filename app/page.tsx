"use client";

import { useEffect, useState, useCallback } from "react";
import VisualStage from "@/components/visuals/VisualStage";
import ControlPanel from "@/components/remote/ControlPanel";
import { useScenes } from "@/components/remote/useScenes";

type Mode = "edit" | "fullscreen";

export default function DisplayPage() {
  const { scene, switchScene } = useScenes();
  const [mode, setMode] = useState<Mode>("edit");

  const enterFullscreen = useCallback(() => {
    document.documentElement.requestFullscreen().catch(() => {});
    setMode("fullscreen");
  }, []);

  const exitFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    setMode("edit");
  }, []);

  // F key toggles fullscreen, Escape exits
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "f" || e.key === "F") {
        mode === "fullscreen" ? exitFullscreen() : enterFullscreen();
      }
    };
    // Sync mode when user presses native Escape to exit fullscreen
    const onFsChange = () => {
      if (!document.fullscreenElement) setMode("edit");
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("fullscreenchange", onFsChange);
    };
  }, [mode, enterFullscreen, exitFullscreen]);

  return (
    <>
      <VisualStage scene={scene} />
      {mode === "edit" && (
        <ControlPanel
          activeScene={scene}
          onSwitch={switchScene}
          onFullscreen={enterFullscreen}
        />
      )}
    </>
  );
}
