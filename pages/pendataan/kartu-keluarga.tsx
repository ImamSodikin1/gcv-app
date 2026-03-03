import React, { useEffect, useState, useCallback } from 'react';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiChevronLeft, FiChevronRight, FiInfo, FiDownload } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { KartuKeluarga, PaginatedResponse } from '@/interface/pendataan';
import MenuPendataan from '@/components/MenuPendataan';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { showAlert } from '@/lib/swal';
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
    nama_kepala_keluarga: '',
    nik_kepala_keluarga: '',
    status_kk: 'aktif' as 'aktif' | 'non-aktif' | 'pindah' | 'hilang',
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

  const handleAddKK = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
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
          editingId ? { id: editingId, ...formData } : formData
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
        nama_kepala_keluarga: '',
        nik_kepala_keluarga: '',
        status_kk: 'aktif',
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
      nama_kepala_keluarga: kk.nama_kepala_keluarga,
      nik_kepala_keluarga: kk.nik_kepala_keluarga || '',
      status_kk: kk.status_kk,
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
        nama_kepala_keluarga: 'Budi Santoso',
        nik_kepala_keluarga: '3201011501850001',
        status_kk: 'aktif',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '2',
        no_kk: '3201012101230002',
        rt: '002',
        rw: '001',
        alamat: 'Jl. Sudirman No. 45',
        nama_kepala_keluarga: 'Siti Nurhaliza',
        nik_kepala_keluarga: '3201012208900002',
        status_kk: 'aktif',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '3',
        no_kk: '3201012101230003',
        rt: '003',
        rw: '002',
        alamat: 'Jl. Gatot Subroto No. 78',
        nama_kepala_keluarga: 'Ahmad Wijaya',
        nik_kepala_keluarga: '3201011203880003',
        status_kk: 'aktif',
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
      'Nama Kepala Keluarga': item.nama_kepala_keluarga,
      'NIK Kepala Keluarga': item.nik_kepala_keluarga,
      'Status KK': item.status_kk.toUpperCase(),
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
      { wch: 30 }, // Alamat
      { wch: 25 }, // Nama Kepala Keluarga
      { wch: 20 }, // NIK Kepala Keluarga
      { wch: 12 }, // Status KK
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
      item.nama_kepala_keluarga || '-',
      item.nik_kepala_keluarga || '-',
      item.status_kk?.toUpperCase() || '-',
    ]);

    // Add table
    autoTable(doc, {
      head: [['No', 'No. KK', 'RT', 'RW', 'Alamat', 'Nama KK', 'NIK KK', 'Status']],
      body: tableData,
      startY: 28,
      styles: { fontSize: 8 },
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
      nama_kepala_keluarga: '',
      nik_kepala_keluarga: '',
      status_kk: 'aktif',
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
      <div className="max-w-6xl mx-auto">
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
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
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
            className={`rounded-lg p-6 shadow-lg mb-6 ${cardBg} border`}
          >
            <h2 className={`text-lg font-semibold mb-4 ${textMain}`}>{editingId ? 'Edit Kartu Keluarga' : 'Tambah Kartu Keluarga Baru'}</h2>
            <form onSubmit={handleAddKK} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="No. KK"
                value={formData.no_kk}
                onChange={(e) => setFormData({ ...formData, no_kk: e.target.value })}
                className={`border rounded px-3 py-2 ${inputBg}`}
                required
                disabled={!!editingId}
              />
              <input
                type="text"
                placeholder="RT"
                value={formData.rt}
                onChange={(e) => setFormData({ ...formData, rt: e.target.value })}
                className={`border rounded px-3 py-2 ${inputBg}`}
                required
              />
              <input
                type="text"
                placeholder="RW"
                value={formData.rw}
                onChange={(e) => setFormData({ ...formData, rw: e.target.value })}
                className={`border rounded px-3 py-2 ${inputBg}`}
                required
              />
              <input
                type="text"
                placeholder="Alamat"
                value={formData.alamat}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                className={`border rounded px-3 py-2 ${inputBg}`}
                required
              />
              <input
                type="text"
                placeholder="Nama Kepala Keluarga"
                value={formData.nama_kepala_keluarga}
                onChange={(e) => setFormData({ ...formData, nama_kepala_keluarga: e.target.value })}
                className={`border rounded px-3 py-2 ${inputBg}`}
                required
              />
              <input
                type="text"
                placeholder="NIK Kepala Keluarga"
                value={formData.nik_kepala_keluarga}
                onChange={(e) => setFormData({ ...formData, nik_kepala_keluarga: e.target.value })}
                className={`border rounded px-3 py-2 ${inputBg}`}
              />
              <select
                value={formData.status_kk}
                onChange={(e) => setFormData({ ...formData, status_kk: e.target.value as any })}
                className={`border rounded px-3 py-2 ${inputBg}`}
              >
                <option value="aktif">Aktif</option>
                <option value="non-aktif">Non-Aktif</option>
                <option value="pindah">Pindah</option>
                <option value="hilang">Hilang</option>
              </select>
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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
                <table className="w-full min-w-[640px]">
                  <thead className={`border-b ${tableBg}`}>
                    <tr>
                      <th className={`px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold ${textMain}`}>No. KK</th>
                      <th className={`px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold ${textMain}`}>RT/RW</th>
                      <th className={`px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold ${textMain}`}>Alamat</th>
                      <th className={`px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold ${textMain}`}>Kepala Keluarga</th>
                      <th className={`px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold ${textMain}`}>Status</th>
                      <th className={`px-3 sm:px-6 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold ${textMain}`}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.map((kk) => (
                      <tr key={kk.id} className={`transition ${tableHoverBg}`}>
                        <td className={`px-3 sm:px-6 py-3 sm:py-4 font-mono text-xs sm:text-sm ${textMain}`}>{kk.no_kk}</td>
                        <td className={`px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm ${textMain}`}>
                          RT {kk.rt} / RW {kk.rw}
                        </td>
                        <td className={`px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm ${textSub}`}>{kk.alamat}</td>
                        <td className={`px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm ${textMain}`}>{kk.nama_kepala_keluarga}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                            kk.status_kk === 'aktif'
                              ? isDark ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-800'
                              : isDark ? 'bg-gray-500/20 text-gray-300' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {kk.status_kk}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                          {isAdmin ? (
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => handleEditKK(kk)}
                                className={`transition p-2 rounded ${
                                  isDark ? 'text-blue-400 hover:bg-blue-500/20' : 'text-blue-600 hover:bg-blue-50'
                                }`}
                                title="Edit"
                              >
                                <FiEdit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteKK(kk.id)}
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
