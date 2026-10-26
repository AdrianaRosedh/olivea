// lib/faqTopics.ts
// The topics a house page's questions are grouped under. A fixed list, chosen
// in the admin from a picker: free text would drift ("Reservas", "Reservar",
// "Booking"…) and split one group into several. A question without a topic
// still shows; a page whose questions have no topics shows them as one list.

export const FAQ_TOPICS = [
  { id: "booking", label: { es: "Reservar", en: "Booking" } },
  { id: "experience", label: { es: "La experiencia", en: "The experience" } },
  { id: "practical", label: { es: "Práctico", en: "Practical" } },
  { id: "place", label: { es: "El lugar", en: "The place" } },
] as const;

export type FaqTopic = (typeof FAQ_TOPICS)[number]["id"];

export function asFaqTopic(v: unknown): FaqTopic | undefined {
  return FAQ_TOPICS.some((t) => t.id === v) ? (v as FaqTopic) : undefined;
}
