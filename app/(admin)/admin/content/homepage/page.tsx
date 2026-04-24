"use client";

import { useEffect, useState, useCallback } from "react";
import SectionGuard from "@/components/admin/SectionGuard";
import {
  Video,
  Plus,
  Pencil,
  Check,
  Monitor,
  Smartphone,
  Loader2,
  Type,
} from "lucide-react";
import {
  getHeroVideos,
  saveHeroVideo,
  setActiveVideo,
  getHomeContent,
  saveHomeContent,
} from "@/lib/supabase/actions";
import staticHome from "@/lib/content/data/home";

/* ─── Types ──────────────────────────────────────────────────────── */

interface VideoMedia {
  webm: string;
  mp4: string;
  poster: string;
}

interface HeroVideo {
  id: string;
  label: { es: string; en: string };
  mobile: VideoMedia;
  desktop: VideoMedia;
  version: string;
  active: boolean;
}

type HeroVideoDraft = Omit<HeroVideo, "active">;

const EMPTY_MEDIA: VideoMedia = { webm: "", mp4: "", poster: "" };

const EMPTY_DRAFT: HeroVideoDraft = {
  id: "",
  label: { es: "", en: "" },
  mobile: { ...EMPTY_MEDIA },
  desktop: { ...EMPTY_MEDIA },
  version: "",
};

/* ─── Style constants ────────────────────────────────────────────── */

const CARD =
  "rounded-2xl bg-white/60 backdrop-blur-md ring-1 ring-black/8 shadow-lg p-6";
const CARD_ACTIVE =
  "rounded-2xl bg-white/60 backdrop-blur-md ring-2 ring-[var(--olivea-olive)]/40 shadow-lg p-6";
const HEADING = "text-lg font-semibold text-[var(--olivea-ink)]";
const INPUT =
  "rounded-xl bg-white/80 ring-1 ring-black/10 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[var(--olivea-olive)]/40 outline-none w-full";
const BTN_PRIMARY =
  "rounded-full px-5 py-2 text-xs tracking-widest uppercase font-semibold bg-[var(--olivea-olive)] text-white hover:bg-[var(--olivea-clay)] transition-colors disabled:opacity-50";
const BTN_GHOST =
  "rounded-full px-5 py-2 text-xs tracking-widest uppercase font-semibold bg-white/60 text-[var(--olivea-ink)] ring-1 ring-black/10 hover:bg-white/80 transition-colors";

/* ─── Sub-components ─────────────────────────────────────────────── */

function ActiveBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
      <Check size={12} />
      Active
    </span>
  );
}

function MediaInputGroup({
  icon: Icon,
  title,
  media,
  onChange,
}: {
  icon: typeof Monitor;
  title: string;
  media: VideoMedia;
  onChange: (m: VideoMedia) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-[var(--olivea-ink)]/70">
        <Icon size={16} />
        {title}
      </div>
      <div className="grid gap-2">
        <input
          className={INPUT}
          placeholder="WebM path"
          value={media.webm}
          onChange={(e) => onChange({ ...media, webm: e.target.value })}
        />
        <input
          className={INPUT}
          placeholder="MP4 path"
          value={media.mp4}
          onChange={(e) => onChange({ ...media, mp4: e.target.value })}
        />
        <input
          className={INPUT}
          placeholder="Poster image path"
          value={media.poster}
          onChange={(e) => onChange({ ...media, poster: e.target.value })}
        />
      </div>
    </div>
  );
}

function VideoForm({
  draft,
  onChange,
  onSave,
  onCancel,
  saving,
  isNew,
}: {
  draft: HeroVideoDraft;
  onChange: (d: HeroVideoDraft) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  isNew: boolean;
}) {
  return (
    <div className="space-y-5">
      {/* ID + Version */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-[var(--olivea-ink)]/60 mb-1 uppercase tracking-wider">
            ID
          </label>
          <input
            className={INPUT}
            placeholder="e.g. hero-v2-2026"
            value={draft.id}
            disabled={!isNew}
            onChange={(e) => onChange({ ...draft, id: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--olivea-ink)]/60 mb-1 uppercase tracking-wider">
            Version
          </label>
          <input
            className={INPUT}
            placeholder="e.g. 1.0.0"
            value={draft.version}
            onChange={(e) => onChange({ ...draft, version: e.target.value })}
          />
        </div>
      </div>

      {/* Labels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-[var(--olivea-ink)]/60 mb-1 uppercase tracking-wider">
            Label (ES)
          </label>
          <input
            className={INPUT}
            placeholder="Etiqueta en espa\u00f1ol"
            value={draft.label.es}
            onChange={(e) =>
              onChange({ ...draft, label: { ...draft.label, es: e.target.value } })
            }
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--olivea-ink)]/60 mb-1 uppercase tracking-wider">
            Label (EN)
          </label>
          <input
            className={INPUT}
            placeholder="English label"
            value={draft.label.en}
            onChange={(e) =>
              onChange({ ...draft, label: { ...draft.label, en: e.target.value } })
            }
          />
        </div>
      </div>

      {/* Mobile + Desktop media groups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MediaInputGroup
          icon={Smartphone}
          title="Mobile"
          media={draft.mobile}
          onChange={(m) => onChange({ ...draft, mobile: m })}
        />
        <MediaInputGroup
          icon={Monitor}
          title="Desktop"
          media={draft.desktop}
          onChange={(m) => onChange({ ...draft, desktop: m })}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button className={BTN_PRIMARY} onClick={onSave} disabled={saving}>
          {saving ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" />
              Saving...
            </span>
          ) : isNew ? (
            "Create"
          ) : (
            "Save Changes"
          )}
        </button>
        <button className={BTN_GHOST} onClick={onCancel} disabled={saving}>
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ─── Hero Text Section ──────────────────────────────────────────── */

interface Bilingual { es: string; en: string }

interface HomeHero {
  title: Bilingual;
  subtitle: Bilingual;
  ctaRestaurant: Bilingual;
  ctaCasa: Bilingual;
}

function HeroTextEditor() {
  const fallback = staticHome.hero;
  const [hero, setHero] = useState<HomeHero>({
    title: { ...fallback.title },
    subtitle: { ...fallback.subtitle },
    ctaRestaurant: { ...fallback.ctaRestaurant },
    ctaCasa: { ...fallback.ctaCasa },
  });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");

  useEffect(() => {
    (async () => {
      try {
        const row = await getHomeContent();
        if (row) {
          const r = row as Record<string, unknown>;
          const h = r.hero as Record<string, unknown> | undefined;
          if (h) {
            setHero({
              title: (h.title as Bilingual) ?? fallback.title,
              subtitle: (h.subtitle as Bilingual) ?? fallback.subtitle,
              ctaRestaurant: (h.ctaRestaurant as Bilingual) ?? fallback.ctaRestaurant,
              ctaCasa: (h.ctaCasa as Bilingual) ?? fallback.ctaCasa,
            });
          }
        }
      } catch {
        // Keep fallback
      }
    })();
  }, [fallback.title, fallback.subtitle, fallback.ctaRestaurant, fallback.ctaCasa]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveHomeContent({ hero });
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("error");
    }
    setSaving(false);
  };

  const patch = (key: keyof HomeHero, lang: "es" | "en", value: string) =>
    setHero((h) => ({ ...h, [key]: { ...h[key], [lang]: value } }));

  return (
    <section className={CARD}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Type size={18} className="text-[var(--olivea-olive)]" />
          <h2 className={HEADING}>Hero Text Content</h2>
        </div>
        <button className={BTN_PRIMARY} onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 size={14} className="animate-spin" /> : "Save Text"}
        </button>
      </div>

      {status === "saved" && (
        <div className="mb-4 rounded-xl bg-emerald-50/80 ring-1 ring-emerald-200 px-4 py-2 text-sm text-emerald-700">
          Text saved
        </div>
      )}
      {status === "error" && (
        <div className="mb-4 rounded-xl bg-red-50/80 ring-1 ring-red-200 px-4 py-2 text-sm text-red-700">
          Save failed — check your connection and try again
        </div>
      )}

      <div className="space-y-4">
        {/* Title */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--olivea-clay)] mb-2">Title</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--olivea-clay)]/60">ES</span>
              <input className={INPUT} value={hero.title.es} onChange={(e) => patch("title", "es", e.target.value)} />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--olivea-clay)]/60">EN</span>
              <input className={INPUT} value={hero.title.en} onChange={(e) => patch("title", "en", e.target.value)} />
            </div>
          </div>
        </div>

        {/* Subtitle */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--olivea-clay)] mb-2">Subtitle</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--olivea-clay)]/60">ES</span>
              <input className={INPUT} value={hero.subtitle.es} onChange={(e) => patch("subtitle", "es", e.target.value)} />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--olivea-clay)]/60">EN</span>
              <input className={INPUT} value={hero.subtitle.en} onChange={(e) => patch("subtitle", "en", e.target.value)} />
            </div>
          </div>
        </div>

        {/* CTA Restaurant */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--olivea-clay)] mb-2">CTA — Restaurant</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--olivea-clay)]/60">ES</span>
              <input className={INPUT} value={hero.ctaRestaurant.es} onChange={(e) => patch("ctaRestaurant", "es", e.target.value)} />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--olivea-clay)]/60">EN</span>
              <input className={INPUT} value={hero.ctaRestaurant.en} onChange={(e) => patch("ctaRestaurant", "en", e.target.value)} />
            </div>
          </div>
        </div>

        {/* CTA Casa */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--olivea-clay)] mb-2">CTA — Casa Olivea</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--olivea-clay)]/60">ES</span>
              <input className={INPUT} value={hero.ctaCasa.es} onChange={(e) => patch("ctaCasa", "es", e.target.value)} />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--olivea-clay)]/60">EN</span>
              <input className={INPUT} value={hero.ctaCasa.en} onChange={(e) => patch("ctaCasa", "en", e.target.value)} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Main page ──────────────────────────────────────────────────── */

export default function HomepageHeroEditor() {
  const [videos, setVideos] = useState<HeroVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activating, setActivating] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<HeroVideoDraft | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [newDraft, setNewDraft] = useState<HeroVideoDraft>({
    ...EMPTY_DRAFT,
    label: { es: "", en: "" },
    mobile: { ...EMPTY_MEDIA },
    desktop: { ...EMPTY_MEDIA },
  });

  /* ── Fetch ─────────────────────────────────────────────── */

  const fetchVideos = useCallback(async () => {
    try {
      const data = await getHeroVideos();
      setVideos((data as unknown as HeroVideo[]) ?? []);
    } catch (err) {
      console.error("Failed to load hero videos", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  /* ── Handlers ──────────────────────────────────────────── */

  const handleSaveNew = async () => {
    if (!newDraft.id.trim()) return;
    setSaving(true);
    setSaveError(null);
    try {
      await saveHeroVideo({ ...newDraft, active: false });
      setShowNew(false);
      setNewDraft({
        ...EMPTY_DRAFT,
        label: { es: "", en: "" },
        mobile: { ...EMPTY_MEDIA },
        desktop: { ...EMPTY_MEDIA },
      });
      await fetchVideos();
    } catch (err) {
      console.error("Failed to save new video config", err);
      setSaveError("Failed to create video configuration. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editDraft) return;
    setSaving(true);
    setSaveError(null);
    try {
      const existing = videos.find((v) => v.id === editDraft.id);
      await saveHeroVideo({ ...editDraft, active: existing?.active ?? false });
      setExpandedId(null);
      setEditDraft(null);
      await fetchVideos();
    } catch (err) {
      console.error("Failed to save video config", err);
      setSaveError("Failed to save video configuration. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSetActive = async (id: string) => {
    setActivating(id);
    setSaveError(null);
    try {
      await setActiveVideo(id);
      await fetchVideos();
    } catch (err) {
      console.error("Failed to set active video", err);
      setSaveError("Failed to activate video. Please try again.");
    } finally {
      setActivating(null);
    }
  };

  const startEditing = (video: HeroVideo) => {
    setExpandedId(video.id);
    setEditDraft({
      id: video.id,
      label: { ...video.label },
      mobile: { ...video.mobile },
      desktop: { ...video.desktop },
      version: video.version,
    });
  };

  const cancelEditing = () => {
    setExpandedId(null);
    setEditDraft(null);
  };

  /* ── Derived ───────────────────────────────────────────── */

  const activeVideo = videos.find((v) => v.active);

  /* ── Render ────────────────────────────────────────────── */

  if (loading) {
    return (
      <SectionGuard sectionKey="pages.homepage">
        <div className="flex items-center justify-center py-32">
          <Loader2 size={28} className="animate-spin text-[var(--olivea-olive)]" />
        </div>
      </SectionGuard>
    );
  }

  return (
    <SectionGuard sectionKey="pages.homepage">
    <div className="mx-auto max-w-4xl space-y-8 pb-16">
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Video size={22} className="text-[var(--olivea-olive)]" />
          <h1 className={HEADING}>Homepage Hero Video</h1>
        </div>
        {!showNew && (
          <button
            className={BTN_PRIMARY}
            onClick={() => {
              setShowNew(true);
              cancelEditing();
            }}
          >
            <span className="inline-flex items-center gap-2">
              <Plus size={14} />
              New Config
            </span>
          </button>
        )}
      </div>

      {/* ── Error toast ─────────────────────────────────── */}
      {saveError && (
        <div className="rounded-xl bg-red-50/80 ring-1 ring-red-200 px-4 py-2 text-sm text-red-700 text-center">
          {saveError}
        </div>
      )}

      {/* ── Hero text content ────────────────────────────── */}
      <HeroTextEditor />

      {/* ── Active preview ────────────────────────────────── */}
      {activeVideo && (
        <section className={CARD}>
          <h2 className={`${HEADING} mb-4`}>Active Preview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-[var(--olivea-ink)]/70 mb-2">
                <Smartphone size={16} />
                Mobile Poster
              </div>
              <div className="rounded-xl bg-white/80 ring-1 ring-black/10 p-3 text-xs text-[var(--olivea-ink)]/60 break-all">
                {activeVideo.mobile.poster || "No poster set"}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-[var(--olivea-ink)]/70 mb-2">
                <Monitor size={16} />
                Desktop Poster
              </div>
              <div className="rounded-xl bg-white/80 ring-1 ring-black/10 p-3 text-xs text-[var(--olivea-ink)]/60 break-all">
                {activeVideo.desktop.poster || "No poster set"}
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-4 text-xs text-[var(--olivea-ink)]/50">
            <span>
              <strong>ID:</strong> {activeVideo.id}
            </span>
            <span>
              <strong>Version:</strong> {activeVideo.version}
            </span>
            <span>
              <strong>Label:</strong> {activeVideo.label.en} / {activeVideo.label.es}
            </span>
          </div>
        </section>
      )}

      {/* ── New config form ───────────────────────────────── */}
      {showNew && (
        <section className={CARD}>
          <h2 className={`${HEADING} mb-5`}>
            <span className="inline-flex items-center gap-2">
              <Plus size={18} />
              New Video Configuration
            </span>
          </h2>
          <VideoForm
            draft={newDraft}
            onChange={setNewDraft}
            onSave={handleSaveNew}
            onCancel={() => setShowNew(false)}
            saving={saving}
            isNew
          />
        </section>
      )}

      {/* ── Video list ────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className={HEADING}>All Configurations ({videos.length})</h2>

        {videos.length === 0 && (
          <p className="text-sm text-[var(--olivea-ink)]/50">
            No video configurations yet. Create one to get started.
          </p>
        )}

        {videos.map((video) => {
          const isExpanded = expandedId === video.id;
          return (
            <div key={video.id} className={video.active ? CARD_ACTIVE : CARD}>
              {/* Card header */}
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-sm font-semibold text-[var(--olivea-ink)]">
                      {video.id}
                    </span>
                    {video.active && <ActiveBadge />}
                    <span className="text-[10px] font-medium tracking-wider uppercase text-[var(--olivea-ink)]/40">
                      v{video.version}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--olivea-ink)]/50">
                    {video.label.en} / {video.label.es}
                  </p>

                  {/* Collapsed summary */}
                  {!isExpanded && (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-[var(--olivea-ink)]/50">
                      <div>
                        <span className="inline-flex items-center gap-1 font-medium">
                          <Smartphone size={12} /> Mobile
                        </span>
                        <div className="ml-4 mt-0.5 space-y-0.5">
                          <div className="truncate">WebM: {video.mobile.webm || "--"}</div>
                          <div className="truncate">MP4: {video.mobile.mp4 || "--"}</div>
                          <div className="truncate">Poster: {video.mobile.poster || "--"}</div>
                        </div>
                      </div>
                      <div>
                        <span className="inline-flex items-center gap-1 font-medium">
                          <Monitor size={12} /> Desktop
                        </span>
                        <div className="ml-4 mt-0.5 space-y-0.5">
                          <div className="truncate">WebM: {video.desktop.webm || "--"}</div>
                          <div className="truncate">MP4: {video.desktop.mp4 || "--"}</div>
                          <div className="truncate">Poster: {video.desktop.poster || "--"}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {!video.active && (
                    <button
                      className={BTN_GHOST}
                      onClick={() => handleSetActive(video.id)}
                      disabled={activating === video.id}
                    >
                      {activating === video.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        "Set Active"
                      )}
                    </button>
                  )}
                  <button
                    className={BTN_GHOST}
                    onClick={() =>
                      isExpanded ? cancelEditing() : startEditing(video)
                    }
                  >
                    <Pencil size={14} />
                  </button>
                </div>
              </div>

              {/* Expanded edit form */}
              {isExpanded && editDraft && (
                <div className="mt-6 pt-6 border-t border-black/5">
                  <VideoForm
                    draft={editDraft}
                    onChange={setEditDraft}
                    onSave={handleSaveEdit}
                    onCancel={cancelEditing}
                    saving={saving}
                    isNew={false}
                  />
                </div>
              )}
            </div>
          );
        })}
      </section>
    </div>
    </SectionGuard>
  );
}
