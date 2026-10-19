/*
# Fix infinite recursion in RLS policies

## Problem
Several RLS policies on multiple tables (users, clients, processes, tasks,
documents, financial_entries, publications, integration_configs) used
`EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = ...)`
to check the user's role. Because the `users` table itself has RLS enabled
with a policy that also subqueries `users`, Postgres entered an infinite
recursion when evaluating any of these policies, resulting in the error
"infinite recursion detected in policy for relation users".

## Fix
Replace every role-check that subqueries `public.users` with a check on
`auth.jwt() ->> 'role'` (the role stored in the user's JWT raw_app_meta_data,
which is set at signup via the `role` metadata). Reading from the JWT avoids
touching the `users` table during policy evaluation, so no recursion occurs.

## Tables / Policies affected
1. `users`:
   - "Admins can manage all users" (ALL) -> uses JWT role check for admin
   - "Users can read own data" (SELECT) -> unchanged (auth.uid() = id)
2. `clients`:
   - "Lawyers and admins can manage clients" (ALL) -> JWT role check
3. `processes`:
   - "Lawyers and admins can manage processes" (ALL) -> JWT role check
4. `tasks`:
   - "Users can manage tasks" (ALL) -> JWT role check
5. `documents`:
   - "Users can manage documents" (ALL) -> JWT role check
6. `financial_entries`:
   - "Lawyers and admins can manage financial" (ALL) -> JWT role check
7. `publications`:
   - "Users can manage publications" (ALL) -> JWT role check
8. `integration_configs`:
   - "Admins can manage integrations" (ALL) -> JWT role check

## Important notes
- The `role` value must be stored in the user's `raw_app_meta_data` at signup
  (the frontend LoginForm already passes `role` via `supabase.auth.signUp`
  options.data, which writes to raw_user_meta_data; a trigger or the app
  should also mirror it to raw_app_meta_data for JWT availability). The
  policies here read from auth.jwt() raw_app_meta_data role, falling back
  to raw_user_meta_data role via coalesce.
- SELECT policies that used `USING (true)` remain unchanged.
- No data is lost; only policies are dropped and recreated.
*/

-- users: drop recursive admin policy, recreate using JWT
DROP POLICY IF EXISTS "Admins can manage all users" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;

CREATE POLICY "Users can read own data"
ON users FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can manage all users"
ON users FOR ALL
TO authenticated
USING (
  coalesce(
    auth.jwt() -> 'app_metadata' ->> 'role',
    auth.jwt() -> 'user_metadata' ->> 'role'
  ) = 'admin'
)
WITH CHECK (
  coalesce(
    auth.jwt() -> 'app_metadata' ->> 'role',
    auth.jwt() -> 'user_metadata' ->> 'role'
  ) = 'admin'
);

-- clients
DROP POLICY IF EXISTS "Lawyers and admins can manage clients" ON clients;
CREATE POLICY "Lawyers and admins can manage clients"
ON clients FOR ALL
TO authenticated
USING (
  coalesce(
    auth.jwt() -> 'app_metadata' ->> 'role',
    auth.jwt() -> 'user_metadata' ->> 'role'
  ) = ANY (ARRAY['admin','advogado','estagiario'])
)
WITH CHECK (
  coalesce(
    auth.jwt() -> 'app_metadata' ->> 'role',
    auth.jwt() -> 'user_metadata' ->> 'role'
  ) = ANY (ARRAY['admin','advogado','estagiario'])
);

-- processes
DROP POLICY IF EXISTS "Lawyers and admins can manage processes" ON processes;
CREATE POLICY "Lawyers and admins can manage processes"
ON processes FOR ALL
TO authenticated
USING (
  coalesce(
    auth.jwt() -> 'app_metadata' ->> 'role',
    auth.jwt() -> 'user_metadata' ->> 'role'
  ) = ANY (ARRAY['admin','advogado','estagiario'])
)
WITH CHECK (
  coalesce(
    auth.jwt() -> 'app_metadata' ->> 'role',
    auth.jwt() -> 'user_metadata' ->> 'role'
  ) = ANY (ARRAY['admin','advogado','estagiario'])
);

-- tasks
DROP POLICY IF EXISTS "Users can manage tasks" ON tasks;
CREATE POLICY "Users can manage tasks"
ON tasks FOR ALL
TO authenticated
USING (
  coalesce(
    auth.jwt() -> 'app_metadata' ->> 'role',
    auth.jwt() -> 'user_metadata' ->> 'role'
  ) = ANY (ARRAY['admin','advogado','estagiario'])
)
WITH CHECK (
  coalesce(
    auth.jwt() -> 'app_metadata' ->> 'role',
    auth.jwt() -> 'user_metadata' ->> 'role'
  ) = ANY (ARRAY['admin','advogado','estagiario'])
);

-- documents
DROP POLICY IF EXISTS "Users can manage documents" ON documents;
CREATE POLICY "Users can manage documents"
ON documents FOR ALL
TO authenticated
USING (
  coalesce(
    auth.jwt() -> 'app_metadata' ->> 'role',
    auth.jwt() -> 'user_metadata' ->> 'role'
  ) = ANY (ARRAY['admin','advogado','estagiario'])
)
WITH CHECK (
  coalesce(
    auth.jwt() -> 'app_metadata' ->> 'role',
    auth.jwt() -> 'user_metadata' ->> 'role'
  ) = ANY (ARRAY['admin','advogado','estagiario'])
);

-- financial_entries (only admin/advogado)
DROP POLICY IF EXISTS "Lawyers and admins can manage financial" ON financial_entries;
CREATE POLICY "Lawyers and admins can manage financial"
ON financial_entries FOR ALL
TO authenticated
USING (
  coalesce(
    auth.jwt() -> 'app_metadata' ->> 'role',
    auth.jwt() -> 'user_metadata' ->> 'role'
  ) = ANY (ARRAY['admin','advogado'])
)
WITH CHECK (
  coalesce(
    auth.jwt() -> 'app_metadata' ->> 'role',
    auth.jwt() -> 'user_metadata' ->> 'role'
  ) = ANY (ARRAY['admin','advogado'])
);

-- publications
DROP POLICY IF EXISTS "Users can manage publications" ON publications;
CREATE POLICY "Users can manage publications"
ON publications FOR ALL
TO authenticated
USING (
  coalesce(
    auth.jwt() -> 'app_metadata' ->> 'role',
    auth.jwt() -> 'user_metadata' ->> 'role'
  ) = ANY (ARRAY['admin','advogado','estagiario'])
)
WITH CHECK (
  coalesce(
    auth.jwt() -> 'app_metadata' ->> 'role',
    auth.jwt() -> 'user_metadata' ->> 'role'
  ) = ANY (ARRAY['admin','advogado','estagiario'])
);

-- integration_configs (admin only)
DROP POLICY IF EXISTS "Admins can manage integrations" ON integration_configs;
CREATE POLICY "Admins can manage integrations"
ON integration_configs FOR ALL
TO authenticated
USING (
  coalesce(
    auth.jwt() -> 'app_metadata' ->> 'role',
    auth.jwt() -> 'user_metadata' ->> 'role'
  ) = 'admin'
)
WITH CHECK (
  coalesce(
    auth.jwt() -> 'app_metadata' ->> 'role',
    auth.jwt() -> 'user_metadata' ->> 'role'
  ) = 'admin'
);
