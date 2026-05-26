import { createServer } from "node:http";
import { Worker } from "bullmq";
import { config, useStubLLM } from "../config.js";
import { connectMongo } from "../db.js";
import { getRedis } from "../redis.js";
import { AssignmentModel, toJSON } from "../models/Assignment.js";
import { QUEUE_NAME, type GenerateJob } from "../queue.js";
import { generatePaper } from "../llm/openrouter.js";
import { generatePaperStub } from "../llm/stub.js";
import { Server as IOServer } from "socket.io";

// Worker emits progress via a dedicated Redis pub channel that the API forwards to clients.
// We keep this process small — DB writes here, socket fanout in the API server.

async function main() {
  await connectMongo();
  const redis = getRedis();

  const worker = new Worker<GenerateJob>(
    QUEUE_NAME,
    async (job) => {
      const { assignmentId } = job.data;
      const doc = await AssignmentModel.findById(assignmentId);
      if (!doc) throw new Error(`Assignment ${assignmentId} not found`);

      const announce = async (status: string, progress: number) => {
        await AssignmentModel.updateOne({ _id: assignmentId }, { status, progress });
        await redis.publish(
          "assignment-events",
          JSON.stringify({ id: assignmentId, status, progress }),
        );
      };

      try {
        await announce("generating", 10);
        const stub = useStubLLM();
        console.log(`[worker] job=${job.id} assignment=${assignmentId} mode=${stub ? "stub" : "real"}`);

        const input = {
          title: doc.title ?? "Untitled Assignment",
          schoolName: doc.schoolName ?? "",
          teacherName: doc.teacherName ?? "",
          dueDate: doc.dueDate,
          additionalInfo: doc.additionalInfo,
          questionTypes: doc.questionTypes.map((r) => ({
            type: r.type,
            count: r.count,
            marks: r.marks,
          })),
        };

        const result = stub ? await generatePaperStub(input) : await generatePaper(input);

        // Always force the user-provided school name to win over whatever the LLM produced.
        if (doc.schoolName && doc.schoolName.trim().length > 0) {
          result.schoolName = doc.schoolName;
        }

        await announce("generating", 75);
        await AssignmentModel.updateOne({ _id: assignmentId }, { result });
        await announce("ready", 100);
        const updated = await AssignmentModel.findById(assignmentId);
        if (updated) {
          await redis.publish(
            "assignment-events",
            JSON.stringify({ id: assignmentId, status: "ready", progress: 100, full: toJSON(updated as never) }),
          );
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`[worker] failed assignment=${assignmentId}:`, message);
        await AssignmentModel.updateOne(
          { _id: assignmentId },
          { status: "failed", error: message },
        );
        await redis.publish(
          "assignment-events",
          JSON.stringify({ id: assignmentId, status: "failed", error: message }),
        );
        throw err;
      }
    },
    { connection: redis, concurrency: 3 },
  );

  worker.on("ready", () => console.log("[worker] ready"));
  worker.on("error", (e) => console.error("[worker] error", e.message));

  // Minimal health endpoint so docker/healthchecks have something to hit.
  const server = createServer((_, res) => {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true, queue: QUEUE_NAME }));
  });
  const port = Number(process.env.WORKER_PORT ?? 4100);
  server.listen(port, () => console.log(`[worker] health on :${port}`));
}

main().catch((e) => {
  console.error("[worker] fatal", e);
  process.exit(1);
});
