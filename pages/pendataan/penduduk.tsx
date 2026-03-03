import React, { useEffect, useState, useCallback } from 'react';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiChevronLeft, FiChevronRight, FiInfo, FiDownload } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { Penduduk, PaginatedResponse, KartuKeluarga } from '@/interface/pendataan';
import MenuPendataan from '@/components/MenuPendataan';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { showAlert } from '@/lib/swal';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function PendudukPage() {
  const { user, isAdmin } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const swal = showAlert(theme);
  const [data, setData] = useState<Penduduk[]>([]);
  const [kaKKList, setKKList] = useState<KartuKeluarga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    kartu_keluarga_id: '',
    nik: '',
    nama_lengkap: '',
    jenis_kelamin: 'Laki-laki' as 'Laki-laki' | 'Perempuan',
    tanggal_lahir: '',
    tempat_lahir: '',
    status_perkawinan: 'Belum Kawin' as 'Belum Kawin' | 'Kawin' | 'Cerai Hidup' | 'Cerai Mati',
    agama: 'Islam' as 'Islam' | 'Kristen' | 'Katolik' | 'Hindu' | 'Buddha' | 'Konghucu',
    hubungan_keluarga: 'Anak' as 'Kepala Keluarga' | 'Istri' | 'Anak' | 'Menantu' | 'Cucu' | 'Orang Tua' | 'Mertua' | 'Lainnya',
    status_ktp: 'KTP Jaya Sampurna' as 'KTP Jaya Sampurna' | 'KTP Luar Desa' | 'Belum KTP',
    no_ktp: '',
    pekerjaan: '',
    status_pekerjaan: 'Bekerja' as 'Bekerja' | 'Tidak Bekerja' | 'Sekolah' | 'Mengurus Rumah Tangga' | 'Lainnya',
    status_kk: 'Anggota KK Jaya Sampurna' as 'Anggota KK Jaya Sampurna' | 'Anggota KK Luar Desa' | 'KTP Luar per KK',
    pendidikan_terakhir: 'SMA' as 'Tidak Sekolah' | 'SD' | 'SMP' | 'SMA' | 'Diploma' | 'S1' | 'S2' | 'S3',
  });

  const fetchData = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });

      const response = await fetch(`/api/pendataan/penduduk?${params}`, {
        headers: {
          'x-user-id': user.id,
        },
      });
      const result: PaginatedResponse<Penduduk> = await response.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      setData(result.data);
      setTotal(result.total);
      setError(null);
    } catch (err: unknown) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  }, [user, page, limit, search]);

  useEffect(() => {
    fetchData();
    fetchKKList();
  }, [fetchData]);

  const fetchKKList = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/pendataan/kartu-keluarga?limit=1000`, {
        headers: {
          'x-user-id': user.id,
        },
      });
      const result: PaginatedResponse<KartuKeluarga> = await response.json();
      if (result.success) {
        setKKList(result.data);
      }
    } catch (err) {
      console.error('Error fetching KK list:', err);
    }
  };

  const handleAddPenduduk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      if (formData.status_ktp !== 'Belum KTP' && !formData.no_ktp) {
        swal.warning('Validasi Gagal', 'Nomor KTP harus diisi jika status KTP bukan "Belum KTP"');
        return;
      }

      const url = editingId
        ? `/api/pendataan/penduduk`
        : `/api/pendataan/penduduk`;
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify(
          editingId ? { id: editingId, ...formData } : formData
        ),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message);
      }

      // Reset form
      setFormData({
        kartu_keluarga_id: '',
        nik: '',
        nama_lengkap: '',
        jenis_kelamin: 'Laki-laki',
        tanggal_lahir: '',
        tempat_lahir: '',
        status_perkawinan: 'Belum Kawin',
        agama: 'Islam',
        hubungan_keluarga: 'Anak',
        status_ktp: 'KTP Jaya Sampurna',
        no_ktp: '',
        pekerjaan: '',
        status_pekerjaan: 'Bekerja',
        status_kk: 'Anggota KK Jaya Sampurna',
        pendidikan_terakhir: 'SMA',
      });
      setEditingId(null);
      setShowAddForm(false);
      fetchData();

      swal.success(
        editingId ? 'Berhasil Diperbarui!' : 'Berhasil Ditambahkan!',
        editingId ? 'Data Penduduk berhasil diperbarui' : 'Data Penduduk berhasil ditambahkan'
      );
    } catch (err: unknown) {
      swal.error('Gagal Menyimpan', err instanceof Error ? err.message : 'Terjadi kesalahan');
    }
  };

  const handleEditPenduduk = (penduduk: Penduduk) => {
    setFormData({
      kartu_keluarga_id: penduduk.kartu_keluarga_id,
      nik: penduduk.nik,
      nama_lengkap: penduduk.nama_lengkap,
      jenis_kelamin: penduduk.jenis_kelamin,
      tanggal_lahir: penduduk.tanggal_lahir,
      tempat_lahir: penduduk.tempat_lahir || '',
      status_perkawinan: penduduk.status_perkawinan || 'Belum Kawin',
      agama: penduduk.agama || 'Islam',
      hubungan_keluarga: penduduk.hubungan_keluarga,
      status_ktp: penduduk.status_ktp,
      no_ktp: penduduk.no_ktp || '',
      pekerjaan: penduduk.pekerjaan || '',
      status_pekerjaan: penduduk.status_pekerjaan || 'Bekerja',
      status_kk: penduduk.status_kk,
      pendidikan_terakhir: penduduk.pendidikan_terakhir || 'SMA',
    });
    setEditingId(penduduk.id);
    setShowAddForm(true);
  };

  const handleDeletePenduduk = async (id: string) => {
    if (!user) return;
    const confirmed = await swal.confirm(
      'Hapus Data Penduduk?',
      'Data yang dihapus tidak dapat dikembalikan'
    );
    
    if (confirmed) {
      try {
        const response = await fetch(`/api/pendataan/penduduk?id=${id}`, {
          method: 'DELETE',
          headers: {
            'x-user-id': user.id,
          },
        });

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.message);
        }

        fetchData();
        swal.success('Berhasil Dihapus!', 'Data Penduduk berhasil dihapus');
      } catch (err: unknown) {
        swal.error('Gagal Menghapus', err instanceof Error ? err.message : 'Terjadi kesalahan');
      }
    }
  };

  const generateDummyData = (): Penduduk[] => {
    return [
      {
        id: '1',
        kartu_keluarga_id: '1',
        nik: '3201011501850001',
        nama_lengkap: 'Budi Santoso',
        jenis_kelamin: 'Laki-laki',
        tanggal_lahir: '1985-01-15',
        tempat_lahir: 'Jakarta',
        agama: 'Islam',
        pendidikan_terakhir: 'S1',
        pekerjaan: 'Pegawai Swasta',
        status_pekerjaan: 'Bekerja',
        status_perkawinan: 'Kawin',
        hubungan_keluarga: 'Kepala Keluarga',
        status_ktp: 'KTP Jaya Sampurna',
        status_kk: 'Anggota KK Jaya Sampurna',
        usia_tahun: 39,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '2',
        kartu_keluarga_id: '1',
        nik: '3201012208900002',
        nama_lengkap: 'Siti Nurhaliza',
        jenis_kelamin: 'Perempuan',
        tanggal_lahir: '1990-08-22',
        tempat_lahir: 'Bandung',
        agama: 'Islam',
        pendidikan_terakhir: 'S1',
        pekerjaan: 'Guru',
        status_pekerjaan: 'Bekerja',
        status_perkawinan: 'Kawin',
        hubungan_keluarga: 'Istri',
        status_ktp: 'KTP Jaya Sampurna',
        status_kk: 'Anggota KK Jaya Sampurna',
        usia_tahun: 34,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '3',
        kartu_keluarga_id: '2',
        nik: '3201011203880003',
        nama_lengkap: 'Ahmad Wijaya',
        jenis_kelamin: 'Laki-laki',
        tanggal_lahir: '1988-03-12',
        tempat_lahir: 'Surabaya',
        agama: 'Islam',
        pendidikan_terakhir: 'Diploma',
        pekerjaan: 'Wiraswasta',
        status_pekerjaan: 'Bekerja',
        status_perkawinan: 'Kawin',
        hubungan_keluarga: 'Kepala Keluarga',
        status_ktp: 'KTP Jaya Sampurna',
        status_kk: 'Anggota KK Jaya Sampurna',
        usia_tahun: 36,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  };

  const handleDownloadExcel = () => {
    const exportData = data.length > 0 ? data : generateDummyData();
    
    const worksheetData = exportData.map((item, index) => ({
      'No': index + 1,
      'NIK': item.nik,
      'Nama Lengkap': item.nama_lengkap,
      'Jenis Kelamin': item.jenis_kelamin,
      'Tempat Lahir': item.tempat_lahir,
      'Tanggal Lahir': new Date(item.tanggal_lahir).toLocaleDateString('id-ID'),
      'Usia': item.usia_tahun,
      'Agama': item.agama,
      'Pendidikan': item.pendidikan_terakhir,
      'Pekerjaan': item.pekerjaan,
      'Status Perkawinan': item.status_perkawinan,
      'Hubungan Keluarga': item.hubungan_keluarga,
      'Status KTP': item.status_ktp,
      'Status KK': item.status_kk,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Penduduk');
    
    // Set column widths
    worksheet['!cols'] = [
      { wch: 5 },  // No
      { wch: 18 }, // NIK
      { wch: 25 }, // Nama Lengkap
      { wch: 15 }, // Jenis Kelamin
      { wch: 15 }, // Tempat Lahir
      { wch: 15 }, // Tanggal Lahir
      { wch: 8 },  // Usia
      { wch: 12 }, // Agama
      { wch: 15 }, // Pendidikan
      { wch: 20 }, // Pekerjaan
      { wch: 18 }, // Status Perkawinan
      { wch: 20 }, // Hubungan Keluarga
      { wch: 22 }, // Status KTP
      { wch: 28 }, // Status KK
    ];

    XLSX.writeFile(workbook, `Data_Penduduk_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleDownloadPDF = () => {
    const exportData = data.length > 0 ? data : generateDummyData();
    
    const doc = new jsPDF('landscape');
    
    // Add title
    doc.setFontSize(16);
    doc.text('Data Penduduk', 14, 15);
    
    // Add date
    doc.setFontSize(10);
    doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 14, 22);
    
    // Table data
    const tableData = exportData.map((item, index) => [
      index + 1,
      item.nik || '-',
      item.nama_lengkap || '-',
      item.jenis_kelamin === 'Laki-laki' ? 'L' : 'P',
      `${item.tempat_lahir || '-'}, ${new Date(item.tanggal_lahir).toLocaleDateString('id-ID')}`,
      item.usia_tahun || 0,
      item.agama || '-',
      item.pekerjaan || '-',
      item.status_perkawinan || '-',
    ]);

    // Add table
    autoTable(doc, {
      head: [['No', 'NIK', 'Nama', 'JK', 'TTL', 'Usia', 'Agama', 'Pekerjaan', 'Status']],
      body: tableData,
      startY: 28,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save(`Data_Penduduk_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleCancelEdit = () => {
    setFormData({
      kartu_keluarga_id: '',
      nik: '',
      nama_lengkap: '',
      jenis_kelamin: 'Laki-laki',
      tanggal_lahir: '',
      tempat_lahir: '',
      status_perkawinan: 'Belum Kawin',
      agama: 'Islam',
      hubungan_keluarga: 'Anak',
      status_ktp: 'KTP Jaya Sampurna',
      no_ktp: '',
      pekerjaan: '',
      status_pekerjaan: 'Bekerja',
      status_kk: 'Anggota KK Jaya Sampurna',
      pendidikan_terakhir: 'SMA',
    });
    setEditingId(null);
    setShowAddForm(false);
  };



  const totalPages = Math.ceil(total / limit);

  const textMain = isDark ? 'text-white' : 'text-gray-900';
  const textSub = isDark ? 'text-gray-400' : 'text-gray-600';
  const cardBg = isDark ? 'bg-gradient-to-br from-[#181926]/80 via-[#231b2e]/80 to-[#2d1e3a]/80 border-white/10' : 'bg-white border-gray-200';
  const inputBg = isDark ? 'bg-[#181926] border-white/10 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900';
  const tableBg = isDark ? 'bg-[#181926]/50' : 'bg-gray-50';
  const tableHoverBg = isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100';

  return (
    <div className={`min-h-screen p-3 sm:p-6 ${
      isDark ? 'bg-gradient-to-br from-[#0f0f1a] via-[#1a0f2e] to-[#2d1e3a]' : 'bg-gradient-to-br from-slate-50 to-slate-100'
    }`}>
      <div className="max-w-7xl mx-auto">
        {/* Menu Navigasi */}
        <MenuPendataan />

        {/* Info Banner untuk User Biasa */}
        {!isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-lg p-4 mb-6 flex items-start gap-3 ${
              isDark ? 'bg-blue-500/10 border border-blue-400/30' : 'bg-blue-50 border border-blue-200'
            }`}
          >
            <FiInfo className="text-blue-500 mt-0.5 flex-shrink-0" size={20} />
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-blue-300' : 'text-blue-900'}`}>Informasi untuk Warga</h3>
              <p className={`text-sm mt-1 ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                Anda dapat mendaftarkan data penduduk untuk keluarga Anda. Data yang ditampilkan adalah data yang Anda daftarkan. 
                Admin dapat melihat dan mengelola semua data penduduk.
              </p>
            </div>
          </motion.div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className={`text-2xl sm:text-3xl font-bold ${textMain}`}>Kelola Data Penduduk</h1>
          </div>
          <button
            onClick={() => {
              handleCancelEdit();
              setShowAddForm(!showAddForm);
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition w-full sm:w-auto justify-center"
          >
            <FiPlus /> {editingId ? 'Edit Penduduk' : 'Tambah Penduduk'}
          </button>
        </motion.div>

        {/* Add Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-lg p-6 shadow-lg mb-6 ${cardBg} border`}
          >
            <h2 className={`text-lg font-semibold mb-4 ${textMain}`}>{editingId ? 'Edit Data Penduduk' : 'Tambah Data Penduduk Baru'}</h2>
            <form onSubmit={handleAddPenduduk} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={formData.kartu_keluarga_id}
                onChange={(e) => setFormData({ ...formData, kartu_keluarga_id: e.target.value })}
                className={`border rounded px-3 py-2 ${inputBg}`}
                required
              >
                <option value="">-- Pilih Kartu Keluarga --</option>
                {kaKKList.map((kk) => (
                  <option key={kk.id} value={kk.id}>
                    {kk.no_kk} - {kk.nama_kepala_keluarga}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="NIK"
                value={formData.nik}
                onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                className={`border rounded px-3 py-2 ${inputBg}`}
                required
                disabled={!!editingId}
              />

              <input
                type="text"
                placeholder="Nama Lengkap"
                value={formData.nama_lengkap}
                onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                className={`border rounded px-3 py-2 md:col-span-2 ${inputBg}`}
                required
              />

              <select
                value={formData.jenis_kelamin}
                onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value as 'Laki-laki' | 'Perempuan' })}
                className={`border rounded px-3 py-2 ${inputBg}`}
              >
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>

              <input
                type="date"
                value={formData.tanggal_lahir}
                onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })}
                className={`border rounded px-3 py-2 ${inputBg}`}
                required
              />

              <input
                type="text"
                placeholder="Tempat Lahir"
                value={formData.tempat_lahir}
                onChange={(e) => setFormData({ ...formData, tempat_lahir: e.target.value })}
                className={`border rounded px-3 py-2 ${inputBg}`}
              />

              <select
                value={formData.status_perkawinan}
                onChange={(e) => setFormData({ ...formData, status_perkawinan: e.target.value as typeof formData.status_perkawinan })}
                className={`border rounded px-3 py-2 ${inputBg}`}
              >
                <option value="Belum Kawin">Belum Kawin</option>
                <option value="Kawin">Kawin</option>
                <option value="Cerai Hidup">Cerai Hidup</option>
                <option value="Cerai Mati">Cerai Mati</option>
              </select>

              <select
                value={formData.agama}
                onChange={(e) => setFormData({ ...formData, agama: e.target.value as typeof formData.agama })}
                className={`border rounded px-3 py-2 ${inputBg}`}
              >
                <option value="Islam">Islam</option>
                <option value="Kristen">Kristen</option>
                <option value="Katolik">Katolik</option>
                <option value="Hindu">Hindu</option>
                <option value="Buddha">Buddha</option>
                <option value="Konghucu">Konghucu</option>
              </select>

              <select
                value={formData.hubungan_keluarga}
                onChange={(e) => setFormData({ ...formData, hubungan_keluarga: e.target.value as typeof formData.hubungan_keluarga })}
                className={`border rounded px-3 py-2 ${inputBg}`}
              >
                <option value="Kepala Keluarga">Kepala Keluarga</option>
                <option value="Istri">Istri</option>
                <option value="Anak">Anak</option>
                <option value="Cucu">Cucu</option>
                <option value="Orang Tua">Orang Tua</option>
                <option value="Mertua">Mertua</option>
                <option value="Lainnya">Lainnya</option>
              </select>

              <select
                value={formData.status_ktp}
                onChange={(e) => setFormData({ ...formData, status_ktp: e.target.value as 'KTP Jaya Sampurna' | 'KTP Luar Desa' | 'Belum KTP' })}
                className={`border rounded px-3 py-2 ${inputBg}`}
              >
                <option value="KTP Jaya Sampurna">KTP Jaya Sampurna</option>
                <option value="KTP Luar Desa">KTP Luar Desa</option>
                <option value="Belum KTP">Belum KTP</option>
              </select>

              {formData.status_ktp !== 'Belum KTP' && (
                <input
                  type="text"
                  placeholder="Nomor KTP"
                  value={formData.no_ktp}
                  onChange={(e) => setFormData({ ...formData, no_ktp: e.target.value })}
                  className={`border rounded px-3 py-2 ${inputBg}`}
                  required
                />
              )}

              <input
                type="text"
                placeholder="Pekerjaan"
                value={formData.pekerjaan}
                onChange={(e) => setFormData({ ...formData, pekerjaan: e.target.value })}
                className={`border rounded px-3 py-2 ${inputBg}`}
              />

              <select
                value={formData.status_pekerjaan}
                onChange={(e) => setFormData({ ...formData, status_pekerjaan: e.target.value as typeof formData.status_pekerjaan })}
                className={`border rounded px-3 py-2 ${inputBg}`}
              >
                <option value="Bekerja">Bekerja</option>
                <option value="Tidak Bekerja">Tidak Bekerja</option>
                <option value="Sekolah">Sekolah</option>
                <option value="Mengurus Rumah Tangga">Mengurus Rumah Tangga</option>
              </select>

              <select
                value={formData.status_kk}
                onChange={(e) => setFormData({ ...formData, status_kk: e.target.value as typeof formData.status_kk })}
                className={`border rounded px-3 py-2 ${inputBg}`}
              >
                <option value="Anggota KK Jaya Sampurna">Anggota KK Jaya Sampurna</option>
                <option value="Anggota KK Luar Desa">Anggota KK Luar Desa</option>
                <option value="KTP Luar per KK">KTP Luar per KK</option>
              </select>

              <select
                value={formData.pendidikan_terakhir}
                onChange={(e) => setFormData({ ...formData, pendidikan_terakhir: e.target.value as typeof formData.pendidikan_terakhir })}
                className={`border rounded px-3 py-2 ${inputBg}`}
              >
                <option value="Tidak Sekolah">Tidak Sekolah</option>
                <option value="SD">SD</option>
                <option value="SMP">SMP</option>
                <option value="SMA">SMA</option>
                <option value="Diploma">Diploma</option>
                <option value="S1">S1</option>
                <option value="S2">S2</option>
                <option value="S3">S3</option>
              </select>

              <div className="md:col-span-3 flex gap-2">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
                >
                  {editingId ? 'Update' : 'Simpan'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded transition"
                >
                  Batal
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Search and Download */}
        <div className={`rounded-lg p-4 shadow mb-6 ${cardBg} border`}>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1 flex items-center gap-2">
              <FiSearch className={isDark ? 'text-gray-500' : 'text-gray-400'} />
              <input
                type="text"
                placeholder="Cari NIK atau Nama..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className={`flex-1 outline-none bg-transparent ${textMain}`}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDownloadExcel}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isDark
                    ? 'bg-green-600/20 text-green-300 border border-green-500/30 hover:bg-green-500/30 hover:shadow-lg'
                    : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 hover:shadow-md'
                }`}
              >
                <FiDownload className="w-4 h-4" />
                <span>Excel</span>
              </button>
              <button
                onClick={handleDownloadPDF}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isDark
                    ? 'bg-red-600/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 hover:shadow-lg'
                    : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 hover:shadow-md'
                }`}
              >
                <FiDownload className="w-4 h-4" />
                <span>PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            Error: {error}
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`rounded-lg shadow-lg overflow-hidden ${cardBg} border`}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[640px]">
                  <thead className={`border-b ${tableBg}`}>
                    <tr>
                      <th className={`px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold ${textMain}`}>NIK</th>
                      <th className={`px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold ${textMain}`}>Nama</th>
                      <th className={`px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold ${textMain}`}>Gender/Usia</th>
                      <th className={`px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold ${textMain}`}>Status KTP</th>
                      <th className={`px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold ${textMain}`}>Pekerjaan</th>
                      <th className={`px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold ${textMain}`}>Hubungan</th>
                      <th className={`px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold ${textMain}`}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.map((penduduk) => (
                      <tr key={penduduk.id} className={`transition ${tableHoverBg}`}>
                        <td className={`px-2 sm:px-4 py-2 sm:py-3 font-mono text-xs ${textMain}`}>{penduduk.nik}</td>
                        <td className={`px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm ${textMain}`}>{penduduk.nama_lengkap}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs">
                          <div className={textMain}>{penduduk.jenis_kelamin === 'Laki-laki' ? '👨' : '👩'} {penduduk.jenis_kelamin}</div>
                          <div className={textSub}>{penduduk.usia_tahun} tahun</div>
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                            penduduk.status_ktp === 'KTP Jaya Sampurna'
                              ? isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-800'
                              : penduduk.status_ktp === 'KTP Luar Desa'
                              ? isDark ? 'bg-orange-500/20 text-orange-300' : 'bg-orange-100 text-orange-800'
                              : isDark ? 'bg-gray-500/20 text-gray-300' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {penduduk.status_ktp}
                          </span>
                        </td>
                        <td className={`px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm ${textMain}`}>{penduduk.pekerjaan || '-'}</td>
                        <td className={`px-2 sm:px-4 py-2 sm:py-3 text-xs ${textMain}`}>{penduduk.hubungan_keluarga}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                          {isAdmin ? (
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => handleEditPenduduk(penduduk)}
                                className={`transition p-2 rounded ${
                                  isDark ? 'text-blue-400 hover:bg-blue-500/20' : 'text-blue-600 hover:bg-blue-50'
                                }`}
                                title="Edit"
                              >
                                <FiEdit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeletePenduduk(penduduk.id)}
                                className={`transition p-2 rounded ${
                                  isDark ? 'text-red-400 hover:bg-red-500/20' : 'text-red-600 hover:bg-red-50'
                                }`}
                                title="Hapus"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <span className={`text-xs italic ${textSub}`}>Data Anda</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Menampilkan {(page - 1) * limit + 1} - {Math.min(page * limit, total)} dari {total} data
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    page === 1
                      ? isDark
                        ? 'bg-gray-800/50 text-gray-600 cursor-not-allowed border border-white/5'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : isDark
                      ? 'bg-[#181926]/80 text-gray-300 border border-white/10 hover:bg-purple-500/20 hover:text-purple-300 hover:shadow-lg hover:shadow-purple-500/10'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md'
                  }`}
                >
                  <FiChevronLeft className="w-4 h-4" />
                  <span>Sebelumnya</span>
                </button>
                
                <div className={`px-5 py-2 rounded-lg font-semibold ${
                  isDark 
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' 
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  Halaman {page} dari {totalPages}
                </div>
                
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    page === totalPages
                      ? isDark
                        ? 'bg-gray-800/50 text-gray-600 cursor-not-allowed border border-white/5'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : isDark
                      ? 'bg-[#181926]/80 text-gray-300 border border-white/10 hover:bg-purple-500/20 hover:text-purple-300 hover:shadow-lg hover:shadow-purple-500/10'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md'
                  }`}
                >
                  <span>Berikutnya</span>
                  <FiChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
