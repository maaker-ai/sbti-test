# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**SBTI (Super Bullshit Type Indicator)** — a parody personality test deployed at `https://maaker.cn/sbti`. 30 questions → 15 dimensions → matched against 26 personality types. Built as a Next.js 16 static export. See `README.md` for project origin and open-source status.

## Commands

```bash
npm run dev                    # local dev (localhost:3000, redirects / → /sbti)
npm run build                  # build → static export in out/
npm run test:e2e               # Playwright E2E — full test flow + counter assertions (~47s, Chromium only)
npx playwright test tests/poster-counter.spec.ts --headed   # watch it run
./scripts/deploy-staging.sh    # build + rsync to https://staging.maaker.cn (any branch, injects NEXT_PUBLIC_SBTI_SCHEMA=sbti_staging)
./scripts/deploy-prod.sh       # build + rsync to https://maaker.cn (main branch only, clean tree required, injects NEXT_PUBLIC_SBTI_SCHEMA=sbti)
```

Next.js built-in ESLint runs during `build`. No unit-test framework.

**Rule**: never run `deploy-prod.sh` without first deploying the same commit to staging and eyeballing it in the browser. There are real users on `maaker.cn`. See Gotchas → Deployment for the full workflow.

## Stack Notes

- **Next.js 16.2.3 / React 19** — newer than most training data. APIs, conventions, and file structure may differ from what you remember. Check `node_modules/next/dist/docs/` before using unfamiliar APIs, and heed deprecation notices.
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
- `/sbti` — landing page (server component, has `metadata`/OG tags). Hosts `<VisitorCount />` (total-count pull from Supabase).
- `/sbti/test` — the quiz (client, holds answer state). **On last answer, auto-advances to `/sbti/result`** (no user confirmation button) with a full-screen "生成你的人格档案..." loading overlay covering the RPC round-trip. Old sticky submit button is retained as a safety net.
- `/sbti/result` — renders result; reads `?r=` (compact share URL format) or legacy `?d=` (base64). On mount, reads `sessionStorage['sbti:completion']` for the patient counter badges; receiver path (`from=share`) skips this read. Wrapped in `<Suspense>` because it uses `useSearchParams`.
- `/sbti/types` — type library browser, with sub-route `/sbti/types/[code]` for individual types.

### Poster counter feature

Every completion gets **two numbers** stamped onto the share poster and shown on-screen on the result page:
- **Global**: `SBTI Bullshit 病历档案 · No.XXXX` at the top (from `sbti.counter_global`, 4-digit padded)
- **Per-type rubber stamp** bottom-right: `第 N 位 {CODE}型 患者 · YYYY.MM.DD 确诊` (from `sbti.counter_by_type`, rotated/bordered)

Data flow:
1. `src/app/sbti/test/page.tsx` calls `warmUpSupabase()` on mount (pre-initializes client to avoid cold-start) and `recordCompletion(typeCode)` on submit.
2. `src/lib/supabase.ts` calls Postgres RPC `sbti.complete(p_type_code)` via `supabase.schema(SCHEMA).rpc(...)` — atomic increment of both counters + insert into `sbti.completions`. Wrapped in 2s `withTimeout`; any failure returns `null` and does **not** block navigation.
3. `handleSelect` on last answer writes `sessionStorage['sbti:completion'] = { globalId, typeId, date, typeCode }` then `router.push` to result page.
4. `SharePoster.tsx` receives `globalId`/`typeId`/`diagnosedAt` props and renders both badges (same strings on-screen + on poster). Missing props → don't render, old `匹配度 XX%` badge always stays.
5. Landing `<VisitorCount />` polls `sbti.total_count` view once on mount.

The **Supabase instance is `https://api.maaker.cn`** (self-hosted, shared with other Maaker projects). SBTI owns two schemas: `sbti` (prod, seed value `100`) and `sbti_staging` (staging, seed `0`). Schema is selected at build time via `NEXT_PUBLIC_SBTI_SCHEMA` (default `sbti_staging` in `.env.local`, overridden by deploy scripts). Anon key is in `.env.local` (gitignored); see shared credentials note `obsidian:Server/Supabase-自托管-api.maaker.cn.md`.

**Migrations** live in `supabase/migrations/` (filename convention `YYYYMMDDHHMMSS_desc.sql`). The initial migration created the schemas + 3 tables + RPC + view + RLS (anon can only EXECUTE `complete(...)` and SELECT the view). Re-applying migrations manually: `cat <file> | ssh xiaopang@1.15.12.53 "docker compose -f /opt/maaker-supabase/docker-compose.yml exec -T postgres psql -U postgres -d maaker"` — **target DB is `maaker`, not `postgres`**. After schema changes: `NOTIFY pgrst, 'reload schema';`. **Never run `supabase db reset`** — shared instance, it would wipe other projects.

### Share encoding
`scoring.ts` defines TWO encoding schemes:
- `encodeResult`/`decodeResult` — base64 of raw answers (used internally).
- `encodeShareUrl`/`decodeShareUrl` — compact dotted format `CODE.sim.exact.LMH-HMM-....234-342-....[D|H]`. This is what ends up in share URLs (`?r=...`). `decodeShareUrl` must reconstruct a full `TestResult` without access to the original answers, including the special `D`/`H` flag for hidden/fallback types. Patient counter values are **NOT** encoded in the share URL — receivers don't see them.

Any change to pattern format, dimension order, or special-type logic must keep both encoders/decoders in sync, otherwise old share links break.

### Components (`src/components/`)
- `RadarChart.tsx` — SVG radar across the 15 dimensions.
- `PatternViz.tsx` — LMH pattern visualization.
- `SharePoster.tsx` — offscreen DOM node rendered to PNG via `html-to-image` for the shareable poster. **Known fragility**: `html-to-image` needs images pre-loaded as base64 and the node temporarily visible during capture — see recent fix commits (`8f26d6e`, `f23e3f4`, `102d286`). The patient stamp uses `transform: rotate(-6deg)` + `border` + semi-transparent background — a historically risky combo for `html-to-image` on iOS Safari. **Don't revert those workarounds, and any SharePoster change requires iOS Safari real-device testing.**
- `VisitorCount.tsx` — landing-page `'use client'` widget. Silent failure: renders nothing while loading or on error.
- `Footer.tsx`, favicon at `public/favicon.ico` (see commit `2943aa2`).

### E2E tests (`tests/`)
`tests/poster-counter.spec.ts` covers the full user flow: landing → 31 answers → auto-redirect → result page badges → `sessionStorage` check → counter-increment verify. `playwright.config.ts` reuses an existing dev server on :3000. Runs against whatever schema `.env.local` points to (default `sbti_staging`), so each run legitimately bumps the staging counter by 1 — that's fine, don't design around it.

## SEO

- **Google Search Console** verified for `maaker.cn` (DNS domain property, account: `tucao.art@gmail.com`).
- **Sitemap** at `public/sitemap.xml` — 28 URLs (landing + types listing + 26 individual types). Submitted to GSC.
- **robots.txt** blocks `/sbti/test` and `/sbti/result` (interactive client pages, no SEO value).
- **Structured data**: JSON-LD on landing (WebSite + Quiz), types listing (ItemList + BreadcrumbList), and each type detail page (Article + BreadcrumbList).
- **Meta tags**: Root layout sets default title template `%s | SBTI 人格测试`. Each type detail page generates its own metadata via `generateMetadata`.
- **Font loading**: `preconnect` to Google Fonts in `layout.tsx` — improves Googlebot rendering. Google still reports some font/image resources as "couldn't load" which is expected for external resources.
- **Baidu**: naturally indexed and shown as `sc_ala` (阿拉丁) rich card for "SBTI 人格测试" queries. Don't casually change the root page title or URL structure — it may disturb existing ranking.
  - **Verified** on `ziyuan.baidu.com` (personal account "行而不车又又又", 2026-04-14) via file verification. The file `public/baidu_verify_codeva-Zx5vCS3atK.html` (content: `791d4fbb46b3711b4644e2dd6ebe1580`) is also deployed at `/var/www/maaker-cn/` on the server. **Do not delete it** — Baidu re-checks periodically.
  - Site categories: 工具服务及在线查询 / 信息技术 / 生活和情感 (30-day lock; change from `搜索展现 → 站点属性`).
  - ICP: `京ICP备2023007401号-13` (company-owned via 腾讯云, rendered in `Footer.tsx:22`).
  - **TODO (owner action required)**: to unlock sitemap submission and raise daily URL quota, the personal Baidu account needs 实名认证 (handheld ID photo) → associate 主体 → fill ICP at `搜索展现 → 站点属性 → 主体备案号`. Then submit sitemap at `资源提交 → 普通收录 → sitemap` tab with `https://maaker.cn/sitemap.xml`.
- **Analytics caveat**: the Umami website is bound to `maaker.cn`, but `/` immediately redirects to `/sbti`. The redirect often happens before the tracking script finishes, so Baidu-sourced sessions record as 0-second bounces even though users engage. If you add analytics, either move tracking to `/sbti` or stop the redirect.
- When adding new types: update `sitemap.xml`, ensure `generateStaticParams` picks them up, and they'll auto-get structured data from the `[code]/page.tsx` template.

## Gotchas

- **Static export**: don't add `route.ts`, server actions, `revalidate`, or anything that needs a Node runtime at request time. It will break `next build`. All backend logic lives in the external Supabase instance.
- **Share URL format is load-bearing**: `https://maaker.cn/sbti/result?r=<encoded>` (and legacy `?d=<base64>`) links are distributed — keep `decodeShareUrl`/`decodeResult` backwards compatible. Do NOT add patient counter values into share URL params — receivers should never see a personalized counter.
- **Tailwind v4**: no `tailwind.config.ts`. Add tokens via `@theme` in `src/app/globals.css`.
- **Client vs server components**: `/sbti` landing is a server component (has `metadata` export). Anything using `useSearchParams`/`useState` must be `'use client'` and, for search params, wrapped in `<Suspense>`.
- **Supabase cold start**: `recordCompletion` has a 2s timeout. First RPC from a fresh page can take ~500ms (DNS + TLS). `src/app/sbti/test/page.tsx` calls `warmUpSupabase()` in its mount effect so the client is hot before user hits submit. Keep this warm-up call if refactoring test page.
- **Playwright rate-limit with real RPC**: `npm run test:e2e` consumes one staging counter tick per run, by design. Acceptable for local dev. If integrated into CI later, either mock the client or clear `sbti_staging` counters before each run.
- **Deployment**: static files in `out/` are served via nginx on the same server (`1.15.12.53`, user `xiaopang`). Two environments, same server:
  - **Production** (`main` branch → `https://maaker.cn`): `./scripts/deploy-prod.sh` → rsync to `/var/www/maaker-cn/`. Script refuses to run from non-main branch or with dirty tree.
  - **Staging** (`staging` branch → `https://staging.maaker.cn`): `./scripts/deploy-staging.sh` → rsync to `/var/www/maaker-cn-staging/`. No branch check — deploys whatever you have checked out.
  - **Workflow**: commit work on `staging` → deploy staging → manually verify in browser → `git checkout main && git merge staging` → deploy prod.
  - **Staging protections** (nginx-level, `/etc/nginx/sites-available/staging-maaker-cn`): `/robots.txt` hardcoded to full Disallow, `/sitemap.xml` → 404, `X-Robots-Tag: noindex, nofollow, noarchive` on every response. Don't add the staging URL to ziyuan.baidu.com or Google Search Console.
  - Credentials and nginx layout: `obsidian:Server/maaker-cn-服务器凭据.md`.
