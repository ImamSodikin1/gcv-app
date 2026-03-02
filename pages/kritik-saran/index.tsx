import { motion, AnimatePresence } from 'framer-motion';
import {
    FaArrowLeft, FaPlus, FaTimes, FaSearch, FaUser, FaHome, FaClock,
    FaExclamationTriangle, FaCheckCircle, FaLightbulb, FaTools, FaShieldAlt,
    FaMoneyBillWave, FaLeaf, FaVolumeUp, FaRoad, FaHandshake,
    FaPaperPlane, FaFilter, FaThumbsUp, FaCommentDots,
    FaStar, FaFlag, FaPen
} from 'react-icons/fa';
import Head from 'next/head';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { useTheme } from '@/context/ThemeContext';

// ── Types ──────────────────────────────────────────────────────────────
type KritikSaran = {
    id: string;
    pengirim: string;
    houseNo: string;
    block: string;
    gang: string;
    kategori: string;
    judul: string;
    isi: string;
    jenis: 'kritik' | 'saran';
    status: 'baru' | 'diproses' | 'selesai' | 'ditolak';
    prioritas: 'rendah' | 'sedang' | 'tinggi';
    tanggal: string;
    balasan?: string;
    upvotes: number;
};

type Kategori = {
    id: string;
    label: string;
    icon: React.ReactNode;
    color: string;
    bgGradient: string;
    borderColor: string;
    description: string;
};

// ── Kategori Data ──────────────────────────────────────────────────────
const kategoriList: Kategori[] = [
    { id: 'keamanan', label: 'Keamanan & Ronda', icon: <FaShieldAlt size={14} />, color: 'text-red-400', bgGradient: 'from-red-400/15 to-rose-500/15', borderColor: 'border-red-400/20', description: 'Jadwal ronda, pos keamanan, CCTV, penerangan' },
    { id: 'kebersihan', label: 'Kebersihan & Lingkungan', icon: <FaLeaf size={14} />, color: 'text-emerald-400', bgGradient: 'from-emerald-400/15 to-green-500/15', borderColor: 'border-emerald-400/20', description: 'Sampah, taman, saluran air, penghijauan' },
    { id: 'infrastruktur', label: 'Infrastruktur & Fasilitas', icon: <FaTools size={14} />, color: 'text-amber-400', bgGradient: 'from-amber-400/15 to-yellow-500/15', borderColor: 'border-amber-400/20', description: 'Jalan, pagar, gapura, fasilitas umum, lampu jalan' },
    { id: 'keuangan', label: 'Keuangan & Iuran', icon: <FaMoneyBillWave size={14} />, color: 'text-blue-400', bgGradient: 'from-blue-400/15 to-cyan-500/15', borderColor: 'border-blue-400/20', description: 'Iuran bulanan, transparansi keuangan, penggunaan dana' },
    { id: 'ketertiban', label: 'Ketertiban & Kebisingan', icon: <FaVolumeUp size={14} />, color: 'text-orange-400', bgGradient: 'from-orange-400/15 to-amber-500/15', borderColor: 'border-orange-400/20', description: 'Kebisingan, parkir liar, hewan peliharaan, aturan warga' },
    { id: 'jalan', label: 'Jalan & Drainase', icon: <FaRoad size={14} />, color: 'text-purple-400', bgGradient: 'from-purple-400/15 to-violet-500/15', borderColor: 'border-purple-400/20', description: 'Jalan berlubang, selokan, banjir, gorong-gorong' },
    { id: 'sosial', label: 'Kegiatan Sosial', icon: <FaHandshake size={14} />, color: 'text-pink-400', bgGradient: 'from-pink-400/15 to-rose-500/15', borderColor: 'border-pink-400/20', description: 'Kerja bakti, acara 17 Agustus, arisan, pengajian' },
    { id: 'pelayanan', label: 'Pelayanan Pengurus', icon: <FaStar size={14} />, color: 'text-cyan-400', bgGradient: 'from-cyan-400/15 to-blue-500/15', borderColor: 'border-cyan-400/20', description: 'Responsivitas pengurus, surat pengantar, pelayanan administrasi' },
];

// ── Sample Data ────────────────────────────────────────────────────────
const initialData: KritikSaran[] = [
    {
        id: 'ks1', pengirim: 'Agus Setiawan', houseNo: 'No.16', block: 'Blok A', gang: 'Gang 1',
        kategori: 'keamanan', judul: 'Lampu jalan Gang 1 sering mati', jenis: 'kritik',
        isi: 'Lampu jalan di Gang 1 Blok A sering mati terutama di malam hari. Hal ini membuat area gelap dan rawan kejahatan. Mohon segera diperbaiki karena sudah dikeluhkan beberapa kali.',
        status: 'diproses', prioritas: 'tinggi', tanggal: '2026-02-28', upvotes: 12,
        balasan: 'Terima kasih atas laporannya. Kami sudah menghubungi teknisi untuk perbaikan minggu depan.',
    },
    {
        id: 'ks2', pengirim: 'Dewi Lestari', houseNo: 'No.8', block: 'Blok B', gang: 'Gang 1',
        kategori: 'kebersihan', judul: 'Saran: program komposting warga', jenis: 'saran',
        isi: 'Saya menyarankan agar RT mengadakan program komposting bersama untuk mengurangi sampah organik. Bisa dimulai dengan menyediakan tong khusus di setiap blok.',
        status: 'baru', prioritas: 'sedang', tanggal: '2026-03-01', upvotes: 8,
    },
    {
        id: 'ks3', pengirim: 'Rudi Hartono', houseNo: 'No.25', block: 'Blok A', gang: 'Gang 2',
        kategori: 'infrastruktur', judul: 'Pagar perumahan perlu diperbaiki', jenis: 'kritik',
        isi: 'Pagar di sisi timur perumahan sudah banyak yang rusak dan berkarat. Beberapa bagian sudah bisa dilalui orang dari luar. Ini mengancam keamanan perumahan.',
        status: 'diproses', prioritas: 'tinggi', tanggal: '2026-02-25', upvotes: 15,
        balasan: 'Sudah dimasukkan dalam anggaran perbaikan. Estimasi pengerjaan bulan depan.',
    },
    {
        id: 'ks4', pengirim: 'Cahya Pratama', houseNo: 'No.15', block: 'Blok C', gang: 'Gang 2',
        kategori: 'keuangan', judul: 'Transparansi laporan keuangan', jenis: 'saran',
        isi: 'Mohon agar laporan keuangan RT ditampilkan setiap bulan melalui sistem ini atau grup WhatsApp, agar semua warga bisa melihat pemasukan dan pengeluaran secara transparan.',
        status: 'selesai', prioritas: 'sedang', tanggal: '2026-02-20', upvotes: 20,
        balasan: 'Sudah diterapkan. Laporan keuangan bulanan sekarang bisa dilihat di menu Keuangan.',
    },
    {
        id: 'ks5', pengirim: 'Eko Prasetyo', houseNo: 'No.3', block: 'Blok E', gang: 'Gang 1',
        kategori: 'jalan', judul: 'Jalan berlubang di depan Blok E', jenis: 'kritik',
        isi: 'Jalan utama di depan Blok E banyak lubang besar yang sudah lama tidak diperbaiki. Saat hujan lubang tergenang air dan berbahaya untuk kendaraan.',
        status: 'baru', prioritas: 'tinggi', tanggal: '2026-03-02', upvotes: 18,
    },
    {
        id: 'ks6', pengirim: 'Bambang Sutrisno', houseNo: 'No.13', block: 'Blok C', gang: 'Gang 2',
        kategori: 'ketertiban', judul: 'Kebisingan dari rumah No.17 saat malam', jenis: 'kritik',
        isi: 'Sering terdengar suara musik keras dari rumah No.17 setelah pukul 22:00. Sudah ditegur langsung tapi tidak ada perubahan. Mohon pengurus menindaklanjuti.',
        status: 'diproses', prioritas: 'sedang', tanggal: '2026-02-27', upvotes: 6,
    },
    {
        id: 'ks7', pengirim: 'Maya Sari', houseNo: 'No.12', block: 'Blok B', gang: 'Gang 2',
        kategori: 'sosial', judul: 'Saran: adakan kerja bakti bulanan', jenis: 'saran',
        isi: 'Usul untuk mengadakan kerja bakti rutin sebulan sekali agar lingkungan perumahan tetap bersih dan warga makin kompak. Bisa digabung dengan acara makan bersama.',
        status: 'selesai', prioritas: 'rendah', tanggal: '2026-02-15', upvotes: 25,
        balasan: 'Ide sangat baik! Kerja bakti bulanan akan dimulai setiap Minggu pertama tiap bulan.',
    },
    {
        id: 'ks8', pengirim: 'Karno Santoso', houseNo: 'No.9', block: 'Blok D', gang: 'Gang 1',
        kategori: 'pelayanan', judul: 'Proses surat pengantar terlalu lama', jenis: 'kritik',
        isi: 'Pengajuan surat pengantar RT memakan waktu hingga 3 hari. Mohon prosesnya dipercepat karena sering dibutuhkan mendesak untuk keperluan administrasi.',
        status: 'selesai', prioritas: 'sedang', tanggal: '2026-02-18', upvotes: 10,
        balasan: 'Kami sudah memperbaiki proses surat pengantar. Sekarang bisa selesai dalam 1 hari kerja.',
    },
];

// ── Component ──────────────────────────────────────────────────────────
export default function KritikSaranPage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [data, setData] = useState<KritikSaran[]>(initialData);
    const [showForm, setShowForm] = useState(false);
    const [selectedItem, setSelectedItem] = useState<KritikSaran | null>(null);
    const [search, setSearch] = useState('');
    const [filterKategori, setFilterKategori] = useState('all');
    const [filterJenis, setFilterJenis] = useState<'all' | 'kritik' | 'saran'>('all');
    const [filterStatus, setFilterStatus] = useState('all');

    // Form state
    const [form, setForm] = useState({
        pengirim: '', houseNo: '', block: 'Blok A', gang: 'Gang 1',
        kategori: 'keamanan', judul: '', isi: '', jenis: 'saran' as 'kritik' | 'saran',
        prioritas: 'sedang' as 'rendah' | 'sedang' | 'tinggi',
    });

    const cardClass = isDark
        ? 'bg-gradient-to-br from-[#181926]/80 via-[#231b2e]/80 to-[#2d1e3a]/80 border-white/10'
        : 'bg-white border-gray-200 shadow-sm';
    const textMain = isDark ? 'text-white' : 'text-gray-900';
    const textSub = isDark ? 'text-gray-400' : 'text-gray-500';
    const textMuted = isDark ? 'text-gray-300' : 'text-gray-600';
    const inputCls = `w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'}`;
    const optionCls = isDark ? 'bg-gray-800 text-white' : '';

    // Stats
    const stats = useMemo(() => {
        const total = data.length;
        const kritik = data.filter(d => d.jenis === 'kritik').length;
        const saran = data.filter(d => d.jenis === 'saran').length;
        const baru = data.filter(d => d.status === 'baru').length;
        const diproses = data.filter(d => d.status === 'diproses').length;
        const selesai = data.filter(d => d.status === 'selesai').length;
        const perKategori = kategoriList.map(k => ({
            ...k,
            count: data.filter(d => d.kategori === k.id).length,
        })).filter(k => k.count > 0).sort((a, b) => b.count - a.count);
        return { total, kritik, saran, baru, diproses, selesai, perKategori };
    }, [data]);

    // Filtered data
    const filtered = useMemo(() => {
        return data.filter(d => {
            if (search && !d.judul.toLowerCase().includes(search.toLowerCase()) && !d.isi.toLowerCase().includes(search.toLowerCase()) && !d.pengirim.toLowerCase().includes(search.toLowerCase())) return false;
            if (filterKategori !== 'all' && d.kategori !== filterKategori) return false;
            if (filterJenis !== 'all' && d.jenis !== filterJenis) return false;
            if (filterStatus !== 'all' && d.status !== filterStatus) return false;
            return true;
        }).sort((a, b) => b.tanggal.localeCompare(a.tanggal));
    }, [data, search, filterKategori, filterJenis, filterStatus]);

    const handleSubmit = () => {
        if (!form.pengirim || !form.judul || !form.isi) return;
        const newItem: KritikSaran = {
            id: `ks${Date.now()}`,
            ...form,
            status: 'baru',
            tanggal: new Date().toISOString().split('T')[0],
            upvotes: 0,
        };
        setData(prev => [newItem, ...prev]);
        setShowForm(false);
        setForm({ pengirim: '', houseNo: '', block: 'Blok A', gang: 'Gang 1', kategori: 'keamanan', judul: '', isi: '', jenis: 'saran', prioritas: 'sedang' });
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'baru': return { bg: 'bg-blue-500/15', text: 'text-blue-400', label: 'Baru' };
            case 'diproses': return { bg: 'bg-amber-500/15', text: 'text-amber-400', label: 'Diproses' };
            case 'selesai': return { bg: 'bg-emerald-500/15', text: 'text-emerald-400', label: 'Selesai' };
            case 'ditolak': return { bg: 'bg-red-500/15', text: 'text-red-400', label: 'Ditolak' };
            default: return { bg: 'bg-gray-500/15', text: 'text-gray-400', label: status };
        }
    };

    const getPrioritasStyle = (p: string) => {
        switch (p) {
            case 'tinggi': return { bg: 'bg-red-500/15', text: 'text-red-400', label: 'Tinggi' };
            case 'sedang': return { bg: 'bg-amber-500/15', text: 'text-amber-400', label: 'Sedang' };
            case 'rendah': return { bg: 'bg-blue-500/15', text: 'text-blue-400', label: 'Rendah' };
            default: return { bg: 'bg-gray-500/15', text: 'text-gray-400', label: p };
        }
    };

    const getKategori = (id: string) => kategoriList.find(k => k.id === id);

    return (
        <>
            <Head><title>Kritik & Saran - Sistem Perumahan</title></Head>
            <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-[#0f0c1a] via-[#1a1625] to-[#0f0c1a]' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'} p-4 md:p-6 transition-colors duration-300`}>

                {/* Header */}
                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-wrap items-center justify-between gap-3 mb-6">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard" className={`p-2 rounded-xl border ${isDark ? 'border-white/10 bg-white/5 hover:bg-white/10 text-white' : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'} transition`}>
                            <FaArrowLeft size={14} />
                        </Link>
                        <div>
                            <h1 className={`text-2xl md:text-3xl font-bold tracking-tight ${textMain}`}>Kritik & Saran</h1>
                            <p className={`text-xs mt-0.5 ${textMuted}`}>Sampaikan masukan untuk kemajuan perumahan</p>
                        </div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition"
                    >
                        <FaPlus size={12} /> Tulis Baru
                    </motion.button>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                    {[
                        { label: 'Total', value: stats.total, icon: <FaCommentDots className="text-purple-400" size={14} />, gradient: 'from-purple-400/15 to-violet-500/15', border: isDark ? 'border-purple-400/20' : 'border-purple-200' },
                        { label: 'Kritik', value: stats.kritik, icon: <FaExclamationTriangle className="text-red-400" size={14} />, gradient: 'from-red-400/15 to-rose-500/15', border: isDark ? 'border-red-400/20' : 'border-red-200' },
                        { label: 'Saran', value: stats.saran, icon: <FaLightbulb className="text-amber-400" size={14} />, gradient: 'from-amber-400/15 to-yellow-500/15', border: isDark ? 'border-amber-400/20' : 'border-amber-200' },
                        { label: 'Baru', value: stats.baru, icon: <FaFlag className="text-blue-400" size={14} />, gradient: 'from-blue-400/15 to-cyan-500/15', border: isDark ? 'border-blue-400/20' : 'border-blue-200' },
                        { label: 'Diproses', value: stats.diproses, icon: <FaClock className="text-orange-400" size={14} />, gradient: 'from-orange-400/15 to-amber-500/15', border: isDark ? 'border-orange-400/20' : 'border-orange-200' },
                        { label: 'Selesai', value: stats.selesai, icon: <FaCheckCircle className="text-emerald-400" size={14} />, gradient: 'from-emerald-400/15 to-green-500/15', border: isDark ? 'border-emerald-400/20' : 'border-emerald-200' },
                    ].map((card, i) => (
                        <motion.div key={i} initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 + i * 0.04 }} whileHover={{ y: -2, scale: 1.02 }} className={`bg-gradient-to-br ${card.gradient} border ${card.border} rounded-xl p-3 backdrop-blur-md`}>
                            <div className="flex items-center gap-1.5 mb-1">{card.icon}<span className={`text-[10px] font-medium ${textMuted}`}>{card.label}</span></div>
                            <p className={`text-2xl font-bold ${textMain}`}>{card.value}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Kategori Overview */}
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }} className={`border rounded-xl p-4 backdrop-blur-md ${cardClass} mb-6`}>
                    <h3 className={`text-sm font-bold ${textMain} mb-3 flex items-center gap-2`}>
                        <FaFilter className="text-purple-400" size={12} /> Kategori Masukan
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {kategoriList.map((k, i) => {
                            const count = data.filter(d => d.kategori === k.id).length;
                            return (
                                <motion.button
                                    key={k.id}
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.2 + i * 0.03 }}
                                    whileHover={{ scale: 1.03 }}
                                    onClick={() => setFilterKategori(filterKategori === k.id ? 'all' : k.id)}
                                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${filterKategori === k.id ? `bg-gradient-to-r ${k.bgGradient} ${k.borderColor} ring-1 ring-purple-400/30` : `${isDark ? 'border-white/5 hover:border-white/10 bg-white/[0.02]' : 'border-gray-100 hover:border-gray-200 bg-gray-50/50'}`}`}
                                >
                                    <span className={`${k.color} flex-shrink-0`}>{k.icon}</span>
                                    <div className="min-w-0 flex-1">
                                        <p className={`text-[11px] font-semibold ${textMain} truncate`}>{k.label}</p>
                                        <p className={`text-[10px] ${textSub}`}>{count} masukan</p>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Search + Filters */}
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-wrap gap-3 mb-5">
                    <div className="relative flex-1 min-w-[200px]">
                        <FaSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${textSub}`} size={12} />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari kritik atau saran..." className={`${inputCls} pl-9`} />
                    </div>
                    <select value={filterJenis} onChange={e => setFilterJenis(e.target.value as 'all' | 'kritik' | 'saran')} className={`px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}>
                        <option value="all" className={optionCls}>Semua Jenis</option>
                        <option value="kritik" className={optionCls}>Kritik</option>
                        <option value="saran" className={optionCls}>Saran</option>
                    </select>
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={`px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}>
                        <option value="all" className={optionCls}>Semua Status</option>
                        <option value="baru" className={optionCls}>Baru</option>
                        <option value="diproses" className={optionCls}>Diproses</option>
                        <option value="selesai" className={optionCls}>Selesai</option>
                        <option value="ditolak" className={optionCls}>Ditolak</option>
                    </select>
                </motion.div>

                {/* Results count */}
                <p className={`text-xs ${textMuted} mb-4`}>Menampilkan {filtered.length} dari {data.length} masukan</p>

                {/* List */}
                <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                        {filtered.map((item, idx) => {
                            const kat = getKategori(item.kategori);
                            const statusStyle = getStatusStyle(item.status);
                            const prioStyle = getPrioritasStyle(item.prioritas);
                            return (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -20, opacity: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    whileHover={{ x: 4 }}
                                    onClick={() => setSelectedItem(item)}
                                    className={`border rounded-xl p-4 backdrop-blur-md cursor-pointer ${cardClass} relative group overflow-hidden`}
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-r ${kat?.bgGradient || 'from-gray-400/5 to-gray-500/5'} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                                    <div className="relative z-10">
                                        {/* Top Row */}
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <div className="flex items-center gap-2.5">
                                                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${item.jenis === 'kritik' ? 'from-red-400/20 to-rose-500/20' : 'from-amber-400/20 to-yellow-500/20'} flex items-center justify-center flex-shrink-0`}>
                                                    {item.jenis === 'kritik' ? <FaExclamationTriangle className="text-red-400" size={14} /> : <FaLightbulb className="text-amber-400" size={14} />}
                                                </div>
                                                <div>
                                                    <h3 className={`text-sm font-bold ${textMain} line-clamp-1`}>{item.judul}</h3>
                                                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${item.jenis === 'kritik' ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400'} font-semibold`}>
                                                            {item.jenis === 'kritik' ? 'Kritik' : 'Saran'}
                                                        </span>
                                                        {kat && (
                                                            <span className={`text-[10px] flex items-center gap-1 ${kat.color}`}>
                                                                {kat.icon} {kat.label}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${prioStyle.bg} ${prioStyle.text}`}>{prioStyle.label}</span>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${statusStyle.bg} ${statusStyle.text}`}>{statusStyle.label}</span>
                                            </div>
                                        </div>

                                        {/* Content preview */}
                                        <p className={`text-xs ${textSub} line-clamp-2 mb-2.5 pl-[46px]`}>{item.isi}</p>

                                        {/* Footer */}
                                        <div className="flex items-center justify-between pl-[46px] flex-wrap gap-2">
                                            <div className="flex items-center gap-3">
                                                <span className={`text-[10px] flex items-center gap-1 ${textMuted}`}><FaUser size={8} /> {item.pengirim}</span>
                                                <span className={`text-[10px] flex items-center gap-1 ${textMuted}`}><FaHome size={8} /> {item.houseNo}, {item.block}</span>
                                                <span className={`text-[10px] flex items-center gap-1 ${textMuted}`}><FaClock size={8} /> {item.tanggal}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] flex items-center gap-1 ${textMuted}`}><FaThumbsUp size={8} /> {item.upvotes}</span>
                                                {item.balasan && <span className={`text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold`}>Dibalas</span>}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                    {filtered.length === 0 && (
                        <div className={`flex flex-col items-center justify-center py-16 ${textMuted}`}>
                            <FaCommentDots className="mb-3 opacity-30" size={32} />
                            <p className="text-sm">Tidak ada masukan ditemukan</p>
                            <p className="text-xs mt-1">Coba ubah filter atau tulis masukan baru</p>
                        </div>
                    )}
                </div>

                {/* ── Detail Modal ──────────────────────────────── */}
                <AnimatePresence>
                    {selectedItem && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedItem(null)}>
                            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} onClick={e => e.stopPropagation()} className={`w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border ${cardClass} p-5`} style={{ scrollbarWidth: 'thin', scrollbarColor: isDark ? '#ffffff20 transparent' : '#d1d5db transparent' }}>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${selectedItem.jenis === 'kritik' ? 'from-red-400/20 to-rose-500/20' : 'from-amber-400/20 to-yellow-500/20'} flex items-center justify-center`}>
                                            {selectedItem.jenis === 'kritik' ? <FaExclamationTriangle className="text-red-400" size={16} /> : <FaLightbulb className="text-amber-400" size={16} />}
                                        </div>
                                        <div>
                                            <h2 className={`text-base font-bold ${textMain}`}>{selectedItem.judul}</h2>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                {(() => { const kat = getKategori(selectedItem.kategori); return kat ? <span className={`text-[10px] flex items-center gap-1 ${kat.color}`}>{kat.icon} {kat.label}</span> : null; })()}
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedItem(null)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}><FaTimes size={14} /></button>
                                </div>

                                {/* Badges */}
                                <div className="flex items-center gap-2 flex-wrap mb-4">
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${selectedItem.jenis === 'kritik' ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400'}`}>
                                        {selectedItem.jenis === 'kritik' ? 'Kritik' : 'Saran'}
                                    </span>
                                    {(() => { const s = getStatusStyle(selectedItem.status); return <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${s.bg} ${s.text}`}>{s.label}</span>; })()}
                                    {(() => { const p = getPrioritasStyle(selectedItem.prioritas); return <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${p.bg} ${p.text}`}>Prioritas: {p.label}</span>; })()}
                                    <span className={`text-[10px] flex items-center gap-1 ${textMuted}`}><FaThumbsUp size={8} /> {selectedItem.upvotes} dukungan</span>
                                </div>

                                {/* Content */}
                                <div className={`p-3 rounded-xl mb-4 ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                                    <p className={`text-sm leading-relaxed ${textMain}`}>{selectedItem.isi}</p>
                                </div>

                                {/* Sender Info */}
                                <div className={`grid grid-cols-2 gap-3 mb-4`}>
                                    <div className={`flex items-center gap-2.5 p-2.5 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                                        <FaUser className="text-purple-400 flex-shrink-0" size={12} />
                                        <div>
                                            <p className={`text-[10px] ${textSub}`}>Pengirim</p>
                                            <p className={`text-xs font-medium ${textMain}`}>{selectedItem.pengirim}</p>
                                        </div>
                                    </div>
                                    <div className={`flex items-center gap-2.5 p-2.5 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                                        <FaHome className="text-blue-400 flex-shrink-0" size={12} />
                                        <div>
                                            <p className={`text-[10px] ${textSub}`}>Alamat</p>
                                            <p className={`text-xs font-medium ${textMain}`}>{selectedItem.houseNo}, {selectedItem.block} {selectedItem.gang}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Reply */}
                                {selectedItem.balasan && (
                                    <div className={`p-3 rounded-xl border ${isDark ? 'bg-emerald-500/5 border-emerald-400/10' : 'bg-emerald-50 border-emerald-100'}`}>
                                        <p className={`text-[10px] uppercase tracking-wider font-semibold mb-1.5 text-emerald-400`}>Balasan Pengurus</p>
                                        <p className={`text-xs leading-relaxed ${textMain}`}>{selectedItem.balasan}</p>
                                    </div>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Form Modal ──────────────────────────────────── */}
                <AnimatePresence>
                    {showForm && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
                            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} onClick={e => e.stopPropagation()} className={`w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border ${cardClass} p-5`} style={{ scrollbarWidth: 'thin', scrollbarColor: isDark ? '#ffffff20 transparent' : '#d1d5db transparent' }}>
                                <div className="flex items-center justify-between mb-5">
                                    <h2 className={`text-lg font-bold ${textMain} flex items-center gap-2`}>
                                        <FaPen className="text-purple-400" size={14} /> Tulis Kritik / Saran
                                    </h2>
                                    <button onClick={() => setShowForm(false)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}><FaTimes size={14} /></button>
                                </div>

                                <div className="space-y-4">
                                    {/* Jenis */}
                                    <div>
                                        <label className={`text-xs font-semibold ${textMuted} mb-1.5 block`}>Jenis *</label>
                                        <div className="flex gap-2">
                                            {(['kritik', 'saran'] as const).map(j => (
                                                <button key={j} onClick={() => setForm({ ...form, jenis: j })} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition ${form.jenis === j ? (j === 'kritik' ? 'bg-red-500/15 border-red-400/30 text-red-400' : 'bg-amber-500/15 border-amber-400/30 text-amber-400') : `${isDark ? 'border-white/10 text-gray-400 hover:bg-white/5' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}`}>
                                                    {j === 'kritik' ? '⚠️ Kritik' : '💡 Saran'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Name + House */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className={`text-xs font-semibold ${textMuted} mb-1.5 block`}>Nama *</label>
                                            <input value={form.pengirim} onChange={e => setForm({ ...form, pengirim: e.target.value })} placeholder="Nama Anda" className={inputCls} />
                                        </div>
                                        <div>
                                            <label className={`text-xs font-semibold ${textMuted} mb-1.5 block`}>No. Rumah</label>
                                            <input value={form.houseNo} onChange={e => setForm({ ...form, houseNo: e.target.value })} placeholder="No.14" className={inputCls} />
                                        </div>
                                    </div>

                                    {/* Block + Gang */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className={`text-xs font-semibold ${textMuted} mb-1.5 block`}>Blok</label>
                                            <select value={form.block} onChange={e => setForm({ ...form, block: e.target.value })} className={inputCls}>
                                                {['Blok A', 'Blok B', 'Blok C', 'Blok D', 'Blok E'].map(b => <option key={b} value={b} className={optionCls}>{b}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={`text-xs font-semibold ${textMuted} mb-1.5 block`}>Gang</label>
                                            <select value={form.gang} onChange={e => setForm({ ...form, gang: e.target.value })} className={inputCls}>
                                                {['Gang 1', 'Gang 2', 'Gang 3'].map(g => <option key={g} value={g} className={optionCls}>{g}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Kategori */}
                                    <div>
                                        <label className={`text-xs font-semibold ${textMuted} mb-1.5 block`}>Kategori *</label>
                                        <select value={form.kategori} onChange={e => setForm({ ...form, kategori: e.target.value })} className={inputCls}>
                                            {kategoriList.map(k => <option key={k.id} value={k.id} className={optionCls}>{k.label}</option>)}
                                        </select>
                                        {(() => { const kat = getKategori(form.kategori); return kat ? <p className={`text-[10px] mt-1 ${textSub}`}>{kat.description}</p> : null; })()}
                                    </div>

                                    {/* Prioritas */}
                                    <div>
                                        <label className={`text-xs font-semibold ${textMuted} mb-1.5 block`}>Prioritas</label>
                                        <div className="flex gap-2">
                                            {(['rendah', 'sedang', 'tinggi'] as const).map(p => {
                                                const ps = getPrioritasStyle(p);
                                                return (
                                                    <button key={p} onClick={() => setForm({ ...form, prioritas: p })} className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition ${form.prioritas === p ? `${ps.bg} ${ps.text} border-current/30` : `${isDark ? 'border-white/10 text-gray-400 hover:bg-white/5' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}`}>
                                                        {ps.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Judul */}
                                    <div>
                                        <label className={`text-xs font-semibold ${textMuted} mb-1.5 block`}>Judul *</label>
                                        <input value={form.judul} onChange={e => setForm({ ...form, judul: e.target.value })} placeholder="Judul singkat masukan Anda" className={inputCls} />
                                    </div>

                                    {/* Isi */}
                                    <div>
                                        <label className={`text-xs font-semibold ${textMuted} mb-1.5 block`}>Isi Masukan *</label>
                                        <textarea value={form.isi} onChange={e => setForm({ ...form, isi: e.target.value })} placeholder="Jelaskan kritik atau saran Anda secara detail..." rows={4} className={`${inputCls} resize-none`} />
                                    </div>

                                    {/* Submit */}
                                    <div className="flex gap-3 pt-2">
                                        <button onClick={() => setShowForm(false)} className={`flex-1 py-2.5 rounded-xl text-sm font-medium border ${isDark ? 'border-white/10 text-gray-400 hover:bg-white/5' : 'border-gray-200 text-gray-500 hover:bg-gray-50'} transition`}>
                                            Batal
                                        </button>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleSubmit}
                                            disabled={!form.pengirim || !form.judul || !form.isi}
                                            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition ${(!form.pengirim || !form.judul || !form.isi) ? 'bg-gray-500/20 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/20'}`}
                                        >
                                            <FaPaperPlane size={11} /> Kirim
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}
