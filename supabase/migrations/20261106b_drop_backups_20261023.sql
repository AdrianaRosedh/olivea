-- Drop the 2026-10-23 snapshot tables (hours + philosophy sections) once the
-- changes they protected were verified live. Contents archived in
-- supabase/archive/README-2026-11-06-dropped-backups.md and the JSON beside it.
drop table if exists public._hours_backup_20261023;
drop table if exists public._sections_backup_20261023;
