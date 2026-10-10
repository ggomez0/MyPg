import type { Metadata } from "next";
import "./globals.css";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: `${env.appName} - ${env.appTagline}`,
  description:
    "Open-source PostgreSQL Backend-as-a-Service. Auto-generated REST API, JWT & RBAC auth, realtime SSE, file storage, and modern web studio.",
  metadataBase: new URL(env.siteUrl),
  keywords: [
    "PostgreSQL",
    "Backend as a Service",
    "BaaS",
    "REST API",
    "Supabase alternative",
    "PocketBase",
    "Realtime",
    "Self-hosted",
    "Hono",
    "Next.js",
  ],
  authors: [{ name: "MyPg Team" }],
  openGraph: {
    title: `${env.appName} - ${env.appTagline}`,
    description:
      "Auto-generated REST API, auth, realtime, storage, and admin dashboard for PostgreSQL.",
    url: env.siteUrl,
    siteName: env.appName,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${env.appName} - ${env.appTagline}`,
    description:
      "Auto-generated REST API, auth, realtime, storage, and admin dashboard for PostgreSQL.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-blue-600/30 selection:text-blue-300">
        {children}
      </body>
    </html>
  );
}
