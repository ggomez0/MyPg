"use client";

import * as React from "react";
import { QuickInstall } from "@/components/landing/quick-install";
import { env } from "@/lib/env";
import {
  Zap,
  Database,
  Radio,
  ShieldCheck,
} from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-600/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-5xl mx-auto leading-[1.1]">
          <span>Tu backend completo sobre </span>
          <span className="text-blue-500">PostgreSQL</span>.
        </h1>

        <p className="mt-6 text-lg sm:text-2xl text-slate-300 font-medium max-w-3xl mx-auto leading-relaxed">
          Self-hostealo <span className="text-blue-400 font-bold">100% gratis</span> en tu servidor, o dejanos hostearte la base de datos y el dashboard.
        </p>

        <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          {env.appName} transforma cualquier tabla de Postgres en una API REST instantánea con autenticación JWT, RBAC, SSE realtime, almacenamiento y un dashboard web moderno.
        </p>

        <div className="mt-10" id="quick-start">
          <QuickInstall />
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto border-t border-border/40 pt-10 text-left">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-card/30 border border-border/40">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Velocidad</p>
              <p className="text-base font-bold text-foreground">&lt; 3ms P95</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-card/30 border border-border/40">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Motor</p>
              <p className="text-base font-bold text-foreground">Postgres 16</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-card/30 border border-border/40">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
              <Radio className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Realtime</p>
              <p className="text-base font-bold text-foreground">LISTEN / NOTIFY</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-card/30 border border-border/40">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Seguridad</p>
              <p className="text-base font-bold text-foreground">RBAC &amp; RLS</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
