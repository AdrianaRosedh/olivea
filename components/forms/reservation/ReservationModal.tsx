"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

type ReservationType = "restaurant" | "hotel" | "cafe"

interface ReservationModalProps {
  isOpen: boolean
  onClose: () => void
  initialType?: ReservationType
  lang: string
}

export default function ReservationModal({ isOpen, onClose, initialType = "restaurant", lang }: ReservationModalProps) {
  const [type, setType] = useState<ReservationType>(initialType)

  // Update type when initialType changes
  useEffect(() => {
    if (initialType) {
      setType(initialType)
    }
  }, [initialType])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  // Get the appropriate reservation URL based on type
  const getReservationUrl = () => {
    switch (type) {
      case "restaurant":
        // Tock reservation URL
        return "https://www.exploretock.com/yourrestaurant/embed"
      case "hotel":
        // Cloudbeds reservation URL
        return "https://hotels.cloudbeds.com/reservation/YOURHOTELID"
      case "cafe":
        // Placeholder for cafe reservation system
        return "https://your-cafe-reservation-system.com/embed"
      default:
        return ""
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000]" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-[1001] p-4">
        <div
          className="w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold text-[var(--olivea-ink)]">
              {lang === "es" ? "Reservaciones" : "Reservations"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors text-[var(--olivea-ink)]"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b">
            {[
              { id: "restaurant", label: lang === "es" ? "Restaurante" : "Restaurant" },
              { id: "hotel", label: "Casa Olivea" },
              { id: "cafe", label: lang === "es" ? "Café" : "Cafe" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setType(tab.id as ReservationType)}
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

          {/* Content - iFrame for third-party reservation systems */}
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
