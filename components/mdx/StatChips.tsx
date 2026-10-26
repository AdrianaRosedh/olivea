"use client";

/**
 * A house's key facts (format, season, hours, rooms…) as a band: a small
 * uppercase label, the fact's headline large in the display serif, and its
 * detail quietly underneath, separated by fine olive rules. Two across on a
 * phone, up to four on desktop.
 *
 * The CMS writes each fact as "headline · detail" ("~3 horas · concebido para
 * desplegarse con calma"). Shown as one line, the headline and its gloss had
 * the same weight. The split only reorders what is written: the part with a
 * number leads when there is one ("7:15am – 4:00pm" over "Diario", "18+" over
 * "Dos adultos"), and a plain list ("Café · brunch · vino") stays whole.
 */

function splitFact(value: string): { headline: string; detail: string | null } {
  const parts = value.split(" · ").map((p) => p.trim()).filter(Boolean);
  if (parts.length !== 2) return { headline: value, detail: null };
  const [first, second] = parts;
  const firstHasNumber = /\d/.test(first);
  const secondHasNumber = /\d/.test(second);
  return secondHasNumber && !firstHasNumber
    ? { headline: second, detail: first }
    : { headline: first, detail: second };
}

export default function StatChips({
  items,
}: {
  items: { label: string; value: string }[];
}) {
  const cols = items.length >= 4 ? "md:grid-cols-4" : items.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2";
  return (
    <dl className={`mt-6 grid grid-cols-2 ${cols} gap-x-5 gap-y-7 md:gap-x-6`}>
      {items.map(({ label, value }) => {
        const { headline, detail } = splitFact(value);
        return (
          <div key={label} className="border-l border-(--olivea-olive)/25 pl-4">
            <dt className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-(--olivea-olive)/75">{label}</dt>
            <dd className="mt-2">
              <span
                className="block text-(--olivea-olive)"
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "clamp(22px, 1.8vw, 27px)",
                  fontWeight: 600,
                  lineHeight: 1.1,
                }}
              >
                {headline}
              </span>
              {detail && (
                <span
                  className="mt-1 block italic text-(--olivea-ink)/65"
                  style={{ fontFamily: "var(--font-serif)", fontSize: 16, lineHeight: 1.3 }}
                >
                  {detail}
                </span>
              )}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
