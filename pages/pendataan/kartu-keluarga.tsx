import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiInfo, FiDownload } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { KartuKeluarga, PaginatedResponse } from '@/interface/pendataan';
import MenuPendataan from '@/components/MenuPendataan';
import { ModernTable } from '@/components/ModernTable';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { showAlert } from '@/lib/swal';
import { useRealtimeRefresh } from '@/lib/realtime';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function KartuKeluargaPage() {
  const { user, isAdmin } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const swal = showAlert(theme);
  const [data, setData] = useState<KartuKeluarga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    no_kk: '',
    rt: '',
    rw: '',
    alamat: '',
    kelurahan: '',
    kecamatan: '',
    kabupaten: '',
    provinsi: '',
    nama_kepala_keluarga: '',
    nik_kepala_keluarga: '',
    status_kk: 'aktif' as 'aktif' | 'non-aktif' | 'pindah' | 'hilang',
    kategori_kk: '' as 'Jaya Sampurna' | 'Luar Desa' | '',
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

      const response = await fetch(`/api/pendataan/kartu-keluarga?${params}`, {
        headers: {
          'x-user-id': user.id,
        },
      });
      const result: PaginatedResponse<KartuKeluarga> = await response.json();

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
  }, [fetchData]);

  // Real-time subscription untuk perubahan data KK
  const { lastEvent } = useRealtimeRefresh({
    tables: ['kartu_keluarga'],
    refetch: fetchData,
    source: 'supabase',
    debounceMs: 800,
  });

  const handleAddKK = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const trimmedPayload = {
      ...formData,
      no_kk: formData.no_kk.trim(),
      rt: formData.rt.trim(),
      rw: formData.rw.trim(),
      alamat: formData.alamat.trim(),
      kelurahan: formData.kelurahan.trim(),
      kecamatan: formData.kecamatan.trim(),
      kabupaten: formData.kabupaten.trim(),
      provinsi: formData.provinsi.trim(),
      nama_kepala_keluarga: formData.nama_kepala_keluarga.trim(),
      nik_kepala_keluarga: formData.nik_kepala_keluarga.trim(),
    };

    const requiredFields: Array<{ key: keyof typeof trimmedPayload; label: string }> = [
      { key: 'no_kk', label: 'No. Kartu Keluarga' },
      { key: 'rt', label: 'RT' },
      { key: 'rw', label: 'RW' },
      { key: 'alamat', label: 'Alamat Lengkap' },
      { key: 'kelurahan', label: 'Kelurahan' },
      { key: 'kecamatan', label: 'Kecamatan' },
      { key: 'kabupaten', label: 'Kabupaten/Kota' },
      { key: 'provinsi', label: 'Provinsi' },
      { key: 'nama_kepala_keluarga', label: 'Nama Kepala Keluarga' },
      { key: 'nik_kepala_keluarga', label: 'NIK Kepala Keluarga' },
      { key: 'kategori_kk', label: 'Kategori Keluarga' },
    ];

    const emptyLabels = requiredFields
      .filter(({ key }) => {
        const value = trimmedPayload[key];
        if (typeof value === 'string') return value.trim() === '';
        return value == null || value === '';
      })
      .map(({ label }) => label);

    if (emptyLabels.length > 0) {
      swal.error('Validasi Gagal', `Field wajib diisi: ${emptyLabels.join(', ')}`);
      return;
    }
    
    try {
      const url = editingId 
        ? `/api/pendataan/kartu-keluarga`
        : `/api/pendataan/kartu-keluarga`;
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify(
          editingId ? { id: editingId, ...trimmedPayload } : trimmedPayload
        ),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message);
      }

      // Reset form
      setFormData({
        no_kk: '',
        rt: '',
        rw: '',
        alamat: '',
        kelurahan: '',
        kecamatan: '',
        kabupaten: '',
        provinsi: '',
        nama_kepala_keluarga: '',
        nik_kepala_keluarga: '',
        status_kk: 'aktif',
        kategori_kk: '',
      });
      setEditingId(null);
      setShowAddForm(false);
      fetchData(); // Refresh data

      swal.success(
        editingId ? 'Berhasil Diperbarui!' : 'Berhasil Ditambahkan!',
        editingId ? 'Data Kartu Keluarga berhasil diperbarui' : 'Data Kartu Keluarga berhasil ditambahkan'
      );
    } catch (err: unknown) {
      swal.error('Gagal Menyimpan', err instanceof Error ? err.message : 'Terjadi kesalahan');
    }
  };

  const handleEditKK = (kk: KartuKeluarga) => {
    setFormData({
      no_kk: kk.no_kk,
      rt: kk.rt,
      rw: kk.rw,
      alamat: kk.alamat,
      kelurahan: kk.kelurahan || '',
      kecamatan: kk.kecamatan || '',
      kabupaten: kk.kabupaten || '',
      provinsi: kk.provinsi || '',
      nama_kepala_keluarga: kk.nama_kepala_keluarga,
      nik_kepala_keluarga: kk.nik_kepala_keluarga || '',
      status_kk: kk.status_kk,
      kategori_kk: (kk.kategori_kk || '') as 'Jaya Sampurna' | 'Luar Desa' | '',
    });
    setEditingId(kk.id);
    setShowAddForm(true);
  };

  const handleDeleteKK = async (id: string) => {
    if (!user) return;
    const confirmed = await swal.confirm(
      'Hapus Kartu Keluarga?',
      'Data yang dihapus tidak dapat dikembalikan'
    );
    
    if (confirmed) {
      try {
        const response = await fetch(`/api/pendataan/kartu-keluarga?id=${id}`, {
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
        swal.success('Berhasil Dihapus!', 'Data Kartu Keluarga berhasil dihapus');
      } catch (err: unknown) {
        swal.error('Gagal Menghapus', err instanceof Error ? err.message : 'Terjadi kesalahan');
      }
    }
  };

  const generateDummyData = (): KartuKeluarga[] => {
    return [
      {
        id: '1',
        no_kk: '3201012101230001',
        rt: '001',
        rw: '001',
        alamat: 'Jl. Merdeka No. 123',
        kelurahan: 'Jaya Sampurna',
        kecamatan: 'Jaya Sampurna',
        kabupaten: 'Kabupaten Bogor',
        provinsi: 'Jawa Barat',
        nama_kepala_keluarga: 'Budi Santoso',
        nik_kepala_keluarga: '3201011501850001',
        status_kk: 'aktif',
        kategori_kk: 'Jaya Sampurna',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '2',
        no_kk: '3201012101230002',
        rt: '002',
        rw: '001',
        alamat: 'Jl. Sudirman No. 45',
        kelurahan: 'Jaya Sampurna',
        kecamatan: 'Jaya Sampurna',
        kabupaten: 'Kabupaten Bogor',
        provinsi: 'Jawa Barat',
        nama_kepala_keluarga: 'Siti Nurhaliza',
        nik_kepala_keluarga: '3201012208900002',
        status_kk: 'aktif',
        kategori_kk: 'Luar Desa',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '3',
        no_kk: '3201012101230003',
        rt: '003',
        rw: '002',
        alamat: 'Jl. Gatot Subroto No. 78',
        kelurahan: 'Jaya Sampurna',
        kecamatan: 'Jaya Sampurna',
        kabupaten: 'Kabupaten Bogor',
        provinsi: 'Jawa Barat',
        nama_kepala_keluarga: 'Ahmad Wijaya',
        nik_kepala_keluarga: '3201011203880003',
        status_kk: 'aktif',
        kategori_kk: 'Jaya Sampurna',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  };

  const handleDownloadExcel = () => {
    const exportData = data.length > 0 ? data : generateDummyData();
    
    const worksheetData = exportData.map((item, index) => ({
      'No': index + 1,
      'No. KK': item.no_kk,
      'RT': item.rt,
      'RW': item.rw,
      'Alamat': item.alamat,
      'Kelurahan': item.kelurahan || '-',
      'Kecamatan': item.kecamatan || '-',
      'Kabupaten': item.kabupaten || '-',
      'Provinsi': item.provinsi || '-',
      'Nama Kepala Keluarga': item.nama_kepala_keluarga,
      'NIK Kepala Keluarga': item.nik_kepala_keluarga,
      'Status KK': item.status_kk.toUpperCase(),
      'Kategori': item.kategori_kk || '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Kartu Keluarga');
    
    // Set column widths
    worksheet['!cols'] = [
      { wch: 5 },  // No
      { wch: 20 }, // No. KK
      { wch: 8 },  // RT
      { wch: 8 },  // RW
      { wch: 25 }, // Alamat
      { wch: 15 }, // Kelurahan
      { wch: 15 }, // Kecamatan
      { wch: 18 }, // Kabupaten
      { wch: 15 }, // Provinsi
      { wch: 25 }, // Nama Kepala Keluarga
      { wch: 20 }, // NIK Kepala Keluarga
      { wch: 12 }, // Status KK
      { wch: 15 }, // Kategori
    ];

    XLSX.writeFile(workbook, `Data_Kartu_Keluarga_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleDownloadPDF = () => {
    const exportData = data.length > 0 ? data : generateDummyData();
    
    const doc = new jsPDF('landscape');
    
    // Add title
    doc.setFontSize(16);
    doc.text('Data Kartu Keluarga', 14, 15);
    
    // Add date
    doc.setFontSize(10);
    doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 14, 22);
    
    // Table data
    const tableData = exportData.map((item, index) => [
      index + 1,
      item.no_kk || '-',
      item.rt || '-',
      item.rw || '-',
      item.alamat || '-',
      item.kelurahan || '-',
      item.kecamatan || '-',
      item.kabupaten || '-',
      item.provinsi || '-',
      item.nama_kepala_keluarga || '-',
      item.nik_kepala_keluarga || '-',
      item.status_kk?.toUpperCase() || '-',
      item.kategori_kk || '-',
    ]);

    // Add table
    autoTable(doc, {
      head: [['No', 'No. KK', 'RT', 'RW', 'Alamat', 'Kelurahan', 'Kecamatan', 'Kabupaten', 'Provinsi', 'Nama KK', 'NIK KK', 'Status', 'Kategori']],
      body: tableData,
      startY: 28,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save(`Data_Kartu_Keluarga_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleCancelEdit = () => {
    setFormData({
      no_kk: '',
      rt: '',
      rw: '',
      alamat: '',
      kelurahan: '',
      kecamatan: '',
      kabupaten: '',
      provinsi: '',
      nama_kepala_keluarga: '',
      nik_kepala_keluarga: '',
      status_kk: 'aktif',
      kategori_kk: '',
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const totalPages = Math.ceil(total / limit);

  const textMain = isDark ? 'text-white' : 'text-gray-900';
  const textSub = isDark ? 'text-gray-400' : 'text-gray-600';
  const cardBg = isDark ? 'bg-gradient-to-br from-[#181926]/80 via-[#231b2e]/80 to-[#2d1e3a]/80 border-white/10' : 'bg-white border-gray-200';
  const inputBg = isDark ? 'bg-[#181926] border-white/10 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900';

  // Define table columns using TanStack Table
  const columns = useMemo<ColumnDef<KartuKeluarga>[]>(
    () => [
      {
        accessorKey: 'no_kk',
        header: 'No. KK',
        cell: (info) => (
          <span className="font-mono text-xs">{info.getValue() as string}</span>
        ),
      },
      {
        accessorFn: (row) => `RT ${row.rt} / RW ${row.rw}`,
        id: 'rtrw',
        header: 'RT/RW',
        cell: (info) => <span className="text-xs">{info.getValue() as string}</span>,
      },
      {
        accessorKey: 'nama_kepala_keluarga',
        header: 'Kepala Keluarga',
        cell: (info) => <span className="font-medium text-xs">{info.getValue() as string}</span>,
      },
      {
        accessorFn: (row) => {
          const parts = [];
          if (row.alamat) parts.push(row.alamat);
          if (row.kelurahan) parts.push(`Kel. ${row.kelurahan}`);
          if (row.kecamatan) parts.push(`Kec. ${row.kecamatan}`);
          if (row.kabupaten) parts.push(row.kabupaten);
          if (row.provinsi) parts.push(row.provinsi);
          return parts.join(', ');
        },
        id: 'alamat_lengkap',
        header: 'Alamat Lengkap',
        cell: (info) => (
          <div className="text-xs max-w-md">
            <p className="line-clamp-2 leading-tight">{info.getValue() as string}</p>
          </div>
        ),
      },
      {
        accessorKey: 'alamat',
        header: 'Jalan',
        cell: (info) => <span className="text-xs max-w-xs truncate">{(info.getValue() as string) || '-'}</span>,
      },
      {
        accessorKey: 'kelurahan',
        header: 'Kelurahan',
        cell: (info) => <span className="text-xs">{(info.getValue() as string) || '-'}</span>,
      },
      {
        accessorKey: 'kecamatan',
        header: 'Kecamatan',
        cell: (info) => <span className="text-xs">{(info.getValue() as string) || '-'}</span>,
      },
      {
        accessorKey: 'kabupaten',
        header: 'Kabupaten',
        cell: (info) => <span className="text-xs">{(info.getValue() as string) || '-'}</span>,
      },
      {
        accessorKey: 'provinsi',
        header: 'Provinsi',
        cell: (info) => <span className="text-xs">{(info.getValue() as string) || '-'}</span>,
      },
      {
        accessorKey: 'nik_kepala_keluarga',
        header: 'NIK KK',
        cell: (info) => (
          <span className="font-mono text-xs">{(info.getValue() as string) || '-'}</span>
        ),
      },
      {
        accessorKey: 'status_kk',
        header: 'Status',
        cell: (info) => {
          const val = info.getValue() as string;
          const statusMap: Record<string, { bg: string; text: string }> = {
            'aktif': isDark ? { bg: 'bg-green-500/20', text: 'text-green-300' } : { bg: 'bg-green-100', text: 'text-green-800' },
            'non-aktif': isDark ? { bg: 'bg-yellow-500/20', text: 'text-yellow-300' } : { bg: 'bg-yellow-100', text: 'text-yellow-800' },
            'pindah': isDark ? { bg: 'bg-orange-500/20', text: 'text-orange-300' } : { bg: 'bg-orange-100', text: 'text-orange-800' },
            'hilang': isDark ? { bg: 'bg-red-500/20', text: 'text-red-300' } : { bg: 'bg-red-100', text: 'text-red-800' },
          };
          const status = statusMap[val] || (isDark ? { bg: 'bg-gray-500/20', text: 'text-gray-300' } : { bg: 'bg-gray-100', text: 'text-gray-800' });
          return (
            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${status.bg} ${status.text}`}>
              {val.charAt(0).toUpperCase() + val.slice(1)}
            </span>
          );
        },
      },
      {
        accessorKey: 'kategori_kk',
        header: 'Kategori',
        cell: (info) => {
          const val = info.getValue() as string;
          const kategoriMap: Record<string, { bg: string; text: string }> = {
            'Jaya Sampurna': isDark ? { bg: 'bg-blue-500/20', text: 'text-blue-300' } : { bg: 'bg-blue-100', text: 'text-blue-800' },
            'Luar Desa': isDark ? { bg: 'bg-purple-500/20', text: 'text-purple-300' } : { bg: 'bg-purple-100', text: 'text-purple-800' },
          };
          const kategori = kategoriMap[val] || (isDark ? { bg: 'bg-gray-500/20', text: 'text-gray-300' } : { bg: 'bg-gray-100', text: 'text-gray-800' });
          return val ? (
            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${kategori.bg} ${kategori.text}`}>
              {val}
            </span>
          ) : (
            <span className={`text-xs ${textSub}`}>-</span>
          );
        },
      },
      {
        id: 'aksi',
        header: 'Aksi',
        cell: (info) => (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleEditKK(info.row.original)}
              className={`transition p-2 rounded ${
                isDark ? 'text-blue-400 hover:bg-blue-500/20' : 'text-blue-600 hover:bg-blue-50'
              }`}
              title="Edit"
            >
              <FiEdit2 className="w-4 h-4" />
            </button>

            {isAdmin && (
              <button
                onClick={() => handleDeleteKK(info.row.original.id)}
                className={`transition p-2 rounded ${
                  isDark ? 'text-red-400 hover:bg-red-500/20' : 'text-red-600 hover:bg-red-50'
                }`}
                title="Hapus"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ),
      },
    ],
    [isDark, isAdmin, textSub, handleEditKK, handleDeleteKK]
  );

  return (
    <div className={`min-h-screen ${
      isDark ? 'bg-gradient-to-br from-[#0f0f1a] via-[#1a0f2e] to-[#2d1e3a]' : 'bg-gradient-to-br from-slate-50 to-slate-100'
    }`}>
      <div className="pt-20 md:pt-6 px-4 md:px-8 pb-8">
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
                Anda dapat mendaftarkan data Kartu Keluarga Anda sendiri. Data yang ditampilkan adalah data yang Anda daftarkan. 
                Admin dapat melihat dan mengelola semua data.
              </p>
            </div>
          </motion.div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4"
        >
          <div> 
            <h1 className={`text-2xl sm:text-3xl font-bold ${textMain}`}>Kelola Kartu Keluarga</h1>
          </div>
          <button
            onClick={() => {
              handleCancelEdit();
              setShowAddForm(!showAddForm);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition w-full sm:w-auto justify-center"
          >
            <FiPlus /> {editingId ? 'Edit KK' : 'Tambah KK'}
          </button>
        </motion.div>

        {/* Add Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-lg p-6 shadow-lg mb-6 ${cardBg} border-2`}
          >
            <h2 className={`text-lg font-semibold mb-4 ${textMain}`}>{editingId ? 'Edit Kartu Keluarga' : 'Tambah Kartu Keluarga Baru'}</h2>
            <form onSubmit={handleAddKK} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${textMain}`}>No. Kartu Keluarga</label>
                <input
                  type="text"
                  placeholder="Contoh: 3201011203880001"
                  value={formData.no_kk}
                  onChange={(e) => setFormData({ ...formData, no_kk: e.target.value })}
                  className={`w-full border-2 rounded px-3 py-2 ${inputBg}`}
                  required
                  disabled={!!editingId}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${textMain}`}>RT (Rukun Tetangga)</label>
                <input
                  type="text"
                  placeholder="Contoh: 01"
                  value={formData.rt}
                  onChange={(e) => setFormData({ ...formData, rt: e.target.value })}
                  className={`w-full border-2 rounded px-3 py-2 ${inputBg}`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${textMain}`}>RW (Rukun Warga)</label>
                <input
                  type="text"
                  placeholder="Contoh: 01"
                  value={formData.rw}
                  onChange={(e) => setFormData({ ...formData, rw: e.target.value })}
                  className={`w-full border-2 rounded px-3 py-2 ${inputBg}`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${textMain}`}>Alamat Lengkap</label>
                <input
                  type="text"
                  placeholder="Contoh: Jl. Merdeka No. 123"
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  className={`w-full border-2 rounded px-3 py-2 ${inputBg}`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${textMain}`}>Kelurahan</label>
                <input
                  type="text"
                  placeholder="Contoh: Jaya Sampurna"
                  value={formData.kelurahan}
                  onChange={(e) => setFormData({ ...formData, kelurahan: e.target.value })}
                  className={`w-full border rounded px-3 py-2 ${inputBg}`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${textMain}`}>Kecamatan</label>
                <input
                  type="text"
                  placeholder="Contoh: Jaya Sampurna"
                  value={formData.kecamatan}
                  onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value })}
                  className={`w-full border rounded px-3 py-2 ${inputBg}`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${textMain}`}>Kabupaten/Kota</label>
                <input
                  type="text"
                  placeholder="Contoh: Kabupaten Bogor"
                  value={formData.kabupaten}
                  onChange={(e) => setFormData({ ...formData, kabupaten: e.target.value })}
                  className={`w-full border rounded px-3 py-2 ${inputBg}`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${textMain}`}>Provinsi</label>
                <input
                  type="text"
                  placeholder="Contoh: Jawa Barat"
                  value={formData.provinsi}
                  onChange={(e) => setFormData({ ...formData, provinsi: e.target.value })}
                  className={`w-full border rounded px-3 py-2 ${inputBg}`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${textMain}`}>Nama Kepala Keluarga</label>
                <input
                  type="text"
                  placeholder="Contoh: Ahmad Wijaya"
                  value={formData.nama_kepala_keluarga}
                  onChange={(e) => setFormData({ ...formData, nama_kepala_keluarga: e.target.value })}
                  className={`w-full border rounded px-3 py-2 ${inputBg}`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${textMain}`}>NIK Kepala Keluarga</label>
                <input
                  type="text"
                  placeholder="Contoh: 3201011203880003"
                  value={formData.nik_kepala_keluarga}
                  onChange={(e) => setFormData({ ...formData, nik_kepala_keluarga: e.target.value })}
                  className={`w-full border rounded px-3 py-2 ${inputBg}`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${textMain}`}>Status Keluarga</label>
                <select
                  value={formData.status_kk}
                  onChange={(e) => setFormData({ ...formData, status_kk: e.target.value as any })}
                  className={`w-full border rounded px-3 py-2 ${inputBg}`}
                >
                  <option value="aktif">Aktif</option>
                  <option value="non-aktif">Non-Aktif</option>
                  <option value="pindah">Pindah</option>
                  <option value="hilang">Hilang</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${textMain}`}>Kategori Keluarga</label>
                <select
                  value={formData.kategori_kk}
                  onChange={(e) => setFormData({ ...formData, kategori_kk: e.target.value as any })}
                  className={`w-full border rounded px-3 py-2 ${inputBg}`}
                  required
                >
                  <option value="">- Pilih Kategori -</option>
                  <option value="Jaya Sampurna">Jaya Sampurna</option>
                  <option value="Luar Desa">Luar Desa</option>
                </select>
              </div>
              <div className="md:col-span-2 flex gap-2">
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
                placeholder="Cari No. KK atau Alamat..."
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
                    ? 'bg-green-600/20 text-green-300 border-2 border-green-500/30 hover:bg-green-500/30 hover:shadow-lg'
                    : 'bg-green-50 text-green-700 border-2 border-green-200 hover:bg-green-100 hover:shadow-md'
                }`}
              >
                <FiDownload className="w-4 h-4" />
                <span>Excel</span>
              </button>
              <button
                onClick={handleDownloadPDF}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isDark
                    ? 'bg-red-600/20 text-red-300 border-2 border-red-500/30 hover:bg-red-500/30 hover:shadow-lg'
                    : 'bg-red-50 text-red-700 border-2 border-red-200 hover:bg-red-100 hover:shadow-md'
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-red-700">
            Error: {error}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <ModernTable<KartuKeluarga>
              columns={columns}
              data={data}
              isDark={isDark}
              isLoading={loading}
              currentPage={page}
              totalPages={Math.ceil(total / limit)}
              totalItems={total}
              itemsPerPage={limit}
              onPageChange={(newPage) => setPage(newPage)}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
