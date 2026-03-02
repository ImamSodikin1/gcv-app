import { motion, AnimatePresence } from 'framer-motion';
import {
    FaArrowLeft, FaPhone, FaEnvelope, FaHome,
    FaCrown, FaShieldAlt, FaMapMarkerAlt, FaStar, FaIdBadge,
    FaChevronDown, FaClipboardList
} from 'react-icons/fa';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';

// ── Types ──────────────────────────────────────────────────────────────
type Pengurus = {
    id: string;
    name: string;
    jabatan: string;
    houseNo: string;
    block: string;
    gang: string;
    phone: string;
    email: string;
    foto?: string;
    periode: string;
    tugas: string[];
};

type JajaranLevel = {
    level: number;
    title: string;
    description: string;
    gradient: string;
    borderColor: string;
    iconBg: string;
    icon: React.ReactNode;
    members: Pengurus[];
};

// ── Data Kepengurusan ──────────────────────────────────────────────────
const strukturKepengurusan: JajaranLevel[] = [
    {
        level: 1,
        title: 'Ketua RT',
        description: 'Pimpinan tertinggi pengurus RT perumahan',
        gradient: 'from-amber-400/20 to-yellow-500/20',
        borderColor: 'border-amber-400/30',
        iconBg: 'from-amber-400 to-yellow-500',
        icon: <FaCrown size={20} />,
        members: [
            {
                id: 'k1', name: 'Muhadi', jabatan: 'Ketua RT 05/RW 03',
                houseNo: 'No.14', block: 'Blok A', gang: 'Gang 1',
                phone: '0812-3456-7890', email: 'muhadi@email.com',
                periode: '2025 - 2028',
                tugas: [
                    'Memimpin rapat warga dan pengurus',
                    'Mengkoordinasikan seluruh kegiatan RT',
                    'Mewakili warga dalam musyawarah RW',
                    'Menandatangani surat-surat resmi RT',
                    'Bertanggung jawab atas keamanan lingkungan',
                ],
            },
        ],
    },
    {
        level: 2,
        title: 'Sekretaris',
        description: 'Administrasi dan dokumentasi kegiatan RT',
        gradient: 'from-blue-400/20 to-cyan-500/20',
        borderColor: 'border-blue-400/30',
        iconBg: 'from-blue-400 to-cyan-500',
        icon: <FaClipboardList size={20} />,
        members: [
            {
                id: 'k2', name: 'Abidin, S.M.', jabatan: 'Sekretaris RT',
                houseNo: 'No.4', block: 'Blok B', gang: 'Gang 1',
                phone: '0813-4567-8901', email: 'abidin.sm@email.com',
                periode: '2025 - 2028',
                tugas: [
                    'Mengelola administrasi dan surat-menyurat',
                    'Membuat notulen rapat warga',
                    'Mengelola data warga dan KK',
                    'Menyusun laporan kegiatan RT',
                    'Mengarsipkan dokumen penting RT',
                ],
            },
        ],
    },
    {
        level: 3,
        title: 'Bendahara',
        description: 'Pengelolaan keuangan dan iuran warga',
        gradient: 'from-emerald-400/20 to-green-500/20',
        borderColor: 'border-emerald-400/30',
        iconBg: 'from-emerald-400 to-green-500',
        icon: <FaIdBadge size={20} />,
        members: [
            {
                id: 'k3', name: 'Dewi Sartika, S.Ak.', jabatan: 'Bendahara RT',
                houseNo: 'No.7', block: 'Blok D', gang: 'Gang 1',
                phone: '0814-5678-9012', email: 'dewi.sartika@email.com',
                periode: '2025 - 2028',
                tugas: [
                    'Mengelola keuangan dan kas RT',
                    'Mencatat pemasukan dan pengeluaran',
                    'Menagih iuran bulanan warga',
                    'Membuat laporan keuangan bulanan',
                    'Menyimpan bukti transaksi keuangan',
                ],
            },
        ],
    },
    {
        level: 4,
        title: 'Keamanan',
        description: 'Koordinasi keamanan dan ketertiban lingkungan',
        gradient: 'from-red-400/20 to-rose-500/20',
        borderColor: 'border-red-400/30',
        iconBg: 'from-red-400 to-rose-500',
        icon: <FaShieldAlt size={20} />,
        members: [
            {
                id: 'k4', name: 'Ahmad Wijaya', jabatan: 'Kepala Keamanan',
                houseNo: 'No.11', block: 'Blok C', gang: 'Gang 2',
                phone: '0815-6789-0123', email: 'ahmad.wijaya@email.com',
                periode: '2025 - 2028',
                tugas: [
                    'Mengkoordinasikan jadwal ronda malam',
                    'Mengelola sistem keamanan lingkungan',
                    'Menangani laporan kejadian keamanan',
                    'Berkoordinasi dengan kepolisian setempat',
                    'Memastikan CCTV dan penerangan berfungsi',
                ],
            },
            {
                id: 'k5', name: 'Gunawan Saputra', jabatan: 'Wakil Keamanan',
                houseNo: 'No.22', block: 'Blok D', gang: 'Gang 2',
                phone: '0816-7890-1234', email: 'gunawan.s@email.com',
                periode: '2025 - 2028',
                tugas: [
                    'Membantu koordinasi jadwal ronda',
                    'Menggantikan Kepala Keamanan saat berhalangan',
                    'Mengawasi pos keamanan',
                    'Mencatat keluar masuk tamu di lingkungan',
                ],
            },
        ],
    },
    {
        level: 5,
        title: 'Koordinator Lapangan',
        description: 'Koordinasi kegiatan lapangan per gang',
        gradient: 'from-purple-400/20 to-violet-500/20',
        borderColor: 'border-purple-400/30',
        iconBg: 'from-purple-400 to-violet-500',
        icon: <FaMapMarkerAlt size={20} />,
        members: [
            {
                id: 'k6', name: 'Midi', jabatan: 'Koordinator Gang 1',
                houseNo: 'No.35', block: 'Blok A', gang: 'Gang 1',
                phone: '0817-8901-2345', email: 'midi@email.com',
                periode: '2025 - 2028',
                tugas: [
                    'Mengkoordinasikan kegiatan di Gang 1',
                    'Menyampaikan informasi dari pengurus ke warga',
                    'Mengumpulkan aspirasi warga Gang 1',
                    'Membantu sensus dan pendataan warga',
                ],
            },
            {
                id: 'k7', name: 'Siti Nurhaliza', jabatan: 'Koordinator Gang 2',
                houseNo: 'No.2', block: 'Blok B', gang: 'Gang 2',
                phone: '0818-9012-3456', email: 'siti.nurhaliza@email.com',
                periode: '2025 - 2028',
                tugas: [
                    'Mengkoordinasikan kegiatan di Gang 2',
                    'Menyampaikan informasi dari pengurus ke warga',
                    'Mengumpulkan aspirasi warga Gang 2',
                    'Membantu sensus dan pendataan warga',
                ],
            },
            {
                id: 'k8', name: 'Irfan Ramadhan', jabatan: 'Koordinator Gang 3',
                houseNo: 'No.33', block: 'Blok D', gang: 'Gang 3',
                phone: '0819-0123-4567', email: 'irfan.r@email.com',
                periode: '2025 - 2028',
                tugas: [
                    'Mengkoordinasikan kegiatan di Gang 3',
                    'Menyampaikan informasi dari pengurus ke warga',
                    'Mengumpulkan aspirasi warga Gang 3',
                    'Membantu sensus dan pendataan warga',
                ],
            },
        ],
    },
];

// ── Component ──────────────────────────────────────────────────────────
export default function Kepengurusan() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [expandedMember, setExpandedMember] = useState<string | null>(null);

    const cardClass = isDark
        ? 'bg-gradient-to-br from-[#181926]/80 via-[#231b2e]/80 to-[#2d1e3a]/80 border-white/10'
        : 'bg-white border-gray-200 shadow-sm';
    const textMain = isDark ? 'text-white' : 'text-gray-900';
    const textSub = isDark ? 'text-gray-400' : 'text-gray-500';
    const textMuted = isDark ? 'text-gray-300' : 'text-gray-600';
    const lineColor = isDark ? 'bg-gray-600' : 'bg-gray-300';

    return (
        <>
            <Head><title>Struktur Kepengurusan - Sistem Perumahan</title></Head>
            <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-[#0f0c1a] via-[#1a1625] to-[#0f0c1a]' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'} p-4 md:p-6 transition-colors duration-300`}>

                {/* Header */}
                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-wrap items-center justify-between gap-3 mb-6">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard" className={`p-2 rounded-xl border ${isDark ? 'border-white/10 bg-white/5 hover:bg-white/10 text-white' : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'} transition`}>
                            <FaArrowLeft size={14} />
                        </Link>
                        <div>
                            <h1 className={`text-2xl md:text-3xl font-bold tracking-tight ${textMain}`}>
                                Struktur Kepengurusan
                            </h1>
                            <p className={`text-xs mt-0.5 ${textMuted}`}>Hierarki dan susunan pengurus RT Perumahan</p>
                        </div>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm border ${isDark ? 'border-amber-400/20 bg-amber-400/10 text-amber-300' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
                        <FaStar size={12} /> Periode 2025 - 2028
                    </div>
                </motion.div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                    {strukturKepengurusan.map((level, i) => (
                        <motion.div key={level.level} initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 + i * 0.05 }} whileHover={{ y: -2, scale: 1.02 }} className={`bg-gradient-to-br ${level.gradient} border ${level.borderColor} rounded-xl p-3.5 backdrop-blur-md cursor-pointer`}>
                            <div className="flex items-center gap-2 mb-1.5">
                                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${level.iconBg} flex items-center justify-center text-white`}>
                                    {level.icon}
                                </div>
                                <span className={`text-[11px] font-semibold ${textMuted}`}>{level.title}</span>
                            </div>
                            <p className={`text-2xl font-bold ${textMain}`}>{level.members.length}</p>
                            <p className={`text-[10px] ${textSub}`}>Anggota</p>
                        </motion.div>
                    ))}
                </div>

                {/* Bagan Struktur Organisasi */}
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }} className={`border rounded-xl p-5 md:p-7 backdrop-blur-md mb-6 ${cardClass} overflow-x-auto`}>
                    <h2 className={`text-lg md:text-xl font-bold ${textMain} mb-1`}>Bagan Struktur Organisasi</h2>
                    <p className={`text-xs ${textSub} mb-6`}>Visualisasi hierarki kepengurusan RT</p>

                    <div className="min-w-[700px] flex flex-col items-center pb-4">

                        {/* ═══ Level 1: Ketua RT ═══ */}
                        <motion.div whileHover={{ scale: 1.04 }} className="px-6 py-3.5 rounded-xl border-2 border-amber-400/50 bg-gradient-to-br from-amber-400/15 to-yellow-500/15 text-center shadow-lg">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-white font-bold text-sm mx-auto mb-1.5 shadow">
                                {strukturKepengurusan[0].members[0].name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                            </div>
                            <p className={`text-sm font-bold ${textMain}`}>{strukturKepengurusan[0].members[0].name}</p>
                            <p className={`text-[10px] ${textSub}`}>{strukturKepengurusan[0].title}</p>
                        </motion.div>

                        {/* Vertical line down */}
                        <div className={`w-0.5 h-8 ${lineColor}`} />

                        {/* ═══ Level 2: Sekretaris + Bendahara ═══ */}
                        <div className="flex justify-center">
                            {[
                                { m: strukturKepengurusan[1].members[0], label: strukturKepengurusan[1].title, border: 'border-blue-400/40', bg: 'from-blue-400/15 to-cyan-500/15', avatar: 'from-blue-400 to-cyan-500' },
                                { m: strukturKepengurusan[2].members[0], label: strukturKepengurusan[2].title, border: 'border-emerald-400/40', bg: 'from-emerald-400/15 to-green-500/15', avatar: 'from-emerald-400 to-green-500' },
                            ].map((item, i, arr) => (
                                <div key={item.m.id} className="flex flex-col items-center relative" style={{ minWidth: 170 }}>
                                    {/* Left half of horizontal connector */}
                                    {i > 0 && <div className={`absolute top-0 left-0 right-1/2 h-0.5 ${lineColor}`} />}
                                    {/* Right half of horizontal connector */}
                                    {i < arr.length - 1 && <div className={`absolute top-0 left-1/2 right-0 h-0.5 ${lineColor}`} />}
                                    {/* Vertical stub down to box */}
                                    <div className={`w-0.5 h-5 ${lineColor}`} />
                                    <motion.div whileHover={{ scale: 1.04 }} className={`px-5 py-2.5 rounded-xl border-2 ${item.border} bg-gradient-to-br ${item.bg} text-center shadow`}>
                                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${item.avatar} flex items-center justify-center text-white font-bold text-xs mx-auto mb-1`}>
                                            {item.m.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                        </div>
                                        <p className={`text-xs font-bold ${textMain}`}>{item.m.name}</p>
                                        <p className={`text-[10px] ${textSub}`}>{item.label}</p>
                                    </motion.div>
                                </div>
                            ))}
                        </div>

                        {/* Vertical line down */}
                        <div className={`w-0.5 h-8 ${lineColor}`} />

                        {/* ═══ Level 3: Keamanan ═══ */}
                        <div className="flex justify-center">
                            {strukturKepengurusan[3].members.map((m, i, arr) => (
                                <div key={m.id} className="flex flex-col items-center relative" style={{ minWidth: 170 }}>
                                    {i > 0 && <div className={`absolute top-0 left-0 right-1/2 h-0.5 ${lineColor}`} />}
                                    {i < arr.length - 1 && <div className={`absolute top-0 left-1/2 right-0 h-0.5 ${lineColor}`} />}
                                    <div className={`w-0.5 h-5 ${lineColor}`} />
                                    <motion.div whileHover={{ scale: 1.04 }} className="px-5 py-2.5 rounded-xl border-2 border-red-400/40 bg-gradient-to-br from-red-400/15 to-orange-500/15 text-center shadow">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center text-white font-bold text-xs mx-auto mb-1">
                                            {m.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                        </div>
                                        <p className={`text-xs font-bold ${textMain}`}>{m.name}</p>
                                        <p className={`text-[10px] ${textSub}`}>{m.jabatan}</p>
                                    </motion.div>
                                </div>
                            ))}
                        </div>

                        {/* Vertical line down */}
                        <div className={`w-0.5 h-8 ${lineColor}`} />

                        {/* ═══ Level 4: Koordinator Lapangan ═══ */}
                        <div className="flex justify-center">
                            {strukturKepengurusan[4].members.map((m, i, arr) => (
                                <div key={m.id} className="flex flex-col items-center relative" style={{ minWidth: 155 }}>
                                    {i > 0 && <div className={`absolute top-0 left-0 right-1/2 h-0.5 ${lineColor}`} />}
                                    {i < arr.length - 1 && <div className={`absolute top-0 left-1/2 right-0 h-0.5 ${lineColor}`} />}
                                    <div className={`w-0.5 h-5 ${lineColor}`} />
                                    <motion.div whileHover={{ scale: 1.04 }} className="px-4 py-2.5 rounded-xl border-2 border-purple-400/40 bg-gradient-to-br from-purple-400/15 to-fuchsia-500/15 text-center shadow">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-fuchsia-500 flex items-center justify-center text-white font-bold text-xs mx-auto mb-1">
                                            {m.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                        </div>
                                        <p className={`text-xs font-bold ${textMain}`}>{m.name}</p>
                                        <p className={`text-[10px] ${textSub}`}>{m.jabatan}</p>
                                    </motion.div>
                                </div>
                            ))}
                        </div>

                    </div>
                </motion.div>

                {/* Hierarchy Tree */}
                <div className="relative">
                    {/* Vertical line connecting levels */}
                    <div className={`absolute left-6 md:left-8 top-0 bottom-0 w-0.5 ${isDark ? 'bg-gradient-to-b from-amber-400/30 via-purple-400/20 to-transparent' : 'bg-gradient-to-b from-amber-300/60 via-purple-300/30 to-transparent'}`} />

                    <div className="space-y-5">
                        {strukturKepengurusan.map((level, levelIdx) => (
                            <motion.div key={level.level} initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 + levelIdx * 0.1 }}>
                                {/* Level Header */}
                                <div className="flex items-center gap-4 mb-3 relative">
                                    <motion.div
                                        whileHover={{ scale: 1.15 }}
                                        className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br ${level.iconBg} flex items-center justify-center text-white shadow-lg z-10 flex-shrink-0`}
                                    >
                                        {level.icon}
                                    </motion.div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className={`text-lg md:text-xl font-bold ${textMain}`}>{level.title}</h2>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${isDark ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                                Level {level.level}
                                            </span>
                                        </div>
                                        <p className={`text-xs ${textSub}`}>{level.description}</p>
                                    </div>
                                </div>

                                {/* Members */}
                                <div className={`ml-6 md:ml-8 pl-6 md:pl-8 border-l-2 ${level.borderColor} space-y-3`}>
                                    {level.members.map((member, mIdx) => {
                                        const isExpanded = expandedMember === member.id;
                                        return (
                                            <motion.div
                                                key={member.id}
                                                initial={{ y: 10, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ delay: 0.15 + levelIdx * 0.1 + mIdx * 0.05 }}
                                                whileHover={{ x: 4 }}
                                                className={`border rounded-xl backdrop-blur-md overflow-hidden ${cardClass} relative group`}
                                            >
                                                <div className={`absolute inset-0 bg-gradient-to-r ${level.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                                                <div className="relative z-10">
                                                    {/* Member Header */}
                                                    <button
                                                        onClick={() => setExpandedMember(isExpanded ? null : member.id)}
                                                        className="w-full p-4 flex items-center justify-between text-left"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {/* Avatar */}
                                                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${level.iconBg} flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0`}>
                                                                {member.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                                            </div>
                                                            <div>
                                                                <h3 className={`text-sm md:text-base font-bold ${textMain}`}>{member.name}</h3>
                                                                <p className={`text-xs ${textSub}`}>{member.jabatan}</p>
                                                                <div className="flex items-center gap-3 mt-1 flex-wrap">
                                                                    <span className={`text-[10px] flex items-center gap-1 ${textMuted}`}><FaHome size={8} /> {member.houseNo}, {member.block}</span>
                                                                    <span className={`text-[10px] flex items-center gap-1 ${textMuted}`}><FaMapMarkerAlt size={8} /> {member.gang}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.3 }} className={textSub}>
                                                            <FaChevronDown size={12} />
                                                        </motion.div>
                                                    </button>

                                                    {/* Expanded Details */}
                                                    <AnimatePresence>
                                                        {isExpanded && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                transition={{ duration: 0.3 }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className={`px-4 pb-4 border-t ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                                                                    {/* Contact Info */}
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 mb-4">
                                                                        <div className={`flex items-center gap-2.5 p-2.5 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                                                                            <FaPhone className="text-emerald-400 flex-shrink-0" size={12} />
                                                                            <div>
                                                                                <p className={`text-[10px] ${textSub}`}>Telepon</p>
                                                                                <p className={`text-xs font-medium ${textMain}`}>{member.phone}</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className={`flex items-center gap-2.5 p-2.5 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                                                                            <FaEnvelope className="text-blue-400 flex-shrink-0" size={12} />
                                                                            <div>
                                                                                <p className={`text-[10px] ${textSub}`}>Email</p>
                                                                                <p className={`text-xs font-medium ${textMain} truncate`}>{member.email}</p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    {/* Tugas */}
                                                                    <div>
                                                                        <p className={`text-[10px] uppercase tracking-wider font-semibold mb-2 ${textMuted}`}>Tugas & Tanggung Jawab</p>
                                                                        <div className="space-y-1.5">
                                                                            {member.tugas.map((t, ti) => (
                                                                                <motion.div
                                                                                    key={ti}
                                                                                    initial={{ x: -10, opacity: 0 }}
                                                                                    animate={{ x: 0, opacity: 1 }}
                                                                                    transition={{ delay: ti * 0.05 }}
                                                                                    className={`flex items-start gap-2 text-xs ${textSub}`}
                                                                                >
                                                                                    <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${level.iconBg} mt-1.5 flex-shrink-0`} />
                                                                                    {t}
                                                                                </motion.div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                    {/* Periode */}
                                                                    <div className={`mt-3 flex items-center gap-2 text-[10px] ${textMuted}`}>
                                                                        <FaStar size={9} className="text-amber-400" />
                                                                        Masa Jabatan: <span className={`font-semibold ${textMain}`}>{member.periode}</span>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Footer Author */}
                <div className={`mt-8 text-center text-xs ${textMuted}`}>
                    <p>Dibuat oleh <span className={`font-semibold ${textMain}`}>Imam Sodikin</span></p>
                </div>
            </div>
        </>
    );
}
