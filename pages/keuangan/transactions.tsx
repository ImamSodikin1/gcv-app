import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaMoneyBillWave, FaSearch, FaFilter, FaPlus, FaTimes, FaEdit, FaTrash, FaArrowUp, FaArrowDown, FaCalendarAlt, FaTag } from 'react-icons/fa';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';

const initialTransactions = [
    { id: '1', date: '2026-03-01', type: 'Pemasukan', category: 'Iuran Bulanan', amount: 5000000, description: 'Iuran keamanan bulan Maret', status: 'approved' },
    { id: '2', date: '2026-03-02', type: 'Pengeluaran', category: 'Maintenance', amount: 1500000, description: 'Perbaikan jalan utama', status: 'approved' },
    { id: '3', date: '2026-03-03', type: 'Pemasukan', category: 'Iuran Bulanan', amount: 4800000, description: 'Iuran keamanan blok B', status: 'pending' },
    { id: '4', date: '2026-02-28', type: 'Pengeluaran', category: 'Kebersihan', amount: 800000, description: 'Gaji petugas kebersihan', status: 'approved' },
    { id: '5', date: '2026-02-25', type: 'Pemasukan', category: 'Denda', amount: 250000, description: 'Denda keterlambatan iuran', status: 'approved' },
    { id: '6', date: '2026-02-20', type: 'Pengeluaran', category: 'Listrik', amount: 2300000, description: 'Tagihan listrik area umum', status: 'approved' },
    { id: '7', date: '2026-02-15', type: 'Pemasukan', category: 'Iuran Bulanan', amount: 5200000, description: 'Iuran keamanan blok C', status: 'approved' },
    { id: '8', date: '2026-02-10', type: 'Pengeluaran', category: 'Maintenance', amount: 3200000, description: 'Perbaikan pagar perumahan', status: 'pending' },
];

const chartData = [
    { month: 'Okt', pemasukan: 13500, pengeluaran: 8000 },
    { month: 'Nov', pemasukan: 11000, pengeluaran: 9200 },
    { month: 'Des', pemasukan: 16000, pengeluaran: 10500 },
    { month: 'Jan', pemasukan: 14000, pengeluaran: 7800 },
    { month: 'Feb', pemasukan: 15200, pengeluaran: 6300 },
    { month: 'Mar', pemasukan: 9800, pengeluaran: 1500 },
];

const emptyForm = { date: '', type: 'Pemasukan', category: 'Iuran Bulanan', amount: '', description: '', status: 'pending' };

export default function FinancialTransactions() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [transactions, setTransactions] = useState(initialTransactions);

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [editId, setEditId] = useState<string | null>(null);

    // Simulated admin role
    const currentUserRole: 'admin' | 'warga' = 'admin';
    const isAdmin = currentUserRole === 'admin';

    const filtered = transactions.filter((t) => {
        const matchSearch =
            t.description.toLowerCase().includes(search.toLowerCase()) ||
            t.category.toLowerCase().includes(search.toLowerCase());
        const matchType = filterType === 'all' || t.type.toLowerCase() === filterType;
        return matchSearch && matchType;
    });

    // Summary stats
    const totalPemasukan = transactions.filter(t => t.type === 'Pemasukan').reduce((s, t) => s + t.amount, 0);
    const totalPengeluaran = transactions.filter(t => t.type === 'Pengeluaran').reduce((s, t) => s + t.amount, 0);

    const cardClass = isDark
        ? 'bg-gradient-to-br from-[#181926]/80 via-[#231b2e]/80 to-[#2d1e3a]/80 border-white/10'
        : 'bg-white border-gray-200 shadow-sm';
    const textMain = isDark ? 'text-white' : 'text-gray-900';
    const textSub = isDark ? 'text-gray-400' : 'text-gray-500';
    const textMuted = isDark ? 'text-gray-300' : 'text-gray-600';
    const gridLineColor = isDark ? '#ffffff15' : '#e5e7eb';
    const tooltipBg = isDark ? '#1e1b2e' : '#ffffff';
    const tooltipBorder = isDark ? '#ffffff20' : '#e5e7eb';
    const inputCls = `w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'}`;

    const handleAdd = () => {
        if (!form.date || !form.description || !form.amount) return;
        const newTx = {
            id: Date.now().toString(),
            date: form.date,
            type: form.type,
            category: form.category,
            amount: Number(form.amount),
            description: form.description,
            status: form.status,
        };
        setTransactions([newTx, ...transactions]);
        setForm(emptyForm);
        setShowAddModal(false);
    };

    const handleEdit = () => {
        if (!form.date || !form.description || !form.amount || !editId) return;
        setTransactions(transactions.map(t =>
            t.id === editId
                ? { ...t, date: form.date, type: form.type, category: form.category, amount: Number(form.amount), description: form.description, status: form.status }
                : t
        ));
        setForm(emptyForm);
        setEditId(null);
        setShowEditModal(false);
    };

    const handleDelete = (id: string) => {
        setTransactions(transactions.filter(t => t.id !== id));
        setShowDeleteConfirm(null);
    };

    const openEdit = (t: typeof initialTransactions[0]) => {
        setEditId(t.id);
        setForm({ date: t.date, type: t.type, category: t.category, amount: t.amount.toString(), description: t.description, status: t.status });
        setShowEditModal(true);
    };

    // Shared modal form
    const renderForm = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={`block text-sm font-medium mb-1.5 ${textMuted}`}>Tanggal</label>
                    <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={inputCls} />
                </div>
                <div>
                    <label className={`block text-sm font-medium mb-1.5 ${textMuted}`}>Tipe</label>
                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputCls}>
                        <option value="Pemasukan" className={isDark ? 'bg-gray-800' : ''}>Pemasukan</option>
                        <option value="Pengeluaran" className={isDark ? 'bg-gray-800' : ''}>Pengeluaran</option>
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={`block text-sm font-medium mb-1.5 ${textMuted}`}>Kategori</label>
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls}>
                        {['Iuran Bulanan', 'Maintenance', 'Kebersihan', 'Listrik', 'Denda', 'Lainnya'].map(c => (
                            <option key={c} value={c} className={isDark ? 'bg-gray-800' : ''}>{c}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className={`block text-sm font-medium mb-1.5 ${textMuted}`}>Status</label>
                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputCls}>
                        <option value="pending" className={isDark ? 'bg-gray-800' : ''}>Pending</option>
                        <option value="approved" className={isDark ? 'bg-gray-800' : ''}>Approved</option>
                    </select>
                </div>
            </div>
            <div>
                <label className={`block text-sm font-medium mb-1.5 ${textMuted}`}>Jumlah (Rp)</label>
                <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0" className={inputCls} />
            </div>
            <div>
                <label className={`block text-sm font-medium mb-1.5 ${textMuted}`}>Deskripsi</label>
                <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Deskripsi transaksi..." className={inputCls} />
            </div>
        </div>
    );

    return (
        <>
            <Head>
                <title>Transaksi Keuangan - Sistem Manajemen Perumahan</title>
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
                            <h1 className={`text-4xl font-bold ${textMain}`}>Transaksi Keuangan</h1>
                            <p className={textSub}>Kelola semua transaksi keuangan perumahan</p>
                        </div>
                    </motion.div>

                    {/* Summary Cards */}
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 }} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
                        <motion.div whileHover={{ y: -3 }} className={`bg-gradient-to-br from-emerald-400/20 to-green-500/20 border ${isDark ? 'border-white/10' : 'border-gray-200'} rounded-xl p-5`}>
                            <div className="flex items-center gap-2 mb-2">
                                <FaArrowUp className="text-emerald-400" />
                                <p className={`text-sm ${textMuted}`}>Total Pemasukan</p>
                            </div>
                            <p className="text-2xl font-bold text-emerald-400">Rp {totalPemasukan.toLocaleString('id-ID')}</p>
                        </motion.div>
                        <motion.div whileHover={{ y: -3 }} className={`bg-gradient-to-br from-red-400/20 to-rose-500/20 border ${isDark ? 'border-white/10' : 'border-gray-200'} rounded-xl p-5`}>
                            <div className="flex items-center gap-2 mb-2">
                                <FaArrowDown className="text-red-400" />
                                <p className={`text-sm ${textMuted}`}>Total Pengeluaran</p>
                            </div>
                            <p className="text-2xl font-bold text-red-400">Rp {totalPengeluaran.toLocaleString('id-ID')}</p>
                        </motion.div>
                        <motion.div whileHover={{ y: -3 }} className={`bg-gradient-to-br from-blue-400/20 to-indigo-500/20 border ${isDark ? 'border-white/10' : 'border-gray-200'} rounded-xl p-5`}>
                            <div className="flex items-center gap-2 mb-2">
                                <FaMoneyBillWave className="text-blue-400" />
                                <p className={`text-sm ${textMuted}`}>Saldo</p>
                            </div>
                            <p className="text-2xl font-bold text-blue-400">Rp {(totalPemasukan - totalPengeluaran).toLocaleString('id-ID')}</p>
                        </motion.div>
                    </motion.div>

                    {/* Chart */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className={`border rounded-xl p-5 backdrop-blur-md mb-5 ${cardClass} overflow-hidden relative group`}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <h2 className={`text-lg font-bold mb-4 ${textMain} relative z-10`}>Tren Keuangan (dalam ribuan)</h2>
                        <div className="h-64 relative z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} barCategoryGap="20%">
                                    <defs>
                                        <linearGradient id="txBarIn" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#34d399" stopOpacity={1} />
                                            <stop offset="100%" stopColor="#059669" stopOpacity={0.8} />
                                        </linearGradient>
                                        <linearGradient id="txBarOut" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#f472b6" stopOpacity={1} />
                                            <stop offset="100%" stopColor="#db2777" stopOpacity={0.8} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke={gridLineColor} vertical={false} />
                                    <XAxis dataKey="month" stroke={isDark ? '#9ca3af' : '#6b7280'} fontSize={12} axisLine={false} tickLine={false} />
                                    <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} fontSize={12} tickFormatter={(v) => `${v / 1000}jt`} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '12px', color: isDark ? '#fff' : '#111', boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.1)', padding: '12px 16px' }} itemStyle={{ color: isDark ? '#e5e7eb' : '#374151' }} labelStyle={{ color: isDark ? '#fff' : '#111' }} formatter={(value: unknown) => [`Rp ${(Number(value) * 1000).toLocaleString('id-ID')}`, '']} cursor={{ fill: isDark ? '#ffffff08' : '#00000008' }} />
                                    <Legend iconType="circle" wrapperStyle={{ color: isDark ? '#d1d5db' : '#374151' }} />
                                    <Bar dataKey="pemasukan" name="Pemasukan" fill="url(#txBarIn)" radius={[6, 6, 0, 0]} isAnimationActive={true} animationDuration={1200} animationEasing="ease-out" />
                                    <Bar dataKey="pengeluaran" name="Pengeluaran" fill="url(#txBarOut)" radius={[6, 6, 0, 0]} isAnimationActive={true} animationDuration={1200} animationEasing="ease-out" animationBegin={300} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Search, Filter, Action */}
                    <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col md:flex-row gap-3 mb-4"
                    >
                        <div className={`flex items-center gap-2 flex-1 px-4 py-2.5 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-300'}`}>
                            <FaSearch className={textSub} size={14} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari transaksi..."
                                className={`w-full bg-transparent outline-none text-sm ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`}
                            />
                        </div>
                        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-300'}`}>
                            <FaFilter className={textSub} size={14} />
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className={`bg-transparent outline-none text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}
                            >
                                <option value="all" className={isDark ? 'bg-[#1a1b2e]' : ''}>Semua</option>
                                <option value="pemasukan" className={isDark ? 'bg-[#1a1b2e]' : ''}>Pemasukan</option>
                                <option value="pengeluaran" className={isDark ? 'bg-[#1a1b2e]' : ''}>Pengeluaran</option>
                            </select>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => { setForm(emptyForm); setShowAddModal(true); }}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-pink-400 to-purple-400 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-pink-500/50 transition-all"
                        >
                            <FaPlus size={14} />
                            Tambah Transaksi
                        </motion.button>
                    </motion.div>

                    {/* Table */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className={`border rounded-2xl overflow-hidden backdrop-blur-md ${cardClass}`}
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm table-modern">
                                <thead>
                                    <tr className={isDark ? 'bg-white/5' : 'bg-gray-50/80'}>
                                        <th className={`text-left px-5 py-4 font-semibold ${textMuted}`}>
                                            <div className="flex items-center gap-1.5"><FaCalendarAlt size={11} className="opacity-50" /> Tanggal</div>
                                        </th>
                                        <th className={`text-left px-5 py-4 font-semibold ${textMuted}`}>Tipe</th>
                                        <th className={`text-left px-5 py-4 font-semibold ${textMuted}`}>
                                            <div className="flex items-center gap-1.5"><FaTag size={11} className="opacity-50" /> Kategori</div>
                                        </th>
                                        <th className={`text-left px-5 py-4 font-semibold ${textMuted}`}>Deskripsi</th>
                                        <th className={`text-right px-5 py-4 font-semibold ${textMuted}`}>Jumlah</th>
                                        <th className={`text-center px-5 py-4 font-semibold ${textMuted}`}>Status</th>
                                        {isAdmin && <th className={`text-center px-5 py-4 font-semibold ${textMuted}`}>Aksi</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((t, i) => (
                                        <motion.tr
                                            key={t.id}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.04 }}
                                            className={`border-t ${isDark ? 'border-white/5 hover:bg-white/[0.03]' : 'border-gray-100 hover:bg-gray-50/50'} transition-all duration-200`}
                                        >
                                            <td className={`px-5 py-4 ${textMain}`}>
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                                                    <FaCalendarAlt size={10} className="opacity-40" />
                                                    {t.date}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${t.type === 'Pemasukan' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-red-400/10 text-red-400'}`}>
                                                    {t.type === 'Pemasukan' ? <FaArrowUp size={10} /> : <FaArrowDown size={10} />}
                                                    {t.type}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${isDark ? 'bg-purple-400/10 text-purple-300' : 'bg-purple-50 text-purple-600'}`}>
                                                    {t.category}
                                                </span>
                                            </td>
                                            <td className={`px-5 py-4 ${textMuted} max-w-[220px]`}>
                                                <span className="truncate block">{t.description}</span>
                                            </td>
                                            <td className={`px-5 py-4 text-right font-bold tabular-nums ${t.type === 'Pemasukan' ? 'text-emerald-400' : 'text-red-400'}`}>
                                                <span className="text-xs opacity-60 mr-0.5">{t.type === 'Pemasukan' ? '+' : '-'}</span>
                                                Rp {t.amount.toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold ${t.status === 'approved' ? 'bg-emerald-400/15 text-emerald-400 ring-1 ring-emerald-400/20' : 'bg-amber-400/15 text-amber-400 ring-1 ring-amber-400/20'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${t.status === 'approved' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                                                    {t.status === 'approved' ? 'Approved' : 'Pending'}
                                                </span>
                                            </td>
                                            {isAdmin && (
                                                <td className="px-5 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button
                                                            onClick={() => openEdit(t)}
                                                            className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-white/10 text-gray-400 hover:text-blue-400' : 'hover:bg-blue-50 text-gray-400 hover:text-blue-500'}`}
                                                            title="Edit"
                                                        >
                                                            <FaEdit size={13} />
                                                        </button>
                                                        <button
                                                            onClick={() => setShowDeleteConfirm(t.id)}
                                                            className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-white/10 text-gray-400 hover:text-red-400' : 'hover:bg-red-50 text-gray-400 hover:text-red-500'}`}
                                                            title="Hapus"
                                                        >
                                                            <FaTrash size={12} />
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {filtered.length === 0 && (
                            <div className={`text-center py-16 ${textSub}`}>
                                <FaMoneyBillWave size={32} className="mx-auto mb-3 opacity-30" />
                                <p>Tidak ada transaksi ditemukan.</p>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* Modal Tambah Transaksi */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowAddModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl ${isDark ? 'bg-[#1a1b2e] border-white/10' : 'bg-white border-gray-200'}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-pink-400/20 to-purple-400/20">
                                        <FaPlus className="text-purple-400" size={16} />
                                    </div>
                                    <h2 className={`text-xl font-bold ${textMain}`}>Tambah Transaksi</h2>
                                </div>
                                <button onClick={() => setShowAddModal(false)} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                                    <FaTimes size={18} />
                                </button>
                            </div>
                            {renderForm()}
                            <div className="flex gap-3 mt-6">
                                <button onClick={() => setShowAddModal(false)} className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${isDark ? 'border-white/10 text-gray-300 hover:bg-white/5' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                                    Batal
                                </button>
                                <button onClick={handleAdd} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-pink-400 to-purple-400 text-white hover:shadow-lg hover:shadow-pink-500/30 transition-all">
                                    Simpan Transaksi
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal Edit Transaksi */}
            <AnimatePresence>
                {showEditModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowEditModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl ${isDark ? 'bg-[#1a1b2e] border-white/10' : 'bg-white border-gray-200'}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-400/20 to-indigo-400/20">
                                        <FaEdit className="text-blue-400" size={16} />
                                    </div>
                                    <h2 className={`text-xl font-bold ${textMain}`}>Edit Transaksi</h2>
                                </div>
                                <button onClick={() => setShowEditModal(false)} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                                    <FaTimes size={18} />
                                </button>
                            </div>
                            {renderForm()}
                            <div className="flex gap-3 mt-6">
                                <button onClick={() => setShowEditModal(false)} className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${isDark ? 'border-white/10 text-gray-300 hover:bg-white/5' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                                    Batal
                                </button>
                                <button onClick={handleEdit} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-400 to-indigo-500 text-white hover:shadow-lg hover:shadow-blue-500/30 transition-all">
                                    Update Transaksi
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal Konfirmasi Delete */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowDeleteConfirm(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className={`w-full max-w-sm rounded-2xl border p-6 shadow-2xl ${isDark ? 'bg-[#1a1b2e] border-white/10' : 'bg-white border-gray-200'}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="text-center mb-6">
                                <div className="w-14 h-14 rounded-full bg-red-400/15 flex items-center justify-center mx-auto mb-4">
                                    <FaTrash className="text-red-400" size={22} />
                                </div>
                                <h3 className={`text-lg font-bold mb-2 ${textMain}`}>Hapus Transaksi?</h3>
                                <p className={`text-sm ${textSub}`}>Transaksi yang dihapus tidak dapat dikembalikan.</p>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setShowDeleteConfirm(null)} className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${isDark ? 'border-white/10 text-gray-300 hover:bg-white/5' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                                    Batal
                                </button>
                                <button onClick={() => handleDelete(showDeleteConfirm)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-red-500 to-rose-500 text-white hover:shadow-lg hover:shadow-red-500/30 transition-all">
                                    Hapus
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
