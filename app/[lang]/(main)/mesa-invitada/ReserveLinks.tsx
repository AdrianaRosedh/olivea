// app/[lang]/(main)/mesa-invitada/ReserveLinks.tsx
//
// What a past Mesa Invitada page offers instead of its booking: a table at
// Farm To Table or a night at Casa Olivea, through the site's own reservation
// window, so a guest arriving from an old link still has somewhere to go.
"use client";

import { useReservation, type ReservationType } from "@/contexts/ReservationContext";

type Props = {
  lead: string;
  links: { type: ReservationType; label: string }[];
  className: string;
  labelClassName: string;
};

export default function ReserveLinks({ lead, links, className, labelClassName }: Props) {
  const { openReservationModal } = useReservation();
  return (
    <div className="mt-6 flex flex-col gap-3">
      <span className={labelClassName}>{lead}</span>
      <div className="flex flex-col sm:flex-row gap-3">
        {links.map((l) => (
          <button key={l.type} type="button" onClick={() => openReservationModal(l.type)} className={className}>
            {l.label}
          </button>
        ))}
      </div>
    </div>
  );
}
