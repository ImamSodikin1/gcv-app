// Interfaces untuk Sistem Pendataan Warga
// ==========================================

// 1. KARTU KELUARGA (Family Card)
export interface KartuKeluarga {
  id: string;
  no_kk: string;
  rt: string;
  rw: string;
  alamat: string;
  kelurahan?: string;
  kecamatan?: string;
  kabupaten?: string;
  status_kk: 'aktif' | 'non-aktif' | 'pindah' | 'hilang';
  nama_kepala_keluarga: string;
  nik_kepala_keluarga?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

// Form untuk create/edit KK
export interface KartuKeluargaForm {
  no_kk: string;
  rt: string;
  rw: string;
  alamat: string;
  kelurahan?: string;
  kecamatan?: string;
  kabupaten?: string;
  status_kk: 'aktif' | 'non-aktif' | 'pindah' | 'hilang';
  nama_kepala_keluarga: string;
  nik_kepala_keluarga?: string;
}

// 2. PENDUDUK (Resident/Population)
export interface Penduduk {
  id: string;
  kartu_keluarga_id: string;
  nik: string;
  nama_lengkap: string;
  jenis_kelamin: 'Laki-laki' | 'Perempuan';
  tanggal_lahir: string; // ISO Date
  tempat_lahir?: string;
  usia_tahun: number;
  status_perkawinan?: 'Belum Kawin' | 'Kawin' | 'Cerai Hidup' | 'Cerai Mati';
  agama?: 'Islam' | 'Kristen' | 'Katolik' | 'Hindu' | 'Buddha' | 'Konghucu';
  hubungan_keluarga: 'Kepala Keluarga' | 'Istri' | 'Anak' | 'Menantu' | 'Cucu' | 'Orang Tua' | 'Mertua' | 'Lainnya';
  status_ktp: 'KTP Jaya Sampurna' | 'KTP Luar Desa' | 'Belum KTP';
  no_ktp?: string;
  pekerjaan?: string;
  status_pekerjaan?: 'Bekerja' | 'Tidak Bekerja' | 'Sekolah' | 'Mengurus Rumah Tangga' | 'Lainnya';
  status_kk: 'Anggota KK Jaya Sampurna' | 'Anggota KK Luar Desa' | 'KTP Luar per KK';
  pendidikan_terakhir?: 'Tidak Sekolah' | 'SD' | 'SMP' | 'SMA' | 'Diploma' | 'S1' | 'S2' | 'S3';
  status_kesehatan?: string;
  penyakit_bawaan?: string;
  catatan?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

// Form untuk create/edit Penduduk
export interface PendudukForm {
  kartu_keluarga_id: string;
  nik: string;
  nama_lengkap: string;
  jenis_kelamin: 'Laki-laki' | 'Perempuan';
  tanggal_lahir: string;
  tempat_lahir?: string;
  status_perkawinan?: 'Belum Kawin' | 'Kawin' | 'Cerai Hidup' | 'Cerai Mati';
  agama?: 'Islam' | 'Kristen' | 'Katolik' | 'Hindu' | 'Buddha' | 'Konghucu';
  hubungan_keluarga: 'Kepala Keluarga' | 'Istri' | 'Anak' | 'Menantu' | 'Cucu' | 'Orang Tua' | 'Mertua' | 'Lainnya';
  status_ktp: 'KTP Jaya Sampurna' | 'KTP Luar Desa' | 'Belum KTP';
  no_ktp?: string;
  pekerjaan?: string;
  status_pekerjaan?: 'Bekerja' | 'Tidak Bekerja' | 'Sekolah' | 'Mengurus Rumah Tangga' | 'Lainnya';
  status_kk: 'Anggota KK Jaya Sampurna' | 'Anggota KK Luar Desa' | 'KTP Luar per KK';
  pendidikan_terakhir?: 'Tidak Sekolah' | 'SD' | 'SMP' | 'SMA' | 'Diploma' | 'S1' | 'S2' | 'S3';
  status_kesehatan?: string;
  penyakit_bawaan?: string;
  catatan?: string;
}

// 3. STATISTICS & SUMMARY
export interface SummaryStatistik {
  total_kk: number;
  total_penduduk: number;
  total_laki_laki: number;
  total_perempuan: number;
  ktp_jaya_sampurna: number;
  ktp_luar_desa: number;
  kk_jaya_sampurna: number;
  kk_luar_desa: number;
}

export interface DistribusiUsia {
  kelompok_usia: string;
  jumlah: number;
}

export interface DistribusiPekerjaan {
  pekerjaan: string;
  jumlah: number;
}

export interface DistribusiGolonganDarah {
  golongan_darah: string;
  jumlah: number;
}

// 4. API RESPONSES
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  page: number;
  limit: number;
  total: number;
}
