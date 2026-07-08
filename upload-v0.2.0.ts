/**
 * chroma-flow — v0.2.0 GitHub upload
 * Creates an incremental commit on top of the current `main` HEAD with all
 * local files, fast-forwards `main`, then creates the `v0.2.0` tag + release.
 *
 * Run: GH_TOKEN=... bun run upload-v0.2.0.ts
 */
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

const TOKEN = process.env.GH_TOKEN!;
const OWNER = "Cryptoteep";
const REPO = "chroma-flow";
const ROOT = "/home/z/my-project/chroma-flow";

const GH = "https://api.github.com";
const headers: Record<string, string> = {
  Authorization: `Bearer ${TOKEN}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};

async function ghFetch(path: string, init: RequestInit = {}) {
  const res = await fetch(`${GH}${path}`, {
    ...init,
    headers: { ...headers, ...(init.headers as Record<string, string> | undefined) },
  });
  const text = await res.text();
  let json: unknown = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = text; }
  if (!res.ok) {
    throw new Error(`GitHub API ${res.status} ${path}: ${typeof json === "string" ? json : JSON.stringify(json)}`);
  }
  return json;
}

async function walk(dir: string, acc: string[] = []): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name === "node_modules" || e.name === "dist" || e.name === ".git" || e.name === ".bun") continue;
    if (e.name === "upload-github.ts" || e.name === "upload-v0.2.0.ts" || e.name === "create-issues.ts" || e.name === "smoke.ts") continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      await walk(full, acc);
    } else if (e.isFile()) {
      acc.push(full);
    }
  }
  return acc;
}

async function main() {
  // 0. Get current main HEAD (parent for the new commit).
  const branchInfo = await ghFetch(`/repos/${OWNER}/${REPO}/branches/main`) as { commit: { sha: string } };
  const parentSha = branchInfo.commit.sha;
  console.log(`Current main HEAD: ${parentSha}`);

  // 1. Collect files + create blobs.
  const files = (await walk(ROOT)).sort();
  console.log(`Found ${files.length} files`);
  const treeEntries: { path: string; mode: "100644"; type: "blob"; sha: string }[] = [];
  const BATCH = 8;
  for (let i = 0; i < files.length; i += BATCH) {
    const slice = files.slice(i, i + BATCH);
    const results = await Promise.all(slice.map(async (file) => {
      const rel = relative(ROOT, file);
      const content = await readFile(file);
      const base64 = Buffer.from(content).toString("base64");
      const blob = await ghFetch(`/repos/${OWNER}/${REPO}/git/blobs`, {
        method: "POST",
        body: JSON.stringify({ content: base64, encoding: "base64" }),
      }) as { sha: string };
      console.log(`  blob ${blob.sha.slice(0, 8)}  ${rel}`);
      return { path: rel, mode: "100644" as const, type: "blob" as const, sha: blob.sha };
    }));
    treeEntries.push(...results);
  }

  // 2. Create the tree (full replacement of the repo tree).
  console.log("Creating tree…");
  const tree = await ghFetch(`/repos/${OWNER}/${REPO}/git/trees`, {
    method: "POST",
    body: JSON.stringify({ tree: treeEntries }),
  }) as { sha: string };
  console.log(`  tree ${tree.sha}`);

  // 3. Create the commit with the parent.
  console.log("Creating commit…");
  const commit = await ghFetch(`/repos/${OWNER}/${REPO}/git/commits`, {
    method: "POST",
    body: JSON.stringify({
      message: "feat: v0.2.0 — APCA contrast, semantic theme pairs, Swift & Compose exporters\n\n- APCA (WCAG 3 candidate) perceptual contrast: apcaContrast, checkAPCA, formatLc, suggestTextColorAPCA. Returns signed Lc values with body/large/non-text thresholds.\n- Semantic theme generation: generateTheme, themeToCSS, themeToJSON. Derives a coordinated light + dark theme pair from one seed, with per-role WCAG + APCA audit.\n- New exporters: toSwift (SwiftUI Color extension), toCompose (Jetpack Compose Color object).\n- CLI: --apca, --theme flags; --format swift|compose.\n- New types: APHAResult, SemanticTheme, ThemeAudit, ThemePair. ExportFormat extended.\n- Updated docs (README, CHANGELOG, docs/API.md) and roadmap.\n\nCloses #3 (APCA), closes #6 (theme pair), closes #2 (Swift exporter).",
      tree: tree.sha,
      parents: [parentSha],
    }),
  }) as { sha: string };
  console.log(`  commit ${commit.sha}`);

  // 4. Fast-forward main to the new commit.
  console.log("Updating main ref…");
  await ghFetch(`/repos/${OWNER}/${REPO}/git/refs/heads/main`, {
    method: "PATCH",
    body: JSON.stringify({ sha: commit.sha, force: false }),
  });
  console.log(`  main -> ${commit.sha}`);

  // 5. Create the v0.2.0 tag object + ref.
  console.log("Creating v0.2.0 tag…");
  const tag = await ghFetch(`/repos/${OWNER}/${REPO}/git/tags`, {
    method: "POST",
    body: JSON.stringify({
      tag: "v0.2.0",
      message: "chroma-flow v0.2.0",
      object: commit.sha,
      type: "commit",
    }),
  }) as { sha: string };
  await ghFetch(`/repos/${OWNER}/${REPO}/git/refs`, {
    method: "POST",
    body: JSON.stringify({ ref: "refs/tags/v0.2.0", sha: tag.sha }),
  });
  console.log(`  tag v0.2.0 -> ${tag.sha}`);

  // 6. Create the GitHub release.
  console.log("Creating release…");
  const release = await ghFetch(`/repos/${OWNER}/${REPO}/releases`, {
    method: "POST",
    body: JSON.stringify({
      tag_name: "v0.2.0",
      target_commitish: "main",
      name: "v0.2.0 — APCA, theme pairs, mobile exporters",
      body: "## 🎉 chroma-flow v0.2.0\n\nThe second release turns chroma-flow from a palette generator into a **complete accessible-color toolkit**.\n\n### ✨ Highlights\n\n- 📏 **APCA contrast (WCAG 3 candidate)** — `apcaContrast`, `checkAPCA`, `formatLc`, `suggestTextColorAPCA`. Returns signed perceptual Lc values (positive = dark text on light bg, negative = light on dark) with body / large / non-text thresholds. More accurate than WCAG 2.1 for dark themes.\n- 🌗 **Semantic theme pairs** — `generateTheme`, `themeToCSS`, `themeToJSON`. Derives a coordinated light + dark theme (background, surface, text, primary, accent, success/warning/danger) from one seed, with a per-role WCAG + APCA audit.\n- 🍎 **SwiftUI exporter** — `toSwift` emits a `Color` extension for iOS.\n- 🤖 **Jetpack Compose exporter** — `toCompose` emits a Kotlin `Color` object for Android.\n- 🖥️ **New CLI flags** — `--apca`, `--theme`, `--format swift|compose`.\n\n### 📦 Install\n\n```bash\nbun add chroma-flow\n```\n\n### 🚀 Quick start\n\n```ts\nimport { generateTheme, checkAPCA } from \"chroma-flow\";\nconst theme = generateTheme(\"#6366f1\");\nconst apca = checkAPCA(\"#ffffff\", theme.dark.primary);\n```\n\n### 🙏 Closed issues\n\nCloses #3 (APCA), #6 (theme pair), #2 (Swift exporter).\n\n**Full changelog:** https://github.com/Cryptoteep/chroma-flow/blob/main/CHANGELOG.md",
      draft: false,
      prerelease: false,
    }),
  }) as { html_url: string };
  console.log(`  release ${release.html_url}`);

  console.log("\n✅ v0.2.0 uploaded!");
  console.log(`   commit: ${commit.sha}`);
}

main().catch((err) => {
  console.error("❌ Upload failed:", err);
  process.exit(1);
});
