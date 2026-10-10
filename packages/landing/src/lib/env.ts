export const env = {
  appName: process.env.NEXT_PUBLIC_APP_NAME || "MyPg",
  appTagline: process.env.NEXT_PUBLIC_APP_TAGLINE || "A PostgreSQL Backend as a Service",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001",
  dashboardUrl: process.env.NEXT_PUBLIC_DASHBOARD_URL || "http://localhost:3000",
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
  githubRepo: process.env.NEXT_PUBLIC_GITHUB_REPO || "https://github.com/ggomez0/MyPg",
  docsUrl: process.env.NEXT_PUBLIC_DOCS_URL || "http://localhost:3000/docs",
  installCmd: process.env.NEXT_PUBLIC_INSTALL_CMD || "curl -fsSL https://raw.githubusercontent.com/ggomez0/MyPg/main/install.sh | bash",
  clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "",
  databaseUrl: process.env.DATABASE_URL || "",
  openRouterApiKey: process.env.OPENROUTER_API_KEY || "",
};
