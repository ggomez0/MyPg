"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WaitlistForm } from "@/components/landing/waitlist-form";
import { env } from "@/lib/env";
import { ArrowRight, Github, Sparkles, Terminal, Cloud } from "lucide-react";

export function CTA() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/20 to-transparent pointer-events-none" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-blue-500/30 bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-8 sm:p-14 text-center backdrop-blur-2xl shadow-2xl shadow-blue-500/10">
          <Badge variant="gradient" className="mb-6">
            <Sparkles className="h-3 w-3 mr-1" />
            Empezá en 60 Segundos
          </Badge>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white max-w-2xl mx-auto leading-tight">
            Elegí cómo querés correr tu backend
          </h2>

          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Corré el comando de instalación gratis en tu servidor o pedí acceso a Cloud para que hosteemos la base de datos y el dashboard por vos.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a href="#quick-start">
              <Button size="lg" variant="glow" className="gap-2">
                <Terminal className="h-4 w-4" />
                <span>Instalar Gratis (Self-Host)</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </a>

            <a href={env.githubRepo} target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="gap-2">
                <Github className="h-4 w-4" />
                <span>Ver en GitHub</span>
              </Button>
            </a>
          </div>

          <div className="mt-10 pt-10 border-t border-border/40">
            <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-4">
              ¿Querés que lo hosteemos nosotros? Dejanos tu email para acceso anticipado a Cloud
            </p>
            <WaitlistForm />
          </div>
        </div>
      </div>
    </section>
  );
}
