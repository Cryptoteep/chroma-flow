#!/usr/bin/env bun
const TOKEN = process.env.GH_TOKEN!;
const OWNER = "Cryptoteep";
const REPO = "chroma-flow";

async function closeIssue(num: number, comment: string) {
  await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/issues/${num}/comments`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
    body: JSON.stringify({ body: comment }),
  });
  const r = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/issues/${num}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
    body: JSON.stringify({ state: "closed", state_reason: "completed" }),
  });
  const d = await r.json() as { state: string };
  console.log(`#${num} -> ${d.state}`);
}

await closeIssue(3, "Shipped in v0.2.0 🎉\n\n`apcaContrast`, `checkAPCA`, `formatLc`, `suggestTextColorAPCA` are now exported, plus the CLI `--apca` flag. See the [v0.2.0 release](https://github.com/Cryptoteep/chroma-flow/releases/tag/v0.2.0) and [docs/API.md#apca-contrast](https://github.com/Cryptoteep/chroma-flow/blob/main/docs/API.md#apca-contrast).");
await closeIssue(6, "Shipped in v0.2.0 🎉\n\n`generateTheme`, `themeToCSS`, `themeToJSON` derive a coordinated light + dark semantic theme pair from one seed, with a per-role WCAG + APCA audit. CLI `--theme` emits the CSS. See [docs/API.md#semantic-themes](https://github.com/Cryptoteep/chroma-flow/blob/main/docs/API.md#semantic-themes).");
await closeIssue(2, "Shipped in v0.2.0 🎉\n\n`toSwift` (SwiftUI `Color` extension) is available via `exportPalette(p, \"swift\", name)` and the CLI `--format swift`. A Jetpack Compose exporter (`toCompose`) shipped alongside. See [docs/API.md#exporters](https://github.com/Cryptoteep/chroma-flow/blob/main/docs/API.md#exporters).");

console.log("✅ issues closed");
