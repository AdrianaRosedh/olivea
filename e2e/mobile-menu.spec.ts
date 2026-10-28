import { test, expect, type Page } from "@playwright/test";

// The phone menu (hamburger + full-screen drawer). Runs on the mobile project.
//
// Guards what was found broken on 2026-10-13:
// - the Live Garden orb floated over the open menu (no modal flag was set);
// - on short phones the language switcher and social links were out of reach;
// - two scroll locks fought, and the page stayed stuck after the menu closed;
// - the button was labelled "Toggle menu" in English on Spanish pages;
// - the logo on English pages went to "/", the Spanish home page.

test.skip(({ isMobile }) => !isMobile, "phone layout only");

const toggle = (page: Page) => page.locator("button[aria-expanded]").filter({ visible: true }).first();
const menu = (page: Page, lang: "es" | "en" = "es") =>
  page.locator(`[role=dialog][aria-label="${lang === "es" ? "Menú" : "Menu"}"]`);

// Closed, the menu stays in the page (mounting it on every tap made the
// opening circle jump on phones) but hidden and inert: nothing in it can be
// seen, tapped, focused or read out.
const expectClosed = async (page: Page, lang: "es" | "en" = "es") => {
  await expect(menu(page, lang)).toBeHidden();
  await expect(menu(page, lang)).toHaveAttribute("inert", "");
};

async function open(page: Page, path: string, baseURL: string) {
  await page.context().addCookies([{ name: "olivea_consent", value: "granted", url: baseURL }]);
  // The announcement popup opens on the first tap; keep it out of these tests.
  await page.route("**/api/popup**", (r) => r.fulfill({ json: { popup: null } }));
  await page.goto(path, { waitUntil: "load" });
}

/** Tap the button until the menu is open (the first tap may land before the
 *  page's JavaScript is running). */
async function openMenu(page: Page, lang: "es" | "en" = "es") {
  await expect(async () => {
    if (!(await menu(page, lang).isVisible())) await toggle(page).click();
    await expect(menu(page, lang)).toBeVisible({ timeout: 1500 });
  }).toPass({ timeout: 15_000 });
}

const pageLocked = (page: Page) =>
  page.evaluate(() => {
    const b = getComputedStyle(document.body);
    const h = getComputedStyle(document.documentElement);
    return b.position === "fixed" || b.overflowY === "hidden" || h.overflowY === "hidden";
  });

test("opens and closes cleanly, labelled in the page's language, and leaves the page scrollable", async ({ page, baseURL }) => {
  await open(page, "/es/casa", baseURL!);
  await page.evaluate(() => window.scrollTo(0, 1200));
  await page.waitForTimeout(300);

  await expect(toggle(page)).toHaveAttribute("aria-label", "Abrir menú");
  await openMenu(page);
  await expect(toggle(page)).toHaveAttribute("aria-label", "Cerrar menú");
  await expect(toggle(page)).toHaveAttribute("aria-expanded", "true");

  // The orb steps aside while the menu is open.
  await expect
    .poll(() =>
      page.evaluate(() => {
        const o = document.querySelector("[data-roseiies-orb]");
        if (!o) return "gone";
        return o.getBoundingClientRect().width > 0 ? "visible" : "gone";
      })
    )
    .toBe("gone");

  for (const close of ["Escape", "button"] as const) {
    if (close === "button") {
      await toggle(page).click();
      await expect(menu(page)).toBeVisible();
      await toggle(page).click();
    } else {
      await page.keyboard.press("Escape");
    }
    await expectClosed(page);
    await expect.poll(() => pageLocked(page), { message: `page unlocked after closing by ${close}` }).toBe(false);
    expect(await page.evaluate(() => Math.round(window.scrollY))).toBe(1200);
  }
});

test("the bottom of the menu is reachable on a short phone", async ({ page, baseURL }) => {
  await page.setViewportSize({ width: 320, height: 568 }); // iPhone SE (1st gen)
  await open(page, "/es/casa", baseURL!);
  await openMenu(page);
  // Reachable by a person: already on screen, or inside a container the user
  // can scroll (scrollIntoView would also move an overflow:hidden box, which a
  // finger cannot).
  const reachable = await menu(page)
    .locator('a[href^="http"]')
    .last()
    .evaluate((a) => {
      const r = a.getBoundingClientRect();
      if (r.top >= 0 && r.bottom <= innerHeight) return true;
      for (let el = a.parentElement; el; el = el.parentElement) {
        const oy = getComputedStyle(el).overflowY;
        if ((oy === "auto" || oy === "scroll") && el.scrollHeight > el.clientHeight) return true;
      }
      return false;
    });
  expect(reachable, "last menu link reachable by scrolling").toBe(true);
});

test("a menu link navigates, closes the menu and unlocks the page", async ({ page, baseURL }) => {
  await open(page, "/es/casa", baseURL!);
  await openMenu(page);
  await menu(page).locator('a[href="/es/journal"]').click();
  await page.waitForURL("**/es/journal");
  await expectClosed(page);
  await expect.poll(() => pageLocked(page)).toBe(false);
});

test("the logo on an English page goes to the English home", async ({ page, baseURL }) => {
  await open(page, "/en/team", baseURL!);
  await expect(page.locator('a[aria-label="Home"]').filter({ visible: true }).first()).toHaveAttribute("href", "/en");
});

test("every visible button has a name a screen reader can say", async ({ page, baseURL }) => {
  for (const path of ["/es/casa", "/es/journal", "/en/team"]) {
    await open(page, path, baseURL!);
    await page.evaluate(() => window.scrollTo(0, 900));
    await page.waitForTimeout(1000);
    const nameless = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>("button, [role=button], a[href]")]
        .filter((el) => {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0 || el.closest("[aria-hidden=true]")) return false;
          const name =
            el.getAttribute("aria-label") ||
            (el.getAttribute("aria-labelledby") &&
              document.getElementById(el.getAttribute("aria-labelledby")!)?.textContent) ||
            el.textContent ||
            el.querySelector("img[alt]")?.getAttribute("alt") ||
            el.getAttribute("title");
          return !name?.trim();
        })
        .map((el) => el.outerHTML.slice(0, 120))
    );
    expect(nameless, `buttons and links with no name on ${path}`).toEqual([]);
  }
});

test("the bottom bar's Reservar opens booking, and Escape closes it and unlocks the page", async ({ page, baseURL }) => {
  await open(page, "/es/casa", baseURL!);
  await page.evaluate(() => window.scrollTo(0, 900));
  const booking = page.locator('[role=dialog][aria-label="Reservaciones"]');
  await expect(async () => {
    if (!(await booking.isVisible())) await page.locator('button[aria-label="Reservar"]').filter({ visible: true }).first().click();
    await expect(booking).toBeVisible({ timeout: 1500 });
  }).toPass({ timeout: 15_000 });
  await page.keyboard.press("Escape");
  await expect(booking).toHaveCount(0);
  await expect.poll(() => pageLocked(page)).toBe(false);
});
