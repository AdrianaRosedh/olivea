import type { ReactNode } from "react";

export default function TeamLayout({ children }: { children: ReactNode }) {
  // This nested layout replaces whatever container constraints your parent layout applies.
  // You keep the global navbar because it’s rendered by the parent layout,
  // but you control the about page width here.
  return <>{children}</>;
}
