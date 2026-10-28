// lib/chatHours.ts
// When the live chat is answered, from the Chat entry in /admin → Operating
// Hours. Both chat buttons (phone dock, desktop) use this, so they always
// agree. Without that entry the previous hours apply: every day 8:00–21:30.

import type { HoursSlot } from "@/lib/content/types";

const DEFAULT_SLOTS: HoursSlot[] = [
  {
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    opens: "08:00",
    closes: "21:30",
  },
];

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + (m || 0);
};

/** Day name and minutes since midnight in Baja California. */
function nowInBaja(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Tijuana",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return { day: get("weekday"), minutes: (Number(get("hour")) % 24) * 60 + Number(get("minute")) };
}

export function isChatOpen(slots: HoursSlot[] | undefined, now = new Date()): boolean {
  const { day, minutes } = nowInBaja(now);
  return (slots?.length ? slots : DEFAULT_SLOTS).some(
    (s) => s.days.includes(day) && minutes >= toMinutes(s.opens) && minutes <= toMinutes(s.closes)
  );
}

/** Today's opening time, "8:00", for the "opens …" line. */
export function chatOpensAt(slots: HoursSlot[] | undefined, now = new Date()): string {
  const { day } = nowInBaja(now);
  const list = slots?.length ? slots : DEFAULT_SLOTS;
  const slot = list.find((s) => s.days.includes(day)) ?? list[0];
  const [h, m] = slot.opens.split(":").map(Number);
  return `${h}:${String(m || 0).padStart(2, "0")}`;
}
