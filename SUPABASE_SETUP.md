-- ==========================================
-- SETUP INSTRUKSI
-- ==========================================
-- 
-- Langkah-langkah untuk setup Supabase Auth & Database:
--
-- 1. Copy & paste SQL schema dari 'auth_users_schema.sql' ke Supabase SQL Editor
--    (https://supabase.com/dashboard/project/[YOUR_PROJECT]/sql/new)
--    
-- 2. Jalankan semua SQL queries untuk membuat table & RLS policies
--
-- 3. Untuk membuat akun superadmin pertama:
--    a. Buka Supabase Dashboard > Authentication > Users
--    b. Klik "Add user" dan buat user dengan email superadmin
--       Email: superadmin@perumahan.com
--       Password: (set password yang aman)
--    c. Copy User ID dari daftar users
--    d. Jalankan SQL insert di bawah (ganti 'AUTH_USER_ID' dengan ID yang dicopy)
--
-- 4. Setelah itu, register page akan berfungsi dan menyimpan data ke Supabase
--
-- ==========================================

-- Insert superadmin user profile ke custom users table
INSERT INTO users (id, name, email, phone, role, created_at)
VALUES (
  'AUTH_USER_ID_DARI_STEP_3C',  -- Ganti ini dengan User ID dari Supabase Auth
  'Superadmin Perumahan',
  'superadmin@perumahan.com',
  '081234567890',
  'superadmin',
  CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO NOTHING;

-- Verify: Check if user was created
SELECT * FROM users WHERE email = 'superadmin@perumahan.com';
