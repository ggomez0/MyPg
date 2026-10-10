"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Zap, Timer, Cpu, HardDrive } from "lucide-react";

export function Benchmarks() {
  const metrics = [
    {
      label: "Throughput (RPS)",
      value: "45,000+",
      sub: "Hono HTTP engine on single 4-core node",
      icon: Zap,
      color: "text-amber-400",
    },
    {
      label: "P99 Response Time",
      value: "1.8 ms",
      sub: "Prepared SQL statements on connection pool",
      icon: Timer,
      color: "text-emerald-400",
    },
    {
      label: "Base Memory Usage",
      value: "68 MB",
      sub: "Lightweight runtime footprint",
      icon: Cpu,
      color: "text-blue-400",
    },
    {
      label: "Docker Image Size",
      value: "42 MB",
      sub: "Zero bloat Alpine base layer",
      icon: HardDrive,
      color: "text-purple-400",
    },
  ];

  return (
    <section className="py-20 md:py-28 relative border-y border-border/40 bg-card/20 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="gradient" className="mb-4">
            Raw Performance
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Fast by architecture, not by accident.
          </h2>
          <p className="mt-4 text-muted-foreground text-base">
            Benchmarked against high-concurrency workloads using autocannon and pgbench.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-md flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    {item.label}
                  </span>
                  <Icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
                    {item.value}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.sub}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
