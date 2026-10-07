"use client";

import { useProject } from "@/hooks/use-project";
import { useCollections } from "@/hooks/use-collections";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { use, useState } from "react";
import Link from "next/link";
import {
  Database,
  Table,
  Terminal,
  Activity,
  Layers,
  ArrowUpRight,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Copy,
  Check,
  Code2,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "k";
  return num.toLocaleString();
}

export default function ProjectOverviewPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: collections } = useCollections(projectId);

  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [selectedTableFilter, setSelectedTableFilter] = useState<string | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const { data: telemetry, isLoading: telemetryLoading, refetch: refetchTelemetry } = useQuery({
    queryKey: ["projectTelemetry", projectId],
    queryFn: () => api.projects.telemetry(projectId),
    refetchInterval: 5000,
  });

  const copyQuery = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-xs">
        Loading project configuration...
      </div>
    );
  }

  const dbTarget = project?.dbConnectionString
    ? project.dbConnectionString.split("@")[1] || "External PostgreSQL"
    : `${telemetry?.database || "mypg_data"}`;

  const filteredErrors = (telemetry?.recentErrors || []).filter((err: any) =>
    selectedTableFilter ? err.table === selectedTableFilter : true
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight">{project?.name}</h1>
            <Badge variant="outline" className="text-[11px] font-mono bg-muted/30">
              {telemetry?.database || project?.slug}
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs mt-1">
            Real-time query metrics, table telemetry, and error monitoring
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs gap-1.5"
            onClick={() => refetchTelemetry()}
          >
            <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" /> Refresh Stats
          </Button>
          <Button asChild size="sm" variant="outline" className="h-8 text-xs gap-1.5">
            <Link href={`/projects/${projectId}/logs`}>
              <Activity className="h-3.5 w-3.5 text-rose-500" /> Live Stream
            </Link>
          </Button>
          <Button asChild size="sm" className="h-8 text-xs gap-1.5">
            <Link href={`/projects/${projectId}/schema`}>
              <Terminal className="h-3.5 w-3.5" /> SQL Console
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-xl border shadow-xs overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2 bg-muted/10">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Database Requests
            </CardTitle>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Database className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold text-foreground">
                {telemetry ? formatNumber(telemetry.totalOperations) : "..."}
              </div>
              <span className="text-xs text-muted-foreground font-mono">requests</span>
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-[11px] text-muted-foreground font-mono">
              <span className="truncate">{dbTarget}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border shadow-xs overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2 bg-muted/10">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Activity (Last Hour)
            </CardTitle>
            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-500">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold text-foreground">
                {telemetry ? formatNumber(telemetry.lastHourRequests) : "..."}
              </div>
              <span className="text-xs text-muted-foreground font-mono">recent queries</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-emerald-500 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-time log capture active</span>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`rounded-xl border shadow-xs overflow-hidden transition-colors ${
            telemetry?.errorCount > 0
              ? "border-rose-500/40 bg-rose-500/5 cursor-pointer hover:border-rose-500/60"
              : ""
          }`}
          onClick={() => {
            if (telemetry?.errorCount > 0) {
              setSelectedTableFilter(null);
              setErrorModalOpen(true);
            }
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2 bg-muted/10">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Error Telemetry
            </CardTitle>
            <div
              className={`p-1.5 rounded-lg ${
                telemetry?.errorCount > 0
                  ? "bg-rose-500/20 text-rose-500"
                  : "bg-emerald-500/10 text-emerald-500"
              }`}
            >
              {telemetry?.errorCount > 0 ? (
                <AlertTriangle className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="flex items-baseline gap-2">
              <div
                className={`text-2xl font-bold ${
                  telemetry?.errorCount > 0 ? "text-rose-500" : "text-foreground"
                }`}
              >
                {telemetry ? telemetry.errorCount : "0"}
              </div>
              <span className="text-xs text-muted-foreground font-mono">errors detected</span>
            </div>
            <div className="mt-1.5 text-[11px]">
              {telemetry?.errorCount > 0 ? (
                <span className="text-rose-400 font-medium hover:underline">
                  Click to inspect failed queries →
                </span>
              ) : (
                <span className="text-emerald-500 font-medium">100% successful executions</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-xl border shadow-xs overflow-hidden md:col-span-2">
          <CardHeader className="p-4 border-b bg-muted/15 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Table className="h-4 w-4 text-primary" /> Table Activity & Query Breakdown
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Total operations, last hour volume, and error status per database table
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
              <Link href={`/projects/${projectId}/collections`}>
                All Collections <ArrowUpRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {telemetry?.tableStats && telemetry.tableStats.length > 0 ? (
              <div className="divide-y divide-border/60">
                {telemetry.tableStats.map((tbl: any) => (
                  <div
                    key={tbl.tableName}
                    className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Table className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="font-mono text-xs font-bold text-foreground">
                          {tbl.tableName}
                        </span>
                        {tbl.errorCount > 0 && (
                          <button
                            onClick={() => {
                              setSelectedTableFilter(tbl.tableName);
                              setErrorModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25 transition-colors cursor-pointer"
                          >
                            <AlertTriangle className="h-3 w-3" />
                            {tbl.errorCount} {tbl.errorCount === 1 ? "error" : "errors"}
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground font-mono">
                        <span>{formatNumber(tbl.liveRows)} rows</span>
                        <span>•</span>
                        <span>{formatNumber(tbl.reads)} reads</span>
                        <span>•</span>
                        <span>{formatNumber(tbl.inserts + tbl.updates + tbl.deletes)} writes</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 sm:self-center">
                      <div className="text-right">
                        <div className="text-xs font-bold font-mono text-foreground">
                          {formatNumber(tbl.totalOperations)} ops
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          {tbl.lastHourRequests > 0 ? (
                            <span className="text-emerald-500 font-semibold">
                              +{tbl.lastHourRequests} last hr
                            </span>
                          ) : (
                            "0 last hr"
                          )}
                        </div>
                      </div>

                      <Button asChild variant="outline" size="sm" className="h-7 text-xs px-2.5">
                        <Link href={`/projects/${projectId}/collections/${tbl.tableName}`}>
                          Browse
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No user tables detected in {telemetry?.database || "this database"}.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-xl border shadow-xs overflow-hidden">
          <CardHeader className="p-4 border-b bg-muted/15">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Terminal className="h-4 w-4 text-primary" /> Database Diagnostics
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Engine transaction health & tools
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between p-2 rounded-lg bg-muted/30 border border-border/40">
                <span className="text-muted-foreground">Database Engine</span>
                <span className="font-semibold text-foreground">{telemetry?.database || "postgres"}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-muted/30 border border-border/40">
                <span className="text-muted-foreground">Committed Xacts</span>
                <span className="font-semibold text-emerald-500 font-mono">
                  {telemetry ? formatNumber(telemetry.xactCommit) : "0"}
                </span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-muted/30 border border-border/40">
                <span className="text-muted-foreground">Rollback Xacts</span>
                <span className="font-semibold text-amber-500 font-mono">
                  {telemetry ? formatNumber(telemetry.xactRollback) : "0"}
                </span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <Button asChild variant="outline" className="w-full h-8 text-xs justify-start gap-2">
                <Link href={`/projects/${projectId}/logs`}>
                  <Activity className="h-3.5 w-3.5 text-rose-500" /> Full Log Stream
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full h-8 text-xs justify-start gap-2">
                <Link href={`/projects/${projectId}/schema`}>
                  <Terminal className="h-3.5 w-3.5 text-emerald-500" /> Schema & SQL Editor
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={errorModalOpen} onOpenChange={setErrorModalOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-5 w-5 text-rose-500" />
              Failed Query Inspector {selectedTableFilter ? `(${selectedTableFilter})` : `(${telemetry?.database})`}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 mt-3">
            {filteredErrors.length > 0 ? (
              filteredErrors.map((errItem: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/5 space-y-2 text-xs font-mono"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive" className="text-[10px]">
                        ERROR
                      </Badge>
                      <span className="font-semibold text-foreground">{errItem.table}</span>
                      <span className="text-muted-foreground text-[11px]">PID {errItem.pid}</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">{errItem.timestamp}</span>
                  </div>

                  <div className="text-rose-400 font-semibold bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                    {errItem.error}
                  </div>

                  {errItem.query && (
                    <div className="relative">
                      <pre className="p-2.5 bg-zinc-950 text-zinc-300 rounded-lg border border-zinc-800 whitespace-pre-wrap break-all text-[11px]">
                        {errItem.query}
                      </pre>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2 h-6 px-2 text-[10px] gap-1 bg-zinc-900 border border-zinc-800"
                        onClick={() => copyQuery(errItem.query, idx)}
                      >
                        {copiedIdx === idx ? (
                          <Check className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        <span>{copiedIdx === idx ? "Copied" : "Copy"}</span>
                      </Button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No recent errors recorded for this table.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
