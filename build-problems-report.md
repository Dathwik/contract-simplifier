# Contract Simplifier — Build Problems Report

**Project:** ContractClear (Contract Simplifier)  
**Stack:** Next.js 16 · Claude API · PDF.js · Vercel  
**Date:** May 2026  
**Total Issues Encountered:** 4

---

## Problem 1 — PDF.js Worker File Not Found

### Error
```bash
cp: node_modules/pdfjs-dist/build/pdf.worker.min.js: No such file or directory
```

### Where It Happened
Step 2 — Installing Dependencies. Running the copy command for the PDF.js worker file.

### Root Cause
The guide was written targeting **pdfjs-dist v3**, which shipped `pdf.worker.min.js` (a `.js` file).  
The user installed **pdfjs-dist v5** (the latest), which replaced the `.js` file with `.mjs` (ES Module format).  
The file still exists — just under a different name and extension.

```
v3 → node_modules/pdfjs-dist/build/pdf.worker.min.js   ✅ exists
v5 → node_modules/pdfjs-dist/build/pdf.worker.min.mjs  ✅ exists
v5 → node_modules/pdfjs-dist/build/pdf.worker.min.js   ❌ does not exist
```

### Fix Applied
Pinned to **pdfjs-dist v3.11.174** — the stable version most documentation and examples target.

```bash
npm install pdfjs-dist@3.11.174
cp node_modules/pdfjs-dist/build/pdf.worker.min.js public/
```

### Why This Version
- v3 uses `.js` files — compatible with all webpack/Turbopack configs
- v4 and v5 introduced breaking API changes that cause subtle bugs
- Virtually all tutorials, Stack Overflow answers, and examples online use v3
- v3 still receives security patches

---

## Problem 2 — `Cannot find name 'pdfjsLib'`

### Error
```
Cannot find name 'pdfjsLib'.
```

### Where It Happened
Step 6 — Building the PDF Extractor (`lib/extractPdfText.ts`).

### Root Cause
The original code used a **static top-level import**:

```ts
import * as pdfjsLib from "pdfjs-dist";
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
```

Next.js runs Client Components in two places:
1. **In the browser** — works fine
2. **On the server during SSR** — PDF.js tries to load Node.js-specific APIs that don't exist in the Next.js server environment, causing the import to fail before `pdfjsLib` is ever assigned

Because the static import failed during SSR, `pdfjsLib` was never defined — hence "Cannot find name 'pdfjsLib'".

### Fix Applied
Replaced the static import with a **dynamic import** inside the function body:

```ts
// ❌ Before — static import, runs on server during SSR, fails
import * as pdfjsLib from "pdfjs-dist";

// ✅ After — dynamic import, only runs in browser when function is called
export async function extractPdfText(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
  // ...
}
```

### Why This Works
`extractPdfText()` is only ever called when a user drops a file — which only happens in the browser. The dynamic `import()` defers loading PDF.js until that moment, completely bypassing the SSR pass where the crash occurred.

---

## Problem 3 — `Module not found: Can't resolve 'canvas'`

### Error
```
Module not found: Can't resolve 'canvas'

./node_modules/pdfjs-dist/build/pdf.js:6247:20
  6245 | class NodeCanvasFactory extends _base_factory.BaseCanvasFactory {
  6246 |   _createCanvas(width, height) {
> 6247 |     const Canvas = require("canvas");
       |                    ^^^^^^^^^^^^^^^^^
```

### Where It Happened
Step 10 — Running the app locally (`npm run dev`).

### Root Cause
PDF.js is designed to work in **two environments**: browsers and Node.js.  
In its Node.js code path, it tries to `require("canvas")` — a native Node.js package for rendering PDF graphics server-side.

Even though `extractPdfText.ts` was marked as a Client Component, Next.js still performs an **SSR build pass** that touched PDF.js and triggered its Node.js code path. The `canvas` package was never installed because it's not needed — the browser has its own canvas API built in.

This is a **build-time** crash, not a runtime crash. The app never even started.

### Fix Applied
Two changes were required together:

**1. Updated `next.config.ts`** to tell the build system to ignore `canvas`:

```ts
const nextConfig: NextConfig = {
  serverExternalPackages: ["canvas"],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    return config;
  },
};
```

**2. Ensured dynamic import** was already in place from Problem 2's fix — preventing PDF.js from loading on the server at all.

### Why Both Fixes Are Needed

| Fix | What It Solves |
|---|---|
| `serverExternalPackages` | Excludes `canvas` from the server bundle entirely |
| `webpack alias canvas: false` | Redirects any `canvas` import to nothing during webpack build |
| Dynamic `import()` | Prevents PDF.js from loading on the server in the first place |

Fix 2 (dynamic import) is the real solution. Fixes from `next.config.ts` are the safety net for the build step.

---

## Problem 4 — Turbopack / Webpack Config Conflict

### Error
```
ERROR: This build is using Turbopack, with a `webpack` config and no `turbopack` config.
This may be a mistake.
As of Next.js 16 Turbopack is enabled by default and
custom webpack configurations may need to be migrated to Turbopack.
```

### Where It Happened
Immediately after applying the fix for Problem 3 — on the next `npm run dev`.

### Root Cause
**Next.js 16 enables Turbopack by default.** Turbopack is a new Rust-based bundler that replaces webpack for development builds. It is faster but uses a **completely different configuration syntax**.

The `webpack` config block added in Problem 3's fix is valid webpack syntax — but Turbopack doesn't read it. Next.js detected a `webpack` config with no `turbopack` config and raised the error, refusing to build cleanly.

```
Next.js 16
    ↓
Turbopack enabled by default
    ↓
Reads next.config.ts
    ↓
Finds webpack config → "This might be a mistake"
    ↓
No turbopack config → build error
```

### Fix Applied
Replaced the `webpack` block with the Turbopack equivalent syntax, and created an empty module file that Turbopack's alias system requires:

**`next.config.ts`:**
```ts
const nextConfig: NextConfig = {
  serverExternalPackages: ["canvas"],
  turbopack: {
    resolveAlias: {
      canvas: "./empty-module.ts",
    },
  },
};
```

**`empty-module.ts`** (new file in project root):
```ts
export default {};
```

### Key Difference: Webpack vs Turbopack Alias Syntax

| | Webpack | Turbopack |
|---|---|---|
| **Config key** | `webpack.resolve.alias` | `turbopack.resolveAlias` |
| **False value** | `canvas: false` | Not supported — needs a real file |
| **Real file alias** | `canvas: false` | `canvas: "./empty-module.ts"` |

Turbopack cannot alias to `false` — it must point to an actual file. That's why `empty-module.ts` was created: a real file that exports nothing, acting as a harmless placeholder whenever anything tries to import `canvas`.

---

## Summary Table

| # | Problem | Step | Cause | Fix |
|---|---|---|---|---|
| 1 | Worker file not found | Step 2 | pdfjs-dist v5 changed file extension from `.js` to `.mjs` | Pin to pdfjs-dist@3.11.174 |
| 2 | Cannot find name 'pdfjsLib' | Step 6 | Static import ran during SSR where PDF.js fails | Switch to dynamic `import()` inside the function |
| 3 | Cannot resolve 'canvas' | Step 10 | PDF.js Node.js code path tried to load `canvas` during build | Add `serverExternalPackages` + webpack/turbopack alias |
| 4 | Turbopack/webpack conflict | Step 10 | Next.js 16 uses Turbopack by default; webpack config syntax is incompatible | Migrate to `turbopack.resolveAlias` + create `empty-module.ts` |

---

## Lessons Learned

**1. Always check installed package versions**  
The guide targeted pdfjs-dist v3 but npm installed v5. Running `npm ls pdfjs-dist` before copying files would have caught this immediately.

**2. Browser-only libraries need dynamic imports in Next.js**  
Any library that uses browser APIs (canvas, window, document) must be loaded with `import()` inside a function, never as a static top-level import. Next.js always does an SSR pass on Client Components.

**3. Next.js version matters for config syntax**  
Next.js 16 is a significant version jump. Turbopack being enabled by default changes how bundler configuration works. Always check the Next.js version with `next --version` before following configuration guides written for older versions.

**4. Config file changes always require a dev server restart**  
`next.config.ts` is read once at startup. Any change to it requires stopping (`Ctrl+C`) and restarting (`npm run dev`) the dev server — hot reload does not apply to config files.

---

*Report generated during development of ContractClear — a contract analysis app built with Next.js, Claude API, and PDF.js.*
