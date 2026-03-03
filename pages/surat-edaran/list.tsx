import { motion } from 'framer-motion';
import { FaArrowLeft, FaFileAlt, FaCalendar, FaUser, FaDownload, FaPlus, FaSearch, FaFilter } from 'react-icons/fa';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useApiData, dummySuratEdaran } from '@/lib/hooks';

type SuratEdaran = typeof dummySuratEdaran[number];

export default function CircularList() {
    const { theme } = useTheme();
    const { isAdmin } = useAuth();
    const isDark = theme === 'dark';
    const { data: allCirculars } = useApiData<SuratEdaran>({ apiUrl: '/api/surat-edaran', dummyData: dummySuratEdaran, realtimeTables: ['surat_edaran'] });
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const filtered = allCirculars.filter((c) => {
        const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || (c.author || '').toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'all' || c.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const cardClass = isDark
        ? 'bg-gradient-to-br from-[#181926]/80 via-[#231b2e]/80 to-[#2d1e3a]/80 border-white/10'
        : 'bg-white border-gray-200 shadow-sm';
    const textMain = isDark ? 'text-white' : 'text-gray-900';
    const textSub = isDark ? 'text-gray-400' : 'text-gray-500';
    const textMuted = isDark ? 'text-gray-300' : 'text-gray-600';

    return (
        <>
            <Head>
                <title>Surat Edaran - Sistem Manajemen Perumahan</title>
            </Head>

            <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-[#0f0f1a] via-[#1a0f2e] to-[#2d1e3a]' : 'bg-gray-50'}`}>
                <div className="pt-20 md:pt-6 px-4 md:px-8 pb-8">
                    {/* Header */}
                    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-5 flex items-center gap-3">
                        <Link href="/dashboard">
                            <motion.button whileHover={{ x: -4 }} className={`p-2 rounded-lg transition-colors ${isDark ? 'bg-white/10 hover:bg-white/20 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}>
                                <FaArrowLeft size={20} />
                            </motion.button>
                        </Link>
                        <div>
                            <h1 className={`text-4xl font-bold ${textMain}`}>Surat Edaran</h1>
                            <p className={textSub}>Kelola informasi dan pengumuman perumahan</p>
                        </div>
                    </motion.div>

                    {/* Summary Cards */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5"
                    >
                        {[
                            { label: 'Total Surat', value: allCirculars.length, color: 'text-blue-400', bg: 'from-blue-400/20 to-blue-500/20' },
                            { label: 'Terbit', value: allCirculars.filter(c => c.status === 'published').length, color: 'text-green-400', bg: 'from-green-400/20 to-emerald-500/20' },
                            { label: 'Draft', value: allCirculars.filter(c => c.status === 'draft').length, color: 'text-yellow-400', bg: 'from-yellow-400/20 to-orange-500/20' },
                        ].map((card, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -3, scale: 1.01 }}
                                className={`bg-gradient-to-br ${card.bg} border ${isDark ? 'border-white/10' : 'border-gray-200'} rounded-xl p-5 backdrop-blur-md`}
                            >
                                <p className={`text-sm ${textMuted}`}>{card.label}</p>
                                <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Search, Filter, Action */}
                    <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col md:flex-row gap-3 mb-4"
                    >
                        <div className={`flex items-center gap-2 flex-1 px-4 py-2 rounded-lg border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-300'}`}>
                            <FaSearch className={textSub} size={14} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari surat edaran..."
                                className={`w-full bg-transparent outline-none text-sm ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`}
                            />
                        </div>
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-300'}`}>
                            <FaFilter className={textSub} size={14} />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className={`bg-transparent outline-none text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}
                            >
                                <option value="all" className="bg-gray-800">Semua</option>
                                <option value="published" className="bg-gray-800">Terbit</option>
                                <option value="draft" className="bg-gray-800">Draft</option>
                            </select>
                        </div>
                        {isAdmin && (
                            <Link href="/surat-edaran/create">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-pink-400 to-purple-400 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-pink-500/50 transition-all"
                                >
                                    <FaPlus size={14} />
                                    Buat Surat Edaran
                                </motion.button>
                            </Link>
                        )}
                    </motion.div>

                    {/* Table */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className={`border rounded-xl overflow-hidden backdrop-blur-md ${cardClass}`}
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm table-modern">
                                <thead>
                                    <tr className={isDark ? 'bg-white/5' : 'bg-gray-50'}>
                                        <th className={`text-left px-6 py-4 font-semibold ${textMuted}`}>Judul</th>
                                        <th className={`text-left px-6 py-4 font-semibold ${textMuted}`}>Kategori</th>
                                        <th className={`text-left px-6 py-4 font-semibold ${textMuted}`}>Penulis</th>
                                        <th className={`text-left px-6 py-4 font-semibold ${textMuted}`}>Tanggal</th>
                                        <th className={`text-center px-6 py-4 font-semibold ${textMuted}`}>Status</th>
                                        <th className={`text-center px-6 py-4 font-semibold ${textMuted}`}>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((c, i) => (
                                        <motion.tr
                                            key={c.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.03 }}
                                            className={`border-t ${isDark ? 'border-white/5 hover:bg-white/5' : 'border-gray-100 hover:bg-gray-50'} transition-colors`}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-start gap-3">
                                                    <FaFileAlt size={16} className="text-purple-400 mt-0.5 flex-shrink-0" />
                                                    <span className={`${textMain} font-medium max-w-[300px]`}>{c.title}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${isDark ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                                    {c.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <FaUser size={12} className={textSub} />
                                                    <span className={textMuted}>{c.author}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <FaCalendar size={12} className={textSub} />
                                                    <span className={textMuted}>{c.date}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${c.status === 'published' ? 'bg-green-400/20 text-green-400' : 'bg-yellow-400/20 text-yellow-400'}`}>
                                                    {c.status === 'published' ? 'Terbit' : 'Draft'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        className={`p-1.5 rounded transition-colors ${isDark ? 'hover:bg-blue-400/20 text-blue-400' : 'hover:bg-blue-50 text-blue-500'}`}
                                                    >
                                                        <FaDownload size={14} />
                                                    </motion.button>
                                                    <button className={`${isDark ? 'text-gray-400 hover:text-pink-400' : 'text-gray-500 hover:text-pink-500'} transition-colors text-lg`}>⋮</button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {filtered.length === 0 && (
                            <div className={`text-center py-12 ${textSub}`}>Tidak ada surat edaran ditemukan.</div>
                        )}
                    </motion.div>
                </div>
            </div>
        </>
    );
}
