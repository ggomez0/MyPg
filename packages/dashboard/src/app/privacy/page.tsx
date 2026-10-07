import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-16 px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
              <Shield className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Privacy Policy</h1>
          </div>
          <Button variant="outline" size="sm" asChild className="gap-2">
            <Link href="/projects">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
          </Button>
        </div>

        <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">1. Data Storage and Processing</h2>
            <p>
              MyPg is a self-hosted PostgreSQL management and BaaS platform. All database credentials, project data, and query logs are stored directly on your configured PostgreSQL host. We do not transmit or sell your internal databases to any third party.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">2. Query Logging and Telemetry</h2>
            <p>
              Real-time query inspection processes statements directly from your PostgreSQL container log stream or metadata tables strictly within your own server infrastructure. Query logs are never sent to external analytic servers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">3. Authentication and Security</h2>
            <p>
              Administrative sessions are authenticated via industry-standard cryptographically signed JWT tokens stored securely on your browser. Passwords are hash-verified with argon2.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">4. Contact & Inquiries</h2>
            <p>
              For security reports or inquiries regarding your deployment, contact your system administrator.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
