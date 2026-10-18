"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
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
  Database,
  Sliders,
  Filter,
  Search,
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

export function ApiKeysManager({ initialProjectId }: { initialProjectId?: string }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: allProjects } = useQuery({
    queryKey: ["projects"],
    queryFn: () => api.projects.list(),
  });

  const { data: allKeys, isLoading, refetch } = useQuery({
    queryKey: ["apikeys", "all"],
    queryFn: () => api.apiKeys.listAll(),
  });

  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [createProjectId, setCreateProjectId] = useState<string>("");
  const [name, setName] = useState("");
  const [environment, setEnvironment] = useState("production");
  const [type, setType] = useState("public");
  const [selectedCollections, setSelectedCollections] = useState<Record<string, { read: boolean; create: boolean; update: boolean; delete: boolean }>>({});
  const [creating, setCreating] = useState(false);

  const [newKeyData, setNewKeyData] = useState<any | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const [editingApp, setEditingApp] = useState<any | null>(null);
  const [editName, setEditName] = useState("");
  const [editEnvironment, setEditEnvironment] = useState("production");
  const [editType, setEditType] = useState("public");
  const [editProjectId, setEditProjectId] = useState("");
  const [editSelectedCollections, setEditSelectedCollections] = useState<Record<string, { read: boolean; create: boolean; update: boolean; delete: boolean }>>({});
  const [updating, setUpdating] = useState(false);

  const [statsApp, setStatsApp] = useState<any | null>(null);
  const { data: appStats, isLoading: statsLoading } = useQuery({
    queryKey: ["appStats", statsApp?.projectId, statsApp?.id],
    queryFn: () => (statsApp ? api.apiKeys.stats(statsApp.projectId, statsApp.id) : null),
    enabled: !!statsApp,
  });

  const [snippetApp, setSnippetApp] = useState<any | null>(null);

  useEffect(() => {
    if (allProjects && allProjects.length > 0 && !createProjectId) {
      setCreateProjectId(initialProjectId || allProjects[0].id);
    }
  }, [allProjects, initialProjectId, createProjectId]);

  const activeCreateProj = createProjectId || initialProjectId || (allProjects && allProjects[0]?.id) || "";

  const { data: createTables } = useQuery({
    queryKey: ["schemaTables", activeCreateProj],
    queryFn: () => (activeCreateProj ? api.schema.listTables(activeCreateProj) : []),
    enabled: !!activeCreateProj,
  });

  const { data: editTables } = useQuery({
    queryKey: ["schemaTables", editProjectId],
    queryFn: () => (editProjectId ? api.schema.listTables(editProjectId) : []),
    enabled: !!editProjectId,
  });

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

  const handleToggleEditCollectionAction = (colName: string, action: "read" | "create" | "update" | "delete") => {
    setEditSelectedCollections((prev) => {
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

  const [createSearchTable, setCreateSearchTable] = useState("");
  const [editSearchTable, setEditSearchTable] = useState("");

  const setAllCreatePermissions = (mode: "all" | "readonly" | "readwrite" | "clear") => {
    if (!createTables) return;
    const next: Record<string, { read: boolean; create: boolean; update: boolean; delete: boolean }> = {};
    for (const tbl of createTables) {
      next[tbl.name] = {
        read: mode !== "clear",
        create: mode === "all" || mode === "readwrite",
        update: mode === "all" || mode === "readwrite",
        delete: mode === "all",
      };
    }
    setSelectedCollections(next);
  };

  const setSingleCreatePermission = (tblName: string, mode: "all" | "readonly" | "readwrite" | "clear") => {
    setSelectedCollections((prev) => ({
      ...prev,
      [tblName]: {
        read: mode !== "clear",
        create: mode === "all" || mode === "readwrite",
        update: mode === "all" || mode === "readwrite",
        delete: mode === "all",
      },
    }));
  };

  const setAllEditPermissions = (mode: "all" | "readonly" | "readwrite" | "clear") => {
    if (!editTables) return;
    const next: Record<string, { read: boolean; create: boolean; update: boolean; delete: boolean }> = {};
    for (const tbl of editTables) {
      next[tbl.name] = {
        read: mode !== "clear",
        create: mode === "all" || mode === "readwrite",
        update: mode === "all" || mode === "readwrite",
        delete: mode === "all",
      };
    }
    setEditSelectedCollections(next);
  };

  const setSingleEditPermission = (tblName: string, mode: "all" | "readonly" | "readwrite" | "clear") => {
    setEditSelectedCollections((prev) => ({
      ...prev,
      [tblName]: {
        read: mode !== "clear",
        create: mode === "all" || mode === "readwrite",
        update: mode === "all" || mode === "readwrite",
        delete: mode === "all",
      },
    }));
  };

  const openEditModal = (k: any) => {
    setEditingApp(k);
    setEditName(k.name);
    setEditEnvironment(k.environment || "production");
    setEditType(k.type || "secret");
    setEditProjectId(k.projectId);

    const initialPerms: Record<string, { read: boolean; create: boolean; update: boolean; delete: boolean }> = {};
    if (k.permissions?.collections && typeof k.permissions.collections === "object") {
      for (const [col, actions] of Object.entries(k.permissions.collections)) {
        if (Array.isArray(actions)) {
          initialPerms[col] = {
            read: actions.includes("read") || actions.includes("*") || actions.includes("all"),
            create: actions.includes("create") || actions.includes("*") || actions.includes("all"),
            update: actions.includes("update") || actions.includes("*") || actions.includes("all"),
            delete: actions.includes("delete") || actions.includes("*") || actions.includes("all"),
          };
        }
      }
    }
    setEditSelectedCollections(initialPerms);
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

      const res = await api.apiKeys.create(activeCreateProj, {
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
      queryClient.invalidateQueries({ queryKey: ["apikeys"] });
      toast({ title: "App Created", description: "API Key generated successfully" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp) return;
    setUpdating(true);
    try {
      let permissionsPayload: any = { mode: "full" };

      if (editType === "public") {
        permissionsPayload = { mode: "readonly" };
      } else if (editType === "custom") {
        const customCols: Record<string, string[]> = {};
        for (const [col, actions] of Object.entries(editSelectedCollections)) {
          const actList: string[] = [];
          if (actions.read) actList.push("read");
          if (actions.create) actList.push("create");
          if (actions.update) actList.push("update");
          if (actions.delete) actList.push("delete");
          if (actList.length > 0) customCols[col] = actList;
        }
        permissionsPayload = { mode: "custom", collections: customCols };
      }

      await api.apiKeys.updateGlobal(editingApp.id, {
        name: editName,
        environment: editEnvironment,
        type: editType,
        projectId: editProjectId,
        permissions: permissionsPayload,
      });

      queryClient.invalidateQueries({ queryKey: ["apikeys"] });
      toast({ title: "App & Permissions Updated", description: "Changes saved successfully" });
      setEditingApp(null);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleActive = async (keyItem: any) => {
    try {
      const updated = !keyItem.isActive;
      await api.apiKeys.updateGlobal(keyItem.id, { isActive: updated });
      toast({
        title: updated ? "App Activated" : "App Paused",
        description: `${keyItem.name} is now ${updated ? "active and accepting requests" : "paused (requests blocked)"}`,
      });
      queryClient.invalidateQueries({ queryKey: ["apikeys"] });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (keyId: string, appName: string) => {
    if (!confirm(`Are you sure you want to delete app "${appName}"? Any service using this API key will lose access immediately.`)) return;
    try {
      await api.apiKeys.deleteGlobal(keyId);
      toast({ title: "App Deleted", description: `API key for ${appName} revoked` });
      queryClient.invalidateQueries({ queryKey: ["apikeys"] });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const copyToClipboard = (text: string, setter: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const keys = (allKeys || []).filter((k: any) => projectFilter === "all" || k.projectId === projectFilter);
  const totalRequestsSum = (allKeys || []).reduce((acc: number, k: any) => acc + (parseInt(k.totalRequests || "0") || 0), 0) || 0;
  const activeAppsCount = (allKeys || []).filter((k: any) => k.isActive !== false).length || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" /> Apps & API Keys
            </h1>
            <Badge variant="outline" className="text-[10px] font-mono bg-muted/30">
              Global Gateway
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage client applications, granular database permissions, and traffic across all projects
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="h-8 text-xs w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Databases ({allKeys?.length || 0})</SelectItem>
                {allProjects?.map((p: any) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8 text-xs gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Add New Key
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
                  <Label className="text-xs font-medium">Target Database / Project</Label>
                  <Select value={activeCreateProj} onValueChange={setCreateProjectId}>
                    <SelectTrigger className="text-xs h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {allProjects?.map((p: any) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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
                    <Label className="text-xs font-medium">Access Scope / Permission</Label>
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
                      This key only allows GET requests. Inserts, updates, and deletes will be blocked.
                    </p>
                  </div>
                )}

                {type === "secret" && (
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 space-y-1">
                    <p className="font-semibold flex items-center gap-1.5">
                      <Server className="h-3.5 w-3.5" /> Secret Backend Key
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Full read and write permissions across all collections. Keep this key secret in server environment variables.
                    </p>
                  </div>
                )}

                {type === "custom" && (
                  <div className="space-y-2.5 border rounded-xl p-3 bg-muted/20">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium">Granular Table Scopes</Label>
                      <span className="text-[10px] text-muted-foreground font-mono">Select allowed actions</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-6 text-[11px] px-2"
                        onClick={() => setAllCreatePermissions("all")}
                      >
                        Select All
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-6 text-[11px] px-2"
                        onClick={() => setAllCreatePermissions("readonly")}
                      >
                        Read Only All
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-6 text-[11px] px-2"
                        onClick={() => setAllCreatePermissions("readwrite")}
                      >
                        Read & Write All
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[11px] px-2 text-muted-foreground hover:text-foreground"
                        onClick={() => setAllCreatePermissions("clear")}
                      >
                        Clear All
                      </Button>
                    </div>

                    <div className="relative">
                      <Search className="h-3 w-3 absolute left-2 top-2 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Search tables..."
                        value={createSearchTable}
                        onChange={(e) => setCreateSearchTable(e.target.value)}
                        className="h-7 pl-6 text-xs bg-background"
                      />
                    </div>

                    <div className="space-y-2 max-h-52 overflow-y-auto divide-y divide-border/60">
                      {createTables
                        ?.filter((tbl: any) =>
                          !createSearchTable || tbl.name.toLowerCase().includes(createSearchTable.toLowerCase())
                        )
                        .map((tbl: any) => {
                          const cur = selectedCollections[tbl.name] || { read: false, create: false, update: false, delete: false };
                          return (
                            <div key={tbl.name} className="pt-2 pb-1 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-xs font-semibold">{tbl.name}</span>
                                <div className="flex items-center gap-1">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-5 px-1.5 text-[10px]"
                                    onClick={() => setSingleCreatePermission(tbl.name, "all")}
                                  >
                                    All
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-5 px-1.5 text-[10px]"
                                    onClick={() => setSingleCreatePermission(tbl.name, "readonly")}
                                  >
                                    Read
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-5 px-1.5 text-[10px]"
                                    onClick={() => setSingleCreatePermission(tbl.name, "readwrite")}
                                  >
                                    R/W
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-5 px-1.5 text-[10px] text-muted-foreground"
                                    onClick={() => setSingleCreatePermission(tbl.name, "clear")}
                                  >
                                    Clear
                                  </Button>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 text-xs">
                                <label className="flex items-center gap-1 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={cur.read}
                                    onChange={() => handleToggleCollectionAction(tbl.name, "read")}
                                    className="rounded text-primary h-3.5 w-3.5"
                                  />
                                  <span className="text-[11px] text-muted-foreground">Read</span>
                                </label>
                                <label className="flex items-center gap-1 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={cur.create}
                                    onChange={() => handleToggleCollectionAction(tbl.name, "create")}
                                    className="rounded text-primary h-3.5 w-3.5"
                                  />
                                  <span className="text-[11px] text-muted-foreground">Create</span>
                                </label>
                                <label className="flex items-center gap-1 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={cur.update}
                                    onChange={() => handleToggleCollectionAction(tbl.name, "update")}
                                    className="rounded text-primary h-3.5 w-3.5"
                                  />
                                  <span className="text-[11px] text-muted-foreground">Update</span>
                                </label>
                                <label className="flex items-center gap-1 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={cur.delete}
                                    onChange={() => handleToggleCollectionAction(tbl.name, "delete")}
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
            <div className="text-2xl font-bold">{allKeys?.length || 0}</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {activeAppsCount} active • {(allKeys?.length || 0) - activeAppsCount} paused
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
              Client keys, database mapping, granular permission scopes, and telemetry
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
                  <TableHead className="text-xs font-semibold">Database / Project</TableHead>
                  <TableHead className="text-xs font-semibold">Scope / Permissions</TableHead>
                  <TableHead className="text-xs font-semibold">Status</TableHead>
                  <TableHead className="text-xs font-semibold">Requests</TableHead>
                  <TableHead className="text-xs font-semibold">Last Used</TableHead>
                  <TableHead className="text-right text-xs font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-xs text-muted-foreground">
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
                            Key: <span className="text-foreground">{k.keyPrefix}••••</span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-3">
                        <Badge variant="secondary" className="text-[10px] font-mono gap-1 font-medium bg-muted/60">
                          <Database className="h-3 w-3 text-primary" />
                          <span>{k.projectName || "Database"}</span>
                        </Badge>
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

                      <TableCell className="text-right py-3 space-x-1 whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs px-2"
                          onClick={() => openEditModal(k)}
                          title="Edit permissions & scope"
                        >
                          <Sliders className="h-3.5 w-3.5 mr-1 text-primary" /> Edit
                        </Button>

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
                    <TableCell colSpan={7} className="text-center py-12 text-xs text-muted-foreground">
                      <Key className="h-8 w-8 mx-auto mb-2 opacity-30 text-primary" />
                      <p className="font-semibold text-foreground text-sm">No applications found</p>
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

      <Dialog open={!!editingApp} onOpenChange={(open) => !open && setEditingApp(null)}>
        <DialogContent className="w-[95vw] sm:max-w-lg max-h-[85vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Sliders className="h-4 w-4 text-primary" /> Edit Scopes & Permissions ({editingApp?.name})
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleUpdate} className="space-y-4 mt-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Application Name</Label>
              <Input
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="text-xs h-8"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Target Database / Project</Label>
                <Select value={editProjectId} onValueChange={setEditProjectId}>
                  <SelectTrigger className="text-xs h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allProjects?.map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Environment</Label>
                <Select value={editEnvironment} onValueChange={setEditEnvironment}>
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
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Access Scope / Permission</Label>
              <Select value={editType} onValueChange={setEditType}>
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

            {editType === "public" && (
              <div className="p-3 rounded-lg bg-sky-500/10 border border-sky-500/20 text-xs text-sky-400 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" /> Read-Only Mode
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Allows only GET queries. Mutation operations (insert/update/delete) are strictly rejected.
                </p>
              </div>
            )}

            {editType === "secret" && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <Server className="h-3.5 w-3.5" /> Full Read & Write Access
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Has full read and write access across all tables in the database.
                </p>
              </div>
            )}

            {editType === "custom" && (
              <div className="space-y-2 border rounded-xl p-3 bg-muted/20">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">Granular Table Scopes</Label>
                  <span className="text-[10px] text-muted-foreground font-mono">Check allowed actions</span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-6 text-[11px] px-2"
                    onClick={() => setAllEditPermissions("all")}
                  >
                    Select All
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-6 text-[11px] px-2"
                    onClick={() => setAllEditPermissions("readonly")}
                  >
                    Read Only All
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-6 text-[11px] px-2"
                    onClick={() => setAllEditPermissions("readwrite")}
                  >
                    Read & Write All
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[11px] px-2 text-muted-foreground hover:text-foreground"
                    onClick={() => setAllEditPermissions("clear")}
                  >
                    Clear All
                  </Button>
                </div>

                <div className="relative">
                  <Search className="h-3 w-3 absolute left-2 top-2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search tables..."
                    value={editSearchTable}
                    onChange={(e) => setEditSearchTable(e.target.value)}
                    className="h-7 pl-6 text-xs bg-background"
                  />
                </div>

                <div className="space-y-2 max-h-52 overflow-y-auto divide-y divide-border/60">
                  {editTables
                    ?.filter((tbl: any) =>
                      !editSearchTable || tbl.name.toLowerCase().includes(editSearchTable.toLowerCase())
                    )
                    .map((tbl: any) => {
                      const cur = editSelectedCollections[tbl.name] || { read: false, create: false, update: false, delete: false };
                      return (
                        <div key={tbl.name} className="pt-2 pb-1 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-semibold">{tbl.name}</span>
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-5 px-1.5 text-[10px]"
                                onClick={() => setSingleEditPermission(tbl.name, "all")}
                              >
                                All
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-5 px-1.5 text-[10px]"
                                onClick={() => setSingleEditPermission(tbl.name, "readonly")}
                              >
                                Read
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-5 px-1.5 text-[10px]"
                                onClick={() => setSingleEditPermission(tbl.name, "readwrite")}
                              >
                                R/W
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-5 px-1.5 text-[10px] text-muted-foreground"
                                onClick={() => setSingleEditPermission(tbl.name, "clear")}
                              >
                                Clear
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-xs">
                            <label className="flex items-center gap-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={cur.read}
                                onChange={() => handleToggleEditCollectionAction(tbl.name, "read")}
                                className="rounded text-primary h-3.5 w-3.5"
                              />
                              <span className="text-[11px] text-muted-foreground">Read</span>
                            </label>
                            <label className="flex items-center gap-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={cur.create}
                                onChange={() => handleToggleEditCollectionAction(tbl.name, "create")}
                                className="rounded text-primary h-3.5 w-3.5"
                              />
                              <span className="text-[11px] text-muted-foreground">Create</span>
                            </label>
                            <label className="flex items-center gap-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={cur.update}
                                onChange={() => handleToggleEditCollectionAction(tbl.name, "update")}
                                className="rounded text-primary h-3.5 w-3.5"
                              />
                              <span className="text-[11px] text-muted-foreground">Update</span>
                            </label>
                            <label className="flex items-center gap-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={cur.delete}
                                onChange={() => handleToggleEditCollectionAction(tbl.name, "delete")}
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

            <Button type="submit" disabled={updating} className="w-full">
              {updating ? "Saving Changes..." : "Save Scopes & Permissions"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

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
