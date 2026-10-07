"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { use } from "react";

export default function StoragePage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const { data: files } = useQuery({
    queryKey: ["storage", projectId],
    queryFn: () => api.storage.list(projectId),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Storage</h1>
        <Button>Upload File</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files?.map((f: any) => (
                <TableRow key={f.id}>
                  <TableCell>{f.filename}</TableCell>
                  <TableCell>{Math.round(f.size / 1024)} KB</TableCell>
                  <TableCell>{f.mimetype}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" variant="outline">Copy URL</Button>
                    <Button size="sm" variant="destructive">Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!files || files.length === 0) && (
                <TableRow><TableCell colSpan={4} className="text-center py-8">No files uploaded.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
