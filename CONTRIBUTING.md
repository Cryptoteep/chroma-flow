# Contributing to chroma-flow

First off — **thank you** for taking the time to contribute. 🎉

This project exists to make accessible color tooling free for everyone, and
every contribution — from a typo fix to a new color-space export — moves that
mission forward.

## 📜 Code of Conduct

By participating you agree to uphold our [Code of Conduct](CODE_OF_CONDUCT.md).
Please be kind, inclusive, and assume good intent.

## 🛠️ Ways to contribute

- 🐛 **Report bugs** via the bug report issue template.
- 💡 **Suggest features** via the feature request template.
- 📖 **Improve docs** — clearer wording and examples are always welcome.
- 🧪 **Add exporters** — a new target format (e.g. iOS `.swift`, Compose) is a great first PR.
- 🌐 **Translate** the README into another language.
- ⭐ **Star & share** the repo so others can find it.

## 🚀 Getting started

You'll need [Bun](https://bun.sh) (or Node 18+) installed.

```bash
# 1. Fork & clone
git clone https://github.com/<your-username>/chroma-flow.git
cd chroma-flow

# 2. Run the example to confirm everything works
bun run example

# 3. Try the CLI
bun run cli "#6366f1"
```

There are **no dependencies to install** — the library is zero-dependency by
design, and the dev tooling uses Bun directly.

## 📂 Project layout

```
chroma-flow/
├── src/            # Library source (zero dependencies)
│   ├── srgb.ts     # hex <-> RGB <-> linear RGB
│   ├── oklch.ts    # OKLCH color space
│   ├── wcag.ts     # WCAG 2.1 contrast
│   ├── colorblind.ts  # CVD simulation
│   ├── generator.ts   # palette generation
│   ├── suggest.ts     # text color suggestion
│   ├── exporters.ts   # CSS / Tailwind / JSON / SCSS / SVG / XML
│   └── types.ts
├── cli/            # CLI entry point
├── examples/       # Runnable examples
└── docs/           # Extended docs
```

## ✅ Before you open a PR

1. **Keep it dependency-free.** New runtime dependencies will not be accepted
   unless there is a compelling, well-justified reason. Dev dependencies are fine.
2. **TypeScript strict mode** must stay happy — no `any`, no unused vars.
3. **Document public API.** Every exported function needs a JSDoc comment.
4. **Add an example** if you add a new feature.
5. **Keep diffs focused.** One feature/fix per PR makes review faster.

## 🧪 Testing

We don't ship a test framework in the repo yet (see roadmap). For now, exercise
your change by updating `examples/basic.ts` or adding a small script under
`examples/` and running it with `bun run`.

## 📝 Commit messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add iOS Swift exporter
fix: clamp negative chroma in generator
docs: clarify OKLCH ramp in README
chore: bump version
```

## 🔄 Pull request flow

1. Create a branch: `feat/ios-exporter`, `fix/contrast-rounding`, etc.
2. Make your changes, keep commits focused.
3. Open a PR against `main` and fill in the template.
4. Respond to review feedback — we're friendly, promise. 🙌

## 🏷️ Release process

Maintainers handle releases. Versions follow [SemVer](https://semver.org/) and
are recorded in [CHANGELOG.md](CHANGELOG.md).

## Questions?

Open a [discussion](https://github.com/Cryptoteep/chroma-flow/discussions) or
jump into an issue — happy to help you find your first contribution.
