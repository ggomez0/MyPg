"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Sparkles, Terminal, Cloud } from "lucide-react";
import { env } from "@/lib/env";

export function Pricing() {
  return (
    <section id="pricing" className="py-20 md:py-28 relative">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge variant="gradient" className="mb-3">
            Precios Claros
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Dos formas simples de usar MyPg
          </h2>
          <p className="mt-4 text-muted-foreground text-base sm:text-lg">
            Gratis para siempre si lo corrés en tu servidor, o dejanos la infraestructura a nosotros.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          <div className="relative flex flex-col justify-between rounded-3xl border border-border/80 bg-card/40 p-8 backdrop-blur-xl transition-all duration-300 hover:border-border">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                    <Terminal className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">
                    Self-Hosted
                  </h3>
                </div>
                <Badge variant="outline" className="text-xs font-mono">
                  100% Free
                </Badge>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black text-white">
                    $0
                  </span>
                  <span className="text-sm text-muted-foreground">
                    / para siempre
                  </span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  Descargalo y corré tu propio PostgreSQL, REST API y Dashboard con un solo comando Docker.
                </p>
              </div>

              <div className="my-6 border-t border-border/40" />

              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-3 text-slate-300">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <span>Código 100% abierto y auditable</span>
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <span>PostgreSQL 16 + API REST + Dashboard GUI</span>
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <span>Sin límites de filas, tablas o requests</span>
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <span>Auth JWT, RBAC y Realtime SSE activos</span>
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <span>Tus datos en tu propio VPS o bare metal</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4">
              <a href="#quick-start" className="block">
                <Button variant="outline" size="lg" className="w-full gap-2 justify-center">
                  <span>Instalar con 1 comando</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>

          <div className="relative flex flex-col justify-between rounded-3xl border-2 border-blue-500 bg-slate-950/90 p-8 backdrop-blur-xl shadow-2xl shadow-blue-500/15 md:-translate-y-1 transition-all duration-300">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-1 text-xs font-semibold text-white shadow-lg">
                <Sparkles className="h-3.5 w-3.5" />
                Managed Cloud
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
                    <Cloud className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">
                    Hosteado por nosotros
                  </h3>
                </div>
                <Badge variant="gradient" className="text-xs font-mono">
                  Zero DevOps
                </Badge>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black text-white">
                    $5
                  </span>
                  <span className="text-sm text-muted-foreground">
                    / mes por proyecto
                  </span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  Nosotros nos encargamos del servidor: PostgreSQL dedicado, Dashboard web en tu dominio y backups diarios.
                </p>
              </div>

              <div className="my-6 border-t border-border/40" />

              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-3 text-slate-300">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <span>PostgreSQL 16 dedicado y optimizado</span>
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <span>Dashboard web y API listos en 30 segundos</span>
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <span>Backups automáticos diarios punto en el tiempo</span>
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <span>Dominio personalizado con SSL automático</span>
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <span>Cero mantenimiento de Linux, Docker o parches</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4">
              <a href="#waitlist" className="block">
                <Button variant="glow" size="lg" className="w-full gap-2 justify-center">
                  <span>Pedir acceso a Cloud</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
