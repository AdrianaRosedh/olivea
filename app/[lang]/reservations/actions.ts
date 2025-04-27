"use server"

import { supabase } from "@/lib/supabase"
import { z } from "zod"

// Define schema for form validation
const reservationSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(5, "Phone number is required"),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date",
  }),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  party_size: z.coerce.number().int().min(1).max(20),
  type: z.enum(["restaurant", "cafe", "casa"]),
  status: z.enum(["pending", "confirmed", "cancelled"]),
  notes: z.string().optional(),
  lang: z.string().optional(),
})

export async function createReservation(formData: FormData) {
  try {
    // Extract and validate form data
    const rawData = Object.fromEntries(formData.entries())
    const validatedData = reservationSchema.safeParse(rawData)

    if (!validatedData.success) {
      return {
        success: false,
        error: validatedData.error.errors[0].message,
      }
    }

    const { lang, ...reservationData } = validatedData.data

    // Insert into database
    const { error } = await supabase
      .from("reservations")
      .insert([{ ...reservationData, created_at: new Date(), updated_at: new Date() }])

    if (error) {
      console.error("Error creating reservation:", error)
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error("Unexpected error:", error)
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    }
  }
}
