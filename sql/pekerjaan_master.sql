-- ==========================================
-- TABEL MASTER PEKERJAAN
-- ==========================================
CREATE TABLE IF NOT EXISTS public.pekerjaan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_pekerjaan TEXT NOT NULL UNIQUE,
  keterangan TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES public.users(id),
  
  CONSTRAINT valid_nama_pekerjaan CHECK (nama_pekerjaan != '')
);

-- Trigger untuk auto-update updated_at
CREATE TRIGGER trg_update_pekerjaan_timestamp
BEFORE UPDATE ON pekerjaan
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Index untuk pencarian
CREATE INDEX idx_pekerjaan_nama ON pekerjaan(nama_pekerjaan);
CREATE INDEX idx_pekerjaan_is_active ON pekerjaan(is_active);
CREATE INDEX idx_pekerjaan_created_by ON pekerjaan(created_by);

-- ==========================================
-- INSERT DATA PEKERJAAN DEFAULT
-- ==========================================
INSERT INTO public.pekerjaan (nama_pekerjaan, keterangan, is_active) VALUES
('Dokter', 'Profesi medis', TRUE),
('Guru', 'Pendidik di sekolah/institusi pendidikan', TRUE),
('Karyawan Swasta', 'Bekerja di perusahaan swasta', TRUE),
('Wiraswasta', 'Pengusaha/usaha sendiri', TRUE),
('Buruh Harian Lepas', 'Pekerja lepas harian', TRUE),
('TNI', 'Tentara Nasional Indonesia', TRUE),
('Polri', 'Kepolisian Negara Republik Indonesia', TRUE),
('Petani', 'Petani tanaman pertanian', TRUE),
('Bidan', 'Tenaga kesehatan bidang kebidanan', TRUE),
('Pegawai Negeri Sipil (PNS)', 'Pegawai pemerintah', TRUE),
('Tidak Bekerja', 'Tidak memiliki pekerjaan', TRUE),
('Lain-lain', 'Pekerjaan lainnya tidak tercantum', TRUE)
ON CONFLICT (nama_pekerjaan) DO NOTHING;
