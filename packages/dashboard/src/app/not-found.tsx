"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Database, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-2">
          <Database className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-6xl font-black tracking-tight text-foreground">404</h1>
          <h2 className="text-xl font-semibold text-foreground">Page Not Found</h2>
          <p className="text-sm text-muted-foreground">
            The resource, table, or database page you are trying to access does not exist or has been relocated.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="outline" size="sm" asChild className="gap-2">
            <Link href="javascript:history.back()">
              <ArrowLeft className="w-4 h-4" /> Go Back
            </Link>
          </Button>
          <Button size="sm" asChild className="gap-2">
            <Link href="/projects">
              <Home className="w-4 h-4" /> Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
