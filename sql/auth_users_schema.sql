-- ==========================================
-- Users Table untuk Auth & Profile (Pure Custom)
-- ==========================================

-- Create users table (standalone - tidak reference auth.users)
CREATE TABLE public.users (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('superadmin', 'admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can read users (untuk pengguna page)
CREATE POLICY "Enable read access for all users" ON users
  FOR SELECT USING (true);

-- RLS Policy: Users can only update their own profile
CREATE POLICY "Enable update for own profile" ON users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policy: Only superadmin can update other users' roles
CREATE POLICY "Enable role update for superadmin" ON users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

-- RLS Policy: Only authenticated users can insert (during registration)
-- This will be handled by the API endpoint instead of direct insert
-- So we don't need insert policy here

-- ==========================================
-- Trigger untuk auto-update updated_at
-- ==========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- Insert Superadmin Account (Optional)
-- ==========================================
-- Uncomment and run this ONLY ONCE if you want to create a superadmin directly
-- You need to replace 'auth_user_id' with actual Supabase Auth user ID

/*
INSERT INTO users (id, name, email, phone, role, created_at)
VALUES (
  'auth_user_id_here',
  'Superadmin Perumahan',
  'superadmin@perumahan.com',
  '081234567890',
  'superadmin',
  CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO NOTHING;
*/
