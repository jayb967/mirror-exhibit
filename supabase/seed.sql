-- Insert initial admin user
-- Note: Replace 'your-admin-email@example.com' with the actual admin email
-- The admin user should be created first through Supabase Auth
insert into public.profiles (id, email, role)
select id, email, 'admin'::user_role
from auth.users
where email = 'your-admin-email@example.com'
on conflict (id) do update
set role = 'admin'::user_role; 