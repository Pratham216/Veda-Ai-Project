import OpenAI from "openai";
import { config } from "../config.js";

let _client: OpenAI | null = null;

export function getClient(): OpenAI {
  if (_client) return _client;
  _client = new OpenAI({
    apiKey: config.llm.apiKey,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": config.llm.referrer,
      "X-Title": config.llm.title,
    },
  });
  return _client;
}

export type LLMInput = {
  title: string;
  schoolName: string;
  teacherName: string;
  dueDate: string;
  additionalInfo: string;
  questionTypes: Array<{ type: string; count: number; marks: number }>;
};

export type LLMResult = {
  schoolName: string;
  subject: string;
  className: string;
  timeAllowedMinutes: number;
  maximumMarks: number;
  sections: Array<{
    title: string;
    instruction: string;
    questions: Array<{ text: string; difficulty: "Easy" | "Moderate" | "Challenging"; marks: number }>;
  }>;
  answerKey: string[];
};

const SYSTEM_PROMPT = `You are a senior school teacher writing exam question papers.
Generate exam content as STRICT JSON matching the schema given by the user.

Rules:
- Group questions into sections by question type. Each section gets a Title like "Section A", "Section B" in order.
- Each section's instruction MUST include the per-question marks ("Each question carries N marks.").
- Distribute difficulty across questions: roughly 30% Easy, 40% Moderate, 30% Challenging.
- "marks" on each question matches its section's per-question marks.
- "maximumMarks" = sum of (count * marks) across all question-type rows.
- "answerKey" is an array of concise model answers, one per question, in order across sections.
- Do NOT use markdown, code fences, or commentary. Return raw JSON only.`;

function buildUserPrompt(input: LLMInput): string {
  const rows = input.questionTypes
    .map((r, i) => `  ${i + 1}. ${r.type} — count: ${r.count}, marks each: ${r.marks}`)
    .join("\n");
  const maxMarks = input.questionTypes.reduce((s, r) => s + r.count * r.marks, 0);
  const totalQuestions = input.questionTypes.reduce((s, r) => s + r.count, 0);

  const school = input.schoolName?.trim() || "Delhi Public School";
  const teacher = input.teacherName?.trim() || "the teacher";

  const extra =
    input.additionalInfo && input.additionalInfo.trim().length > 0
      ? `\n\nTeacher's notes:\n${input.additionalInfo.trim()}`
      : "";

  return `Generate a question paper for "${input.title}".

School: ${school}
Teacher: ${teacher}
Due date: ${input.dueDate}
Total questions: ${totalQuestions}
Maximum marks: ${maxMarks}

Question types:
${rows}
${extra}

Return ONLY a JSON object with this exact shape. Use "${school}" verbatim as schoolName — do NOT invent a different school name:
{
  "schoolName": "${school}",
  "subject": string,
  "className": string,
  "timeAllowedMinutes": number,
  "maximumMarks": number,
  "sections": [
    {
      "title": string,
      "instruction": string,
      "questions": [
        { "text": string, "difficulty": "Easy" | "Moderate" | "Challenging", "marks": number }
      ]
    }
  ],
  "answerKey": string[]
}`;
}

export async function generatePaper(input: LLMInput): Promise<LLMResult> {
  const client = getClient();
  // Free models on OpenRouter usually allow ~4-8k output tokens. 4000 gives a
  // typical paper room to finish without truncation. Override via OPENROUTER_MAX_TOKENS.
  const maxTokens = Number(process.env.OPENROUTER_MAX_TOKENS ?? 4000);
  const completion = await client.chat.completions.create({
    model: config.llm.model,
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(input) },
    ],
  });
  const content = completion.choices[0]?.message?.content ?? "";
  const parsed = parseLooseJSON(content);
  return normalize(parsed as Partial<LLMResult>, input);
}

/**
 * Parse JSON from an LLM response that may be (a) wrapped in markdown code fences,
 * (b) prefixed/suffixed with prose, or (c) truncated mid-output by max_tokens.
 * Falls back to repairing truncation by closing dangling strings/arrays/objects.
 */
function parseLooseJSON(raw: string): unknown {
  const trimmed = raw.trim();

  // 1) Try as-is.
  try {
    return JSON.parse(trimmed);
  } catch {
    /* keep trying */
  }

  // 2) Strip markdown code fences.
  const stripped = trimmed.replace(/^```(?:json)?\s*/i, "").replace(/```$/i, "").trim();
  if (stripped !== trimmed) {
    try {
      return JSON.parse(stripped);
    } catch {
      /* keep trying */
    }
  }

  // 3) Slice out the first {...} block.
  const start = stripped.indexOf("{");
  const end = stripped.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    const slice = stripped.slice(start, end + 1);
    try {
      return JSON.parse(slice);
    } catch {
      /* keep trying */
    }
  }

  // 4) Repair truncation: close dangling string, then close brackets in stack order.
  const base = start !== -1 ? stripped.slice(start) : stripped;
  const repaired = closeTruncatedJSON(base);
  if (repaired) {
    try {
      return JSON.parse(repaired);
    } catch (e) {
      throw new Error(
        `LLM produced unparseable JSON even after repair: ${(e as Error).message}. Raw start: ${raw.slice(0, 160)}…`,
      );
    }
  }

  throw new Error(`LLM did not return JSON. Raw start: ${raw.slice(0, 160)}…`);
}

function closeTruncatedJSON(input: string): string | null {
  let inString = false;
  let escaped = false;
  const stack: string[] = [];

  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (c === "\\") {
      escaped = true;
      continue;
    }
    if (c === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (c === "{" || c === "[") stack.push(c);
    else if (c === "}" || c === "]") stack.pop();
  }

  // Trim trailing partial token (comma, colon, half-typed key/value).
  let trimmed = input.replace(/[,:]\s*$/, "");
  // Drop a dangling key like  "foo":  with no value.
  trimmed = trimmed.replace(/"\s*[^"]*\s*$/u, (m) => (inString ? "" : m));

  let result = trimmed;
  if (inString) result += '"';
  while (stack.length > 0) {
    const open = stack.pop();
    result += open === "{" ? "}" : "]";
  }
  return result;
}

function normalize(raw: Partial<LLMResult>, input: LLMInput): LLMResult {
  const totalCount = input.questionTypes.reduce((s, r) => s + r.count, 0);
  const maxMarks = input.questionTypes.reduce((s, r) => s + r.count * r.marks, 0);
  const sections =
    Array.isArray(raw.sections) && raw.sections.length > 0
      ? raw.sections.map((s) => ({
          title: String(s.title ?? "Section A"),
          instruction: String(s.instruction ?? ""),
          questions: (s.questions ?? []).map((q) => ({
            text: String(q.text ?? ""),
            difficulty: (["Easy", "Moderate", "Challenging"] as const).includes(
              q.difficulty as never,
            )
              ? (q.difficulty as "Easy" | "Moderate" | "Challenging")
              : "Moderate",
            marks: Number(q.marks ?? 1),
          })),
        }))
      : [];
  return {
    schoolName: String(raw.schoolName ?? "Delhi Public School, Sector-4, Bokaro"),
    subject: String(raw.subject ?? "General"),
    className: String(raw.className ?? "5th"),
    timeAllowedMinutes: Number(raw.timeAllowedMinutes ?? 45),
    maximumMarks: Number(raw.maximumMarks ?? maxMarks),
    sections: sections.length > 0 ? sections : [
      {
        title: "Section A",
        instruction: `Attempt all questions. Each question carries ${input.questionTypes[0]?.marks ?? 1} marks.`,
        questions: [],
      },
    ],
    answerKey: Array.isArray(raw.answerKey) ? raw.answerKey.map(String) : new Array(totalCount).fill(""),
  };
}
