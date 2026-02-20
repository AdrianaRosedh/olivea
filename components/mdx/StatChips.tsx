"use client";

export default function StatChips({
  items,
}: {
  items: { label: string; value: string }[];
}) {
  return (
    <ul className="flex flex-wrap gap-2 mt-2">
      {items.map(({ label, value }) => (
        <li
          key={label}
          className="rounded-lg border border-black/10 bg-white/60 px-3 py-1 text-xs tracking-wide text-oliveaText/70 backdrop-blur"
        >
          <span className="font-semibold text-oliveaText/80">{label}:</span>{" "}
          {value}
        </li>
      ))}
    </ul>
  );
}