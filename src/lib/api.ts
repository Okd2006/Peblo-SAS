const BASE = "/api";

function getToken(): string | null {
  try {
    const stored = localStorage.getItem("peblo-auth");
    if (!stored) return null;
    return JSON.parse(stored)?.state?.token || null;
  } catch {
    return null;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const api = {
  auth: {
    signup: (body: { name: string; email: string; password: string }) =>
      request<{ user: unknown; token: string }>("/auth/signup", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    login: (body: { email: string; password: string }) =>
      request<{ user: unknown; token: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    me: () => request<{ user: unknown }>("/auth/me"),
  },
  notes: {
    list: (params?: { search?: string; tag?: string; archived?: boolean; sort?: string }) => {
      const qs = new URLSearchParams();
      if (params?.search) qs.set("search", params.search);
      if (params?.tag) qs.set("tag", params.tag);
      if (params?.archived) qs.set("archived", "true");
      if (params?.sort) qs.set("sort", params.sort);
      return request<{ notes: Note[] }>(`/notes?${qs}`);
    },
    get: (id: string) => request<{ note: Note }>(`/notes/${id}`),
    create: (body: { title?: string; content?: string; tags?: string[] }) =>
      request<{ note: Note }>("/notes", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: Partial<Omit<Note, "tags"> & { tags: string[] }>) =>
      request<{ note: Note }>(`/notes/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    delete: (id: string) => request<{ success: boolean }>(`/notes/${id}`, { method: "DELETE" }),
    generateSummary: (id: string) =>
      request<{ note: Note; insights: AIInsights }>(`/notes/${id}/generate-summary`, {
        method: "POST",
      }),
  },
  shared: {
    get: (shareId: string) => request<{ note: Note }>(`/shared/${shareId}`),
  },
  insights: {
    get: () => request<InsightsData>("/insights"),
  },
  tags: {
    list: () => request<{ tags: { name: string; count: number }[] }>("/tags"),
  },
};

export interface Note {
  id: string;
  title: string;
  content: string;
  isArchived: boolean;
  isPublic: boolean;
  shareId: string | null;
  userId: string;
  tags: { id: string; name: string }[];
  aiSummary: string | null;
  aiActions: string | null;
  aiTitle: string | null;
  aiUsedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user?: { name: string };
}

export interface AIInsights {
  summary: string;
  action_items: string[];
  suggested_title: string;
}

export interface InsightsData {
  totalNotes: number;
  archivedNotes: number;
  recentNotes: { id: string; title: string; updatedAt: string }[];
  aiUsageCount: number;
  weeklyActivity: { date: string; count: number }[];
  topTags: { name: string; count: number }[];
}
