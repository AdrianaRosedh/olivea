"use client";

import { useState, useEffect, useMemo } from "react";
import SectionGuard from "@/components/admin/SectionGuard";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  X,
  FileText,
  Clock,
  CheckCircle2,
  Archive,
  Eye,
  Tag,
  PenLine,
} from "lucide-react";
import {
  getJournalPosts,
  saveJournalPost,
  publishJournalPost,
  unpublishJournalPost,
} from "@/lib/supabase/content-actions";
import type { JournalPost, JournalStatus } from "@/lib/content/types";
import JournalEditor from "@/components/admin/JournalEditor";

/* ─── Status badge ─── */
function StatusBadge({ status }: { status: JournalStatus }) {
  const config: Record<
    JournalStatus,
    { icon: React.ElementType; label: string; className: string }
  > = {
    draft: {
      icon: FileText,
      label: "Draft",
      className: "bg-amber-50 text-amber-600 border-amber-200/60",
    },
    published: {
      icon: CheckCircle2,
      label: "Published",
      className: "bg-emerald-50 text-emerald-600 border-emerald-200/60",
    },
    archived: {
      icon: Archive,
      label: "Archived",
      className: "bg-gray-50 text-gray-500 border-gray-200/60",
    },
  };

  const { icon: Icon, label, className } = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border ${className}`}
    >
      <Icon size={11} />
      {label}
    </span>
  );
}

/* ─── Date formatter ─── */
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return formatDate(iso);
}

/* ─── Filter tabs ─── */
const statusFilters: { key: JournalStatus | "all"; label: string; icon: React.ElementType }[] = [
  { key: "all", label: "All Articles", icon: FileText },
  { key: "draft", label: "Drafts", icon: PenLine },
  { key: "published", label: "Published", icon: CheckCircle2 },
  { key: "archived", label: "Archived", icon: Archive },
];

/* ─── Stat card ─── */
function StatCard({
  label,
  count,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  count: number;
  icon: React.ElementType;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 border
        ${
          active
            ? "bg-white/80 border-[var(--olivea-olive)]/12 shadow-[0_2px_12px_rgba(94,118,88,0.08)]"
            : "bg-white/30 border-transparent hover:bg-white/50 hover:border-[var(--olivea-olive)]/6"
        }
      `}
    >
      <div
        className={`
        w-9 h-9 rounded-xl flex items-center justify-center
        ${active ? "bg-[var(--olivea-olive)]/10" : "bg-[var(--olivea-cream)]/40"}
      `}
      >
        <Icon
          size={16}
          className={active ? "text-[var(--olivea-olive)]" : "text-[var(--olivea-clay)]/60"}
        />
      </div>
      <div className="text-left">
        <div className="text-lg font-semibold text-[var(--olivea-ink)] leading-none">{count}</div>
        <div className="text-[11px] text-[var(--olivea-clay)] mt-0.5">{label}</div>
      </div>
    </button>
  );
}

/* ─── Main page ─── */
export default function JournalPage() {
  const [posts, setPosts] = useState<JournalPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<JournalStatus | "all">("all");
  const [editingPost, setEditingPost] = useState<JournalPost | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  useEffect(() => {
    getJournalPosts()
      .then(setPosts)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let items = [...posts];

    if (statusFilter !== "all") {
      items = items.filter((p) => p.status === statusFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (p) =>
          p.title.es.toLowerCase().includes(q) ||
          p.title.en.toLowerCase().includes(q) ||
          p.author.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    // Sort: drafts first, then by updatedAt desc
    items.sort((a, b) => {
      if (a.status === "draft" && b.status !== "draft") return -1;
      if (b.status === "draft" && a.status !== "draft") return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return items;
  }, [posts, search, statusFilter]);

  const handleCreate = () => {
    const newPost: JournalPost = {
      id: `j-new-${Date.now()}`,
      title: { es: "", en: "" },
      slug: "",
      excerpt: { es: "", en: "" },
      body: { es: "", en: "" },
      author: "Adriana Rose",
      authors: [{ id: "adrianarose", name: "Adriana Rose" }],
      status: "draft",
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEditingPost(newPost);
    setEditorOpen(true);
  };

  const handleEdit = (post: JournalPost) => {
    setEditingPost(post);
    setEditorOpen(true);
  };

  const handleSave = async (updated: JournalPost) => {
    // Snapshot for rollback
    const snapshot = [...posts];
    const prevEditing = editingPost;

    // Optimistic local update
    setPosts((prev) => {
      const exists = prev.find((p) => p.id === updated.id);
      if (exists) {
        return prev.map((p) => (p.id === updated.id ? updated : p));
      }
      return [updated, ...prev];
    });
    // Persist to Supabase
    try {
      const saved = await saveJournalPost(updated);
      setPosts((prev) => prev.map((p) => (p.id === updated.id ? saved : p)));
      setEditingPost(saved);
    } catch (e) {
      console.error("Failed to save journal post:", e);
      // Rollback optimistic update
      setPosts(snapshot);
      setEditingPost(prevEditing);
    }
  };

  const handlePublish = async (post: JournalPost) => {
    const snapshot = [...posts];
    const published: JournalPost = {
      ...post,
      status: "published",
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPosts((prev) => prev.map((p) => (p.id === post.id ? published : p)));
    setEditingPost(published);
    try {
      await publishJournalPost(post.id);
    } catch (e) {
      console.error("Failed to publish journal post:", e);
      // Rollback
      setPosts(snapshot);
      setEditingPost(post);
    }
  };

  const handleUnpublish = async (post: JournalPost) => {
    const snapshot = [...posts];
    const draft: JournalPost = {
      ...post,
      status: "draft",
      publishedAt: undefined,
      updatedAt: new Date().toISOString(),
    };
    setPosts((prev) => prev.map((p) => (p.id === post.id ? draft : p)));
    setEditingPost(draft);
    try {
      await unpublishJournalPost(post.id);
    } catch (e) {
      console.error("Failed to unpublish journal post:", e);
      // Rollback
      setPosts(snapshot);
      setEditingPost(post);
    }
  };

  const statusCounts = useMemo(
    () => ({
      all: posts.length,
      draft: posts.filter((p) => p.status === "draft").length,
      published: posts.filter((p) => p.status === "published").length,
      archived: posts.filter((p) => p.status === "archived").length,
    }),
    [posts],
  );

  return (
    <SectionGuard sectionKey="content.journal">
    <div className="max-w-6xl space-y-6">
      {/* ── Stats bar ── */}
      <div className="flex items-center gap-2 flex-wrap">
        {statusFilters.map((f) => (
          <StatCard
            key={f.key}
            label={f.label}
            count={statusCounts[f.key]}
            icon={f.icon}
            active={statusFilter === f.key}
            onClick={() => setStatusFilter(f.key)}
          />
        ))}

        {/* New article button */}
        <button
          onClick={handleCreate}
          className="
            ml-auto flex items-center gap-2
            px-5 py-3 rounded-2xl
            bg-[var(--olivea-olive)] text-white
            text-sm font-medium
            shadow-[0_2px_12px_rgba(94,118,88,0.25)]
            hover:shadow-[0_4px_20px_rgba(94,118,88,0.3)]
            hover:-translate-y-px
            transition-all duration-200
          "
        >
          <Plus size={16} />
          New Article
        </button>
      </div>

      {/* ── Search ── */}
      <div className="relative max-w-md">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--olivea-clay)]"
        />
        <input
          type="text"
          placeholder="Search articles by title, author, or tag..."
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

      {/* ── Article grid ── */}
      <AnimatePresence mode="popLayout">
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-[var(--olivea-olive)]/[0.06] bg-white/40 overflow-hidden"
              >
                <div className="h-40 bg-[var(--olivea-cream)]/30 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-4 w-3/4 rounded bg-[var(--olivea-cream)]/40 animate-pulse" />
                  <div className="h-3 w-1/2 rounded bg-[var(--olivea-cream)]/30 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-dashed border-[var(--olivea-olive)]/10 bg-white/30 px-6 py-20 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-[var(--olivea-cream)]/40 flex items-center justify-center mx-auto mb-4">
              <FileText size={24} className="text-[var(--olivea-clay)]/40" />
            </div>
            <p className="text-sm font-medium text-[var(--olivea-ink)]/60 mb-1">
              {search ? "No articles match your search" : "No articles yet"}
            </p>
            <p className="text-xs text-[var(--olivea-clay)]">
              {search
                ? "Try adjusting your search terms or clearing filters."
                : "Create your first article to get started."}
            </p>
            {!search && (
              <button
                onClick={handleCreate}
                className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--olivea-olive)] text-white text-sm font-medium shadow-sm hover:shadow-md transition-all"
              >
                <Plus size={15} />
                New Article
              </button>
            )}
          </motion.div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((post) => (
              <motion.button
                key={post.id}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2 }}
                onClick={() => handleEdit(post)}
                className="
                  group text-left rounded-2xl overflow-hidden
                  border border-[var(--olivea-olive)]/[0.06]
                  bg-white/50 backdrop-blur-sm
                  shadow-[0_1px_3px_rgba(94,118,88,0.04)]
                  hover:shadow-[0_8px_30px_rgba(94,118,88,0.08)]
                  hover:border-[var(--olivea-olive)]/10
                  hover:-translate-y-0.5
                  transition-all duration-200
                "
              >
                {/* Cover image */}
                <div className="relative h-40 bg-gradient-to-br from-[var(--olivea-cream)]/30 to-[var(--olivea-cream)]/10 overflow-hidden">
                  {post.coverImage ? (
                    <div
                      className="w-full h-full bg-cover bg-center group-hover:scale-[1.03] transition-transform duration-500"
                      style={{ backgroundImage: `url(${post.coverImage})` }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileText
                        size={32}
                        className="text-[var(--olivea-clay)]/15"
                      />
                    </div>
                  )}
                  {/* Status badge overlay */}
                  <div className="absolute top-3 left-3">
                    <StatusBadge status={post.status} />
                  </div>
                  {/* Hover edit icon */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-200">
                      <Eye size={16} className="text-[var(--olivea-ink)]" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-[14px] font-semibold text-[var(--olivea-ink)] line-clamp-2 leading-snug mb-1.5">
                    {post.title.es || "Untitled"}
                  </h3>

                  {post.title.en && post.title.en !== post.title.es && (
                    <p className="text-[12px] text-[var(--olivea-clay)]/60 line-clamp-1 mb-2 italic">
                      {post.title.en}
                    </p>
                  )}

                  {post.excerpt.es && (
                    <p className="text-[13px] text-[var(--olivea-clay)] line-clamp-2 leading-relaxed mb-3">
                      {post.excerpt.es}
                    </p>
                  )}

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                      <Tag size={10} className="text-[var(--olivea-clay)]/40" />
                      {post.tags.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-md text-[10px] bg-[var(--olivea-cream)]/40 text-[var(--olivea-clay)] border border-[var(--olivea-olive)]/[0.04]"
                        >
                          {t}
                        </span>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="text-[10px] text-[var(--olivea-clay)]/40">
                          +{post.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Meta row */}
                  <div className="flex items-center justify-between text-[11px] text-[var(--olivea-clay)]/60 pt-3 border-t border-[var(--olivea-olive)]/[0.04]">
                    <span>{post.authors?.length ? post.authors.map((a) => a.name).join(" & ") : post.author}</span>
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      {timeAgo(post.updatedAt)}
                    </span>
                  </div>
                </div>
              </motion.button>
            ))}

            {/* Create new card */}
            <motion.button
              layout
              onClick={handleCreate}
              className="
                flex flex-col items-center justify-center
                rounded-2xl border-2 border-dashed border-[var(--olivea-olive)]/8
                bg-white/20 min-h-[280px]
                hover:border-[var(--olivea-olive)]/15 hover:bg-white/35
                transition-all duration-200 group
              "
            >
              <div className="w-12 h-12 rounded-2xl bg-[var(--olivea-olive)]/6 flex items-center justify-center mb-3 group-hover:bg-[var(--olivea-olive)]/10 transition-colors">
                <Plus
                  size={20}
                  className="text-[var(--olivea-olive)]/50 group-hover:text-[var(--olivea-olive)] transition-colors"
                />
              </div>
              <span className="text-sm font-medium text-[var(--olivea-clay)] group-hover:text-[var(--olivea-ink)] transition-colors">
                New Article
              </span>
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      {/* ── Editor ── */}
      <JournalEditor
        post={editingPost}
        open={editorOpen}
        onClose={() => {
          setEditorOpen(false);
          setEditingPost(null);
        }}
        onSave={handleSave}
        onPublish={handlePublish}
        onUnpublish={handleUnpublish}
      />
    </div>
    </SectionGuard>
  );
}
