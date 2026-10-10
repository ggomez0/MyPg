"use client";

import * as React from "react";
import {
  Zap,
  LayoutDashboard,
  Shield,
  KeyRound,
  Radio,
  HardDrive,
  Activity,
  Server,
  Lock,
  Code2,
  Cpu,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Code2,
    badge: "Instant CRUD",
    title: "Auto-Generated REST API",
    description:
      "Every PostgreSQL table immediately becomes an optimized JSON REST endpoint with filtering, deep sorting, pagination, and field projection out of the box.",
  },
  {
    icon: LayoutDashboard,
    badge: "Next.js 15 UI",
    title: "Admin Dashboard & Studio",
    description:
      "A modern web interface to create collections, manage column types, browse records, run raw SQL queries, and inspect real-time connection status.",
  },
  {
    icon: Shield,
    badge: "Role-Based Access",
    title: "RBAC & Granular Permissions",
    description:
      "Configure Public, User, or Admin access for Create, Read, Update, and Delete actions per collection without writing backend middleware.",
  },
  {
    icon: Lock,
    badge: "Fine-Grained",
    title: "Row-Level Security (RLS)",
    description:
      "Enforce tenant or owner-only data isolation with a single toggle. Authenticated users can only read and mutate rows they created.",
  },
  {
    icon: Radio,
    badge: "Server-Sent Events",
    title: "Realtime Live Streams",
    description:
      "Zero polling. Built directly on PostgreSQL LISTEN/NOTIFY to push instant inserts, updates, and deletes to client frontends via SSE streams.",
  },
  {
    icon: HardDrive,
    badge: "S3 / MinIO Ready",
    title: "Integrated File Storage",
    description:
      "Upload and manage user avatars, attachments, and assets. Seamlessly switch between local disk storage and production S3 / MinIO buckets.",
  },
  {
    icon: Activity,
    badge: "Prometheus Ready",
    title: "Telemetry & Live Logs",
    description:
      "Built-in `/metrics` endpoint exposing request latency, throughput, error rates, and connection pool status for Grafana and Prometheus monitoring.",
  },
  {
    icon: Server,
    badge: "Zero Lock-In",
    title: "Embedded or External Postgres",
    description:
      "Run the bundled PostgreSQL 16 container or connect to any existing database from Neon, Supabase, AWS RDS, Google Cloud SQL, or DigitalOcean.",
  },
];

export function FeatureGrid() {
  return (
    <section id="features" className="py-20 md:py-32 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="gradient" className="mb-4">
            Powerful Architecture
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Everything your backend needs, powered by Postgres.
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Stop rewriting boilerplate authentication, CRUD endpoints, and realtime layers for every new project.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={idx}
                className="group relative rounded-2xl border border-border/70 bg-card/40 p-6 backdrop-blur-md transition-all duration-300 hover:border-blue-500/40 hover:bg-card/70 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 group-hover:text-blue-300 transition-colors">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-mono font-medium text-blue-400/90 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                    {feature.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-blue-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
