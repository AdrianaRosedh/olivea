"use client"

import { Form } from "next/form"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { z } from "zod"

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject is required"),
  message: z.string().min(10, "Message is too short"),
})

export default function ContactForm({ lang }: { lang: string }) {
  const [formState, setFormState] = useState<{
    errors?: Record<string, string>
    success?: boolean
  }>({})

  async function handleSubmit(formData: FormData) {
    // Client-side validation
    const data = Object.fromEntries(formData.entries())
    const validation = formSchema.safeParse(data)

    if (!validation.success) {
      const errors: Record<string, string> = {}
      validation.error.errors.forEach((err) => {
        if (err.path[0]) errors[err.path[0].toString()] = err.message
      })
      setFormState({ errors })
      return
    }

    // Form is valid, submit it
    try {
      // Submit form data (example)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setFormState({ success: true })
    } catch (error) {
      setFormState({
        errors: { form: "Failed to submit form. Please try again." },
      })
    }
  }

  if (formState.success) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-md text-green-800">
        {lang === "es"
          ? "¡Gracias por contactarnos! Te responderemos pronto."
          : "Thank you for contacting us! We'll get back to you soon."}
      </div>
    )
  }

  return (
    <Form action={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          {lang === "es" ? "Nombre" : "Name"}
        </label>
        <input
          type="text"
          id="name"
          name="name"
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--olivea-olive)]"
        />
        {formState.errors?.name && <p className="mt-1 text-sm text-red-600">{formState.errors.name}</p>}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          {lang === "es" ? "Correo electrónico" : "Email"}
        </label>
        <input
          type="email"
          id="email"
          name="email"
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--olivea-olive)]"
        />
        {formState.errors?.email && <p className="mt-1 text-sm text-red-600">{formState.errors.email}</p>}
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium mb-1">
          {lang === "es" ? "Asunto" : "Subject"}
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--olivea-olive)]"
        />
        {formState.errors?.subject && <p className="mt-1 text-sm text-red-600">{formState.errors.subject}</p>}
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-1">
          {lang === "es" ? "Mensaje" : "Message"}
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--olivea-olive)]"
        ></textarea>
        {formState.errors?.message && <p className="mt-1 text-sm text-red-600">{formState.errors.message}</p>}
      </div>

      {formState.errors?.form && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-md">{formState.errors.form}</div>
      )}

      <Button type="submit" className="w-full bg-[var(--olivea-olive)] hover:bg-[var(--olivea-clay)] text-white py-3">
        {lang === "es" ? "Enviar" : "Send"}
      </Button>
    </Form>
  )
}
