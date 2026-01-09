/*
  # Update demo user passwords

  Updates the password hashes for all demo accounts to enable login with "demo123" password.
  
  Demo accounts:
  - joao@escritorio.com (Advogado/Lawyer)
  - maria@escritorio.com (Estagiário/Intern)
  - admin@escritorio.com (Admin)
  - cliente@teste.com (Cliente/Client)
  
  Password: demo123
*/

UPDATE users 
SET password_hash = '$2a$12$kUNcmRTXvAmVdRDkydQKVe3cBfAJz2GX3KYNMBH6lGv1/OBmXk63y'
WHERE email IN ('joao@escritorio.com', 'maria@escritorio.com', 'admin@escritorio.com', 'cliente@teste.com');
