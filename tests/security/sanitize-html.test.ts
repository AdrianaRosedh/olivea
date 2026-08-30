import { describe, expect, it } from "vitest";
import { sanitizeHtml } from "@/lib/utils/sanitize-html";

describe("sanitizeHtml", () => {
  it.each([
    ["script elements", '<p>safe</p><script>window.__owned = true</script>', "<p>safe</p>"],
    ["event handlers", '<img src="/safe.jpg" onerror="window.__owned=true">', '<img src="/safe.jpg" />'],
    ["unquoted javascript URLs", "<a href=javascript:alert(1)>click</a>", "<a>click</a>"],
    ["encoded javascript URLs", '<a href="jav&#x61;script:alert(1)">click</a>', "<a>click</a>"],
    ["data URLs", '<img src="data:text/html,<script>alert(1)</script>">', ""],
    ["inline styles", '<p style="background:url(https://evil.example/track)">safe</p>', "<p>safe</p>"],
    ["untrusted iframes", '<iframe src="https://evil.example/embed"></iframe>', ""],
  ])("removes %s", (_name, input, expected) => {
    expect(sanitizeHtml(input)).toBe(expected);
  });

  it("preserves the structured article markup the editor emits", () => {
    const input = [
      '<figure class="j-wide">',
      '<img src="/images/journal/garden.webp" alt="Garden" loading="lazy">',
      "<figcaption>At Olivea</figcaption>",
      "</figure>",
    ].join("");

    expect(sanitizeHtml(input)).toBe(
      '<figure class="j-wide"><img src="/images/journal/garden.webp" alt="Garden" loading="lazy" /><figcaption>At Olivea</figcaption></figure>',
    );
  });

  it("allows only trusted YouTube iframe hosts", () => {
    const input = '<iframe src="https://www.youtube.com/embed/abc123" frameborder="0" allowfullscreen></iframe>';
    expect(sanitizeHtml(input)).toBe(input);
  });

  it("adds reverse-tabnabbing protection to new-window links", () => {
    expect(sanitizeHtml('<a href="https://example.com" target="_blank">Visit</a>')).toBe(
      '<a href="https://example.com" target="_blank" rel="noopener noreferrer">Visit</a>',
    );
  });
});
