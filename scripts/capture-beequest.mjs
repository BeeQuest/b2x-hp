/**
 * BeeQuest アプリ画面キャプチャ
 *
 * Usage:
 *   node scripts/capture-beequest.mjs
 *   BEEQUEST_BASE_URL=http://localhost:9002 node scripts/capture-beequest.mjs
 *   BEEQUEST_EMAIL=... BEEQUEST_PASSWORD=... node scripts/capture-beequest.mjs
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "../images/beequest");
const BASE = process.env.BEEQUEST_BASE_URL || "https://beequest.app";
const EMAIL = process.env.BEEQUEST_EMAIL || "";
const PASSWORD = process.env.BEEQUEST_PASSWORD || "";

const TARGETS = [
  { name: "app-home", path: "/", wait: 2000 },
  { name: "app-boards", path: "/boards", wait: 2500 },
  { name: "app-dashboard", path: "/dashboard", wait: 2500 },
  { name: "app-board-editor", path: "/board-editor", wait: 2500 },
  { name: "app-ranking", path: "/ranking", wait: 2500 },
];

async function maybeLogin(page) {
  if (!EMAIL || !PASSWORD) return false;
  const loginUrls = [`${BASE}/login`, `${BASE}/signin`, `${BASE}/`];
  for (const url of loginUrls) {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 }).catch(() => null);
    const email = page.locator('input[type="email"], input[name="email"]').first();
    const pass = page.locator('input[type="password"]').first();
    if ((await email.count()) && (await pass.count())) {
      await email.fill(EMAIL);
      await pass.fill(PASSWORD);
      const submit = page.locator('button[type="submit"]').first();
      if (await submit.count()) await submit.click();
      await page.waitForTimeout(3000);
      return true;
    }
  }
  return false;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  console.log(`Base: ${BASE}`);
  const loggedIn = await maybeLogin(page);
  console.log(`Login: ${loggedIn ? "ok" : "skipped/unavailable"}`);

  for (const t of TARGETS) {
    const url = `${BASE}${t.path}`;
    const out = path.join(OUT_DIR, `${t.name}.png`);
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
      await page.waitForTimeout(t.wait);
      await page.screenshot({ path: out, fullPage: false });
      console.log(`OK  ${t.name} <- ${url}`);
    } catch (e) {
      console.error(`NG  ${t.name}: ${e.message}`);
    }
  }

  await browser.close();
  console.log(`Saved to ${OUT_DIR}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
