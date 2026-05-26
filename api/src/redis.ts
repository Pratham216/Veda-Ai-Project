import IORedis, { Redis } from "ioredis";
import { config } from "./config.js";

let _redis: Redis | null = null;

export function getRedis(): Redis {
  if (_redis) return _redis;
  _redis = new IORedis(config.redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
  });
  _redis.on("error", (e) => console.error("[redis] error", e.message));
  _redis.on("connect", () => console.log("[redis] connected", config.redisUrl));
  return _redis;
}
