import { test, expect, type Page } from "@playwright/test";

// Quality guards. Each one is a regression that reached the live site or was
// caught by hand on 2026-10-13; they run on the desktop and phone projects.
//
// 1. The first screen shows its content before JavaScript runs. Entrances used
//    to render `opacity: 0` and wait for hydration — seconds of blank page on a
//    mid-range phone. (Not the home page: its intro owns the first screen, and
//    its photo is visible underneath from the start.)
// 2. After scrolling to the bottom, no entrance block is still waiting
//    (a block jumped over in one go used to wait for a scroll back up).
// 3. No console errors or React warnings.
// 4. Small text (under 14 px) meets 4.5:1 contrast — the brand olive was
//    4.1:1 and labels were faded to 2–3:1. Text over a photo or video, and
//    disabled controls, are outside what this check can judge or require.
// 5. No duplicate ids (the hidden server article repeated section ids, so
//    getElementById scrolled to the hidden copy).

const PAGES = [
  "/es",
  "/en",
  "/es/farmtotable",
  "/es/casa",
  "/es/cafe",
  "/es/contact",
  "/es/sustainability",
  "/es/journal",
  "/es/team",
  "/es/carreras",
  "/es/press",
];

// Noise outside the site's control, or local-only gaps.
const IGNORED_CONSOLE = [
  /_vercel\/insights/, // only exists on Vercel
  /olivea-locator/, // needs the Google Maps key, absent locally and in CI
  /Failed to load resource/, // a third party or missing local key; real 404s are caught by the smoke suite
  /google|gtag|doubleclick|facebook|cloudbeds|opentable/i,
];

async function consent(page: Page, baseURL: string) {
  await page.context().addCookies([{ name: "olivea_consent", value: "granted", url: baseURL }]);
}

/** Scroll every scrolling container to the bottom in steps. */
async function scrollThrough(page: Page) {
  for (let i = 0; i < 40; i++) {
    const more = await page.evaluate(() => {
      let moved = false;
      for (const el of [document.scrollingElement, ...document.querySelectorAll("main, div")]) {
        if (!el || el.scrollHeight <= el.clientHeight + 50) continue;
        const oy = getComputedStyle(el).overflowY;
        if (el !== document.scrollingElement && oy !== "auto" && oy !== "scroll") continue;
        const before = el.scrollTop;
        el.scrollTop += 600;
        if (el.scrollTop !== before) moved = true;
      }
      return moved;
    });
    await page.waitForTimeout(100);
    if (!more) break;
  }
}

const HOME = new Set(["/es", "/en"]);

for (const path of PAGES) {
  test.describe(`quality ${path}`, () => {
    test("first screen is visible before JavaScript runs", async ({ page, baseURL }) => {
      test.skip(HOME.has(path), "the home intro owns the first screen");
      await consent(page, baseURL!);
      await page.route("**/_next/static/chunks/**", (r) => r.abort());
      await page.goto(path, { waitUntil: "load" });
      await page.waitForTimeout(1500); // CSS entrances finish

      const hidden = await page.evaluate(() => {
        const out: string[] = [];
        for (const el of document.querySelectorAll<HTMLElement>("main *")) {
          const b = el.getBoundingClientRect();
          if (b.width < 40 || b.height < 16 || b.top >= innerHeight || b.bottom <= 0) continue;
          const ownText = [...el.childNodes].some((n) => n.nodeType === 3 && (n.textContent ?? "").trim().length > 2);
          if (!ownText) continue;
          let o = 1;
          for (let a: HTMLElement | null = el; a; a = a.parentElement) {
            const cs = getComputedStyle(a);
            if (cs.visibility === "hidden" || cs.display === "none") o = 0;
            o *= Number(cs.opacity);
          }
          if (o < 0.5) out.push(`${el.tagName}.${String(el.className).slice(0, 50)}`);
        }
        return out;
      });
      expect(hidden, "text on the first screen that waits for JavaScript").toEqual([]);
    });

    test("no block left invisible, no console errors, no duplicate ids", async ({ page, baseURL }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
      page.on("console", (m) => {
        if (m.type() !== "error" && m.type() !== "warning") return;
        const text = m.text();
        if (IGNORED_CONSOLE.some((r) => r.test(text))) return;
        errors.push(`${m.type()}: ${text.slice(0, 200)}`);
      });
      await consent(page, baseURL!);
      await page.goto(path, { waitUntil: "load" });
      await page.waitForTimeout(HOME.has(path) ? 7000 : 1200); // home intro
      await scrollThrough(page);
      await page.waitForTimeout(1500);

      const stuck = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>("[data-reveal]")]
          .filter((e) => e.offsetParent !== null && e.dataset.revealState === "waiting")
          .map((e) => `${e.tagName}#${e.id}.${String(e.className).slice(0, 40)} state=${e.dataset.revealState}`)
      );
      expect(stuck, "entrance blocks still waiting after scrolling").toEqual([]);

      const dupIds = await page.evaluate(() => {
        const ids = [...document.querySelectorAll("[id]")].map((e) => e.id).filter(Boolean);
        return [...new Set(ids.filter((x, i) => ids.indexOf(x) !== i))];
      });
      expect(dupIds, "duplicate ids").toEqual([]);

      expect(errors, "console errors and warnings").toEqual([]);
    });

    test("small text meets 4.5:1 contrast", async ({ page, baseURL }) => {
      await consent(page, baseURL!);
      await page.emulateMedia({ reducedMotion: "reduce" }); // final colours, no entrances
      await page.goto(path, { waitUntil: "load" });
      await page.waitForTimeout(1500);

      const failures = await page.evaluate(() => {
        type RGBA = [number, number, number, number];
        const parse = (c: string): RGBA | null => {
          const m = c.match(/[\d.]+/g);
          if (!m || !c.startsWith("rgb")) return null;
          return [+m[0], +m[1], +m[2], m[3] === undefined ? 1 : +m[3]];
        };
        const lum = ([r, g, b]: RGBA) => {
          const f = (v: number) => {
            const s = v / 255;
            return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
          };
          return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
        };
        const over = (fg: RGBA, bg: RGBA): RGBA => [
          fg[0] * fg[3] + bg[0] * (1 - fg[3]),
          fg[1] * fg[3] + bg[1] * (1 - fg[3]),
          fg[2] * fg[3] + bg[2] * (1 - fg[3]),
          1,
        ];
        /** Solid background behind an element, or null if it sits on an image/gradient. */
        const background = (el: Element): RGBA | null => {
          const layers: RGBA[] = [];
          for (let a: Element | null = el; a; a = a.parentElement) {
            const cs = getComputedStyle(a);
            if (cs.backgroundImage !== "none") return null;
            const c = parse(cs.backgroundColor);
            if (c && c[3] > 0) {
              layers.push(c);
              if (c[3] >= 0.99) break;
            }
          }
          let bg: RGBA = [255, 255, 255, 1];
          for (const l of layers.reverse()) bg = over(l, bg);
          return bg;
        };

        const out: string[] = [];
        for (const el of document.querySelectorAll<HTMLElement>("body *")) {
          const own = [...el.childNodes].some((n) => n.nodeType === 3 && (n.textContent ?? "").trim().length > 1);
          if (!own || el.closest("[aria-hidden='true'], .ssr-article, .sr-only, video, svg, iframe")) continue;
          if (el.closest("button:disabled, [aria-disabled='true']")) continue;
          const b = el.getBoundingClientRect();
          if (b.width === 0 || b.height === 0) continue;
          const cs = getComputedStyle(el);
          if (cs.visibility === "hidden") continue;
          if (parseFloat(cs.fontSize) >= 14) continue;

          let opacity = 1;
          for (let a: Element | null = el; a; a = a.parentElement) opacity *= Number(getComputedStyle(a).opacity);
          if (opacity < 0.05) continue; // not shown (closed menus, hover-only)

          // Text drawn over a photo or video (not its own ancestor): no solid background to judge.
          const cx = b.left + b.width / 2;
          const cy = b.top + b.height / 2;
          const stack = document.elementsFromPoint(cx, cy);
          if (stack.some((s) => /^(VIDEO|IMG|CANVAS|PICTURE)$/.test(s.tagName) && !s.contains(el))) continue;

          const fg = parse(cs.color);
          const bg = background(el);
          if (!fg || !bg) continue;
          const text = over([fg[0], fg[1], fg[2], fg[3] * opacity], bg);
          const [hi, lo] = [lum(text), lum(bg)].sort((x, y) => y - x);
          const ratio = (hi + 0.05) / (lo + 0.05);
          if (ratio < 4.5) {
            out.push(`${ratio.toFixed(2)} "${(el.textContent ?? "").trim().slice(0, 30)}" ${el.tagName}.${String(el.className).slice(0, 60)}`);
          }
        }
        return [...new Set(out)];
      });
      expect(failures, "small text under 4.5:1").toEqual([]);
    });
  });
}
