import * as React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";
import { env } from "@/lib/env";

export const metadata = {
  title: "Privacy Policy | MyPg",
  description: "Privacy Policy and data governance for MyPg.",
};

export default function PrivacyPage() {
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
              <Shield className="h-3 w-3 mr-1" />
              Legal &amp; Privacy
            </Badge>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Privacy Policy
            </h1>
            <p className="mt-3 text-sm text-muted-foreground font-mono">
              Last Updated: October 8, 2026
            </p>
          </div>

          <div className="prose prose-invert max-w-none space-y-8 text-slate-300 leading-relaxed">
            <section className="rounded-2xl border border-border/70 bg-card/40 p-6 md:p-8 backdrop-blur-md">
              <h2 className="text-xl font-bold text-white mb-3">1. Information We Collect</h2>
              <p>
                When using {env.appName} in a self-hosted environment, all database data, telemetry, and uploaded assets remain completely within your own infrastructure. {env.appName} does not transmit your database contents to external servers.
              </p>
              <p className="mt-3">
                For users participating in cloud waitlists or managed cloud services, we collect account contact information (such as email address) strictly to facilitate account authentication and product updates.
              </p>
            </section>

            <section className="rounded-2xl border border-border/70 bg-card/40 p-6 md:p-8 backdrop-blur-md">
              <h2 className="text-xl font-bold text-white mb-3">2. How We Use Information</h2>
              <p>
                We use collected contact information strictly to:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-muted-foreground">
                <li>Provide early access invitations and account authorization.</li>
                <li>Send critical security advisories, bug fixes, and patch notices.</li>
                <li>Analyze system performance metrics through opt-in Prometheus endpoints.</li>
              </ul>
            </section>

            <section className="rounded-2xl border border-border/70 bg-card/40 p-6 md:p-8 backdrop-blur-md">
              <h2 className="text-xl font-bold text-white mb-3">3. Database Ownership &amp; Data Security</h2>
              <p>
                You retain complete, exclusive ownership of any data stored within your PostgreSQL instance. {env.appName} enforces standard cryptographic measures including Argon2 password hashing, JWT token signature validation, and optional Row-Level Security (RLS) policies.
              </p>
            </section>

            <section className="rounded-2xl border border-border/70 bg-card/40 p-6 md:p-8 backdrop-blur-md">
              <h2 className="text-xl font-bold text-white mb-3">4. Third-Party Integrations</h2>
              <p>
                When configuring third-party providers such as S3-compatible object storage (AWS, MinIO) or authentication providers (Clerk), your credentials are used solely to establish authenticated sessions according to your configuration in the environment variables.
              </p>
            </section>

            <section className="rounded-2xl border border-border/70 bg-card/40 p-6 md:p-8 backdrop-blur-md">
              <h2 className="text-xl font-bold text-white mb-3">5. Contact Information</h2>
              <p>
                For questions regarding this policy or data inquiries, reach out to security@{env.appName.toLowerCase()}.dev or open an issue on our GitHub repository.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
