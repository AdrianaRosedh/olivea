// A button label that rolls on hover: the word slides up and out while the
// same word slides in from below. Styles in globals.css (.olivea-roll).
//
// The incoming copy is CSS generated content (::after from data-text), so the
// label exists once in the page: copy/paste and find-in-page see it once, and
// screen readers read it once (the generated text has empty alt text).

export default function RollText({ children }: { children: string }) {
  return (
    <span className="olivea-roll" data-text={children}>
      <span>{children}</span>
    </span>
  );
}
