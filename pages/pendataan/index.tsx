import React, { useEffect, useState } from 'react';
import { FiUsers, FiHome, FiBarChart2, FiTrendingUp, FiInfo } from 'react-icons/fi';
import { FaCalculator, FaChild, FaUser } from 'react-icons/fa';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { SummaryStatistik, DistribusiUsia } from '@/interface/pendataan';
import MenuPendataan from '@/components/MenuPendataan';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

interface DistribusiPendidikan {
  pendidikan: string;
  jumlah: number;
}

interface DistribusiPekerjaan {
  pekerjaan: string;
  jumlah: number;
}

interface DashboardData {
  statistik: SummaryStatistik;
  usia: DistribusiUsia[];
  pendidikan: DistribusiPendidikan[];
  pekerjaan?: DistribusiPekerjaan[];
}

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316'];

export default function PendataanDashboard() {
  const { user, isAdmin } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [pekerjaanData, setPekerjaanData] = useState<DistribusiPekerjaan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    const readJsonSafely = async <T,>(response: Response, label: string): Promise<T> => {
      const contentType = response.headers.get('content-type') || '';
      const text = await response.text();

      const looksLikeJson = contentType.includes('application/json') ||
        text.trim().startsWith('{') ||
        text.trim().startsWith('[');

      if (!looksLikeJson) {
        // Biasanya ini HTML: 404/500/redirect page (<!DOCTYPE html> ...)
        const snippet = text.trim().slice(0, 80).replace(/\s+/g, ' ');
        throw new Error(
          `${label} mengembalikan non-JSON (HTTP ${response.status}). ` +
          `Kemungkinan endpoint error/404/redirect. Snippet: ${snippet}`
        );
      }

      try {
        return JSON.parse(text) as T;
      } catch {
        throw new Error(`${label} mengembalikan JSON tidak valid (HTTP ${response.status}).`);
      }
    };

    try {
      setLoading(true);
      const [dashboardResponse, statistikResponse] = await Promise.all([
        fetch('/api/pendataan/dashboard', {
          headers: {
            'x-user-id': user.id,
          },
        }),
        fetch('/api/pendataan/statistik', {
          headers: {
            'x-user-id': user.id,
          },
        }),
      ]);

      const dashboardResult = await readJsonSafely<any>(dashboardResponse, 'API /api/pendataan/dashboard');
      const statistikResult = await readJsonSafely<any>(statistikResponse, 'API /api/pendataan/statistik');

      if (!dashboardResult.success) {
        throw new Error(dashboardResult.message);
      }

      setDashboardData(dashboardResult.data);
      if (statistikResult.success && statistikResult.data?.distribusiPekerjaan) {
        setPekerjaanData(statistikResult.data.distribusiPekerjaan);
      }
      setError(null);
    } catch (err: unknown) {
      console.error('Error fetching dashboard:', err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDark ? 'bg-gradient-to-br from-[#0f0f1a] via-[#1a0f2e] to-[#2d1e3a]' : 'bg-gray-50'
        }`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p>Error loading dashboard: {error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const { statistik, usia, pendidikan } = dashboardData;
  
  const gridLineColor = isDark ? '#ffffff15' : '#e0e7ff';
  const tooltipBg = isDark ? '#1e1b2e' : '#ffffff';
  const tooltipBorder = isDark ? '#ffffff20' : '#cccccc';

  // Stat cards
  const statCards = [
    { label: 'Total Penduduk', value: statistik.total_penduduk, icon: FiUsers, color: 'blue' },
    { label: 'Total KK', value: statistik.total_kk, icon: FiHome, color: 'green' },
    { label: 'Laki-laki', value: statistik.total_laki_laki, icon: FiUsers, color: 'blue' },
    { label: 'Perempuan', value: statistik.total_perempuan, icon: FiUsers, color: 'purple' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const textMain = isDark ? 'text-white' : 'text-gray-900';
  const textSub = isDark ? 'text-gray-400' : 'text-gray-600';
  const cardBg = isDark ? 'bg-gradient-to-br from-[#181926]/80 via-[#231b2e]/80 to-[#2d1e3a]/80 border-white/10' : 'bg-white border-gray-200';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-[#0f0f1a] via-[#1a0f2e] to-[#2d1e3a]' : 'bg-gradient-to-br from-slate-50 to-slate-100'
      }`}>
      <div className={`pt-20 md:pt-6 px-4 md:px-8 pb-8 scrollbar-modern overflow-y-auto`}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-4"
        >
          <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold ${textMain}`}>Dashboard Pendataan Warga</h1>
          <p className={`text-sm sm:text-base ${textSub}`}>Sistem Manajemen Data Penduduk RT/RW</p>
        </motion.div>

        {/* Menu Navigasi */}
        <MenuPendataan />

        {/* Info Banner untuk User Biasa */}
        {!isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-lg p-4 mb-6 flex items-start gap-3 ${isDark ? 'bg-blue-500/10 border border-blue-400/30' : 'bg-blue-50 border border-blue-200'
              }`}
          >
            <FiInfo className="text-blue-500 mt-0.5 flex-shrink-0" size={20} />
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-blue-300' : 'text-blue-900'}`}>Dashboard Data Anda</h3>
              <p className={`text-sm mt-1 ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                Dashboard ini menampilkan statistik dari data yang Anda daftarkan. Admin dapat melihat statistik lengkap dari semua warga.
              </p>
            </div>
          </motion.div>
        )}

        {/* Stat Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-4 mb-4"
        >
          {statCards.map((card) => {
            const Icon = card.icon;
            const gradientClasses = {
              blue: isDark
                ? 'from-blue-500/20 to-indigo-500/20 border-blue-400/30'
                : 'from-blue-50 to-indigo-50 border-blue-200',
              green: isDark
                ? 'from-green-500/20 to-emerald-500/20 border-green-400/30'
                : 'from-green-50 to-emerald-50 border-green-200',
              purple: isDark
                ? 'from-purple-500/20 to-pink-500/20 border-purple-400/30'
                : 'from-purple-50 to-pink-50 border-purple-200',
              orange: isDark
                ? 'from-orange-500/20 to-red-500/20 border-orange-400/30'
                : 'from-orange-50 to-red-50 border-orange-200',
            };

            const iconColorClasses = {
              blue: 'text-blue-500',
              green: 'text-green-500',
              purple: 'text-purple-500',
              orange: 'text-orange-500',
            };

            const textColorClasses = {
              blue: isDark ? 'text-blue-300' : 'text-blue-700',
              green: isDark ? 'text-green-300' : 'text-green-700',
              purple: isDark ? 'text-purple-300' : 'text-purple-700',
              orange: isDark ? 'text-orange-300' : 'text-orange-700',
            };

            return (
              <motion.div
                key={card.label}
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                className={`bg-gradient-to-br ${gradientClasses[card.color as keyof typeof gradientClasses]} 
                  border rounded-xl p-4 sm:p-6 backdrop-blur-md hover:border-white/20 
                  transition-all duration-300 shadow-lg hover:shadow-xl`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`text-2xl sm:text-3xl font-bold ${textColorClasses[card.color as keyof typeof textColorClasses]}`}>
                    {card.value.toLocaleString()}
                  </div>
                  <div className={`${iconColorClasses[card.color as keyof typeof iconColorClasses]} 
                    ${isDark ? 'bg-white/10' : 'bg-white/50'} p-3 rounded-lg`}>
                    <Icon size={24} />
                  </div>
                </div>
                <p className={`text-xs sm:text-sm font-medium ${textSub}`}>{card.label}</p>
                <div className="mt-3 flex items-center gap-2">
                  <FiTrendingUp className="text-green-400" size={14} />
                  <span className="text-xs text-green-400">Data terbaru</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 gap-4 sm:gap-4 mb-4 sm:mb-4">
          {/* Rata-rata Usia Penduduk */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className={`rounded-xl p-4 sm:p-6 shadow-lg ${cardBg} border backdrop-blur-md overflow-hidden relative group`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <h2 className={`text-lg sm:text-xl font-bold ${textMain} mb-8 flex items-center gap-2 relative z-10`}>
              {/* <span className="text-2xl">📊</span> */}
              Statistik Rata-rata Usia Penduduk
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
              {/* Average Age */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 ${
                  isDark 
                    ? 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border-blue-400/50' 
                    : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300'
                }`}
              >
                <FaCalculator className={`text-4xl mb-3 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                <p className={`text-sm font-medium mb-2 ${textSub}`}>Rata-rata Usia</p>
                <p className={`text-4xl sm:text-5xl font-bold ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                  {statistik.rata_rata_usia !== undefined && statistik.rata_rata_usia !== null
                    ? Number(statistik.rata_rata_usia).toFixed(1)
                    : '-'}
                </p>
                <p className={`text-xs mt-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Tahun</p>
              </motion.div>

              {/* Usia Termuda */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 ${
                  isDark 
                    ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-400/50' 
                    : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300'
                }`}
              >
                <FaChild className={`text-4xl mb-3 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                <p className={`text-sm font-medium mb-2 ${textSub}`}>Usia Termuda</p>
                <p className={`text-4xl sm:text-5xl font-bold ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                  {statistik.usia_termuda !== undefined && statistik.usia_termuda !== null
                    ? statistik.usia_termuda
                    : '-'}
                </p>
                <p className={`text-xs mt-2 ${isDark ? 'text-green-400' : 'text-green-600'}`}>Tahun</p>
              </motion.div>

              {/* Usia Tertua */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 ${
                  isDark 
                    ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-400/50' 
                    : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300'
                }`}
              >
                <FaUser className={`text-4xl mb-3 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                <p className={`text-sm font-medium mb-2 ${textSub}`}>Usia Tertua</p>
                <p className={`text-4xl sm:text-5xl font-bold ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
                  {statistik.usia_tertua !== undefined && statistik.usia_tertua !== null
                    ? statistik.usia_tertua
                    : '-'}
                </p>
                <p className={`text-xs mt-2 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>Tahun</p>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* KTP Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={`rounded-lg p-4 sm:p-6 shadow-lg mb-4 sm:mb-4 ${cardBg} border`}
        >
          <h2 className={`text-lg sm:text-xl font-semibold ${textMain} mb-4`}>Distribusi Status KTP & Kartu Keluarga</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`rounded-lg p-4 border ${isDark ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-400/30' : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'}`}>
              <p className={`text-xs font-semibold uppercase ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>KTP Jaya Sampurna</p>
              <p className={`text-2xl font-bold mt-2 ${isDark ? 'text-blue-200' : 'text-blue-900'}`}>{statistik.ktp_jaya_sampurna}</p>
            </div>
            <div className={`rounded-lg p-4 border ${isDark ? 'bg-gradient-to-br from-red-500/20 to-red-600/20 border-red-400/30' : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'}`}>
              <p className={`text-xs font-semibold uppercase ${isDark ? 'text-red-300' : 'text-red-700'}`}>KTP Luar Desa</p>
              <p className={`text-2xl font-bold mt-2 ${isDark ? 'text-red-200' : 'text-red-900'}`}>{statistik.ktp_luar_desa}</p>
            </div>
            <div className={`rounded-lg p-4 border ${isDark ? 'bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-400/30' : 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'}`}>
              <p className={`text-xs font-semibold uppercase ${isDark ? 'text-green-300' : 'text-green-700'}`}>KK Jaya Sampurna</p>
              <p className={`text-2xl font-bold mt-2 ${isDark ? 'text-green-200' : 'text-green-900'}`}>{statistik.kk_jaya_sampurna}</p>
            </div>
            <div className={`rounded-lg p-4 border ${isDark ? 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border-yellow-400/30' : 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200'}`}>
              <p className={`text-xs font-semibold uppercase ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>KK Luar Desa</p>
              <p className={`text-2xl font-bold mt-2 ${isDark ? 'text-yellow-200' : 'text-yellow-900'}`}>{statistik.kk_luar_desa}</p>
            </div>
          </div>
        </motion.div>

        {/* Distribusi Kelompok Usia */}
        {dashboardData.usia.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className={`rounded-lg p-4 sm:p-6 shadow-lg mb-4 sm:mb-4 ${cardBg} border`}
          >
            <h2 className={`text-lg sm:text-xl font-semibold ${textMain} mb-4`}>Distribusi Kelompok Usia</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {dashboardData.usia.map((item, index) => {
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
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    className={`rounded-lg p-4 border ${color.bg}`}
                  >
                    <p className={`text-xs font-semibold uppercase ${color.text}`}>{item.kelompok_usia}</p>
                    <p className={`text-2xl font-bold mt-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.jumlah}</p>
                    <p className={`text-xs mt-2 ${textSub}`}>Orang</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Distribution Pekerjaan */}
        {pekerjaanData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className={`rounded-lg p-4 sm:p-6 shadow-lg mb-4 sm:mb-4 ${cardBg} border`}
          >
            <h2 className={`text-lg sm:text-xl font-semibold ${textMain} mb-4`}>Distribusi Pekerjaan</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {pekerjaanData.map((item, index) => {
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
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    className={`rounded-lg p-4 border ${color.bg}`}
                  >
                    <p className={`text-xs font-semibold uppercase ${color.text}`}>{item.pekerjaan}</p>
                    <p className={`text-2xl font-bold mt-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.jumlah}</p>
                    <p className={`text-xs mt-2 ${textSub}`}>Orang</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        {/* <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <Link href="/pendataan/kartu-keluarga" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 sm:px-6 rounded-lg transition block text-center text-sm sm:text-base">
            📋 Kelola Kartu Keluarga
          </Link>
          <Link href="/pendataan/penduduk" className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 sm:px-6 rounded-lg transition block text-center text-sm sm:text-base">
            👥 Kelola Data Penduduk
          </Link>
        </motion.div> */}
      </div>
    </div>
  );
}
