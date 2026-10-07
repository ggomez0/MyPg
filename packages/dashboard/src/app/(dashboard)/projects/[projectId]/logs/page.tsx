"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { use, useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Activity,
  RefreshCw,
  Search,
  Database,
  Code2,
  Clock,
  Layers,
  Terminal,
  X,
  Play,
  Pause,
  Copy,
  Check,
} from "lucide-react";

export default function LogsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const [activeTab, setActiveTab] = useState<"postgres" | "api">("postgres");

  const [selectedDb, setSelectedDb] = useState<string>("ALL");
  const [actionFilter, setActionFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [copied, setCopied] = useState(false);

  const { data: discoveredDatabases } = useQuery({
    queryKey: ["discoveredDatabases"],
    queryFn: () => api.projects.getDatabases(),
  });

  const {
    data: pgLogs,
    isLoading: pgLoading,
    refetch: refetchPg,
  } = useQuery({
    queryKey: ["postgresLogs", selectedDb, actionFilter],
    queryFn: () =>
      api.logs.postgres({
        db: selectedDb === "ALL" ? undefined : selectedDb,
        action: actionFilter === "ALL" ? undefined : actionFilter,
      }),
    refetchInterval: autoRefresh ? 2500 : false,
  });

  const {
    data: apiLogs,
    isLoading: apiLoading,
    refetch: refetchApi,
  } = useQuery({
    queryKey: ["apiLogs", projectId],
    queryFn: () => api.logs.list(projectId),
    refetchInterval: autoRefresh ? 6000 : false,
  });

  const filteredPgLogs = useMemo(() => {
    if (!pgLogs) return [];
    if (!searchQuery.trim()) return pgLogs;
    const q = searchQuery.toLowerCase().trim();
    return pgLogs.filter(
      (l: any) =>
        (l.query || "").toLowerCase().includes(q) ||
        (l.datname || "").toLowerCase().includes(q) ||
        (l.usename || "").toLowerCase().includes(q) ||
        (l.client_ip || "").toLowerCase().includes(q)
    );
  }, [pgLogs, searchQuery]);

  const copyQuery = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getActionBadge = (action: string) => {
    const base = "font-mono text-[10px] px-1.5 py-0.5 rounded font-semibold tracking-wider shrink-0";
    switch (action) {
      case "INSERT":
        return <span className={`${base} bg-emerald-500/15 text-emerald-400 border border-emerald-500/30`}>INSERT</span>;
      case "SELECT":
        return <span className={`${base} bg-sky-500/15 text-sky-400 border border-sky-500/30`}>SELECT</span>;
      case "UPDATE":
        return <span className={`${base} bg-amber-500/15 text-amber-400 border border-amber-500/30`}>UPDATE</span>;
      case "DELETE":
        return <span className={`${base} bg-rose-500/15 text-rose-400 border border-rose-500/30`}>DELETE</span>;
      case "CREATE":
      case "ALTER":
      case "DROP":
        return <span className={`${base} bg-purple-500/15 text-purple-400 border border-purple-500/30`}>{action}</span>;
      default:
        return <span className={`${base} bg-zinc-500/15 text-zinc-400 border border-zinc-500/30`}>{action}</span>;
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1 border-b">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Terminal className="h-5 w-5 text-primary" /> Live PostgreSQL Query Console
          </h1>
          <p className="text-muted-foreground text-xs mt-0.5">
            Streaming real-time SQL execution across all databases on your PostgreSQL server
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={autoRefresh ? "secondary" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="h-8 text-xs gap-1.5"
          >
            {autoRefresh ? (
              <>
                <Pause className="h-3.5 w-3.5 text-emerald-500" /> Auto (2.5s)
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" /> Paused
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (activeTab === "postgres") refetchPg();
              else refetchApi();
            }}
            className="h-8 text-xs gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
          <TabsList className="bg-muted/50 p-1 rounded-lg">
            <TabsTrigger value="postgres" className="text-xs gap-1.5 rounded-md data-[state=active]:bg-background">
              <Database className="h-3.5 w-3.5 text-blue-500" /> PostgreSQL Engine ({filteredPgLogs.length})
            </TabsTrigger>
            <TabsTrigger value="api" className="text-xs gap-1.5 rounded-md data-[state=active]:bg-background">
              <Layers className="h-3.5 w-3.5 text-amber-500" /> HTTP Api Logs
            </TabsTrigger>
          </TabsList>

          {activeTab === "postgres" && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-64">
                <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Filter query text, table, IP..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 pr-7 text-xs bg-background"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <Select value={selectedDb} onValueChange={setSelectedDb}>
                <SelectTrigger className="w-40 h-8 text-xs bg-background">
                  <SelectValue placeholder="Database" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Databases</SelectItem>
                  {discoveredDatabases?.map((db: any) => (
                    <SelectItem key={db.name} value={db.name}>
                      {db.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-32 h-8 text-xs bg-background">
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Actions</SelectItem>
                  <SelectItem value="INSERT">INSERT</SelectItem>
                  <SelectItem value="SELECT">SELECT</SelectItem>
                  <SelectItem value="UPDATE">UPDATE</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                  <SelectItem value="CREATE">CREATE</SelectItem>
                  <SelectItem value="ALTER">ALTER</SelectItem>
                  <SelectItem value="DROP">DROP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <TabsContent value="postgres" className="mt-0">
          <div className="rounded-xl border bg-zinc-950 text-zinc-100 font-mono text-xs overflow-hidden shadow-sm">
            <div className="border-b border-zinc-800/80 px-4 py-2.5 flex items-center justify-between text-zinc-400 text-[11px] bg-zinc-900/60">
              <div className="flex items-center gap-4">
                <span className="w-16">TYPE</span>
                <span className="w-28">DATABASE</span>
                <span>QUERY STREAM</span>
              </div>
              <div className="flex items-center gap-6">
                <span>LATENCY</span>
                <span>TIME</span>
              </div>
            </div>

            <div className="divide-y divide-zinc-900 max-h-[680px] overflow-y-auto">
              {pgLoading ? (
                <div className="p-8 text-center text-zinc-500 text-xs">
                  Connecting to PostgreSQL engine stream...
                </div>
              ) : filteredPgLogs.length > 0 ? (
                filteredPgLogs.map((log: any, idx: number) => {
                  const querySnippet = (log.query || "").replace(/\s+/g, " ").trim();
                  return (
                    <div
                      key={log.pid ? `${log.pid}-${idx}` : idx}
                      onClick={() => setSelectedLog(log)}
                      className="px-4 py-2 hover:bg-zinc-900/80 cursor-pointer flex items-center justify-between gap-3 group transition-colors"
                    >
                      <div className="flex items-center gap-3 truncate min-w-0 flex-1">
                        <div className="w-16 shrink-0">{getActionBadge(log.action)}</div>
                        <span className="w-28 shrink-0 text-emerald-400/90 font-semibold truncate text-[11px]">
                          {log.datname}
                        </span>
                        <span className="text-zinc-300 truncate text-[11px] group-hover:text-white transition-colors">
                          {querySnippet || "<idle connection>"}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 shrink-0 text-[11px] text-zinc-500">
                        <span className="w-16 text-right font-mono text-zinc-400">
                          {log.duration_ms !== null && log.duration_ms !== undefined ? `${log.duration_ms}ms` : "-"}
                        </span>
                        <span className="w-20 text-right text-zinc-500 truncate text-[10px]">
                          {log.timestamp ? log.timestamp.split(" ")[1]?.slice(0, 8) || "live" : "live"}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-12 text-center text-zinc-500">
                  <Terminal className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="font-medium text-zinc-400">No queries captured matching the active filters</p>
                  <p className="text-xs text-zinc-600 mt-1">Queries will stream here in real-time as your applications interact with PostgreSQL.</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="api" className="mt-0">
          <Card className="border shadow-xs overflow-hidden">
            <CardContent className="p-0">
              <div className="divide-y divide-border text-xs font-mono">
                {apiLoading ? (
                  <div className="p-8 text-center text-muted-foreground">Loading HTTP logs...</div>
                ) : apiLogs && apiLogs.length > 0 ? (
                  apiLogs.map((l: any) => (
                    <div key={l.id} className="p-3 flex items-center justify-between hover:bg-muted/30">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-[10px]">{l.method}</Badge>
                        <span className="font-medium text-foreground">{l.path}</span>
                      </div>
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <Badge variant={l.statusCode >= 400 ? "destructive" : "secondary"} className="text-[10px]">
                          {l.statusCode}
                        </Badge>
                        <span>{l.durationMs}ms</span>
                        <span>{new Date(l.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground">No API logs available</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between pr-4">
            <DialogTitle className="flex items-center gap-2 text-base">
              <Code2 className="h-5 w-5 text-primary" /> Query Inspector ({selectedLog?.datname})
            </DialogTitle>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4 text-xs font-mono mt-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 bg-muted/40 rounded-xl border">
                <div>
                  <span className="text-muted-foreground block font-sans text-[11px]">Database</span>
                  <span className="font-bold text-foreground text-xs">{selectedLog.datname}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block font-sans text-[11px]">Operation</span>
                  <span>{getActionBadge(selectedLog.action)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block font-sans text-[11px]">Duration</span>
                  <span className="font-semibold text-foreground">{selectedLog.duration_ms ?? 0}ms</span>
                </div>
                <div>
                  <span className="text-muted-foreground block font-sans text-[11px]">PID</span>
                  <span>{selectedLog.pid}</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-sans font-medium text-muted-foreground text-xs">Full SQL Statement</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[11px] gap-1"
                    onClick={() => copyQuery(selectedLog.query || "")}
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    <span>{copied ? "Copied" : "Copy SQL"}</span>
                  </Button>
                </div>
                <pre className="p-3.5 bg-zinc-950 text-emerald-400 rounded-xl border border-zinc-800/80 whitespace-pre-wrap break-all text-xs overflow-x-auto max-h-80 leading-relaxed">
                  {selectedLog.query || "<empty query>"}
                </pre>
              </div>

              {selectedLog.parameters && (
                <div>
                  <span className="font-sans font-medium text-muted-foreground text-xs block mb-1.5">Bound Parameters</span>
                  <div className="p-3 bg-zinc-950/80 text-amber-300 rounded-xl border border-zinc-800/80 font-mono text-xs whitespace-pre-wrap break-all">
                    {selectedLog.parameters}
                  </div>
                </div>
              )}

              {selectedLog.isError && selectedLog.errorText && (
                <div>
                  <span className="font-sans font-medium text-rose-400 text-xs block mb-1.5">Error Detail</span>
                  <div className="p-3 bg-rose-950/30 text-rose-300 rounded-xl border border-rose-900/50 font-mono text-xs whitespace-pre-wrap break-all">
                    {selectedLog.errorText}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
