// app/(main)/[lang]/dictionaries/cms-overlay.ts
// ─────────────────────────────────────────────────────────────────────
// Server-side CMS overlay for the static dictionaries.
//
// The admin portal edits footer_content, drawer_content, contact_content
// and global_settings in Supabase. The static dictionary (es.json/en.json)
// stays the base — every field the CMS holds a non-empty value for wins,
// everything else keeps its static value, and any fetch failure returns
// the static dictionary untouched. Reads go through lib/content/provider
// (anon key + 60s ISR), so pages stay prerendered.
//
// Known limitation: the drawer renders a fixed set of routes, so CMS
// NavItems map onto those routes by href — labels are editable, the
// route list itself is not (and `visible: false` is ignored here).
// ─────────────────────────────────────────────────────────────────────
import { getContent } from "@/lib/content";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Bilingual, NavItem } from "@/lib/content/types";
import type { AppDictionary, Lang } from "./index";

function makePick(lang: Lang) {
  return (b?: Bilingual | null): string | undefined => {
    const v = b?.[lang]?.trim();
    return v || undefined;
  };
}

export async function applyCmsOverlay(
  lang: Lang,
  dict: AppDictionary
): Promise<AppDictionary> {
  if (!isSupabaseConfigured) return dict;

  // The imported JSON dictionary module is shared across requests —
  // never mutate it. Clone, then overlay.
  const d: AppDictionary = JSON.parse(JSON.stringify(dict));
  const pick = makePick(lang);

  const [footer, drawer, contact, global] = await Promise.all([
    getContent("footer").catch(() => null),
    getContent("drawer").catch(() => null),
    getContent("contact").catch(() => null),
    getContent("global").catch(() => null),
  ]);

  if (footer) {
    d.footer.careers = pick(footer.careers) ?? d.footer.careers;
    d.footer.legal = pick(footer.legal) ?? d.footer.legal;
  }

  if (drawer) {
    const links = new Map<string, NavItem>();
    for (const l of [...(drawer.mainLinks ?? []), ...(drawer.moreLinks ?? [])]) {
      if (l?.href && l.visible !== false) links.set(l.href, l);
    }
    const label = (href: string) => pick(links.get(href)?.label);

    d.drawer.main.farmtotable = label("/farmtotable") ?? d.drawer.main.farmtotable;
    d.drawer.main.casa = label("/casa") ?? d.drawer.main.casa;
    d.drawer.main.cafe = label("/cafe") ?? d.drawer.main.cafe;
    d.drawer.more.journal = label("/journal") ?? d.drawer.more.journal;
    d.drawer.more.sustainability = label("/sustainability") ?? d.drawer.more.sustainability;
    d.drawer.more.awards = label("/press") ?? d.drawer.more.awards;
    d.drawer.more.contact = label("/contact") ?? d.drawer.more.contact;
    d.drawer.more.legal = label("/legal") ?? d.drawer.more.legal;
    d.drawer.more.seeMore = pick(drawer.seeMore) ?? d.drawer.more.seeMore;
    d.drawer.more.hide = pick(drawer.hide) ?? d.drawer.more.hide;
    // drawer.copyright exists in the CMS but the dictionary schema has no
    // such key — the drawer component sources its copyright elsewhere.
  }

  if (contact) {
    const c = d.contact;
    c.kicker = pick(contact.kicker) ?? c.kicker;
    c.subtitle = pick(contact.subtitle) ?? c.subtitle;
    c.actions.maps = pick(contact.actions?.maps) ?? c.actions.maps;
    c.actions.email = pick(contact.actions?.email) ?? c.actions.email;
    c.actions.call = pick(contact.actions?.call) ?? c.actions.call;
    c.labels.address = pick(contact.labels?.address) ?? c.labels.address;
    c.labels.email = pick(contact.labels?.email) ?? c.labels.email;
    c.sections.farmToTableTitle =
      pick(contact.sections?.farmToTableTitle) ?? c.sections.farmToTableTitle;
    c.sections.cafeTitle =
      pick(contact.sections?.cafeTitle) ?? c.sections.cafeTitle;
    c.sections.casaTitle =
      pick(contact.sections?.casaTitle) ?? c.sections.casaTitle;
    c.footerNote = pick(contact.footerNote) ?? c.footerNote;
    c.map.iframeTitle = pick(contact.map?.iframeTitle) ?? c.map.iframeTitle;
    c.map.badgeLabel = pick(contact.map?.badgeLabel) ?? c.map.badgeLabel;
    c.map.badgeValue = pick(contact.map?.badgeValue) ?? c.map.badgeValue;
    c.map.googleMapsCta = pick(contact.map?.googleMapsCta) ?? c.map.googleMapsCta;
  }

  // Operating hours live in global_settings — the one thing a restaurant
  // must be able to change without a developer.
  if (global?.hours?.length) {
    const farm = global.hours.find((h) => h.venue === "farmtotable");
    const cafe = global.hours.find((h) => h.venue === "cafe");
    const casa = global.hours.find((h) => h.venue === "casa");
    d.contact.hours.farmToTable = pick(farm?.schedule) ?? d.contact.hours.farmToTable;
    d.contact.hours.cafe = pick(cafe?.schedule) ?? d.contact.hours.cafe;
    d.contact.hours.casa = pick(casa?.schedule) ?? d.contact.hours.casa;
  }

  return d;
}
