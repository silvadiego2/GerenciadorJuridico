/*
# Seed demo users in Supabase Auth

## Why
public.users has profiles but auth.users is empty, so login fails with
"invalid_credentials". This creates the four demo accounts from the guides.

## Accounts
- admin@escritorio.com (admin)
- joao@escritorio.com (advogado)
- maria@escritorio.com (estagiario)
- cliente@teste.com (cliente)

All with password "demo123", email confirmation OFF, raw_app_meta_data.role
set so the RLS policies (which read role from JWT) work.

Idempotent: ON CONFLICT DO NOTHING.
*/

INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  last_sign_in_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
SELECT
  p.id,
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  p.email,
  crypt('demo123', gen_salt('bf', 10)),
  now(),
  jsonb_build_object('role', p.role, 'name', p.name),
  jsonb_build_object('role', p.role, 'name', p.name, 'oab', p.oab, 'phone', p.phone),
  now(),
  now(),
  now(),
  '',
  '',
  '',
  ''
FROM public.users p
WHERE p.email IN (
  'admin@escritorio.com',
  'joao@escritorio.com',
  'maria@escritorio.com',
  'cliente@teste.com'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id,
  provider_id,
  user_id,
  provider,
  last_sign_in_at,
  created_at,
  updated_at,
  identity_data
)
SELECT
  gen_random_uuid(),
  p.id::text,
  p.id,
  'email',
  now(),
  now(),
  now(),
  jsonb_build_object('sub', p.id, 'email', p.email)
FROM public.users p
WHERE p.email IN (
  'admin@escritorio.com',
  'joao@escritorio.com',
  'maria@escritorio.com',
  'cliente@teste.com'
)
ON CONFLICT DO NOTHING;
