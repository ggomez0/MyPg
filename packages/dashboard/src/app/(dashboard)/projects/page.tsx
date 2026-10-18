"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Link from "next/link";
import { Plus, Database, ArrowRight, Layers, EyeOff, Eye, RefreshCw, Search, ShieldCheck, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function ProjectsPage() {
  const { toast } = useToast();
  const { data: projects, refetch, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => api.projects.list({ includeHidden: true }),
  });

  const { data: discoveredDatabases } = useQuery({
    queryKey: ["discoveredDatabases"],
    queryFn: () => api.projects.getDatabases(),
  });

  const [open, setOpen] = useState(false);
  const [hideDialogOpen, setHideDialogOpen] = useState(false);
  const [selectedToHide, setSelectedToHide] = useState<any>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [selectedDb, setSelectedDb] = useState("default");
  const [customConnStr, setCustomConnStr] = useState("");
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState("");

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9_-]/g, "-"));
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await api.projects.sync();
      await refetch();
      toast({ title: "Sincronizado", description: "Bases de datos actualizadas desde PostgreSQL." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  };

  const onConfirmHide = async () => {
    if (!selectedToHide) return;
    setLoading(true);
    try {
      await api.projects.hide(selectedToHide.id);
      toast({
        title: "Base de datos oculta",
        description: `${selectedToHide.name} fue ocultada visualmente. Los datos en PostgreSQL siguen intactos.`,
      });
      setHideDialogOpen(false);
      setSelectedToHide(null);
      refetch();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleUnhide = async (p: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      await api.projects.unhide(p.id);
      toast({
        title: "Base de datos restaurada",
        description: `${p.name} se muestra nuevamente en la lista activa.`,
      });
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
      toast({ title: "Creado", description: "Proyecto creado con éxito." });
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

  const allList = (projects as any[]) || [];
  const filteredList = allList.filter((p) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      p.name?.toLowerCase().includes(q) ||
      p.slug?.toLowerCase().includes(q) ||
      (p.dbConnectionString && p.dbConnectionString.toLowerCase().includes(q))
    );
  });

  const activeProjects = filteredList.filter((p) => !p.isHidden);
  const hiddenProjects = filteredList.filter((p) => !!p.isHidden);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" /> PostgreSQL Databases & BaaS
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Todas tus bases de datos se detectan automáticamente y se exponen como APIs y dashboards listos para usar.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button asChild variant="outline" size="sm" className="h-8 text-xs gap-1.5 shrink-0">
            <Link href="/api-keys">
              <Key className="h-3.5 w-3.5 text-primary" />
              Apps & API Keys
            </Link>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5 shrink-0"
            onClick={handleSync}
            disabled={syncing}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
            Sincronizar PostgreSQL
          </Button>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8 text-xs gap-1.5 shrink-0">
                <Plus className="h-3.5 w-3.5" /> Nueva Conexión
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] sm:max-w-md p-4 sm:p-6">
              <DialogHeader>
                <DialogTitle>Crear / Conectar Base de Datos</DialogTitle>
              </DialogHeader>
              <form onSubmit={onCreate} className="space-y-4 mt-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Nombre del Proyecto</Label>
                  <Input required value={name} onChange={(e) => handleNameChange(e.target.value)} placeholder="Ej. BusAlert, E-commerce" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Slug URL</Label>
                  <Input required value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="busalert" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Base de Datos de Destino</Label>
                  <Select value={selectedDb} onValueChange={setSelectedDb}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Seleccionar Base de Datos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default BaaS Database (mypg_data)</SelectItem>
                      {discoveredDatabases?.map((db: any) => (
                        <SelectItem key={db.name} value={db.name}>
                          {db.name} (detectada en servidor)
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">Cadena de conexión personalizada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedDb === "custom" && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Cadena de Conexión</Label>
                    <Input
                      required
                      value={customConnStr}
                      onChange={(e) => setCustomConnStr(e.target.value)}
                      placeholder="postgresql://user:password@host:5432/dbname"
                    />
                  </div>
                )}

                <Button type="submit" disabled={loading} className="w-full">Conectar Proyecto</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o base de datos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-xs bg-background/50 border-border/80 rounded-md"
          />
        </div>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList className="bg-muted/60 p-1 rounded-lg h-9">
          <TabsTrigger value="active" className="text-xs gap-1.5 px-3">
            <Database className="h-3.5 w-3.5 text-primary" />
            Activas
            <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 h-4">
              {activeProjects.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="hidden" className="text-xs gap-1.5 px-3">
            <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
            Ocultas
            <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 h-4">
              {hiddenProjects.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-16 text-xs text-muted-foreground">Cargando bases de datos...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeProjects.map((p: any) => {
                const rawDbName = p.dbConnectionString
                  ? p.dbConnectionString.split("/").pop()?.split("?")[0]
                  : "mypg_data";

                return (
                  <div key={p.id} className="relative group">
                    <Card className="rounded-xl hover:border-primary/60 transition-all h-full hover:shadow-xs border flex flex-col justify-between">
                      <Link href={`/projects/${p.id}`} className="block flex-1 cursor-pointer">
                        <CardHeader className="p-4 pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-bold group-hover:text-primary transition-colors flex items-center gap-2">
                              <Database className="h-4 w-4 text-primary shrink-0" />
                              <span className="truncate">{p.name}</span>
                            </CardTitle>
                            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                          </div>
                          <CardDescription className="text-xs font-mono">/{p.slug}</CardDescription>
                        </CardHeader>

                        <CardContent className="p-4 pt-2 space-y-2">
                          <div className="text-[11px] bg-muted/50 border py-1 px-2.5 rounded-lg font-mono truncate text-muted-foreground flex items-center justify-between">
                            <span className="truncate">db: {rawDbName}</span>
                            <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 uppercase font-semibold">
                              PostgreSQL
                            </Badge>
                          </div>
                        </CardContent>
                      </Link>

                      <div className="px-4 pb-3 pt-0 flex items-center justify-between border-t border-border/40 mt-1">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3 text-emerald-500" /> BaaS Ready
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1 px-2"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedToHide(p);
                            setHideDialogOpen(true);
                          }}
                        >
                          <EyeOff className="h-3.5 w-3.5" />
                          <span>Ocultar</span>
                        </Button>
                      </div>
                    </Card>
                  </div>
                );
              })}

              {activeProjects.length === 0 && (
                <div className="col-span-full text-center py-16 border rounded-xl bg-card text-muted-foreground border-dashed">
                  <Database className="h-10 w-10 mx-auto mb-3 opacity-30 text-primary" />
                  <p className="font-semibold text-foreground text-sm">No hay bases de datos activas visibles</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {hiddenProjects.length > 0
                      ? "Tienes bases de datos en la pestaña 'Ocultas'. Haz clic arriba para restaurarlas."
                      : "Haz clic en 'Sincronizar PostgreSQL' para refrescar las bases de tu servidor."}
                  </p>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="hidden" className="space-y-4">
          <div className="p-3 bg-muted/40 border rounded-lg text-xs text-muted-foreground flex items-center gap-2">
            <EyeOff className="h-4 w-4 text-muted-foreground shrink-0" />
            <span>
              Las bases de datos ocultas solo se quitan visualmente del panel principal y menú. Todos tus datos, esquemas y registros en PostgreSQL permanecen 100% seguros e intactos.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hiddenProjects.map((p: any) => {
              const rawDbName = p.dbConnectionString
                ? p.dbConnectionString.split("/").pop()?.split("?")[0]
                : "mypg_data";

              return (
                <Card key={p.id} className="rounded-xl border border-dashed opacity-80 hover:opacity-100 transition-opacity">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-bold text-muted-foreground flex items-center gap-2">
                        <Database className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="truncate">{p.name}</span>
                      </CardTitle>
                      <Badge variant="outline" className="text-[10px] text-muted-foreground">
                        Oculta
                      </Badge>
                    </div>
                    <CardDescription className="text-xs font-mono">/{p.slug}</CardDescription>
                  </CardHeader>

                  <CardContent className="p-4 pt-2 space-y-3">
                    <div className="text-[11px] bg-muted/50 border py-1 px-2.5 rounded-lg font-mono truncate text-muted-foreground">
                      db: {rawDbName}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <Button asChild variant="outline" size="sm" className="h-7 text-xs">
                        <Link href={`/projects/${p.id}`}>Ver Datos</Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-7 text-xs gap-1.5"
                        disabled={loading}
                        onClick={(e) => handleUnhide(p, e)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Restaurar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {hiddenProjects.length === 0 && (
              <div className="col-span-full text-center py-12 border rounded-xl bg-card text-muted-foreground border-dashed">
                <Eye className="h-8 w-8 mx-auto mb-2 opacity-30 text-primary" />
                <p className="font-semibold text-foreground text-sm">No tienes bases de datos ocultas</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Cuando ocultes una base de datos de la vista activa, aparecerá aquí para que puedas restaurarla cuando quieras.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={hideDialogOpen} onOpenChange={setHideDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-md p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <EyeOff className="h-5 w-5 text-destructive" />
              ¿Ocultar base de datos del panel?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2 text-xs text-muted-foreground">
            <p>
              Estás a punto de ocultar <strong className="text-foreground">{selectedToHide?.name}</strong> de la vista principal del dashboard.
            </p>
            <div className="p-3 rounded-lg bg-muted border text-foreground/90 space-y-1">
              <p className="font-semibold text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" /> Seguridad de datos garantizada
              </p>
              <p className="text-[11px] text-muted-foreground">
                Ninguna tabla, columna ni registro se modificará ni borrará en tu servidor PostgreSQL. Podrás restaurarla en cualquier momento desde la pestaña &ldquo;Ocultas&rdquo;.
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setHideDialogOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button variant="destructive" size="sm" onClick={onConfirmHide} disabled={loading}>
              Ocultar de la vista
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
