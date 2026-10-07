"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Link from "next/link";
import { Plus, Database, Sparkles, ArrowRight, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function ProjectsPage() {
  const { toast } = useToast();
  const { data: projects, refetch, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => api.projects.list(),
  });

  const { data: discoveredDatabases } = useQuery({
    queryKey: ["discoveredDatabases"],
    queryFn: () => api.projects.getDatabases(),
  });

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [selectedDb, setSelectedDb] = useState("default");
  const [customConnStr, setCustomConnStr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9_-]/g, "-"));
  };

  const handleQuickConnect = async (dbName: string) => {
    setLoading(true);
    try {
      await api.projects.create({
        name: dbName.replace(/^db_/, "").toUpperCase(),
        slug: dbName.replace(/_/g, "-"),
        databaseName: dbName,
      });
      toast({ title: "Success", description: `Project connected to ${dbName}` });
      refetch();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: { name: string; slug: string; databaseName?: string; dbConnectionString?: string } = {
        name,
        slug,
      };

      if (selectedDb === "custom") {
        payload.dbConnectionString = customConnStr;
      } else if (selectedDb !== "default") {
        payload.databaseName = selectedDb;
      }

      await api.projects.create(payload);
      toast({ title: "Success", description: "Project created" });
      setOpen(false);
      setName("");
      setSlug("");
      setSelectedDb("default");
      setCustomConnStr("");
      refetch();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" /> PostgreSQL Projects
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Connect existing databases or create new isolated BaaS environments
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8 text-xs gap-1.5">
              <Plus className="h-3.5 w-3.5" /> New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <form onSubmit={onCreate} className="space-y-4 mt-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Project Name</Label>
                <Input required value={name} onChange={e => handleNameChange(e.target.value)} placeholder="e.g. BusAlert, Ecommerce" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Slug</Label>
                <Input required value={slug} onChange={e => setSlug(e.target.value)} placeholder="busalert" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Target Database</Label>
                <Select value={selectedDb} onValueChange={setSelectedDb}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Select Database" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default BaaS Database (mypg_data)</SelectItem>
                    {discoveredDatabases?.map((db: any) => (
                      <SelectItem key={db.name} value={db.name}>
                        {db.name} (detected on server)
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Custom Connection String</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedDb === "custom" && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Connection String</Label>
                  <Input
                    required
                    value={customConnStr}
                    onChange={e => setCustomConnStr(e.target.value)}
                    placeholder="postgresql://user:password@host:5432/dbname"
                  />
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full">Create Project</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {discoveredDatabases && discoveredDatabases.length > 0 && projects?.length === 0 && (
        <Card className="rounded-xl border border-dashed bg-muted/20">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-primary" /> Auto-detected Databases on your PostgreSQL
            </CardTitle>
            <CardDescription className="text-xs">
              Existing databases running on your PostgreSQL server were discovered. Click any database to instantly connect it:
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="flex flex-wrap gap-2">
              {discoveredDatabases.map((db: any) => (
                <Button
                  key={db.name}
                  variant="outline"
                  size="sm"
                  className="bg-background h-8 text-xs gap-1.5 font-mono"
                  disabled={loading}
                  onClick={() => handleQuickConnect(db.name)}
                >
                  <Database className="h-3.5 w-3.5 text-primary" />
                  {db.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="text-center py-16 text-xs text-muted-foreground">Loading projects...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects?.map((p: any) => (
            <Link href={`/projects/${p.id}`} key={p.id}>
              <Card className="rounded-xl hover:border-primary/60 transition-all cursor-pointer h-full hover:shadow-xs group border">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold group-hover:text-primary transition-colors flex items-center gap-2">
                      <Database className="h-4 w-4 text-primary shrink-0" />
                      {p.name}
                    </CardTitle>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <CardDescription className="text-xs font-mono">/{p.slug}</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <div className="text-[11px] bg-muted/50 border py-1 px-2.5 rounded-lg font-mono truncate text-muted-foreground">
                    {p.dbConnectionString ? p.dbConnectionString.split("@")[1] || "external" : "mypg_data (default)"}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {projects?.length === 0 && (
            <div className="col-span-full text-center py-16 border rounded-xl bg-card text-muted-foreground border-dashed">
              <Database className="h-10 w-10 mx-auto mb-3 opacity-30 text-primary" />
              <p className="font-semibold text-foreground text-sm">No projects created yet</p>
              <p className="text-xs text-muted-foreground mt-1">Create a project above or click one of the auto-detected databases.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
