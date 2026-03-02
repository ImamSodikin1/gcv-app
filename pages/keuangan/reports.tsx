import { motion } from 'framer-motion';
import { FaArrowLeft, FaChartBar, FaWallet, FaBalanceScale } from 'react-icons/fa';
import Head from 'next/head';
import Link from 'next/link';
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
    PieChart,
    Pie,
    Cell,
} from 'recharts';

const monthlyData = [
    { month: 'Sep', pemasukan: 12000000, pengeluaran: 8500000 },
    { month: 'Okt', pemasukan: 13500000, pengeluaran: 9000000 },
    { month: 'Nov', pemasukan: 11000000, pengeluaran: 10500000 },
    { month: 'Des', pemasukan: 15000000, pengeluaran: 12000000 },
    { month: 'Jan', pemasukan: 14000000, pengeluaran: 8000000 },
    { month: 'Feb', pemasukan: 12500000, pengeluaran: 9500000 },
];

const categoryData = [
    { name: 'Iuran Bulanan', value: 45000000 },
    { name: 'Keamanan', value: 12000000 },
    { name: 'Kebersihan', value: 8000000 },
    { name: 'Pemeliharaan', value: 15000000 },
    { name: 'Lainnya', value: 5000000 },
];

const PIE_COLORS = ['#818cf8', '#34d399', '#f59e0b', '#f87171', '#a78bfa'];

function formatCurrency(value: unknown) {
    return 'Rp ' + Number(value).toLocaleString('id-ID');
}

export default function FinancialReports() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const cardClass = isDark
        ? 'bg-gradient-to-br from-[#181926]/80 via-[#231b2e]/80 to-[#2d1e3a]/80 border-white/10'
        : 'bg-white border-gray-200 shadow-sm';
    const textMain = isDark ? 'text-white' : 'text-gray-900';
    const textSub = isDark ? 'text-gray-400' : 'text-gray-500';
    const textMuted = isDark ? 'text-gray-300' : 'text-gray-600';
    const gridLineColor = isDark ? '#ffffff15' : '#e5e7eb';
    const tooltipBg = isDark ? '#1e1b2e' : '#ffffff';
    const tooltipBorder = isDark ? '#ffffff20' : '#e5e7eb';

    return (
        <>
            <Head><title>Laporan Keuangan - Sistem Manajemen Perumahan</title></Head>
            <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-[#0f0f1a] via-[#1a0f2e] to-[#2d1e3a]' : 'bg-gray-50'}`}>
                <div className="pt-20 md:pt-6 px-4 md:px-8 pb-8">
                    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-5 flex items-center gap-3">
                        <Link href="/dashboard">
                            <motion.button whileHover={{ x: -4 }} className={`p-2 rounded-lg transition-colors ${isDark ? 'bg-white/10 hover:bg-white/20 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}>
                                <FaArrowLeft size={20} />
                            </motion.button>
                        </Link>
                        <div>
                            <h1 className={`text-4xl font-bold ${textMain}`}>Laporan Keuangan</h1>
                            <p className={textSub}>Ringkasan keuangan perumahan 6 bulan terakhir</p>
                        </div>
                    </motion.div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
                        {[
                            { label: 'Total Pemasukan', value: formatCurrency(78000000), color: 'text-emerald-400', bg: 'from-emerald-400/20 to-green-500/20', icon: <FaWallet /> },
                            { label: 'Total Pengeluaran', value: formatCurrency(57500000), color: 'text-red-400', bg: 'from-red-400/20 to-rose-500/20', icon: <FaChartBar /> },
                            { label: 'Saldo', value: formatCurrency(20500000), color: 'text-blue-400', bg: 'from-blue-400/20 to-indigo-500/20', icon: <FaBalanceScale /> },
                        ].map((c, i) => (
                            <motion.div key={i} whileHover={{ y: -3 }} className={`bg-gradient-to-br ${c.bg} border ${isDark ? 'border-white/10' : 'border-gray-200'} rounded-xl p-5`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={c.color}>{c.icon}</span>
                                    <p className={`text-sm ${textMuted}`}>{c.label}</p>
                                </div>
                                <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
                        {/* Bar Chart */}
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className={`border rounded-xl p-5 backdrop-blur-md ${cardClass} overflow-hidden relative group`}>
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <h2 className={`text-lg font-bold mb-4 ${textMain} relative z-10`}>Pemasukan vs Pengeluaran</h2>
                            <div className="h-64 relative z-10">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={monthlyData} barCategoryGap="20%">
                                        <defs>
                                            <linearGradient id="repBarIn" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#34d399" stopOpacity={1} />
                                                <stop offset="100%" stopColor="#059669" stopOpacity={0.8} />
                                            </linearGradient>
                                            <linearGradient id="repBarOut" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#f87171" stopOpacity={1} />
                                                <stop offset="100%" stopColor="#dc2626" stopOpacity={0.8} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke={gridLineColor} vertical={false} />
                                        <XAxis dataKey="month" stroke={isDark ? '#9ca3af' : '#6b7280'} fontSize={12} axisLine={false} tickLine={false} />
                                        <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} fontSize={12} tickFormatter={(v) => `${(Number(v) / 1000000).toFixed(0)}jt`} axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '12px', color: isDark ? '#fff' : '#111', boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.1)', padding: '12px 16px' }} formatter={(value: unknown) => formatCurrency(value)} cursor={{ fill: isDark ? '#ffffff08' : '#00000008' }} />
                                        <Legend iconType="circle" />
                                        <Bar dataKey="pemasukan" name="Pemasukan" fill="url(#repBarIn)" radius={[6, 6, 0, 0]} isAnimationActive={true} animationDuration={1200} animationEasing="ease-out" />
                                        <Bar dataKey="pengeluaran" name="Pengeluaran" fill="url(#repBarOut)" radius={[6, 6, 0, 0]} isAnimationActive={true} animationDuration={1200} animationEasing="ease-out" animationBegin={300} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        {/* Pie Chart */}
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className={`border rounded-xl p-5 backdrop-blur-md ${cardClass} overflow-hidden relative group`}>
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <h2 className={`text-lg font-bold mb-4 ${textMain} relative z-10`}>Distribusi Pengeluaran</h2>
                            <div className="h-64 relative z-10">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <defs>
                                            {PIE_COLORS.map((color, i) => (
                                                <linearGradient key={`repPie-${i}`} id={`repPie-${i}`} x1="0" y1="0" x2="1" y2="1">
                                                    <stop offset="0%" stopColor={color} stopOpacity={1} />
                                                    <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                                                </linearGradient>
                                            ))}
                                        </defs>
                                        <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={4} dataKey="value" stroke="none" isAnimationActive={true} animationDuration={1500} animationEasing="ease-out" animationBegin={200}>
                                            {categoryData.map((_, i) => (
                                                <Cell key={i} fill={`url(#repPie-${i})`} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '12px', color: isDark ? '#fff' : '#111', boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.1)', padding: '12px 16px' }} itemStyle={{ color: isDark ? '#e5e7eb' : '#374151' }} labelStyle={{ color: isDark ? '#fff' : '#111' }} formatter={(value: unknown) => formatCurrency(value)} />
                                        <Legend iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>
                    </div>

                    {/* Table */}
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className={`border rounded-xl overflow-hidden backdrop-blur-md ${cardClass}`}>
                        <div className="px-6 py-4 border-b ${isDark ? 'border-white/5' : 'border-gray-100'}">
                            <h2 className={`text-lg font-bold ${textMain}`}>Ringkasan Per Bulan</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm table-modern">
                                <thead>
                                    <tr className={isDark ? 'bg-white/5' : 'bg-gray-50'}>
                                        <th className={`text-left px-6 py-4 font-semibold ${textMuted}`}>Bulan</th>
                                        <th className={`text-right px-6 py-4 font-semibold ${textMuted}`}>Pemasukan</th>
                                        <th className={`text-right px-6 py-4 font-semibold ${textMuted}`}>Pengeluaran</th>
                                        <th className={`text-right px-6 py-4 font-semibold ${textMuted}`}>Selisih</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {monthlyData.map((row, i) => {
                                        const selisih = row.pemasukan - row.pengeluaran;
                                        return (
                                            <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className={`border-t ${isDark ? 'border-white/5 hover:bg-white/5' : 'border-gray-100 hover:bg-gray-50'} transition-colors`}>
                                                <td className={`px-6 py-4 font-medium ${textMain}`}>{row.month} 2026</td>
                                                <td className="px-6 py-4 text-right text-emerald-400">{formatCurrency(row.pemasukan)}</td>
                                                <td className="px-6 py-4 text-right text-red-400">{formatCurrency(row.pengeluaran)}</td>
                                                <td className={`px-6 py-4 text-right font-bold ${selisih >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                    {formatCurrency(selisih)}
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>
            </div>
        </>
    );
}
