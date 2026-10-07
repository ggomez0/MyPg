const API_URL = process.env.NEXT_PUBLIC_API_URL || "";


function getToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("mypg_admin_token");
  }
  return null;
}

async function fetcher(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "An error occurred");
  }

  if (res.status === 204) return null;
  const json = await res.json();
  return json.data !== undefined ? json.data : json;
}

export const api = {
  auth: {
    login: (data: { email: string; password: string }) =>
      fetcher("/api/admin/auth/login", { method: "POST", body: JSON.stringify(data) }),
    register: (data: { email: string; password: string; name: string }) =>
      fetcher("/api/admin/auth/register", { method: "POST", body: JSON.stringify(data) }),
    me: () => fetcher("/api/admin/auth/me"),
  },
  projects: {
    list: () => fetcher("/api/admin/projects"),
    getDatabases: () => fetcher("/api/admin/databases"),
    create: (data: { name: string; slug: string; dbConnectionString?: string; databaseName?: string }) =>
      fetcher("/api/admin/projects", { method: "POST", body: JSON.stringify(data) }),
    get: (id: string) => fetcher(`/api/admin/projects/${id}`),
    update: (id: string, data: Partial<{ name: string; slug: string; dbConnectionString: string }>) =>
      fetcher(`/api/admin/projects/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: string) => fetcher(`/api/admin/projects/${id}`, { method: "DELETE" }),
    telemetry: (id: string) => fetcher(`/api/admin/projects/${id}/telemetry`),
  },
  apiKeys: {
    list: (projectId: string) => fetcher(`/api/admin/projects/${projectId}/keys`),
    create: (projectId: string, data: { name: string; permissions?: object }) =>
      fetcher(`/api/admin/projects/${projectId}/keys`, { method: "POST", body: JSON.stringify(data) }),
    delete: (projectId: string, keyId: string) =>
      fetcher(`/api/admin/projects/${projectId}/keys/${keyId}`, { method: "DELETE" }),
  },
  collections: {
    list: (projectId: string) => fetcher(`/api/admin/projects/${projectId}/collections`),
    create: (projectId: string, data: { tableName: string; displayName: string; enableRls?: boolean }) =>
      fetcher(`/api/admin/projects/${projectId}/collections`, { method: "POST", body: JSON.stringify(data) }),
    get: (projectId: string, name: string) => fetcher(`/api/admin/projects/${projectId}/collections/${name}`),
    update: (projectId: string, name: string, data: { displayName?: string; enableRls?: boolean }) =>
      fetcher(`/api/admin/projects/${projectId}/collections/${name}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (projectId: string, name: string) =>
      fetcher(`/api/admin/projects/${projectId}/collections/${name}`, { method: "DELETE" }),
  },
  schema: {
    listTables: (projectId: string) => fetcher(`/api/admin/projects/${projectId}/schema/tables`),
    createTable: (projectId: string, data: { name: string; columns: object[] }) =>
      fetcher(`/api/admin/projects/${projectId}/schema/tables`, { method: "POST", body: JSON.stringify(data) }),
    dropTable: (projectId: string, name: string) =>
      fetcher(`/api/admin/projects/${projectId}/schema/tables/${name}`, { method: "DELETE" }),
    addColumn: (projectId: string, table: string, col: object) =>
      fetcher(`/api/admin/projects/${projectId}/schema/tables/${table}/columns`, {
        method: "POST",
        body: JSON.stringify(col),
      }),
    dropColumn: (projectId: string, table: string, col: string) =>
      fetcher(`/api/admin/projects/${projectId}/schema/tables/${table}/columns/${col}`, { method: "DELETE" }),
    runSQL: (projectId: string, query: string) =>
      fetcher(`/api/admin/projects/${projectId}/schema/sql`, { method: "POST", body: JSON.stringify({ query }) }),
  },
  data: {
    list: (projectId: string, collection: string, params?: Record<string, string>) => {
      const q = params ? `?${new URLSearchParams(params).toString()}` : "";
      return fetcher(`/api/data/${collection}${q}`, {
        headers: { "X-Project-Id": projectId },
      });
    },
    get: (projectId: string, collection: string, id: string) =>
      fetcher(`/api/data/${collection}/${id}`, { headers: { "X-Project-Id": projectId } }),
    create: (projectId: string, collection: string, body: object) =>
      fetcher(`/api/data/${collection}`, {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "X-Project-Id": projectId },
      }),
    update: (projectId: string, collection: string, id: string, body: object) =>
      fetcher(`/api/data/${collection}/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
        headers: { "X-Project-Id": projectId },
      }),
    delete: (projectId: string, collection: string, id: string) =>
      fetcher(`/api/data/${collection}/${id}`, {
        method: "DELETE",
        headers: { "X-Project-Id": projectId },
      }),
  },
  storage: {
    list: (projectId: string) => fetcher(`/api/admin/projects/${projectId}/storage`),
    upload: (projectId: string, file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const token = getToken();
      return fetch(`${API_URL}/api/storage/upload`, {
        method: "POST",
        body: formData,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          "X-Project-Id": projectId,
        },
      }).then((r) => r.json());
    },
    delete: (projectId: string, id: string) => fetcher(`/api/storage/${id}`, { method: "DELETE" }),
  },
  logs: {
    list: (projectId: string, params?: Record<string, string>) => {
      const q = params ? `?${new URLSearchParams(params).toString()}` : "";
      return fetcher(`/api/admin/logs${q}`);
    },
    postgres: (params?: { db?: string; action?: string; limit?: number }) => {
      const searchParams = new URLSearchParams();
      if (params?.db && params.db !== "ALL" && params.db !== "undefined") {
        searchParams.set("db", params.db);
      }
      if (params?.action && params.action !== "ALL" && params.action !== "undefined") {
        searchParams.set("action", params.action);
      }
      if (params?.limit) {
        searchParams.set("limit", String(params.limit));
      }
      const q = searchParams.toString() ? `?${searchParams.toString()}` : "";
      return fetcher(`/api/admin/logs/postgres${q}`);
    },
  },
};

