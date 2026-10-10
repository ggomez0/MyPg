"use client";

import * as React from "react";
import { Terminal, Copy, Check, Play, Send, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type TabKey = "rest" | "realtime" | "typescript" | "sql";

export function InteractiveTerminal() {
  const [activeTab, setActiveTab] = React.useState<TabKey>("rest");
  const [copied, setCopied] = React.useState(false);
  const [isSimulating, setIsSimulating] = React.useState(false);
  const [liveEvents, setLiveEvents] = React.useState<string[]>([
    '{"event":"insert","table":"posts","record":{"id":"f4a9","title":"First Post","status":"published"}}',
    '{"event":"update","table":"posts","record":{"id":"f4a9","views":14}}',
  ]);

  const snippets: Record<TabKey, { title: string; lang: string; code: string; preview: string }> = {
    rest: {
      title: "REST API Endpoint",
      lang: "HTTP",
      code: `GET /api/data/posts?filter[status]=published&sort=created_at:desc&page=1&perPage=2
Authorization: Bearer mypg_jwt_token
X-API-Key: key_live_89b21f92e0`,
      preview: `{
  "data": [
    {
      "id": "7b2c01e9-4e7b",
      "title": "Scaling PostgreSQL BaaS to 1M RPS",
      "status": "published",
      "views": 4820,
      "created_at": "2026-10-07T14:22:10Z"
    },
    {
      "id": "99f18a22-120c",
      "title": "Row-Level Security in Practice",
      "status": "published",
      "views": 1940,
      "created_at": "2026-10-07T11:05:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "perPage": 2,
    "total": 42,
    "totalPages": 21
  }
}`,
    },
    realtime: {
      title: "Server-Sent Events (SSE)",
      lang: "JavaScript",
      code: `const stream = new EventSource("http://localhost:4000/api/realtime/posts");

stream.onmessage = (event) => {
  const payload = JSON.parse(event.data);
  console.log("Database mutation:", payload);
};`,
      preview: liveEvents.join("\n"),
    },
    typescript: {
      title: "TypeScript Client SDK",
      lang: "TypeScript",
      code: `import { createClient } from "@mypg/sdk";

const client = createClient({
  endpoint: "http://localhost:4000",
  apiKey: "key_live_89b21f92e0",
});

const { data, error } = await client
  .from("posts")
  .select("id, title, views")
  .eq("status", "published")
  .order("created_at", { ascending: false })
  .limit(10);`,
      preview: `// Response type safe & validated against Postgres schema
[
  { id: "7b2c01e9", title: "Scaling PostgreSQL", views: 4820 },
  { id: "99f18a22", title: "Row-Level Security", views: 1940 }
]`,
    },
    sql: {
      title: "Direct PostgreSQL DDL",
      lang: "SQL",
      code: `CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  views INTEGER DEFAULT 0,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- MyPg automatically reflects this table into /api/data/posts`,
      preview: `✓ Table 'posts' reflected in 12ms
✓ CRUD routes mounted:
  POST   /api/data/posts
  GET    /api/data/posts
  GET    /api/data/posts/:id
  PATCH  /api/data/posts/:id
  DELETE /api/data/posts/:id
✓ SSE Channel listening: mypg_notify_posts`,
    },
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(snippets[activeTab].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const simulateStream = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const newEvent = `{"event":"update","table":"posts","record":{"id":"f4a9","views":${Math.floor(Math.random() * 500) + 20},"updated_at":"${new Date().toISOString()}"}}`;
      setLiveEvents((prev) => [newEvent, ...prev.slice(0, 3)]);
      setIsSimulating(false);
    }, 400);
  };

  return (
    <section id="interactive-demo" className="py-20 md:py-32 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="gradient" className="mb-4">
            Developer Experience
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Write SQL or use auto-generated APIs.
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            No codegen build steps. No complex ORM sync ceremonies. If it exists in PostgreSQL, it exists in your API.
          </p>
        </div>

        <div className="rounded-2xl border border-border/80 bg-slate-950/90 shadow-2xl backdrop-blur-xl overflow-hidden max-w-5xl mx-auto">
          <div className="flex flex-wrap items-center justify-between border-b border-border/60 bg-slate-900/60 px-4 py-3 gap-3">
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("rest")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                  activeTab === "rest"
                    ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20"
                    : "text-muted-foreground hover:text-white hover:bg-slate-800"
                }`}
              >
                REST API
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("realtime")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                  activeTab === "realtime"
                    ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20"
                    : "text-muted-foreground hover:text-white hover:bg-slate-800"
                }`}
              >
                Realtime SSE
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("typescript")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                  activeTab === "typescript"
                    ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20"
                    : "text-muted-foreground hover:text-white hover:bg-slate-800"
                }`}
              >
                TypeScript
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("sql")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                  activeTab === "sql"
                    ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20"
                    : "text-muted-foreground hover:text-white hover:bg-slate-800"
                }`}
              >
                Schema SQL
              </button>
            </div>

            <div className="flex items-center gap-2">
              {activeTab === "realtime" && (
                <button
                  type="button"
                  onClick={simulateStream}
                  disabled={isSimulating}
                  className="flex items-center gap-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-xs font-mono text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                >
                  <RefreshCw className={`h-3 w-3 ${isSimulating ? "animate-spin" : ""}`} />
                  <span>Emit Mutation</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-md border border-border/70 bg-slate-800/80 px-2.5 py-1 text-xs font-mono text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border/50">
            <div className="p-5 font-mono text-xs sm:text-sm bg-slate-950/60 overflow-x-auto">
              <div className="flex items-center justify-between text-slate-400 mb-3 text-xs uppercase tracking-wider font-semibold border-b border-border/30 pb-2">
                <span>Request / Definition</span>
                <span className="text-blue-400">{snippets[activeTab].lang}</span>
              </div>
              <pre className="text-slate-200 leading-relaxed whitespace-pre font-mono">
                <code>{snippets[activeTab].code}</code>
              </pre>
            </div>

            <div className="p-5 font-mono text-xs sm:text-sm bg-slate-900/40 overflow-x-auto">
              <div className="flex items-center justify-between text-slate-400 mb-3 text-xs uppercase tracking-wider font-semibold border-b border-border/30 pb-2">
                <span>Response / Output</span>
                <span className="text-emerald-400">Status 200 OK</span>
              </div>
              <pre className="text-emerald-300/90 leading-relaxed whitespace-pre font-mono">
                <code>{snippets[activeTab].preview}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
