// Custom Next.js server with Socket.io for remote scene switching
// Run with: npx ts-node server.ts  OR  npm run dev:socket

import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Remote sends: { sceneId: "scene-2" }
    socket.on("switch-scene", (data: { sceneId: string }) => {
      console.log("Switching to:", data.sceneId);
      io.emit("scene-changed", data); // broadcast to all displays
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  httpServer.listen(3000, () => {
    console.log("> Ready on http://localhost:3000");
  });
});
