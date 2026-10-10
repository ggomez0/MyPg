"use client";

import * as React from "react";
import Link from "next/link";
import { PostgresLogo } from "@/components/ui/postgres-logo";
import { Button } from "@/components/ui/button";
import { env } from "@/lib/env";
import { Github, ArrowRight, Menu, X } from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <PostgresLogo className="h-5 w-5 text-blue-400 group-hover:scale-105 transition-transform" />
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors">
              {env.appName}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#interactive-demo" className="hover:text-foreground transition-colors">
              API Sandbox
            </Link>
            <Link href="#comparison" className="hover:text-foreground transition-colors">
              Self-Host vs Cloud
            </Link>
            <Link href="#pricing" className="hover:text-foreground transition-colors">
              Precios
            </Link>
            <Link href="#faq" className="hover:text-foreground transition-colors">
              FAQ
            </Link>
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <a
            href={env.githubRepo}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/70 text-muted-foreground hover:bg-secondary/60 hover:text-foreground transition-colors"
            aria-label="GitHub Repository"
          >
            <Github className="h-4 w-4" />
          </a>

          <a href={env.dashboardUrl} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="outline" className="text-xs">
              Dashboard
            </Button>
          </a>

          <a href="#quick-start">
            <Button size="sm" variant="glow" className="gap-2 text-xs">
              <span>Instalar Gratis</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </a>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg border border-border/80 text-muted-foreground hover:text-foreground"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border/60 bg-background/95 px-4 py-6 backdrop-blur-2xl">
          <nav className="flex flex-col space-y-4 text-base font-medium text-muted-foreground">
            <Link
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="#interactive-demo"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-foreground transition-colors"
            >
              API Sandbox
            </Link>
            <Link
              href="#comparison"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-foreground transition-colors"
            >
              Self-Host vs Cloud
            </Link>
            <Link
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-foreground transition-colors"
            >
              Precios
            </Link>
            <Link
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-foreground transition-colors"
            >
              FAQ
            </Link>
            <div className="pt-4 flex flex-col gap-3">
              <a href={env.githubRepo} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full gap-2">
                  <Github className="h-4 w-4" />
                  GitHub Repository
                </Button>
              </a>
              <a href={env.dashboardUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" className="w-full">
                  Acceder a Dashboard
                </Button>
              </a>
              <a href="#quick-start" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="glow" className="w-full gap-2">
                  <span>Instalar Gratis</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
