import { describe, expect, it } from "vitest";
import { normalizeAuthors } from "@/lib/journal/author";

// Articles saved before the admin's author picker store the credit as plain
// text. Without a profile id there was no author link and the author's page
// answered 404. These pin the matching that restores both.

describe("normalizeAuthors", () => {
  it("links a single plain-text author to their profile", () => {
    expect(normalizeAuthors({ author: "Daniel Nates" })).toEqual([{ id: "danielnates", name: "Daniel Nates" }]);
  });

  it("credits each person in a joint plain-text credit", () => {
    for (const author of ["Adriana Rose & Daniel Nates", "Adriana Rose y Daniel Nates", "Adriana Rose and Daniel Nates"]) {
      expect(normalizeAuthors({ author })).toEqual([
        { id: "adrianarose", name: "Adriana Rose" },
        { id: "danielnates", name: "Daniel Nates" },
      ]);
    }
  });

  it("matches names regardless of case and accents", () => {
    expect(normalizeAuthors({ author: "jesus zazueta" })).toEqual([{ id: "jesus", name: "Jesús Zazueta" }]);
  });

  it("keeps an unknown name as text, without inventing an id", () => {
    expect(normalizeAuthors({ author: "Invited Guest" })).toEqual([{ name: "Invited Guest" }]);
  });

  it("prefers an explicit authors list with ids", () => {
    expect(normalizeAuthors({ authors: [{ id: "adrianarose", name: "Adriana Rose" }], author: "Someone Else" })).toEqual([
      { id: "adrianarose", name: "Adriana Rose" },
    ]);
  });

  it("does not split a name that merely contains 'y' or 'and'", () => {
    expect(normalizeAuthors({ author: "Yolanda Sandoval" })).toEqual([{ name: "Yolanda Sandoval" }]);
  });
});
