import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";
import { env } from "@/lib/env";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center text-foreground">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-blue-600/10 blur-[100px] pointer-events-none rounded-full" />

      <div className="relative z-10 max-w-md mx-auto space-y-6">
        <div>
          <span className="text-3xl font-black text-white tracking-tight">
            {env.appName}
          </span>
        </div>

        <div>
          <span className="text-sm font-mono font-bold text-blue-400 uppercase tracking-widest">
            Error 404
          </span>
          <h1 className="mt-2 text-4xl sm:text-5xl font-black tracking-tight text-white">
            Table Not Found
          </h1>
          <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
            The route or resource you are looking for does not exist in the {env.appName} catalog. It may have been dropped or migrated.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/">
            <Button variant="glow" size="lg" className="gap-2 w-full sm:w-auto">
              <Home className="h-4 w-4" />
              <span>Return Home</span>
            </Button>
          </Link>

          <a href={env.dashboardUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto">
              <Search className="h-4 w-4" />
              <span>Open Dashboard</span>
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
