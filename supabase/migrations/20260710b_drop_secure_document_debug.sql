-- 20260710b_drop_secure_document_debug
-- Remove the temporary render-diagnostics table used to chase the blank-on-iOS
-- case (now fixed by the flattened-image + blob-URL render). The
-- reportRenderDebug server action and its client hook are gone, so nothing
-- writes here anymore.
drop table if exists public.secure_document_debug;
