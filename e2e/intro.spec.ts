import { test, expect, type Page } from "@playwright/test";

// The home intro: green screen → alebrije draws → the screen shrinks into the
// hero. It used to run on two clocks, so on slower phones the morph started
// before the alebrije had drawn — or before it had appeared at all (measured
// on the live site: 1 load in 6 never showed it). These tests pin the order.

const HOME = "/es";

type Sample = { drawn: number; morphing: boolean; overlay: boolean };

/** Fraction of the alebrije's lines drawn, and whether the morph has begun. */
async function sample(page: Page): Promise<Sample | null> {
  return page
    .evaluate(() => {
      const svg = document.querySelector(".fixed.z-50 svg");
      let drawn = 0;
      if (svg && getComputedStyle(svg).visibility === "visible") {
        const shapes = [...svg.querySelectorAll("path, polygon")].filter((_, i) => i % 7 === 0);
        drawn =
          shapes.reduce((sum, el) => {
            const cs = getComputedStyle(el);
            const dash = parseFloat(cs.strokeDasharray) || 0;
            const offset = parseFloat(cs.strokeDashoffset) || 0;
            if (parseFloat(cs.strokeOpacity) < 0.5) return sum;
            return sum + (dash ? 1 - offset / dash : 1);
          }, 0) / Math.max(1, shapes.length);
      }
      const inner = document.querySelector(".intro-overlay > div");
      const clip = inner ? getComputedStyle(inner).clipPath : "";
      const morphing = !!clip && clip !== "none" && !/inset\(0px( 0px)*( round 0px)?\)/.test(clip);
      return { drawn, morphing, overlay: !!document.querySelector(".intro-overlay") };
    })
    .catch(() => null);
}

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    const text = m.text();
    // Vercel Analytics is served only on Vercel; locally its script 404s.
    if (m.type() === "error" && !/_vercel\/insights|status of 404/.test(text)) errors.push(text);
  });
  return errors;
}

test.describe("home intro", () => {
  test("the alebrije is fully drawn before the screen shrinks, on a slow phone CPU", async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "CPU throttling needs the Chrome DevTools protocol");
    const errors = collectErrors(page);
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

    await page.goto(HOME, { waitUntil: "commit" });
    let drawnAtMorph: number | null = null;
    let cleared = false;
    const deadline = Date.now() + 15_000;
    while (Date.now() < deadline) {
      const s = await sample(page);
      if (s?.morphing && drawnAtMorph === null) drawnAtMorph = s.drawn;
      if (s && !s.overlay && drawnAtMorph !== null) {
        cleared = true;
        break;
      }
      await page.waitForTimeout(60);
    }

    expect(drawnAtMorph, "the morph started").not.toBeNull();
    expect(drawnAtMorph!).toBeGreaterThanOrEqual(0.95);
    expect(cleared, "the intro cleared").toBe(true);
    expect(errors).toEqual([]);
  });

  test("with reduced motion there is no intro and the page starts cleanly", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors = collectErrors(page);
    await page.goto(HOME, { waitUntil: "load" });
    await expect(page.locator(".intro-overlay")).toHaveCount(0, { timeout: 3_000 });
    await expect(page.locator(".fixed.z-50 svg")).toHaveCount(0);
    await page.waitForTimeout(1_500);
    expect(errors).toEqual([]);
  });

  test("the cookie notice waits until the intro has finished", async ({ page }) => {
    await page.goto(HOME, { waitUntil: "commit" });
    const notice = page.getByText("Cuidamos tu privacidad");
    // While the green screen is up, no notice.
    await expect(page.locator(".intro-overlay")).toHaveCount(1);
    await expect(notice).toBeHidden();
    await expect(page.locator(".intro-overlay")).toHaveCount(0, { timeout: 15_000 });
    await expect(notice).toBeVisible({ timeout: 5_000 });
  });
});
