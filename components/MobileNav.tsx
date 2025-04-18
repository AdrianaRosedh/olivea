"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Calendar, BookOpen, MessageSquare } from "lucide-react";

export function MobileNav() {
  const [hasMounted, setHasMounted] = useState(false);
  
  useEffect(() => {
    setHasMounted(true);
  }, []);
  
  if (!hasMounted) return null;
  
  return (
    <nav className="fixed bottom-0 w-full flex justify-between bg-white border-t z-50 py-2 px-6 md:hidden">
    

    {/* Journal (center) */}
    <Link
      href="/journal"
      className="flex flex-col items-center text-sm text-muted-foreground"
    >
      <BookOpen className="h-5 w-5 mb-1" />
      Journal
    </Link>

    {/* Reserve (left) */}
    <Link
      href="/reservations"
      className="flex flex-col items-center text-sm text-muted-foreground"
    >
      <Calendar className="h-5 w-5 mb-1" />
      Reserve
    </Link>

      {/* Chat toggle */}
      <button
        id="chatbot-toggle"
        className="flex flex-col items-center text-sm text-muted-foreground"
      >
        <MessageSquare className="h-5 w-5 mb-1" />
        Chat
      </button>
    </nav>
  );
}