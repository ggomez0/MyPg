"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { use, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCollections } from "@/hooks/use-collections";
import {
  Key,
  Plus,
  Trash2,
  Copy,
  Check,
  Activity,
  Globe,
  Server,
  Shield,
  Smartphone,
  Layers,
  Code2,
} from "lucide-react";

function formatRelativeTime(dateString?: string | null): string {
  if (!dateString) return "Never used";
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}d ago`;
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "k";
  return num.toLocaleString();
}

export default function ApiKeysPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: keys, isLoading, refetch } = useQuery({
    queryKey: ["apikeys", projectId],
    queryFn: () => api.apiKeys.list(projectId),
  });

  const { data: collections } = useCollections(projectId);

  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [environment, setEnvironment] = useState("production");
  const [type, setType] = useState("public");
  const [selectedCollections, setSelectedCollections] = useState<Record<string, { read: boolean; create: boolean; update: boolean; delete: boolean }>>({});
  const [creating, setCreating] = useState(false);

  const [newKeyData, setNewKeyData] = useState<any | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const [statsApp, setStatsApp] = useState<any | null>(null);
  const { data: appStats, isLoading: statsLoading } = useQuery({
    queryKey: ["appStats", projectId, statsApp?.id],
    queryFn: () => (statsApp ? api.apiKeys.stats(projectId, statsApp.id) : null),
    enabled: !!statsApp,
  });

  const [snippetApp, setSnippetApp] = useState<any | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const handleToggleCollectionAction = (colName: string, action: "read" | "create" | "update" | "delete") => {
    setSelectedCollections((prev) => {
      const current = prev[colName] || { read: false, create: false, update: false, delete: false };
      return {
        ...prev,
        [colName]: {
          ...current,
          [action]: !current[action],
        },
      };
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      let permissionsPayload: any = { mode: "full" };

      if (type === "public") {
        permissionsPayload = { mode: "readonly" };
      } else if (type === "custom") {
        const customCols: Record<string, string[]> = {};
        for (const [col, actions] of Object.entries(selectedCollections)) {
          const actList: string[] = [];
          if (actions.read) actList.push("read");
          if (actions.create) actList.push("create");
          if (actions.update) actList.push("update");
          if (actions.delete) actList.push("delete");
          if (actList.length > 0) customCols[col] = actList;
        }
        permissionsPayload = { mode: "custom", collections: customCols };
      }

      const res = await api.apiKeys.create(projectId, {
        name,
        environment,
        type,
        permissions: permissionsPayload,
      });

      setNewKeyData(res);
      setCreateOpen(false);
      setName("");
      setType("public");
      setEnvironment("production");
      setSelectedCollections({});
      queryClient.invalidateQueries({ queryKey: ["apikeys", projectId] });
      toast({ title: "App Created", description: "API Key generated successfully" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (keyItem: any) => {
    try {
      const updated = !keyItem.isActive;
      await api.apiKeys.update(projectId, keyItem.id, { isActive: updated });
      toast({
        title: updated ? "App Activated" : "App Paused",
        description: `${keyItem.name} is now ${updated ? "active and accepting requests" : "paused (requests blocked)"}`,
      });
      queryClient.invalidateQueries({ queryKey: ["apikeys", projectId] });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (keyId: string, appName: string) => {
    if (!confirm(`Are you sure you want to delete app "${appName}"? Any service using this API key will lose access immediately.`)) return;
    try {
      await api.apiKeys.delete(projectId, keyId);
      toast({ title: "App Deleted", description: `API key for ${appName} revoked` });
      queryClient.invalidateQueries({ queryKey: ["apikeys", projectId] });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const copyToClipboard = (text: string, setter: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const totalRequestsSum = keys?.reduce((acc: number, k: any) => acc + (parseInt(k.totalRequests || "0") || 0), 0) || 0;
  const activeAppsCount = keys?.filter((k: any) => k.isActive !== false).length || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" /> Client Apps & API Keys
            </h1>
            <Badge variant="outline" className="text-[10px] font-mono bg-muted/30">
              Gateway Scopes
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage granular access scopes, environments, and traffic per client application
          </p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8 text-xs gap-1.5 w-full sm:w-auto">
              <Plus className="h-3.5 w-3.5" /> Add New App / Key
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] sm:max-w-lg max-h-[85vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                <Key className="h-4 w-4 text-primary" /> Create Client Application Key
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreate} className="space-y-4 mt-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Application Name</Label>
                <Input
                  required
                  placeholder="e.g. Mobile App iOS, Next.js Web, Stripe Worker..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-xs h-8"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Environment</Label>
                  <Select value={environment} onValueChange={setEnvironment}>
                    <SelectTrigger className="text-xs h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="production">Production</SelectItem>
                      <SelectItem value="staging">Staging</SelectItem>
                      <SelectItem value="development">Development</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Key Access Scope</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="text-xs h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Frontend / Public (Read-Only)</SelectItem>
                      <SelectItem value="secret">Backend / Service (Full Access)</SelectItem>
                      <SelectItem value="custom">Granular (Per Table)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {type === "public" && (
                <div className="p-3 rounded-lg bg-sky-500/10 border border-sky-500/20 text-xs text-sky-400 space-y-1">
                  <p className="font-semibold flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5" /> Safe for Web & Mobile Clients
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    This key can be exposed in your frontend code safely. It only allows GET requests and rejects any INSERT, UPDATE, or DELETE attempts.
                  </p>
                </div>
              )}

              {type === "secret" && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 space-y-1">
                  <p className="font-semibold flex items-center gap-1.5">
                    <Server className="h-3.5 w-3.5" /> Secret Backend Key
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Full read and write permissions across all collections. Keep this key secret in your backend or server environment variables.
                  </p>
                </div>
              )}

              {type === "custom" && (
                <div className="space-y-2 border rounded-xl p-3 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium">Granular Table Scopes</Label>
                    <span className="text-[10px] text-muted-foreground font-mono">Select allowed actions</span>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto divide-y divide-border/60">
                    {collections?.map((col: any) => {
                      const cur = selectedCollections[col.name] || { read: false, create: false, update: false, delete: false };
                      return (
                        <div key={col.name} className="pt-2 pb-1 space-y-1.5">
                          <span className="font-mono text-xs font-semibold">{col.name}</span>
                          <div className="flex items-center gap-3 text-xs">
                            <label className="flex items-center gap-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={cur.read}
                                onChange={() => handleToggleCollectionAction(col.name, "read")}
                                className="rounded text-primary h-3.5 w-3.5"
                              />
                              <span className="text-[11px] text-muted-foreground">Read</span>
                            </label>
                            <label className="flex items-center gap-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={cur.create}
                                onChange={() => handleToggleCollectionAction(col.name, "create")}
                                className="rounded text-primary h-3.5 w-3.5"
                              />
                              <span className="text-[11px] text-muted-foreground">Create</span>
                            </label>
                            <label className="flex items-center gap-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={cur.update}
                                onChange={() => handleToggleCollectionAction(col.name, "update")}
                                className="rounded text-primary h-3.5 w-3.5"
                              />
                              <span className="text-[11px] text-muted-foreground">Update</span>
                            </label>
                            <label className="flex items-center gap-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={cur.delete}
                                onChange={() => handleToggleCollectionAction(col.name, "delete")}
                                className="rounded text-primary h-3.5 w-3.5"
                              />
                              <span className="text-[11px] text-muted-foreground">Delete</span>
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <Button type="submit" disabled={creating} className="w-full">
                {creating ? "Generating Key..." : "Create App & Generate Key"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-xl border shadow-xs overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2 bg-muted/10">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Connected Apps
            </CardTitle>
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Smartphone className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="text-2xl font-bold">{keys?.length || 0}</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {activeAppsCount} active • {(keys?.length || 0) - activeAppsCount} paused
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border shadow-xs overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2 bg-muted/10">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Gateway Requests
            </CardTitle>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Activity className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="text-2xl font-bold">{formatNumber(totalRequestsSum)}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Processed across all client apps</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border shadow-xs overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2 bg-muted/10">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Gateway Security Status
            </CardTitle>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
              <Shield className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="text-sm font-bold text-emerald-500 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Argon2 Hash Active
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5 font-mono">Strict scope enforcement enabled</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl border shadow-xs overflow-hidden">
        <CardHeader className="p-4 border-b bg-muted/15 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" /> Application Registry
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Client keys, permission scopes, and real-time usage telemetry
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => refetch()} className="h-8 text-xs">
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="text-xs font-semibold">Application & Env</TableHead>
                  <TableHead className="text-xs font-semibold">Scope / Type</TableHead>
                  <TableHead className="text-xs font-semibold">Status</TableHead>
                  <TableHead className="text-xs font-semibold">Total Requests</TableHead>
                  <TableHead className="text-xs font-semibold">Last Used</TableHead>
                  <TableHead className="text-right text-xs font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-xs text-muted-foreground">
                      Loading registered applications...
                    </TableCell>
                  </TableRow>
                ) : keys?.map((k: any) => {
                  const isActive = k.isActive !== false;
                  return (
                    <TableRow key={k.id} className="hover:bg-muted/30">
                      <TableCell className="py-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-foreground">{k.name}</span>
                            <Badge variant="outline" className="text-[9px] font-mono capitalize">
                              {k.environment || "production"}
                            </Badge>
                          </div>
                          <div className="font-mono text-[11px] text-muted-foreground">
                            Key prefix: <span className="text-foreground">{k.keyPrefix}••••</span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-3">
                        {k.type === "public" ? (
                          <Badge variant="secondary" className="text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/30 gap-1 font-medium">
                            <Globe className="h-3 w-3" /> Frontend (Read-only)
                          </Badge>
                        ) : k.type === "custom" ? (
                          <Badge variant="secondary" className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/30 gap-1 font-medium">
                            <Shield className="h-3 w-3" /> Granular Scopes
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 gap-1 font-medium">
                            <Server className="h-3 w-3" /> Backend (Full Access)
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="py-3">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={isActive}
                            onCheckedChange={() => handleToggleActive(k)}
                          />
                          <span className={`text-[11px] font-medium ${isActive ? "text-emerald-500" : "text-muted-foreground"}`}>
                            {isActive ? "Active" : "Paused"}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="py-3 font-mono text-xs">
                        <div className="font-bold text-foreground">
                          {formatNumber(parseInt(k.totalRequests || "0") || 0)}
                        </div>
                        <div className="text-[10px] text-muted-foreground">requests</div>
                      </TableCell>

                      <TableCell className="py-3 text-xs font-mono text-muted-foreground">
                        {formatRelativeTime(k.lastUsedAt)}
                      </TableCell>

                      <TableCell className="text-right py-3 space-x-1.5 whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs px-2"
                          onClick={() => setSnippetApp(k)}
                          title="Get code snippets"
                        >
                          <Code2 className="h-3.5 w-3.5 mr-1" /> Code
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs px-2"
                          onClick={() => setStatsApp(k)}
                          title="View telemetry logs"
                        >
                          <Activity className="h-3.5 w-3.5 mr-1 text-primary" /> Logs
                        </Button>

                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(k.id, k.name)}
                          title="Delete app"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {(!keys || keys.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-xs text-muted-foreground">
                      <Key className="h-8 w-8 mx-auto mb-2 opacity-30 text-primary" />
                      <p className="font-semibold text-foreground text-sm">No applications registered yet</p>
                      <p className="text-xs mt-1 text-muted-foreground">
                        Create your first app key above to connect a mobile app, website, or backend.
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!newKeyData} onOpenChange={(open) => !open && setNewKeyData(null)}>
        <DialogContent className="w-[95vw] sm:max-w-md p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base text-emerald-500">
              <Check className="h-5 w-5" /> API Key Created Successfully
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 rounded-lg">
              Make sure to copy your API key now. You will not be able to see it again.
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Generated Key for {newKeyData?.name}</Label>
              <div className="relative">
                <pre className="p-3 bg-zinc-950 text-emerald-400 rounded-lg border font-mono text-xs break-all pr-12 select-all">
                  {newKeyData?.key}
                </pre>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-1.5 top-1.5 h-7 px-2 text-xs gap-1 bg-zinc-900 border border-zinc-800"
                  onClick={() => copyToClipboard(newKeyData?.key, setCopiedKey)}
                >
                  {copiedKey ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedKey ? "Copied" : "Copy"}</span>
                </Button>
              </div>
            </div>

            <Button className="w-full" onClick={() => setNewKeyData(null)}>
              I Have Saved My API Key
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!snippetApp} onOpenChange={(open) => !open && setSnippetApp(null)}>
        <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[85vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Code2 className="h-4 w-4 text-primary" /> Integration Code for {snippetApp?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2 text-xs">
            <div>
              <span className="font-semibold text-foreground text-xs block mb-1.5">JavaScript / TypeScript Fetch</span>
              <pre className="p-3 bg-zinc-950 text-emerald-400 rounded-xl border border-zinc-800 font-mono text-xs overflow-x-auto">
{`const res = await fetch("${typeof window !== "undefined" ? window.location.origin : ""}/api/data/<table_name>", {
  headers: {
    "X-API-Key": "mypg_${snippetApp?.keyPrefix}_<YOUR_SECRET_KEY>",
    "Content-Type": "application/json"
  }
});
const { data } = await res.json();`}
              </pre>
            </div>

            <div>
              <span className="font-semibold text-foreground text-xs block mb-1.5">cURL CLI</span>
              <pre className="p-3 bg-zinc-950 text-sky-400 rounded-xl border border-zinc-800 font-mono text-xs overflow-x-auto">
{`curl -X GET "${typeof window !== "undefined" ? window.location.origin : ""}/api/data/<table_name>" \\
  -H "X-API-Key: mypg_${snippetApp?.keyPrefix}_<YOUR_SECRET_KEY>"`}
              </pre>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!statsApp} onOpenChange={(open) => !open && setStatsApp(null)}>
        <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[85vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-primary" /> Recent Request Stream ({statsApp?.name})
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 mt-2 text-xs font-mono">
            {statsLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading request logs...</div>
            ) : appStats && appStats.length > 0 ? (
              <div className="divide-y divide-border border rounded-xl overflow-hidden">
                {appStats.map((log: any) => (
                  <div key={log.id} className="p-2.5 flex items-center justify-between hover:bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">{log.method}</Badge>
                      <span className="font-mono text-foreground text-xs truncate max-w-[200px]">{log.path}</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground text-[11px]">
                      <Badge variant={log.statusCode >= 400 ? "destructive" : "secondary"} className="text-[10px]">
                        {log.statusCode}
                      </Badge>
                      <span>{log.durationMs}ms</span>
                      <span>{new Date(log.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center border border-dashed rounded-xl text-muted-foreground">
                No requests recorded yet for this application.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
