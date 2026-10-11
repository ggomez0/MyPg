"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useParams } from "next/navigation";
import { getToken, logout } from "@/lib/auth";
import {
  Folder,
  Key,
  LayoutGrid,
  Settings,
  FileText,
  Activity,
  Database,
  Plus,
  Search,
  ChevronRight,
  LogOut,
  Layers,
  Code2,
  Table as TableIcon,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PostgresLogo } from "@/components/postgres-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { useCollections } from "@/hooks/use-collections";
import { useProject } from "@/hooks/use-project";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

function SidebarNavigation({
  projectId,
  project,
  navLinks,
  pathname,
  searchQuery,
  setSearchQuery,
  discoveredDatabases,
  expandedDbs,
  toggleDbExpand,
  allProjects,
  activeCollectionName,
  onClose,
}: {
  projectId: string | null;
  project: any;
  navLinks: { href: string; label: string; icon: any }[];
  pathname: string;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  discoveredDatabases: any[] | undefined;
  expandedDbs: Record<string, boolean>;
  toggleDbExpand: (name: string, e: React.MouseEvent) => void;
  allProjects: any[] | undefined;
  activeCollectionName: string | null;
  onClose?: () => void;
}) {
  return (
    <div className="flex flex-col h-full select-none">
      <div className="p-3 border-b border-border/70 flex items-center justify-between">
        <Link href="/projects" onClick={onClose} className="flex items-center gap-2.5 group">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 group-hover:bg-primary/20 transition-colors">
            <PostgresLogo className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-bold text-xs tracking-tight text-foreground">MyPg</span>
              <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-muted text-muted-foreground font-semibold">
                BaaS
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground block truncate max-w-[130px] mt-0.5">
              {project ? project.name : "PostgreSQL Server"}
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
            <Link href="/projects" onClick={onClose} title="All Projects">
              <LayoutGrid className="h-3.5 w-3.5" />
            </Link>
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 md:hidden text-muted-foreground hover:text-foreground"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {projectId ? (
        <div className="p-2 border-b border-border/70 space-y-0.5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? "bg-primary/15 text-primary font-semibold border border-primary/25"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="p-2 border-b border-border/70 space-y-0.5">
          <Link
            href="/projects"
            onClick={onClose}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              pathname === "/projects"
                ? "bg-primary/15 text-primary font-semibold border border-primary/25"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5 text-primary" />
            <span>All Projects</span>
          </Link>
          <Link
            href="/api-keys"
            onClick={onClose}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              pathname === "/api-keys"
                ? "bg-primary/15 text-primary font-semibold border border-primary/25"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <Key className="h-3.5 w-3.5 text-primary" />
            <span>Apps & API Keys</span>
          </Link>
        </div>
      )}

      <div className="px-3 pt-3 pb-2 space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
            Databases & Tables
          </span>
          {projectId && (
            <Button asChild variant="ghost" size="icon" className="h-5 w-5 p-0 text-muted-foreground hover:text-primary">
              <Link href={`/projects/${projectId}/schema`} onClick={onClose} title="Create Table">
                <Plus className="h-3.5 w-3.5" />
              </Link>
            </Button>
          )}
        </div>

        <div className="relative">
          <Search className="h-3 w-3 absolute left-2.5 top-2.5 text-muted-foreground" />
          <Input
            placeholder="Search tables..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-7 pl-7 text-xs bg-background/50 border-border/80 rounded-md"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
        {discoveredDatabases && discoveredDatabases.length > 0 && (
          <div className="space-y-0.5">
            {discoveredDatabases.map((dbItem: any) => {
              const isExpanded = !!expandedDbs[dbItem.name];
              const matchingProject = allProjects?.find(
                (p: any) =>
                  p.slug === dbItem.name.replace(/_/g, "-") ||
                  p.name.toLowerCase() === dbItem.name.replace(/^db_/, "").toLowerCase() ||
                  (p.dbConnectionString && p.dbConnectionString.includes(`/${dbItem.name}`))
              );

              if (matchingProject?.isHidden && matchingProject?.id !== projectId) {
                return null;
              }

              const targetProjectId = matchingProject?.id || projectId;
              const dbTables: string[] = dbItem.tables || [];
              const visibleTables = dbTables.filter((t: string) =>
                t.toLowerCase().includes(searchQuery.toLowerCase())
              );

              if (searchQuery && visibleTables.length === 0) return null;

              return (
                <div key={dbItem.name} className="py-0.5">
                  <div
                    onClick={(e) => toggleDbExpand(dbItem.name, e)}
                    className="flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer hover:bg-muted/60 transition-colors text-xs group"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <ChevronRight
                        className={`h-3 w-3 text-muted-foreground transition-transform duration-150 shrink-0 ${
                          isExpanded ? "rotate-90 text-foreground" : ""
                        }`}
                      />
                      <Database className="h-3.5 w-3.5 text-primary/80 shrink-0" />
                      <span className="font-medium truncate text-foreground/90 group-hover:text-foreground">
                        {dbItem.name}
                      </span>
                    </div>

                    <span className="text-[10px] text-muted-foreground font-mono px-1 rounded bg-muted/60">
                      {dbTables.length}
                    </span>
                  </div>

                  {isExpanded && (
                    <div className="ml-3 pl-2.5 border-l border-border/60 space-y-0.5 mt-0.5">
                      {visibleTables.length > 0 ? (
                        visibleTables.map((tableName: string) => {
                          const isActive =
                            activeCollectionName === tableName &&
                            (targetProjectId === projectId || !projectId);

                          const href = targetProjectId
                            ? `/projects/${targetProjectId}/collections/${tableName}`
                            : `/projects`;

                          return (
                            <Link
                              key={tableName}
                              href={href}
                              onClick={onClose}
                              className={`flex items-center justify-between px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                                isActive
                                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                              }`}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <TableIcon className={`h-3 w-3 shrink-0 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
                                <span className="truncate">{tableName}</span>
                              </div>
                            </Link>
                          );
                        })
                      ) : (
                        <div className="px-2 py-1 text-[11px] text-muted-foreground/60 italic">
                          No tables found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-2 border-t border-border/70 flex items-center justify-between gap-1 bg-card/60">
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <Link href="/settings" onClick={onClose} title="Settings">
              <Settings className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
          onClick={logout}
          title="Log out"
        >
          <LogOut className="h-3.5 w-3.5 mr-1" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedDbs, setExpandedDbs] = useState<Record<string, boolean>>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const projectId = (params?.projectId as string) || null;
  const activeCollectionName = (params?.name as string) || null;

  const { data: project } = useProject(projectId || "");
  const { data: collections } = useCollections(projectId || "");

  const { data: discoveredDatabases } = useQuery({
    queryKey: ["discoveredDatabases"],
    queryFn: () => api.projects.getDatabases(),
  });

  const { data: allProjects } = useQuery({
    queryKey: ["projects"],
    queryFn: () => api.projects.list(),
  });

  useEffect(() => {
    setMounted(true);
    if (!getToken()) {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (discoveredDatabases && Object.keys(expandedDbs).length === 0) {
      const initial: Record<string, boolean> = {};
      discoveredDatabases.forEach((d: any) => {
        initial[d.name] = true;
      });
      setExpandedDbs(initial);
    }
  }, [discoveredDatabases]);

  if (!mounted) return null;

  const toggleDbExpand = (name: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedDbs((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const navLinks = projectId
    ? [
        { href: `/projects/${projectId}`, label: "Overview", icon: Layers },
        { href: `/projects/${projectId}/collections`, label: "Collections", icon: Folder },
        { href: `/projects/${projectId}/schema`, label: "SQL & Schema", icon: Code2 },
        { href: `/projects/${projectId}/logs`, label: "Query Stream", icon: Activity },
        { href: `/projects/${projectId}/storage`, label: "Storage", icon: FileText },
        { href: `/projects/${projectId}/api-keys`, label: "Apps & API Keys", icon: Key },
      ]
    : [];

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden font-sans">
      <aside className="hidden md:flex w-64 border-r border-border/70 bg-card/40 backdrop-blur flex-col shrink-0">
        <SidebarNavigation
          projectId={projectId}
          project={project}
          navLinks={navLinks}
          pathname={pathname}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          discoveredDatabases={discoveredDatabases}
          expandedDbs={expandedDbs}
          toggleDbExpand={toggleDbExpand}
          allProjects={allProjects}
          activeCollectionName={activeCollectionName}
        />
      </aside>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-card border-r border-border/70 z-50 flex flex-col md:hidden transition-transform duration-200 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarNavigation
          projectId={projectId}
          project={project}
          navLinks={navLinks}
          pathname={pathname}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          discoveredDatabases={discoveredDatabases}
          expandedDbs={expandedDbs}
          toggleDbExpand={toggleDbExpand}
          allProjects={allProjects}
          activeCollectionName={activeCollectionName}
          onClose={() => setMobileMenuOpen(false)}
        />
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
        <div className="md:hidden flex items-center justify-between px-3.5 py-2.5 border-b border-border/70 bg-card/60 backdrop-blur shrink-0 z-20">
          <div className="flex items-center gap-2 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-foreground shrink-0"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-4.5 w-4.5" />
            </Button>
            <Link href="/projects" className="flex items-center gap-2 truncate">
              <div className="p-1 rounded bg-primary/10 text-primary border border-primary/20 shrink-0">
                <PostgresLogo className="h-3.5 w-3.5" />
              </div>
              <span className="font-bold text-xs tracking-tight text-foreground truncate">
                {project ? project.name : "MyPg"}
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <ThemeToggle />
            <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <Link href="/settings">
                <Settings className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 md:p-8 min-w-0">
          {children}
        </div>
      </main>
    </div>
  );
}
