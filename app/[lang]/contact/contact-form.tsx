"use client";

import { useActionState } from "react";       // React 19
import { Button }          from "@/components/ui/button";
import { handleSubmit }    from "./actions";

type ContactState = {
  success?: boolean;
  errors?: Record<string,string>;
};

// A fully specified initial state
const initialState: ContactState = {
  success: false,
  errors:  {},
};

export default function ContactForm({ lang }: { lang: string }) {
  // Pass both your action and the initialState
  const [state, action, isPending] = useActionState(handleSubmit, initialState);

  if (state.success) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-md text-green-800">
        {lang === "es"
          ? "¡Gracias por contactarnos! Te responderemos pronto."
          : "Thank you for contacting us! We'll get back to you soon."}
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          {lang === "es" ? "Nombre" : "Name"}
        </label>
        <input
          id="name"
          name="name"
          type="text"
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--olivea-olive)]"
        />
        {state.errors?.name && (
          <p className="mt-1 text-sm text-red-600">{state.errors.name}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          {lang === "es" ? "Correo electrónico" : "Email"}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--olivea-olive)]"
        />
        {state.errors?.email && (
          <p className="mt-1 text-sm text-red-600">{state.errors.email}</p>
        )}
      </div>

      {/* Subject */}
      <div>
        <label htmlFor="subject" className="block text-sm font-medium mb-1">
          {lang === "es" ? "Asunto" : "Subject"}
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--olivea-olive)]"
        />
        {state.errors?.subject && (
          <p className="mt-1 text-sm text-red-600">{state.errors.subject}</p>
        )}
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-1">
          {lang === "es" ? "Mensaje" : "Message"}
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--olivea-olive)]"
        />
        {state.errors?.message && (
          <p className="mt-1 text-sm text-red-600">{state.errors.message}</p>
        )}
      </div>

      {/* Form-level error */}
      {state.errors?.form && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-md">
          {state.errors.form}
        </div>
      )}

      <Button
        type="submit"
        className="w-full bg-[var(--olivea-olive)] hover:bg-[var(--olivea-clay)] text-white py-3"
        disabled={isPending}
      >
        {isPending
          ? lang === "es"
            ? "Enviando..."
            : "Sending..."
          : lang === "es"
          ? "Enviar"
          : "Send"}
      </Button>
    </form>
  );
}