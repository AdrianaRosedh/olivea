// components/ui/modalFlag.ts
export function setModalOpen(isOpen: boolean) {
  if (typeof document === "undefined") return;
  const el = document.documentElement;
  if (isOpen) el.dataset.modalOpen = "1";
  else delete el.dataset.modalOpen;
}
