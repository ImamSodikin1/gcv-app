import { motion } from 'framer-motion';
import {
    FaShieldAlt,
    FaMoneyBillWave,
    FaFileAlt,
    FaUsers,
    FaArrowUp,
} from 'react-icons/fa';
import Head from 'next/head';
import { useTheme } from '@/context/ThemeContext';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';

interface StatCard {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
}

// Data chart keuangan bulanan
const monthlyFinanceData = [
    { month: 'Sep', pemasukan: 12000000, pengeluaran: 7500000 },
    { month: 'Okt', pemasukan: 13500000, pengeluaran: 8000000 },
    { month: 'Nov', pemasukan: 11000000, pengeluaran: 9200000 },
    { month: 'Des', pemasukan: 16000000, pengeluaran: 10500000 },
    { month: 'Jan', pemasukan: 14000000, pengeluaran: 7800000 },
    { month: 'Feb', pemasukan: 15000000, pengeluaran: 8500000 },
];

// Data chart ronda per blok
const rondaPerBlockData = [
    { block: 'Blok A', selesai: 8, dijadwalkan: 2 },
    { block: 'Blok B', selesai: 6, dijadwalkan: 4 },
    { block: 'Blok C', selesai: 7, dijadwalkan: 3 },
    { block: 'Blok D', selesai: 5, dijadwalkan: 5 },
    { block: 'Blok E', selesai: 9, dijadwalkan: 1 },
];

// Data pie chart kategori pengeluaran
const expenseCategoryData = [
    { name: 'Keamanan', value: 3500000, color: '#f472b6' },
    { name: 'Maintenance', value: 2500000, color: '#818cf8' },
    { name: 'Kebersihan', value: 1500000, color: '#34d399' },
    { name: 'Listrik', value: 800000, color: '#fbbf24' },
    { name: 'Lainnya', value: 200000, color: '#60a5fa' },
];

// Data aktivitas terbaru
const recentActivities = [
    { title: 'Jadwal Ronda Diupdate', desc: 'Blok A - Shift malam', time: '2 jam lalu', color: 'from-pink-400 to-purple-400' },
    { title: 'Transaksi Baru', desc: 'Iuran bulanan Blok B', time: '3 jam lalu', color: 'from-green-400 to-emerald-400' },
    { title: 'Surat Edaran Diterbitkan', desc: 'Jadwal pembersihan area hijau', time: '5 jam lalu', color: 'from-blue-400 to-cyan-400' },
    { title: 'Pengguna Baru Terdaftar', desc: 'Ahmad - Blok C No.12', time: '1 hari lalu', color: 'from-yellow-400 to-orange-400' },
];

export default function Dashboard() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const stats: StatCard[] = [
        {
            title: 'Total Ronda',
            value: 24,
            icon: <FaShieldAlt size={32} />,
            color: 'text-blue-400',
            bgColor: 'from-blue-400/20 to-blue-500/20',
        },
        {
            title: 'Total Transaksi',
            value: 156,
            icon: <FaMoneyBillWave size={32} />,
            color: 'text-green-400',
            bgColor: 'from-green-400/20 to-emerald-500/20',
        },
        {
            title: 'Surat Edaran',
            value: 12,
            icon: <FaFileAlt size={32} />,
            color: 'text-purple-400',
            bgColor: 'from-purple-400/20 to-pink-500/20',
        },
        {
            title: 'Total Pengguna',
            value: 87,
            icon: <FaUsers size={32} />,
            color: 'text-pink-400',
            bgColor: 'from-pink-400/20 to-rose-500/20',
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: 'spring' as const, stiffness: 100 },
        },
    };

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
            <Head>
                <title>Dashboard - Sistem Manajemen Perumahan</title>
                <meta name="description" content="Dashboard Sistem Manajemen Perumahan" />
            </Head>

            <div className={`min-h-screen ${
                isDark
                    ? 'bg-gradient-to-br from-[#0f0f1a] via-[#1a0f2e] to-[#2d1e3a]'
                    : 'bg-gray-50'
            }`}>
                <div className="pt-20 md:pt-6 px-4 md:px-8 pb-8">
                    {/* Header */}
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="mb-8"
                    >
                        <h1 className="text-4xl md:text-5xl font-bold mb-2">
                            <span className="bg-gradient-to-r from-blue-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                                Dashboard
                            </span>
                        </h1>
                        <p className={`text-lg ${textSub}`}>Selamat datang di Sistem Manajemen Perumahan</p>
                    </motion.div>

                    {/* Stats Grid */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
                    >
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                whileHover={{ y: -5, scale: 1.02 }}
                                className={`bg-gradient-to-br ${stat.bgColor} border ${
                                    isDark ? 'border-white/10' : 'border-gray-200'
                                } rounded-xl p-6 backdrop-blur-md hover:border-white/20 transition-all duration-300 shadow-lg`}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`text-3xl font-bold ${textMain}`}>{stat.value}</div>
                                    <div className={`${stat.color} ${isDark ? 'bg-white/10' : 'bg-gray-100'} p-3 rounded-lg`}>
                                        {stat.icon}
                                    </div>
                                </div>
                                <p className={`text-sm font-medium ${textMuted}`}>{stat.title}</p>
                                <div className="mt-4 flex items-center gap-2">
                                    <FaArrowUp className="text-green-400" size={14} />
                                    <span className="text-xs text-green-400">+12% bulan ini</span>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Charts Row 1: Area Chart + Bar Chart */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5"
                    >
                        {/* Area Chart - Keuangan Bulanan */}
                        <div className={`border rounded-xl p-6 backdrop-blur-md ${cardClass} overflow-hidden relative group`}>
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <h2 className={`text-xl font-bold mb-6 ${textMain} relative z-10`}>Statistik Keuangan Bulanan</h2>
                            <div className="h-72 relative z-10">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={monthlyFinanceData}>
                                        <defs>
                                            <linearGradient id="colorPemasukan" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#34d399" stopOpacity={0.5} />
                                                <stop offset="50%" stopColor="#34d399" stopOpacity={0.15} />
                                                <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorPengeluaran" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#f472b6" stopOpacity={0.5} />
                                                <stop offset="50%" stopColor="#f472b6" stopOpacity={0.15} />
                                                <stop offset="100%" stopColor="#f472b6" stopOpacity={0} />
                                            </linearGradient>
                                            <filter id="glowGreen">
                                                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                                                <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                                            </filter>
                                            <filter id="glowPink">
                                                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                                                <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                                            </filter>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke={gridLineColor} vertical={false} />
                                        <XAxis dataKey="month" stroke={isDark ? '#9ca3af' : '#6b7280'} fontSize={12} axisLine={false} tickLine={false} />
                                        <YAxis
                                            stroke={isDark ? '#9ca3af' : '#6b7280'}
                                            fontSize={12}
                                            tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`}
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
                                                padding: '12px 16px',
                                            }}
                                            formatter={(value: unknown) => [`Rp ${Number(value).toLocaleString('id-ID')}`, '']}
                                            cursor={{ stroke: isDark ? '#ffffff20' : '#00000015', strokeWidth: 1 }}
                                        />
                                        <Legend iconType="circle" />
                                        <Area
                                            type="monotone"
                                            dataKey="pemasukan"
                                            name="Pemasukan"
                                            stroke="#34d399"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorPemasukan)"
                                            dot={{ r: 4, fill: '#34d399', strokeWidth: 2, stroke: isDark ? '#1e1b2e' : '#fff' }}
                                            activeDot={{ r: 6, fill: '#34d399', strokeWidth: 3, stroke: isDark ? '#1e1b2e' : '#fff', filter: 'url(#glowGreen)' }}
                                            isAnimationActive={true}
                                            animationDuration={1500}
                                            animationEasing="ease-in-out"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="pengeluaran"
                                            name="Pengeluaran"
                                            stroke="#f472b6"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorPengeluaran)"
                                            dot={{ r: 4, fill: '#f472b6', strokeWidth: 2, stroke: isDark ? '#1e1b2e' : '#fff' }}
                                            activeDot={{ r: 6, fill: '#f472b6', strokeWidth: 3, stroke: isDark ? '#1e1b2e' : '#fff', filter: 'url(#glowPink)' }}
                                            isAnimationActive={true}
                                            animationDuration={1800}
                                            animationEasing="ease-in-out"
                                            animationBegin={300}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Bar Chart - Ronda per Blok */}
                        <div className={`border rounded-xl p-6 backdrop-blur-md ${cardClass} overflow-hidden relative group`}>
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <h2 className={`text-xl font-bold mb-6 ${textMain} relative z-10`}>Ronda per Blok</h2>
                            <div className="h-72 relative z-10">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={rondaPerBlockData} barCategoryGap="20%">
                                        <defs>
                                            <linearGradient id="barSelesai" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#34d399" stopOpacity={1} />
                                                <stop offset="100%" stopColor="#059669" stopOpacity={0.8} />
                                            </linearGradient>
                                            <linearGradient id="barDijadwalkan" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#818cf8" stopOpacity={1} />
                                                <stop offset="100%" stopColor="#6366f1" stopOpacity={0.8} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke={gridLineColor} vertical={false} />
                                        <XAxis dataKey="block" stroke={isDark ? '#9ca3af' : '#6b7280'} fontSize={12} axisLine={false} tickLine={false} />
                                        <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} fontSize={12} axisLine={false} tickLine={false} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: tooltipBg,
                                                border: `1px solid ${tooltipBorder}`,
                                                borderRadius: '12px',
                                                color: isDark ? '#fff' : '#111',
                                                boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.1)',
                                                padding: '12px 16px',
                                            }}
                                            cursor={{ fill: isDark ? '#ffffff08' : '#00000008' }}
                                        />
                                        <Legend iconType="circle" />
                                        <Bar dataKey="selesai" name="Selesai" fill="url(#barSelesai)" radius={[6, 6, 0, 0]} isAnimationActive={true} animationDuration={1200} animationEasing="ease-out" />
                                        <Bar dataKey="dijadwalkan" name="Dijadwalkan" fill="url(#barDijadwalkan)" radius={[6, 6, 0, 0]} isAnimationActive={true} animationDuration={1200} animationEasing="ease-out" animationBegin={300} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </motion.div>

                    {/* Charts Row 2: Pie Chart + Aktivitas + Statistik Keuangan */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
                    >
                        {/* Pie Chart - Kategori Pengeluaran */}
                        <div className={`border rounded-xl p-6 backdrop-blur-md ${cardClass} overflow-hidden relative group`}>
                            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <h2 className={`text-xl font-bold mb-6 ${textMain} relative z-10`}>Kategori Pengeluaran</h2>
                            <div className="h-64 relative z-10">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <defs>
                                            {expenseCategoryData.map((entry, index) => (
                                                <linearGradient key={`pieGrad-${index}`} id={`pieGrad-${index}`} x1="0" y1="0" x2="1" y2="1">
                                                    <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                                                    <stop offset="100%" stopColor={entry.color} stopOpacity={0.7} />
                                                </linearGradient>
                                            ))}
                                            <filter id="pieShadow">
                                                <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.3"/>
                                            </filter>
                                        </defs>
                                        <Pie
                                            data={expenseCategoryData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={45}
                                            outerRadius={80}
                                            paddingAngle={4}
                                            dataKey="value"
                                            stroke="none"
                                            isAnimationActive={true}
                                            animationDuration={1500}
                                            animationEasing="ease-out"
                                            animationBegin={200}
                                        >
                                            {expenseCategoryData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={`url(#pieGrad-${index})`} style={{ filter: 'url(#pieShadow)' }} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: tooltipBg,
                                                border: `1px solid ${tooltipBorder}`,
                                                borderRadius: '12px',
                                                color: isDark ? '#fff' : '#111',
                                                boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.1)',
                                                padding: '12px 16px',
                                            }}
                                            itemStyle={{ color: isDark ? '#e5e7eb' : '#374151' }}
                                            labelStyle={{ color: isDark ? '#fff' : '#111' }}
                                            formatter={(value: unknown) => [`Rp ${Number(value).toLocaleString('id-ID')}`, '']}
                                        />
                                        <Legend iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Aktivitas Terbaru */}
                        <div className={`border rounded-xl p-6 backdrop-blur-md ${cardClass}`}>
                            <h2 className={`text-xl font-bold mb-6 ${textMain}`}>Aktivitas Terbaru</h2>
                            <div className="space-y-4">
                                {recentActivities.map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ x: -10, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.5 + i * 0.1 }}
                                        className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                                            isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${item.color} flex-shrink-0`} />
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-medium text-sm ${textMain}`}>{item.title}</p>
                                            <p className={`text-xs ${textSub} truncate`}>{item.desc}</p>
                                            <p className={`text-xs mt-1 ${textSub}`}>{item.time}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Statistik Keuangan Summary */}
                        <div className={`border rounded-xl p-6 backdrop-blur-md ${cardClass}`}>
                            <h2 className={`text-xl font-bold mb-6 ${textMain}`}>Ringkasan Keuangan</h2>
                            <div className="space-y-4">
                                <div className={`flex justify-between items-center p-4 rounded-lg ${
                                    isDark ? 'bg-white/5' : 'bg-gray-50'
                                }`}>
                                    <span className={textMuted}>Total Pemasukan</span>
                                    <span className="text-green-400 font-bold">Rp 15.000.000</span>
                                </div>
                                <div className={`flex justify-between items-center p-4 rounded-lg ${
                                    isDark ? 'bg-white/5' : 'bg-gray-50'
                                }`}>
                                    <span className={textMuted}>Total Pengeluaran</span>
                                    <span className="text-red-400 font-bold">Rp 8.500.000</span>
                                </div>
                                <div className={`flex justify-between items-center p-4 rounded-lg ${
                                    isDark ? 'bg-white/5' : 'bg-gray-50'
                                }`}>
                                    <span className={textMuted}>Saldo</span>
                                    <span className="text-blue-400 font-bold">Rp 6.500.000</span>
                                </div>
                                <div className={`mt-4 p-4 rounded-lg border ${
                                    isDark
                                        ? 'bg-gradient-to-r from-green-400/10 to-blue-400/10 border-green-400/20'
                                        : 'bg-gradient-to-r from-green-50 to-blue-50 border-green-200'
                                }`}>
                                    <p className={`text-xs ${textSub} mb-1`}>Rasio Pemasukan/Pengeluaran</p>
                                    <p className="text-2xl font-bold text-green-400">1.76x</p>
                                    <div className="mt-2 w-full bg-white/10 rounded-full h-2">
                                        <div className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full" style={{ width: '76%' }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </>
    );
}
