'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { showAlert } from '@/lib/swal';
import MenuPendataan from '@/components/MenuPendataan';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiInfo } from 'react-icons/fi';
import { Pekerjaan, PaginatedResponse } from '@/interface/pendataan';

export default function PekerjaanPage() {
  const { user, isAdmin } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const swal = showAlert(theme);

  const [data, setData] = useState<Pekerjaan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(100);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nama_pekerjaan: '',
    keterangan: '',
    is_active: true,
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

      const response = await fetch(`/api/pendataan/pekerjaan?${params}`, {
        headers: {
          'x-user-id': user.id,
        },
      });
      const result: PaginatedResponse<Pekerjaan> = await response.json();

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

  const handleAddPekerjaan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const url = editingId ? `/api/pendataan/pekerjaan` : `/api/pendataan/pekerjaan`;
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify(editingId ? { id: editingId, ...formData } : formData),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message);
      }

      setFormData({ nama_pekerjaan: '', keterangan: '', is_active: true });
      setEditingId(null);
      setShowAddForm(false);
      fetchData();

      swal.success(
        editingId ? 'Berhasil Diperbarui!' : 'Berhasil Ditambahkan!',
        editingId ? 'Data pekerjaan berhasil diperbarui' : 'Data pekerjaan berhasil ditambahkan'
      );
    } catch (err: unknown) {
      swal.error('Gagal Menyimpan', err instanceof Error ? err.message : 'Terjadi kesalahan');
    }
  };

  const handleEditPekerjaan = (pekerjaan: Pekerjaan) => {
    setFormData({
      nama_pekerjaan: pekerjaan.nama_pekerjaan,
      keterangan: pekerjaan.keterangan || '',
      is_active: pekerjaan.is_active,
    });
    setEditingId(pekerjaan.id);
    setShowAddForm(true);
  };

  const handleDeletePekerjaan = async (id: string) => {
    if (!user) return;
    const confirmed = await swal.confirm(
      'Hapus Pekerjaan?',
      'Data pekerjaan yang dihapus tidak dapat dikembalikan'
    );

    if (confirmed) {
      try {
        const response = await fetch(`/api/pendataan/pekerjaan?id=${id}`, {
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
        swal.success('Berhasil Dihapus!', 'Data pekerjaan berhasil dihapus');
      } catch (err: unknown) {
        swal.error('Gagal Menghapus', err instanceof Error ? err.message : 'Terjadi kesalahan');
      }
    }
  };

  const handleCancelEdit = () => {
    setFormData({ nama_pekerjaan: '', keterangan: '', is_active: true });
    setEditingId(null);
    setShowAddForm(false);
  };

  const textMain = isDark ? 'text-white' : 'text-gray-900';
  const textSub = isDark ? 'text-gray-400' : 'text-gray-600';
  const cardBg = isDark
    ? 'bg-gradient-to-br from-[#181926]/80 via-[#231b2e]/80 to-[#2d1e3a]/80 border-white/10'
    : 'bg-white border-gray-200';
  const inputBg = isDark
    ? 'bg-[#181926] border-white/10 text-white placeholder-gray-500'
    : 'bg-white border-gray-300 text-gray-900';

  return (
    <div
      className={`min-h-screen ${
        isDark
          ? 'bg-gradient-to-br from-[#0f0f1a] via-[#1a0f2e] to-[#2d1e3a]'
          : 'bg-gradient-to-br from-slate-50 to-slate-100'
      }`}
    >
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
              <h3 className={`font-semibold ${isDark ? 'text-blue-300' : 'text-blue-900'}`}>
                Akses Terbatas
              </h3>
              <p className={`text-sm mt-1 ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                Hanya admin yang dapat mengelola master data pekerjaan. Anda dapat melihat daftar pekerjaan yang tersedia.
              </p>
            </div>
          </motion.div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6"
        >
          <div>
            <h1 className={`text-2xl sm:text-3xl font-bold ${textMain}`}>Master Pekerjaan</h1>
            <p className={`text-sm sm:text-base ${textSub} mt-1`}>Kelola daftar jenis pekerjaan</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition w-full sm:w-auto justify-center"
            >
              <FiPlus /> Tambah Pekerjaan
            </button>
          )}
        </motion.div>

        {/* Add Form */}
        {isAdmin && showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-lg p-6 shadow-lg mb-6 ${cardBg} border-2`}
          >
            <h2 className={`text-lg font-semibold ${textMain} mb-4`}>
              {editingId ? 'Edit Pekerjaan' : 'Tambah Pekerjaan Baru'}
            </h2>
            <form onSubmit={handleAddPekerjaan} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${textMain} mb-2`}>
                  Nama Pekerjaan *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Dokter, Guru, Karyawan Swasta"
                  value={formData.nama_pekerjaan}
                  onChange={(e) =>
                    setFormData({ ...formData, nama_pekerjaan: e.target.value })
                  }
                  className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${textMain} mb-2`}>
                  Keterangan
                </label>
                <textarea
                  placeholder="Deskripsi pekerjaan (opsional)"
                  value={formData.keterangan}
                  onChange={(e) =>
                    setFormData({ ...formData, keterangan: e.target.value })
                  }
                  rows={3}
                  className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none`}
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                />
                <label htmlFor="is_active" className={`text-sm font-medium ${textMain} cursor-pointer`}>
                  Aktif
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition font-medium"
                >
                  {editingId ? 'Update' : 'Tambah'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className={`flex-1 px-4 py-2 rounded-lg transition font-medium ${
                    isDark
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                >
                  Batal
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Search Box */}
        <div className={`rounded-lg p-4 shadow mb-6 ${cardBg} border`}>
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cari pekerjaan..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${inputBg} focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-red-700">
            Error: {error}
          </div>
        ) : data.length === 0 ? (
          <div className={`rounded-lg p-8 text-center ${cardBg} border`}>
            <p className={textSub}>Tidak ada data pekerjaan</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className={`rounded-lg p-4 sm:p-6 shadow-lg mb-4 sm:mb-4 ${cardBg} border`}
          >
            <h2 className={`text-lg sm:text-xl font-semibold ${textMain} mb-4`}>Daftar Pekerjaan</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {data.map((pekerjaan, index) => {
                const colors = [
                  { bg: isDark ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-400/30' : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200', text: isDark ? 'text-blue-300' : 'text-blue-700' },
                  { bg: isDark ? 'bg-gradient-to-br from-red-500/20 to-red-600/20 border-red-400/30' : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200', text: isDark ? 'text-red-300' : 'text-red-700' },
                  { bg: isDark ? 'bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-400/30' : 'bg-gradient-to-br from-green-50 to-green-100 border-green-200', text: isDark ? 'text-green-300' : 'text-green-700' },
                  { bg: isDark ? 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border-yellow-400/30' : 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200', text: isDark ? 'text-yellow-300' : 'text-yellow-700' },
                  { bg: isDark ? 'bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-400/30' : 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200', text: isDark ? 'text-purple-300' : 'text-purple-700' },
                  { bg: isDark ? 'bg-gradient-to-br from-pink-500/20 to-pink-600/20 border-pink-400/30' : 'bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200', text: isDark ? 'text-pink-300' : 'text-pink-700' },
                  { bg: isDark ? 'bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 border-indigo-400/30' : 'bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200', text: isDark ? 'text-indigo-300' : 'text-indigo-700' },
                  { bg: isDark ? 'bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border-cyan-400/30' : 'bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200', text: isDark ? 'text-cyan-300' : 'text-cyan-700' },
                ];
                const color = colors[index % colors.length];
                return (
                  <motion.div
                    key={pekerjaan.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transaction={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => isAdmin && handleEditPekerjaan(pekerjaan)}
                    className={`rounded-lg p-4 border cursor-pointer transition ${color.bg} ${isAdmin ? 'hover:shadow-lg' : ''}`}
                  >
                    <p className={`text-xs font-semibold uppercase ${color.text}`}>{pekerjaan.nama_pekerjaan}</p>
                    {pekerjaan.keterangan && (
                      <p className={`text-xs mt-2 line-clamp-2 ${textSub}`}>{pekerjaan.keterangan}</p>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded ${
                          pekerjaan.is_active
                            ? isDark
                              ? 'bg-green-500/20 text-green-300'
                              : 'bg-green-100 text-green-800'
                            : isDark
                            ? 'bg-red-500/20 text-red-300'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {pekerjaan.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                      {isAdmin && (
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditPekerjaan(pekerjaan);
                            }}
                            className={`transition p-1 rounded ${
                              isDark ? 'text-blue-400 hover:bg-blue-500/20' : 'text-blue-600 hover:bg-blue-50'
                            }`}
                            title="Edit"
                          >
                            <FiEdit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePekerjaan(pekerjaan.id);
                            }}
                            className={`transition p-1 rounded ${
                              isDark ? 'text-red-400 hover:bg-red-500/20' : 'text-red-600 hover:bg-red-50'
                            }`}
                            title="Hapus"
                          >
                            <FiTrash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
