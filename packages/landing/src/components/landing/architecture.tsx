"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Database,
  Server,
  Layers,
  Radio,
  HardDrive,
  ShieldCheck,
  Cpu,
  ArrowRight,
  Globe,
  Sparkles,
} from "lucide-react";

export function Architecture() {
  const layers = [
    {
      title: "Client Apps & SDKs",
      desc: "Web, Mobile, Node.js, CLI, Microservices",
      icon: Globe,
      color: "from-sky-500/20 to-blue-500/20 text-sky-400 border-sky-500/30",
    },
    {
      title: "MyPg API Core (Hono + TypeScript)",
      desc: "Dynamic schema reflection, JWT authentication, RBAC, query parser, Prometheus telemetry",
      icon: Cpu,
      color: "from-blue-600/20 to-indigo-600/20 text-blue-400 border-blue-500/40",
    },
    {
      title: "Realtime Broker & Storage Engine",
      desc: "PostgreSQL LISTEN/NOTIFY SSE channels + MinIO/S3 bucket file handlers",
      icon: Radio,
      color: "from-indigo-500/20 to-purple-500/20 text-indigo-400 border-indigo-500/30",
    },
    {
      title: "PostgreSQL 16 Database Core",
      desc: "Relational tables, foreign keys, ACID transactions, RLS policies, standard SQL",
      icon: Database,
      color: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30",
    },
  ];

  return (
    <section id="architecture" className="py-20 md:py-32 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="gradient" className="mb-4">
            Under The Hood
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Minimalist footprint. Maximum throughput.
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Engineered on lightweight modern foundations without heavy virtual machines or bloated multi-container microservices.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {layers.map((layer, index) => {
            const Icon = layer.icon;
            return (
              <div key={index} className="flex flex-col items-center">
                <div
                  className={`w-full rounded-2xl border bg-gradient-to-r p-6 backdrop-blur-md shadow-lg transition-all hover:scale-[1.01] ${layer.color}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-background/60 border border-border/60">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground">
                          {layer.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {layer.desc}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="w-fit text-xs font-mono">
                      Layer 0{index + 1}
                    </Badge>
                  </div>
                </div>

                {index < layers.length - 1 && (
                  <div className="h-6 w-0.5 bg-gradient-to-b from-blue-500/50 to-transparent my-1" />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="rounded-xl border border-border/60 bg-card/40 p-5 text-center">
            <h4 className="text-2xl font-bold text-foreground">50MB</h4>
            <p className="text-xs text-muted-foreground mt-1">Lightweight Docker footprint</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-card/40 p-5 text-center">
            <h4 className="text-2xl font-bold text-foreground">&lt; 15ms</h4>
            <p className="text-xs text-muted-foreground mt-1">Cold boot startup speed</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-card/40 p-5 text-center">
            <h4 className="text-2xl font-bold text-foreground">0% Lock-in</h4>
            <p className="text-xs text-muted-foreground mt-1">Export standard pg_dump anytime</p>
          </div>
        </div>
      </div>
    </section>
  );
}
