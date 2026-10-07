"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table as UITable, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useState, use } from "react";
import { Plus, Trash2, Play, Database, Table as TableIcon, Code2, Layers } from "lucide-react";

export default function SchemaPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  const [createTableOpen, setCreateTableOpen] = useState(false);
  const [newTableName, setNewTableName] = useState("");
  const [initialColumnName, setInitialColumnName] = useState("id");
  const [initialColumnType, setInitialColumnType] = useState("uuid");

  const [addColumnOpen, setAddColumnOpen] = useState(false);
  const [newColName, setNewColName] = useState("");
  const [newColType, setNewColType] = useState("text");
  const [newColNullable, setNewColNullable] = useState(true);
  const [newColDefault, setNewColDefault] = useState("");

  const [sqlQuery, setSqlQuery] = useState("SELECT * FROM information_schema.tables WHERE table_schema = 'public';");
  const [sqlResults, setSqlResults] = useState<any[] | null>(null);
  const [sqlRunning, setSqlRunning] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const { data: tables, isLoading } = useQuery({
    queryKey: ["schema", projectId],
    queryFn: () => api.schema.listTables(projectId),
  });

  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.schema.createTable(projectId, {
        name: newTableName,
        columns: [
          {
            name: initialColumnName,
            type: initialColumnType,
            primaryKey: initialColumnName === "id",
            nullable: false,
            default: initialColumnType === "uuid" ? "gen_random_uuid()" : undefined,
          },
        ],
      });
      toast({ title: "Success", description: `Table ${newTableName} created` });
      setCreateTableOpen(false);
      setNewTableName("");
      queryClient.invalidateQueries({ queryKey: ["schema", projectId] });
      queryClient.invalidateQueries({ queryKey: ["collections", projectId] });
      setSelectedTable(newTableName);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTable) return;
    setActionLoading(true);
    try {
      await api.schema.addColumn(projectId, selectedTable, {
        name: newColName,
        type: newColType,
        nullable: newColNullable,
        default: newColDefault || undefined,
      });
      toast({ title: "Success", description: `Column ${newColName} added to ${selectedTable}` });
      setAddColumnOpen(false);
      setNewColName("");
      setNewColDefault("");
      queryClient.invalidateQueries({ queryKey: ["schema", projectId] });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDropColumn = async (colName: string) => {
    if (!selectedTable || !confirm(`Drop column ${colName} from ${selectedTable}?`)) return;
    try {
      await api.schema.dropColumn(projectId, selectedTable, colName);
      toast({ title: "Success", description: `Column ${colName} dropped` });
      queryClient.invalidateQueries({ queryKey: ["schema", projectId] });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDropTable = async () => {
    if (!selectedTable || !confirm(`Are you sure you want to permanently DROP table ${selectedTable}?`)) return;
    try {
      await api.schema.dropTable(projectId, selectedTable);
      toast({ title: "Success", description: `Table ${selectedTable} dropped` });
      setSelectedTable(null);
      queryClient.invalidateQueries({ queryKey: ["schema", projectId] });
      queryClient.invalidateQueries({ queryKey: ["collections", projectId] });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleRunSQL = async () => {
    if (!sqlQuery.trim()) return;
    setSqlRunning(true);
    try {
      const res = await api.schema.runSQL(projectId, sqlQuery);
      setSqlResults(Array.isArray(res) ? res : res?.data || []);
      toast({ title: "Query Executed", description: "Query completed successfully" });
      queryClient.invalidateQueries({ queryKey: ["schema", projectId] });
    } catch (err: any) {
      toast({ title: "SQL Error", description: err.message, variant: "destructive" });
    } finally {
      setSqlRunning(false);
    }
  };

  const currentTable = tables?.find((t: any) => t.name === selectedTable);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" /> Schema & Query Editor
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Visually manage tables, schemas, data types, and run raw PostgreSQL queries
          </p>
        </div>
        <Dialog open={createTableOpen} onOpenChange={setCreateTableOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8 text-xs gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Create Table
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New PostgreSQL Table</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateTable} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Table Name</Label>
                <Input required placeholder="posts, products, users..." value={newTableName} onChange={(e) => setNewTableName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Primary Key Name</Label>
                  <Input value={initialColumnName} onChange={(e) => setInitialColumnName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Type</Label>
                  <Select value={initialColumnType} onValueChange={setInitialColumnType}>
                    <SelectTrigger className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="uuid">UUID (Default)</SelectItem>
                      <SelectItem value="serial">SERIAL (Integer)</SelectItem>
                      <SelectItem value="bigserial">BIGSERIAL (BigInt)</SelectItem>
                      <SelectItem value="text">TEXT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" disabled={actionLoading} className="w-full">
                {actionLoading ? "Creating..." : "Create Table"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="tables">
        <TabsList className="bg-muted/50 p-1 rounded-lg">
          <TabsTrigger value="tables" className="text-xs gap-1.5 rounded-md data-[state=active]:bg-background">
            <Layers className="h-3.5 w-3.5 text-blue-500" /> Visual Schema
          </TabsTrigger>
          <TabsTrigger value="sql" className="text-xs gap-1.5 rounded-md data-[state=active]:bg-background">
            <Code2 className="h-3.5 w-3.5 text-emerald-500" /> SQL Console
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tables" className="flex flex-col md:flex-row gap-6 pt-2">
          <div className="w-full md:w-64 space-y-1.5">
            <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider px-1">
              Tables ({tables?.length || 0})
            </h3>
            {isLoading && <div className="text-xs text-muted-foreground p-2">Loading tables...</div>}
            <div className="space-y-1">
              {tables?.map((t: any) => (
                <div
                  key={t.name}
                  className={`p-2 rounded-lg cursor-pointer flex items-center justify-between text-xs transition-colors ${
                    selectedTable === t.name
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "hover:bg-muted text-foreground/80 hover:text-foreground"
                  }`}
                  onClick={() => setSelectedTable(t.name)}
                >
                  <span className="flex items-center gap-2 truncate font-mono">
                    <TableIcon className="h-3.5 w-3.5 shrink-0" />
                    {t.name}
                  </span>
                  <span className="text-[10px] font-mono opacity-80">{t.columns?.length || 0} cols</span>
                </div>
              ))}
              {tables && tables.length === 0 && (
                <div className="text-xs text-muted-foreground p-4 border border-dashed rounded-xl text-center">
                  No user tables found.
                </div>
              )}
            </div>
          </div>

          <div className="flex-1">
            {selectedTable ? (
              <Card className="border shadow-xs overflow-hidden rounded-xl">
                <CardHeader className="p-4 border-b flex flex-row justify-between items-center space-y-0 bg-muted/20">
                  <div>
                    <CardTitle className="text-base font-bold flex items-center gap-2 font-mono">
                      <TableIcon className="h-4 w-4 text-primary" /> {selectedTable}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">{currentTable?.columns?.length || 0} column definitions</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dialog open={addColumnOpen} onOpenChange={setAddColumnOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="h-8 text-xs gap-1">
                          <Plus className="h-3.5 w-3.5" /> Add Column
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Column to {selectedTable}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddColumn} className="space-y-4 mt-4">
                          <div className="space-y-2">
                            <Label className="text-xs font-medium">Column Name</Label>
                            <Input required placeholder="title, price, description..." value={newColName} onChange={(e) => setNewColName(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-medium">Data Type</Label>
                            <Select value={newColType} onValueChange={setNewColType}>
                              <SelectTrigger className="text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">TEXT</SelectItem>
                                <SelectItem value="varchar(255)">VARCHAR(255)</SelectItem>
                                <SelectItem value="integer">INTEGER</SelectItem>
                                <SelectItem value="bigint">BIGINT</SelectItem>
                                <SelectItem value="boolean">BOOLEAN</SelectItem>
                                <SelectItem value="numeric">NUMERIC / DECIMAL</SelectItem>
                                <SelectItem value="timestamptz">TIMESTAMPTZ</SelectItem>
                                <SelectItem value="jsonb">JSONB</SelectItem>
                                <SelectItem value="uuid">UUID</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center justify-between py-2">
                            <Label htmlFor="nullable" className="text-xs font-medium">Allow Null (Nullable)</Label>
                            <Switch id="nullable" checked={newColNullable} onCheckedChange={setNewColNullable} />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-medium">Default Value (Optional)</Label>
                            <Input placeholder="NOW(), 0, false, 'active'..." value={newColDefault} onChange={(e) => setNewColDefault(e.target.value)} />
                          </div>
                          <Button type="submit" disabled={actionLoading} className="w-full">
                            {actionLoading ? "Adding..." : "Add Column"}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                    <Button size="sm" variant="ghost" className="h-8 text-xs text-destructive hover:bg-destructive/10" onClick={handleDropTable}>
                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Drop Table
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <UITable>
                    <TableHeader className="bg-muted/40">
                      <TableRow>
                        <TableHead className="text-xs">Column Name</TableHead>
                        <TableHead className="text-xs">Postgres Type</TableHead>
                        <TableHead className="text-xs">Nullable</TableHead>
                        <TableHead className="text-right text-xs">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentTable?.columns?.map((c: any) => (
                        <TableRow key={c.name} className="hover:bg-muted/30">
                          <TableCell className="font-mono text-xs font-semibold py-2.5">{c.name}</TableCell>
                          <TableCell><span className="text-[11px] bg-muted/80 border px-1.5 py-0.5 rounded font-mono">{c.type}</span></TableCell>
                          <TableCell className="text-xs text-muted-foreground">{c.nullable ? "Yes" : "No"}</TableCell>
                          <TableCell className="text-right py-2">
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive/80 hover:text-destructive hover:bg-destructive/10" onClick={() => handleDropColumn(c.name)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </UITable>
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground border rounded-xl border-dashed p-6 text-center">
                <TableIcon className="h-8 w-8 mb-2 opacity-40 text-primary" />
                <p className="text-sm font-medium text-foreground">Select a table</p>
                <p className="text-xs text-muted-foreground mt-1">Choose a table on the left to view and modify columns, or create a new table.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="sql" className="pt-2">
          <Card className="border shadow-xs overflow-hidden rounded-xl">
            <CardHeader className="p-4 border-b flex flex-row items-center justify-between bg-muted/20">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Code2 className="h-4 w-4 text-emerald-500" /> Direct SQL Query Runner
              </CardTitle>
              <Button size="sm" onClick={handleRunSQL} disabled={sqlRunning} className="h-8 text-xs gap-1.5">
                <Play className="h-3.5 w-3.5" /> {sqlRunning ? "Executing..." : "Execute Query"}
              </Button>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <textarea
                className="w-full h-36 p-3.5 font-mono text-xs border rounded-xl bg-zinc-950 text-emerald-400 focus:outline-none focus:ring-1 focus:ring-primary shadow-inner leading-relaxed"
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                placeholder="SELECT * FROM my_table LIMIT 10;"
              />
              {sqlResults && (
                <div className="border rounded-xl overflow-hidden shadow-xs">
                  <div className="bg-muted/60 px-3.5 py-2 text-xs font-semibold text-muted-foreground border-b flex items-center justify-between">
                    <span>Query Results</span>
                    <span className="font-mono text-[11px] bg-background px-2 py-0.5 rounded border">{sqlResults.length} rows</span>
                  </div>
                  {sqlResults.length > 0 ? (
                    <div className="overflow-x-auto max-h-96">
                      <UITable>
                        <TableHeader className="bg-muted/30">
                          <TableRow>
                            {Object.keys(sqlResults[0]).map((key) => (
                              <TableHead key={key} className="text-xs font-mono py-2">{key}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sqlResults.slice(0, 100).map((row, idx) => (
                            <TableRow key={idx} className="hover:bg-muted/30">
                              {Object.keys(sqlResults[0]).map((key) => (
                                <TableCell key={key} className="max-w-[240px] truncate text-xs font-mono py-2">
                                  {typeof row[key] === "object" ? JSON.stringify(row[key]) : String(row[key] ?? "NULL")}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </UITable>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-muted-foreground">0 rows returned</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
