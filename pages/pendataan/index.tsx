import React, { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { FiUsers, FiHome, FiBarChart2, FiTrendingUp, FiInfo } from 'react-icons/fi';
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

interface DashboardData {
  statistik: SummaryStatistik;
  usia: DistribusiUsia[];
  pendidikan: DistribusiPendidikan[];
}

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316'];

export default function PendataanDashboard() {
  const { user, isAdmin } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/pendataan/dashboard', {
        headers: {
          'x-user-id': user.id,
        },
      });
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      setDashboardData(result.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching dashboard:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${
        isDark ? 'bg-gradient-to-br from-[#0f0f1a] via-[#1a0f2e] to-[#2d1e3a]' : 'bg-gray-50'
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
  const gridLineColor = isDark ? '#ffffff15' : '#e0e7ff';
  const tooltipBg = isDark ? '#1e1b2e' : '#ffffff';
  const tooltipBorder = isDark ? '#ffffff20' : '#cccccc';

  return (
    <div className={`min-h-screen p-3 sm:p-6 ${
      isDark ? 'bg-gradient-to-br from-[#0f0f1a] via-[#1a0f2e] to-[#2d1e3a]' : 'bg-gradient-to-br from-slate-50 to-slate-100'
    }`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold ${textMain} mb-2`}>Dashboard Pendataan Warga</h1>
          <p className={`text-sm sm:text-base ${textSub}`}>Sistem Manajemen Data Penduduk RT/RW</p>
        </motion.div>

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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8"
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

        {/* Gender Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className={`rounded-xl p-4 sm:p-6 shadow-lg mb-6 sm:mb-8 ${cardBg} border backdrop-blur-md overflow-hidden relative group`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <h2 className={`text-lg sm:text-xl font-bold ${textMain} mb-6 relative z-10`}>Distribusi Jenis Kelamin</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className={`bg-gradient-to-br ${isDark ? 'from-blue-500/20 to-indigo-500/20' : 'from-blue-50 to-indigo-50'} 
                border-l-4 border-blue-500 p-5 rounded-xl shadow-lg transition-all duration-300`}
            >
              <div className="flex items-center justify-between mb-3">
                <p className={`text-sm font-semibold ${textSub}`}>Laki-laki</p>
                <span className="text-2xl">👨</span>
              </div>
              <p className={`text-3xl sm:text-4xl font-bold ${isDark ? 'text-blue-300' : 'text-blue-700'} mb-2`}>
                {statistik.total_laki_laki.toLocaleString()}
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" 
                    style={{ width: `${((statistik.total_laki_laki / statistik.total_penduduk) * 100)}%` }}
                  />
                </div>
                <p className={`text-xs font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  {((statistik.total_laki_laki / statistik.total_penduduk) * 100).toFixed(1)}%
                </p>
              </div>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className={`bg-gradient-to-br ${isDark ? 'from-pink-500/20 to-rose-500/20' : 'from-pink-50 to-rose-50'} 
                border-l-4 border-pink-500 p-5 rounded-xl shadow-lg transition-all duration-300`}
            >
              <div className="flex items-center justify-between mb-3">
                <p className={`text-sm font-semibold ${textSub}`}>Perempuan</p>
                <span className="text-2xl">👩</span>
              </div>
              <p className={`text-3xl sm:text-4xl font-bold ${isDark ? 'text-pink-300' : 'text-pink-700'} mb-2`}>
                {statistik.total_perempuan.toLocaleString()}
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full" 
                    style={{ width: `${((statistik.total_perempuan / statistik.total_penduduk) * 100)}%` }}
                  />
                </div>
                <p className={`text-xs font-medium ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>
                  {((statistik.total_perempuan / statistik.total_penduduk) * 100).toFixed(1)}%
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Distribusi Usia */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className={`rounded-xl p-4 sm:p-6 shadow-lg ${cardBg} border backdrop-blur-md overflow-hidden relative group`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <h2 className={`text-lg sm:text-xl font-bold ${textMain} mb-6 flex items-center gap-2 relative z-10`}>
              <span className="text-2xl">👥</span>
              Distribusi Kelompok Usia
            </h2>
            <div className="h-72 relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={usia} barCategoryGap="15%">
                  <defs>
                    <linearGradient id="colorUsia" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0.8}/>
                    </linearGradient>
                    <filter id="shadowUsia">
                      <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#8b5cf6" floodOpacity="0.3"/>
                    </filter>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridLineColor} vertical={false} opacity={0.3} />
                  <XAxis 
                    dataKey="kelompok_usia" 
                    angle={-45} 
                    textAnchor="end" 
                    height={80} 
                    tick={{ fontSize: 11, fill: isDark ? '#9ca3af' : '#4b5563', fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fill: isDark ? '#9ca3af' : '#4b5563', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: tooltipBg, 
                      border: `1px solid ${tooltipBorder}`, 
                      borderRadius: '12px', 
                      color: isDark ? '#fff' : '#111',
                      boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.1)',
                      padding: '12px 16px'
                    }} 
                    cursor={{ fill: isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)' }}
                  />
                  <Bar 
                    dataKey="jumlah" 
                    fill="url(#colorUsia)" 
                    radius={[8, 8, 0, 0]}
                    animationDuration={1500}
                    animationEasing="ease-in-out"
                    filter="url(#shadowUsia)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Distribusi Pendidikan */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className={`rounded-xl p-4 sm:p-6 shadow-lg ${cardBg} border backdrop-blur-md overflow-hidden relative group`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <h2 className={`text-lg sm:text-xl font-bold ${textMain} mb-6 flex items-center gap-2 relative z-10`}>
              <span className="text-2xl">🎓</span>
              Distribusi Pendidikan Terakhir
            </h2>
            <div className="h-72 relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    {COLORS.map((color, index) => (
                      <linearGradient key={index} id={`colorPendidikan${index}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={1}/>
                        <stop offset="100%" stopColor={color} stopOpacity={0.7}/>
                      </linearGradient>
                    ))}
                    <filter id="shadowPendidikan">
                      <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.3"/>
                    </filter>
                  </defs>
                  <Pie
                    data={pendidikan}
                    cx="50%"
                    cy="50%"
                    labelLine={{
                      stroke: isDark ? '#9ca3af' : '#4b5563',
                      strokeWidth: 1.5
                    }}
                    label={(entry: any) => {
                      const percent = ((entry.value / pendidikan.reduce((sum, item) => sum + item.jumlah, 0)) * 100).toFixed(0);
                      return `${entry.payload.pendidikan}: ${percent}%`;
                    }}
                    outerRadius={95}
                    dataKey="jumlah"
                    animationDuration={1500}
                    animationEasing="ease-in-out"
                    animationBegin={300}
                  >
                    {pendidikan.map((_, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={`url(#colorPendidikan${index % COLORS.length})`}
                        stroke={isDark ? '#1e1b2e' : '#fff'}
                        strokeWidth={2}
                        filter="url(#shadowPendidikan)"
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: tooltipBg, 
                      border: `1px solid ${tooltipBorder}`, 
                      borderRadius: '12px', 
                      color: isDark ? '#fff' : '#111',
                      boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.1)',
                      padding: '12px 16px'
                    }}
                  />
                  <Legend 
                    iconType="circle" 
                    wrapperStyle={{ 
                      color: isDark ? '#d1d5db' : '#374151',
                      fontSize: '12px',
                      paddingTop: '20px'
                    }}
                    formatter={(value) => {
                      const item = pendidikan.find(d => d.pendidikan === value);
                      return item ? `${value} (${item.jumlah})` : value;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* KTP Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={`rounded-lg p-4 sm:p-6 shadow-lg mb-6 sm:mb-8 ${cardBg} border`}
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

        {/* Quick Actions */}
        <motion.div
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
        </motion.div>
      </div>
    </div>
  );
}
