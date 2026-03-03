import React, { useEffect, useState } from 'react';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { KartuKeluarga, PaginatedResponse } from '@/interface/pendataan';

export default function KartuKeluargaPage() {
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
    status_kk: 'aktif' as const,
  });

  useEffect(() => {
    fetchData();
  }, [page, search]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });

      const response = await fetch(`/api/pendataan/kartu-keluarga?${params}`);
      const result: PaginatedResponse<KartuKeluarga> = await response.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      setData(result.data);
      setTotal(result.total);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddKK = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId 
        ? `/api/pendataan/kartu-keluarga`
        : `/api/pendataan/kartu-keluarga`;
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
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

      alert(editingId ? 'Kartu Keluarga berhasil diperbarui!' : 'Kartu Keluarga berhasil ditambahkan!');
    } catch (err: any) {
      alert(`Error: ${err.message}`);
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
    if (confirm('Apakah Anda yakin ingin menghapus Kartu Keluarga ini?')) {
      try {
        const response = await fetch(`/api/pendataan/kartu-keluarga?id=${id}`, {
          method: 'DELETE',
        });

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.message);
        }

        fetchData();
        alert('Kartu Keluarga berhasil dihapus!');
      } catch (err: any) {
        alert(`Error: ${err.message}`);
      }
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link href="/pendataan">
                <a className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                  ← Kembali ke Dashboard
                </a>
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Kelola Kartu Keluarga</h1>
          </div>
          <button
            onClick={() => {
              handleCancelEdit();
              setShowAddForm(!showAddForm);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <FiPlus /> {editingId ? 'Edit KK' : 'Tambah KK'}
          </button>
        </motion.div>

        {/* Add Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg p-6 shadow-lg mb-6"
          >
            <h2 className="text-lg font-semibold mb-4">{editingId ? 'Edit Kartu Keluarga' : 'Tambah Kartu Keluarga Baru'}</h2>
            <form onSubmit={handleAddKK} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="No. KK"
                value={formData.no_kk}
                onChange={(e) => setFormData({ ...formData, no_kk: e.target.value })}
                className="border rounded px-3 py-2"
                required
                disabled={!!editingId}
              />
              <input
                type="text"
                placeholder="RT"
                value={formData.rt}
                onChange={(e) => setFormData({ ...formData, rt: e.target.value })}
                className="border rounded px-3 py-2"
                required
              />
              <input
                type="text"
                placeholder="RW"
                value={formData.rw}
                onChange={(e) => setFormData({ ...formData, rw: e.target.value })}
                className="border rounded px-3 py-2"
                required
              />
              <input
                type="text"
                placeholder="Alamat"
                value={formData.alamat}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                className="border rounded px-3 py-2"
                required
              />
              <input
                type="text"
                placeholder="Nama Kepala Keluarga"
                value={formData.nama_kepala_keluarga}
                onChange={(e) => setFormData({ ...formData, nama_kepala_keluarga: e.target.value })}
                className="border rounded px-3 py-2"
                required
              />
              <input
                type="text"
                placeholder="NIK Kepala Keluarga"
                value={formData.nik_kepala_keluarga}
                onChange={(e) => setFormData({ ...formData, nik_kepala_keluarga: e.target.value })}
                className="border rounded px-3 py-2"
              />
              <select
                value={formData.status_kk}
                onChange={(e) => setFormData({ ...formData, status_kk: e.target.value as any })}
                className="border rounded px-3 py-2"
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

        {/* Search */}
        <div className="bg-white rounded-lg p-4 shadow mb-6">
          <div className="flex items-center gap-2">
            <FiSearch className="text-gray-400" />
            <input
              type="text"
              placeholder="Cari No. KK atau Alamat..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="flex-1 outline-none"
            />
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
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">No. KK</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">RT/RW</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Alamat</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Kepala Keluarga</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Aksi</th>
                    </tr>
                  </thead>
                  <tbody divide-y>
                    {data.map((kk) => (
                      <tr key={kk.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-mono text-sm">{kk.no_kk}</td>
                        <td className="px-6 py-4 text-sm">
                          RT {kk.rt} / RW {kk.rw}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{kk.alamat}</td>
                        <td className="px-6 py-4 text-sm">{kk.nama_kepala_keluarga}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                            kk.status_kk === 'aktif'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {kk.status_kk}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleEditKK(kk)}
                              className="text-blue-600 hover:text-blue-800 transition"
                              title="Edit"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              onClick={() => handleDeleteKK(kk.id)}
                              className="text-red-600 hover:text-red-800 transition"
                              title="Hapus"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-600">
                Menampilkan {(page - 1) * limit + 1} - {Math.min(page * limit, total)} dari {total} data
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1 px-3 py-2 border rounded disabled:opacity-50"
                >
                  <FiChevronLeft /> Sebelumnya
                </button>
                <div className="px-4 py-2 border rounded bg-gray-50">
                  Halaman {page} dari {totalPages}
                </div>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-1 px-3 py-2 border rounded disabled:opacity-50"
                >
                  Berikutnya <FiChevronRight />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
