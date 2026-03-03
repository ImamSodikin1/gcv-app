import React, { useEffect, useState } from 'react';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Penduduk, PaginatedResponse, KartuKeluarga } from '@/interface/pendataan';

export default function PendudukPage() {
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
    jenis_kelamin: 'Laki-laki' as const,
    tanggal_lahir: '',
    tempat_lahir: '',
    status_perkawinan: 'Belum Kawin' as const,
    agama: 'Islam' as const,
    hubungan_keluarga: 'Anak' as const,
    status_ktp: 'KTP Jaya Sampurna' as const,
    no_ktp: '',
    pekerjaan: '',
    status_pekerjaan: 'Bekerja' as const,
    status_kk: 'Anggota KK Jaya Sampurna' as const,
    pendidikan_terakhir: 'SMA' as const,
  });

  useEffect(() => {
    fetchData();
    fetchKKList();
  }, [page, search]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });

      const response = await fetch(`/api/pendataan/penduduk?${params}`);
      const result: PaginatedResponse<Penduduk> = await response.json();

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

  const fetchKKList = async () => {
    try {
      const response = await fetch('/api/pendataan/kartu-keluarga?limit=100');
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
    try {
      if (formData.status_ktp !== 'Belum KTP' && !formData.no_ktp) {
        alert('Nomor KTP harus diisi jika status KTP bukan "Belum KTP"');
        return;
      }

      const url = editingId
        ? `/api/pendataan/penduduk`
        : `/api/pendataan/penduduk`;
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

      alert(editingId ? 'Data Penduduk berhasil diperbarui!' : 'Data Penduduk berhasil ditambahkan!');
    } catch (err: any) {
      alert(`Error: ${err.message}`);
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
    if (confirm('Apakah Anda yakin ingin menghapus data Penduduk ini?')) {
      try {
        const response = await fetch(`/api/pendataan/penduduk?id=${id}`, {
          method: 'DELETE',
        });

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.message);
        }

        fetchData();
        alert('Data Penduduk berhasil dihapus!');
      } catch (err: any) {
        alert(`Error: ${err.message}`);
      }
    }
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

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
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
            <h1 className="text-3xl font-bold text-gray-900">Kelola Data Penduduk</h1>
          </div>
          <button
            onClick={() => {
              handleCancelEdit();
              setShowAddForm(!showAddForm);
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <FiPlus /> {editingId ? 'Edit Penduduk' : 'Tambah Penduduk'}
          </button>
        </motion.div>

        {/* Add Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg p-6 shadow-lg mb-6"
          >
            <h2 className="text-lg font-semibold mb-4">{editingId ? 'Edit Data Penduduk' : 'Tambah Data Penduduk Baru'}</h2>
            <form onSubmit={handleAddPenduduk} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={formData.kartu_keluarga_id}
                onChange={(e) => setFormData({ ...formData, kartu_keluarga_id: e.target.value })}
                className="border rounded px-3 py-2"
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
                className="border rounded px-3 py-2"
                required
                disabled={!!editingId}
              />

              <input
                type="text"
                placeholder="Nama Lengkap"
                value={formData.nama_lengkap}
                onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                className="border rounded px-3 py-2 md:col-span-2"
                required
              />

              <select
                value={formData.jenis_kelamin}
                onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value as any })}
                className="border rounded px-3 py-2"
              >
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>

              <input
                type="date"
                value={formData.tanggal_lahir}
                onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })}
                className="border rounded px-3 py-2"
                required
              />

              <input
                type="text"
                placeholder="Tempat Lahir"
                value={formData.tempat_lahir}
                onChange={(e) => setFormData({ ...formData, tempat_lahir: e.target.value })}
                className="border rounded px-3 py-2"
              />

              <select
                value={formData.status_perkawinan}
                onChange={(e) => setFormData({ ...formData, status_perkawinan: e.target.value as any })}
                className="border rounded px-3 py-2"
              >
                <option value="Belum Kawin">Belum Kawin</option>
                <option value="Kawin">Kawin</option>
                <option value="Cerai Hidup">Cerai Hidup</option>
                <option value="Cerai Mati">Cerai Mati</option>
              </select>

              <select
                value={formData.agama}
                onChange={(e) => setFormData({ ...formData, agama: e.target.value as any })}
                className="border rounded px-3 py-2"
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
                onChange={(e) => setFormData({ ...formData, hubungan_keluarga: e.target.value as any })}
                className="border rounded px-3 py-2"
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
                onChange={(e) => setFormData({ ...formData, status_ktp: e.target.value as any })}
                className="border rounded px-3 py-2"
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
                  className="border rounded px-3 py-2"
                  required={formData.status_ktp !== 'Belum KTP'}
                />
              )}

              <input
                type="text"
                placeholder="Pekerjaan"
                value={formData.pekerjaan}
                onChange={(e) => setFormData({ ...formData, pekerjaan: e.target.value })}
                className="border rounded px-3 py-2"
              />

              <select
                value={formData.status_pekerjaan}
                onChange={(e) => setFormData({ ...formData, status_pekerjaan: e.target.value as any })}
                className="border rounded px-3 py-2"
              >
                <option value="Bekerja">Bekerja</option>
                <option value="Tidak Bekerja">Tidak Bekerja</option>
                <option value="Sekolah">Sekolah</option>
                <option value="Mengurus Rumah Tangga">Mengurus Rumah Tangga</option>
              </select>

              <select
                value={formData.status_kk}
                onChange={(e) => setFormData({ ...formData, status_kk: e.target.value as any })}
                className="border rounded px-3 py-2"
              >
                <option value="Anggota KK Jaya Sampurna">Anggota KK Jaya Sampurna</option>
                <option value="Anggota KK Luar Desa">Anggota KK Luar Desa</option>
                <option value="KTP Luar per KK">KTP Luar per KK</option>
              </select>

              <select
                value={formData.pendidikan_terakhir}
                onChange={(e) => setFormData({ ...formData, pendidikan_terakhir: e.target.value as any })}
                className="border rounded px-3 py-2"
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

        {/* Search */}
        <div className="bg-white rounded-lg p-4 shadow mb-6">
          <div className="flex items-center gap-2">
            <FiSearch className="text-gray-400" />
            <input
              type="text"
              placeholder="Cari Nama atau NIK..."
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
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">NIK</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Nama</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Gender/Usia</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Status KTP</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Pekerjaan</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Hubungan</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700">Aksi</th>
                    </tr>
                  </thead>
                  <tbody divide-y>
                    {data.map((penduduk) => (
                      <tr key={penduduk.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 font-mono">{penduduk.nik}</td>
                        <td className="px-4 py-3">{penduduk.nama_lengkap}</td>
                        <td className="px-4 py-3 text-xs">
                          <div>{penduduk.jenis_kelamin === 'Laki-laki' ? '👨' : '👩'} {penduduk.jenis_kelamin}</div>
                          <div className="text-gray-500">{penduduk.usia_tahun} tahun</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                            penduduk.status_ktp === 'KTP Jaya Sampurna'
                              ? 'bg-blue-100 text-blue-800'
                              : penduduk.status_ktp === 'KTP Luar Desa'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {penduduk.status_ktp}
                          </span>
                        </td>
                        <td className="px-4 py-3">{penduduk.pekerjaan || '-'}</td>
                        <td className="px-4 py-3 text-xs">{penduduk.hubungan_keluarga}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleEditPenduduk(penduduk)}
                              className="text-blue-600 hover:text-blue-800 transition"
                              title="Edit"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              onClick={() => handleDeletePenduduk(penduduk.id)}
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
