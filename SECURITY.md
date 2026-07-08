# Security Policy

## Supported versions

chroma-flow is a small, zero-dependency library. We provide security updates for
the latest minor release only.

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | ✅                  |
| < 0.1   | ❌                  |

## Reporting a vulnerability

We take security seriously, even for a small color library. If you discover a
vulnerability — for example, a crash from malformed hex input, a ReDoS, or an
issue in the CLI argument parsing — **please do not open a public issue**.

Instead, report it privately via one of:

- **GitHub Private Vulnerability Reporting** (preferred): go to the
  [Security tab](https://github.com/Cryptoteep/chroma-flow/security/advisories/new)
  and click "Report a vulnerability".
- Email: **security@cryptoteep.dev**

Please include:

1. A description of the issue and its potential impact.
2. A minimal reproduction (input that triggers the bug).
3. The affected version.
4. Any suggested fix.

We will acknowledge receipt within **72 hours** and aim to publish a fix within
**14 days** for high-severity issues, coordinating disclosure with you.

## Security considerations

- The library performs only **pure color math** — it makes no network requests,
  reads no files, and executes no shell commands.
- The CLI parses arguments from `process.argv` and does not eval or spawn
  processes. Hex inputs are validated before use.
- Because the library is **zero-dependency**, its supply-chain attack surface is
  essentially zero — there are no transitive dependencies to audit beyond the
  library itself.
