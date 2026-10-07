import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-16 px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
              <FileText className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Terms of Service</h1>
          </div>
          <Button variant="outline" size="sm" asChild className="gap-2">
            <Link href="/projects">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
          </Button>
        </div>

        <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p>
              By installing, deploying, or utilizing the MyPg platform, you agree to comply with and be bound by these Terms of Service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">2. Permitted Use & Database Operations</h2>
            <p>
              You are solely responsible for database commands, schema migrations, and write operations executed through the MyPg SQL console or REST APIs against your production database clusters.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">3. Limitation of Liability</h2>
            <p>
              In no event shall MyPg or its authors be liable for any direct, indirect, incidental, or consequential damages resulting from data loss, server downtime, or unauthorized access to unmanaged ports.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
