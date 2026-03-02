-- Residential Management System - Database Schema
-- This SQL is compatible with Supabase PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables (for fresh setup)
DROP TABLE IF EXISTS patrol_assignment CASCADE;
DROP TABLE IF EXISTS patrol_schedule CASCADE;
DROP TABLE IF EXISTS document CASCADE;
DROP TABLE IF EXISTS financial_transaction CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;
DROP TABLE IF EXISTS role CASCADE;
DROP TABLE IF EXISTS block CASCADE;
DROP TABLE IF EXISTS section CASCADE;
DROP TABLE IF EXISTS residential_area CASCADE;

-- Create residential_area table
CREATE TABLE residential_area (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  address VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  province VARCHAR(255) NOT NULL,
  postal_code VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create section table
CREATE TABLE section (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  residential_area_id UUID NOT NULL REFERENCES residential_area(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create block table
CREATE TABLE block (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  residential_area_id UUID NOT NULL REFERENCES residential_area(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create role table
CREATE TABLE role (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user table
CREATE TABLE "user" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  residential_area_id UUID REFERENCES residential_area(id) ON DELETE SET NULL,
  block_id UUID REFERENCES block(id) ON DELETE SET NULL,
  section_id UUID REFERENCES section(id) ON DELETE SET NULL,
  role_id UUID REFERENCES role(id) ON DELETE SET NULL,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(30),
  password VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create financial_transaction table
CREATE TABLE financial_transaction (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  residential_area_id UUID NOT NULL REFERENCES residential_area(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  approved_by UUID REFERENCES "user"(id) ON DELETE SET NULL,
  transaction_type VARCHAR(30) NOT NULL,
  category VARCHAR(50),
  amount NUMERIC(14, 2) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  transaction_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create document table
CREATE TABLE document (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  residential_area_id UUID NOT NULL REFERENCES residential_area(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  approed_by UUID REFERENCES "user"(id) ON DELETE SET NULL,
  title VARCHAR(200) NOT NULL,
  document_number VARCHAR(100),
  file_url TEXT NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create patrol_schedule table
CREATE TABLE patrol_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  residential_area_id UUID NOT NULL REFERENCES residential_area(id) ON DELETE CASCADE,
  block_id UUID REFERENCES block(id) ON DELETE SET NULL,
  coordinator_id UUID REFERENCES "user"(id) ON DELETE SET NULL,
  patrol_date DATE NOT NULL,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create patrol_assignment table
CREATE TABLE patrol_assignment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patrol_schedule_id UUID NOT NULL REFERENCES patrol_schedule(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  attendance_status VARCHAR(20) DEFAULT 'absent',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_section_residential_area_id ON section(residential_area_id);
CREATE INDEX idx_block_residential_area_id ON block(residential_area_id);
CREATE INDEX idx_user_residential_area_id ON "user"(residential_area_id);
CREATE INDEX idx_user_email ON "user"(email);
CREATE INDEX idx_financial_transaction_residential_area_id ON financial_transaction(residential_area_id);
CREATE INDEX idx_financial_transaction_status ON financial_transaction(status);
CREATE INDEX idx_document_residential_area_id ON document(residential_area_id);
CREATE INDEX idx_document_status ON document(status);
CREATE INDEX idx_patrol_schedule_residential_area_id ON patrol_schedule(residential_area_id);
CREATE INDEX idx_patrol_schedule_patrol_date ON patrol_schedule(patrol_date);
CREATE INDEX idx_patrol_assignment_user_id ON patrol_assignment(user_id);

-- Insert default roles
INSERT INTO role (name, description) VALUES
  ('Admin', 'Administrator dengan akses penuh ke sistem'),
  ('Ketua Perumahan', 'Ketua pengurus perumahan'),
  ('Bendahara', 'Mengelola keuangan perumahan'),
  ('Koordinator Ronda', 'Mengkoordinir jadwal dan laporan ronda'),
  ('Anggota Ronda', 'Peserta kegiatan ronda'),
  ('Penghuni', 'Penghuni perumahan');

-- Optional: Insert sample data
-- Uncomment lines below to insert sample data

-- INSERT INTO residential_area (name, address, city, province, postal_code)
-- VALUES ('Perumahan Indahbudi', 'Jl. Merdeka No. 123', 'Jakarta', 'DKI Jakarta', '12345');

-- SELECT 'Database setup completed successfully!' as status;
