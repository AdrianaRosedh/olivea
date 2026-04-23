"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronDown,
  ChevronUp,
  GripVertical,
  MoreHorizontal,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  Filter,
  X,
} from "lucide-react";

/* ─── Types ─── */
export interface Column<T> {
  key: string;
  label: string;
  width?: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T extends { id: string }> {
  data: T[];
  columns: Column<T>[];
  categories?: readonly string[];
  onToggleAvailability?: (id: string) => void;
  onEdit?: (item: T) => void;
  onDelete?: (id: string) => void;
  emptyMessage?: string;
}

/* ─── Availability badge ─── */
export function AvailabilityBadge({ available, onClick }: { available: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium
        transition-all duration-200 border
        ${available
          ? "bg-[var(--olivea-cream)]/60 text-[var(--olivea-olive)] border-[var(--olivea-olive)]/10 hover:bg-[var(--olivea-cream)]"
          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
        }
      `}
    >
      {available ? <Eye size={11} /> : <EyeOff size={11} />}
      {available ? "Live" : "Hidden"}
    </button>
  );
}

/* ─── Price cell ─── */
export function PriceCell({ glass, bottle }: { glass?: number; bottle?: number }) {
  if (!glass && !bottle) return <span className="text-[var(--olivea-clay)]">—</span>;
  return (
    <div className="flex items-center gap-3 text-sm">
      {glass && (
        <span className="text-[var(--olivea-ink)]/80">
          <span className="text-[10px] text-[var(--olivea-clay)] mr-1">copa</span>
          ${glass}
        </span>
      )}
      {bottle && (
        <span className="text-[var(--olivea-ink)]">
          <span className="text-[10px] text-[var(--olivea-clay)] mr-1">bot</span>
          ${bottle}
        </span>
      )}
    </div>
  );
}

/* ─── Tag pill ─── */
export function TagPill({ tag }: { tag: string }) {
  const colors: Record<string, string> = {
    house: "bg-amber-50 text-amber-700 border-amber-200/60",
    natural: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    sparkling: "bg-sky-50 text-sky-700 border-sky-200/60",
    unique: "bg-purple-50 text-purple-700 border-purple-200/60",
    blend: "bg-rose-50 text-rose-700 border-rose-200/60",
    sweet: "bg-orange-50 text-orange-700 border-orange-200/60",
    mocktail: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    garden: "bg-lime-50 text-lime-700 border-lime-200/60",
    cocktail: "bg-violet-50 text-violet-700 border-violet-200/60",
  };
  const color = colors[tag] ?? "bg-gray-50 text-gray-500 border-gray-200/60";
  return (
    <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-medium border ${color}`}>
      {tag}
    </span>
  );
}

/* ─── Main DataTable ─── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- generic table needs dynamic key access
export default function DataTable<T extends { id: string; available?: boolean; category?: string; tags?: string[]; [key: string]: any }>({
  data,
  columns,
  categories,
  onToggleAvailability,
  onEdit,
  onDelete,
  emptyMessage = "No items yet.",
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let items = [...data];

    if (activeCategory) {
      items = items.filter((i) => i.category === activeCategory);
    }
    if (search) {
      const q = search.toLowerCase();
      items = items.filter((i) =>
        Object.values(i).some(
          (v) => typeof v === "string" && v.toLowerCase().includes(q)
        )
      );
    }
    if (sortKey) {
      items.sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        const cmp = typeof aVal === "number" ? aVal - bVal : String(aVal).localeCompare(String(bVal));
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return items;
  }, [data, search, activeCategory, sortKey, sortDir]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return (
    <div className="space-y-4">
      {/* ── Toolbar ── */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--olivea-clay)]" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              w-full pl-10 pr-4 py-2.5 rounded-xl
              bg-white/60 backdrop-blur-sm
              border border-[var(--olivea-olive)]/[0.08]
              text-sm text-[var(--olivea-ink)] placeholder:text-[var(--olivea-clay)]/50
              focus:outline-none focus:border-[var(--olivea-olive)]/20 focus:bg-white/80
              focus:shadow-[0_0_0_3px_rgba(94,118,88,0.06)]
              transition-all
            "
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--olivea-clay)] hover:text-[var(--olivea-ink)]"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category filter pills */}
        {categories && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter size={13} className="text-[var(--olivea-clay)] mr-1" />
            <button
              onClick={() => setActiveCategory(null)}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-medium transition-all border
                ${!activeCategory
                  ? "bg-white/80 text-[var(--olivea-ink)] border-[var(--olivea-olive)]/10 shadow-sm"
                  : "text-[var(--olivea-clay)] border-transparent hover:text-[var(--olivea-ink)] hover:bg-white/40"
                }
              `}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-medium transition-all border
                  ${activeCategory === cat
                    ? "bg-[var(--olivea-olive)]/[0.08] text-[var(--olivea-olive)] border-[var(--olivea-olive)]/15"
                    : "text-[var(--olivea-clay)] border-transparent hover:text-[var(--olivea-ink)] hover:bg-white/40"
                  }
                `}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Count */}
        <div className="text-xs text-[var(--olivea-clay)] ml-auto">
          {filtered.length} item{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="rounded-2xl border border-[var(--olivea-olive)]/[0.06] overflow-hidden bg-white/50 backdrop-blur-sm shadow-[0_1px_3px_rgba(94,118,88,0.04)]">
        {/* Header */}
        <div className="flex items-center px-4 py-3 bg-[var(--olivea-cream)]/30 border-b border-[var(--olivea-olive)]/[0.06]">
          <div className="w-8" /> {/* grip column */}
          {columns.map((col) => (
            <div
              key={col.key}
              className={`flex items-center gap-1 ${col.width ?? "flex-1"} px-2 ${col.sortable ? "cursor-pointer select-none" : ""}`}
              role={col.sortable ? "button" : undefined}
              onClick={col.sortable ? () => handleSort(col.key) : undefined}
            >
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--olivea-clay)]">
                {col.label}
              </span>
              {col.sortable && sortKey === col.key && (
                sortDir === "asc"
                  ? <ChevronUp size={12} className="text-[var(--olivea-olive)]" />
                  : <ChevronDown size={12} className="text-[var(--olivea-olive)]" />
              )}
            </div>
          ))}
          <div className="w-10" /> {/* actions column */}
        </div>

        {/* Rows */}
        <div>
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-6 py-12 text-center text-sm text-[var(--olivea-clay)]"
              >
                {emptyMessage}
              </motion.div>
            ) : (
              filtered.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="
                    flex items-center px-4 py-3
                    border-b border-[var(--olivea-olive)]/[0.03] last:border-0
                    hover:bg-[var(--olivea-cream)]/20 transition-colors group
                  "
                >
                  {/* Drag handle */}
                  <div className="w-8 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
                    <GripVertical size={14} className="text-[var(--olivea-clay)]" />
                  </div>

                  {/* Cells */}
                  {columns.map((col) => (
                    <div key={col.key} className={`${col.width ?? "flex-1"} px-2`}>
                      {col.render
                        ? col.render(item)
                        : <span className="text-sm text-[var(--olivea-ink)]/70">{String(item[col.key] ?? "")}</span>
                      }
                    </div>
                  ))}

                  {/* Actions */}
                  <div className="w-10 relative">
                    <button
                      onClick={() => setExpandedMenu(expandedMenu === item.id ? null : item.id)}
                      className="p-1.5 rounded-lg text-[var(--olivea-clay)] hover:text-[var(--olivea-ink)] hover:bg-[var(--olivea-cream)]/40 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <MoreHorizontal size={15} />
                    </button>

                    {/* Dropdown */}
                    <AnimatePresence>
                      {expandedMenu === item.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.12 }}
                          className="
                            absolute right-0 top-full mt-1 z-50
                            w-36 py-1.5 rounded-xl
                            bg-white border border-[var(--olivea-olive)]/[0.08]
                            shadow-[0_8px_32px_rgba(94,118,88,0.12)]
                          "
                        >
                          {onEdit && (
                            <button
                              onClick={() => { onEdit(item); setExpandedMenu(null); }}
                              className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[var(--olivea-ink)]/80 hover:text-[var(--olivea-ink)] hover:bg-[var(--olivea-cream)]/40"
                            >
                              <Pencil size={12} /> Edit
                            </button>
                          )}
                          {onToggleAvailability && (
                            <button
                              onClick={() => { onToggleAvailability(item.id); setExpandedMenu(null); }}
                              className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[var(--olivea-ink)]/80 hover:text-[var(--olivea-ink)] hover:bg-[var(--olivea-cream)]/40"
                            >
                              {item.available ? <EyeOff size={12} /> : <Eye size={12} />}
                              {item.available ? "Hide" : "Show"}
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => { onDelete(item.id); setExpandedMenu(null); }}
                              className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-600/80 hover:text-red-600 hover:bg-red-50/50"
                            >
                              <Trash2 size={12} /> Remove
                            </button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
