"use client";

import { create } from "zustand";
import { api } from "@/lib/api";

export type QuestionTypeRow = {
  id: string;
  type: string;
  count: number;
  marks: number;
};

export type Difficulty = "Easy" | "Moderate" | "Challenging";

export type GeneratedQuestion = {
  text: string;
  difficulty: Difficulty;
  marks: number;
};

export type GeneratedSection = {
  title: string;
  instruction: string;
  questions: GeneratedQuestion[];
};

export type AssignmentDraft = {
  title: string;
  schoolName: string;
  teacherName: string;
  file: { name: string; size: number } | null;
  dueDate: string; // DD-MM-YYYY
  questionTypes: QuestionTypeRow[];
  additionalInfo: string;
};

export type Assignment = {
  id: string;
  title: string;
  schoolName?: string;
  teacherName?: string;
  assignedOn: string;
  dueDate: string;
  draft: AssignmentDraft;
  status: "queued" | "generating" | "ready" | "failed";
  result?: {
    schoolName: string;
    subject: string;
    className: string;
    timeAllowedMinutes: number;
    maximumMarks: number;
    sections: GeneratedSection[];
    answerKey: string[];
  };
};

const blankRow = (type: string, count = 4, marks = 1): QuestionTypeRow => ({
  id: crypto.randomUUID(),
  type,
  count,
  marks,
});

export const emptyDraft = (): AssignmentDraft => ({
  title: "",
  schoolName: "",
  teacherName: "",
  file: null,
  dueDate: "",
  questionTypes: [
    blankRow("Multiple Choice Questions", 4, 1),
    blankRow("Short Questions", 3, 2),
    blankRow("Diagram/Graph-Based Questions", 5, 5),
    blankRow("Numerical Problems", 5, 5),
  ],
  additionalInfo: "",
});

const localSampleResult = (d: AssignmentDraft) => {
  const totalMarks = d.questionTypes.reduce((s, r) => s + r.count * r.marks, 0) || 20;
  return {
    schoolName: "Delhi Public School, Sector-4, Bokaro",
    subject: "English",
    className: "5th",
    timeAllowedMinutes: 45,
    maximumMarks: totalMarks,
    sections: [
      {
        title: "Section A",
        instruction:
          "Short Answer Questions\nAttempt all questions. Each question carries 2 marks.",
        questions: ([
          { text: "Define electroplating. Explain its purpose.", difficulty: "Easy", marks: 2 },
          {
            text: "What is the role of a conductor in the process of electrolysis?",
            difficulty: "Moderate",
            marks: 2,
          },
          {
            text: "Why does a solution of copper sulfate conduct electricity?",
            difficulty: "Easy",
            marks: 2,
          },
          {
            text: "Describe one example of the chemical effect of electric current in daily life.",
            difficulty: "Moderate",
            marks: 2,
          },
          {
            text: "Explain why electric currents have chemical effects.",
            difficulty: "Moderate",
            marks: 2,
          },
          {
            text: "How is sodium hydroxide prepared during the electrolysis of brine? Write the chemical reaction involved.",
            difficulty: "Challenging",
            marks: 2,
          },
          {
            text: "What happens at the cathode and anode during the electrolysis of water? Name the gases evolved.",
            difficulty: "Challenging",
            marks: 2,
          },
          {
            text: "Mention the type of current used in electroplating and justify why it is used.",
            difficulty: "Easy",
            marks: 2,
          },
          {
            text: "What is the importance of electric current in the field of metallurgy?",
            difficulty: "Moderate",
            marks: 2,
          },
          {
            text: "Explain with a chemical equation how copper is deposited during the electroplating of an object.",
            difficulty: "Challenging",
            marks: 2,
          },
        ]) as GeneratedQuestion[],
      },
    ],
    answerKey: [
      "Electroplating is the process of depositing a thin layer of metal on the surface of another metal using electric current.",
      "A conductor allows the flow of electric current, enabling chemical changes at electrodes.",
      "Copper sulfate solution contains free ions which carry electric charge.",
      "Silver-plating jewelry is one example of the chemical effect of current.",
      "Electric current causes movement of ions and chemical changes at electrodes.",
      "Sodium hydroxide is formed at the cathode during brine electrolysis.",
      "Cathode: hydrogen gas evolves. Anode: oxygen gas evolves.",
    ],
  };
};

const sampleAssignments = (): Assignment[] =>
  Array.from({ length: 10 }, (_, i) => {
    const draft = emptyDraft();
    return {
      id: `local-${i + 1}`,
      title: "Quiz on Electricity",
      assignedOn: "20-06-2025",
      dueDate: "21-06-2025",
      draft,
      status: "ready" as const,
      result: localSampleResult(draft),
    };
  });

type State = {
  draft: AssignmentDraft;
  assignments: Assignment[];
  hydrated: boolean;
  apiAvailable: boolean;
  setDraft: (patch: Partial<AssignmentDraft>) => void;
  resetDraft: () => void;
  addRow: () => void;
  updateRow: (id: string, patch: Partial<QuestionTypeRow>) => void;
  removeRow: (id: string) => void;
  loadFromApi: () => Promise<void>;
  seedDemo: () => void;
  clearAll: () => void;
  upsertAssignment: (a: Assignment) => void;
  submitDraft: () => Promise<string>; // returns new assignment id
  removeAssignment: (id: string) => Promise<void>;
};

export const useAssignmentStore = create<State>((set, get) => ({
  draft: emptyDraft(),
  assignments: [],
  hydrated: false,
  apiAvailable: false,
  setDraft: (patch) => set((s) => ({ draft: { ...s.draft, ...patch } })),
  resetDraft: () => set({ draft: emptyDraft() }),
  addRow: () =>
    set((s) => ({
      draft: {
        ...s.draft,
        questionTypes: [...s.draft.questionTypes, blankRow("Multiple Choice Questions", 1, 1)],
      },
    })),
  updateRow: (id, patch) =>
    set((s) => ({
      draft: {
        ...s.draft,
        questionTypes: s.draft.questionTypes.map((r) => (r.id === id ? { ...r, ...patch } : r)),
      },
    })),
  removeRow: (id) =>
    set((s) => ({
      draft: { ...s.draft, questionTypes: s.draft.questionTypes.filter((r) => r.id !== id) },
    })),
  loadFromApi: async () => {
    try {
      const list = await api.list();
      set({ assignments: list, hydrated: true, apiAvailable: true });
    } catch {
      set({ assignments: [], hydrated: true, apiAvailable: false });
    }
  },
  seedDemo: () => set({ assignments: sampleAssignments(), hydrated: true }),
  clearAll: () => set({ assignments: [], hydrated: true }),
  upsertAssignment: (a) =>
    set((s) => {
      const idx = s.assignments.findIndex((x) => x.id === a.id);
      if (idx === -1) return { assignments: [a, ...s.assignments] };
      const next = s.assignments.slice();
      next[idx] = { ...next[idx], ...a };
      return { assignments: next };
    }),
  submitDraft: async () => {
    const d = get().draft;
    try {
      const created = await api.create(d);
      set((s) => ({ assignments: [created, ...s.assignments], draft: emptyDraft(), apiAvailable: true }));
      return created.id;
    } catch (err) {
      console.warn("API unavailable, using local fallback", err);
      const id = `local-${Date.now()}`;
      const todayDmy = new Date().toLocaleDateString("en-GB").replaceAll("/", "-");
      const assignment: Assignment = {
        id,
        title: d.title || "Quiz on Electricity",
        assignedOn: todayDmy,
        dueDate: d.dueDate || "21-06-2025",
        draft: d,
        status: "ready",
        result: localSampleResult(d),
      };
      set((s) => ({ assignments: [assignment, ...s.assignments], draft: emptyDraft(), apiAvailable: false }));
      return id;
    }
  },
  removeAssignment: async (id) => {
    set((s) => ({ assignments: s.assignments.filter((x) => x.id !== id) }));
    if (!id.startsWith("local-")) {
      try {
        await api.remove(id);
      } catch (err) {
        console.warn("delete failed", err);
      }
    }
  },
}));
