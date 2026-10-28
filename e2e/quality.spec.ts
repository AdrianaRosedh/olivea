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
// 6. With Reduce Motion on, the page's text is visible once loaded (Journal
//    articles stayed at opacity 0: the entrance was cancelled, not finished).
// 7. Link previews: every page shares with a title, description, address and
//    a picture that loads (the home page's pointed at a missing file, and seven
//    pages had no picture at all).

const PAGES = [
  "/es",
  "/en",
  "/es/farmtotable",
  "/es/casa",
  "/es/cafe",
  "/es/contact",
  "/es/sustainability",
  "/es/journal",
  "/es/journal/2026-04-15-lo-que-la-tierra-ya-sabe",
  "/es/team",
  "/es/carreras",
  "/es/press",
  "/es/menu",
  "/es/innovation",
  "/es/roseiies",
  "/es/legal",
  "/es/team/ange",
  "/es/journal/author/danielnates",
  "/es/pagina-que-no-existe",
  "/en/farmtotable",
  "/en/casa",
  "/en/cafe",
  "/en/contact",
  "/en/sustainability",
  "/en/journal",
  "/en/journal/2026-04-15-lo-que-la-tierra-ya-sabe",
  "/en/carreras",
  "/en/press",
  "/en/menu",
  "/en/innovation",
  "/en/legal",
];

// Noise outside the site's control, or local-only gaps.
const IGNORED_CONSOLE = [
  /_vercel\/insights/, // only exists on Vercel
  /olivea-locator/, // needs the Google Maps key, absent locally and in CI
  /Failed to load resource/, // a third party or missing local key; real 404s are caught by the smoke suite
  /google|gtag|doubleclick|facebook|cloudbeds|opentable/i,
  /Cloudflare Turnstile|challenges\.cloudflare\.com|No available adapters/, // the anti-spam widget, live only
  /^%c%d font-size:0;color:transparent/, // the same widget's invisible console probe
  /GL Driver Message/, // the browser's GPU driver, under the Google Map (live only)
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
      // Scripts only: the stylesheets live in the same chunks folder, and a slow
      // phone has its CSS — it is the JavaScript that has not run yet.
      await page.route(/\/_next\/static\/chunks\/.*\.js(\?|$)/, (r) => r.abort());
      await page.goto(path, { waitUntil: "load" });
      await page.waitForTimeout(1500); // CSS entrances finish

      const hidden = await page.evaluate(() => {
        const out: string[] = [];
        for (const el of document.querySelectorAll<HTMLElement>("main *")) {
          const b = el.getBoundingClientRect();
          if (b.width < 40 || b.height < 16 || b.top >= innerHeight || b.bottom <= 0) continue;
          if (b.left >= innerWidth || b.right <= 0 || el.closest("[aria-hidden='true']")) continue;
          const ownText = [...el.childNodes].some((n) => n.nodeType === 3 && (n.textContent ?? "").trim().length > 2);
          if (!ownText) continue;
          let o = 1;
          for (let a: HTMLElement | null = el; a; a = a.parentElement) {
            const cs = getComputedStyle(a);
            // Deliberately hidden (visibility/display) is not "waiting for JavaScript".
            if (cs.visibility === "hidden" || cs.display === "none") o = NaN;
            o *= Number(cs.opacity);
          }
          if (o < 0.5) out.push(`${el.tagName}.${String(el.className).slice(0, 50)}`);
        }
        return out;
      });
      expect(hidden, "text on the first screen that waits for JavaScript").toEqual([]);
    });

    test("with Reduce Motion on, the text on screen is visible", async ({ page, baseURL }) => {
      await consent(page, baseURL!);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(path, { waitUntil: "load" });
      await page.waitForTimeout(2000);
      const hidden = await page.evaluate(() => {
        const out: string[] = [];
        for (const el of document.querySelectorAll<HTMLElement>("main *")) {
          const b = el.getBoundingClientRect();
          if (b.width < 40 || b.height < 16 || b.top >= innerHeight || b.bottom <= 0) continue;
          if (b.left >= innerWidth || b.right <= 0 || el.closest("[aria-hidden='true']")) continue;
          // Shown on hover and keyboard focus by design (the home cards' line).
          if (el.closest("[data-hover-reveal]")) continue;
          const ownText = [...el.childNodes].some((n) => n.nodeType === 3 && (n.textContent ?? "").trim().length > 2);
          if (!ownText) continue;
          let o = 1;
          for (let a: HTMLElement | null = el; a; a = a.parentElement) {
            const cs = getComputedStyle(a);
            // Deliberately hidden (visibility/display) is not "stuck invisible".
            if (cs.visibility === "hidden" || cs.display === "none") o = NaN;
            o *= Number(cs.opacity);
          }
          if (o < 0.5) out.push(`${el.tagName}.${String(el.className).slice(0, 50)}`);
        }
        return out;
      });
      expect(hidden, "text left invisible with Reduce Motion").toEqual([]);
    });

    test("no block left invisible, no console errors, no duplicate ids", async ({ page, baseURL }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
      page.on("console", (m) => {
        if (m.type() !== "error" && m.type() !== "warning") return;
        const text = m.text();
        if (IGNORED_CONSOLE.some((r) => r.test(text))) return;
        // Anything the Cloudflare anti-spam frame logs is the widget's own.
        if (/^https:\/\/challenges\.cloudflare\.com\//.test(m.location().url)) return;
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

    test("link preview has a title, description and a picture that loads", async ({ page, request }) => {
      test.skip(test.info().project.name !== "chromium", "server HTML is the same for every device");
      test.skip(path.includes("no-existe"), "an error page is not shared");
      await page.goto(path, { waitUntil: "domcontentloaded" });
      const og = await page.evaluate(() => {
        const m = (k: string) =>
          document.querySelector<HTMLMetaElement>(`meta[property="${k}"], meta[name="${k}"]`)?.content ?? null;
        return {
          title: m("og:title"),
          description: m("og:description"),
          url: m("og:url"),
          image: m("og:image"),
          twitterCard: m("twitter:card"),
        };
      });
      expect(og.title, "og:title").toBeTruthy();
      expect(og.description, "og:description").toBeTruthy();
      expect(og.url, "og:url").toBeTruthy();
      expect(og.twitterCard, "twitter:card").toBe("summary_large_image");
      expect(og.image, "og:image").toBeTruthy();
      // Same file served locally: the production host in the URL is swapped for this one.
      const local = new URL(og.image!).pathname;
      const res = await request.get(local);
      expect(res.status(), `og:image ${local}`).toBe(200);
      expect(res.headers()["content-type"], `og:image ${local}`).toMatch(/^image\//);
    });

    test("small text meets 4.5:1 contrast", async ({ page, baseURL }) => {
      await consent(page, baseURL!);
      await page.emulateMedia({ reducedMotion: "reduce" }); // final colours, no entrances
      await page.goto(path, { waitUntil: "load" });
      await page.waitForTimeout(1500);

      const failures = await page.evaluate(() => {
        type RGBA = [number, number, number, number];
        // Any CSS colour, read back through a canvas: Tailwind v4 writes
        // translucent colours as oklab(), which a plain rgb() parser skipped.
        const ink = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
        const parse = (c: string): RGBA | null => {
          if (!c || c === "transparent") return null;
          ink.clearRect(0, 0, 1, 1);
          ink.fillStyle = "#000";
          ink.fillStyle = c;
          ink.fillRect(0, 0, 1, 1);
          const [r, g, b, a] = ink.getImageData(0, 0, 1, 1).data;
          return [r, g, b, a / 255];
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
        /** Solid background behind an element, or null if it sits on an image/gradient.
         *  Read from what is painted under the text's centre, not only its
         *  ancestors: a selected tab's pill is a sibling layer behind the label. */
        const background = (el: Element, x: number, y: number): RGBA | null => {
          let stack = document.elementsFromPoint(x, y);
          if (!stack.some((s) => s === el || s.contains(el))) {
            // Off screen nothing is painted to ask about: bring it into view.
            el.scrollIntoView({ block: "center", inline: "center", behavior: "instant" });
            const r = el.getBoundingClientRect();
            stack = document.elementsFromPoint(r.left + r.width / 2, r.top + r.height / 2);
          }
          const at = stack.findIndex((s) => s === el || s.contains(el));
          const under: Element[] = [];
          if (at >= 0) under.push(...stack.slice(at));
          else for (let a: Element | null = el; a; a = a.parentElement) under.push(a);
          const layers: RGBA[] = [];
          for (const a of under) {
            if (/^(VIDEO|IMG|CANVAS|PICTURE)$/.test(a.tagName)) return null; // over a photo
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
        // What is on screen first: reading text further down scrolls the page,
        // and a scroll moves the chapter docks' highlight (fixed, always on
        // screen) mid-transition.
        const all = [...document.querySelectorAll<HTMLElement>("body *")];
        const onScreen = (e: Element) => {
          const r = e.getBoundingClientRect();
          return r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
        };
        const ordered = [...all.filter(onScreen), ...all.filter((e) => !onScreen(e))];
        for (const el of ordered) {
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

          // Scrolled out of sight inside its own panel (a dock taller than
          // the room it is given): clipped, so not on screen to judge.
          const mx = b.left + b.width / 2;
          const my = b.top + b.height / 2;
          let clipped = false;
          for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
            const o = getComputedStyle(a);
            if (o.overflowX === "visible" && o.overflowY === "visible") continue;
            const r = a.getBoundingClientRect();
            if (mx < r.left || mx > r.right || my < r.top || my > r.bottom) { clipped = true; break; }
          }
          if (clipped) continue;

          // Text drawn over a photo or video (not its own ancestor): no solid background to judge.
          const cx = b.left + b.width / 2;
          const cy = b.top + b.height / 2;
          const stack = document.elementsFromPoint(cx, cy);
          if (stack.some((s) => /^(VIDEO|IMG|CANVAS|PICTURE)$/.test(s.tagName) && !s.contains(el))) continue;

          const fg = parse(cs.color);
          const bg = background(el, cx, cy);
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
