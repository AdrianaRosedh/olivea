// components/admin/visual-editor/faqAdapters.ts
// Page records store FAQ items as { id, q, a } (see PageFaqEntry); EditableFAQ
// edits { question, answer }. These map between the two, keeping each item's
// id so an entry stays the same entry across saves.

import { newFaqId } from "@/lib/seo/faq";
import { asFaqTopic } from "@/lib/faqTopics";

type Bi = { es: string; en: string };

export type EditorFaqEntry = {
  id?: string;
  question: Bi;
  answer: Bi;
  topic?: string;
};

export function storedToEditorFaq(items: unknown): EditorFaqEntry[] {
  if (!Array.isArray(items)) return [];
  return items.map((it) => {
    const item = it as Record<string, unknown>;
    return {
      id: typeof item.id === "string" ? item.id : newFaqId(),
      question: (item.q as Bi) ?? { es: "", en: "" },
      answer: (item.a as Bi) ?? { es: "", en: "" },
      topic: asFaqTopic(item.topic),
    };
  });
}

export function editorToStoredFaq(entries: EditorFaqEntry[]) {
  return entries.map((e) => {
    const topic = asFaqTopic(e.topic);
    return { id: e.id ?? newFaqId(), q: e.question, a: e.answer, ...(topic ? { topic } : {}) };
  });
}
