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

CREATE INDEX idx_kk_rt_rw ON kartu_keluarga(rt, rw);
CREATE INDEX idx_kk_status ON kartu_keluarga(status_kk);
CREATE INDEX idx_kk_no_kk ON kartu_keluarga(no_kk);

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
  usia_tahun INT GENERATED ALWAYS AS (
    EXTRACT(YEAR FROM age(CURRENT_DATE, tanggal_lahir))::INT
  ) STORED,
  
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
  created_by UUID REFERENCES public.users(id),
  
  CONSTRAINT valid_usia CHECK (usia_tahun >= 0),
  CONSTRAINT ktp_validation CHECK (
    (status_ktp = 'Belum KTP' AND no_ktp IS NULL) OR
    (status_ktp != 'Belum KTP' AND no_ktp IS NOT NULL)
  )
);

CREATE INDEX idx_penduduk_nik ON penduduk(nik);
CREATE INDEX idx_penduduk_kk_id ON penduduk(kartu_keluarga_id);
CREATE INDEX idx_penduduk_jenis_kelamin ON penduduk(jenis_kelamin);
CREATE INDEX idx_penduduk_status_ktp ON penduduk(status_ktp);
CREATE INDEX idx_penduduk_pekerjaan ON penduduk(pekerjaan);
CREATE INDEX idx_penduduk_usia ON penduduk(usia_tahun);
CREATE INDEX idx_penduduk_status_kk ON penduduk(status_kk);

-- ==========================================
-- 3. ENABLE RLS (Row Level Security)
-- ==========================================
ALTER TABLE kartu_keluarga ENABLE ROW LEVEL SECURITY;
ALTER TABLE penduduk ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 4. RLS POLICIES - KARTU KELUARGA
-- ==========================================

-- Admin & Superadmin bisa select semua
CREATE POLICY "Admin can select all KK" ON kartu_keluarga
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- Admin & Superadmin bisa insert
CREATE POLICY "Admin can insert KK" ON kartu_keluarga
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- Admin & Superadmin bisa update
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

-- Admin & Superadmin bisa delete
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

-- Admin & Superadmin bisa select semua
CREATE POLICY "Admin can select all penduduk" ON penduduk
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- Admin & Superadmin bisa insert
CREATE POLICY "Admin can insert penduduk" ON penduduk
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- Admin & Superadmin bisa update
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

-- Admin & Superadmin bisa delete
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
SELECT
  CASE
    WHEN usia_tahun BETWEEN 0 AND 5 THEN '0-5 Tahun (Balita)'
    WHEN usia_tahun BETWEEN 6 AND 11 THEN '6-11 Tahun (SD)'
    WHEN usia_tahun BETWEEN 12 AND 15 THEN '12-15 Tahun (SMP)'
    WHEN usia_tahun BETWEEN 16 AND 20 THEN '16-20 Tahun (SMA)'
    WHEN usia_tahun BETWEEN 21 AND 25 THEN '21-25 Tahun'
    WHEN usia_tahun BETWEEN 26 AND 30 THEN '26-30 Tahun'
    WHEN usia_tahun BETWEEN 31 AND 35 THEN '31-35 Tahun'
    WHEN usia_tahun BETWEEN 36 AND 40 THEN '36-40 Tahun'
    WHEN usia_tahun BETWEEN 41 AND 45 THEN '41-45 Tahun'
    WHEN usia_tahun BETWEEN 46 AND 50 THEN '46-50 Tahun'
    WHEN usia_tahun BETWEEN 51 AND 55 THEN '51-55 Tahun'
    WHEN usia_tahun BETWEEN 56 AND 60 THEN '56-60 Tahun'
    WHEN usia_tahun > 60 THEN '60+ Tahun (Lansia)'
  END as kelompok_usia,
  COUNT(*) as jumlah
FROM penduduk
GROUP BY kelompok_usia
ORDER BY 
  CASE
    WHEN kelompok_usia = '0-5 Tahun (Balita)' THEN 1
    WHEN kelompok_usia = '6-11 Tahun (SD)' THEN 2
    WHEN kelompok_usia = '12-15 Tahun (SMP)' THEN 3
    WHEN kelompok_usia = '16-20 Tahun (SMA)' THEN 4
    WHEN kelompok_usia = '21-25 Tahun' THEN 5
    WHEN kelompok_usia = '26-30 Tahun' THEN 6
    WHEN kelompok_usia = '31-35 Tahun' THEN 7
    WHEN kelompok_usia = '36-40 Tahun' THEN 8
    WHEN kelompok_usia = '41-45 Tahun' THEN 9
    WHEN kelompok_usia = '46-50 Tahun' THEN 10
    WHEN kelompok_usia = '51-55 Tahun' THEN 11
    WHEN kelompok_usia = '56-60 Tahun' THEN 12
    WHEN kelompok_usia = '60+ Tahun (Lansia)' THEN 13
  END;

-- Create view untuk distribusi pekerjaan
CREATE OR REPLACE VIEW vw_distribusi_pekerjaan AS
SELECT
  COALESCE(pekerjaan, 'Tidak Diketahui') as pekerjaan,
  COUNT(*) as jumlah
FROM penduduk
WHERE pekerjaan IS NOT NULL OR pekerjaan != ''
GROUP BY pekerjaan
ORDER BY jumlah DESC;
