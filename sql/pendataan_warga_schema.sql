-- ==========================================
-- Sistem Pendataan Warga RT/RW
-- ==========================================

-- ==========================================
-- 1. TABEL KARTU KELUARGA (Family Cards)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.kartu_keluarga (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  no_kk TEXT NOT NULL UNIQUE,  -- Nomor Kartu Keluarga
  
  -- Lokasi
  rt TEXT NOT NULL,
  rw TEXT NOT NULL,
  alamat TEXT NOT NULL,
  kelurahan TEXT,
  kecamatan TEXT,
  kabupaten TEXT,
  
  -- Status Keluarga
  status_kk TEXT NOT NULL CHECK (status_kk IN ('aktif', 'non-aktif', 'pindah', 'hilang')),
  
  -- Kepala Keluarga Info
  nama_kepala_keluarga TEXT NOT NULL,
  nik_kepala_keluarga TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES public.users(id),
  
  CONSTRAINT valid_rt_rw CHECK (rt ~ '^\d+$' AND rw ~ '^\d+$')
);

-- Trigger function untuk auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger untuk auto-update timestamp pada kartu_keluarga
CREATE TRIGGER trg_update_kk_timestamp
BEFORE UPDATE ON kartu_keluarga
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_kk_rt_rw ON kartu_keluarga(rt, rw);
CREATE INDEX idx_kk_status ON kartu_keluarga(status_kk);
CREATE INDEX idx_kk_no_kk ON kartu_keluarga(no_kk);
CREATE INDEX idx_kk_created_by ON kartu_keluarga(created_by);

-- ==========================================
-- 2. TABEL PENDUDUK (Residents)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.penduduk (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Keluarga
  kartu_keluarga_id UUID NOT NULL REFERENCES public.kartu_keluarga(id) ON DELETE CASCADE,
  
  -- Data Dasar
  nik TEXT NOT NULL UNIQUE,  -- Nomor Induk Kependudukan (ID)
  nama_lengkap TEXT NOT NULL,
  jenis_kelamin TEXT NOT NULL CHECK (jenis_kelamin IN ('Laki-laki', 'Perempuan')),
  
  -- Tanggal Lahir & Usia
  tanggal_lahir DATE NOT NULL,
  tempat_lahir TEXT,
  usia_tahun INT,
  
  -- Status Kependudukan
  status_perkawinan TEXT CHECK (status_perkawinan IN ('Belum Kawin', 'Kawin', 'Cerai Hidup', 'Cerai Mati')),
  agama TEXT CHECK (agama IN ('Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu')),
  
  -- Hubungan Keluarga
  hubungan_keluarga TEXT NOT NULL CHECK (hubungan_keluarga IN ('Kepala Keluarga', 'Istri', 'Anak', 'Menantu', 'Cucu', 'Orang Tua', 'Mertua', 'Lainnya')),
  
  -- Status KTP
  status_ktp TEXT NOT NULL CHECK (status_ktp IN ('KTP Jaya Sampurna', 'KTP Luar Desa', 'Belum KTP')),
  no_ktp TEXT UNIQUE,
  
  -- Pekerjaan
  pekerjaan TEXT,
  status_pekerjaan TEXT CHECK (status_pekerjaan IN ('Bekerja', 'Tidak Bekerja', 'Sekolah', 'Mengurus Rumah Tangga', 'Lainnya')),
  
  -- Status KK
  status_kk TEXT NOT NULL CHECK (status_kk IN ('Anggota KK Jaya Sampurna', 'Anggota KK Luar Desa', 'KTP Luar per KK')),
  
  -- Pendidikan
  pendidikan_terakhir TEXT CHECK (pendidikan_terakhir IN ('Tidak Sekolah', 'SD', 'SMP', 'SMA', 'Diploma', 'S1', 'S2', 'S3')),
  
  -- Status Kesehatan
  status_kesehatan TEXT,
  penyakit_bawaan TEXT,
  
  -- Metadata
  catatan TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES public.users(id)
);

-- Trigger function untuk auto-update usia
CREATE OR REPLACE FUNCTION update_usia_penduduk()
RETURNS TRIGGER AS $$
BEGIN
  NEW.usia_tahun := EXTRACT(YEAR FROM age(CURRENT_DATE, NEW.tanggal_lahir))::INT;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger untuk update usia otomatis
CREATE TRIGGER trg_update_usia_penduduk
BEFORE INSERT OR UPDATE OF tanggal_lahir ON penduduk
FOR EACH ROW EXECUTE FUNCTION update_usia_penduduk();

-- Trigger untuk auto-update timestamp pada penduduk
CREATE TRIGGER trg_update_penduduk_timestamp
BEFORE UPDATE ON penduduk
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_penduduk_nik ON penduduk(nik);
CREATE INDEX idx_penduduk_kk_id ON penduduk(kartu_keluarga_id);
CREATE INDEX idx_penduduk_jenis_kelamin ON penduduk(jenis_kelamin);
CREATE INDEX idx_penduduk_status_ktp ON penduduk(status_ktp);
CREATE INDEX idx_penduduk_pekerjaan ON penduduk(pekerjaan);
CREATE INDEX idx_penduduk_usia ON penduduk(usia_tahun);
CREATE INDEX idx_penduduk_status_kk ON penduduk(status_kk);
CREATE INDEX idx_penduduk_created_by ON penduduk(created_by);

-- ==========================================
-- 3. ENABLE RLS (Row Level Security)
-- ==========================================
-- Note: RLS ini opsional karena aplikasi menggunakan API-based authentication
-- Autentikasi dan otorisasi utama dilakukan di API layer (lib/api-auth.ts)
-- RLS ini berfungsi sebagai security layer tambahan jika diperlukan

ALTER TABLE kartu_keluarga ENABLE ROW LEVEL SECURITY;
ALTER TABLE penduduk ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 4. RLS POLICIES - KARTU KELUARGA
-- ==========================================

-- Policy untuk akses melalui service role (API backend)
-- Ini memungkinkan API backend mengakses data tanpa batasan RLS
CREATE POLICY "Service role bypass" ON kartu_keluarga
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Admin & Superadmin bisa select semua (jika menggunakan Supabase Auth)
CREATE POLICY "Admin can select all KK" ON kartu_keluarga
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- Admin & Superadmin bisa insert (jika menggunakan Supabase Auth)
CREATE POLICY "Admin can insert KK" ON kartu_keluarga
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- Admin & Superadmin bisa update (jika menggunakan Supabase Auth)
CREATE POLICY "Admin can update KK" ON kartu_keluarga
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- Admin & Superadmin bisa delete (jika menggunakan Supabase Auth)
CREATE POLICY "Admin can delete KK" ON kartu_keluarga
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- ==========================================
-- 5. RLS POLICIES - PENDUDUK
-- ==========================================

-- Policy untuk akses melalui service role (API backend)
CREATE POLICY "Service role bypass penduduk" ON penduduk
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Admin & Superadmin bisa select semua (jika menggunakan Supabase Auth)
CREATE POLICY "Admin can select all penduduk" ON penduduk
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- Admin & Superadmin bisa insert (jika menggunakan Supabase Auth)
CREATE POLICY "Admin can insert penduduk" ON penduduk
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- Admin & Superadmin bisa update (jika menggunakan Supabase Auth)
CREATE POLICY "Admin can update penduduk" ON penduduk
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- Admin & Superadmin bisa delete (jika menggunakan Supabase Auth)
CREATE POLICY "Admin can delete penduduk" ON penduduk
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- ==========================================
-- 6. HELPER FUNCTIONS & VIEWS
-- ==========================================

-- Create view untuk summary statistik
CREATE OR REPLACE VIEW vw_summary_statistik AS
SELECT
  'total_kk' as metric,
  COUNT(DISTINCT kartu_keluarga.id)::TEXT as value
FROM kartu_keluarga
WHERE status_kk != 'non-aktif'
UNION ALL
SELECT
  'total_penduduk' as metric,
  COUNT(*)::TEXT as value
FROM penduduk
UNION ALL
SELECT
  'total_laki_laki' as metric,
  COUNT(*)::TEXT as value
FROM penduduk
WHERE jenis_kelamin = 'Laki-laki'
UNION ALL
SELECT
  'total_perempuan' as metric,
  COUNT(*)::TEXT as value
FROM penduduk
WHERE jenis_kelamin = 'Perempuan'
UNION ALL
SELECT
  'ktp_jaya_sampurna' as metric,
  COUNT(*)::TEXT as value
FROM penduduk
WHERE status_ktp = 'KTP Jaya Sampurna'
UNION ALL
SELECT
  'ktp_luar_desa' as metric,
  COUNT(*)::TEXT as value
FROM penduduk
WHERE status_ktp = 'KTP Luar Desa'
UNION ALL
SELECT
  'kk_jaya_sampurna' as metric,
  COUNT(DISTINCT kartu_keluarga_id)::TEXT as value
FROM penduduk
WHERE status_kk = 'Anggota KK Jaya Sampurna'
UNION ALL
SELECT
  'kk_luar_desa' as metric,
  COUNT(DISTINCT kartu_keluarga_id)::TEXT as value
FROM penduduk
WHERE status_kk = 'Anggota KK Luar Desa';

-- Create view untuk distribusi kelompok usia
CREATE OR REPLACE VIEW vw_distribusi_usia AS
WITH usia_groups AS (
  SELECT
    CASE
      WHEN EXTRACT(YEAR FROM age(CURRENT_DATE, tanggal_lahir))::INT BETWEEN 0 AND 5 THEN '0-5 Tahun (Balita)'
      WHEN EXTRACT(YEAR FROM age(CURRENT_DATE, tanggal_lahir))::INT BETWEEN 6 AND 11 THEN '6-11 Tahun (SD)'
      WHEN EXTRACT(YEAR FROM age(CURRENT_DATE, tanggal_lahir))::INT BETWEEN 12 AND 15 THEN '12-15 Tahun (SMP)'
      WHEN EXTRACT(YEAR FROM age(CURRENT_DATE, tanggal_lahir))::INT BETWEEN 16 AND 20 THEN '16-20 Tahun (SMA)'
      WHEN EXTRACT(YEAR FROM age(CURRENT_DATE, tanggal_lahir))::INT BETWEEN 21 AND 25 THEN '21-25 Tahun'
      WHEN EXTRACT(YEAR FROM age(CURRENT_DATE, tanggal_lahir))::INT BETWEEN 26 AND 30 THEN '26-30 Tahun'
      WHEN EXTRACT(YEAR FROM age(CURRENT_DATE, tanggal_lahir))::INT BETWEEN 31 AND 35 THEN '31-35 Tahun'
      WHEN EXTRACT(YEAR FROM age(CURRENT_DATE, tanggal_lahir))::INT BETWEEN 36 AND 40 THEN '36-40 Tahun'
      WHEN EXTRACT(YEAR FROM age(CURRENT_DATE, tanggal_lahir))::INT BETWEEN 41 AND 45 THEN '41-45 Tahun'
      WHEN EXTRACT(YEAR FROM age(CURRENT_DATE, tanggal_lahir))::INT BETWEEN 46 AND 50 THEN '46-50 Tahun'
      WHEN EXTRACT(YEAR FROM age(CURRENT_DATE, tanggal_lahir))::INT BETWEEN 51 AND 55 THEN '51-55 Tahun'
      WHEN EXTRACT(YEAR FROM age(CURRENT_DATE, tanggal_lahir))::INT BETWEEN 56 AND 60 THEN '56-60 Tahun'
      WHEN EXTRACT(YEAR FROM age(CURRENT_DATE, tanggal_lahir))::INT > 60 THEN '60+ Tahun (Lansia)'
    END as kelompok_usia,
    CASE
      WHEN EXTRACT(YEAR FROM age(CURRENT_DATE, tanggal_lahir))::INT BETWEEN 0 AND 5 THEN 1
      WHEN EXTRACT(YEAR FROM age(CURRENT_DATE, tanggal_lahir))::INT BETWEEN 6 AND 11 THEN 2
      WHEN EXTRACT(YEAR FROM age(CURRENT_DATE, tanggal_lahir))::INT BETWEEN 12 AND 15 THEN 3
      WHEN EXTRACT(YEAR FROM age(CURRENT_DATE, tanggal_lahir))::INT BETWEEN 16 AND 20 THEN 4
      WHEN EXTRACT(YEAR FROM age(CURRENT_DATE, tanggal_lahir))::INT BETWEEN 21 AND 25 THEN 5
      WHEN EXTRACT(YEAR FROM age(CURRENT_DATE, tanggal_lahir))::INT BETWEEN 26 AND 30 THEN 6
      WHEN EXTRACT(YEAR FROM age(CURRENT_DATE, tanggal_lahir))::INT BETWEEN 31 AND 35 THEN 7
      WHEN EXTRACT(YEAR FROM age(CURRENT_DATE, tanggal_lahir))::INT BETWEEN 36 AND 40 THEN 8
      WHEN EXTRACT(YEAR FROM age(CURRENT_DATE, tanggal_lahir))::INT BETWEEN 41 AND 45 THEN 9
      WHEN EXTRACT(YEAR FROM age(CURRENT_DATE, tanggal_lahir))::INT BETWEEN 46 AND 50 THEN 10
      WHEN EXTRACT(YEAR FROM age(CURRENT_DATE, tanggal_lahir))::INT BETWEEN 51 AND 55 THEN 11
      WHEN EXTRACT(YEAR FROM age(CURRENT_DATE, tanggal_lahir))::INT BETWEEN 56 AND 60 THEN 12
      WHEN EXTRACT(YEAR FROM age(CURRENT_DATE, tanggal_lahir))::INT > 60 THEN 13
    END as sort_order
  FROM penduduk
  WHERE tanggal_lahir IS NOT NULL
)
SELECT
  kelompok_usia,
  COUNT(*) as jumlah
FROM usia_groups
WHERE kelompok_usia IS NOT NULL
GROUP BY kelompok_usia, sort_order
ORDER BY sort_order;

-- Create view untuk distribusi pekerjaan
CREATE OR REPLACE VIEW vw_distribusi_pekerjaan AS
SELECT
  COALESCE(pekerjaan, 'Tidak Diketahui') as pekerjaan,
  COUNT(*) as jumlah
FROM penduduk
WHERE pekerjaan IS NOT NULL OR pekerjaan != ''
GROUP BY pekerjaan
ORDER BY jumlah DESC;

-- ==========================================
-- 7. CATATAN PENTING
-- ==========================================
-- 
-- A. TENTANG RLS (Row Level Security):
--    - RLS policies di atas menggunakan auth.uid() untuk Supabase Auth
--    - Aplikasi ini menggunakan API-based auth (x-user-id header)
--    - Policy "Service role bypass" memungkinkan API backend mengakses data
--    - Untuk disable RLS sepenuhnya, jalankan:
--      ALTER TABLE kartu_keluarga DISABLE ROW LEVEL SECURITY;
--      ALTER TABLE penduduk DISABLE ROW LEVEL SECURITY;
--
-- B. TENTANG USIA:
--    - Kolom usia_tahun otomatis ter-update saat insert/update via trigger
--    - Trigger: trg_update_usia_penduduk
--    - Kalkulasi: age(CURRENT_DATE, tanggal_lahir)
--
-- C. TENTANG TIMESTAMP:
--    - updated_at otomatis ter-update saat UPDATE via trigger
--    - Trigger: trg_update_kk_timestamp dan trg_update_penduduk_timestamp
--
-- D. CARA PENGGUNAAN:
--    1. Jalankan script ini di Supabase SQL Editor
--    2. Pastikan tabel 'users' sudah ada terlebih dahulu
--    3. Gunakan service role key di backend untuk bypass RLS
--    4. Views (vw_*) opsional, bisa dihapus jika tidak digunakan
--
-- E. SECURITY:
--    - Authorization utama di API layer (lib/api-auth.ts)
--    - created_by menyimpan user ID yang membuat record
--    - Filter berdasarkan created_by di API untuk user biasa
--    - Admin/superadmin bisa akses semua data

