"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Calendar, MessageSquare } from "lucide-react";
import { useReservation } from "@/contexts/ReservationContext";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  isButton?: boolean;
  id?: string;
}

export function MobileNav({ isDrawerOpen }: { isDrawerOpen: boolean }) {
  const path = usePathname();
  const { openReservationModal } = useReservation();

  const items: NavItem[] = [
    { label: "Journal", href: "/journal", icon: <BookOpen className="w-6 h-6" /> },
    {
      label: "Reserve",
      href: "#reserve",
      icon: <Calendar className="w-6 h-6" />,
      isButton: true,
      id: "reserve-toggle",
    },
    {
      label: "Chat",
      href: "#chat",
      icon: <MessageSquare className="w-6 h-6" />,
      isButton: true,
      id: "chatbot-toggle",
    },
  ];

  return (
    <nav
      className={`fixed bottom-0 inset-x-0 z-50 bg-transparent backdrop-blur-md ${isDrawerOpen ? "pt-20" : "pt-0"}` }
    >
      <ul className="flex justify-around py-3">
        {items.map((item) => {
          const isActive = !item.isButton && path === item.href;
          const base = "flex items-center justify-center space-x-2";
          const shape = `px-4 py-2 rounded-lg border ${
            isActive
              ? "bg-[var(--olivea-olive)] text-white border-[var(--olivea-olive)]"
              : "bg-[var(--olivea-shell)] text-[var(--olivea-olive)] border-[var(--olivea-olive)] hover:bg-[var(--olivea-cream)]"
          }`;
          const content = (
            <>
              {item.icon}
              <span className="text-sm font-medium">{item.label}</span>
            </>
          );

          return (
            <li key={item.label}>
              {item.isButton ? (
                <button
                  id={item.id}
                  onClick={() => {
                    if (item.label === "Reserve") openReservationModal();
                    if (item.label === "Chat") window.dispatchEvent(new Event("open-chat"));
                  }}
                  className={`${base} ${shape}`}
                >
                  {content}
                </button>
              ) : (
                <Link href={item.href} id={item.id} className={`${base} ${shape}`}> 
                  {content} 
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
