import * as React from "react";
import Link from "next/link";
import { env } from "@/lib/env";
import { Github, Twitter, Database, Shield, FileText } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 bg-card/20 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center">
              <span className="text-2xl font-black tracking-tight text-white">
                {env.appName}
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              {env.appTagline}. 100% gratis en self-hosting, o administrado en cloud. APIs REST automáticas, SSE realtime, auth JWT y dashboard web.
            </p>
            <div className="flex items-center gap-4 text-muted-foreground pt-2">
              <a
                href={env.githubRepo}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors p-2 rounded-lg bg-secondary/40 hover:bg-secondary"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors p-2 rounded-lg bg-secondary/40 hover:bg-secondary"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href={env.dashboardUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors p-2 rounded-lg bg-secondary/40 hover:bg-secondary"
                aria-label="Dashboard"
              >
                <Database className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-4">
              Producto
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link href="#features" className="hover:text-foreground transition-colors">
                  Características
                </Link>
              </li>
              <li>
                <Link href="#interactive-demo" className="hover:text-foreground transition-colors">
                  API Playground
                </Link>
              </li>
              <li>
                <Link href="#comparison" className="hover:text-foreground transition-colors">
                  Self-Host vs Cloud
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="hover:text-foreground transition-colors">
                  Precios y Planes
                </Link>
              </li>
              <li>
                <Link href="#faq" className="hover:text-foreground transition-colors">
                  Preguntas Frecuentes
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-4">
              Desarrolladores
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <a href={env.githubRepo} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                  Repositorio GitHub
                </a>
              </li>
              <li>
                <a href={env.docsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                  Documentación
                </a>
              </li>
              <li>
                <a href="#quick-start" className="hover:text-foreground transition-colors">
                  Instalación Docker
                </a>
              </li>
              <li>
                <a href={`${env.apiUrl}/metrics`} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                  Métricas Prometheus
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-4">
              Legal y Confianza
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-blue-400" />
                  <span>Política de Privacidad</span>
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground transition-colors flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-blue-400" />
                  <span>Términos y Condiciones</span>
                </Link>
              </li>
              <li>
                <a href={env.githubRepo} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                  Licencia Open Source
                </a>
              </li>
              <li>
                <Link href="/sitemap.xml" className="hover:text-foreground transition-colors">
                  Sitemap
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {currentYear} {env.appName}. Todos los derechos reservados.</p>
          <p className="flex items-center gap-2">
            <span>Hecho para desarrolladores que aman</span>
            <span className="font-semibold text-blue-400">PostgreSQL</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
