"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import VisualStage from "@/components/visuals/VisualStage";
import { SCENES, Scene } from "@/components/visuals/scenes";

let socket: Socket;

export default function DisplayPage() {
  const [scene, setScene] = useState<Scene>(SCENES[0]);

  useEffect(() => {
    socket = io();
    socket.on("scene-changed", ({ sceneId }: { sceneId: string }) => {
      const next = SCENES.find((s) => s.id === sceneId);
      if (next) setScene(next);
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  return <VisualStage scene={scene} />;
}
