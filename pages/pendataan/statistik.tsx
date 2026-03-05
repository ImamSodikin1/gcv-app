'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { showAlert } from '@/lib/swal';
import MenuPendataan from '@/components/MenuPendataan';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { FiUsers, FiHome, FiCreditCard, FiBarChart2, FiLoader } from 'react-icons/fi';

interface StatistikData {
  kelompokUsia: Array<{ kelompok: string; jumlah: number }>;
  distribusiPekerjaan: Array<{ pekerjaan: string; jumlah: number }>;
  distribusiGender: Array<{ gender: string; jumlah: number }>;
  statusKK: {
    kkJayaSampurna: number;
    kkLuarDesa: number;
    ktpJayaSampurna: number;
    ktpLuarDesa: number;
    belumKTP: number;
  };
  ringkasan: {
    totalPenduduk: number;
    totalKK: number;
  };
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function StatistikPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const swal = showAlert(theme);

  const [data, setData] = useState<StatistikData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistik = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch('/api/pendataan/statistik', {
        headers: {
          'x-user-id': user.id,
        },
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Gagal mengambil data statistik');
      }

      setData(result.data);
      setError(null);
    } catch (err: unknown) {
      console.error('Error fetching statistik:', err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      swal.error('Gagal Memuat', err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  }, [user, swal]);

  useEffect(() => {
    fetchStatistik();
  }, [fetchStatistik]);

  const bgGradient = isDark
    ? 'bg-gradient-to-br from-[#0f0f1a] via-[#1a0f2e] to-[#2d1e3a]'
    : 'bg-gradient-to-br from-slate-50 to-slate-100';

  const cardBg = isDark
    ? 'bg-gradient-to-br from-[#181926]/80 via-[#231b2e]/80 to-[#2d1e3a]/80 border-white/10'
    : 'bg-white border-gray-200';

  const textMain = isDark ? 'text-white' : 'text-gray-900';
  const textSub = isDark ? 'text-gray-400' : 'text-gray-600';

  const StatCard = ({
    icon: Icon,
    title,
    value,
    subtitle,
    color,
  }: {
    icon: React.ComponentType<{ size: number }>;
    title: string;
    value: number;
    subtitle?: string;
    color: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg p-6 shadow-lg ${cardBg} border`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm font-medium ${textSub}`}>{title}</p>
          <p className={`text-3xl font-bold mt-2 ${textMain}`}>{value.toLocaleString('id-ID')}</p>
          {subtitle && <p className={`text-xs mt-2 ${textSub}`}>{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} />
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className={`min-h-screen ${bgGradient}`}>
        <div className="pt-20 md:pt-6 px-4 md:px-8 pb-8">
          <MenuPendataan />
          <div className="flex justify-center items-center h-96">
            <div className="flex flex-col items-center gap-3">
              <FiLoader className="w-8 h-8 animate-spin text-blue-500" />
              <p className={textSub}>Memuat data statistik...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${bgGradient}`}>
        <div className="pt-20 md:pt-6 px-4 md:px-8 pb-8">
          <MenuPendataan />
          <div className={`rounded-lg p-6 border-2 ${isDark ? 'bg-red-500/10 border-red-400/30' : 'bg-red-50 border-red-200'}`}>
            <p className={isDark ? 'text-red-300' : 'text-red-700'}>Gagal memuat data: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`min-h-screen ${bgGradient}`}>
        <div className="pt-20 md:pt-6 px-4 md:px-8 pb-8">
          <MenuPendataan />
          <div className={`rounded-lg p-6 border-2 ${isDark ? 'bg-yellow-500/10 border-yellow-400/30' : 'bg-yellow-50 border-yellow-200'}`}>
            <p className={isDark ? 'text-yellow-300' : 'text-yellow-700'}>Tidak ada data untuk ditampilkan</p>
          </div>
        </div>
      </div>
    );
  }

  const topPekerjaan = data.distribusiPekerjaan.slice(0, 5);
  const chartColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#6366f1'];

  return (
    <div className={`min-h-screen ${bgGradient}`}>
      <div className="pt-20 md:pt-6 px-4 md:px-8 pb-8">
        {/* Menu */}
        <MenuPendataan />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className={`text-3xl font-bold ${textMain} mb-2`}>
            <FiBarChart2 className="inline mr-2" />
            Statistik Pendataan
          </h1>
          <p className={textSub}>Dashboard analisis data penduduk dan keluarga</p>
        </motion.div>

        {/* Ringkasan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={FiUsers}
            title="Total Penduduk"
            value={data.ringkasan.totalPenduduk}
            color={isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-600'}
          />
          <StatCard
            icon={FiHome}
            title="Total Kartu Keluarga"
            value={data.ringkasan.totalKK}
            color={isDark ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-600'}
          />
          <StatCard
            icon={FiCreditCard}
            title="KTP Jaya Sampurna"
            value={data.statusKK.ktpJayaSampurna}
            color={isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-600'}
          />
          <StatCard
            icon={FiCreditCard}
            title="KTP Luar Desa"
            value={data.statusKK.ktpLuarDesa}
            color={isDark ? 'bg-orange-500/20 text-orange-300' : 'bg-orange-100 text-orange-600'}
          />
        </div>

        {/* Status KK & KTP Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* KK Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-lg p-6 shadow-lg ${cardBg} border`}
          >
            <h2 className={`text-lg font-semibold ${textMain} mb-4`}>Status Kartu Keluarga</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-500/10 rounded-lg">
                <span className={`font-medium ${textMain}`}>KK Jaya Sampurna</span>
                <span className="text-xl font-bold text-blue-400">{data.statusKK.kkJayaSampurna}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-500/10 rounded-lg">
                <span className={`font-medium ${textMain}`}>KK Luar Desa (Unique)</span>
                <span className="text-xl font-bold text-orange-400">{data.statusKK.kkLuarDesa}</span>
              </div>
            </div>
          </motion.div>

          {/* KTP Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-lg p-6 shadow-lg ${cardBg} border`}
          >
            <h2 className={`text-lg font-semibold ${textMain} mb-4`}>Status KTP</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-emerald-500/10 rounded-lg">
                <span className={`font-medium ${textMain}`}>KTP Jaya Sampurna</span>
                <span className="text-xl font-bold text-emerald-400">{data.statusKK.ktpJayaSampurna}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-500/10 rounded-lg">
                <span className={`font-medium ${textMain}`}>KTP Luar Desa</span>
                <span className="text-xl font-bold text-orange-400">{data.statusKK.ktpLuarDesa}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-500/10 rounded-lg">
                <span className={`font-medium ${textMain}`}>Belum KTP</span>
                <span className="text-xl font-bold text-red-400">{data.statusKK.belumKTP}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gender Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-lg p-6 shadow-lg ${cardBg} border`}
          >
            <h2 className={`text-lg font-semibold ${textMain} mb-4`}>Distribusi Gender</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.distribusiGender}
                  dataKey="jumlah"
                  nameKey="gender"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {data.distribusiGender.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#1a1a2e' : '#fff',
                    border: isDark ? '1px solid #444' : '1px solid #ddd',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: isDark ? '#fff' : '#000' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Kelompok Usia Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-lg p-6 shadow-lg ${cardBg} border`}
          >
            <h2 className={`text-lg font-semibold ${textMain} mb-4`}>Kelompok Usia</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.kelompokUsia}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#333' : '#e5e7eb'} />
                <XAxis
                  dataKey="kelompok"
                  tick={{ fill: isDark ? '#999' : '#666', fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fill: isDark ? '#999' : '#666' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#1a1a2e' : '#fff',
                    border: isDark ? '1px solid #444' : '1px solid #ddd',
                  }}
                  cursor={{ fill: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="jumlah" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Pekerjaan Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-lg p-6 shadow-lg ${cardBg} border mb-8`}
        >
          <h2 className={`text-lg font-semibold ${textMain} mb-4`}>Top 5 Distribusi Pekerjaan</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={topPekerjaan}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 200, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#333' : '#e5e7eb'} />
              <XAxis type="number" tick={{ fill: isDark ? '#999' : '#666' }} />
              <YAxis dataKey="pekerjaan" type="category" tick={{ fill: isDark ? '#999' : '#666', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#1a1a2e' : '#fff',
                  border: isDark ? '1px solid #444' : '1px solid #ddd',
                }}
              />
              <Bar dataKey="jumlah" fill="#10b981" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Detailed Pekerjaan Table */}
        {data.distribusiPekerjaan.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-lg p-6 shadow-lg ${cardBg} border`}
          >
            <h2 className={`text-lg font-semibold ${textMain} mb-4`}>Detail Semua Pekerjaan</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={isDark ? 'border-b border-white/10' : 'border-b border-gray-200'}>
                    <th className={`text-left py-3 px-4 font-semibold ${textMain}`}>No</th>
                    <th className={`text-left py-3 px-4 font-semibold ${textMain}`}>Jenis Pekerjaan</th>
                    <th className={`text-center py-3 px-4 font-semibold ${textMain}`}>Jumlah Orang</th>
                    <th className={`text-center py-3 px-4 font-semibold ${textMain}`}>Persentase</th>
                  </tr>
                </thead>
                <tbody>
                  {data.distribusiPekerjaan.map((item, index) => {
                    const percentage =
                      ((item.jumlah / data.ringkasan.totalPenduduk) * 100).toFixed(1) + '%';
                    return (
                      <tr
                        key={index}
                        className={
                          isDark
                            ? 'border-b border-white/5 hover:bg-white/5'
                            : 'border-b border-gray-100 hover:bg-gray-50'
                        }
                      >
                        <td className={`py-3 px-4 ${textMain}`}>{index + 1}</td>
                        <td className={`py-3 px-4 ${textMain}`}>{item.pekerjaan}</td>
                        <td className={`py-3 px-4 text-center font-semibold ${textMain}`}>
                          {item.jumlah}
                        </td>
                        <td className={`py-3 px-4 text-center ${textSub}`}>{percentage}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
