"use client";

export default function SeasonTimeline({ items }: { items: { title: string; text: string }[] }) {
  return (
    <div className="mt-6 overflow-x-auto no-scrollbar">
      <div className="flex gap-4 min-w-full">
        {items.map((it, i) => (
          <article
            key={i}
            className="w-[260px] shrink-0 rounded-2xl border border-black/10 bg-white/60 backdrop-blur p-4"
          >
            <h4 className="font-semibold mb-1">{it.title}</h4>
            <p className="text-sm text-black/70">{it.text}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
