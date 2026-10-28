import { test, expect, type Page } from "@playwright/test";

// Home card → section page. The transition's logo must be the size of, and sit
// on, the destination hero's logo (it used to be a ~40 px mark in a 96 px box
// that then cut to a 170–260 px logo elsewhere), and the page must be there
// quickly (it used to take ~2.3–2.6 s, mostly a flat green pause).

const SECTIONS = ["farmtotable", "casa", "cafe"] as const;

// The promise is 2.5 s (it measures ~1.85 s on a laptop, ~2.05 s with the CPU
// slowed 4x). GitHub's runners draw without a GPU, so the same build takes
// 2.5–3.6 s there whatever the code does, and the guard failed or passed by
// runner luck. CI gets room for that; anything slower is still a regression.
const PAGE_WITHIN_MS = process.env.CI ? 4_000 : 2_500;
const LOGO = { farmtotable: "herofarm.svg", casa: "herocasa.svg", cafe: "herocafe.svg" } as const;

async function openHome(page: Page, baseURL: string) {
  await page.context().addCookies([{ name: "olivea_consent", value: "granted", url: baseURL }]);
  await page.goto("/es", { waitUntil: "load" });
  await page.locator(".intro-overlay").waitFor({ state: "detached", timeout: 20_000 });
}

/** The transition logo's box while the panel covers the page. */
async function transitionLogoBox(page: Page, file: string) {
  return page.evaluate((name) => {
    const img = [...document.querySelectorAll<HTMLImageElement>("body > div img")].find((i) =>
      (i.currentSrc || i.src).includes(name) && getComputedStyle(i.closest("div[style*='fixed']") ?? i).position === "fixed"
    );
    const r = img?.getBoundingClientRect();
    return r ? { w: Math.round(r.width), cx: Math.round(r.left + r.width / 2), cy: Math.round(r.top + r.height / 2) } : null;
  }, file);
}

for (const section of SECTIONS) {
  test(`card → /es/${section}: big logo that lands on the hero logo, page within 2.5 s`, async ({ page, baseURL }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await openHome(page, baseURL!);

    const started = Date.now();
    await page.locator(`main nav:not(.sr-only) a[href="/es/${section}"]`).filter({ visible: true }).first().click();

    // While covered: the transition logo is large.
    await page.waitForTimeout(450);
    const during = await transitionLogoBox(page, LOGO[section]);
    expect(during, "transition logo shown").not.toBeNull();
    expect(during!.w).toBeGreaterThanOrEqual(150);

    await page.waitForURL(`**/es/${section}`);
    // The panel (z-index 2147483646) is gone.
    await page.waitForFunction(
      () => ![...document.querySelectorAll("body > div")].some((d) => getComputedStyle(d).zIndex === "2147483646"),
      null,
      { timeout: 5_000 }
    );
    expect(Date.now() - started).toBeLessThan(PAGE_WITHIN_MS);

    // The destination logo sits where the transition logo was.
    const dest = await page.evaluate((name) => {
      const img = [...document.querySelectorAll<HTMLImageElement>("main img, section img")].find((i) =>
        (i.currentSrc || i.src).includes(name)
      );
      const r = img?.getBoundingClientRect();
      return r ? { w: Math.round(r.width), cx: Math.round(r.left + r.width / 2), cy: Math.round(r.top + r.height / 2) } : null;
    }, LOGO[section]);
    expect(dest).not.toBeNull();
    expect(Math.abs(dest!.w - during!.w)).toBeLessThanOrEqual(24);
    expect(Math.abs(dest!.cx - during!.cx)).toBeLessThanOrEqual(24);
    expect(errors).toEqual([]);
  });
}
