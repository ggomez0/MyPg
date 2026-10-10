import * as React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
import { env } from "@/lib/env";

export const metadata = {
  title: "Terms of Service | MyPg",
  description: "Terms and conditions of service for MyPg Backend as a Service.",
};

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>

          <div className="mb-12">
            <Badge variant="gradient" className="mb-4">
              <FileText className="h-3 w-3 mr-1" />
              Terms of Agreement
            </Badge>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Terms of Service
            </h1>
            <p className="mt-3 text-sm text-muted-foreground font-mono">
              Last Updated: October 8, 2026
            </p>
          </div>

          <div className="prose prose-invert max-w-none space-y-8 text-slate-300 leading-relaxed">
            <section className="rounded-2xl border border-border/70 bg-card/40 p-6 md:p-8 backdrop-blur-md">
              <h2 className="text-xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
              <p>
                By downloading, deploying, or utilizing {env.appName} or its hosted cloud platforms, you agree to comply with and be bound by these Terms of Service. If you disagree with any part of these terms, you should discontinue use of the software.
              </p>
            </section>

            <section className="rounded-2xl border border-border/70 bg-card/40 p-6 md:p-8 backdrop-blur-md">
              <h2 className="text-xl font-bold text-white mb-3">2. Open Source License &amp; Self-Hosting</h2>
              <p>
                The core source code of {env.appName} is provided under the terms of its open-source license. You are permitted to inspect, modify, fork, and self-host {env.appName} on your own hardware or cloud providers subject to the license conditions.
              </p>
            </section>

            <section className="rounded-2xl border border-border/70 bg-card/40 p-6 md:p-8 backdrop-blur-md">
              <h2 className="text-xl font-bold text-white mb-3">3. Acceptable Use</h2>
              <p>
                You agree not to use {env.appName} to conduct unlawful activities, transmit malicious code, violate intellectual property rights, or compromise the integrity of networked systems.
              </p>
            </section>

            <section className="rounded-2xl border border-border/70 bg-card/40 p-6 md:p-8 backdrop-blur-md">
              <h2 className="text-xl font-bold text-white mb-3">4. Disclaimer of Warranties</h2>
              <p>
                The software is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis, without warranties of any kind, whether express or implied. Under no circumstances shall the authors or copyright holders be liable for any claim, damages, or data loss arising from the use of the software.
              </p>
            </section>

            <section className="rounded-2xl border border-border/70 bg-card/40 p-6 md:p-8 backdrop-blur-md">
              <h2 className="text-xl font-bold text-white mb-3">5. Modifications to Terms</h2>
              <p>
                We reserve the right to revise or update these terms at any time. Continued use of the service following modifications constitutes acceptance of the updated terms.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
