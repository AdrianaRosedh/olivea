import { z } from "zod"

export const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
})

export const reservationSchema = z.object({
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
})

export const newsletterSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().optional(),
})
