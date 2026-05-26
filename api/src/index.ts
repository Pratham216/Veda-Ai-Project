import { createServer } from "node:http";
import express from "express";
import cors from "cors";
import IORedis from "ioredis";
import { config } from "./config.js";
import { connectMongo } from "./db.js";
import { getRedis } from "./redis.js";
import assignmentsRouter from "./routes/assignments.js";
import authRouter from "./routes/auth.js";
import { attachIO, emitAssignment } from "./ws/io.js";

async function main() {
  await connectMongo();
  getRedis();

  const app = express();
  app.use(express.json({ limit: "1mb" }));
  // Accept exact matches from CORS_ORIGIN plus *.vercel.app for preview deployments.
  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin) return cb(null, true);
        if (config.corsOrigin.includes(origin)) return cb(null, true);
        if (/\.vercel\.app$/.test(new URL(origin).hostname)) return cb(null, true);
        return cb(new Error(`CORS: ${origin} not allowed`));
      },
      credentials: true,
    }),
  );

  app.get("/health", (_req, res) => res.json({ ok: true, ts: Date.now() }));
  app.use("/api/auth", authRouter);
  app.use("/api/assignments", assignmentsRouter);

  // Catch unhandled async rejections from routes so they 500 instead of crashing.
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("[api] route error", err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message ?? "Internal error" });
    }
  });

  process.on("unhandledRejection", (reason) => {
    console.error("[api] unhandledRejection", reason);
  });
  process.on("uncaughtException", (err) => {
    console.error("[api] uncaughtException", err);
  });

  const server = createServer(app);
  attachIO(server);

  // Subscribe to worker pub channel and forward into socket rooms.
  const sub = new IORedis(config.redisUrl, { maxRetriesPerRequest: null });
  await sub.subscribe("assignment-events");
  sub.on("message", (_chan, msg) => {
    try {
      const data = JSON.parse(msg);
      if (data && typeof data.id === "string") {
        emitAssignment(data.id, "status", data);
      }
    } catch (e) {
      console.error("[pubsub] parse error", e);
    }
  });

  server.listen(config.port, () => {
    console.log(`[api] listening on :${config.port}`);
  });
}

main().catch((e) => {
  console.error("[api] fatal", e);
  process.exit(1);
});
