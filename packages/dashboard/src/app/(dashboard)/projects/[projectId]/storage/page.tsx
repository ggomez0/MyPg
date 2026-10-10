"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { use } from "react";
import { FileText, Upload } from "lucide-react";

export default function StoragePage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const { data: files } = useQuery({
    queryKey: ["storage", projectId],
    queryFn: () => api.storage.list(projectId),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> Storage & Files
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Store and serve media, documents, and public assets
          </p>
        </div>
        <Button size="sm" className="h-8 text-xs gap-1.5 w-full sm:w-auto">
          <Upload className="h-3.5 w-3.5" /> Upload File
        </Button>
      </div>

      <Card className="rounded-xl border shadow-xs overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="text-xs">Size</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-right text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files?.map((f: any) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium text-xs truncate max-w-[200px]">{f.filename}</TableCell>
                    <TableCell className="text-xs font-mono">{Math.round(f.size / 1024)} KB</TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{f.mimetype}</TableCell>
                    <TableCell className="text-right space-x-1 whitespace-nowrap">
                      <Button size="sm" variant="outline" className="h-7 text-xs">Copy URL</Button>
                      <Button size="sm" variant="destructive" className="h-7 text-xs">Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!files || files.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-xs text-muted-foreground">
                      No files uploaded yet.
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
