"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { use, useState, useMemo } from "react";
import {
  Plus,
  Trash2,
  Edit,
  ArrowLeft,
  RefreshCw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Filter,
  X,
} from "lucide-react";
import Link from "next/link";

export default function CollectionDataPage({
  params,
}: {
  params: Promise<{ projectId: string; name: string }>;
}) {
  const { projectId, name } = use(params);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: records, isLoading, refetch } = useQuery({
    queryKey: ["data", projectId, name],
    queryFn: () => api.data.list(projectId, name),
  });

  const { data: tables } = useQuery({
    queryKey: ["schema", projectId],
    queryFn: () => api.schema.listTables(projectId),
  });

  const tableSchema = tables?.find((t: any) => t.name === name);
  const schemaColumns = tableSchema?.columns || [];

  const [createOpen, setCreateOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [globalSearch, setGlobalSearch] = useState("");
  const [showColumnFilters, setShowColumnFilters] = useState(false);

  const cols: string[] =
    schemaColumns.length > 0
      ? schemaColumns.map((c: any) => c.name as string)
      : records && records.length > 0
      ? Object.keys(records[0])
      : [];

  const handleSort = (field: string) => {
    if (sortField === field) {
      if (sortOrder === "asc") setSortOrder("desc");
      else {
        setSortField(null);
        setSortOrder("asc");
      }
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleColumnFilterChange = (col: string, val: string) => {
    setColumnFilters((prev) => {
      const next = { ...prev };
      if (!val) delete next[col];
      else next[col] = val;
      return next;
    });
  };

  const clearAllFilters = () => {
    setColumnFilters({});
    setGlobalSearch("");
    setSortField(null);
  };

  const filteredAndSortedRecords = useMemo(() => {
    if (!records) return [];
    let result = [...records];

    if (globalSearch.trim()) {
      const q = globalSearch.toLowerCase().trim();
      result = result.filter((r) =>
        Object.values(r).some((v) =>
          String(v ?? "").toLowerCase().includes(q)
        )
      );
    }

    const activeFilterEntries = Object.entries(columnFilters);
    if (activeFilterEntries.length > 0) {
      result = result.filter((r) =>
        activeFilterEntries.every(([col, filterVal]) => {
          const val = r[col];
          return String(val ?? "").toLowerCase().includes(filterVal.toLowerCase().trim());
        })
      );
    }

    if (sortField) {
      result.sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];

        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        if (typeof valA === "number" && typeof valB === "number") {
          return sortOrder === "asc" ? valA - valB : valB - valA;
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        if (strA < strB) return sortOrder === "asc" ? -1 : 1;
        if (strA > strB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [records, globalSearch, columnFilters, sortField, sortOrder]);

  const handleFieldChange = (key: string, val: string) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload: Record<string, any> = {};
      for (const [k, v] of Object.entries(formData)) {
        if (v !== "") {
          try {
            payload[k] = JSON.parse(v);
          } catch {
            payload[k] = v;
          }
        }
      }

      await api.data.create(projectId, name, payload);
      toast({ title: "Success", description: "Record inserted successfully" });
      setCreateOpen(false);
      setFormData({});
      refetch();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord?.id) return;
    setActionLoading(true);
    try {
      const payload: Record<string, any> = {};
      for (const [k, v] of Object.entries(formData)) {
        if (v !== undefined) {
          try {
            payload[k] = JSON.parse(v);
          } catch {
            payload[k] = v;
          }
        }
      }

      await api.data.update(projectId, name, editingRecord.id, payload);
      toast({ title: "Success", description: "Record updated" });
      setEditingRecord(null);
      setFormData({});
      refetch();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`Delete record with ID ${id}?`)) return;
    try {
      await api.data.delete(projectId, name, id);
      toast({ title: "Deleted", description: "Record deleted" });
      refetch();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const openEditModal = (record: any) => {
    setEditingRecord(record);
    const initial: Record<string, string> = {};
    for (const k of Object.keys(record)) {
      if (k !== "id") {
        initial[k] = typeof record[k] === "object" ? JSON.stringify(record[k]) : String(record[k] ?? "");
      }
    }
    setFormData(initial);
  };

  const hasActiveFilters = globalSearch !== "" || Object.keys(columnFilters).length > 0 || sortField !== null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="h-8">
            <Link href={`/projects/${projectId}/collections`}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Collections
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold font-mono tracking-tight flex items-center gap-2">
              {name}
              <span className="text-xs font-normal text-muted-foreground font-sans">
                ({filteredAndSortedRecords.length} {filteredAndSortedRecords.length === 1 ? "record" : "records"})
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input
              placeholder="Search in all columns..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="h-8 pl-8 pr-7 text-xs"
            />
            {globalSearch && (
              <button
                onClick={() => setGlobalSearch("")}
                className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <Button
            variant={showColumnFilters ? "secondary" : "outline"}
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={() => setShowColumnFilters(!showColumnFilters)}
          >
            <Filter className="h-3.5 w-3.5" />
            <span>Filters</span>
          </Button>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground" onClick={clearAllFilters}>
              Clear
            </Button>
          )}

          <Button variant="outline" size="sm" className="h-8" onClick={() => refetch()}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8 text-xs">
                <Plus className="mr-1.5 h-3.5 w-3.5" /> New Record
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Insert Record into {name}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 mt-4">
                {(schemaColumns.length > 0 ? schemaColumns : cols.map((c: string) => ({ name: c, type: "text" }))).map(
                  (col: any) => {
                    if (col.name === "id") return null;
                    return (
                      <div key={col.name} className="space-y-1.5">
                        <Label className="text-xs font-mono font-medium">
                          {col.name} <span className="text-muted-foreground font-sans">({col.type || "text"})</span>
                        </Label>
                        <Input
                          placeholder={`Value for ${col.name}`}
                          value={formData[col.name] || ""}
                          onChange={(e) => handleFieldChange(col.name, e.target.value)}
                        />
                      </div>
                    );
                  }
                )}
                <Button type="submit" disabled={actionLoading} className="w-full">
                  Insert Record
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={!!editingRecord} onOpenChange={(open) => !open && setEditingRecord(null)}>
            <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Record ({editingRecord?.id})</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpdate} className="space-y-4 mt-4">
                {Object.keys(formData).map((colName) => (
                  <div key={colName} className="space-y-1.5">
                    <Label className="text-xs font-mono font-medium">{colName}</Label>
                    <Input
                      value={formData[colName] || ""}
                      onChange={(e) => handleFieldChange(colName, e.target.value)}
                    />
                  </div>
                ))}
                <Button type="submit" disabled={actionLoading} className="w-full">
                  Update Record
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border shadow-xs overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  {cols.map((c) => {
                    const isSorted = sortField === c;
                    return (
                      <TableHead key={c} className="font-mono text-xs whitespace-nowrap py-2 px-3">
                        <button
                          onClick={() => handleSort(c)}
                          className="flex items-center gap-1.5 font-semibold text-foreground/80 hover:text-foreground transition-colors group"
                        >
                          <span>{c}</span>
                          {isSorted ? (
                            sortOrder === "asc" ? (
                              <ArrowUp className="h-3.5 w-3.5 text-primary" />
                            ) : (
                              <ArrowDown className="h-3.5 w-3.5 text-primary" />
                            )
                          ) : (
                            <ArrowUpDown className="h-3 w-3 text-muted-foreground/40 group-hover:text-muted-foreground" />
                          )}
                        </button>
                      </TableHead>
                    );
                  })}
                  <TableHead className="text-right py-2 px-3 text-xs w-[90px]">Actions</TableHead>
                </TableRow>

                {showColumnFilters && (
                  <TableRow className="bg-muted/60 border-b">
                    {cols.map((c) => (
                      <TableHead key={`filter-${c}`} className="p-1.5">
                        <Input
                          placeholder={`Filter ${c}...`}
                          value={columnFilters[c] || ""}
                          onChange={(e) => handleColumnFilterChange(c, e.target.value)}
                          className="h-7 text-xs bg-background"
                        />
                      </TableHead>
                    ))}
                    <TableHead className="p-1.5 text-right">
                      {Object.keys(columnFilters).length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-[11px]"
                          onClick={() => setColumnFilters({})}
                        >
                          Reset
                        </Button>
                      )}
                    </TableHead>
                  </TableRow>
                )}
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={cols.length + 1} className="text-center py-10 text-muted-foreground text-xs">
                      Loading records...
                    </TableCell>
                  </TableRow>
                ) : filteredAndSortedRecords.length > 0 ? (
                  filteredAndSortedRecords.map((r: any, i: number) => (
                    <TableRow key={r.id || i} className="hover:bg-muted/30">
                      {cols.map((c) => (
                        <TableCell key={c} className="max-w-[260px] truncate text-xs font-mono py-2.5 px-3">
                          {r[c] === null ? (
                            <span className="text-muted-foreground/50 italic">null</span>
                          ) : typeof r[c] === "object" ? (
                            JSON.stringify(r[c])
                          ) : (
                            String(r[c])
                          )}
                        </TableCell>
                      ))}
                      <TableCell className="text-right py-2 px-3 space-x-1 whitespace-nowrap">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEditModal(r)}>
                          <Edit className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                        </Button>
                        {r.id && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(r.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={cols.length + 1} className="text-center py-12 text-muted-foreground">
                      <p className="font-medium text-foreground text-sm">No records match your filters</p>
                      <p className="text-xs mt-1">Try adjusting your search criteria or insert a new record.</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
