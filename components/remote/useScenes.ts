"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { SCENES, Scene } from "@/components/visuals/scenes";

let socket: Socket;

export function useScenes() {
  const [scene, setScene] = useState<Scene>(SCENES[0]);

  useEffect(() => {
    socket = io();
    socket.on("scene-changed", ({ sceneId }: { sceneId: string }) => {
      const next = SCENES.find((s) => s.id === sceneId);
      if (next) setScene(next);
    });
    return () => { socket.disconnect(); };
  }, []);

  const switchScene = (sceneId: string) => {
    const next = SCENES.find((s) => s.id === sceneId);
    if (next) setScene(next);
    socket?.emit("switch-scene", { sceneId });
  };

  return { scene, switchScene };
}
