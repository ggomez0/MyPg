"use client";

import * as React from "react";
import { Terminal, Copy, Check, ExternalLink } from "lucide-react";
import { env } from "@/lib/env";

export function QuickInstall() {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);
  const [activeTab, setActiveTab] = React.useState<"oneline" | "steps">("oneline");

  const onelineCmd = env.installCmd;
  const step1Cmd = "git clone https://github.com/ggomez0/MyPg.git && cd MyPg";
  const step2Cmd = "docker compose up -d";

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto rounded-2xl border border-border/80 bg-slate-950/90 shadow-2xl backdrop-blur-xl overflow-hidden">
      <div className="flex items-center justify-between border-b border-border/40 px-4 py-3 bg-slate-900/60">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-rose-500/80" />
          <div className="h-3 w-3 rounded-full bg-amber-500/80" />
          <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
          <span className="ml-2 text-xs font-mono text-muted-foreground flex items-center gap-1.5">
            <Terminal className="h-3.5 w-3.5 text-blue-400" />
            Terminal
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("oneline")}
            className={`px-3 py-1 text-xs font-mono rounded-md transition-colors ${
              activeTab === "oneline"
                ? "bg-blue-600/30 text-blue-300 font-semibold border border-blue-500/40"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            1 Comando
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("steps")}
            className={`px-3 py-1 text-xs font-mono rounded-md transition-colors ${
              activeTab === "steps"
                ? "bg-blue-600/30 text-blue-300 font-semibold border border-blue-500/40"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Paso a Paso
          </button>
        </div>
      </div>

      <div className="p-5 font-mono text-xs sm:text-sm">
        {activeTab === "oneline" ? (
          <div className="flex items-center justify-between gap-3 text-slate-200">
            <div className="flex items-center gap-3 overflow-x-auto py-1">
              <span className="text-blue-400 select-none font-bold">$</span>
              <span className="whitespace-nowrap">{onelineCmd}</span>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(onelineCmd, 0)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-slate-900 text-muted-foreground hover:bg-slate-800 hover:text-white transition-colors"
              title="Copiar comando"
            >
              {copiedIndex === 0 ? (
                <Check className="h-4 w-4 text-emerald-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 overflow-x-auto py-1 text-slate-200">
                <span className="text-muted-foreground text-xs select-none">Paso 1:</span>
                <span className="text-blue-400 select-none font-bold">$</span>
                <span className="whitespace-nowrap">{step1Cmd}</span>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(step1Cmd, 1)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-slate-900 text-muted-foreground hover:bg-slate-800 hover:text-white transition-colors"
                title="Copiar paso 1"
              >
                {copiedIndex === 1 ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-border/30 pt-3">
              <div className="flex items-center gap-3 overflow-x-auto py-1 text-slate-200">
                <span className="text-muted-foreground text-xs select-none">Paso 2:</span>
                <span className="text-blue-400 select-none font-bold">$</span>
                <span className="whitespace-nowrap">{step2Cmd}</span>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(step2Cmd, 2)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-slate-900 text-muted-foreground hover:bg-slate-800 hover:text-white transition-colors"
                title="Copiar paso 2"
              >
                {copiedIndex === 2 ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-border/40 flex flex-wrap items-center justify-between text-xs text-muted-foreground gap-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Listo para usar:</span>
          </div>
          <div className="flex items-center gap-3 font-mono">
            <span className="text-slate-300">Dashboard: <strong className="text-blue-400 font-normal">localhost:3000</strong></span>
            <span>•</span>
            <span className="text-slate-300">API: <strong className="text-blue-400 font-normal">localhost:4000</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
