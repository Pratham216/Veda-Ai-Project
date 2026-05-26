import type { Assignment, AssignmentDraft } from "@/store/useAssignmentStore";
import { getAuthHeader, useAuthStore, type AuthUser } from "@/store/useAuthStore";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000";

type ApiAssignment = {
  id: string;
  title?: string;
  schoolName?: string;
  teacherName?: string;
  dueDate: string;
  additionalInfo?: string;
  questionTypes: Array<{ type: string; count: number; marks: number }>;
  file?: { name: string; size: number } | null;
  assignedOn: string;
  status: Assignment["status"];
  progress?: number;
  error?: string;
  result?: Assignment["result"];
};

function adapt(a: ApiAssignment): Assignment {
  return {
    id: a.id,
    title: a.title ?? "Untitled Assignment",
    schoolName: a.schoolName,
    teacherName: a.teacherName,
    assignedOn: a.assignedOn,
    dueDate: a.dueDate,
    status: a.status,
    result: a.result,
    draft: {
      title: a.title ?? "",
      schoolName: a.schoolName ?? "",
      teacherName: a.teacherName ?? "",
      file: a.file ?? null,
      dueDate: a.dueDate,
      questionTypes: a.questionTypes.map((r, i) => ({ id: `r-${i}`, ...r })),
      additionalInfo: a.additionalInfo ?? "",
    },
  };
}

async function jsonFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    ...getAuthHeader(),
    ...(init.headers as Record<string, string> | undefined),
  };
  const r = await fetch(`${API_BASE}${path}`, { ...init, headers, cache: "no-store" });
  if (r.status === 401) {
    useAuthStore.getState().clearSession();
    throw new Error("Unauthorized");
  }
  if (!r.ok) {
    let detail = "";
    try {
      detail = (await r.json())?.error ?? "";
    } catch {
      /* ignore */
    }
    throw new Error(detail || `Request failed: ${r.status}`);
  }
  return (await r.json()) as T;
}

export const api = {
  baseURL: API_BASE,

  // ============ AUTH ============
  async signup(input: {
    name: string;
    email: string;
    password: string;
    schoolName: string;
    location: string;
  }): Promise<{ token: string; user: AuthUser }> {
    return jsonFetch("/api/auth/signup", { method: "POST", body: JSON.stringify(input) });
  },

  async login(input: { email: string; password: string }): Promise<{ token: string; user: AuthUser }> {
    return jsonFetch("/api/auth/login", { method: "POST", body: JSON.stringify(input) });
  },

  async me(): Promise<{ user: AuthUser }> {
    return jsonFetch("/api/auth/me");
  },

  // ============ ASSIGNMENTS ============
  async list(): Promise<Assignment[]> {
    const data = await jsonFetch<ApiAssignment[]>("/api/assignments");
    return data.map(adapt);
  },

  async get(id: string): Promise<Assignment> {
    const data = await jsonFetch<ApiAssignment>(`/api/assignments/${id}`);
    return adapt(data);
  },

  async create(draft: AssignmentDraft): Promise<Assignment> {
    const body = {
      title: draft.title.trim() || "Untitled Assignment",
      schoolName: draft.schoolName.trim(),
      teacherName: draft.teacherName.trim(),
      dueDate: draft.dueDate,
      additionalInfo: draft.additionalInfo,
      questionTypes: draft.questionTypes.map(({ type, count, marks }) => ({
        type,
        count: Number(count),
        marks: Number(marks),
      })),
      file: draft.file,
    };
    const data = await jsonFetch<ApiAssignment>("/api/assignments", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return adapt(data);
  },

  async remove(id: string): Promise<void> {
    await jsonFetch(`/api/assignments/${id}`, { method: "DELETE" });
  },
};
