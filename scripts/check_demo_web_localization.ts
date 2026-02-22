const { readdirSync, readFileSync } = require("fs");
const { join, relative } = require("path");

type Finding = {
  file: string;
  phrase: string;
  line: number;
};

const repoRoot = join(__dirname, "..");
const sourceRoot = join(repoRoot, "apps", "demo-web", "src");

const skipPathFragments = [
  join("context", "AppContext.tsx"),
  `${join("data")}`,
  `${join("types")}`,
  `${join("__tests__")}`,
  `${join("test")}`,
];

const blockedPhrases = [
  "Loading session...",
  "Loading...",
  "Continue as Customer",
  "Continue as Contractor",
  "Continue as Admin",
  "Log out",
  "Filters",
  "Clear filters",
  "No cases found",
  "Select contractor",
  "Developer actions",
  "Create estimate deposit",
  "Quote amount:",
  "Feature Flags",
  "Mock mode enabled. Config is not persisted.",
  "Config saved.",
  "Switch Role",
  "Demo data mode active. Backend is unreachable.",
  "Auto-fallback enabled",
  "Recommended Contractor",
  "Recommended by TrustVibe compatibility scoring.",
  "No session",
  "Sign in to access profile",
  "Accept agreement",
  "Funds will remain on hold while this issue is under review.",
  "Confirm issue",
  "Upload Document",
  "Payment Methods",
  "Notification center for lifecycle and trust events.",
];

function walk(dir: string, results: string[]): void {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, results);
      continue;
    }
    if (!entry.name.endsWith(".ts") && !entry.name.endsWith(".tsx")) {
      continue;
    }
    if (entry.name.endsWith(".test.ts") || entry.name.endsWith(".test.tsx")) {
      continue;
    }
    if (entry.name.endsWith(".spec.ts") || entry.name.endsWith(".spec.tsx")) {
      continue;
    }
    results.push(fullPath);
  }
}

function shouldSkip(filePath: string): boolean {
  const rel = relative(sourceRoot, filePath);
  return skipPathFragments.some((fragment) => rel.includes(fragment));
}

function lineFromIndex(text: string, index: number): number {
  return text.slice(0, index).split(/\r?\n/).length;
}

function collectFindings(): Finding[] {
  const files: string[] = [];
  walk(sourceRoot, files);

  const findings: Finding[] = [];

  for (const filePath of files) {
    if (shouldSkip(filePath)) {
      continue;
    }

    const source = readFileSync(filePath, "utf8");

    for (const phrase of blockedPhrases) {
      let searchIndex = 0;
      while (true) {
        const index = source.indexOf(phrase, searchIndex);
        if (index === -1) {
          break;
        }

        findings.push({
          file: relative(repoRoot, filePath),
          phrase,
          line: lineFromIndex(source, index),
        });

        searchIndex = index + phrase.length;
      }
    }
  }

  return findings;
}

function main(): void {
  const findings = collectFindings();

  if (!findings.length) {
    console.log("Demo-web static localization gate passed.");
    process.exit(0);
  }

  console.error(
    `Demo-web static localization gate failed with ${findings.length} finding(s).`
  );
  for (const finding of findings) {
    console.error(
      `${finding.file}:${finding.line} contains blocked phrase: ${finding.phrase}`
    );
  }

  process.exit(1);
}

main();
