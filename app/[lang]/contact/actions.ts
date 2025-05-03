"use server";

import { z } from "zod";

const formSchema = z.object({
  name:    z.string().min(2,  "Name is required"),
  email:   z.string().email("Invalid email address"),
  subject: z.string().min(5,  "Subject is required"),
  message: z.string().min(10, "Message is too short"),
});

export type ContactErrors = Record<string,string>;

export async function handleSubmit(
  formData: FormData
): Promise<{ errors?: ContactErrors; success?: true }> {
  // validate…
  const data = Object.fromEntries(formData.entries());
  const result = formSchema.safeParse(data);

  if (!result.success) {
    const errors: ContactErrors = {};
    result.error.errors.forEach((err) => {
      const key = err.path[0]?.toString();
      if (key) errors[key] = err.message;
    });
    return { errors };
  }

  // pretend to submit…
  await new Promise<void>((r) => setTimeout(r, 1000));
  return { success: true };
}