import type { Server as HTTPServer } from "node:http";
import { Server } from "socket.io";
import { config } from "../config.js";

let _io: Server | null = null;

export function attachIO(server: HTTPServer): Server {
  _io = new Server(server, {
    cors: { origin: config.corsOrigin, credentials: true },
    transports: ["websocket", "polling"],
  });
  _io.on("connection", (socket) => {
    socket.on("subscribe", (assignmentId: string) => {
      if (typeof assignmentId === "string" && assignmentId.length > 0) {
        socket.join(`assignment:${assignmentId}`);
      }
    });
    socket.on("unsubscribe", (assignmentId: string) => {
      if (typeof assignmentId === "string") {
        socket.leave(`assignment:${assignmentId}`);
      }
    });
  });
  return _io;
}

export function getIO(): Server {
  if (!_io) throw new Error("Socket.IO not initialized — call attachIO first");
  return _io;
}

export function emitAssignment(assignmentId: string, event: string, payload: unknown) {
  if (!_io) return;
  _io.to(`assignment:${assignmentId}`).emit(event, payload);
}
