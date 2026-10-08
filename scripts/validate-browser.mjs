import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const root = path.resolve("dist");
const mime = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".svg": "image/svg+xml",
};
const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, "http://localhost");
    if (!url.pathname.startsWith("/preview/")) throw Error("Outside preview");
    const file = path.resolve(
      root,
      "." + decodeURIComponent(url.pathname.slice("/preview".length)),
      url.pathname.endsWith("/") ? "index.html" : "",
    );
    if (!file.startsWith(root + path.sep)) throw Error("Outside export");
    const body = await readFile(file);
    response.writeHead(200, {
      "Content-Type": mime[path.extname(file)] ?? "application/octet-stream",
    });
    response.end(body);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const base = `http://127.0.0.1:${server.address().port}/preview/`;
const report = {
  checks: [],
  layouts: [],
  axe: [],
  contrast: [],
  errors: [],
  limitations: [
    "Chromium only; emulated viewports, not physical devices.",
    "No screen-reader session or browser-native 200% zoom.",
    "External X and mirror availability is not guaranteed.",
    "Hero text contrast over artwork is visually reviewed, not exhaustively pixel-measured.",
  ],
};
let browser;
try {
  browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    headless: true,
    args: ["--no-sandbox"],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();
  page.on("pageerror", (error) => report.errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") report.errors.push(message.text());
  });
  page.on("response", (response) => {
    if (response.url().startsWith(base) && response.status() >= 400)
      report.errors.push(`${response.status()} ${response.url()}`);
  });
  page.on("requestfailed", (request) =>
    report.errors.push(`${request.url()} ${request.failure()?.errorText}`),
  );
  const check = (name) => {
    report.checks.push(name);
    console.log(`PASS ${name}`);
  };
  const count = async (expected) =>
    assert.equal(await page.locator("article").count(), expected);
  const setQuery = async (text) => {
    await page.getByRole("searchbox", { name: "Search tweets" }).fill(text);
  };
  const feed = async () => {
    await page.locator('.main-nav a[href="#feed"]').click();
  };
  await page.goto(base);
  await page.evaluate(() => document.fonts.ready);
  await count(8);
  assert.ok(
    await page.evaluate(() => document.fonts.check("600 16px Manrope")),
  );
  assert.ok(
    await page.evaluate(() =>
      [...document.images].every(
        (image) => image.complete && image.naturalWidth > 0,
      ),
    ),
  );
  check("Production export, image and local font load under /preview/");

  await page.keyboard.press("Tab");
  assert.equal(await page.locator(":focus").textContent(), "Skip to content");
  await page.keyboard.press("Enter");
  assert.equal(await page.locator(":focus").getAttribute("id"), "main");
  await page.keyboard.press("/");
  assert.equal(await page.locator(":focus").getAttribute("name"), "search");
  check("Keyboard skip link and / search shortcut");
  await setQuery("HaCkAtHoN");
  await count(1);
  await page
    .locator(".topic-filters")
    .getByRole("button", { name: "Community", exact: true })
    .click();
  await count(0);
  assert.match(await page.locator(".empty-state").textContent(), /No signal/);
  await page
    .getByRole("button", { name: "Clear filters", exact: true })
    .click();
  await count(8);
  assert.equal(await page.locator(":focus").getAttribute("name"), "search");
  for (const topic of ["AI agents", "Builders", "Community", "Ecosystem"]) {
    await page
      .locator(".topic-filters")
      .getByRole("button", { name: topic, exact: true })
      .click();
    await count(2);
  }
  await page
    .locator(".topic-filters")
    .getByRole("button", { name: "All tweets", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Sort tweets" })
    .selectOption("views");
  assert.match(
    await page.locator("article h3").first().textContent(),
    /An identity/,
  );
  assert.match(
    await page.locator("article h3").last().textContent(),
    /From an idea/,
  );
  await page
    .getByRole("combobox", { name: "Sort tweets" })
    .selectOption("author");
  assert.match(
    await page.locator("article h3").first().textContent(),
    /hackathon/,
  );
  check(
    "Search, all topics, combined empty state, clear recovery, view/author sorting",
  );

  await setQuery("hackathon");
  await page.locator(".save-button").focus();
  await page.keyboard.press("Space");
  assert.equal(
    await page.locator(".save-button").getAttribute("aria-pressed"),
    "true",
  );
  await page.locator('.main-nav a[href="#saved"]').click();
  await count(1);
  await page.reload();
  await count(1);
  assert.match(await page.locator("article h3").textContent(), /hackathon/);
  await page.locator(".save-button").click();
  await count(0);
  assert.match(
    await page.locator(".empty-state").textContent(),
    /Keep a little signal/,
  );
  await page
    .getByRole("link", { name: "Explore the feed", exact: true })
    .click();
  await count(8);
  check(
    "Keyboard save, saved hash route, persistence after reload, unsave, empty collection recovery",
  );

  await page.locator(".source-note").first().click();
  assert.ok(await page.locator("dialog").evaluate((dialog) => dialog.open));
  assert.equal(
    await page.locator(":focus").getAttribute("aria-label"),
    "Close information",
  );
  for (let index = 0; index < 8; index++) {
    await page.keyboard.press("Tab");
    assert.ok(
      await page
        .locator(":focus")
        .evaluate((element) => Boolean(element.closest("dialog"))),
    );
  }
  await page.keyboard.press("Escape");
  assert.match(
    await page.locator(":focus").getAttribute("aria-label"),
    /Source notes/,
  );
  await page
    .getByRole("button", { name: "About the signal", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  assert.match(await page.locator("dialog").textContent(), /not a live feed/);
  const dialogAxe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  report.axe.push({
    state: "About dialog",
    violations: dialogAxe.violations,
    incomplete: dialogAxe.incomplete.map((item) => item.id),
  });
  await page.keyboard.press("Escape");
  assert.equal(await page.locator(":focus").textContent(), "About the signal");
  check(
    "Source dialog, modal focus trap, Escape, focus return, keyboard About dialog",
  );

  await page.evaluate(() =>
    localStorage.setItem("identitymd-signal:saved:v1", "{bad-json"),
  );
  await page.reload();
  await count(8);
  assert.equal(await page.locator(".nav-count").textContent(), "0");
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Storage unavailable", "SecurityError");
    };
  });
  await page.locator(".save-button").first().click();
  assert.match(
    await page.locator(".toast").textContent(),
    /Saved for this visit/,
  );
  assert.equal(
    await page.locator(".save-button").first().getAttribute("aria-pressed"),
    "true",
  );
  await page.getByRole("button", { name: "Dismiss notification" }).click();
  await page.reload();
  check("Corrupt local storage recovery and blocked storage fallback");

  await page.locator(".topic-row").filter({ hasText: "Builders" }).click();
  await count(2);
  await feed();
  await count(8);
  await page.locator('.main-nav a[href="#saved"]').click();
  await page.goBack();
  assert.match(await page.locator("#feed-title").textContent(), /On the radar/);
  await page.goto(base);
  const links = await page
    .locator('a[href^="https:"]')
    .evaluateAll((elements) =>
      elements.map((element) => ({
        href: element.href,
        target: element.target,
        rel: element.rel,
      })),
    );
  assert.ok(
    links.length > 10 &&
      links.every(
        (link) =>
          new URL(link.href).protocol === "https:" &&
          link.target === "_blank" &&
          link.rel.includes("noreferrer"),
      ),
  );
  check(
    "Right-rail topic navigation, browser Back, external source link integrity",
  );

  await mkdir("artifacts", { recursive: true });
  for (const width of [320, 390, 768, 1020, 1440]) {
    await page.setViewportSize({ width, height: width > 1020 ? 1000 : 844 });
    await page.evaluate(() => scrollTo(0, 0));
    const layout = await page.evaluate(() => ({
      width: innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      bodyFont: getComputedStyle(document.body).fontFamily,
      inputSize: getComputedStyle(document.querySelector("input")).fontSize,
    }));
    report.layouts.push(layout);
    assert.ok(
      layout.scrollWidth <= width,
      `Horizontal overflow at ${width}: ${layout.scrollWidth}`,
    );
    if (width <= 740) assert.ok(parseFloat(layout.inputSize) >= 16);
    if ([320, 390, 1440].includes(width))
      await page.screenshot({
        path: `artifacts/viewport-${width}.webp`,
        type: "webp",
      });
    if ([320, 1440].includes(width)) {
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      report.axe.push({
        state: `Feed ${width}px`,
        violations: result.violations,
        incomplete: result.incomplete.map((item) => item.id),
      });
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator("#feed").scrollIntoViewIfNeeded();
  await page.screenshot({ path: "artifacts/mobile-feed.webp", type: "webp" });
  check(
    "No horizontal overflow at 320, 390, 768, 1020 and 1440px; mobile inputs >=16px",
  );

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page
    .getByRole("button", { name: "About the signal", exact: true })
    .focus();
  await page.keyboard.press("Tab");
  await page.screenshot({
    path: "artifacts/keyboard-focus.webp",
    type: "webp",
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  assert.equal(
    await page
      .locator(".primary-button")
      .evaluate((element) => getComputedStyle(element).transitionDuration),
    "0s",
  );
  await page.emulateMedia({ forcedColors: "active" });
  assert.notEqual(
    await page
      .locator(":focus")
      .evaluate((element) => getComputedStyle(element).outlineStyle),
    "none",
  );
  await page.emulateMedia({
    forcedColors: "none",
    reducedMotion: "no-preference",
  });
  await page.evaluate(() => (document.documentElement.style.fontSize = "200%"));
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await page.evaluate(() => (document.documentElement.style.fontSize = ""));
  check(
    "Reduced motion, forced-colors focus outline and 200% root-text reflow",
  );

  report.contrast = await page.evaluate(() => {
    const luminance = (color) => {
      const channels = color
        .match(/[\d.]+/g)
        .slice(0, 3)
        .map(Number)
        .map((value) => {
          const x = value / 255;
          return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
        });
      return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
    };
    const pairs = [
      ["card heading", "article h3", "article"],
      ["card body", "article p", "article"],
      ["muted author", ".post-author>span", "article"],
      ["topic filter", ".topic-filters button:not(.selected)", "body"],
      [
        "selected filter",
        ".topic-filters .selected",
        ".topic-filters .selected",
      ],
      ["primary action", ".primary-button", ".primary-button"],
      ["right rail note", ".field-note p", ".field-note"],
    ];
    return pairs.map(([name, foreground, background]) => {
      const fg = getComputedStyle(document.querySelector(foreground)).color;
      let bg = getComputedStyle(
        document.querySelector(background),
      ).backgroundColor;
      if (bg === "rgba(0, 0, 0, 0)")
        bg = getComputedStyle(document.documentElement).backgroundColor;
      const a = luminance(fg),
        b = luminance(bg);
      return {
        name,
        foreground: fg,
        background: bg,
        ratio: Number(
          ((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)).toFixed(2),
        ),
      };
    });
  });
  assert.ok(report.contrast.every((pair) => pair.ratio >= 4.5));
  check("Seven computed solid-surface text contrast pairs meet 4.5:1");
  assert.equal(
    report.errors.length,
    0,
    `Browser errors: ${report.errors.join("; ")}`,
  );
  assert.ok(
    report.axe.every((scan) => scan.violations.length === 0),
    "Automated accessibility violations; see artifacts/browser-results.json",
  );
  check(
    "No browser console/resource errors; no axe A/AA violations in tested states",
  );
} finally {
  await mkdir("artifacts", { recursive: true });
  await writeFile(
    "artifacts/browser-results.json",
    JSON.stringify(report, null, 2) + "\n",
  );
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
