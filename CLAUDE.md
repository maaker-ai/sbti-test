@AGENTS.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**SBTI (Super Bullshit Type Indicator)** — a parody personality test deployed at `https://maaker.cn/sbti`. 30 questions → 15 dimensions → matched against 26 personality types. Built as a Next.js 16 static export.

## Commands

```bash
npm run dev      # next dev (localhost:3000, redirects / → /sbti)
npm run build    # next build → static export in out/
npm run start    # next start (not used in prod — site is static)
```

No test or lint scripts configured. Next.js built-in ESLint runs during `build`.

## Stack Notes

- **Next.js 16.2.3 / React 19** — AGENTS.md warns this is newer than training data; check `node_modules/next/dist/docs/` before using unfamiliar APIs.
- **Static export** (`output: 'export'` in `next.config.ts`, `images.unoptimized: true`). No server code, no API routes, no runtime env vars. Everything must work as static HTML.
- **Tailwind v4** via `@tailwindcss/postcss` (no `tailwind.config.*`, config lives in `globals.css` via `@theme`).

## Architecture

### Scoring pipeline (`src/data/`)
The test logic is pure and lives entirely in `src/data/`:
- `questions.ts` — 30 questions, each tagged with a `dim` (dimension key).
- `dimensions.ts` — 15 dimension metadata + `dimensionOrder` (fixed order used everywhere).
- `types.ts` — 26 personality types, each with a 5-group `pattern` like `"LMH-HMM-MLH-HHH-MHL"` representing expected L/M/H levels per dimension. Includes `TYPE_LIBRARY`, `TYPE_IMAGES`, `TYPE_THUMBS`, `TYPE_GROUPS`, `DEFAULT_THEME`.
- `scoring.ts` — the core. `computeResult(answers)`:
  1. Sums raw scores per dimension, maps to L (≤3) / M (4) / H (≥5).
  2. For each `NORMAL_TYPE`, computes Manhattan distance from user's L/M/H vector to the type's pattern.
  3. Ranks by `distance → exact matches → similarity`.
  4. **Two special override paths:**
     - `drink_gate_q2 === 2` → hidden `DRUNK` type.
     - Best similarity `< 60` → forced `HHHH` fallback type.

### Share encoding
`scoring.ts` defines TWO encoding schemes:
- `encodeResult`/`decodeResult` — base64 of raw answers (used internally).
- `encodeShareUrl`/`decodeShareUrl` — compact dotted format `CODE.sim.exact.LMH-HMM-....234-342-....[D|H]`. This is what ends up in share URLs (`?d=...`). `decodeShareUrl` must reconstruct a full `TestResult` without access to the original answers, including the special `D`/`H` flag for hidden/fallback types.

Any change to pattern format, dimension order, or special-type logic must keep both encoders/decoders in sync, otherwise old share links break.

### Routes (`src/app/`)
- `/` → redirects to `/sbti`.
- `/sbti` — landing page (server component, has `metadata`/OG tags).
- `/sbti/test` — the quiz (client, holds answer state).
- `/sbti/result` — renders result; reads `?d=` (share URL format) or falls back to recomputing from stored answers. `from=share` branch skips the "your result" framing. Wrapped in `<Suspense>` because it uses `useSearchParams`.
- `/sbti/types` — type library browser, with sub-route `/sbti/types/[code]` for individual types.

### Components (`src/components/`)
- `RadarChart.tsx` — SVG radar across the 15 dimensions.
- `PatternViz.tsx` — LMH pattern visualization.
- `SharePoster.tsx` — offscreen DOM node rendered to PNG via `html-to-image` for the shareable poster. **Known fragility**: `html-to-image` needs images pre-loaded as base64 and the node temporarily visible during capture — see recent fix commits (`8f26d6e`, `f23e3f4`, `102d286`). Don't revert those workarounds without testing iOS Safari poster generation.
- `Footer.tsx`, favicon at `public/favicon.ico` (see commit `2943aa2`).

## SEO

- **Google Search Console** verified for `maaker.cn` (DNS domain property, account: `tucao.art@gmail.com`).
- **Sitemap** at `public/sitemap.xml` — 28 URLs (landing + types listing + 26 individual types). Submitted to GSC.
- **robots.txt** blocks `/sbti/test` and `/sbti/result` (interactive client pages, no SEO value).
- **Structured data**: JSON-LD on landing (WebSite + Quiz), types listing (ItemList + BreadcrumbList), and each type detail page (Article + BreadcrumbList).
- **Meta tags**: Root layout sets default title template `%s | SBTI 人格测试`. Each type detail page generates its own metadata via `generateMetadata`.
- **Font loading**: `preconnect` to Google Fonts in `layout.tsx` — improves Googlebot rendering. Google still reports some font/image resources as "couldn't load" which is expected for external resources.
- When adding new types: update `sitemap.xml`, ensure `generateStaticParams` picks them up, and they'll auto-get structured data from the `[code]/page.tsx` template.

## Gotchas

- **Static export**: don't add `route.ts`, server actions, `revalidate`, or anything that needs a Node runtime at request time. It will break `next build`.
- **Share URL format is load-bearing**: `https://maaker.cn/sbti/result?d=<encoded>` links are distributed — keep `decodeShareUrl` backwards compatible.
- **Tailwind v4**: no `tailwind.config.ts`. Add tokens via `@theme` in `src/app/globals.css`.
- **Client vs server components**: `/sbti` landing is a server component (has `metadata` export). Anything using `useSearchParams`/`useState` must be `'use client'` and, for search params, wrapped in `<Suspense>`.
- **Deployment**: static files in `out/` are served via nginx on the production server. After `npm run build`, the `out/` directory needs to be deployed. The site lives under the `/sbti` path on `maaker.cn`.
