import React, { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FiUsers, FiHome, FiBarChart3, FiTrendingUp } from 'react-icons/fi';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { SummaryStatistik, DistribusiUsia, DistribusiPekerjaan } from '@/interface/pendataan';

interface DashboardData {
  statistik: SummaryStatistik;
  usia: DistribusiUsia[];
  pekerjaan: DistribusiPekerjaan[];
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function PendataanDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/pendataan/dashboard');
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
      <div className="flex items-center justify-center min-h-screen">
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

  const { statistik, usia, pekerjaan } = dashboardData;

  // Stat cards
  const statCards = [
    { label: 'Total Penduduk', value: statistik.total_penduduk, icon: FiUsers, color: 'blue' },
    { label: 'Total KK', value: statistik.total_kk, icon: FiHome, color: 'green' },
    { label: 'KTP Jaya Sampurna', value: statistik.ktp_jaya_sampurna, icon: FiBarChart3, color: 'purple' },
    { label: 'KTP Luar Desa', value: statistik.ktp_luar_desa, icon: FiTrendingUp, color: 'orange' },
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard Pendataan Warga</h1>
          <p className="text-gray-600">Sistem Manajemen Data Penduduk RT/RW</p>
        </motion.div>

        {/* Stat Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {statCards.map((card) => {
            const Icon = card.icon;
            const colorClasses = {
              blue: 'bg-blue-50 border-blue-200 text-blue-700',
              green: 'bg-green-50 border-green-200 text-green-700',
              purple: 'bg-purple-50 border-purple-200 text-purple-700',
              orange: 'bg-orange-50 border-orange-200 text-orange-700',
            };

            return (
              <motion.div
                key={card.label}
                variants={itemVariants}
                className={`border rounded-lg p-6 ${colorClasses[card.color as keyof typeof colorClasses]}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium opacity-75">{card.label}</p>
                    <p className="text-3xl font-bold mt-2">{card.value.toLocaleString()}</p>
                  </div>
                  <Icon className="w-12 h-12 opacity-25" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Gender Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg p-6 shadow-lg mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Distribusi Jenis Kelamin</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-sm text-gray-600">Laki-laki</p>
              <p className="text-2xl font-bold text-blue-700">{statistik.total_laki_laki}</p>
              <p className="text-xs text-gray-500 mt-1">
                {((statistik.total_laki_laki / statistik.total_penduduk) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="bg-pink-50 border-l-4 border-pink-500 p-4 rounded">
              <p className="text-sm text-gray-600">Perempuan</p>
              <p className="text-2xl font-bold text-pink-700">{statistik.total_perempuan}</p>
              <p className="text-xs text-gray-500 mt-1">
                {((statistik.total_perempuan / statistik.total_penduduk) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </motion.div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Distribusi Usia */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-lg p-6 shadow-lg"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Distribusi Kelompok Usia</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={usia}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis dataKey="kelompok_usia" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }} />
                <Bar dataKey="jumlah" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Distribusi Pekerjaan */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-lg p-6 shadow-lg"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Distribusi Pekerjaan (Top 5)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pekerjaan.slice(0, 5)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ pekerjaan, jumlah }) => `${pekerjaan}: ${jumlah}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="jumlah"
                >
                  {pekerjaan.slice(0, 5).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* KTP Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-lg p-6 shadow-lg mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Distribusi Status KTP & Kartu Keluarga</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
              <p className="text-xs font-semibold text-blue-700 uppercase">KTP Jaya Sampurna</p>
              <p className="text-2xl font-bold text-blue-900 mt-2">{statistik.ktp_jaya_sampurna}</p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-4">
              <p className="text-xs font-semibold text-red-700 uppercase">KTP Luar Desa</p>
              <p className="text-2xl font-bold text-red-900 mt-2">{statistik.ktp_luar_desa}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
              <p className="text-xs font-semibold text-green-700 uppercase">KK Jaya Sampurna</p>
              <p className="text-2xl font-bold text-green-900 mt-2">{statistik.kk_jaya_sampurna}</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4">
              <p className="text-xs font-semibold text-yellow-700 uppercase">KK Luar Desa</p>
              <p className="text-2xl font-bold text-yellow-900 mt-2">{statistik.kk_luar_desa}</p>
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
          <Link href="/pendataan/kartu-keluarga">
            <a className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition block text-center">
              📋 Kelola Kartu Keluarga
            </a>
          </Link>
          <Link href="/pendataan/penduduk">
            <a className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition block text-center">
              👥 Kelola Data Penduduk
            </a>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
