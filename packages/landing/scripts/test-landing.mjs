import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const requiredFiles = [
  "package.json",
  ".gitignore",
  ".env",
  ".env.example",
  "src/app/page.tsx",
  "src/app/layout.tsx",
  "src/app/not-found.tsx",
  "src/app/privacy/page.tsx",
  "src/app/terms/page.tsx",
  "src/app/sitemap.ts",
  "src/app/robots.ts",
  "src/app/icon.tsx",
  "src/app/opengraph-image.tsx",
  "src/app/globals.css",
  "src/components/layout/navbar.tsx",
  "src/components/layout/footer.tsx",
  "src/components/landing/hero.tsx",
  "src/components/landing/feature-grid.tsx",
  "src/components/landing/interactive-terminal.tsx",
  "src/components/landing/architecture.tsx",
  "src/components/landing/comparison.tsx",
  "src/components/landing/benchmarks.tsx",
  "src/components/landing/pricing.tsx",
  "src/components/landing/faq.tsx",
  "src/components/landing/cta.tsx",
  "src/components/landing/quick-install.tsx",
  "src/components/landing/waitlist-form.tsx",
  "src/lib/env.ts",
  "src/lib/utils.ts",
];

function checkFiles() {
  for (const relPath of requiredFiles) {
    const fullPath = path.join(rootDir, relPath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Missing required file: ${relPath}`);
    }
  }
}

function checkNoCommentsInSource(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const res = path.resolve(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== ".next") {
        checkNoCommentsInSource(res);
      }
    } else if (/\.(tsx|ts|js|mjs|css)$/.test(entry.name)) {
      const content = fs.readFileSync(res, "utf-8");
      const lines = content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith("//") || line.startsWith("/*") || line.startsWith("<!--") || line.startsWith("{/*")) {
          throw new Error(`Disallowed comment found in ${res} at line ${i + 1}: ${line}`);
        }
      }
    }
  }
}

function checkEnv() {
  const envExample = fs.readFileSync(path.join(rootDir, ".env.example"), "utf-8");
  if (!envExample.includes("NEXT_PUBLIC_APP_NAME")) {
    throw new Error(".env.example missing NEXT_PUBLIC_APP_NAME");
  }
}

try {
  checkFiles();
  checkEnv();
  checkNoCommentsInSource(path.join(rootDir, "src"));
  console.log("All file checks and rule verifications passed!");
} catch (error) {
  console.error("Test failed:", error.message);
  process.exit(1);
}
