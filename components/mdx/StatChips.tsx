"use client";

/**
 * A house's key facts (format, season, hours, rooms…) as a quiet band: a
 * small uppercase label over the value in the display serif, separated by
 * fine olive rules. Two across on a phone, up to four on desktop.
 *
 * It replaced a row of small pills ("Formato: Menú degustación · …")
 * where the facts that matter most had the least weight. The
 * values are the CMS text as written; nothing is split or reformatted.
 */
export default function StatChips({
  items,
}: {
  items: { label: string; value: string }[];
}) {
  const cols = items.length >= 4 ? "md:grid-cols-4" : items.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2";
  return (
    <dl className={`mt-4 grid grid-cols-2 ${cols} gap-x-5 gap-y-6 md:gap-x-6`}>
      {items.map(({ label, value }) => (
        <div key={label} className="border-l border-(--olivea-olive)/20 pl-4">
          <dt className="text-[10.5px] uppercase tracking-[0.22em] text-(--olivea-olive)/80">{label}</dt>
          <dd
            className="mt-1.5 text-(--olivea-olive)"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(19px, 1.55vw, 23px)",
              fontWeight: 600,
              lineHeight: 1.22,
            }}
          >
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
