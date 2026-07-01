import { test, expect } from "@playwright/test";

import { SECTIONS_ES } from "../app/(main)/[lang]/farmtotable/sections.es";
import { SECTIONS_EN } from "../app/(main)/[lang]/farmtotable/sections.en";
import { SECTIONS_CASA_ES } from "../app/(main)/[lang]/casa/sections.es";
import { SECTIONS_CASA_EN } from "../app/(main)/[lang]/casa/sections.en";
import { SECTIONS_CAFE_ES } from "../app/(main)/[lang]/cafe/sections.es";
import { SECTIONS_CAFE_EN } from "../app/(main)/[lang]/cafe/sections.en";

// The chapter rail (DockLeft) drives scroll-highlighting and click-to-scroll
// from these data files. Two invariants keep it from "bouncing":
//   1. every chapter id is a real .main-section in the DOM, in the SAME
//      order the sections appear on the page;
//   2. every subsection id resolves to an element (DockLeft falls back from
//      .subsection#id to any #id).
const CASES = [
  { path: "/es/farmtotable", sections: SECTIONS_ES },
  { path: "/en/farmtotable", sections: SECTIONS_EN },
  { path: "/es/casa", sections: SECTIONS_CASA_ES },
  { path: "/en/casa", sections: SECTIONS_CASA_EN },
  { path: "/es/cafe", sections: SECTIONS_CAFE_ES },
  { path: "/en/cafe", sections: SECTIONS_CAFE_EN },
];

// Desktop-only concern (the rail is hidden on mobile)
test.skip(({ isMobile }) => isMobile, "chapter rail is desktop-only");

for (const { path, sections } of CASES) {
  test(`dock chapters match page flow on ${path}`, async ({ page }) => {
    await page.goto(path);
    // sections mount progressively — wait for the last chapter's element
    const lastId = sections[sections.length - 1].id;
    await page.waitForSelector(`.main-section#${lastId}`, { timeout: 20_000 });

    const dom = await page.evaluate(() => ({
      mains: Array.from(
        document.querySelectorAll(".main-section[id]"),
        (e) => e.id
      ),
      allIds: Array.from(
        document.querySelectorAll("[id]"),
        (e) => e.id
      ),
    }));

    // 1) chapter ids + order === page flow
    expect(dom.mains, `chapter order on ${path}`).toEqual(
      sections.map((s) => s.id)
    );

    // 2) every subsection anchor resolves somewhere — but ONLY in the
    //    Supabase-backed structured render. Subsection anchors (<Sub id>) are
    //    emitted by the TSX section components (FTTContent/CafeContent/
    //    CasaContent), which render only when getContent() returns Supabase
    //    rows. Without Supabase env — e.g. the secret-free CI — the page falls
    //    back to the static MDX article, which renders the chapters (so check
    //    #1 still holds) but intentionally omits these subsection anchors. The
    //    dock config matches the structured render, so assert the invariant
    //    only when that render is actually active (same gate the app uses).
    const structuredRender =
      !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (structuredRender) {
      const idSet = new Set(dom.allIds);
      const missing = sections.flatMap(
        (s) => (s.subs ?? []).filter((sub) => !idSet.has(sub.id)).map((sub) => `${s.id} → ${sub.id}`)
      );
      expect(missing, `dead subsection anchors on ${path}`).toEqual([]);
    } else {
      test.info().annotations.push({
        type: "note",
        description: `subsection-anchor check skipped on ${path}: no Supabase env → static MDX fallback render`,
      });
    }
  });
}
