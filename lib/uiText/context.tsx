"use client";

// lib/uiText/context.tsx
// Hands the admin's interface text (loaded once in the root layout) to the
// browser components: the reservation window, chat buttons, cookie notice…
// It also carries the chat hours, since they are shown by the same buttons.

import { createContext, useCallback, useContext, type ReactNode } from "react";
import { UI_TEXT, uiText, type UiTextKey, type UiTextValues } from "./registry";
import type { HoursSlot } from "@/lib/content/types";
import type { ReservationType } from "@/contexts/ReservationContext";

type SiteText = { text: UiTextValues; chatSlots?: HoursSlot[] };

const UiTextContext = createContext<SiteText>({ text: {} });

export function UiTextProvider({ value, children }: { value: SiteText; children: ReactNode }) {
  return <UiTextContext.Provider value={value}>{children}</UiTextContext.Provider>;
}

/** `t("reservation.title")` in the given language: the admin's wording, or
 *  the registry's copy when it was never saved. */
export function useUiText(lang: "es" | "en") {
  const { text } = useContext(UiTextContext);
  return useCallback((key: UiTextKey) => uiText(text, key, lang), [text, lang]);
}

/** The chat's opening hours (admin → Operating Hours → Chat). */
export function useChatSlots(): HoursSlot[] | undefined {
  return useContext(UiTextContext).chatSlots;
}

/** A house's name, short name, descriptor, cue and socials, in a language. */
export function useHouseText(lang: "es" | "en") {
  const t = useUiText(lang);
  return useCallback(
    (house: ReservationType) => ({
      name: t(`houses.${house}.name` as UiTextKey),
      tab: t(`houses.${house}.tab` as UiTextKey),
      descriptor: t(`houses.${house}.descriptor` as UiTextKey),
      cue: t(`houses.${house}.cue` as UiTextKey),
      instagram: t(`social.${house}.instagram` as UiTextKey),
      spotify: t(`social.${house}.spotify` as UiTextKey),
    }),
    [t]
  );
}

export { UI_TEXT };
