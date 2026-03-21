"use client";

import { useReducedMotion } from "framer-motion";
import type { Identity, ItemKind, Lang, PressItem } from "./pressTypes";
import { usePressDock } from "./usePressDock";
import { PressDockMobile } from "./PressDockMobile";
import { PressDockDesktop } from "./PressDockDesktop";

export default function PressDockLeft({
  lang,
  items,
  kind,
  setKind,
  identity,
  setIdentity,
  year,
  setYear,
  q,
  setQ,
  count,
}: {
  lang: Lang;
  items: PressItem[];
  kind: ItemKind;
  setKind: (v: ItemKind) => void;
  identity: Identity;
  setIdentity: (v: Identity) => void;
  year: number | "all";
  setYear: (v: number | "all") => void;
  q: string;
  setQ: (v: string) => void;
  count: number;
}) {
  const reduce = useReducedMotion();

  const hook = usePressDock({
    items,
    kind,
    setKind,
    identity,
    setIdentity,
    year,
    setYear,
    q,
    setQ,
    reduce: reduce ?? false,
  });

  return (
    <>
      <PressDockMobile
        lang={lang}
        barHidden={hook.barHidden}
        sheetOpen={hook.sheetOpen}
        setSheetOpen={hook.setSheetOpen}
        q={q}
        setQ={setQ}
        identity={identity}
        setIdentity={setIdentity}
        kind={kind}
        setKind={setKind}
        year={year}
        setYear={setYear}
        years={hook.years}
        countsByIdentity={hook.countsByIdentity}
        anyFiltersOn={!!hook.anyFiltersOn}
        resetAll={hook.resetAll}
        onNav={hook.onNav}
      />

      <PressDockDesktop
        lang={lang}
        q={q}
        setQ={setQ}
        identity={identity}
        setIdentity={setIdentity}
        kind={kind}
        setKind={setKind}
        year={year}
        setYear={setYear}
        years={hook.years}
        countsByIdentity={hook.countsByIdentity}
        anyFiltersOn={!!hook.anyFiltersOn}
        resetAll={hook.resetAll}
        collapsed={hook.collapsed}
        toggleCollapsed={hook.toggleCollapsed}
        count={count}
        onNav={hook.onNav}
      />
    </>
  );
}
