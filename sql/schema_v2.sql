-- ============================================================
-- Sistem Manajemen Perumahan - Database Schema (Supabase)
-- Run this in Supabase SQL Editor
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Pengguna ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pengguna (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(30),
    block VARCHAR(20),
    gang VARCHAR(20),
    house_no VARCHAR(20),
    role VARCHAR(50) DEFAULT 'Warga',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Kepengurusan ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kepengurusan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    jabatan VARCHAR(100) NOT NULL,
    level INT NOT NULL DEFAULT 1,
    house_no VARCHAR(20),
    block VARCHAR(20),
    gang VARCHAR(20),
    phone VARCHAR(30),
    email VARCHAR(255),
    periode VARCHAR(50),
    tugas TEXT[], -- array of text
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Keuangan: Transaksi ──────────────────────────────────
CREATE TABLE IF NOT EXISTS transaksi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    type VARCHAR(20) NOT NULL, -- 'Pemasukan' or 'Pengeluaran'
    category VARCHAR(50),
    amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- 'approved', 'pending', 'rejected'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Ronda: Jadwal ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ronda_schedule (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    block VARCHAR(20) NOT NULL,
    gang VARCHAR(20) DEFAULT 'Semua Gang',
    shift VARCHAR(20) DEFAULT 'Malam',
    coordinator VARCHAR(150),
    coordinator_house VARCHAR(20),
    status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled','completed','cancelled'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Ronda: Peserta ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ronda_participant (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_id UUID NOT NULL REFERENCES ronda_schedule(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    house_no VARCHAR(20),
    gang VARCHAR(20),
    block VARCHAR(20),
    response VARCHAR(20) DEFAULT 'pending', -- 'ikut','tidak','pending'
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Ronda: Laporan ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ronda_report (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_id UUID NOT NULL REFERENCES ronda_schedule(id) ON DELETE CASCADE,
    author_name VARCHAR(150),
    house_no VARCHAR(20),
    content TEXT,
    type VARCHAR(20) DEFAULT 'catatan', -- 'kejadian' or 'catatan'
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ── Surat Edaran ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS surat_edaran (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    author VARCHAR(150),
    category VARCHAR(50),
    status VARCHAR(20) DEFAULT 'draft', -- 'published','draft'
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Kritik & Saran ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kritik_saran (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pengirim VARCHAR(150) NOT NULL,
    house_no VARCHAR(20),
    block VARCHAR(20),
    gang VARCHAR(20),
    kategori VARCHAR(50),
    judul VARCHAR(255),
    isi TEXT,
    jenis VARCHAR(10) DEFAULT 'saran', -- 'kritik' or 'saran'
    status VARCHAR(20) DEFAULT 'baru', -- 'baru','diproses','selesai','ditolak'
    prioritas VARCHAR(20) DEFAULT 'sedang', -- 'rendah','sedang','tinggi'
    tanggal DATE DEFAULT CURRENT_DATE,
    balasan TEXT,
    upvotes INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── RLS Policies (Disable for demo, enable later) ────────
ALTER TABLE pengguna ENABLE ROW LEVEL SECURITY;
ALTER TABLE kepengurusan ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaksi ENABLE ROW LEVEL SECURITY;
ALTER TABLE ronda_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE ronda_participant ENABLE ROW LEVEL SECURITY;
ALTER TABLE ronda_report ENABLE ROW LEVEL SECURITY;
ALTER TABLE surat_edaran ENABLE ROW LEVEL SECURITY;
ALTER TABLE kritik_saran ENABLE ROW LEVEL SECURITY;

-- Allow public read/write for demo (anon key)
CREATE POLICY "Allow all for demo" ON pengguna FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for demo" ON kepengurusan FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for demo" ON transaksi FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for demo" ON ronda_schedule FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for demo" ON ronda_participant FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for demo" ON ronda_report FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for demo" ON surat_edaran FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for demo" ON kritik_saran FOR ALL USING (true) WITH CHECK (true);

-- ── Indexes ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_transaksi_date ON transaksi(date);
CREATE INDEX IF NOT EXISTS idx_transaksi_type ON transaksi(type);
CREATE INDEX IF NOT EXISTS idx_ronda_schedule_date ON ronda_schedule(date);
CREATE INDEX IF NOT EXISTS idx_ronda_participant_schedule ON ronda_participant(schedule_id);
CREATE INDEX IF NOT EXISTS idx_ronda_report_schedule ON ronda_report(schedule_id);
CREATE INDEX IF NOT EXISTS idx_surat_edaran_date ON surat_edaran(date);
CREATE INDEX IF NOT EXISTS idx_kritik_saran_status ON kritik_saran(status);

SELECT 'Schema setup completed!' AS status;
