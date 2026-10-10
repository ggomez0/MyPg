"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Check, Terminal, Cloud } from "lucide-react";

export function Comparison() {
  const points = [
    {
      feature: "Costo de licencia",
      selfHosted: "100% Gratis (Open Source)",
      cloud: "$5 / mes",
    },
    {
      feature: "Base de Datos",
      selfHosted: "PostgreSQL 16 en tu servidor",
      cloud: "PostgreSQL 16 administrado y afinado",
    },
    {
      feature: "Dashboard Web GUI",
      selfHosted: "Incluido en tu propio contenedor",
      cloud: "Hosteado en dominio seguro con SSL",
    },
    {
      feature: "Despliegue",
      selfHosted: "1 comando curl o docker-compose",
      cloud: "Instantáneo en 1 click",
    },
    {
      feature: "Backups",
      selfHosted: "Manuales o vía tus propios scripts",
      cloud: "Automáticos diarios y restaurables",
    },
    {
      feature: "Mantenimiento del servidor",
      selfHosted: "Administrado por vos",
      cloud: "100% administrado por nosotros",
    },
    {
      feature: "Propiedad de los datos",
      selfHosted: "En tu hardware o VPS privado",
      cloud: "Cluster aislado con export pg_dump",
    },
  ];

  return (
    <section id="comparison" className="py-20 md:py-28 relative">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge variant="gradient" className="mb-3">
            Comparativa Directa
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            ¿Self-Hosted o Managed Cloud?
          </h2>
          <p className="mt-4 text-muted-foreground text-base sm:text-lg">
            La misma potencia de PostgreSQL y las mismas APIs, adaptadas a cómo preferís trabajar.
          </p>
        </div>

        <div className="rounded-2xl border border-border/80 bg-slate-950/80 shadow-2xl backdrop-blur-xl overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/60 bg-slate-900/60 text-xs uppercase tracking-wider text-muted-foreground font-mono">
                <th className="py-4 px-6 font-semibold">Característica</th>
                <th className="py-4 px-6 font-semibold text-foreground">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-muted-foreground" />
                    <span>Self-Hosted (Gratis)</span>
                  </div>
                </th>
                <th className="py-4 px-6 font-bold text-blue-400 bg-blue-500/10 border-l border-blue-500/20">
                  <div className="flex items-center gap-2">
                    <Cloud className="h-4 w-4 text-blue-400" />
                    <span>Managed Cloud ($5/mes)</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-sm">
              {points.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-900/30 transition-colors">
                  <td className="py-4 px-6 font-medium text-foreground">
                    {row.feature}
                  </td>
                  <td className="py-4 px-6 text-muted-foreground">
                    {row.selfHosted}
                  </td>
                  <td className="py-4 px-6 font-medium text-blue-300 bg-blue-500/5 border-l border-blue-500/20">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>{row.cloud}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
