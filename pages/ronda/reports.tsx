import { motion, AnimatePresence } from 'framer-motion';
import {
    FaArrowLeft, FaCalendar, FaMapMarkerAlt, FaHome,
    FaClock, FaExclamationTriangle, FaFileAlt, FaPaperPlane,
    FaShieldAlt, FaFilter, FaChartBar
} from 'react-icons/fa';
import Head from 'next/head';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { useTheme } from '@/context/ThemeContext';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

// ── Types ──────────────────────────────────────────────────────────────
type ScheduleReport = {
    id: string;
    authorName: string;
    houseNo: string;
    content: string;
    timestamp: string;
    type: 'kejadian' | 'catatan';
};

type Schedule = {
    id: string;
    date: string;
    block: string;
    gang: string;
    shift: string;
    coordinator: string;
    coordinatorHouse: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    participants: { id: string; name: string; houseNo: string; gang: string; block: string; response: 'ikut' | 'tidak' | 'pending'; reason?: string }[];
    reports: ScheduleReport[];
};

// ── Data ───────────────────────────────────────────────────────────────
const blocks = ['Blok A', 'Blok B', 'Blok C', 'Blok D', 'Blok E'];

const initialSchedules: Schedule[] = [
    {
        id: '1', date: '2026-03-05', block: 'Blok A', gang: 'Gang 1', shift: 'Malam',
        coordinator: 'Budi Santoso', coordinatorHouse: 'No.14', status: 'scheduled',
        participants: [
            { id: 'p1', name: 'Budi Santoso', houseNo: 'No.14', gang: 'Gang 1', block: 'Blok A', response: 'ikut' },
            { id: 'p2', name: 'Agus Setiawan', houseNo: 'No.16', gang: 'Gang 1', block: 'Blok A', response: 'ikut' },
            { id: 'p3', name: 'Doni Kusuma', houseNo: 'No.18', gang: 'Gang 1', block: 'Blok A', response: 'pending' },
            { id: 'p4', name: 'Eko Prabowo', houseNo: 'No.20', gang: 'Gang 1', block: 'Blok A', response: 'tidak', reason: 'Sedang sakit, tidak bisa ikut malam ini' },
        ],
        reports: [],
    },
    {
        id: '2', date: '2026-03-05', block: 'Blok A', gang: 'Gang 2', shift: 'Malam',
        coordinator: 'Rudi Hartono', coordinatorHouse: 'No.25', status: 'scheduled',
        participants: [
            { id: 'p5', name: 'Rudi Hartono', houseNo: 'No.25', gang: 'Gang 2', block: 'Blok A', response: 'ikut' },
            { id: 'p6', name: 'Fajar Nugroho', houseNo: 'No.27', gang: 'Gang 2', block: 'Blok A', response: 'ikut' },
            { id: 'p7', name: 'Hendra Wijaya', houseNo: 'No.29', gang: 'Gang 2', block: 'Blok A', response: 'pending' },
        ],
        reports: [],
    },
    {
        id: '3', date: '2026-03-06', block: 'Blok A', gang: 'Semua Gang', shift: 'Malam',
        coordinator: 'Budi Santoso', coordinatorHouse: 'No.14', status: 'scheduled',
        participants: [
            { id: 'p8', name: 'Budi Santoso', houseNo: 'No.14', gang: 'Gang 1', block: 'Blok A', response: 'ikut' },
            { id: 'p9', name: 'Rudi Hartono', houseNo: 'No.25', gang: 'Gang 2', block: 'Blok A', response: 'ikut' },
            { id: 'p10', name: 'Surya Darma', houseNo: 'No.35', gang: 'Gang 3', block: 'Blok A', response: 'pending' },
            { id: 'p11', name: 'Doni Kusuma', houseNo: 'No.18', gang: 'Gang 1', block: 'Blok A', response: 'tidak', reason: 'Ada acara keluarga' },
            { id: 'p12', name: 'Hendra Wijaya', houseNo: 'No.29', gang: 'Gang 2', block: 'Blok A', response: 'ikut' },
        ],
        reports: [],
    },
    {
        id: '4', date: '2026-03-04', block: 'Blok B', gang: 'Gang 1', shift: 'Malam',
        coordinator: 'Siti Nurhaliza', coordinatorHouse: 'No.2', status: 'completed',
        participants: [
            { id: 'p13', name: 'Siti Nurhaliza', houseNo: 'No.2', gang: 'Gang 1', block: 'Blok B', response: 'ikut' },
            { id: 'p14', name: 'Rina Andani', houseNo: 'No.4', gang: 'Gang 1', block: 'Blok B', response: 'ikut' },
            { id: 'p15', name: 'Yanti Susilo', houseNo: 'No.6', gang: 'Gang 1', block: 'Blok B', response: 'ikut' },
            { id: 'p16', name: 'Dewi Lestari', houseNo: 'No.8', gang: 'Gang 1', block: 'Blok B', response: 'tidak', reason: 'Kerja shift malam di RS' },
        ],
        reports: [
            { id: 'r1', authorName: 'Siti Nurhaliza', houseNo: 'No.2', content: 'Ada orang tidak dikenal melintas di depan No.10 sekitar pukul 01:00. Sudah ditegur dan diarahkan keluar.', timestamp: '2026-03-04 01:15', type: 'kejadian' },
            { id: 'r2', authorName: 'Rina Andani', houseNo: 'No.4', content: 'Lampu jalan depan No.6 mati, perlu diganti.', timestamp: '2026-03-04 22:30', type: 'catatan' },
        ],
    },
    {
        id: '5', date: '2026-03-03', block: 'Blok C', gang: 'Gang 2', shift: 'Sore',
        coordinator: 'Ahmad Wijaya', coordinatorHouse: 'No.11', status: 'completed',
        participants: [
            { id: 'p17', name: 'Ahmad Wijaya', houseNo: 'No.11', gang: 'Gang 2', block: 'Blok C', response: 'ikut' },
            { id: 'p18', name: 'Bambang Sutrisno', houseNo: 'No.13', gang: 'Gang 2', block: 'Blok C', response: 'ikut' },
            { id: 'p19', name: 'Cahya Pratama', houseNo: 'No.15', gang: 'Gang 2', block: 'Blok C', response: 'ikut' },
        ],
        reports: [
            { id: 'r3', authorName: 'Ahmad Wijaya', houseNo: 'No.11', content: 'Situasi aman, tidak ada kejadian mencurigakan.', timestamp: '2026-03-03 23:00', type: 'catatan' },
        ],
    },
    {
        id: '6', date: '2026-03-02', block: 'Blok D', gang: 'Semua Gang', shift: 'Malam',
        coordinator: 'Dewi Sartika', coordinatorHouse: 'No.7', status: 'completed',
        participants: [
            { id: 'p20', name: 'Dewi Sartika', houseNo: 'No.7', gang: 'Gang 1', block: 'Blok D', response: 'ikut' },
            { id: 'p21', name: 'Gunawan Saputra', houseNo: 'No.22', gang: 'Gang 2', block: 'Blok D', response: 'ikut' },
            { id: 'p22', name: 'Irfan Ramadhan', houseNo: 'No.33', gang: 'Gang 3', block: 'Blok D', response: 'ikut' },
            { id: 'p23', name: 'Karno Santoso', houseNo: 'No.9', gang: 'Gang 1', block: 'Blok D', response: 'tidak', reason: 'Tugas kantor lembur' },
        ],
        reports: [
            { id: 'r4', authorName: 'Dewi Sartika', houseNo: 'No.7', content: 'Motor mencurigakan parkir lama di depan No.30, sudah dilaporkan ke keamanan.', timestamp: '2026-03-02 02:00', type: 'kejadian' },
        ],
    },
    {
        id: '7', date: '2026-03-01', block: 'Blok E', gang: 'Gang 1', shift: 'Malam',
        coordinator: 'Eko Prasetyo', coordinatorHouse: 'No.3', status: 'cancelled',
        participants: [
            { id: 'p24', name: 'Eko Prasetyo', houseNo: 'No.3', gang: 'Gang 1', block: 'Blok E', response: 'tidak', reason: 'Hujan deras dan banjir di area blok' },
            { id: 'p25', name: 'Lukman Hakim', houseNo: 'No.5', gang: 'Gang 1', block: 'Blok E', response: 'tidak', reason: 'Kondisi cuaca tidak memungkinkan' },
        ],
        reports: [],
    },
];

// ── Component ──────────────────────────────────────────────────────────
export default function RondaReports() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [filterBlock, setFilterBlock] = useState('all');
    const [filterType, setFilterType] = useState<'all' | 'kejadian' | 'catatan'>('all');

    // ── Computed Stats ─────────────────────────────────────────────
    const stats = useMemo(() => {
        const schedules = initialSchedules;

        const allReports = schedules.flatMap(s => s.reports.map(r => ({
            ...r,
            block: s.block,
            gang: s.gang,
            date: s.date,
            shift: s.shift,
            coordinator: s.coordinator,
        })));

        const totalReports = allReports.length;
        const totalKejadian = allReports.filter(r => r.type === 'kejadian').length;
        const totalCatatan = allReports.filter(r => r.type === 'catatan').length;

        // Categorize kejadian types from content
        const kejadianTypeMap: Record<string, { count: number; items: { content: string; block: string; gang: string; houseNo: string; date: string; authorName: string }[] }> = {};
        allReports.filter(r => r.type === 'kejadian').forEach(r => {
            const c = r.content.toLowerCase();
            let category = 'Lainnya';
            if (c.includes('orang') && (c.includes('tidak dikenal') || c.includes('mencurigakan') || c.includes('asing'))) category = 'Orang Mencurigakan';
            else if (c.includes('motor') || c.includes('mobil') || c.includes('kendaraan')) category = 'Kendaraan Mencurigakan';
            else if (c.includes('pencurian') || c.includes('maling') || c.includes('curi')) category = 'Pencurian';
            else if (c.includes('lampu') || c.includes('mati') || c.includes('rusak')) category = 'Fasilitas Rusak';
            else if (c.includes('kebakaran') || c.includes('api') || c.includes('asap')) category = 'Kebakaran';
            if (!kejadianTypeMap[category]) kejadianTypeMap[category] = { count: 0, items: [] };
            kejadianTypeMap[category].count += 1;
            kejadianTypeMap[category].items.push({
                content: r.content, block: r.block, gang: r.gang,
                houseNo: r.houseNo, date: r.date, authorName: r.authorName,
            });
        });
        const kejadianTypes = Object.entries(kejadianTypeMap)
            .map(([type, data]) => ({ type, count: data.count, items: data.items }))
            .sort((a, b) => b.count - a.count);

        // Recent reports timeline
        const recentReports = allReports
            .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
            .slice(0, 10);

        // Locations with kejadian
        const kejadianLocations: { block: string; gang: string; houseNos: string[]; count: number }[] = [];
        const locMap = new Map<string, { houseNos: Set<string>; count: number }>();
        allReports.filter(r => r.type === 'kejadian').forEach(r => {
            const key = `${r.block}|${r.gang}`;
            if (!locMap.has(key)) locMap.set(key, { houseNos: new Set(), count: 0 });
            const loc = locMap.get(key)!;
            loc.count++;
            const houseMatches = r.content.match(/No\.\d+/gi);
            if (houseMatches) houseMatches.forEach(h => loc.houseNos.add(h));
            if (r.houseNo && r.houseNo !== '-') loc.houseNos.add(r.houseNo);
        });
        locMap.forEach((val, key) => {
            const [block, gang] = key.split('|');
            kejadianLocations.push({ block, gang, houseNos: Array.from(val.houseNos), count: val.count });
        });
        kejadianLocations.sort((a, b) => b.count - a.count);

        // Reports per block for chart
        const reportsPerBlock = blocks.map(block => {
            const blockReports = allReports.filter(r => r.block === block);
            return {
                block,
                kejadian: blockReports.filter(r => r.type === 'kejadian').length,
                catatan: blockReports.filter(r => r.type === 'catatan').length,
            };
        });

        return {
            totalReports, totalKejadian, totalCatatan,
            kejadianTypes, recentReports, kejadianLocations, reportsPerBlock,
        };
    }, []);

    // Theme classes
    const cardClass = isDark
        ? 'bg-gradient-to-br from-[#181926]/80 via-[#231b2e]/80 to-[#2d1e3a]/80 border-white/10'
        : 'bg-white border-gray-200 shadow-sm';
    const textMain = isDark ? 'text-white' : 'text-gray-900';
    const textSub = isDark ? 'text-gray-400' : 'text-gray-500';
    const textMuted = isDark ? 'text-gray-300' : 'text-gray-600';
    const gridLineColor = isDark ? '#ffffff15' : '#e5e7eb';
    const tooltipBg = isDark ? '#1e1b2e' : '#ffffff';
    const tooltipBorder = isDark ? '#ffffff20' : '#e5e7eb';

    // Filtered reports
    const filteredReports = stats.recentReports.filter(r => {
        if (filterBlock !== 'all' && r.block !== filterBlock) return false;
        if (filterType !== 'all' && r.type !== filterType) return false;
        return true;
    });

    return (
        <>
            <Head><title>Laporan Ronda - Sistem Perumahan</title></Head>
            <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-[#0f0c1a] via-[#1a1625] to-[#0f0c1a]' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'} p-4 md:p-6 transition-colors duration-300`}>
                {/* Header */}
                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-wrap items-center justify-between gap-3 mb-6">
                    <div className="flex items-center gap-3">
                        <Link href="/ronda/schedule" className={`p-2 rounded-xl border ${isDark ? 'border-white/10 bg-white/5 hover:bg-white/10 text-white' : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'} transition`}>
                            <FaArrowLeft size={14} />
                        </Link>
                        <div>
                            <h1 className={`text-2xl md:text-3xl font-bold tracking-tight ${textMain}`}>
                                Laporan Ronda
                            </h1>
                            <p className={`text-xs mt-0.5 ${textMuted}`}>Ringkasan hasil ronda, kejadian, dan statistik lokasi</p>
                        </div>
                    </div>
                    <Link href="/ronda/schedule" className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition ${isDark ? 'border-white/10 bg-white/5 hover:bg-white/10 text-white' : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'}`}>
                        <FaCalendar size={12} /> Jadwal Ronda
                    </Link>
                </motion.div>

                {/* Stats Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {[
                        { label: 'Total Laporan', value: stats.totalReports, icon: <FaFileAlt className="text-blue-400" size={16} />, gradient: 'from-blue-400/15 to-cyan-400/15', border: isDark ? 'border-blue-400/20' : 'border-blue-200' },
                        { label: 'Kejadian', value: stats.totalKejadian, icon: <FaExclamationTriangle className="text-red-400" size={16} />, gradient: 'from-red-400/15 to-orange-400/15', border: isDark ? 'border-red-400/20' : 'border-red-200' },
                        { label: 'Catatan', value: stats.totalCatatan, icon: <FaPaperPlane className="text-emerald-400" size={16} />, gradient: 'from-emerald-400/15 to-green-400/15', border: isDark ? 'border-emerald-400/20' : 'border-emerald-200' },
                        { label: 'Lokasi Kejadian', value: stats.kejadianLocations.length, icon: <FaMapMarkerAlt className="text-purple-400" size={16} />, gradient: 'from-purple-400/15 to-pink-400/15', border: isDark ? 'border-purple-400/20' : 'border-purple-200' },
                    ].map((card, i) => (
                        <motion.div key={i} initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 + i * 0.05 }} whileHover={{ y: -2, scale: 1.01 }} className={`bg-gradient-to-br ${card.gradient} border ${card.border} rounded-xl p-4 backdrop-blur-md`}>
                            <div className="flex items-center gap-2 mb-2">{card.icon}<span className={`text-xs font-medium ${textMuted}`}>{card.label}</span></div>
                            <p className={`text-3xl font-bold ${textMain}`}>{card.value}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Chart: Laporan per Blok */}
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className={`border rounded-xl p-5 backdrop-blur-md ${cardClass} mb-6`}>
                    <div className="flex items-center gap-2 mb-4">
                        <FaChartBar className="text-blue-400" size={14} />
                        <h3 className={`text-base font-bold ${textMain}`}>Laporan per Blok</h3>
                    </div>
                    <div className="h-[260px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.reportsPerBlock} barGap={4}>
                                <CartesianGrid strokeDasharray="3 3" stroke={gridLineColor} />
                                <XAxis dataKey="block" tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 11 }} />
                                <YAxis allowDecimals={false} tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 11 }} />
                                <Tooltip contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 12, fontSize: 12 }} />
                                <Legend wrapperStyle={{ fontSize: 11, color: isDark ? '#d1d5db' : '#374151' }} />
                                <Bar dataKey="kejadian" name="Kejadian" fill="#ef4444" radius={[6, 6, 0, 0]} />
                                <Bar dataKey="catatan" name="Catatan" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Jenis Kejadian & Lokasi Kejadian */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
                    {/* Jenis Kejadian */}
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }} className={`border rounded-xl p-5 backdrop-blur-md ${cardClass} overflow-hidden relative group`}>
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className={`text-base font-bold ${textMain} flex items-center gap-2`}>
                                    <FaExclamationTriangle className="text-amber-400" size={14} />
                                    Jenis Kejadian
                                </h3>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${isDark ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                    {stats.kejadianTypes.length} kategori
                                </span>
                            </div>
                            {stats.kejadianTypes.length > 0 ? (
                                <div className="space-y-3">
                                    {stats.kejadianTypes.map((kt, idx) => {
                                        const catColors: Record<string, { bg: string; text: string; icon: string }> = {
                                            'Orang Mencurigakan': { bg: 'from-red-500/15 to-red-600/10', text: 'text-red-400', icon: '\ud83d\udc64' },
                                            'Kendaraan Mencurigakan': { bg: 'from-orange-500/15 to-orange-600/10', text: 'text-orange-400', icon: '\ud83c\udfcd\ufe0f' },
                                            'Pencurian': { bg: 'from-rose-500/15 to-rose-600/10', text: 'text-rose-400', icon: '\ud83d\udd12' },
                                            'Fasilitas Rusak': { bg: 'from-amber-500/15 to-amber-600/10', text: 'text-amber-400', icon: '\ud83d\udca1' },
                                            'Kebakaran': { bg: 'from-red-600/15 to-red-700/10', text: 'text-red-500', icon: '\ud83d\udd25' },
                                            'Lainnya': { bg: 'from-gray-500/15 to-gray-600/10', text: 'text-gray-400', icon: '\ud83d\udccb' },
                                        };
                                        const color = catColors[kt.type] || catColors['Lainnya'];
                                        const pct = stats.totalKejadian > 0 ? Math.round((kt.count / stats.totalKejadian) * 100) : 0;
                                        return (
                                            <motion.div key={kt.type} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 + idx * 0.08 }} className={`p-3 rounded-xl bg-gradient-to-r ${color.bg} border ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg">{color.icon}</span>
                                                        <span className={`text-sm font-semibold ${textMain}`}>{kt.type}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-xs font-bold ${color.text}`}>{kt.count}x</span>
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-200'} ${textMuted}`}>{pct}%</span>
                                                    </div>
                                                </div>
                                                <div className={`h-1.5 rounded-full mb-2 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                                                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, delay: 0.35 + idx * 0.1 }} className={`h-full rounded-full ${color.text.replace('text-', 'bg-')}`} />
                                                </div>
                                                <div className="space-y-1.5">
                                                    {kt.items.map((item, ii) => (
                                                        <div key={ii} className={`text-xs ${textMuted} flex items-start gap-2 pl-1`}>
                                                            <FaMapMarkerAlt className={`${color.text} mt-0.5 flex-shrink-0`} size={9} />
                                                            <div>
                                                                <span className={`font-medium ${textSub}`}>{item.block}, {item.gang}</span>
                                                                {item.houseNo !== '-' && <span className={textMuted}> ({item.houseNo})</span>}
                                                                <span className={textMuted}> &mdash; {item.content.length > 70 ? item.content.slice(0, 70) + '...' : item.content}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className={`flex flex-col items-center justify-center h-32 ${textMuted}`}>
                                    <FaShieldAlt className="text-emerald-400 mb-2" size={20} />
                                    <p className="text-sm">Tidak ada kejadian tercatat</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Lokasi Kejadian */}
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className={`border rounded-xl p-5 backdrop-blur-md ${cardClass} overflow-hidden relative group`}>
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className={`text-base font-bold ${textMain} flex items-center gap-2`}>
                                    <FaMapMarkerAlt className="text-purple-400" size={14} />
                                    Lokasi Kejadian
                                </h3>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${isDark ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                    Detail gang &amp; rumah
                                </span>
                            </div>
                            {stats.kejadianLocations.length > 0 ? (
                                <div className="space-y-3">
                                    {stats.kejadianLocations.map((loc, idx) => (
                                        <motion.div key={`${loc.block}-${loc.gang}`} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.35 + idx * 0.08 }} className={`p-4 rounded-xl border ${isDark ? 'bg-gradient-to-r from-purple-500/5 to-blue-500/5 border-white/5' : 'bg-gradient-to-r from-purple-50/50 to-blue-50/50 border-purple-100'}`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${loc.count >= 2 ? 'from-red-400/30 to-red-500/20' : 'from-amber-400/20 to-orange-400/20'}`}>
                                                        <FaMapMarkerAlt className={loc.count >= 2 ? 'text-red-400' : 'text-amber-400'} size={12} />
                                                    </div>
                                                    <div>
                                                        <p className={`text-sm font-bold ${textMain}`}>{loc.block}</p>
                                                        <p className={`text-xs ${textSub}`}>{loc.gang}</p>
                                                    </div>
                                                </div>
                                                <div className={`px-2.5 py-1 rounded-full text-xs font-bold ${loc.count >= 3 ? 'bg-red-500/20 text-red-400' : loc.count >= 2 ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                    {loc.count} kejadian
                                                </div>
                                            </div>
                                            {loc.houseNos.length > 0 && (
                                                <div className="mt-2">
                                                    <p className={`text-[10px] uppercase tracking-wider font-semibold mb-1.5 ${textMuted}`}>Rumah terkait</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {loc.houseNos.map((h, hi) => (
                                                            <motion.span key={hi} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 + hi * 0.05, type: 'spring', stiffness: 200 }} className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-medium ${isDark ? 'bg-purple-500/15 text-purple-300 border border-purple-400/20' : 'bg-purple-50 text-purple-600 border border-purple-200'}`}>
                                                                <FaHome size={8} /> {h}
                                                            </motion.span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className={`flex flex-col items-center justify-center h-32 ${textMuted}`}>
                                    <FaShieldAlt className="text-emerald-400 mb-2" size={20} />
                                    <p className="text-sm">Tidak ada lokasi kejadian</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Timeline Laporan Terbaru with Filters */}
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35 }} className={`border rounded-xl p-5 backdrop-blur-md ${cardClass} overflow-hidden relative group`}>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                            <h3 className={`text-base font-bold ${textMain} flex items-center gap-2`}>
                                <FaClock className="text-blue-400" size={14} />
                                Riwayat Laporan Terkini
                            </h3>
                            <div className="flex items-center gap-2">
                                <select value={filterBlock} onChange={e => setFilterBlock(e.target.value)} className={`text-xs px-2.5 py-1.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-purple-500/50 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                                    <option value="all" className={isDark ? 'bg-gray-800' : ''}>Semua Blok</option>
                                    {blocks.map(b => <option key={b} value={b} className={isDark ? 'bg-gray-800' : ''}>{b}</option>)}
                                </select>
                                <select value={filterType} onChange={e => setFilterType(e.target.value as 'all' | 'kejadian' | 'catatan')} className={`text-xs px-2.5 py-1.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-purple-500/50 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                                    <option value="all" className={isDark ? 'bg-gray-800' : ''}>Semua Tipe</option>
                                    <option value="kejadian" className={isDark ? 'bg-gray-800' : ''}>Kejadian</option>
                                    <option value="catatan" className={isDark ? 'bg-gray-800' : ''}>Catatan</option>
                                </select>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${isDark ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                    {filteredReports.length} laporan
                                </span>
                            </div>
                        </div>
                        {filteredReports.length > 0 ? (
                            <div className="relative">
                                <div className={`absolute left-[15px] top-2 bottom-2 w-px ${isDark ? 'bg-gradient-to-b from-blue-400/30 via-purple-400/20 to-transparent' : 'bg-gradient-to-b from-blue-300/50 via-purple-300/30 to-transparent'}`} />
                                <div className="space-y-4">
                                    <AnimatePresence mode="popLayout">
                                        {filteredReports.map((report, idx) => (
                                            <motion.div key={report.id} layout initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} transition={{ delay: idx * 0.04 }} className="flex items-start gap-4 relative">
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ delay: 0.1 + idx * 0.04, type: 'spring' }}
                                                    className={`w-[30px] h-[30px] rounded-full flex items-center justify-center flex-shrink-0 z-10 ${report.type === 'kejadian' ? 'bg-gradient-to-br from-red-400/30 to-orange-400/20 border-2 border-red-400/30' : 'bg-gradient-to-br from-blue-400/20 to-cyan-400/20 border-2 border-blue-400/20'}`}
                                                >
                                                    {report.type === 'kejadian' ? <FaExclamationTriangle className="text-red-400" size={10} /> : <FaFileAlt className="text-blue-400" size={10} />}
                                                </motion.div>
                                                <div className={`flex-1 p-3 rounded-xl border ${report.type === 'kejadian' ? (isDark ? 'bg-red-500/5 border-red-400/10' : 'bg-red-50/50 border-red-100') : (isDark ? 'bg-blue-500/5 border-blue-400/10' : 'bg-blue-50/50 border-blue-100')}`}>
                                                    <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-xs font-bold ${textMain}`}>{report.authorName}</span>
                                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${report.type === 'kejadian' ? 'bg-red-500/15 text-red-400' : 'bg-blue-500/15 text-blue-400'} font-semibold`}>
                                                                {report.type === 'kejadian' ? 'Kejadian' : 'Catatan'}
                                                            </span>
                                                        </div>
                                                        <span className={`text-[10px] ${textMuted}`}>{report.timestamp}</span>
                                                    </div>
                                                    <p className={`text-xs ${textSub} leading-relaxed`}>{report.content}</p>
                                                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                                                        <span className={`text-[10px] flex items-center gap-1 ${textMuted}`}><FaMapMarkerAlt size={8} /> {report.block}, {report.gang}</span>
                                                        {report.houseNo !== '-' && <span className={`text-[10px] flex items-center gap-1 ${textMuted}`}><FaHome size={8} /> {report.houseNo}</span>}
                                                        <span className={`text-[10px] flex items-center gap-1 ${textMuted}`}><FaClock size={8} /> {report.shift}</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>
                        ) : (
                            <div className={`flex flex-col items-center justify-center h-24 ${textMuted}`}>
                                <FaFilter className="mb-2 opacity-40" size={16} />
                                <p className="text-sm">Tidak ada laporan sesuai filter</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </>
    );
}
