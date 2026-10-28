// lib/supabase/resume-rules.ts
// What an applicant's CV must be. Shared by the careers form (in the browser)
// and the server that stores it, so it holds no keys and imports nothing.

/** Mirrors the bucket's own allowed_mime_types, checked before we upload. */
export const RESUME_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

/** 4 MB, not 5: Vercel refuses any request body over 4.5 MB, and the CV
 *  travels with the rest of the application, so a 4.6–5 MB file failed at the
 *  platform with no useful message. */
export const RESUME_MAX_BYTES = 4 * 1024 * 1024;

/** What the file input advertises, and what the copy tells the applicant. */
export const RESUME_ACCEPT = ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
