import { Queue, QueueEvents } from "bullmq";
import { getRedis } from "./redis.js";

export const QUEUE_NAME = "generate-paper";

export type GenerateJob = {
  assignmentId: string;
};

let _queue: Queue<GenerateJob> | null = null;
let _events: QueueEvents | null = null;

export function getQueue(): Queue<GenerateJob> {
  if (_queue) return _queue;
  _queue = new Queue<GenerateJob>(QUEUE_NAME, { connection: getRedis() });
  return _queue;
}

export function getQueueEvents(): QueueEvents {
  if (_events) return _events;
  _events = new QueueEvents(QUEUE_NAME, { connection: getRedis() });
  return _events;
}
