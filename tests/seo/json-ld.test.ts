import { describe, expect, it } from "vitest";
import { jsonLdHtml } from "@/lib/seo/json-ld";

describe("jsonLdHtml", () => {
  it("cannot close the script element it is placed in", () => {
    const html = jsonLdHtml({ name: 'Olivea</script><script>alert(1)</script>' });
    expect(html).not.toContain("</script");
    expect(html).not.toContain("<");
  });

  it("parses back to exactly the same data", () => {
    const data = { name: "a < b </script>", nested: [{ x: "<!--" }], n: 1 };
    expect(JSON.parse(jsonLdHtml(data))).toEqual(data);
  });
});
