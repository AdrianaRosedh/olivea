"use server"

import { z } from "zod"

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject is required"),
  message: z.string().min(10, "Message is too short"),
})

export async function handleSubmit(prevState: any, formData: FormData) {
  // Client-side validation
  const data = Object.fromEntries(formData.entries())
  const validation = formSchema.safeParse(data)

  if (!validation.success) {
    const errors: Record<string, string> = {}
    validation.error.errors.forEach((err) => {
      if (err.path[0]) errors[err.path[0].toString()] = err.message
    })
    return { errors }
  }

  // Form is valid, submit it
  try {
    // Submit form data (example)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return { success: true }
  } catch (error) {
    return {
      errors: { form: "Failed to submit form. Please try again." },
    }
  }
}
