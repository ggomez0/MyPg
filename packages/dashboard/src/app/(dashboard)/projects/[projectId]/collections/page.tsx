"use client";

import { useCollections } from "@/hooks/use-collections";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { use, useState } from "react";
import { Database, Plus, Shield, ArrowRight, Table as TableIcon } from "lucide-react";

export default function CollectionsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const { data: collections, isLoading } = useCollections(projectId);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [toggling, setToggling] = useState<string | null>(null);

  const toggleRls = async (collectionName: string, currentStatus: boolean, registered: boolean) => {
    setToggling(collectionName);
    try {
      if (!registered) {
        await api.collections.create(projectId, {
          tableName: collectionName,
          displayName: collectionName,
          enableRls: !currentStatus,
        });
      } else {
        await api.collections.update(projectId, collectionName, {
          enableRls: !currentStatus,
        });
      }
      toast({ title: "Updated", description: `RLS updated for ${collectionName}` });
      queryClient.invalidateQueries({ queryKey: ["collections", projectId] });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setToggling(null);
    }
  };

  const registerAsCollection = async (tableName: string) => {
    setToggling(tableName);
    try {
      await api.collections.create(projectId, {
        tableName,
        displayName: tableName,
        enableRls: false,
      });
      toast({ title: "Collection Registered", description: `${tableName} is now an active BaaS collection` });
      queryClient.invalidateQueries({ queryKey: ["collections", projectId] });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setToggling(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-xs">
        Loading collections...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <TableIcon className="h-5 w-5 text-primary" /> Collections & API Tables
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tables detected in your database exposed as REST APIs with Row Level Security (RLS)
          </p>
        </div>
        <Button asChild size="sm" className="h-8 text-xs gap-1.5">
          <Link href={`/projects/${projectId}/schema`}>
            <Plus className="h-3.5 w-3.5" /> Manage Schema & Tables
          </Link>
        </Button>
      </div>

      <Card className="rounded-xl border shadow-xs overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="text-xs font-semibold">Table Name</TableHead>
                <TableHead className="text-xs font-semibold">Type</TableHead>
                <TableHead className="text-xs font-semibold">Row Level Security (RLS)</TableHead>
                <TableHead className="text-right text-xs font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {collections?.map((c: any) => (
                <TableRow key={c.name} className="hover:bg-muted/30">
                  <TableCell className="font-mono text-xs font-semibold py-3 flex items-center gap-2">
                    <Database className="h-3.5 w-3.5 text-primary shrink-0" />
                    {c.displayName || c.name}
                  </TableCell>
                  <TableCell className="py-3">
                    {c.registered ? (
                      <Badge variant="default" className="text-[10px] font-medium">Active BaaS</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px] font-mono font-medium">Direct Table</Badge>
                    )}
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={!!c.rls_enabled}
                        disabled={toggling === c.name}
                        onCheckedChange={() => toggleRls(c.name, !!c.rls_enabled, c.registered)}
                      />
                      <span className="text-xs text-muted-foreground">
                        {c.rls_enabled ? "Restricted (Owner only)" : "Open API"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right py-3 space-x-2">
                    {!c.registered && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-7 text-xs"
                        disabled={toggling === c.name}
                        onClick={() => registerAsCollection(c.name)}
                      >
                        Register
                      </Button>
                    )}
                    <Button asChild variant="outline" size="sm" className="h-7 text-xs gap-1">
                      <Link href={`/projects/${projectId}/collections/${c.name}`}>
                        Browse Data <ArrowRight className="h-3 w-3" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!collections || collections.length === 0) && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-16">
                    <TableIcon className="h-8 w-8 mx-auto mb-2 opacity-30 text-primary" />
                    <p className="font-semibold text-foreground text-sm">No tables found in this database</p>
                    <p className="text-xs mt-1 text-muted-foreground">Go to the Schema Editor or SQL Console to create your first table.</p>
                    <Button asChild size="sm" variant="outline" className="mt-4 h-8 text-xs">
                      <Link href={`/projects/${projectId}/schema`}>Open Schema Editor</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
