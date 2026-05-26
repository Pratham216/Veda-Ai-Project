import "dotenv/config";

const need = (k: string, fallback?: string) => {
  const v = process.env[k] ?? fallback;
  if (v === undefined || v === "") throw new Error(`Missing env var ${k}`);
  return v;
};

export const config = {
  port: Number(process.env.PORT ?? 4000),
  corsOrigin: (process.env.CORS_ORIGIN ?? "http://localhost:3000,http://localhost:3001")
    .split(",")
    .map((s) => s.trim()),
  mongoUrl: need("MONGO_URL", "mongodb://localhost:27017/vedaai"),
  redisUrl: need("REDIS_URL", "redis://localhost:6379"),
  llm: {
    apiKey: process.env.OPENROUTER_API_KEY ?? "",
    model: process.env.OPENROUTER_MODEL ?? "anthropic/claude-haiku-4.5",
    referrer: process.env.OPENROUTER_REFERRER ?? "http://localhost:3000",
    title: process.env.OPENROUTER_TITLE ?? "VedaAI",
    mode: (process.env.LLM_MODE ?? "auto") as "auto" | "stub" | "real",
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET ?? "dev-only-jwt-secret-CHANGE-ME-in-production",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "30d",
  },
};

export const useStubLLM = () => {
  if (config.llm.mode === "stub") return true;
  if (config.llm.mode === "real") return false;
  return !config.llm.apiKey;
};
