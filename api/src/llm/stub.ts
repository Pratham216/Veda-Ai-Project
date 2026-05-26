import type { LLMInput, LLMResult } from "./openrouter.js";

const SAMPLE_QUESTIONS: Record<string, string[]> = {
  default: [
    "Explain the central concept covered in this chapter in your own words.",
    "List the main characteristics with brief examples.",
    "Compare the two ideas introduced in the lesson.",
    "Describe one real-life application of this topic.",
    "What are the consequences of ignoring this principle?",
    "Outline the steps involved in the process described.",
    "Distinguish between the two related but distinct ideas.",
    "Provide a labelled diagram (description) supporting your answer.",
    "Summarise the lesson in five sentences.",
    "Critically evaluate the importance of the concept today.",
  ],
};

const DIFFICULTIES = ["Easy", "Moderate", "Challenging"] as const;
const sectionTitle = (i: number) => `Section ${String.fromCharCode(65 + i)}`;

function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length];
}

export async function generatePaperStub(input: LLMInput): Promise<LLMResult> {
  await new Promise((r) => setTimeout(r, 800)); // simulate latency
  const maxMarks = input.questionTypes.reduce((s, r) => s + r.count * r.marks, 0);

  const sections = input.questionTypes.map((row, sIdx) => {
    const pool = SAMPLE_QUESTIONS.default;
    const questions = Array.from({ length: row.count }, (_, i) => ({
      text: pick(pool, sIdx * 3 + i),
      difficulty: pick(DIFFICULTIES, sIdx + i),
      marks: row.marks,
    }));
    return {
      title: sectionTitle(sIdx),
      instruction: `${row.type}\nAttempt all questions. Each question carries ${row.marks} marks.`,
      questions,
    };
  });

  const answerKey = sections.flatMap((s) =>
    s.questions.map((q) => `Sample answer for: ${q.text.slice(0, 80)}...`),
  );

  return {
    schoolName: input.schoolName?.trim() || "Delhi Public School, Sector-4, Bokaro",
    subject: "Science",
    className: "8th",
    timeAllowedMinutes: 45,
    maximumMarks: maxMarks,
    sections,
    answerKey,
  };
}
