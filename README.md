# VedaAI — AI Assessment Creator

Full-stack implementation of the VedaAI assignment: pixel-perfect Next.js frontend backed by an Express + Mongo + Redis + BullMQ + WebSocket pipeline, with an LLM-powered question-paper generator.

## Repo layout

```
.
├── web/                   # Next.js 16 (App Router) + TS + Tailwind + Zustand
├── api/                   # Express + TS + Mongoose + ioredis + BullMQ + Socket.IO
├── docker-compose.yml     # Mongo 7 (27017) + Redis 7 (6380)
├── figma-exports/         # 2x PNG export of every Figma frame, for visual reference
└── scripts/               # Figma token-extraction helper
```

## End-to-end flow

```
[ Form ]            POST /api/assignments
   │  ─────────────────────────────► [ Express ]
   │                                     │   1. insert doc { status: "queued" }
   │                                     │   2. queue.add("generate", { id })
   │                                     ▼
   │                                  [ Redis ]
   │                                     │
   │                                     ▼
   │                                  [ BullMQ Worker ]
   │                                     │   3. status = "generating"
   │                                     │   4. call OpenRouter LLM (or stub)
   │                                     │   5. parse + persist result
   │                                     │   6. status = "ready"
   │                                     │
   │                                     │   publish "assignment-events"
   │                                     ▼
   │                                  [ Redis pub/sub ]
   │                                     │
   │                                     ▼
   │                                  [ Socket.IO ]  → room "assignment:{id}"
   ▼ ◄─── status events (queued → generating → ready) ───
[ /assignments/{id} ]
```

## Quick start

You need: Node 20+, Docker Desktop.

```bash
# 1. Bring up Mongo + Redis
docker compose up -d

# 2. API + worker (TypeScript hot-reload via tsx watch)
cd api
cp .env.example .env          # optional — add OPENROUTER_API_KEY here
npm install
npm run dev:all               # spawns api + worker side-by-side

# 3. Frontend (separate terminal)
cd ../web
npm install
npm run dev                   # http://localhost:3000 (or 3001 if busy)
```

Open the app — the assignments list shows a green dot + "API connected" in the top-right when the frontend reaches the API; "Demo data only" if the API is offline (it gracefully falls back to local seeded data so the UI still works).

## Configuration

`api/.env` mirrors `api/.env.example`:

| Variable               | Default                                | Notes |
| ---------------------- | -------------------------------------- | ----- |
| `PORT`                 | `4000`                                 | API listen port |
| `CORS_ORIGIN`          | `http://localhost:3000,http://localhost:3001` | Comma list of allowed frontends |
| `MONGO_URL`            | `mongodb://127.0.0.1:27017/vedaai`     | `127.0.0.1` avoids Windows IPv6 hang |
| `REDIS_URL`            | `redis://127.0.0.1:6380`               | docker-compose maps host **6380** → container 6379 |
| `OPENROUTER_API_KEY`   | _(empty)_                              | Get one at https://openrouter.ai/keys |
| `OPENROUTER_MODEL`     | `anthropic/claude-haiku-4.5`           | Any OpenRouter model id |
| `LLM_MODE`             | `auto`                                 | `auto` falls back to stub when no key, `real` forces LLM, `stub` forces stub |

Frontend env (`web/.env.local` optional):

| Variable               | Default                      |
| ---------------------- | ---------------------------- |
| `NEXT_PUBLIC_API_BASE` | `http://localhost:4000`      |

## Routes & screens

| URL                          | Figma frame                  | What it does |
| ---------------------------- | ---------------------------- | ------------ |
| `/assignments`               | `Filled State` / mobile m4   | Lists Mongo assignments (falls back to demo) |
| `/assignments` (empty)       | `0 State screen` / mobile m1 | Illustrated empty state |
| `/assignments/new`           | `Upload Material` / m2       | Validated create form |
| `/assignments/:id`           | `Assignment Output` / m3     | Subscribes to socket; renders the paper when status = ready |

Click **Clear demo data** / **Seed demo data** in the assignments page top-right to flip between the filled and empty states.

## API reference

```
GET    /health
GET    /api/assignments              → Assignment[]
GET    /api/assignments/:id          → Assignment | 404
POST   /api/assignments              → 201 Assignment (queued)
DELETE /api/assignments/:id          → { ok: true }
```

`POST` body (validated by Zod):

```json
{
  "title": "Quiz on Electricity",
  "dueDate": "21-06-2025",
  "additionalInfo": "CBSE Grade 8 Science, NCERT chapters on electricity",
  "questionTypes": [
    { "type": "Multiple Choice Questions", "count": 4, "marks": 1 },
    { "type": "Short Questions",           "count": 3, "marks": 2 }
  ],
  "file": null
}
```

## Socket.IO events

Connect to the API origin (`http://localhost:4000`) and emit `subscribe` with an assignment id. The server emits `status` events into your room:

```ts
socket.emit("subscribe", assignmentId);
socket.on("status", ({ id, status, progress, error, full }) => { ... });
// status: "queued" | "generating" | "ready" | "failed"
```

Internally the worker publishes to a Redis `assignment-events` channel; the API process re-emits those into per-assignment Socket.IO rooms. This keeps the worker stateless and lets multiple API replicas fan out independently.

## LLM integration (OpenRouter)

`api/src/llm/openrouter.ts` uses the `openai` SDK pointed at `https://openrouter.ai/api/v1`. OpenRouter is OpenAI-compatible, so swapping providers is just one env var (`OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct` etc).

The system prompt forces the model to return JSON matching a strict schema: `{ schoolName, subject, className, timeAllowedMinutes, maximumMarks, sections[], answerKey[] }` with difficulty tags constrained to `Easy | Moderate | Challenging`. Response is parsed, normalized, and stored in Mongo — the frontend never sees raw model output.

`api/src/llm/stub.ts` is a deterministic generator with the same shape used when no API key is present, so the full pipeline can be demoed without a paid LLM call.

## Frontend design fidelity

Design tokens were extracted from the Figma REST API by walking every node and counting fills/strokes/font sizes (see `scripts/extract-tokens.ps1`). Top hits:

| Token        | Value                       |
| ------------ | --------------------------- |
| Background   | `#F6F6F6`                   |
| Foreground   | `#181818`                   |
| Muted        | `#5E5E5E` / `#A9A9A9`       |
| Border       | `#DADADA` / `#E1DCEB`       |
| Accent       | `#FF5623`                   |
| Dark pill    | `#181818`–`#2B2B2B` + radial orange glow |
| Font         | Bricolage Grotesque 400/500/600/700/800 |

The dark "Create Assignment" pill and the question-paper banner share a `.btn-dark-glow` / `.banner-dark` utility defined in `web/src/app/globals.css` so the orange highlight matches the Figma render.

## State management (Zustand)

`web/src/store/useAssignmentStore.ts` holds the create-form draft + the assignments list and exposes:

- `setDraft`, `updateRow`, `addRow`, `removeRow` — local mutations
- `loadFromApi()` — hydrates list from Mongo on first mount
- `submitDraft()` — POSTs to API and returns the new id (falls back to a local copy if the API is unreachable)
- `upsertAssignment(a)` — used by the output page when socket events deliver an updated record

## Validation

The create form validates client-side (red border on bad inputs) **and** server-side (Zod schema) — due date must match `DD-MM-YYYY`, every row needs `count >= 1` and `marks >= 1`, at least one row required, additional info ≤ 2000 chars.

## Bonus: PDF export

The output page's **Download as PDF** button calls `window.print()`. The paper article has print-specific Tailwind classes (`print:shadow-none print:border-0 print:max-w-none`) so the sidebar / banner are hidden in the printed view. Swap to `@react-pdf/renderer` if you want a non-print PDF — the data shape is already there.

## What I'd build next

- Real LLM with prompt-caching across question types (saves tokens on repeat generations).
- File-upload pipeline: read the user's PDF/PNG, OCR or text-extract, feed into the prompt as context.
- Authentication and per-teacher assignment scoping.
- Deploy: Vercel for `web`, Render/Fly for `api` + worker, Mongo Atlas + Upstash Redis.

## Reproducing the Figma extraction

```powershell
$headers = @{ "X-Figma-Token" = "<token>" }
$ids = "2:9436,2:9742,2:10576,2:10640,19:309,19:644,19:835,19:452"
Invoke-RestMethod "https://api.figma.com/v1/files/nB2HMm1BhTpmHcHrmEslGB?ids=$ids" -Headers $headers `
  | ConvertTo-Json -Depth 30 -Compress | Out-File figma-nodes.json
& .\scripts\extract-tokens.ps1   # prints colors, fonts, and unique strings
```
