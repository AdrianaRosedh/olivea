"use client"

import React, { useState, useEffect } from "react"
import { X } from "lucide-react"
import { useReservation } from "@/contexts/ReservationContext"

type ReservationType = "restaurant" | "hotel" | "cafe"

interface ReservationModalProps {
  /** initial tab to show */
  initialType?: ReservationType
  /** locale code for labels, etc. */
  lang: string
}

export default function ReservationModal({
  initialType = "restaurant",
  lang,
}: ReservationModalProps) {
  const { isOpen, closeReservationModal } = useReservation()
  const [type, setType] = useState<ReservationType>(initialType)

  // keep `type` in sync if initialType changes
  useEffect(() => {
    setType(initialType)
  }, [initialType])

  // lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  // close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) closeReservationModal()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isOpen, closeReservationModal])

  if (!isOpen) return null

  const getReservationUrl = () => {
    switch (type) {
      case "restaurant":
        return "https://www.exploretock.com/yourrestaurant/embed"
      case "hotel":
        return "https://hotels.cloudbeds.com/reservation/YOURHOTELID"
      case "cafe":
        return "https://your-cafe-reservation-system.com/embed"
      default:
        return ""
    }
  }

  return (
    <>
      {/* backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000]"
        onClick={closeReservationModal}
      />

      {/* modal panel */}
      <div className="fixed inset-0 flex items-center justify-center z-[1001] p-4">
        <div
          className="w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold text-[var(--olivea-ink)]">
              {lang === "es" ? "Reservaciones" : "Reservations"}
            </h2>
            <button
              onClick={closeReservationModal}
              aria-label="Close"
              className="p-2 rounded-full hover:bg-gray-100 transition-colors text-[var(--olivea-ink)]"
            >
              <X size={20} />
            </button>
          </div>

          {/* tabs */}
          <div className="flex border-b">
            {([
              { id: "restaurant", label: lang === "es" ? "Restaurante" : "Restaurant" },
              { id: "hotel",      label: lang === "es" ? "Casa Olivea"    : "Hotel"      },
              { id: "cafe",       label: lang === "es" ? "Café"           : "Cafe"       },
            ] as const).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setType(tab.id)}
                className={`flex-1 py-3 px-4 text-center transition-colors ${
                  type === tab.id
                    ? "border-b-2 border-[var(--olivea-olive)] text-[var(--olivea-olive)] font-medium"
                    : "text-[var(--olivea-ink)] hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* iframe */}
          <div className="w-full h-[calc(100vh-250px)] max-h-[600px] overflow-hidden">
            <iframe
              src={getReservationUrl()}
              title={`${type} reservation`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </>
  )
}