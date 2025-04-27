"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useReservation } from "@/contexts/ReservationContext"

export default function ReservationsPage({
  params,
}: {
  params: { lang: string }
}) {
  const router = useRouter()
  const { openReservationModal } = useReservation()
  const lang = params.lang

  // Automatically open the reservation modal when this page is visited
  useEffect(() => {
    // Open the modal
    openReservationModal()

    // Redirect back to home page after a short delay
    const timer = setTimeout(() => {
      router.push(`/${lang}`)
    }, 100)

    return () => clearTimeout(timer)
  }, [openReservationModal, router, lang])

  // This page doesn't need to render anything as it just triggers the modal
  // and redirects back to home
  return null
}
