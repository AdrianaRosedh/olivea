import { test, expect } from "@playwright/test";

// Smoke suite — content-presence assertions only, so the intro overlay and
// scroll-reveal animations can't make these flaky. Runs without Supabase
// env vars (pages fall back to static content by design).

test.describe("locale routing", () => {
  test("/ serves Spanish content without redirect (bot-friendly rewrite)", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    await expect(
      page.getByRole("heading", { name: /Hospitalidad del Huerto/i }).first()
    ).toBeAttached();
  });

  test("/en serves English and sets <html lang>", async ({ page }) => {
    await page.goto("/en");
    await expect(
      page.getByRole("heading", { name: /Farm Hospitality/i }).first()
    ).toBeAttached();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("/es sets <html lang> to es", async ({ page }) => {
    await page.goto("/es");
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
  });
});

test.describe("homepage", () => {
  test("offers the three entrances", async ({ page }) => {
    await page.goto("/es");
    for (const href of ["/es/casa", "/es/farmtotable", "/es/cafe"]) {
      await expect(page.locator(`a[href="${href}"]`).first()).toBeAttached();
    }
  });
});

test.describe("content pages", () => {
  test("farm to table renders the article", async ({ page }) => {
    await page.goto("/es/farmtotable");
    await expect(
      page.getByRole("heading", { name: "Olivea Farm To Table" }).first()
    ).toBeAttached();
    // Server-rendered article exists for crawlers/no-JS
    await expect(page.locator(".ssr-article").first()).toBeAttached();
  });

  test("journal lists at least one post", async ({ page }) => {
    await page.goto("/es/journal");
    await expect(page.locator('a[href*="/es/journal/"]').first()).toBeAttached({
      timeout: 15_000,
    });
  });

  test("journal post renders body and images resolve", async ({ page }) => {
    await page.goto("/es/journal/2026-04-15-lo-que-la-tierra-ya-sabe");
    await expect(
      page.getByRole("heading", { name: "Lo que la tierra ya sabe" }).first()
    ).toBeAttached();
    // No broken images: every loaded <img> must have natural dimensions
    const broken = await page.evaluate(() =>
      Array.from(document.querySelectorAll("img"))
        .filter((i) => i.complete && i.naturalWidth === 0)
        .map((i) => i.src)
    );
    expect(broken).toEqual([]);
  });

  test("contact shows venue hours", async ({ page }) => {
    await page.goto("/es/contact");
    await expect(page.getByText("Mié 5–8").first()).toBeAttached();
    await expect(page.getByText(/Mié–Lun 7:30–2:30/).first()).toBeAttached();
  });

  test("sustainability renders the six chapters", async ({ page }) => {
    await page.goto("/es/sustainability");
    for (const chapter of ["Orígenes", "Gastronomía", "Comunidad"]) {
      await expect(
        page.getByRole("heading", { name: chapter }).first()
      ).toBeAttached();
    }
  });
});

test.describe("seo endpoints", () => {
  test("robots.txt and sitemap.xml respond", async ({ request }) => {
    const robots = await request.get("/robots.txt");
    expect(robots.status()).toBe(200);

    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    expect(await sitemap.text()).toContain("<urlset");
  });
});
