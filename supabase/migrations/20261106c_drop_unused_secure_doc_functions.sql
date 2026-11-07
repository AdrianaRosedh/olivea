-- Secure documents are always multi-viewer (name + passcode); the
-- single-session mode was never enforced and is no longer offered. Drop the
-- two functions nothing calls:
--   * claim_secure_document — the unused single-session claim step;
--   * open_secure_document — the pre-grant opener, superseded by
--     open_secure_document_grant (it skipped the rotating-grant check).
-- The access_mode / read_window_seconds / claimed_* columns stay for history.
drop function if exists public.claim_secure_document(text, text);
drop function if exists public.open_secure_document(text, text, text, text, text, text);
