"use client";

import { useEffect, useState, useCallback } from "react";
import VisualStage from "@/components/visuals/VisualStage";
import ControlPanel from "@/components/remote/ControlPanel";
import { useScenes } from "@/components/remote/useScenes";
import {
  BackgroundParams, DEFAULT_PARAMS, BackgroundId,
} from "@/components/visuals/scenes";

type Mode = "edit" | "fullscreen";

export default function DisplayPage() {
  const { scene, switchScene } = useScenes();
  const [mode, setMode] = useState<Mode>("edit");

  // Per-scene params — keyed by background id
  const [paramsMap, setParamsMap] = useState<Record<BackgroundId, BackgroundParams>>({
    ...DEFAULT_PARAMS,
  });

  const activeParams = paramsMap[scene.background];

  const handleParamChange = useCallback((key: string, value: number | string | [number, number, number]) => {
    setParamsMap((prev) => {
      const current = prev[scene.background];
      // Aurora colorStops come as comma-joined string from ControlPanel — split back to array
      if (key === "colorStops" && typeof value === "string") {
        return { ...prev, [scene.background]: { ...current, colorStops: value.split(",") } };
      }
      return { ...prev, [scene.background]: { ...current, [key]: value } };
    });
  }, [scene.background]);

  const enterFullscreen = useCallback(() => {
    document.documentElement.requestFullscreen().catch(() => {});
    setMode("fullscreen");
  }, []);

  const exitFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    setMode("edit");
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "f" || e.key === "F") {
        mode === "fullscreen" ? exitFullscreen() : enterFullscreen();
      }
    };
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
      <VisualStage scene={scene} params={activeParams} />
      {mode === "edit" && (
        <ControlPanel
          activeScene={scene}
          params={activeParams}
          onSwitch={switchScene}
          onParamChange={handleParamChange}
          onFullscreen={enterFullscreen}
        />
      )}
    </>
  );
}
