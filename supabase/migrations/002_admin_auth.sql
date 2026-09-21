-- VELORA - Admin authentication hardening
-- Admin accounts are authenticated through Supabase Auth and authorized by admin_roles.
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
