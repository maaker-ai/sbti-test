import { test, expect } from '@playwright/test';

/**
 * Full E2E: walk the SBTI test from landing to result page, asserting the
 * auto-advance-on-last-answer flow and that the global counter increments by 1.
 *
 * Uses staging Supabase schema (see .env.local). We don't clear data; we just
 * capture the counter before and assert it goes up by exactly 1.
 */

const COUNTER_RE = /已有\s+([\d,]+)\s+人测过/;

async function readCounter(page: import('@playwright/test').Page): Promise<number> {
  await page.goto('/sbti');
  // VisitorCount mounts client-side and resolves async; give it a bit.
  const locator = page.getByText(COUNTER_RE);
  await expect(locator).toBeVisible({ timeout: 10_000 });
  const text = await locator.textContent();
  const m = text?.match(COUNTER_RE);
  if (!m) throw new Error(`Counter text did not match: ${text}`);
  return parseInt(m[1].replace(/,/g, ''), 10);
}

test('complete test flow auto-advances to result page and increments counter', async ({ page }) => {
  // --- Step 1: read starting counter
  const beforeCount = await readCounter(page);

  // --- Step 2: go into test page
  await page.goto('/sbti/test');

  // Wait for first question to render (Q1 marker + at least one option button)
  await expect(page.locator('text=/^Q\\d+$/').first()).toBeVisible({ timeout: 10_000 });

  // --- Step 3: answer all questions. Auto-advance is 350ms; we rely on
  // Playwright auto-wait for option buttons to be clickable.
  const MAX_ANSWERS = 35;
  let answered = 0;

  for (let i = 0; i < MAX_ANSWERS; i++) {
    // If we've already navigated to result, bail.
    if (/\/sbti\/result/.test(page.url())) break;

    // Capture current question text to detect progression.
    const qHeader = page.locator('text=/^Q\\d+$/').first();
    await qHeader.waitFor({ state: 'visible', timeout: 10_000 });
    const prevQ = await qHeader.textContent();

    // Find the first option button (label "A" inside a square badge).
    // Options are <button> with a child span whose text is exactly "A".
    const optionA = page
      .locator('button', { has: page.locator('span', { hasText: /^A$/ }) })
      .first();
    await optionA.click();
    answered++;

    // Wait for either: question number advances OR we land on /result.
    await Promise.race([
      page.waitForURL(/\/sbti\/result/, { timeout: 15_000 }).catch(() => null),
      page
        .waitForFunction(
          (prev) => {
            const el = document.querySelector('h2, span');
            // Look for any element whose textContent matches /^Q\d+$/ and differs from prev
            const all = Array.from(document.querySelectorAll('span, div, h2'));
            return all.some((n) => {
              const t = n.textContent?.trim();
              return t && /^Q\d+$/.test(t) && t !== prev;
            });
          },
          prevQ,
          { timeout: 15_000 }
        )
        .catch(() => null),
    ]);

    if (/\/sbti\/result/.test(page.url())) break;
  }

  // --- Step 4: assert we ended up on the result page
  await expect(page).toHaveURL(/\/sbti\/result\?r=/, { timeout: 15_000 });

  // Wait for result render: diagnosis file header
  await expect(
    page.getByText(/SBTI Bullshit 病历档案 · No\.\d{4}/).first()
  ).toBeVisible({ timeout: 15_000 });

  // Diagnosis stamp
  await expect(
    page
      .getByText(/第\s*\d+\s*位\s*\S+型\s*患者\s*·\s*\d{4}\.\d{2}\.\d{2}\s*确诊/)
      .first()
  ).toBeVisible();

  // Match badge
  await expect(page.getByText(/匹配度\s+\d+%/).first()).toBeVisible();

  // sessionStorage completion
  const ss = await page.evaluate(() => sessionStorage.getItem('sbti:completion'));
  expect(ss).not.toBeNull();
  const parsed = JSON.parse(ss!);
  expect(parsed.globalId).toBeGreaterThan(0);
  expect(parsed.typeId).toBeGreaterThan(0);
  expect(parsed.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);

  // --- Step 5: counter went up by exactly 1
  const afterCount = await readCounter(page);
  expect(afterCount).toBe(beforeCount + 1);
});
