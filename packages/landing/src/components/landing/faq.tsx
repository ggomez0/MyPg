"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";

export function FAQ() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  const faqs = [
    {
      q: "¿Es realmente 100% gratis en self-hosting?",
      a: "Sí, completamente. Todo el código de MyPg es open source. Podés correrlo en tu propia computadora, VPS o servidor dedicado mediante Docker. No hay límites de tablas, registros, usuarios ni llamadas a la API.",
    },
    {
      q: "¿Qué incluye si elijo la opción de Cloud Administrado ($5/mes)?",
      a: "Nosotros aprovisionamos y mantenemos tu base de datos PostgreSQL 16 dedicada junto con el Dashboard web y la API REST. Incluye backups diarios automáticos, certificado SSL en tu dominio, monitoreo 24/7 y cero preocupación por mantener Linux o Docker.",
    },
    {
      q: "¿Puedo migrar fácilmente de self-hosting a cloud (o al revés)?",
      a: "Sí. Como MyPg utiliza PostgreSQL estándar sin capas propietarias, podés exportar o importar tus datos en cualquier momento utilizando pg_dump y pg_restore estándar.",
    },
    {
      q: "¿Qué servidor necesito para autohostearlo?",
      a: "MyPg está construido sobre Hono y TypeScript compilado, lo que resulta en un consumo en reposo inferior a 70MB de memoria RAM. Funciona de manera fluida en cualquier VPS económico de 1 vCPU y 1GB de RAM.",
    },
    {
      q: "¿Cómo genera MyPg las APIs REST desde la base de datos?",
      a: "MyPg inspecciona el esquema de PostgreSQL en tiempo real. En cuanto creás o modificás una tabla, se publican automáticamente endpoints REST parametrizados con soporte para filtros, paginación, ordenamiento y proyección de campos.",
    },
  ];

  return (
    <section id="faq" className="py-20 md:py-28 relative">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <Badge variant="gradient" className="mb-3">
            Preguntas Frecuentes
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Todo lo que necesitás saber
          </h2>
          <p className="mt-4 text-muted-foreground text-base sm:text-lg">
            Respuestas directas sobre self-hosting, cloud administrado y arquitectura.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-border/70 bg-card/40 backdrop-blur-md overflow-hidden transition-colors hover:border-border"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="text-base sm:text-lg font-semibold text-foreground">
                    {faq.q}
                  </span>
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary/60 text-muted-foreground transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-blue-400" : ""
                    }`}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-0 text-sm sm:text-base text-muted-foreground leading-relaxed border-t border-border/30 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
